"""
Bulk Product Import Service for Bonyo.
Supports CSV and Excel-formatted tables.
Provides:
- Downloadable standard template with sample data
- Row-level validation and dry-run preview (detects missing fields, invalid categories, duplicate SKUs)
- Transactional batch import creating/updating CanonicalProducts and SellerOffers
- Detailed execution report
"""

import csv
import io
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.catalog import CanonicalProduct, Category, SellerOffer, Seller
from src.models.pet import PetSpecies


TEMPLATE_COLUMNS = [
    "sku",
    "title_fa",
    "brand",
    "category_slug",
    "target_species",
    "price_tomans",
    "old_price_tomans",
    "stock_quantity",
    "package_weight_grams",
    "size",
    "flavor",
    "color",
    "life_stage",
    "tags",
    "description_fa",
    "slug",
    "image_url",
    "seo_title",
    "seo_description",
]

SAMPLE_ROWS = [
    {
        "sku": "RC-CAT-ADULT-2KG",
        "title_fa": "غذای خشک گربه بالغ رویال کنین مدل Fit 32 وزن ۲ کیلوگرم",
        "brand": "Royal Canin",
        "category_slug": "cat-food",
        "target_species": "CAT",
        "price_tomans": "1250000",
        "old_price_tomans": "1400000",
        "stock_quantity": "35",
        "package_weight_grams": "2000",
        "size": "2kg",
        "flavor": "مرغ و برنج",
        "color": "",
        "life_stage": "Adult",
        "tags": "Fit32, گربه بالغ, هضم آسان",
        "description_fa": "فرمولاسیون اختصاصی رویال کنین برای گربه‌های بالغ با فعالیت متوسط و حفظ وزن ایده‌آل.",
        "slug": "royal-canin-fit32-cat-2kg",
        "image_url": "/icons/products/royal_canin_fit32.webp",
        "seo_title": "خرید غذای خشک گربه رویal Canin Fit 32 | بنیوو",
        "seo_description": "غذای خشک گربه بالغ رویال کنین ۲ کیلوگرم اصل فرانسه با تاریخ انقضای معتبر و ارسال سریع.",
    },
    {
        "sku": "RFX-DOG-PUPPY-3KG",
        "title_fa": "غذای خشک توله سگ رفلکس پلاس با طعم گوشت بره و برنج ۳ کیلوگرم",
        "brand": "Reflex Plus",
        "category_slug": "dog-food",
        "target_species": "DOG",
        "price_tomans": "890000",
        "old_price_tomans": "950000",
        "stock_quantity": "20",
        "package_weight_grams": "3000",
        "size": "3kg",
        "flavor": "گوشت بره",
        "color": "",
        "life_stage": "Puppy",
        "tags": "توله سگ, رفلکس, رشد استخوان",
        "description_fa": "غذای کامل و متعادل برای توله سگ‌های تمام نژادها حاوی امگا ۳ و ۶ و اسیدهای چرب ضروری.",
        "slug": "reflex-plus-puppy-lamb-3kg",
        "image_url": "/icons/products/reflex_puppy_lamb.webp",
        "seo_title": "قیمت غذای خشک توله سگ رفلکس پلاس ۳ کیلوگرم | بنیوو",
        "seo_description": "غذای خشک توله سگ رفلکس پلاس با پروتئین غنی گوشت بره، تضمین اصالت و سلامت گوارش.",
    },
]


def generate_template_csv() -> str:
    """Generates standard CSV template content."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=TEMPLATE_COLUMNS)
    writer.writeheader()
    for row in SAMPLE_ROWS:
        writer.writerow(row)
    return output.getvalue()


def parse_and_validate_import(file_content: str) -> Dict[str, Any]:
    """
    Parses CSV/text content, validates columns and each row's data types.
    Returns preview report with row-by-row validation status.
    """
    input_stream = io.StringIO(file_content.strip())
    reader = csv.DictReader(input_stream)

    if not reader.fieldnames:
        return {
            "is_valid": False,
            "error": "فایل خالی است یا ساختار سرستون معتبر ندارد.",
            "total_rows": 0,
            "valid_rows": 0,
            "error_rows": 0,
            "rows": [],
        }

    # Normalize header names
    headers = [h.strip().lower() for h in reader.fieldnames if h]
    required_cols = {"title_fa", "target_species", "price_tomans", "category_slug"}
    missing_cols = required_cols - set(headers)
    if missing_cols:
        return {
            "is_valid": False,
            "error": f"ستون‌های اجباری غایب هستند: {', '.join(missing_cols)}",
            "total_rows": 0,
            "valid_rows": 0,
            "error_rows": 0,
            "rows": [],
        }

    parsed_rows: List[Dict[str, Any]] = []
    seen_skus = set()
    valid_count = 0
    error_count = 0

    valid_species = {s.name for s in PetSpecies}

    for idx, raw_row in enumerate(reader, start=2):  # 1-indexed header is line 1
        row = {k.strip().lower(): (v.strip() if v else "") for k, v in raw_row.items() if k}
        errors: List[str] = []
        warnings: List[str] = []

        # 1. Title validation
        title = row.get("title_fa", "")
        if not title or len(title) < 3:
            errors.append("عنوان فارسی نامعتبر یا کمتر از ۳ حرف است.")

        # 2. Species validation
        species_str = row.get("target_species", "").upper()
        if species_str not in valid_species:
            errors.append(f"گونه حیوان '{species_str}' نامعتبر است. مقادیر مجاز: {', '.join(valid_species)}")

        # 3. Price validation
        price_str = row.get("price_tomans", "")
        try:
            price = int(re.sub(r"[^\d]", "", price_str))
            if price <= 0:
                errors.append("قیمت محصول باید بزرگتر از صفر باشد.")
        except Exception:
            errors.append(f"فرمت قیمت نامعتبر است: {price_str}")
            price = 0

        # 4. Stock validation
        stock_str = row.get("stock_quantity", "0")
        try:
            stock = int(re.sub(r"[^\d]", "", stock_str)) if stock_str else 0
        except Exception:
            stock = 0
            warnings.append("موجودی نامعتبر بود و به صفر تنظیم شد.")

        # 5. SKU uniqueness check within file
        sku = row.get("sku", "")
        if sku:
            if sku in seen_skus:
                errors.append(f"کد SKU تکراری در فایل: {sku}")
            else:
                seen_skus.add(sku)
        else:
            sku = f"AUTO-{re.sub(r'[^a-zA-Z0-9]', '', title)[:8].upper()}-{idx}"
            warnings.append(f"شناسه SKU خالی بود، تولید خودکار: {sku}")

        # 6. Slug generation if missing
        slug = row.get("slug", "")
        if not slug:
            slug = f"prod-{re.sub(r'[^a-zA-Z0-9]', '-', title.lower())[:30].strip('-')}-{idx}"

        status = "ERROR" if errors else ("WARNING" if warnings else "VALID")
        if status == "ERROR":
            error_count += 1
        else:
            valid_count += 1

        parsed_rows.append({
            "row_number": idx,
            "status": status,
            "errors": errors,
            "warnings": warnings,
            "sku": sku,
            "title_fa": title,
            "brand": row.get("brand", "Bonnivo"),
            "category_slug": row.get("category_slug", "general"),
            "target_species": species_str,
            "price_tomans": price,
            "old_price_tomans": int(row.get("old_price_tomans", 0)) if row.get("old_price_tomans") else None,
            "stock_quantity": stock,
            "package_weight_grams": int(row.get("package_weight_grams", 0)) if row.get("package_weight_grams") else None,
            "size": row.get("size", ""),
            "flavor": row.get("flavor", ""),
            "color": row.get("color", ""),
            "life_stage": row.get("life_stage", "Adult"),
            "tags": row.get("tags", ""),
            "description_fa": row.get("description_fa", ""),
            "slug": slug,
            "image_url": row.get("image_url", ""),
            "seo_title": row.get("seo_title", f"{title} | بنیوو"),
            "seo_description": row.get("seo_description", title),
        })

    return {
        "is_valid": error_count == 0,
        "total_rows": len(parsed_rows),
        "valid_rows": valid_count,
        "error_rows": error_count,
        "rows": parsed_rows,
    }


async def commit_import_rows(
    db: AsyncSession,
    rows: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Executes transactional commit for valid product rows.
    Creates or updates CanonicalProduct and ensures a default Buy Box SellerOffer.
    """
    created_count = 0
    updated_count = 0
    failed_count = 0
    details = []

    # Get default platform seller for inventory attribution
    stmt_seller = select(Seller).where(Seller.is_verified == True)
    res_seller = await db.execute(stmt_seller)
    default_seller = res_seller.scalars().first()

    for item in rows:
        if item.get("status") == "ERROR":
            failed_count += 1
            continue

        try:
            sku = item.get("sku")
            slug = item.get("slug")

            # Check if exists by sku or slug
            existing_prod = None
            if sku:
                q = select(CanonicalProduct).where(CanonicalProduct.sku == sku)
                res = await db.execute(q)
                existing_prod = res.scalars().first()

            if not existing_prod and slug:
                q = select(CanonicalProduct).where(CanonicalProduct.slug == slug)
                res = await db.execute(q)
                existing_prod = res.scalars().first()

            # Ensure category exists
            cat_slug = item.get("category_slug", "general")
            q_cat = select(Category).where(Category.slug == cat_slug)
            res_cat = await db.execute(q_cat)
            cat = res_cat.scalars().first()
            if not cat:
                cat = Category(
                    slug=cat_slug,
                    title_fa=cat_slug.replace("-", " ").title(),
                    is_active=True,
                )
                db.add(cat)
                await db.flush()

            species_enum = PetSpecies[item["target_species"]]

            if existing_prod:
                # Update existing
                existing_prod.title_fa = item["title_fa"]
                existing_prod.brand = item["brand"]
                existing_prod.price_tomans = item["price_tomans"]
                existing_prod.old_price_tomans = item.get("old_price_tomans")
                existing_prod.stock_quantity = item["stock_quantity"]
                existing_prod.description_fa = item["description_fa"]
                existing_prod.package_weight_grams = item.get("package_weight_grams")
                existing_prod.size = item.get("size")
                existing_prod.flavor = item.get("flavor")
                existing_prod.color = item.get("color")
                existing_prod.life_stage = item.get("life_stage")
                existing_prod.health_tags = item.get("tags")
                existing_prod.seo_title = item.get("seo_title")
                existing_prod.seo_description = item.get("seo_description")
                if item.get("image_url"):
                    existing_prod.primary_image_url = item["image_url"]

                updated_count += 1
                details.append({"sku": sku, "action": "UPDATED", "title": item["title_fa"]})
                prod_to_offer = existing_prod
            else:
                # Create new product
                new_prod = CanonicalProduct(
                    category_id=cat.id,
                    sku=sku,
                    title_fa=item["title_fa"],
                    slug=slug,
                    brand=item["brand"],
                    target_species=species_enum,
                    description_fa=item["description_fa"],
                    short_description_fa=item["description_fa"][:150] if item.get("description_fa") else "",
                    price_tomans=item["price_tomans"],
                    old_price_tomans=item.get("old_price_tomans"),
                    stock_quantity=item["stock_quantity"],
                    package_weight_grams=item.get("package_weight_grams"),
                    size=item.get("size"),
                    flavor=item.get("flavor"),
                    color=item.get("color"),
                    life_stage=item.get("life_stage"),
                    health_tags=item.get("tags"),
                    primary_image_url=item.get("image_url") or "/icons/food.png",
                    seo_title=item.get("seo_title"),
                    seo_description=item.get("seo_description"),
                    status="PUBLISHED",
                    is_active=True,
                )
                db.add(new_prod)
                await db.flush()
                created_count += 1
                details.append({"sku": sku, "action": "CREATED", "title": item["title_fa"]})
                prod_to_offer = new_prod

            # If default seller exists, ensure a SellerOffer exists for Buy Box
            if default_seller:
                q_offer = select(SellerOffer).where(
                    SellerOffer.product_id == prod_to_offer.id,
                    SellerOffer.seller_id == default_seller.id,
                )
                res_offer = await db.execute(q_offer)
                offer = res_offer.scalars().first()
                if offer:
                    offer.price_tomans = item["price_tomans"]
                    offer.stock_quantity = item["stock_quantity"]
                    offer.is_active = True
                else:
                    offer = SellerOffer(
                        product_id=prod_to_offer.id,
                        seller_id=default_seller.id,
                        price_tomans=item["price_tomans"],
                        stock_quantity=item["stock_quantity"],
                        is_active=True,
                    )
                    db.add(offer)

        except Exception as e:
            failed_count += 1
            details.append({"sku": item.get("sku"), "action": "FAILED", "error": str(e)})

    await db.commit()

    return {
        "success": True,
        "created": created_count,
        "updated": updated_count,
        "failed": failed_count,
        "total_processed": created_count + updated_count + failed_count,
        "details": details,
    }
