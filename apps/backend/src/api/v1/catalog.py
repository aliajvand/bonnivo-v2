from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.catalog import CanonicalProduct, Category, SellerOffer, Seller, ProductImage, ProductReview, ProductVariant
from src.models.order import Order, OrderItem, OrderStatus
from src.models.pet import PetSpecies

router = APIRouter(prefix="/catalog", tags=["Catalog & Buy Box"])


class SellerOfferResponse(BaseModel):
    id: str
    seller_id: str
    store_name_fa: str
    price_tomans: int
    stock_quantity: int
    is_buy_box_winner: bool


class ProductImageResponse(BaseModel):
    id: str
    url: str
    thumbnail_url: Optional[str] = None
    alt_text: Optional[str] = None
    is_primary: bool = False
    display_order: int = 0


class ProductVariantResponse(BaseModel):
    id: str
    title_fa: str
    sku: Optional[str] = None
    weight_grams: Optional[int] = None
    price_tomans: int
    old_price_tomans: Optional[int] = None
    discount_percent: Optional[int] = None
    stock_quantity: int = 0
    lead_time_days: int = 0


class CanonicalProductResponse(BaseModel):
    id: str
    category_slug: str
    title_fa: str
    slug: str
    sku: Optional[str] = None
    brand: Optional[str] = None
    target_species: PetSpecies
    description_fa: Optional[str] = None
    short_description_fa: Optional[str] = None
    package_weight_grams: Optional[int] = None
    price_tomans: Optional[int] = None
    old_price_tomans: Optional[int] = None
    discount_percent: Optional[int] = None
    stock_quantity: int = 0
    lead_time_days: int = 0
    size: Optional[str] = None
    flavor: Optional[str] = None
    color: Optional[str] = None
    life_stage: Optional[str] = None
    health_tags: Optional[str] = None
    primary_image_url: Optional[str] = None
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []
    rating_avg: float = 5.0
    rating_count: int = 0
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    buy_box_offer: Optional[SellerOfferResponse] = None
    alternative_offers: List[SellerOfferResponse] = []


class ReviewSubmitPayload(BaseModel):
    rating: int = Field(ge=1, le=5, description="1 to 5 stars")
    title: str = Field(min_length=2, max_length=150)
    comment: str = Field(min_length=5)


class ReviewResponse(BaseModel):
    id: str
    user_name: str
    rating: int
    title: str
    comment: str
    is_verified_purchase: bool
    created_at: str


def calculate_buy_box(offers: List[SellerOffer]) -> tuple[Optional[SellerOfferResponse], List[SellerOfferResponse]]:
    in_stock = [o for o in offers if o.is_active and o.stock_quantity > 0]
    if not in_stock:
        return None, []

    sorted_offers = sorted(in_stock, key=lambda o: (o.price_tomans, -o.stock_quantity))
    winner = sorted_offers[0]
    alternatives = sorted_offers[1:]

    winner_resp = SellerOfferResponse(
        id=winner.id,
        seller_id=winner.seller_id,
        store_name_fa=winner.seller.store_name_fa if winner.seller else "بونیوو اکسپرس",
        price_tomans=winner.price_tomans,
        stock_quantity=winner.stock_quantity,
        is_buy_box_winner=True,
    )

    alt_resps = [
        SellerOfferResponse(
            id=o.id,
            seller_id=o.seller_id,
            store_name_fa=o.seller.store_name_fa if o.seller else "فروشنده متفرقه",
            price_tomans=o.price_tomans,
            stock_quantity=o.stock_quantity,
            is_buy_box_winner=False,
        )
        for o in alternatives
    ]

    return winner_resp, alt_resps


@router.get("/brands", response_model=List[str])
async def list_available_brands(db: AsyncSession = Depends(get_db)):
    """
    Item 7: SHOP - BRAND FILTER: Returns distinct database-backed brands.
    """
    stmt = (
        select(distinct(CanonicalProduct.brand))
        .where(
            CanonicalProduct.is_active == True,
            CanonicalProduct.brand != None,
            CanonicalProduct.brand != "",
        )
        .order_by(CanonicalProduct.brand.asc())
    )
    res = await db.execute(stmt)
    brands = [b for b in res.scalars().all() if b]
    return brands


@router.get("/products", response_model=List[CanonicalProductResponse])
async def list_products(
    species: Optional[PetSpecies] = None,
    category_slug: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CanonicalProduct)
        .options(
            selectinload(CanonicalProduct.category),
            selectinload(CanonicalProduct.images),
            selectinload(CanonicalProduct.variants),
            selectinload(CanonicalProduct.offers).selectinload(SellerOffer.seller),
        )
        .where(CanonicalProduct.is_active == True)
    )

    if species:
        stmt = stmt.where(CanonicalProduct.target_species == species)
    if brand:
        stmt = stmt.where(CanonicalProduct.brand == brand)
    if search:
        stmt = stmt.where(CanonicalProduct.title_fa.contains(search) | CanonicalProduct.brand.contains(search))

    res = await db.execute(stmt)
    products = res.scalars().all()

    output = []
    for p in products:
        if category_slug and p.category.slug != category_slug:
            continue
        winner, alts = calculate_buy_box(p.offers)
        output.append(
            CanonicalProductResponse(
                id=p.id,
                category_slug=p.category.slug if p.category else "general",
                title_fa=p.title_fa,
                slug=p.slug,
                sku=p.sku,
                brand=p.brand,
                target_species=p.target_species,
                description_fa=p.description_fa,
                short_description_fa=p.short_description_fa,
                package_weight_grams=p.package_weight_grams,
                price_tomans=p.price_tomans or (winner.price_tomans if winner else 0),
                old_price_tomans=p.old_price_tomans,
                discount_percent=p.discount_percent,
                stock_quantity=p.stock_quantity or (winner.stock_quantity if winner else 0),
                lead_time_days=p.lead_time_days,
                size=p.size,
                flavor=p.flavor,
                color=p.color,
                life_stage=p.life_stage,
                health_tags=p.health_tags,
                primary_image_url=p.primary_image_url or (p.images[0].image_url if p.images else "/icons/food.png"),
                images=[
                    ProductImageResponse(
                        id=img.id,
                        url=img.image_url,
                        thumbnail_url=img.thumbnail_url,
                        alt_text=img.alt_text,
                        is_primary=img.is_primary,
                        display_order=img.display_order,
                    )
                    for img in p.images
                ],
                variants=[
                    ProductVariantResponse(
                        id=v.id,
                        title_fa=v.title_fa,
                        sku=v.sku,
                        weight_grams=v.weight_grams,
                        price_tomans=v.price_tomans,
                        old_price_tomans=v.old_price_tomans,
                        discount_percent=v.discount_percent,
                        stock_quantity=v.stock_quantity,
                        lead_time_days=v.lead_time_days,
                    )
                    for v in p.variants
                    if v.is_active
                ],
                rating_avg=p.rating_avg,
                rating_count=p.rating_count,
                seo_title=p.seo_title,
                seo_description=p.seo_description,
                buy_box_offer=winner,
                alternative_offers=alts,
            )
        )
    return output


@router.get("/products/{slug}", response_model=CanonicalProductResponse)
async def get_product_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CanonicalProduct)
        .options(
            selectinload(CanonicalProduct.category),
            selectinload(CanonicalProduct.images),
            selectinload(CanonicalProduct.variants),
            selectinload(CanonicalProduct.offers).selectinload(SellerOffer.seller),
        )
        .where(CanonicalProduct.slug == slug)
    )
    res = await db.execute(stmt)
    p = res.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="محصول یافت نشد.")

    winner, alts = calculate_buy_box(p.offers)
    return CanonicalProductResponse(
        id=p.id,
        category_slug=p.category.slug if p.category else "general",
        title_fa=p.title_fa,
        slug=p.slug,
        sku=p.sku,
        brand=p.brand,
        target_species=p.target_species,
        description_fa=p.description_fa,
        short_description_fa=p.short_description_fa,
        package_weight_grams=p.package_weight_grams,
        price_tomans=p.price_tomans or (winner.price_tomans if winner else 0),
        old_price_tomans=p.old_price_tomans,
        discount_percent=p.discount_percent,
        stock_quantity=p.stock_quantity or (winner.stock_quantity if winner else 0),
        lead_time_days=p.lead_time_days,
        size=p.size,
        flavor=p.flavor,
        color=p.color,
        life_stage=p.life_stage,
        health_tags=p.health_tags,
        primary_image_url=p.primary_image_url or (p.images[0].image_url if p.images else "/icons/food.png"),
        images=[
            ProductImageResponse(
                id=img.id,
                url=img.image_url,
                thumbnail_url=img.thumbnail_url,
                alt_text=img.alt_text,
                is_primary=img.is_primary,
                display_order=img.display_order,
            )
            for img in p.images
        ],
        variants=[
            ProductVariantResponse(
                id=v.id,
                title_fa=v.title_fa,
                sku=v.sku,
                weight_grams=v.weight_grams,
                price_tomans=v.price_tomans,
                old_price_tomans=v.old_price_tomans,
                discount_percent=v.discount_percent,
                stock_quantity=v.stock_quantity,
                lead_time_days=v.lead_time_days,
            )
            for v in p.variants
            if v.is_active
        ],
        rating_avg=p.rating_avg,
        rating_count=p.rating_count,
        seo_title=p.seo_title,
        seo_description=p.seo_description,
        buy_box_offer=winner,
        alternative_offers=alts,
    )


@router.post("/products/{product_id}/reviews", status_code=status.HTTP_201_CREATED)
async def submit_product_review(
    product_id: str,
    payload: ReviewSubmitPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(CanonicalProduct, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد.")

    q_order = (
        select(Order)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .join(SellerOffer, SellerOffer.id == OrderItem.offer_id)
        .where(
            Order.user_id == current_user.id,
            SellerOffer.product_id == product_id,
            Order.status.in_([OrderStatus.PAID, OrderStatus.DELIVERED]),
        )
    )
    res_order = await db.execute(q_order)
    order = res_order.scalars().first()

    review = ProductReview(
        product_id=product_id,
        user_id=current_user.id,
        order_id=order.id if order else None,
        rating=payload.rating,
        title=payload.title,
        comment=payload.comment,
        is_verified_purchase=order is not None,
        moderation_status="APPROVED" if (order is not None or current_user.role == "ADMIN") else "PENDING",
    )
    db.add(review)

    q_all_rev = select(ProductReview).where(
        ProductReview.product_id == product_id,
        ProductReview.moderation_status.in_(["APPROVED", "PENDING"]),
    )
    res_all_rev = await db.execute(q_all_rev)
    all_revs = res_all_rev.scalars().all()
    all_ratings = [r.rating for r in all_revs] + [payload.rating]
    product.rating_count = len(all_ratings)
    product.rating_avg = round(sum(all_ratings) / len(all_ratings), 1)

    await db.commit()
    await db.refresh(review)

    return {
        "status": "success",
        "message": "دیدگاه شما با موفقیت ثبت شد." if review.moderation_status == "APPROVED" else "دیدگاه شما ثبت و پس از تأیید ناظر منتشر می‌شود.",
        "review_id": review.id,
        "is_verified_purchase": review.is_verified_purchase,
        "moderation_status": review.moderation_status,
    }


@router.get("/products/{product_id}/reviews", response_model=List[ReviewResponse])
async def list_product_reviews(
    product_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ProductReview)
        .options(selectinload(ProductReview.user))
        .where(
            ProductReview.product_id == product_id,
            ProductReview.moderation_status == "APPROVED",
        )
        .order_by(ProductReview.created_at.desc())
    )
    res = await db.execute(stmt)
    reviews = res.scalars().all()

    return [
        ReviewResponse(
            id=r.id,
            user_name=r.user.full_name or "کاربر بونیوو",
            rating=r.rating,
            title=r.title,
            comment=r.comment,
            is_verified_purchase=r.is_verified_purchase,
            created_at=r.created_at.strftime("%Y-%m-%d"),
        )
        for r in reviews
    ]
