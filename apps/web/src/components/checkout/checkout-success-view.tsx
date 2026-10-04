"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  CheckCircle2, 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  Sparkles, 
  HeartHandshake, 
  Clock, 
  Truck,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

import { useSearchParams } from "next/navigation";

export function CheckoutSuccessView() {
  const { lastOrder } = useCart();
  const searchParams = useSearchParams();
  const urlOrderId = searchParams?.get("order_id");
  const urlRefId = searchParams?.get("ref_id");

  // If there's no last order and no url parameters confirming payment
  if ((!lastOrder || lastOrder.paymentStatus !== "paid") && !urlOrderId) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 text-center space-y-5" dir="rtl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-foreground">
          اطلاعات پرداخت موفق یافت نشد
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          سفارش شما در حالت انتظار یا لغو پرداخت قرار دارد یا هنوز از درگاه بانکی به این صفحه هدایت نشده‌اید.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition-all"
          >
            <span>بازگشت به تسویه‌حساب</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-subtle text-foreground text-xs font-medium border border-border"
          >
            مشاهده فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  const order = lastOrder || {
    orderId: urlOrderId || "ord-server",
    orderNumber: urlOrderId ? `BNY-${urlOrderId.slice(0, 8)}` : "BNY-100200",
    createdAt: new Date().toLocaleDateString("fa-IR"),
    items: [],
    subtotalToman: 0,
    discountToman: 0,
    shippingFeeToman: 0,
    totalPaidToman: 0,
    deliveryDateStr: "تحویل روز جاری یا فردا",
    deliveryShiftLabel: "شیفت اختصاصی تهران",
    recipientName: "مشتری گرامی بونیو",
    recipientPhone: "ثبت‌شده در فاکتور",
    deliveryAddress: "آدرس انتخابی مشتری",
    splitShipments: [],
    beneficiaryPets: [],
    paymentStatus: "paid" as const,
    fulfillmentStage: 1 as const,
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 space-y-6" dir="rtl">
      
      {/* 1. Success Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-lg animate-in zoom-in-90 duration-300">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
          پرداخت با موفقیت انجام شد ✓
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
          سفارش شما با موفقیت در بونیو ثبت شد!
        </h1>

        <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
          پیامک تأیید سفارش و لینک پیگیری لحظه‌ای برای شماره {order.recipientPhone} ارسال گردید.
        </p>

        <div className="inline-flex flex-wrap items-center justify-center gap-4 px-4 py-2 rounded-2xl bg-surface-subtle border border-border text-xs">
          <div>
            <span className="text-muted">شماره سفارش:</span>
            <span className="font-mono font-black text-primary text-sm tracking-wider ms-1.5">{order.orderNumber}</span>
          </div>
          {urlRefId && (
            <div className="border-s border-border ps-4">
              <span className="text-muted">کد رهگیری شاپرک:</span>
              <span className="font-mono font-bold text-emerald-600 ms-1.5">{urlRefId}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Beneficiary Pets & Auto Care Routine Setup */}
      {order.beneficiaryPets && order.beneficiaryPets.length > 0 && (
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-primary/20 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <HeartHandshake className="w-5 h-5 text-terracotta" />
            <h2>پت‌های منتفع از این سفارش و برنامه مصرف هوشمند</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {order.beneficiaryPets.map((pet) => (
              <div 
                key={pet.petId}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-subtle border border-border/80"
              >
                <div className="w-12 h-12 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 border border-border">
                  <Image src={pet.petAvatar} alt={pet.petName} width={32} height={32} className="object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">{pet.petName}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {pet.itemsCount} قلم کالا اختصاص داده شد
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>برنامه مصرف هوشمند فعال شد:</strong> با توجه به وزن بسته و الگوی مصرف روزانه، زمان اتمام خوراک محاسبه شده و ۷ روز قبل از اتمام، پیامک یادآور شارژ مجدد ارسال خواهد شد.
            </p>
          </div>
        </div>
      )}

      {/* 3. Delivery Schedule & Details Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-border/80 shadow-xs space-y-4">
        <h3 className="font-black text-sm text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <span>اطلاعات زمان تحویل و نشانی</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>زمان‌بندی تحویل پیک تهران:</span>
            </span>
            <span className="font-bold text-foreground text-sm block">
              {order.deliveryShiftLabel}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-muted block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span>نشانی تحویل‌گیرنده:</span>
            </span>
            <span className="font-bold text-foreground block">
              {order.deliveryAddress}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-muted block">نام تحویل‌گیرنده:</span>
            <span className="font-bold text-foreground block">{order.recipientName}</span>
          </div>

          <div className="space-y-1">
            <span className="text-muted block">مبلغ کل پرداخت‌شده:</span>
            <span className="font-black text-primary text-sm block">
              {order.totalPaidToman.toLocaleString("fa-IR")} تومان
            </span>
          </div>
        </div>
      </div>

      {/* 4. Single Clean Action Link (Removed noisy 3-button block) */}
      <div className="pt-2">
        <Link
          href={`/dashboard/tracking?orderId=${order.orderId}`}
          className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm text-center transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>مشاهده و پیگیری مراحل سفارش در پنل کاربری</span>
        </Link>
      </div>

    </div>
  );
}
