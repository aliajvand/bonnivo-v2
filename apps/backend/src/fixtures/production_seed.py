"""
Bonnivo Ecosystem - Production Seed Data Generator
Populates SQLite/PostgreSQL with realistic Iranian e-commerce pet products,
buy-box seller offers, multi-weight variants, clinics, coupons, pets, care tasks,
and real wallet accounts.
"""

import asyncio
from datetime import datetime, timezone, timedelta

from src.core.database import AsyncSessionLocal
from src.models.user import User, UserRole
from src.models.catalog import (
    Category,
    CanonicalProduct,
    ProductVariant,
    Seller,
    SellerOffer,
)
from src.models.pet import Pet, PetSpecies, PetSex, CareTask, TaskCategory, PetHealthProfile
from src.models.wallet import Wallet, WalletTransaction, TransactionType
from src.models.coupon import Coupon, CouponType


async def seed_all_production_data():
    async with AsyncSessionLocal() as db:
        print("[*] Starting Production Database Seeding...")

        # 1. Categories
        cats_data = [
            {"id": "cat-food-cat", "slug": "cat-food", "title_fa": "غذای گربه", "icon_name": "food"},
            {"id": "cat-food-dog", "slug": "dog-food", "title_fa": "غذای سگ", "icon_name": "food"},
            {"id": "cat-treats", "slug": "treats", "title_fa": "تشویقی و اسنک", "icon_name": "toys"},
            {"id": "cat-hygiene", "slug": "hygiene", "title_fa": "بهداشت و خاک بستر", "icon_name": "heart"},
            {"id": "cat-accessories", "slug": "accessories", "title_fa": "لوازم و اسباب‌بازی", "icon_name": "toys"},
        ]
        category_map = {}
        for c in cats_data:
            cat = Category(
                id=c["id"],
                slug=c["slug"],
                title_fa=c["title_fa"],
                icon_name=c["icon_name"],
                is_active=True,
            )
            db.add(cat)
            category_map[c["slug"]] = cat

        # 2. Sellers & Seller Users
        sellers_data = [
            {
                "id": "seller-royal-pet",
                "user_id": "usr-seller-royal",
                "phone": "09121110001",
                "store_name_fa": "فروشگاه مرکزی رویال پت (انبار بونیو)",
                "slug": "royal-pet-center",
                "national_id": "10103456789",
                "sheba_number": "IR120170000000111122223333",
                "city": "تهران",
                "address": "بزرگراه همت، خروجی چمران، انبار متمرکز بونیو",
                "commission_rate": 0.08,
            },
            {
                "id": "seller-vanak-pet",
                "user_id": "usr-seller-vanak",
                "phone": "09121110002",
                "store_name_fa": "پت سنتر ونک (ارسال سریع)",
                "slug": "vanak-pet-center",
                "national_id": "10103456790",
                "sheba_number": "IR120170000000222233334444",
                "city": "تهران",
                "address": "میدان ونک، خیابان ملاصدرا، پلاک ۱۲",
                "commission_rate": 0.10,
            },
            {
                "id": "seller-niavaran-pet",
                "user_id": "usr-seller-niavaran",
                "phone": "09121110003",
                "store_name_fa": "هایپرپت نیاوران",
                "slug": "niavaran-hyper-pet",
                "national_id": "10103456791",
                "sheba_number": "IR120170000000333344445555",
                "city": "تهران",
                "address": "خیابان باهنر (نیاوران)، مجتمع اداری تجاری مژده",
                "commission_rate": 0.10,
            },
        ]
        for s in sellers_data:
            s_user = User(
                id=s["user_id"],
                phone_number=s["phone"],
                full_name=s["store_name_fa"],
                role=UserRole.SELLER,
                is_active=True,
            )
            db.add(s_user)

            seller = Seller(
                id=s["id"],
                user_id=s_user.id,
                store_name_fa=s["store_name_fa"],
                slug=s["slug"],
                national_id=s["national_id"],
                sheba_number=s["sheba_number"],
                phone_number=s["phone"],
                city=s["city"],
                address=s["address"],
                commission_rate=s["commission_rate"],
                is_verified=True,
                status="ACTIVE",
            )
            db.add(seller)

        # 3. Canonical Products
        products_data = [
            {
                "id": "prod-rc-fit32",
                "slug": "royal-canin-fit32",
                "category_slug": "cat-food",
                "title_fa": "غذای خشک گربه رویال کنین مدل فیت ۳۲ (Fit 32)",
                "brand": "Royal Canin",
                "species": PetSpecies.CAT,
                "description_fa": "غذای خشک کامل و متعادل برای گربه‌های بالغ با فعالیت متوسط بالای ۱ سال. حاوی بالانس دقیق مواد مغذی برای حفظ وزن ایده‌آل و دفع گلوله‌های مویی.",
                "short_description_fa": "مناسب گربه بالغ با فعالیت متوسط، تقویت‌کننده سیستم ایمنی و سلامت گوارش",
                "price": 2290000,
                "old_price": 2490000,
                "discount": 8,
                "weight_grams": 2000,
                "lead_time": 0,
                "stock": 45,
                "variants": [
                    {"title_fa": "بسته ۲ کیلوگرم", "weight": 2000, "price": 2290000, "old": 2490000, "stock": 25},
                    {"title_fa": "بسته ۴ کیلوگرم", "weight": 4000, "price": 4350000, "old": 4700000, "stock": 15},
                    {"title_fa": "بسته ۱۰ کیلوگرم", "weight": 10000, "price": 9800000, "old": 10500000, "stock": 5},
                ],
            },
            {
                "id": "prod-rc-maxi-adult",
                "slug": "royal-canin-maxi-adult",
                "category_slug": "dog-food",
                "title_fa": "غذای خشک سگ نژاد بزرگ رویال کنین مدل مکسی ادالت (Maxi Adult)",
                "brand": "Royal Canin",
                "species": PetSpecies.DOG,
                "description_fa": "فرموله شده اختصاصی برای سگ‌های نژاد بزرگ (وزن ۲۶ تا ۴۴ کیلوگرم) از سن ۱۵ ماهگی تا ۵ سالگی، با قابلیت هضم بسیار بالا و پشتیبانی از مفاصل سنگین.",
                "short_description_fa": "حفظ سلامت استخوان‌ها و مفاصل، حاوی اسیدهای چرب امگا ۳",
                "price": 8900000,
                "old_price": 9600000,
                "discount": 7,
                "weight_grams": 15000,
                "lead_time": 0,
                "stock": 20,
                "variants": [
                    {"title_fa": "کیسه ۴ کیلوگرم", "weight": 4000, "price": 2850000, "old": 3100000, "stock": 8},
                    {"title_fa": "کیسه ۱۵ کیلوگرم", "weight": 15000, "price": 8900000, "old": 9600000, "stock": 12},
                ],
            },
            {
                "id": "prod-reflex-plus-cat",
                "slug": "reflex-plus-sterilised-cat",
                "category_slug": "cat-food",
                "title_fa": "غذای خشک گربه عقیم‌شده رفلکس پلاس با طعم سالمون",
                "brand": "Reflex Plus",
                "species": PetSpecies.CAT,
                "description_fa": "غذای سوپرپرمیوم با فرمولاسیون ویژه کنترل کالری و سلامت مجاری ادراری مخصوص گربه‌های عقیم‌شده. غنی از ویتامین‌ها و زایلواولیگوساکاریدها.",
                "short_description_fa": "سوپر پرمیوم، کنترل وزن و سلامت کلیه‌ها با گوشت سالمون تازه",
                "price": 1450000,
                "old_price": 1650000,
                "discount": 12,
                "weight_grams": 1500,
                "lead_time": 0,
                "stock": 35,
                "variants": [
                    {"title_fa": "بسته ۱.۵ کیلوگرم", "weight": 1500, "price": 1450000, "old": 1650000, "stock": 20},
                    {"title_fa": "کیسه ۸ کیلوگرم", "weight": 8000, "price": 5400000, "old": 5900000, "stock": 15},
                ],
            },
            {
                "id": "prod-josera-festival",
                "slug": "josera-festival-dog-food",
                "category_slug": "dog-food",
                "title_fa": "غذای خشک سگ جوسرا مدل فستیوال با طعم سالمون و گوشت بره",
                "brand": "Josera",
                "species": PetSpecies.DOG,
                "description_fa": "غذای لذیذ با سس مخصوص همراه با دانه ماهی سالمون برای سگ‌های بدغذا و سخت‌پسند. قابل مصرف به دو صورت خشک یا همراه با آب ولرم برای ایجاد سس خوشمزه.",
                "short_description_fa": "پودر سس لذیذ، حاوی گوشت لذیذ ماهی سالمون و صدف لبه سبز نیوزیلندی",
                "price": 7800000,
                "old_price": 8400000,
                "discount": 7,
                "weight_grams": 15000,
                "lead_time": 1,
                "stock": 18,
                "variants": [
                    {"title_fa": "کیسه ۱۲.۵ کیلوگرم", "weight": 12500, "price": 7800000, "old": 8400000, "stock": 18},
                ],
            },
            {
                "id": "prod-winston-treats",
                "slug": "winston-cat-sticks-chicken",
                "category_slug": "treats",
                "title_fa": "تشویقی مدادی گربه وینستون با طعم مرغ و پنیر (بسته ۵ عددی)",
                "brand": "Winston",
                "species": PetSpecies.CAT,
                "description_fa": "استیک‌های مدادی بسیار معطر و تازه تولید کشور آلمان بدون شکر افزوده و بدون رنگ‌های مصنوعی، سرشار از گوشت تازه مرغ و تورین.",
                "short_description_fa": "بسته ۵ عددی ساخت آلمان، غنی از تورین برای سلامت چشم و قلب گربه",
                "price": 390000,
                "old_price": 450000,
                "discount": 13,
                "weight_grams": 25,
                "lead_time": 0,
                "stock": 120,
                "variants": [
                    {"title_fa": "بسته ۵ عددی", "weight": 25, "price": 390000, "old": 450000, "stock": 120},
                ],
            },
            {
                "id": "prod-wanpy-dog-treats",
                "slug": "wanpy-soft-duck-jerky",
                "category_slug": "treats",
                "title_fa": "تشویقی جرکی گوشت اردک نواری ونپی (Wanpy) مناسب سگ",
                "brand": "Wanpy",
                "species": PetSpecies.DOG,
                "description_fa": "تشویقی کم‌چربی و پرپروتئین با گوشت خالص اردک خشک‌شده با بافت نرم و جویدنی عالی برای آموزش و سلامت دندان‌ها.",
                "short_description_fa": "۱۰۰ گرم فیله خالص اردک تنوری با هضم آسان و طعم بی‌نظیر",
                "price": 280000,
                "old_price": 320000,
                "discount": 12,
                "weight_grams": 100,
                "lead_time": 0,
                "stock": 80,
                "variants": [
                    {"title_fa": "بسته ۱۰۰ گرمی", "weight": 100, "price": 280000, "old": 320000, "stock": 80},
                ],
            },
            {
                "id": "prod-gimcat-malt-paste",
                "slug": "gimcat-malt-soft-extra",
                "category_slug": "hygiene",
                "title_fa": "خمیر مالت گربه جیم‌کت مدل سافت اکسترا ۱۰۰ گرم",
                "brand": "GimCat",
                "species": PetSpecies.CAT,
                "description_fa": "فرمول منحصربه‌فرد مالت آلمانی به همراه روغن‌های گیاهی و فیبر فراوان برای دفع طبیعی گلوله‌های مویی و جلوگیری از انسداد روده.",
                "short_description_fa": "فرمول اکسترا، دفع آسان هربال، ساخت کشور آلمان",
                "price": 620000,
                "old_price": 690000,
                "discount": 10,
                "weight_grams": 100,
                "lead_time": 0,
                "stock": 65,
                "variants": [
                    {"title_fa": "تیوپ ۱۰۰ گرم", "weight": 100, "price": 620000, "old": 690000, "stock": 45},
                    {"title_fa": "تیوپ ۲۰۰ گرم", "weight": 200, "price": 1150000, "old": 1280000, "stock": 20},
                ],
            },
            {
                "id": "prod-petstages-ball",
                "slug": "petstages-interactive-chew-ball",
                "category_slug": "accessories",
                "title_fa": "توپ تعاملی ضد سایش و ماساژور لثه پت‌استیجز (Petstages)",
                "brand": "Petstages",
                "species": PetSpecies.DOG,
                "description_fa": "توپ اسباب‌بازی دندانی با رایحه طبیعی چوب و متریال مقاوم در برابر جویدن شدید، به همراه شیارهای پاک‌کننده پلاک‌های دندانی.",
                "short_description_fa": "بسیار بادوام، بدون سموم پلاستیکی BPA، محافظ بهداشت دهان سگ",
                "price": 790000,
                "old_price": 890000,
                "discount": 11,
                "weight_grams": 180,
                "lead_time": 0,
                "stock": 50,
                "variants": [
                    {"title_fa": "سایز متوسط (M)", "weight": 180, "price": 790000, "old": 890000, "stock": 50},
                ],
            },
        ]

        for p in products_data:
            cat = category_map[p["category_slug"]]
            prod = CanonicalProduct(
                id=p["id"],
                category_id=cat.id,
                title_fa=p["title_fa"],
                slug=p["slug"],
                brand=p["brand"],
                target_species=p["species"],
                description_fa=p["description_fa"],
                short_description_fa=p["short_description_fa"],
                price_tomans=p["price"],
                old_price_tomans=p["old_price"],
                discount_percent=p["discount"],
                package_weight_grams=p["weight_grams"],
                stock_quantity=p["stock"],
                lead_time_days=p["lead_time"],
                primary_image_url="/icons/food.svg" if "food" in p["category_slug"] else "/icons/toys.svg",
                rating_avg=4.8,
                rating_count=24,
                status="PUBLISHED",
                is_active=True,
            )
            db.add(prod)

            # Add variants
            for idx, v in enumerate(p["variants"]):
                variant = ProductVariant(
                    id=f"{p['id']}-var-{idx}",
                    product_id=prod.id,
                    title_fa=v["title_fa"],
                    weight_grams=v["weight"],
                    price_tomans=v["price"],
                    old_price_tomans=v["old"],
                    discount_percent=int(round((1 - (v["price"] / v["old"])) * 100)) if v["old"] else 0,
                    stock_quantity=v["stock"],
                    lead_time_days=p["lead_time"],
                    is_active=True,
                )
                db.add(variant)

            # Primary Buy-box Offer from Royal Pet
            offer1 = SellerOffer(
                id=f"{p['id']}-offer-1",
                product_id=prod.id,
                seller_id="seller-royal-pet",
                price_tomans=p["price"],
                stock_quantity=p["stock"],
                is_active=True,
            )
            # Alternative Offer from Vanak Pet
            offer2 = SellerOffer(
                id=f"{p['id']}-offer-2",
                product_id=prod.id,
                seller_id="seller-vanak-pet",
                price_tomans=int(p["price"] * 1.04),
                stock_quantity=15,
                is_active=True,
            )
            db.add(offer1)
            db.add(offer2)

        # 4. Deterministic Test Users
        users_seed = [
            {
                "id": "usr-customer-01",
                "phone_number": "09121234567",
                "full_name": "علی ایجرندی",
                "role": UserRole.CUSTOMER,
            },
            {
                "id": "usr-admin-01",
                "phone_number": "09120000002",
                "full_name": "مدیر ارشد سامانه بونیو",
                "role": UserRole.ADMIN,
            },
            {
                "id": "usr-vet-01",
                "phone_number": "09120000003",
                "full_name": "دکتر آرین پارسا (دامپزشک)",
                "role": UserRole.VETERINARIAN,
            },
        ]
        for u in users_seed:
            user = User(
                id=u["id"],
                phone_number=u["phone_number"],
                full_name=u["full_name"],
                role=u["role"],
                is_active=True,
            )
            db.add(user)

            # Seed Real Wallet for customer
            if u["id"] == "usr-customer-01":
                wallet = Wallet(
                    id="wlt-customer-01",
                    user_id=user.id,
                    balance_tomans=450000,
                )
                db.add(wallet)

                tx1 = WalletTransaction(
                    id="tx-wlt-001",
                    wallet_id=wallet.id,
                    amount_tomans=350000,
                    transaction_type=TransactionType.CREDIT_REFUND,
                    reference_id="APT-101",
                    reference_type="APPOINTMENT",
                    description="استرداد هزینه کنسلی ویزیت کلینیک آرا (عودت ۹۰٪ وجه)",
                )
                tx2 = WalletTransaction(
                    id="tx-wlt-002",
                    wallet_id=wallet.id,
                    amount_tomans=200000,
                    transaction_type=TransactionType.CREDIT_DEPOSIT,
                    reference_id="SHP-882104",
                    reference_type="PAYMENT",
                    description="افزایش اعتبار موفق از طریق درگاه زرین‌پال شاپرک",
                )
                tx3 = WalletTransaction(
                    id="tx-wlt-003",
                    wallet_id=wallet.id,
                    amount_tomans=-100000,
                    transaction_type=TransactionType.DEBIT_PURCHASE,
                    reference_id="BNY-748921",
                    reference_type="ORDER",
                    description="کسر وجه بابت سفارش محصولات غذایی بونیو",
                )
                db.add(tx1)
                db.add(tx2)
                db.add(tx3)

        # 5. Seed Customer Pets & Care Tasks
        pets_seed = [
            {
                "id": "pet-milo",
                "user_id": "usr-customer-01",
                "name": "میلو",
                "species": PetSpecies.DOG,
                "breed": "ژرمن شپرد (German Shepherd)",
                "weight_kg": 28.5,
                "age_months": 36,
                "qr_passport_token": "BNY-DOG-MILO-8821",
                "avatar_url": "/icons/dog.svg",
            },
            {
                "id": "pet-barfi",
                "user_id": "usr-customer-01",
                "name": "برفی",
                "species": PetSpecies.CAT,
                "breed": "پرشین سوپرفلت سفید",
                "weight_kg": 4.2,
                "age_months": 24,
                "qr_passport_token": "BNY-CAT-BARFI-4412",
                "avatar_url": "/icons/cat.svg",
            },
        ]
        for p in pets_seed:
            pet = Pet(
                id=p["id"],
                user_id=p["user_id"],
                name=p["name"],
                species=p["species"],
                breed=p["breed"],
                sex=PetSex.MALE if p["species"] == PetSpecies.DOG else PetSex.FEMALE,
                weight_kg=p["weight_kg"],
                estimated_age_months=p["age_months"],
                qr_passport_token=p["qr_passport_token"],
                avatar_url=p["avatar_url"],
                is_lost=False,
            )
            db.add(pet)

            # Health profile
            hp = PetHealthProfile(
                id=f"hp-{p['id']}",
                pet_id=pet.id,
                daily_food_grams=450.0 if p["species"] == PetSpecies.DOG else 65.0,
                dietary_preferences="غذای خشک رویال کنین با تشویقی مرغ",
                allergies="حساسیت به پروتئین سویا" if p["species"] == PetSpecies.CAT else "فاقد آلرژی",
            )
            db.add(hp)

            # Care Tasks for pet
            t1 = CareTask(
                id=f"task-{p['id']}-food",
                pet_id=pet.id,
                title=f"وعده غذای اصلی {pet.name}",
                species=pet.species,
                category=TaskCategory.FOOD,
                scheduled_time="08:30",
                target_metric="گرم",
                target_value=225 if pet.species == PetSpecies.DOG else 35,
                is_locked=False,
            )
            t2 = CareTask(
                id=f"task-{p['id']}-walk" if pet.species == PetSpecies.DOG else f"task-{p['id']}-malt",
                pet_id=pet.id,
                title="پیاده‌روی صبحگاهی و تخلیه انرژی" if pet.species == PetSpecies.DOG else "مصرف خمیر مالت ضد گلوله مویی",
                species=pet.species,
                category=TaskCategory.WALK if pet.species == PetSpecies.DOG else TaskCategory.MEDICATION,
                scheduled_time="10:00" if pet.species == PetSpecies.DOG else "19:00",
                target_metric="دقیقه" if pet.species == PetSpecies.DOG else "سانتی‌متر",
                target_value=45 if pet.species == PetSpecies.DOG else 3,
                is_locked=True if pet.species == PetSpecies.CAT else False,
            )
            db.add(t1)
            db.add(t2)

        # 6. Seed Coupons
        coupons_seed = [
            {"code": "BONNIVO20", "type": CouponType.PERCENTAGE, "value": 20, "max_cap": 100000, "min_order": 300000},
            {"code": "WELCOME", "type": CouponType.FIXED, "value": 50000, "max_cap": 50000, "min_order": 200000},
            {"code": "SUPERPET", "type": CouponType.PERCENTAGE, "value": 15, "max_cap": 80000, "min_order": 250000},
        ]
        for cp in coupons_seed:
            coupon = Coupon(
                id=f"cpn-{cp['code'].lower()}",
                code=cp["code"],
                coupon_type=cp["type"],
                discount_value=cp["value"],
                max_discount_cap_tomans=cp["max_cap"],
                min_order_amount_tomans=cp["min_order"],
                is_active=True,
                usage_limit=1000,
                remaining_usage=1000,
                valid_until=datetime.now(timezone.utc) + timedelta(days=90),
            )
            db.add(coupon)

        await db.commit()
        print("[+] SUCCESS: Production database successfully seeded with all realistic entities!")


if __name__ == "__main__":
    asyncio.run(seed_all_production_data())
