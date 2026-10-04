import { ShopCatalogView } from "@/components/shop/shop-catalog-view";

export const metadata = {
  title: "فروشگاه محصولات و تغذیه پت | بونیو",
  description: "خرید آنلاین انواع غذای خشک، کنسرو، تشویقی، مکمل و اسباب‌بازی سگ و گربه با تضمین کمترین قیمت در جعبه خرید (Buy Box)",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <ShopCatalogView />
    </div>
  );
}
