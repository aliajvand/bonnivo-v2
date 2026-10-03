"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  X, 
  QrCode, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Download,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FeatureFlagGuard } from "@/components/common/feature-flag-guard";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  capacityText: string;
  remainingSpots: number;
  priceText: string;
  priceTomans: number;
  description: string;
  petRequirements: string[];
}

export default function EventsPage() {
  const events: EventItem[] = [
    {
      id: "ev-1",
      title: "دورهمی پاییزی سرپرستان نژاد گلدن و هاسکی",
      date: "جمعه ۲۸ مهر ۱۴۰۳",
      time: "۱۶:۰۰ الی ۱۹:۰۰",
      location: "تهران، بوستان آب و آتش (محوطه اختصاصی حیوانات خانگی)",
      organizer: "باشگاه سگ‌های مهربان بونیو",
      capacityText: "۵۰ سرپرست (ظرفیت باقی‌مانده: ۱۲)",
      remainingSpots: 12,
      priceText: "رایگان (نیازمند ثبت‌نام)",
      priceTomans: 0,
      description: "فضایی شاد و صمیمانه برای تخلیه انرژی سگ‌های پرانرژی نژاد بزرگ، آشنایی سرپرستان و مشاوره رایگان با مربیان رفتارشناسی بونیو.",
      petRequirements: ["شناسنامه واکسیناسیون معتبر", "استفاده از قلاده بدنی یا کمری استاندارد", "عدم پرخاشگری کنترل‌نشده"],
    },
    {
      id: "ev-2",
      title: "وبینار تخصصی تغذیه بالینی و بیماری‌های ادراری گربه‌ها",
      date: "دوشنبه ۲ آبان ۱۴۰۳",
      time: "۱۹:۰۰ الی ۲۱:۰۰",
      location: "آنلاین در بستر اختصاصی بونیو (پخش زنده)",
      organizer: "دکتر فرزانه صامتی (متخصص داخلی دام‌های کوچک)",
      capacityText: "۲۰۰ نفر (ظرفیت باقی‌مانده: ۵۴)",
      remainingSpots: 54,
      priceText: "۱۲۰,۰۰۰ تومان",
      priceTomans: 120000,
      description: "بررسی دلایل شایع سندروم اورولوژیک گربه‌ها (FLUTD)، راهکارهای افزایش مصرف آب و انتخاب جیره غذایی متناسب با گربه‌های عقیم‌شده.",
      petRequirements: ["بدون نیاز به حضور پت (وبینار آنلاین)"],
    },
    {
      id: "ev-3",
      title: "کارگاه عملی آموزش فرمان‌پذیری پایه و کاهش استرس پت",
      date: "پنجشنبه ۱۲ آبان ۱۴۰۳",
      time: "۱۰:۰۰ الی ۱۳:۰۰",
      location: "تهران، باشگاه ورزشی انقلاب",
      organizer: "آکادمی مربیگری بونیو",
      capacityText: "۲۰ سرپرست با پت (ظرفیت باقی‌مانده: ۴)",
      remainingSpots: 4,
      priceText: "۳۵۰,۰۰۰ تومان",
      priceTomans: 350000,
      description: "تمرین‌های گام‌به‌گام با متد تشویقی مثبت، یادگیری فرمان‌های بشین، بمان، همگام و راهکارهای مدیریت اضطراب جدایی در محیط‌های شلوغ شهری.",
      petRequirements: ["واکسیناسیون کامل ده‌گانه", "تشویقی‌های نرم پرجاذبه", "بند قلاده ۲ متری غیرفلزی"],
    },
  ];

  // Booking Modal State
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [attendeeName, setAttendeeName] = useState("علی ایجرندی");
  const [attendeePhone, setAttendeePhone] = useState("09121234567");
  const [petName, setPetName] = useState("میلو");
  const [bookingSuccessTicket, setBookingSuccessTicket] = useState<{
    ticketCode: string;
    eventTitle: string;
    date: string;
    time: string;
    location: string;
    attendeeName: string;
    petName: string;
  } | null>(null);

  const handleOpenBooking = (ev: EventItem) => {
    setSelectedEvent(ev);
    setBookingSuccessTicket(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const ticketCode = `BNY-PASS-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingSuccessTicket({
      ticketCode,
      eventTitle: selectedEvent.title,
      date: selectedEvent.date,
      time: selectedEvent.time,
      location: selectedEvent.location,
      attendeeName,
      petName,
    });
  };

  return (
    <FeatureFlagGuard
      moduleKey="events"
      moduleTitleFa="رویدادها و همایش‌های پت"
      descriptionFa="بخش همایش‌ها و رویدادهای حضوری و آنلاین بونیو پس از دریافت مجوزهای لازم و هماهنگی مکان‌های برگزاری فعال خواهد شد."
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 p-6 md:p-10 rounded-4xl text-white border border-purple-500/20 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
          <Calendar className="w-3.5 h-3.5" />
          <span>رویدادها، همایش‌ها و دورهمی‌های جامعه بونیو</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black">
          همایش‌ها، وبینارها و دورهمی‌های جامعه حیوانات خانگی
        </h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
          فرصتی برای یادگیری تخصصی، ارتقای سلامت روان پت و دیدار با سایر سرپرستان و متخصصین معتمد در یک محیط شاد و علمی.
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-6 rounded-3xl bg-surface-elevated border border-border/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  {ev.date}
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{ev.priceText}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {ev.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">برگزارکننده: {ev.organizer}</p>
              </div>

              <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                {ev.description}
              </p>

              <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>زمان: {ev.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{ev.location}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>{ev.capacityText}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenBooking(ev)}
              className="w-full py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold text-center shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Ticket className="w-4 h-4" />
              <span>مشاهده و دریافت بلیت ورود (QR Pass)</span>
            </button>
          </div>
        ))}
      </div>

      {/* Booking & Ticket Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
          <div className="w-full max-w-lg bg-surface-elevated border border-border rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border/60 pb-3">
              <div>
                <span className="text-[11px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  رزرو رسمی رویداد بونیو
                </span>
                <h3 className="font-black text-base text-foreground mt-1">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-full hover:bg-surface-subtle text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If booked successfully, show QR Pass */}
            {bookingSuccessTicket ? (
              <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-black text-foreground">بلیت ورود شما با موفقیت صادر شد!</h4>
                  <p className="text-xs text-muted-foreground">
                    لطفاً بارکد زیر را هنگام ورود به برگزارکننده ارائه فرمایید.
                  </p>
                </div>

                {/* QR Ticket Badge Mockup */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-purple-950 text-white border border-purple-500/30 text-right space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                    <span className="text-xs font-bold text-purple-300">BONNIVO EVENT PASS</span>
                    <span className="font-mono text-xs font-black text-amber-300">{bookingSuccessTicket.ticketCode}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] text-slate-300 block">{bookingSuccessTicket.eventTitle}</span>
                    <span className="text-slate-400 block">{bookingSuccessTicket.date} • {bookingSuccessTicket.time}</span>
                    <span className="text-slate-400 block truncate">{bookingSuccessTicket.location}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[10px]">شرکت‌کننده:</span>
                      <strong className="text-white">{bookingSuccessTicket.attendeeName}</strong>
                      <span className="text-slate-300 block text-[11px]">همراه با پت: {bookingSuccessTicket.petName}</span>
                    </div>

                    <div className="w-16 h-16 bg-white rounded-xl p-1.5 flex items-center justify-center text-slate-900">
                      <QrCode className="w-12 h-12" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md"
                  >
                    بستن و بازگشت به رویدادها
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-border space-y-2">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>زمان برگزاری:</span>
                    <span className="font-bold text-foreground">{selectedEvent.date} ({selectedEvent.time})</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>محل برگزاری:</span>
                    <span className="font-bold text-foreground truncate max-w-xs">{selectedEvent.location}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>مبلغ بلیت:</span>
                    <span className="font-bold text-emerald-600 font-mono">{selectedEvent.priceText}</span>
                  </div>
                </div>

                {/* Pet Requirements */}
                <div className="space-y-1.5">
                  <span className="font-bold text-foreground block">الزامات و شرایط حضور پت:</span>
                  <ul className="space-y-1 text-muted-foreground">
                    {selectedEvent.petRequirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-foreground mb-1">نام سرپرست *</label>
                    <input
                      type="text"
                      required
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      className="w-full bg-surface-subtle p-2.5 rounded-xl border border-border text-foreground text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">شماره تماس *</label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      className="w-full bg-surface-subtle p-2.5 rounded-xl border border-border text-foreground text-xs font-mono text-center focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold text-foreground mb-1">نام پت همراه *</label>
                    <input
                      type="text"
                      required
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full bg-surface-subtle p-2.5 rounded-xl border border-border text-foreground text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2.5 rounded-xl border border-border text-muted font-bold hover:bg-surface-subtle"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>تأیید و صدور بلیت QR Pass</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      </div>
    </FeatureFlagGuard>
  );
}
