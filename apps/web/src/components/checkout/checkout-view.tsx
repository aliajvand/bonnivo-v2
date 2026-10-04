"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  Layers, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  X,
  Lock,
  RotateCcw,
  Loader2
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { usePet } from "@/context/pet-context";
import { DeliveryTimeslot, OrderConfirmation } from "@/types/cart";
import { cn } from "@/lib/utils";
import { createServerOrderReservation, requestServerPayment } from "@/lib/api/checkout";

export function CheckoutView() {
  const router = useRouter();
  const { 
    items, 
    itemsCount, 
    subtotalToman, 
    totalDiscountToman, 
    shippingFeeToman, 
    grandTotalToman, 
    splitShipments, 
    clearCart, 
    setLastOrder 
  } = useCart();
  const { pets } = usePet();

  // 1. Calculate preparation lead time
  const maxLeadTimeDays = useMemo(() => {
    return Math.max(0, ...items.map((i) => i.leadTimeDays || 0));
  }, [items]);

  // 2. Dynamically generate timeslots based on maxLeadTimeDays
  const dynamicTimeslots = useMemo<DeliveryTimeslot[]>(() => {
    if (maxLeadTimeDays >= 2) {
      // Cannot offer tomorrow! Earliest is 2 days from now (پس‌فردا)
      return [
        {
          id: "slot-lead-day2-morning",
          dateStr: "۱۴۰۳/۰۷/۱۲",
          dayName: "پس‌فردا (جمعه)",
          shift: "MORNING",
          shiftLabel: "شیفت صبح (۹:۰۰ الی ۱۳:۰۰)",
          isAvailable: true,
        },
        {
          id: "slot-lead-day2-afternoon",
          dateStr: "۱۴۰۳/۰۷/۱۲",
          dayName: "پس‌فردا (جمعه)",
          shift: "AFTERNOON",
          shiftLabel: "شیفت عصر (۱۴:۰۰ الی ۱۸:۰۰)",
          isAvailable: true,
        },
        {
          id: "slot-lead-day3-morning",
          dateStr: "۱۴۰۳/۰۷/۱۳",
          dayName: "شنبه",
          shift: "MORNING",
          shiftLabel: "شیفت صبح (۹:۰۰ الی ۱۳:۰۰)",
          isAvailable: true,
        },
        {
          id: "slot-lead-day3-afternoon",
          dateStr: "۱۴۰۳/۰۷/۱۳",
          dayName: "شنبه",
          shift: "AFTERNOON",
          shiftLabel: "شیفت عصر (۱۴:۰۰ الی ۱۸:۰۰)",
          isAvailable: true,
        },
        {
          id: "slot-lead-day4-morning",
          dateStr: "۱۴۰۳/۰۷/۱۴",
          dayName: "یک‌شنبه",
          shift: "MORNING",
          shiftLabel: "شیفت صبح (۹:۰۰ الی ۱۳:۰۰)",
          isAvailable: true,
        },
      ];
    }

    // Standard items: tomorrow is available
    return [
      {
        id: "slot-tomorrow-morning",
        dateStr: "۱۴۰۳/۰۷/۱۰",
        dayName: "فردا (پنج‌شنبه)",
        shift: "MORNING",
        shiftLabel: "شیفت صبح (۹:۰۰ الی ۱۳:۰۰)",
        isAvailable: true,
      },
      {
        id: "slot-tomorrow-afternoon",
        dateStr: "۱۴۰۳/۰۷/۱۰",
        dayName: "فردا (پنج‌شنبه)",
        shift: "AFTERNOON",
        shiftLabel: "شیفت عصر (۱۴:۰۰ الی ۱۸:۰۰)",
        isAvailable: true,
      },
      {
        id: "slot-tomorrow-evening",
        dateStr: "۱۴۰۳/۰۷/۱۰",
        dayName: "فردا (پنج‌شنبه)",
        shift: "EVENING",
        shiftLabel: "شیفت شب (۱۸:۰۰ الی ۲۱:۰۰)",
        isAvailable: true,
      },
      {
        id: "slot-nextday-morning",
        dateStr: "۱۴۰۳/۰۷/۱۱",
        dayName: "پس‌فردا (جمعه)",
        shift: "MORNING",
        shiftLabel: "شیفت صبح (۹:۰۰ الی ۱۳:۰۰)",
        isAvailable: true,
      },
      {
        id: "slot-nextday-afternoon",
        dateStr: "۱۴۰۳/۰۷/۱۱",
        dayName: "پس‌فردا (جمعه)",
        shift: "AFTERNOON",
        shiftLabel: "شیفت عصر (۱۴:۰۰ الی ۱۸:۰۰)",
        isAvailable: true,
      },
    ];
  }, [maxLeadTimeDays]);

  const CHECKOUT_FORM_KEY = "bonnivo_checkout_form_v1";

  // Form State
  const [fullName, setFullName] = useState("علی ایجرندی");
  const [phoneNumber, setPhoneNumber] = useState("09121234567");
  const [district, setDistrict] = useState("سعادت‌آباد");
  const [address, setAddress] = useState("بلوار سرو غربی، خیابان صدف، مجتمع صدف، پلاک ۱۲، واحد ۴");
  const [deliveryNotes, setDeliveryNotes] = useState("لطفاً پیش از تحویل با شماره همراه تماس گرفته شود.");
  const [selectedSlotId, setSelectedSlotId] = useState<string>(dynamicTimeslots[0]?.id || "");
  const [paymentMethod, setPaymentMethod] = useState<"ZARINPAL_IPG" | "SNAP_PAY" | "WALLET">("ZARINPAL_IPG");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Restore form state from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHECKOUT_FORM_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.fullName) setFullName(data.fullName);
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.district) setDistrict(data.district);
        if (data.address) setAddress(data.address);
        if (data.deliveryNotes) setDeliveryNotes(data.deliveryNotes);
      }
    } catch {
      // Ignore sessionStorage error
    }
  }, []);

  // Save form state to sessionStorage (excluding any payment info)
  useEffect(() => {
    try {
      sessionStorage.setItem(
        CHECKOUT_FORM_KEY,
        JSON.stringify({ fullName, phoneNumber, district, address, deliveryNotes })
      );
    } catch {
      // Ignore quota
    }
  }, [fullName, phoneNumber, district, address, deliveryNotes]);

  const selectedTimeslot = dynamicTimeslots.find((s) => s.id === selectedSlotId) || dynamicTimeslots[0];

  // If cart is empty, redirect to cart
  if (items.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 text-center space-y-4" dir="rtl">
        <h2 className="text-xl font-bold text-foreground">سبد خرید شما خالی است</h2>
        <p className="text-xs text-muted">برای ادامه تسویه‌حساب، ابتدا کالاهایی به سبد خرید خود اضافه کنید.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const handleOpenPaymentGateway = async () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) {
      errors.fullName = "نام و نام خانوادگی تحویل‌گیرنده الزامی است.";
    }
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "شماره موبایل الزامی است.";
    } else if (!/^09\d{9}$/.test(phoneNumber.trim())) {
      errors.phoneNumber = "شماره همراه باید ۱۱ رقم با فرمت ...09 باشد.";
    }
    if (!district.trim()) {
      errors.district = "شهر و محله تحویل الزامی است.";
    }
    if (!address.trim()) {
      errors.address = "نشانی پستی دقیق الزامی است.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("لطفاً خطاهای مشخص‌شده در فرم آدرس را برطرف نمایید.");
      return;
    }

    setFieldErrors({});
    setErrorMessage(null);
    setIsSubmittingOrder(true);

    try {
      // 1. Create server-side atomic reservation
      const reservePayload = {
        items: items.map((i) => ({
          offer_id: i.offerId || i.id,
          quantity: i.quantity,
          pet_id: i.assignedPetId || null,
        })),
        shipping_address: `${district}، ${address} (تحویل‌گیرنده: ${fullName} - تلفن: ${phoneNumber})`,
        shipping_timeslot: selectedTimeslot ? `${selectedTimeslot.dateStr} - ${selectedTimeslot.shiftLabel}` : null,
      };

      const resReserve = await createServerOrderReservation(reservePayload);

      if (!resReserve.success || !resReserve.data?.order_id) {
        setErrorMessage(resReserve.error || "خطا در ثبت و رزرو سفارش در سرور.");
        return;
      }

      // 2. Request official gateway URL from server
      const resPayment = await requestServerPayment(resReserve.data.order_id);
      if (resPayment.success && resPayment.data?.payment_url) {
        window.location.href = resPayment.data.payment_url;
        return;
      } else {
        setErrorMessage(resPayment.error || "خطا در دریافت نشانی درگاه پرداخت از سرور مرکزی.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "خطا در برقراری ارتباط با سامانه تسویه‌حساب سرور.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="w-full space-y-8" dir="rtl">
      
      {/* Title */}
      <div className="border-b border-border/60 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
          تسویه‌حساب و انتخاب زمان تحویل تهران
        </h1>
        <p className="text-xs text-muted mt-1">
          ارسال اختصاصی با پیک زمان‌بندی‌شده بونیو ویژه مناطق ۲۲گانه تهران
        </p>
      </div>

      {/* Preparation Lead Time Warning if maxLeadTimeDays >= 2 */}
      {maxLeadTimeDays >= 2 && (
        <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm block">نیازمند آماده‌سازی اختصاصی ({maxLeadTimeDays} روز کاری)</span>
            <p className="leading-relaxed text-[11px] opacity-90">
              یک یا چند قلم از کالاهای موجود در سبد خرید شما نیازمند {maxLeadTimeDays} روز زمان پخت تازه یا بسته‌بندی در انبار مرکزی هستند. به همین دلیل امکان انتخاب بازه ارسال فردا مقدور نبوده و زودترین موعد تحویل از <strong>پس‌فردا</strong> در دسترس است.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left/Forms Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Tehran Delivery Timeslot Selector */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-border/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Clock className="w-4 h-4" />
              <h2>۱. انتخاب روز و بازه زمانی تحویل تهران (پیک اختصاصی)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {dynamicTimeslots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={cn(
                      "p-3.5 rounded-2xl border text-right transition-all duration-200 relative flex flex-col justify-between gap-2 shadow-2xs",
                      isSelected
                        ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40"
                        : "bg-surface-subtle/80 hover:bg-surface-subtle border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-black", isSelected ? "text-primary" : "text-foreground")}>
                        {slot.dayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {slot.dateStr}
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-muted flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>{slot.shiftLabel}</span>
                    </div>

                    {isSelected && (
                      <span className="absolute top-2.5 start-2.5 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Address & Recipient Info */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-border/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <MapPin className="w-4 h-4" />
              <h2>۲. آدرس تحویل و مشخصات تحویل‌گیرنده</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  نام و نام خانوادگی تحویل‌گیرنده *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    className={cn(
                      "w-full bg-surface-subtle text-xs text-foreground p-3 rounded-2xl border transition-all",
                      fieldErrors.fullName
                        ? "border-rose-500 focus:ring-rose-500/20"
                        : "border-border focus:ring-primary/20 focus:border-primary"
                    )}
                  />
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.fullName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  شماره موبایل جهت هماهنگی پیک *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (fieldErrors.phoneNumber) setFieldErrors((prev) => ({ ...prev, phoneNumber: "" }));
                    }}
                    className={cn(
                      "w-full bg-surface-subtle text-xs text-foreground p-3 pe-9 rounded-2xl border text-right font-mono transition-all",
                      fieldErrors.phoneNumber
                        ? "border-rose-500 focus:ring-rose-500/20"
                        : "border-border focus:ring-primary/20 focus:border-primary"
                    )}
                  />
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
                {fieldErrors.phoneNumber && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.phoneNumber}</span>
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  شهر و محله (تهران) *
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    if (fieldErrors.district) setFieldErrors((prev) => ({ ...prev, district: "" }));
                  }}
                  placeholder="مثلاً: سعادت‌آباد، نیاوران، یوسف‌آباد..."
                  className={cn(
                    "w-full bg-surface-subtle text-xs text-foreground p-3 rounded-2xl border transition-all",
                    fieldErrors.district
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-border focus:ring-primary/20 focus:border-primary"
                  )}
                />
                {fieldErrors.district && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.district}</span>
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  نشانی پستی دقیق (خیابان، کوچه، پلاک، واحد) *
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: "" }));
                  }}
                  className={cn(
                    "w-full bg-surface-subtle text-xs text-foreground p-3 rounded-2xl border resize-none transition-all",
                    fieldErrors.address
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-border focus:ring-primary/20 focus:border-primary"
                  )}
                />
                {fieldErrors.address && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.address}</span>
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  یادداشت برای سفیر / پیک (اختیاری)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="مثلاً: زنگ سوم خراب است، به لابی تحویل دهید"
                  className="w-full bg-surface-subtle text-xs text-foreground p-3 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* 3. Split Shipment Packages Breakdown */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-border/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Layers className="w-4 h-4" />
                <h2>۳. پیش‌نمایش تفکیک مرسوله‌ها (Split Shipment)</h2>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-surface-subtle text-muted-foreground border border-border">
                {splitShipments.length} بسته پستی / پیک
              </span>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              اقلام سبد شما از تأمین‌کنندگان تخصصی بونیو تأمین شده و در قالب بسته‌بندی‌های استاندارد با پیک به دست شما می‌رسد:
            </p>

            <div className="space-y-3 pt-1">
              {splitShipments.map((shipment) => (
                <div
                  key={shipment.sellerId}
                  className="rounded-2xl p-4 bg-surface-subtle/80 border border-border space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-primary" />
                      <span>مرسوله شماره {shipment.packageNumber} — تأمین‌کننده: {shipment.sellerName}</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                      {shipment.estimatedDeliveryText}
                    </span>
                  </div>

                  {/* Items in this shipment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {shipment.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-border/60">
                        <div className="w-9 h-9 rounded-lg bg-surface-subtle p-1 shrink-0 flex items-center justify-center">
                          <Image src={item.imageSrc} alt={item.titleFa} width={28} height={28} className="object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-foreground truncate">{item.titleFa}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {item.quantity} عدد • {item.assignedPetName ? `برای ${item.assignedPetName}` : "عمومی"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Payment Method Selection */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-border/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <CreditCard className="w-4 h-4" />
              <h2>۴. انتخاب روش پرداخت</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("ZARINPAL_IPG")}
                className={cn(
                  "p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 shadow-2xs",
                  paymentMethod === "ZARINPAL_IPG"
                    ? "bg-primary/10 border-primary ring-1 ring-primary/40"
                    : "bg-surface-subtle/80 hover:bg-surface-subtle border-border"
                )}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-black text-sm">
                  زرین
                </div>
                <div>
                  <span className="font-bold text-xs block text-foreground">درگاه زرین‌پال / شاپرک</span>
                  <span className="text-[10px] text-muted-foreground">کلیه کارت‌های عضو شتاب</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("SNAP_PAY")}
                className={cn(
                  "p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 shadow-2xs",
                  paymentMethod === "SNAP_PAY"
                    ? "bg-primary/10 border-primary ring-1 ring-primary/40"
                    : "bg-surface-subtle/80 hover:bg-surface-subtle border-border"
                )}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-700 flex items-center justify-center font-black text-sm">
                  اقساط
                </div>
                <div>
                  <span className="font-bold text-xs block text-foreground">اسنپ‌پی (اقساطی)</span>
                  <span className="text-[10px] text-muted-foreground">پرداخت در ۴ قسط بدون کارمزد</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("WALLET")}
                className={cn(
                  "p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 shadow-2xs",
                  paymentMethod === "WALLET"
                    ? "bg-primary/10 border-primary ring-1 ring-primary/40"
                    : "bg-surface-subtle/80 hover:bg-surface-subtle border-border"
                )}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-black text-sm">
                  کیف
                </div>
                <div>
                  <span className="font-bold text-xs block text-foreground">کیف پول بونیو</span>
                  <span className="text-[10px] text-muted-foreground">برداشت از موجودی بونیو</span>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Right/Order Summary Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          
          <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-md space-y-5">
            
            <h3 className="font-black text-base text-foreground border-b border-border/60 pb-3">
              صورت‌حساب نهایی
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>مجموع اقلام ({itemsCount} کالا):</span>
                <span className="font-bold text-foreground">{subtotalToman.toLocaleString("fa-IR")} تومان</span>
              </div>

              {totalDiscountToman > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-medium">
                  <span>تخفیف کل (شامل کوپن):</span>
                  <span className="font-bold">{totalDiscountToman.toLocaleString("fa-IR")} - تومان</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted-foreground">
                <span>هزینه پیک زمان‌بندی‌شده:</span>
                <span className="font-bold text-foreground">
                  {shippingFeeToman === 0 ? "رایگان" : `${shippingFeeToman.toLocaleString("fa-IR")} تومان`}
                </span>
              </div>

              <div className="pt-2 text-[11px] text-muted border-t border-border/60">
                <span className="block font-medium">زمان تحویل انتخابی:</span>
                <span className="font-bold text-foreground">
                  {selectedTimeslot?.dayName} • {selectedTimeslot?.shiftLabel}
                </span>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-base font-black text-foreground">
                <span>مبلغ نهایی پرداخت:</span>
                <span className="text-xl text-primary font-black">
                  {grandTotalToman.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>

            {/* Submit Payment CTA */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={isSubmittingOrder}
                onClick={handleOpenPaymentGateway}
                className={cn(
                  "w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm text-center transition-all shadow-md flex items-center justify-center gap-2",
                  isSubmittingOrder ? "opacity-75 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95"
                )}
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>در حال اتصال به درگاه بانکی...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>پرداخت امن و ورود به درگاه شاپرک</span>
                  </>
                )}
              </button>

              <Link
                href="/cart"
                className="w-full py-2.5 text-center text-xs text-muted-foreground hover:text-foreground transition-colors block"
              >
                ویرایش اقلام سبد خرید
              </Link>
            </div>

          </div>

          <div className="rounded-2xl p-4 bg-surface-subtle/80 border border-border/60 text-[11px] text-muted leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ضمانت اصالت و سلامت بسته بونیو</span>
            </div>
            <p>
              کلیه مرسوله‌ها با برچسب پلمب امنیتی بونیو ارسال شده و دارای مهلت ۴ ساعته تست و بررسی توسط سرپرست پت می‌باشند.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
