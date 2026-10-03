import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User, UserRole
from src.models.catalog import Seller, CanonicalProduct, Category, SellerOffer, ProductImage, ProductReview, ProductVariant
from src.models.order import Order, OrderStatus
from src.models.pet import PetSpecies
from src.services.image_pipeline import validate_and_process_image, ImageSecurityError
from src.services.excel_import import generate_template_csv, parse_and_validate_import, commit_import_rows
from src.services.groq_service import generate_product_content

from fastapi import Request
from src.core.admin_security import hash_token, SESSION_COOKIE_NAME
from src.models.admin import AdminUser, AdminSession
from datetime import datetime, timezone

router = APIRouter(prefix="/admin", tags=["Admin Moderation & Operations"])


from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_scheme = HTTPBearer(auto_error=False)


async def require_admin(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> Any:
    # 1. Check for dedicated Admin Session cookie
    raw_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not raw_token and credentials:
        raw_token = credentials.credentials

    if raw_token:
        token_hash = hash_token(raw_token)
        stmt = (
            select(AdminSession)
            .where(
                AdminSession.session_token_hash == token_hash,
                AdminSession.expires_at > datetime.now(timezone.utc),
            )
        )
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        if session:
            admin = await db.get(AdminUser, session.admin_id)
            if admin and admin.is_active:
                return admin

    # 2. Check JWT bearer token with UserRole.ADMIN
    if credentials:
        try:
            user = await get_current_user(credentials=credentials, db=db)
            if user and user.role == UserRole.ADMIN:
                return user
        except Exception:
            pass

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="دسترسی به این بخش نیازمند مجوز مدیریت سیستم است.",
    )


class SellerApplicationItem(BaseModel):
    id: str
    user_id: str
    store_name_fa: str
    national_id: str
    sheba_number: str
    phone_number: str
    city: str
    address: str
    status: str
    created_at: str


class AdminSellerActionPayload(BaseModel):
    action: str = Field(description="APPROVE or REJECT")
    reason: Optional[str] = None


class DisputeResolutionPayload(BaseModel):
    resolution: str = Field(description="REFUND_BUYER or REJECT_CLAIM")
    refund_amount_tomans: Optional[int] = None
    admin_notes: Optional[str] = None


@router.get("/sellers/pending", response_model=List[SellerApplicationItem])
async def list_pending_sellers(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    q = select(Seller).where(Seller.status == "UNDER_REVIEW")
    res = await db.execute(q)
    sellers = res.scalars().all()

    return [
        SellerApplicationItem(
            id=s.id,
            user_id=s.user_id,
            store_name_fa=s.store_name_fa,
            national_id=s.national_id,
            sheba_number=s.sheba_number,
            phone_number=s.phone_number,
            city=s.city,
            address=s.address,
            status=s.status,
            created_at=s.created_at.isoformat() if s.created_at else "",
        )
        for s in sellers
    ]


@router.post("/sellers/{seller_id}/action")
async def review_seller_application(
    seller_id: str,
    payload: AdminSellerActionPayload,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    seller = await db.get(Seller, seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="فروشنده یافت نشد.")

    action = payload.action.upper()
    if action == "APPROVE":
        seller.status = "APPROVED"
        seller.is_verified = True
        seller_user = await db.get(User, seller.user_id)
        if seller_user and seller_user.role != UserRole.ADMIN:
            seller_user.role = UserRole.SELLER
    elif action == "REJECT":
        seller.status = "REJECTED"
        seller.is_verified = False
    else:
        raise HTTPException(status_code=400, detail="عملیات نامعتبر است.")

    await db.commit()
    return {"status": "success", "seller_id": seller.id, "new_status": seller.status}


@router.get("/disputes")
async def list_customer_disputes(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # In Phase 1, customer return claims within 4 hours
    q = select(Order).where(Order.status.in_([OrderStatus.PAID, OrderStatus.DELIVERED]))
    res = await db.execute(q)
    orders = res.scalars().all()

    return [
        {
            "order_id": o.id,
            "user_id": o.user_id,
            "total_amount_tomans": o.total_amount_tomans,
            "status": o.status.value,
            "return_eligible": True,
            "claim_type": "4_HOUR_RETURN_GUARANTEE",
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in orders
    ]


@router.post("/disputes/{order_id}/resolve")
async def resolve_order_dispute(
    order_id: str,
    payload: DisputeResolutionPayload,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="سفارش یافت نشد.")

    if payload.resolution == "REFUND_BUYER":
        order.status = OrderStatus.CANCELLED
        refund_amount = payload.refund_amount_tomans or order.total_amount_tomans
        message = f"مبلغ {refund_amount:,} تومان به کیف پول خریدار واریز شد."
    else:
        message = "درخواست مرجوعی بررسی و رد شد."

    await db.commit()
    return {
        "status": "resolved",
        "order_id": order.id,
        "resolution": payload.resolution,
        "message": message,
    }


# ====================================================================
# PRODUCT CATALOG MANAGEMENT (PRODUCTION WORKFLOW)
# ====================================================================

class ProductCreatePayload(BaseModel):
    title_fa: str
    category_slug: str
    target_species: str  # DOG, CAT, BIRD, etc.
    brand: Optional[str] = "Bonnivo"
    sku: Optional[str] = None
    price_tomans: int
    old_price_tomans: Optional[int] = None
    stock_quantity: int = 0
    package_weight_grams: Optional[int] = None
    size: Optional[str] = None
    flavor: Optional[str] = None
    color: Optional[str] = None
    life_stage: Optional[str] = "Adult"
    health_tags: Optional[str] = None
    description_fa: Optional[str] = None
    short_description_fa: Optional[str] = None
    slug: Optional[str] = None
    primary_image_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    status: str = "PUBLISHED"


class ProductUpdatePayload(BaseModel):
    title_fa: Optional[str] = None
    category_slug: Optional[str] = None
    target_species: Optional[str] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    price_tomans: Optional[int] = None
    old_price_tomans: Optional[int] = None
    stock_quantity: Optional[int] = None
    package_weight_grams: Optional[int] = None
    size: Optional[str] = None
    flavor: Optional[str] = None
    color: Optional[str] = None
    life_stage: Optional[str] = None
    health_tags: Optional[str] = None
    description_fa: Optional[str] = None
    short_description_fa: Optional[str] = None
    slug: Optional[str] = None
    primary_image_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    status: Optional[str] = None


class ProductStatusPayload(BaseModel):
    status: str = Field(description="PUBLISHED, DRAFT, ARCHIVED")


class ProductContentGenPayload(BaseModel):
    source_text: str = Field(min_length=10, description="Raw manufacturer/supplier text")
    brand: Optional[str] = None
    target_species: Optional[str] = None


class ReviewModerationPayload(BaseModel):
    status: str = Field(description="APPROVED, REJECTED, FLAGGED, PENDING")
    admin_notes: Optional[str] = None


@router.get("/products")
async def list_admin_products(
    search: Optional[str] = None,
    species: Optional[str] = None,
    category_slug: Optional[str] = None,
    status_filter: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CanonicalProduct)
        .options(
            selectinload(CanonicalProduct.category),
            selectinload(CanonicalProduct.images),
            selectinload(CanonicalProduct.offers),
        )
        .order_by(CanonicalProduct.created_at.desc())
    )

    if search:
        stmt = stmt.where(CanonicalProduct.title_fa.contains(search) | CanonicalProduct.sku.contains(search))
    if species:
        try:
            sp_enum = PetSpecies[species.upper()]
            stmt = stmt.where(CanonicalProduct.target_species == sp_enum)
        except KeyError:
            pass
    if status_filter:
        stmt = stmt.where(CanonicalProduct.status == status_filter.upper())

    res = await db.execute(stmt)
    products = res.scalars().all()

    output = []
    for p in products:
        if category_slug and p.category and p.category.slug != category_slug:
            continue
        output.append({
            "id": p.id,
            "title_fa": p.title_fa,
            "sku": p.sku,
            "slug": p.slug,
            "brand": p.brand,
            "category_slug": p.category.slug if p.category else "general",
            "category_title": p.category.title_fa if p.category else "عمومی",
            "target_species": p.target_species.value,
            "price_tomans": p.price_tomans or 0,
            "old_price_tomans": p.old_price_tomans,
            "stock_quantity": p.stock_quantity,
            "size": p.size,
            "flavor": p.flavor,
            "life_stage": p.life_stage,
            "primary_image_url": p.primary_image_url or (p.images[0].image_url if p.images else "/icons/food.png"),
            "status": p.status,
            "is_active": p.is_active,
            "images_count": len(p.images),
            "offers_count": len(p.offers),
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return output


@router.post("/products")
async def create_product(
    payload: ProductCreatePayload,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Ensure category exists
    q_cat = select(Category).where(Category.slug == payload.category_slug)
    res_cat = await db.execute(q_cat)
    cat = res_cat.scalars().first()
    if not cat:
        cat = Category(
            slug=payload.category_slug,
            title_fa=payload.category_slug.replace("-", " ").title(),
            is_active=True,
        )
        db.add(cat)
        await db.flush()

    try:
        species_enum = PetSpecies[payload.target_species.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"گونه پت نامعتبر است: {payload.target_species}")

    # Generate slug if missing
    import re
    slug = payload.slug
    if not slug:
        clean_slug = re.sub(r"[^a-zA-Z0-9]", "-", payload.title_fa.lower())[:40].strip("-")
        slug = f"{clean_slug}-{payload.sku or 'p'}" if clean_slug else f"prod-{uuid.uuid4().hex[:8]}"

    # Check slug uniqueness
    q_slug = select(CanonicalProduct).where(CanonicalProduct.slug == slug)
    res_slug = await db.execute(q_slug)
    if res_slug.scalars().first():
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"

    product = CanonicalProduct(
        category_id=cat.id,
        title_fa=payload.title_fa,
        slug=slug,
        sku=payload.sku,
        brand=payload.brand,
        target_species=species_enum,
        description_fa=payload.description_fa,
        short_description_fa=payload.short_description_fa or (payload.description_fa[:150] if payload.description_fa else None),
        price_tomans=payload.price_tomans,
        old_price_tomans=payload.old_price_tomans,
        stock_quantity=payload.stock_quantity,
        package_weight_grams=payload.package_weight_grams,
        size=payload.size,
        flavor=payload.flavor,
        color=payload.color,
        life_stage=payload.life_stage,
        health_tags=payload.health_tags,
        primary_image_url=payload.primary_image_url or "/icons/food.png",
        seo_title=payload.seo_title or f"{payload.title_fa} | بنیوو",
        seo_description=payload.seo_description or payload.title_fa,
        seo_keywords=payload.seo_keywords,
        status=payload.status.upper(),
        is_active=payload.status.upper() == "PUBLISHED",
    )
    db.add(product)
    await db.flush()

    # Automatically create platform seller offer for instant Buy Box compatibility
    stmt_seller = select(Seller).where(Seller.is_verified == True)
    res_seller = await db.execute(stmt_seller)
    default_seller = res_seller.scalars().first()
    if default_seller:
        offer = SellerOffer(
            product_id=product.id,
            seller_id=default_seller.id,
            price_tomans=payload.price_tomans,
            stock_quantity=payload.stock_quantity,
            is_active=True,
        )
        db.add(offer)

    await db.commit()
    await db.refresh(product)

    return {
        "status": "success",
        "message": "محصول با موفقیت ایجاد شد.",
        "product_id": product.id,
        "slug": product.slug,
    }


# ====================================================================
# CSV EXPORT (Item 29: Persian-safe UTF-8 BOM)
# ====================================================================

@router.get("/products/export-csv")
async def export_products_csv(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    import io
    import csv

    stmt = (
        select(CanonicalProduct)
        .options(
            selectinload(CanonicalProduct.category),
            selectinload(CanonicalProduct.variants),
        )
        .order_by(CanonicalProduct.created_at.desc())
    )
    res = await db.execute(stmt)
    products = res.scalars().all()

    output = io.StringIO()
    output.write('\ufeff')  # UTF-8 BOM for perfect Excel Persian compatibility
    writer = csv.writer(output)
    writer.writerow([
        "شناسه", "عنوان کالا", "نام انگلیسی / Slug", "برند", "دسته‌بندی", "گونه هدف",
        "قیمت (تومان)", "قیمت قبل", "درصد تخفیف", "موجودی انبار", "زمان آماده‌سازی (روز)",
        "وزن بسته (گرم)", "تنوع‌ها", "وضعیت"
    ])
    for p in products:
        var_str = "; ".join([f"{v.title_fa}: {v.price_tomans:,} تومان" for v in p.variants]) if p.variants else "-"
        species_str = p.target_species.value if hasattr(p.target_species, "value") else str(p.target_species)
        writer.writerow([
            p.id,
            p.title_fa,
            p.slug,
            p.brand or "",
            p.category.title_fa if p.category else "",
            species_str,
            p.price_tomans or 0,
            p.old_price_tomans or 0,
            p.discount_percent or 0,
            p.stock_quantity,
            p.lead_time_days,
            p.package_weight_grams or 0,
            var_str,
            p.status,
        ])

    csv_bytes = output.getvalue().encode("utf-8-sig")
    return Response(
        content=csv_bytes,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=bonnivo_catalog_export.csv"},
    )


@router.get("/products/{product_id}")
async def get_admin_product(
    product_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CanonicalProduct)
        .options(
            selectinload(CanonicalProduct.category),
            selectinload(CanonicalProduct.images),
            selectinload(CanonicalProduct.offers).selectinload(SellerOffer.seller),
            selectinload(CanonicalProduct.reviews),
        )
        .where(CanonicalProduct.id == product_id)
    )
    res = await db.execute(stmt)
    p = res.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="محصول یافت نشد.")

    return {
        "id": p.id,
        "title_fa": p.title_fa,
        "slug": p.slug,
        "sku": p.sku,
        "brand": p.brand,
        "category_slug": p.category.slug if p.category else "general",
        "target_species": p.target_species.value,
        "price_tomans": p.price_tomans,
        "old_price_tomans": p.old_price_tomans,
        "stock_quantity": p.stock_quantity,
        "package_weight_grams": p.package_weight_grams,
        "size": p.size,
        "flavor": p.flavor,
        "color": p.color,
        "life_stage": p.life_stage,
        "health_tags": p.health_tags,
        "description_fa": p.description_fa,
        "short_description_fa": p.short_description_fa,
        "primary_image_url": p.primary_image_url,
        "seo_title": p.seo_title,
        "seo_description": p.seo_description,
        "seo_keywords": p.seo_keywords,
        "status": p.status,
        "is_active": p.is_active,
        "images": [
            {
                "id": img.id,
                "url": img.image_url,
                "thumbnail_url": img.thumbnail_url,
                "alt_text": img.alt_text,
                "is_primary": img.is_primary,
                "display_order": img.display_order,
            }
            for img in p.images
        ],
        "offers": [
            {
                "id": o.id,
                "seller_name": o.seller.store_name_fa if o.seller else "بنیوو اکسپرس",
                "price_tomans": o.price_tomans,
                "stock_quantity": o.stock_quantity,
                "is_active": o.is_active,
            }
            for o in p.offers
        ],
        "reviews_count": len(p.reviews),
    }


@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    payload: ProductUpdatePayload,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    p = await db.get(CanonicalProduct, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="محصول یافت نشد.")

    if payload.title_fa is not None:
        p.title_fa = payload.title_fa
    if payload.brand is not None:
        p.brand = payload.brand
    if payload.sku is not None:
        p.sku = payload.sku
    if payload.price_tomans is not None:
        p.price_tomans = payload.price_tomans
    if payload.old_price_tomans is not None:
        p.old_price_tomans = payload.old_price_tomans
    if payload.stock_quantity is not None:
        p.stock_quantity = payload.stock_quantity
    if payload.package_weight_grams is not None:
        p.package_weight_grams = payload.package_weight_grams
    if payload.size is not None:
        p.size = payload.size
    if payload.flavor is not None:
        p.flavor = payload.flavor
    if payload.color is not None:
        p.color = payload.color
    if payload.life_stage is not None:
        p.life_stage = payload.life_stage
    if payload.health_tags is not None:
        p.health_tags = payload.health_tags
    if payload.description_fa is not None:
        p.description_fa = payload.description_fa
    if payload.short_description_fa is not None:
        p.short_description_fa = payload.short_description_fa
    if payload.primary_image_url is not None:
        p.primary_image_url = payload.primary_image_url
    if payload.seo_title is not None:
        p.seo_title = payload.seo_title
    if payload.seo_description is not None:
        p.seo_description = payload.seo_description
    if payload.seo_keywords is not None:
        p.seo_keywords = payload.seo_keywords
    if payload.status is not None:
        p.status = payload.status.upper()
        p.is_active = p.status == "PUBLISHED"

    if payload.target_species:
        try:
            p.target_species = PetSpecies[payload.target_species.upper()]
        except KeyError:
            pass

    await db.commit()
    return {"status": "success", "message": "محصول با موفقیت بروزرسانی شد.", "product_id": p.id}


@router.put("/products/{product_id}/status")
async def update_product_status(
    product_id: str,
    payload: ProductStatusPayload,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    p = await db.get(CanonicalProduct, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="محصول یافت نشد.")

    new_status = payload.status.upper()
    p.status = new_status
    p.is_active = (new_status == "PUBLISHED")

    await db.commit()
    return {"status": "success", "new_status": new_status, "is_active": p.is_active}


# ====================================================================
# IMAGE PIPELINE ENDPOINTS
# ====================================================================

@router.post("/products/{product_id}/images")
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    is_primary: bool = Form(False),
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(CanonicalProduct, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد.")

    content = await file.read()
    try:
        processed = validate_and_process_image(
            content=content,
            original_filename=file.filename or "image.jpg",
            content_type=file.content_type or "image/jpeg",
        )
    except ImageSecurityError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # If marked primary, unset other primaries
    if is_primary:
        stmt_reset = update(ProductImage).where(ProductImage.product_id == product_id).values(is_primary=False)
        await db.execute(stmt_reset)
        product.primary_image_url = processed["url"]

    # Calculate next display order
    q_max = select(ProductImage).where(ProductImage.product_id == product_id)
    res_max = await db.execute(q_max)
    existing_images = res_max.scalars().all()
    next_order = len(existing_images) + 1

    img_record = ProductImage(
        product_id=product_id,
        image_url=processed["url"],
        thumbnail_url=processed["thumbnail_url"],
        alt_text=alt_text or product.title_fa,
        is_primary=is_primary or len(existing_images) == 0,
        display_order=next_order,
    )
    db.add(img_record)

    if len(existing_images) == 0 and not product.primary_image_url:
        product.primary_image_url = processed["url"]

    await db.commit()
    await db.refresh(img_record)

    return {
        "status": "success",
        "image_id": img_record.id,
        "url": img_record.image_url,
        "thumbnail_url": img_record.thumbnail_url,
        "is_primary": img_record.is_primary,
        "metadata": processed,
    }


@router.delete("/products/{product_id}/images/{image_id}")
async def delete_product_image(
    product_id: str,
    image_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    img = await db.get(ProductImage, image_id)
    if not img or img.product_id != product_id:
        raise HTTPException(status_code=404, detail="تصویر یافت نشد.")

    await db.delete(img)
    await db.commit()
    return {"status": "success", "message": "تصویر حذف شد."}


@router.put("/products/{product_id}/images/{image_id}/primary")
async def set_primary_product_image(
    product_id: str,
    image_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    img = await db.get(ProductImage, image_id)
    if not img or img.product_id != product_id:
        raise HTTPException(status_code=404, detail="تصویر یافت نشد.")

    stmt_reset = update(ProductImage).where(ProductImage.product_id == product_id).values(is_primary=False)
    await db.execute(stmt_reset)

    img.is_primary = True
    prod = await db.get(CanonicalProduct, product_id)
    if prod:
        prod.primary_image_url = img.image_url

    await db.commit()
    return {"status": "success", "primary_image_url": img.image_url}


# ====================================================================
# EXCEL IMPORT ENDPOINTS
# ====================================================================

@router.get("/products/import/template")
async def download_import_template(
    admin_user: User = Depends(require_admin),
):
    csv_data = generate_template_csv()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bonnivo_product_import_template.csv"},
    )


class RawCsvImportPayload(BaseModel):
    csv_content: str


@router.post("/products/import/preview")
async def preview_product_import(
    payload: RawCsvImportPayload,
    admin_user: User = Depends(require_admin),
):
    report = parse_and_validate_import(payload.csv_content)
    return report


class CommitImportPayload(BaseModel):
    rows: List[Dict[str, Any]]


@router.post("/products/import/commit")
async def execute_product_import(
    payload: CommitImportPayload,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await commit_import_rows(db, payload.rows)
    return result


# ====================================================================
# LLM CONTENT GENERATION ENDPOINTS
# ====================================================================

@router.post("/products/generate-content")
async def generate_product_content_endpoint(
    payload: ProductContentGenPayload,
    admin_user: User = Depends(require_admin),
):
    result = await generate_product_content(
        source_text=payload.source_text,
        brand=payload.brand,
        target_species=payload.target_species,
    )
    return result


# ====================================================================
# REVIEW MODERATION ENDPOINTS
# ====================================================================

@router.get("/reviews")
async def list_admin_reviews(
    status_filter: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ProductReview)
        .options(
            selectinload(ProductReview.product),
            selectinload(ProductReview.user),
        )
        .order_by(ProductReview.created_at.desc())
    )
    if status_filter:
        stmt = stmt.where(ProductReview.moderation_status == status_filter.upper())

    res = await db.execute(stmt)
    reviews = res.scalars().all()

    return [
        {
            "id": r.id,
            "product_id": r.product_id,
            "product_title": r.product.title_fa if r.product else "نامشخص",
            "user_id": r.user_id,
            "user_name": r.user.full_name or r.user.phone_number if r.user else "کاربر",
            "rating": r.rating,
            "title": r.title,
            "comment": r.comment,
            "is_verified_purchase": r.is_verified_purchase,
            "moderation_status": r.moderation_status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reviews
    ]


@router.put("/reviews/{review_id}/status")
async def update_review_status(
    review_id: str,
    payload: ReviewModerationPayload,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    r = await db.get(ProductReview, review_id)
    if not r:
        raise HTTPException(status_code=404, detail="نظر یافت نشد.")

    r.moderation_status = payload.status.upper()
    await db.commit()
    return {"status": "success", "review_id": r.id, "new_status": r.moderation_status}


# ====================================================================
# PRODUCT VARIANTS MANAGEMENT (MULTI-WEIGHT)
# ====================================================================

class ProductVariantCreatePayload(BaseModel):
    title_fa: str
    sku: Optional[str] = None
    weight_grams: Optional[int] = None
    price_tomans: int
    old_price_tomans: Optional[int] = None
    discount_percent: Optional[int] = 0
    stock_quantity: int = 0
    lead_time_days: int = 0


@router.post("/products/{product_id}/variants")
async def create_product_variant(
    product_id: str,
    payload: ProductVariantCreatePayload,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(CanonicalProduct, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد.")

    variant = ProductVariant(
        product_id=product_id,
        title_fa=payload.title_fa,
        sku=payload.sku,
        weight_grams=payload.weight_grams,
        price_tomans=payload.price_tomans,
        old_price_tomans=payload.old_price_tomans,
        discount_percent=payload.discount_percent,
        stock_quantity=payload.stock_quantity,
        lead_time_days=payload.lead_time_days,
        is_active=True,
    )
    db.add(variant)
    await db.commit()
    await db.refresh(variant)

    return {"status": "success", "variant_id": variant.id, "title_fa": variant.title_fa}


@router.delete("/variants/{variant_id}")
async def delete_product_variant(
    variant_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    variant = await db.get(ProductVariant, variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="تنوع محصول یافت نشد.")

    await db.delete(variant)
    await db.commit()
    return {"status": "success", "message": "تنوع محصول حذف شد."}





