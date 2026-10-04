"use client";

import React, { useState } from "react";
import {
  Scale,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Clock,
  RotateCcw,
  CheckCircle2,
  Stethoscope,
  Building,
  Home,
  GraduationCap,
  Calendar,
  Wallet,
  Tag,
  Shield,
  Search,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TermsSection {
  id: number;
  slug: string;
  category: "GENERAL" | "COMMERCE" | "HEALTH" | "SERVICES" | "FINANCE" | "LEGAL";
  title: string;
  content: string[];
  keyPoints?: string[];
  callout?: {
    type: "INFO" | "WARNING" | "CRITICAL";
    title: string;
    text: string;
  };
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 1,
    slug: "definitions",
    category: "GENERAL",
    title: "۱. تعاریف اولیه و شمول توافق‌نامه",
    content: [
      "سامانه جامع «بونیو» (BONNIVO) بستری یکپارچه متشکل از پلتفرم فروشگاهی، سامانه‌های کلینیکی، رزرو پانسیون، مربیان و پرونده الکترونیک سلامت حیوانات خانگی است.",
      "کاربر به هر شخص حقیقی یا حقوقی اطلاق می‌شود که از طریق وب‌سایت یا اپلیکیشن‌های بونیو نسبت به ثبت‌نام، مشاهده، خرید کالا، رزرو خدمات یا تعامل با دیگر کاربران اقدام نماید.",
      "استفاده از هر یک از بخش‌های بونیو به منزله مطالعه دقیق، آگاهی کامل و پذیرش بدون قید و شرط کلیه مفاد این سند حقوقی است.",
    ],
    keyPoints: ["پوشش کلیه وب‌سایت‌ها و اپلیکیشن‌ها", "پذیرش ضمنی در لحظه ثبت‌نام", "تابعیت از قوانین تجارت الکترونیک"],
  },
  {
    id: 2,
    slug: "accounts-kyc",
    category: "GENERAL",
    title: "۲. شرایط عضویت، احراز هویت و امنیت حساب کاربری",
    content: [
      "ثبت‌نام در بونیو از طریق کد یک‌بارمصرف (OTP) به شماره همراه معتبر و متعلق به متقاضی صورت می‌پذیرد.",
      "مسئولیت حفظ محرمانگی نشست کاربری، عدم واگذاری سیم‌کارت و هرگونه اقدام انجام‌شده با شماره ثبت‌شده مستقیماً متوجه صاحب شماره تلفن همراه است.",
      "جهت عملیات مالی حساس (نظیر برداشت وجه از کیف پول یا افتتاح پنل فروشندگی)، احراز هویت بر پایه کدملی و تطبیق آن با سامانه شاهکار الزامی است.",
    ],
  },
  {
    id: 3,
    slug: "marketplace-authenticity",
    category: "COMMERCE",
    title: "۳. قوانین بازارگاه چندفروشندگی و اصالت کالا",
    content: [
      "بونیو به عنوان بازارگاه (Marketplace) میزبان پت‌شاپ‌ها، واردکنندگان رسمی و توزیع‌کنندگان مجاز ملزومات حیوانات خانگی است.",
      "عرضه هرگونه کالای تقلبی، های‌کپی بدون درج عنوان صریح، فاقد تاریخ مصرف معتبر، یا قاچاق اکیداً ممنوع بوده و کشف آن موجب مسدودسازی فوری فروشگاه و جریمه نقدی خواهد شد.",
      "تمامی خوراک‌ها و مکمل‌های غذایی باید دارای حداقل ۶ ماه مهلت انقضا در زمان تحویل به خریدار باشند، مگر آنکه در عنوان کالا تاریخ کمتر صراحتاً قید و تخفیف ویژه اعمال شده باشد.",
    ],
    callout: {
      type: "CRITICAL",
      title: "خط قرمز اصالت خوراک و دارو",
      text: "فروش غذاهای تاریخ‌گذشته یا پلمپ مخدوش علاوه بر تعلیق حساب فروشنده، بلافاصله به سازمان دامپزشکی کشور گزارش خواهد شد.",
    },
  },
  {
    id: 4,
    slug: "seller-obligations",
    category: "COMMERCE",
    title: "۴. تعهدات و نظارت بر فروشندگان و تامین‌کنندگان",
    content: [
      "فروشندگان متعهد به ثبت دقیق موجودی، قیمت مصوب و مشخصات دقیق اوزان و واریانت‌های محصولات هستند.",
      "امتیاز رضایت فروشگاه بر اساس تاخیر در تحویل، نرخ لغو سفارش و شکایات کیفی محاسبه شده و در صورت افت به زیر ۳.۸ از ۵، پنل فروشنده به حالت تعلیق درمی‌آید.",
    ],
  },
  {
    id: 5,
    slug: "split-shipments",
    category: "COMMERCE",
    title: "۵. تفکیک خودکار مرسولات و انبارداری مستقل",
    content: [
      "با توجه به ساختار چندتامین‌کننده‌ای بونیو، در صورتی که اقلام سبد خرید کاربر از چندین فروشنده یا شهر مختلف تامین شود، سبد به بسته‌های مجزا تفکیک خواهد شد.",
      "هزینه و زمان‌بندی ارسال برای هر مرسوله به صورت شفاف در مرحله پیش‌فاکتور به اطلاع خریدار رسیده و هر بسته دارای کد رهگیری مستقل خواهد بود.",
    ],
  },
  {
    id: 6,
    slug: "lead-times",
    category: "COMMERCE",
    title: "۶. زمان آماده‌سازی کالا، ارسال و بازه‌های تحویل",
    content: [
      "برخی اقلام خاص (مانند خوراک‌های دست‌ساز تازه، تشویقی‌های طبیعی یا ملزومات سفارشی) نیازمند زمان آماده‌سازی (Lead Time) بین ۱ الی ۳ روز کاری هستند.",
      "در سفارش‌های حاوی اقلام نیازمند آماده‌سازی، تقویم انتخاب زمان تحویل بر مبنای طولانی‌ترین زمان آماده‌سازی (Max Lead Time) به طور خودکار تنظیم می‌گردد.",
    ],
  },
  {
    id: 7,
    slug: "quality-guarantee",
    category: "COMMERCE",
    title: "۷. تضمین اصالت و ضمانت سلامت ۴ ساعته (4-Hour Guarantee)",
    content: [
      "به منظور صیانت از سلامت تغذیه‌ای حیوانات، خریداران ملزم هستند ظرف حداکثر ۴ ساعت پس از تحویل بسته، اصالت پلمپ، تاریخ مصرف و سلامت ظاهری خوراک یا مکمل را بررسی نمایند.",
      "در صورت وجود هرگونه پارگی بسته‌بندی، تغییر بو، فساد یا مغایرت تاریخ، ثبت شکایت ظرف ۴ ساعت تضمین‌کننده عودت ۱۰۰٪ وجه به کیف پول و مرجوعی فوری توسط سفیر بونیو است.",
    ],
    callout: {
      type: "INFO",
      title: "مهلت طلایی ۴ ساعته سلامت",
      text: "خوراک‌های تاریخ‌مصرف‌دار و داروها به دلیل حساسیت‌های بیولوژیک، پس از انقضای ۴ ساعت اولیه قابل استرداد نخواهند بود.",
    },
  },
  {
    id: 8,
    slug: "disputes-returns",
    category: "COMMERCE",
    title: "۸. فرآیند استرداد کالا و ثبت شکایات",
    content: [
      "ثبت درخواست مرجوعی از بخش رهگیری سفارشات پنل کاربری امکان‌پذیر است.",
      "کالاهای فاسدنشدنی (مانند قلاده، باکس، ظرف خاک و اسباب‌بازی) در صورت عدم استفاده و حفظ برچسب‌های کارخانه تا ۷ روز کاری طبق قانون تجارت الکترونیک قابل استرداد هستند.",
    ],
  },
  {
    id: 9,
    slug: "wsava-standards",
    category: "HEALTH",
    title: "۹. استانداردهای خدمات دامپزشکی و پروتکل‌های WSAVA",
    content: [
      "کلیه مراکز درمانی، کلینیک‌ها و بیمارستان‌های فعال در بونیو متعهد به رعایت پروتکل‌های جهانی انجمن دامپزشکی حیوانات کوچک (WSAVA) در معاینات، ایمن‌سازی و کنترل درد هستند.",
      "ثبت گزارش‌های پرونده و واکسیناسیون باید منطبق بر گایدلاین‌های رسمی سازمان نظام دامپزشکی صورت پذیرد.",
    ],
  },
  {
    id: 10,
    slug: "clinic-liability",
    category: "HEALTH",
    title: "۱۰. مسئولیت‌ها و حدود تعهدات کلینیک‌ها و دامپزشکان",
    content: [
      "بونیو پلتفرم واسط رزرواسیون و مدیریت پرونده است و مسئولیت تشخیص‌های پزشکی، مداخلات جراحی و نتایج درمانی مستقیماً متوجه دامپزشک معالج و کلینیک متبوع می‌باشد.",
      "ثبت نسخه‌ها و توصیه‌های دارویی صرفاً توسط دامپزشکان تاییدصلاحیت‌شده دارای پروانه معتبر نظام دامپزشکی مجاز است.",
    ],
  },
  {
    id: 11,
    slug: "appointment-cancellations",
    category: "HEALTH",
    title: "۱۱. سیاست کنسلی پلکانی نوبت‌های دامپزشکی",
    content: [
      "جهت حمایت از وقت پزشکان و احترام به حقوق سایر مراجعان نیازمند درمان، لغو نوبت‌های رزروشده مشمول سیاست بازپرداخت پلکانی زیر است:",
      "بیش از ۷۲ ساعت مانده به نوبت: استرداد ۱۰۰٪ مبلغ به کیف پول بونیو بدون کسر جریمه.",
      "بین ۴۸ تا ۷۲ ساعت مانده به نوبت: کسر ۱۰٪ هزینه رزرو و واریز ۹۰٪ به کیف پول کاربر.",
      "کمتر از ۴۸ ساعت مانده به نوبت: کسر ۲۰٪ هزینه کنسلی و واریز ۸۰٪ باقی‌مانده به کیف پول کاربر.",
      "پس از آغاز بازه نوبت، لغو امکان‌پذیر نبوده و وجه پرداختی غیرقابل استرداد است.",
    ],
    callout: {
      type: "WARNING",
      title: "قانون استرداد به کیف پول",
      text: "کلیه مبالغ ناشی از کنسلی نوبت‌های کلینیکی مستقیماً و در لحظه به کیف پول ریالی بونیو شارژ می‌گردد.",
    },
  },
  {
    id: 12,
    slug: "digital-passport",
    category: "HEALTH",
    title: "۱۲. پرونده و شناسنامه سلامت دیجیتال (Pet Passport)",
    content: [
      "شناسنامه دیجیتال بونیو ابزار رسمی مالک جهت ثبت واکسن‌ها، درمان‌های ضدانگلی، سوابق جراحی، رژیم غذایی و اطلاعات میکروچیپ حیوان خانگی است.",
      "مالک می‌تواند در هر زمان دسترسی پرونده را از طریق کیوآرکد به پزشک معالج یا متصدی پانسیون ارائه دهد.",
    ],
  },
  {
    id: 13,
    slug: "privacy-vet-records",
    category: "HEALTH",
    title: "۱۳. حریم خصوصی، محرمانگی اطلاعات و سوابق پزشکی",
    content: [
      "به منظور حفظ اسرار شغلی و محرمانگی هویت پزشکان در جابه‌جایی پرونده‌ها، در خط‌زمانی وقایع سلامت (Health Activity Timeline) اطلاعات هویتی و اسامی پزشکان به صورت عمومی منتشر نشده و تمرکز صرفاً بر مستندات درمانی و دارویی است.",
      "اطلاعات مالکان و شماره‌های تماس به هیچ وجه در اختیار اشخاص ثالث غیرمرتبط با فرآیند خدمت قرار نخواهد گرفت.",
    ],
  },
  {
    id: 14,
    slug: "boarding-terms",
    category: "SERVICES",
    title: "۱۴. قوانین رزرو پانسیون، هتلینگ و نگهداری موقت",
    content: [
      "رزرو اقامتگاه‌های پت صرفاً پس از تایید سلامت فیزیکی حیوان و عدم وجود علائم بیماری مسری در هنگام پذیرش نهایی خواهد شد.",
      "پانسیون‌دار موظف به تامین شرایط دمایی استاندارد، تغذیه منطبق بر برنامه مالک و ارسال منظم گزارش وضعیت به همراه تصویر/ویدیو است.",
    ],
  },
  {
    id: 15,
    slug: "boarding-vaccines",
    category: "SERVICES",
    title: "۱۵. الزامات بهداشتی و واکسیناسیون پانسیون",
    content: [
      "پذیرش در کلیه مراکز اقامتی و پانسیون‌ها مشروط به ارائه شناسنامه سلامت معتبر بونیو و تزریق واکسن‌های هاری و چندگانه (DHPPi برای سگ‌ها و Tricat برای گربه‌ها) حداکثر تا ۱ سال قبل است.",
      "انجام ضدانگل خوراکی ظرف ۳۰ روز گذشته جهت ورود به محوطه پانسیون الزامی است.",
    ],
    callout: {
      type: "CRITICAL",
      title: "ایمنی سایر مهمانان پانسیون",
      text: "پذیرش هر حیوانی بدون ثبت واکسیناسیون معتبر در شناسنامه دیجیتال، تخلف اداری پانسیون تلقی شده و موجب جریمه خواهد بود.",
    },
  },
  {
    id: 16,
    slug: "trainer-services",
    category: "SERVICES",
    title: "۱۶. خدمات مربیان و آموزش رفتارشناسی پت",
    content: [
      "مربیان موظف به بهره‌گیری از متدهای آموزش مبتنی بر تشویق مثبت (Positive Reinforcement) بوده و هرگونه تنبیه بدنی یا شوک الکتریکی اکیداً ممنوع است.",
      "برنامه تمرینی ثبت‌شده توسط مربی در بخش تکالیف روزانه به عنوان تکلیف مراقبتی قفل‌شده در پنل مالک نمایش می‌یابد.",
    ],
  },
  {
    id: 17,
    slug: "events-ticketing",
    category: "SERVICES",
    title: "۱۷. قوانین رویدادها، همایش‌ها و کارت ورود دیجیتال",
    content: [
      "برگزارکنندگان رویدادها موظفند قبل از انتشار عمومی، تاییدیه ممیزی مدیریت بونیو را دریافت نمایند.",
      "پس از ثبت‌نام موفق، یک کارت دیجیتال ورود حاوی بارکد رهگیری اختصاصی (با پیشوند BNY-PASS یا BNV-) برای شرکت‌کننده صادر می‌شود که ارائه آن در ورودی رویداد الزامی است.",
    ],
  },
  {
    id: 18,
    slug: "events-civil-liability",
    category: "SERVICES",
    title: "۱۸. مسئولیت مدنی و رفتار حیوانات در رویدادها",
    content: [
      "کنترل رفتار، مهار با قلاده و لیش استاندارد، و نظافت پسماند پت در طول برگزاری رویدادهای عمومی بر عهده سرپرست حیوان است.",
      "در صورت بروز هرگونه آسیب به سایر شرکت‌کنندگان، محیط برگزاری یا سایر حیوانات، مسئولیت مدنی و جبران خسارت به طور کامل متوجه سرپرست پت خواهد بود.",
    ],
  },
  {
    id: 19,
    slug: "wallet-policy",
    category: "FINANCE",
    title: "۱۹. کیف پول بونیو، شارژ و اعتبارات هدیه",
    content: [
      "کیف پول بونیو یک ابزار پرداخت درون‌برنامه‌ای جهت تسهیل خریدها، بازپرداخت خسارات ۴ ساعته و تسویه کنسلی‌ها بدون تاخیر بانکی است.",
      "اعتبارات هدیه یا پاداش‌های بازاریابی دارای مهلت مصرف محدود بوده و قابل تبدیل به وجه نقد یا انتقال به سایر کاربران نمی‌باشند.",
    ],
  },
  {
    id: 20,
    slug: "wallet-withdrawals",
    category: "FINANCE",
    title: "۲۰. فرآیند و زمان‌بندی درخواست برداشت وجه به شبا",
    content: [
      "کاربران می‌توانند موجودی حاصل از بازپرداخت‌ها، فروشندگی یا لغو خدمات را در هر زمان به شماره شبای بانکی منطبق با کدملی ثبت‌شده درخواست نمایند.",
      "چرخه انتقال وجه شامل مراحل ثبت (REQUESTED)، در حال بررسی مالی (PROCESSING) و پرداخت نهایی از طریق حواله پایا/ساتنا (PAID) حداکثر ظرف ۲۴ الی ۴۸ ساعت کاری بانکی انجام خواهد شد.",
    ],
    callout: {
      type: "INFO",
      title: "تطابق نام حساب و کدملی",
      text: "به موجب الزامات مبارزه با پولشویی بانک مرکزی، انتقال وجه صرفاً به شماره شبای به نام شخص صاحب حساب کاربری مقدور است.",
    },
  },
  {
    id: 21,
    slug: "coupons-validation",
    category: "FINANCE",
    title: "۲۱. سیاست کوپن‌های تخفیف و ابطال پس از پرداخت",
    content: [
      "کدهای تخفیف با وارد کردن در سبد خرید صرفاً صحت‌سنجی و مبلغ کسرشده را نمایش می‌دهند و تا زمان پرداخت نهایی در درگاه بانک ابطال (Burn) نخواهند شد.",
      "در صورت لغو سفارش یا تراکنش ناموفق در درگاه، ظرفیت کوپن محفوظ مانده و کاربر می‌تواند مجدداً از آن بهره‌مند گردد.",
    ],
  },
  {
    id: 22,
    slug: "intellectual-property",
    category: "LEGAL",
    title: "۲۲. حقوق مالکیت معنوی، نشان‌های تجاری و محتوا",
    content: [
      "کلیه نشان‌ها، لوگوها، متون، رابط کاربری، هویت بصری، کدهای نرم‌افزاری و الگوریتم‌های هوش مصنوعی بونیو تحت حمایت قوانین مالکیت فکری قرار دارد.",
      "هرگونه مهندسی معکوس، داده‌کاوی غیرمجاز (Scraping) یا کپی‌برداری تجاری از محتوای کاتالوگ پیگرد قانونی خواهد داشت.",
    ],
  },
  {
    id: 23,
    slug: "force-majeure",
    category: "LEGAL",
    title: "۲۳. فورس ماژور و شرایط اضطراری",
    content: [
      "در مواردی نظیر حوادث غیرمترقبه طبیعی، قطعی سراسری اینترنت کشور، اختلالات زیرساخت شتاب بانکی یا شرایط خاص اضطراری، بونیو در حد توان نسبت به محافظت از حقوق کاربران اقدام می‌نماید، لیکن بابت تاخیرهای ناشی از حوادث خارج از کنترل مسئولیتی نخواهد داشت.",
    ],
  },
  {
    id: 24,
    slug: "dispute-arbitration",
    category: "LEGAL",
    title: "۲۴. حل اختلاف، داوری مرضی‌الطرفین و مراجع ذی‌صلاح",
    content: [
      "در صورت بروز هرگونه اختلاف، اولویت با مذاکره مسالمت‌آمیز و رسیدگی در واحد شکایات و داوری داخلی بونیو است.",
      "در صورت عدم حصول توافق ظرف ۱۵ روز کاری، موضوع از طریق مراجع صالح قضایی و اتحادیه‌های صنفی ذی‌ربط در شهر تهران قابل پیگیری قانونی خواهد بود.",
    ],
  },
];

export default function TermsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [openSections, setOpenSections] = useState<number[]>([1, 3, 7, 11, 20]);

  const toggleSection = (id: number) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setOpenSections(TERMS_SECTIONS.map((s) => s.id));
  };

  const collapseAll = () => {
    setOpenSections([]);
  };

  const filteredSections = TERMS_SECTIONS.filter((section) => {
    const matchesSearch =
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (section.keyPoints && section.keyPoints.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCat = selectedCategory === "ALL" || section.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-surface-elevated via-surface to-surface-subtle border border-border/80 p-6 md:p-10 shadow-sm">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
            <Scale className="w-4 h-4" />
            <span>سند حقوقی، شرایط خدمات و تعهدات رسمی</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
            قوانین و مقررات استفاده از اکوسیستم بونیو (BONNIVO)
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            مجموعه قوانین حاکم بر بازارگاه چندفروشندگی، خدمات کلینیکی و دامپزشکی، پرونده الکترونیک سلامت، پانسیون‌ها، رویدادها، کیف پول و سیستم تضمین ۴ ساعته کیفیت، منطبق با مقررات تجارت الکترونیک و سازمان نظام دامپزشکی جمهوری اسلامی ایران.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-muted-foreground">
            <span>نسخه ویرایش: ۲.۴.۰</span>
            <span>•</span>
            <span>تاریخ بازبینی: مهرماه ۱۴۰۵</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">۲۴ بند ساختاریافته رسمی</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در متن قوانین (مثلا: ۴ ساعت، واکسن، شبا...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 bg-surface-elevated border border-border/80 rounded-2xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 transition-colors"
            >
              گسترش همه بندها
            </button>
            <button
              onClick={collapseAll}
              className="text-xs font-bold text-muted-foreground hover:text-foreground bg-surface-elevated px-3 py-1.5 rounded-xl border border-border/60 transition-colors"
            >
              بستن همه
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: "همه ۲۴ بند" },
            { id: "GENERAL", label: "کلیات و حساب" },
            { id: "COMMERCE", label: "بازارگاه و سفارشات" },
            { id: "HEALTH", label: "کلینیک و دامپزشکی" },
            { id: "SERVICES", label: "پانسیون، مربی و رویداد" },
            { id: "FINANCE", label: "کیف پول و تخفیف" },
            { id: "LEGAL", label: "حقوقی و داوری" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0",
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/60"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="p-8 text-center bg-surface-elevated rounded-3xl border border-border/70 text-muted-foreground text-xs">
            بندی مطابق با جستجوی شما یافت نشد. لطفاً عبارت دیگری را جستجو فرمایید.
          </div>
        ) : (
          filteredSections.map((section) => {
            const isOpen = openSections.includes(section.id);
            return (
              <div
                key={section.id}
                id={section.slug}
                className={cn(
                  "rounded-3xl border transition-all overflow-hidden",
                  isOpen
                    ? "bg-surface-elevated border-blue-500/40 shadow-xs"
                    : "bg-surface-elevated/70 border-border/70 hover:border-border"
                )}
              >
                {/* Section Header Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 select-none hover:bg-surface-subtle/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-blue-500/20">
                      {section.id}
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>

                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0",
                      isOpen && "rotate-180 text-blue-600 dark:text-blue-400"
                    )}
                  />
                </button>

                {/* Section Content */}
                {isOpen && (
                  <div className="px-5 pb-6 pt-1 space-y-4 border-t border-border/40 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-2.5">
                      {section.content.map((paragraph, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.keyPoints && section.keyPoints.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {section.keyPoints.map((kp, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-subtle border border-border/60 text-[11px] font-medium text-foreground"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>{kp}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.callout && (
                      <div
                        className={cn(
                          "p-4 rounded-2xl border text-xs space-y-1 mt-2",
                          section.callout.type === "CRITICAL" &&
                            "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
                          section.callout.type === "WARNING" &&
                            "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
                          section.callout.type === "INFO" &&
                            "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
                        )}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          {section.callout.type === "CRITICAL" ? (
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                          ) : section.callout.type === "WARNING" ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                          )}
                          <span>{section.callout.title}</span>
                        </div>
                        <p className="leading-relaxed opacity-90">{section.callout.text}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Support Banner */}
      <div className="p-6 rounded-3xl bg-surface-subtle border border-border/70 text-center space-y-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          سوالی در رابطه با قوانین یا شرایط خدمات دارید؟ تیم حقوقی و پشتیبانی ۲۴ ساعته بونیو همواره در کنار شماست.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-blue-600 dark:text-blue-400 pt-1">
          <span>تلفن پشتیبانی: ۰۲۱-۹۱۰۰۰۰۰۰</span>
          <span>•</span>
          <span>ایمیل حقوقی: legal@bonnivo.com</span>
        </div>
      </div>
    </div>
  );
}
