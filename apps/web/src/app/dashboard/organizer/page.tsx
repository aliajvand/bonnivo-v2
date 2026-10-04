"use client";

import React, { useState } from "react";
import {
  Calendar,
  Ticket,
  Users,
  DollarSign,
  QrCode,
  CheckCircle2,
  PlusCircle,
  MapPin,
  Clock,
  Activity,
  AlertCircle,
  Sparkles,
  FileText,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PetEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  totalCapacity: number;
  ticketsSold: number;
  ticketPriceTomans: number;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
}

interface AttendeeTicket {
  ticketCode: string;
  attendeeName: string;
  petName: string;
  petSpecies: string;
  status: "VALID" | "CHECKED_IN" | "CANCELLED";
}

export default function OrganizerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"events" | "checkin" | "new" | "metrics">("events");
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("۱۴۰۳/۰۸/۲۵");
  const [newEventTime, setNewEventTime] = useState("۱۰:۰۰ الی ۱۳:۰۰");
  const [newEventLocation, setNewEventLocation] = useState("تهران، بوستان گفتگو");
  const [newEventCapacity, setNewEventCapacity] = useState<number>(30);
  const [newEventPrice, setNewEventPrice] = useState<number>(180000);
  const [newEventSpecies, setNewEventSpecies] = useState("DOG");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [eventCreatedNotice, setEventCreatedNotice] = useState<string | null>(null);

  const [events, setEvents] = useState<PetEvent[]>([
    {
      id: "EVT-301",
      title: "همایش بزرگ پیاده‌روی و سگ‌های اجتماعی",
      date: "جمعه، ۲۰ مهر ۱۴۰۳",
      time: "۰۹:۰۰ الی ۱۲:۰۰",
      location: "پارک پردیسان، درب شمالی",
      totalCapacity: 80,
      ticketsSold: 64,
      ticketPriceTomans: 150000,
      status: "UPCOMING",
    },
    {
      id: "EVT-302",
      title: "کارگاه تخصصی تغذیه و مراقبت دندان گربه‌ها",
      date: "پنجشنبه، ۲۶ مهر ۱۴۰۳",
      time: "۱۶:۰۰ الی ۱۸:۳۰",
      location: "سالن همایش هتل المپیک تهران",
      totalCapacity: 45,
      ticketsSold: 42,
      ticketPriceTomans: 220000,
      status: "UPCOMING",
    },
  ]);

  const [attendees, setAttendees] = useState<AttendeeTicket[]>([
    { ticketCode: "TCK-9901", attendeeName: "سارا میرزایی", petName: "تدی", petSpecies: "سگ", status: "VALID" },
    { ticketCode: "TCK-9902", attendeeName: "بهنام کریمی", petName: "آرتور", petSpecies: "سگ", status: "CHECKED_IN" },
    { ticketCode: "TCK-9903", attendeeName: "هدی موسوی", petName: "میلو", petSpecies: "گربه", status: "VALID" },
  ]);

  const handleSimulateCheckin = () => {
    if (!scanInput.trim()) return;
    const found = attendees.find((a) => a.ticketCode.toLowerCase() === scanInput.trim().toLowerCase());
    if (!found) {
      setScanResult("بلیت نامعتبر است یا در این رویداد ثبت نشده است.");
      return;
    }
    if (found.status === "CHECKED_IN") {
      setScanResult(`هشدار: بلیت ${found.ticketCode} متعلق به ${found.attendeeName} قبلاً اسکن شده است!`);
      return;
    }
    setAttendees((prev) =>
      prev.map((a) => (a.ticketCode === found.ticketCode ? { ...a, status: "CHECKED_IN" } : a))
    );
    setScanResult(`ورود تأیید شد: ${found.attendeeName} همراه با پت (${found.petName})`);
    setScanInput("");
  };

  const handleGenerateSeo = () => {
    setIsGeneratingSeo(true);
    setTimeout(() => {
      setNewEventTitle("کارگاه تخصصی کاهش اضطراب و پارس سگ‌های آپارتمانی در تهران");
      setNewEventDescription("رویداد تعاملی ویژه سرپرستان سگ جهت یادگیری متدهای نوین رفتارشناسی، کاهش واکنش‌پذیری به زنگ در و همزیستی مسالمت‌آمیز در مجتمع‌های مسکونی تهران با همراهی مربیان برتر آکادمی بونیو.");
      setIsGeneratingSeo(false);
    }, 600);
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const created: PetEvent = {
      id: `EVT-${Math.floor(400 + Math.random() * 500)}`,
      title: newEventTitle.trim(),
      date: newEventDate,
      time: newEventTime,
      location: newEventLocation,
      totalCapacity: newEventCapacity,
      ticketsSold: 0,
      ticketPriceTomans: newEventPrice,
      status: "UPCOMING",
    };

    setEvents((prev) => [created, ...prev]);
    setEventCreatedNotice(`رویداد «${created.title}» با وضعیت پیش‌نویس (DRAFT / در صف بررسی ناظر بونیو) با موفقیت ثبت شد.`);
    setActiveTab("events");
    setNewEventTitle("");
    setNewEventDescription("");
    setTimeout(() => setEventCreatedNotice(null), 6000);
  };

  const totalRevenue = events.reduce((sum, e) => sum + e.ticketsSold * e.ticketPriceTomans, 0);
  const totalSold = events.reduce((sum, e) => sum + e.ticketsSold, 0);
  const totalCapacity = events.reduce((sum, e) => sum + e.totalCapacity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-surface-elevated/80 dark:bg-slate-900/60 p-5 rounded-3xl border border-border/80 backdrop-blur-xl shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-foreground">
                میز کار برگزارکننده رویدادهای بونیو
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                باشگاه پت‌های پایتخت
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              مدیریت همایش‌ها، ظرفیت، بلیت‌فروشی و اسکن QR ورود شرکت‌کنندگان
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-surface-subtle p-1 rounded-2xl border border-border/60 text-xs font-bold">
          <button
            onClick={() => setActiveTab("events")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all",
              activeTab === "events"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            رویدادهای من ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("checkin")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all",
              activeTab === "checkin"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            اسکن و ورود بلیت
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all",
              activeTab === "metrics"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            آمار فروش و بلیت
          </button>
        </div>
      </div>

      {/* Scoped KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">بلیت‌های فروخته‌شده</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">
              {totalSold} <span className="text-xs text-muted-foreground font-normal">از {totalCapacity}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">درآمد بلیت‌فروشی</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">
              {totalRevenue.toLocaleString("fa-IR")}{" "}
              <span className="text-xs text-muted-foreground font-normal">تومان</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">نرخ تکمیل ظرفیت</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">
              {Math.round((totalSold / totalCapacity) * 100)}٪
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Notice if event created */}
      {eventCreatedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{eventCreatedNotice}</span>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">لیست رویدادهای جاری و آینده</h2>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className="py-1.5 px-3 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              تعریف رویداد جدید
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {evt.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600">
                      {evt.status === "UPCOMING" ? "پیش‌رو" : "در حال برگزاری"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">{evt.title}</h3>

                  <div className="space-y-1.5 text-xs text-muted-foreground mt-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">وضعیت فروش بلیت:</span>
                    <span className="font-bold text-foreground font-mono">
                      {evt.ticketsSold} از {evt.totalCapacity} بلیت
                    </span>
                  </div>
                  <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${(evt.ticketsSold / evt.totalCapacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-in Tab */}
      {activeTab === "checkin" && (
        <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-foreground">شبیه‌ساز اسکن و پذیرش بلیت‌های QR</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              کد بلیت شرکت‌کننده را وارد کنید یا با اسکنر اختصاصی بونیو احراز نمایید
            </p>
          </div>

          <div className="max-w-md flex gap-2">
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="مثال: TCK-9901"
              className="flex-1 bg-surface-subtle px-4 py-2 rounded-2xl border border-border/60 text-xs font-mono"
            />
            <button
              onClick={handleSimulateCheckin}
              className="py-2 px-4 rounded-2xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              بررسی و ثبت ورود
            </button>
          </div>

          {scanResult && (
            <div className="p-3 rounded-2xl bg-surface-subtle border text-xs font-bold text-foreground">
              {scanResult}
            </div>
          )}

          <div className="divide-y divide-border/40 text-xs pt-2">
            <h3 className="font-bold text-muted-foreground pb-2">فهرست بلیت‌های این رویداد</h3>
            {attendees.map((att) => (
              <div key={att.ticketCode} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-amber-600 me-2">{att.ticketCode}</span>
                  <span className="font-bold text-foreground">{att.attendeeName}</span>
                  <span className="text-muted-foreground ms-2">همراه با پت: {att.petName} ({att.petSpecies})</span>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    att.status === "CHECKED_IN"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                  )}
                >
                  {att.status === "CHECKED_IN" ? "وارد شده" : "مجاز برای ورود"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === "metrics" && (
        <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground">تحلیل مالی و استقبال رویدادها</h2>
          <p className="text-xs text-muted-foreground">
            این آمار منحصراً متعلق به رویدادهای ایجادشده توسط همین حساب کاربری است.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-surface-subtle border space-y-1">
              <span className="text-muted-foreground">سهم خالص برگزارکننده پس از کسر کارمزد بونیو</span>
              <div className="text-xl font-bold font-mono text-emerald-600">
                {(totalRevenue * 0.95).toLocaleString("fa-IR")} تومان
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-subtle border space-y-1">
              <span className="text-muted-foreground">میانگین زمان پر شدن بلیت‌ها</span>
              <div className="text-xl font-bold font-mono text-foreground">۳.۵ روز</div>
            </div>
          </div>
        </div>
      )}

      {/* New Event Creation Tab */}
      {activeTab === "new" && (
        <div className="bg-surface-elevated p-6 sm:p-8 rounded-3xl border border-border/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-600" />
                <span>تعریف و انتشار رویداد یا همایش جدید</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                مشخصات همایش، وبینار یا دورهمی پت را جهت بررسی و فعال‌سازی در سامانه وارد نمایید
              </p>
            </div>

            {/* Moderation Status Pill */}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 w-fit">
              وضعیت پس از ثبت: پیش‌نویس (DRAFT / در صف تأیید)
            </span>
          </div>

          {/* AI SEO Assistant Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-indigo-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>دستیار هوشمند سئو و نگارش محتوا (Groq LLM SEO Assistant)</span>
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                تولید خودکار عنوان جذاب و توضیحات استاندارد متناسب با کلیدواژه‌های پرجستجوی پت در گوگل و شبکه‌های اجتماعی.
              </p>
            </div>

            <button
              type="button"
              disabled={isGeneratingSeo}
              onClick={handleGenerateSeo}
              className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingSeo ? "در حال پردازش هوش مصنوعی..." : "پیشنهاد عنوان و محتوای سئو شده"}</span>
            </button>
          </div>

          {/* Creation Form */}
          <form onSubmit={handleCreateEventSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-foreground mb-1.5">عنوان کامل رویداد *</label>
              <input
                type="text"
                required
                placeholder="مثلاً: دورهمی سگ‌های نژاد کوچک و آموزش فرمان‌پذیری پایه در تهران"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-foreground mb-1.5">تاریخ برگزاری *</label>
                <input
                  type="text"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground font-mono text-xs text-center focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">ساعت برگزاری *</label>
                <input
                  type="text"
                  required
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground font-mono text-xs text-center focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">گونه هدف حیوان خانگی</label>
                <select
                  value={newEventSpecies}
                  onChange={(e) => setNewEventSpecies(e.target.value)}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="DOG">سگ‌ها (سگ‌های آپارتمانی و نژاد بزرگ)</option>
                  <option value="CAT">گربه‌ها (وبینارها و همایش‌ها)</option>
                  <option value="ALL">کلیه حیوانات خانگی (عمومی)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-foreground mb-1.5">محل دقیق برگزاری (نشانی یا لینک پخش آنلاین) *</label>
                <input
                  type="text"
                  required
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">ظرفیت کل پذیرش (تعداد نفرات) *</label>
                <input
                  type="number"
                  min={5}
                  max={1000}
                  required
                  value={newEventCapacity}
                  onChange={(e) => setNewEventCapacity(Number(e.target.value))}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground font-mono text-xs text-center focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-foreground mb-1.5">قیمت هر بلیت (تومان) — صفر به معنای رایگان</label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  required
                  value={newEventPrice}
                  onChange={(e) => setNewEventPrice(Number(e.target.value))}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground font-mono text-xs text-center focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">درآمد پیش‌بینی‌شده برگزارکننده</label>
                <div className="p-3 rounded-2xl bg-surface-subtle border border-border font-mono font-bold text-emerald-600 flex items-center justify-between">
                  <span>سهم خالص:</span>
                  <span>{((newEventCapacity * newEventPrice) * 0.95).toLocaleString("fa-IR")} تومان</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1.5">توضیحات، سرفصل‌ها و شرایط شرکت *</label>
              <textarea
                rows={4}
                required
                placeholder="سرفصل‌های کارگاه، پیش‌نیازهای واکسیناسیون پت، امکانات رفاهی محوطه و..."
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground text-xs resize-none focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className="px-5 py-2.5 rounded-xl border border-border text-muted font-bold hover:bg-surface-subtle"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>ثبت رویداد و ارسال جهت بررسی ناظر</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
