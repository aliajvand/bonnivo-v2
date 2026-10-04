"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppointmentItem, MedicalRecordItem, ServiceBookingResult } from "@/types/vet";
import { fetchMyAppointments, cancelAppointment, fetchPetMedicalRecords, bookPetService } from "@/lib/api/vets";
import { usePet } from "@/context/pet-context";

import { 
  AlertCircle, 
  ShieldCheck, 
  Wallet, 
  X, 
  Clock, 
  Info,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from "lucide-react";

export default function AppointmentsDashboardPage() {
  const { pets, activePet } = usePet();
  const [activeTab, setActiveTab] = useState<"appointments" | "records" | "services">("appointments");
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingAppt, setCancellingAppt] = useState<AppointmentItem | null>(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  // Service booking state (Grooming / Boarding)
  const [selectedServiceType, setSelectedServiceType] = useState<"GROOMING" | "WASH_AND_SPA" | "BOARDING" | "DAY_CARE">("GROOMING");
  const [bookingDate, setBookingDate] = useState("۱۴۰۳/۰۸/۲۰");
  const [preferredTime, setPreferredTime] = useState("۱۰:۰۰ - ۱۲:۰۰");
  const [durationDays, setDurationDays] = useState(1);
  const [pickupRequired, setPickupRequired] = useState(false);
  const [serviceBookingResult, setServiceBookingResult] = useState<ServiceBookingResult | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [bookingServiceLoading, setBookingServiceLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const appts = await fetchMyAppointments();
      setAppointments(appts);

      if (activePet) {
        const records = await fetchPetMedicalRecords(activePet.id);
        setMedicalRecords(records);
      }
      setLoading(false);
    }
    loadData();
  }, [activePet]);

  const handleOpenCancelModal = (appt: AppointmentItem) => {
    setCancellingAppt(appt);
  };

  const handleConfirmCancellation = async (appt: AppointmentItem, refundAmount: number) => {
    const success = await cancelAppointment(appt.id);
    if (success) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, status: "CANCELLED" as const } : a))
      );
      setCancelSuccessMsg(`نوبت با موفقیت لغو شد و مبلغ ${refundAmount.toLocaleString("fa-IR")} تومان به کیف پول بونیو شما مسترد گردید.`);
      setCancellingAppt(null);
      setTimeout(() => setCancelSuccessMsg(null), 6000);
    }
  };

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceError(null);
    setServiceBookingResult(null);

    if (!activePet) {
      setServiceError("لطفاً ابتدا پتی را در سیستم انتخاب فرمایید.");
      return;
    }

    setBookingServiceLoading(true);
    try {
      const res = await bookPetService({
        petId: activePet.id,
        serviceType: selectedServiceType,
        bookingDate,
        preferredTime,
        durationDays: selectedServiceType === "BOARDING" ? durationDays : 1,
        pickupRequired,
      });
      setServiceBookingResult(res);
    } catch (err: any) {
      setServiceError(err.message || "خطا در ثبت رزرو خدمت. لطفاً از وضعیت واکسیناسیون پت اطمینان حاصل کنید.");
    } finally {
      setBookingServiceLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">مدیریت نوبت‌ها و پرونده‌های سلامت</h1>
            <span className="text-xs bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-500/30">
              پرونده مشترک WSAVA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            پیگیری نوبت‌های ویزیت، مشاهده نسخ دیجیتال دامپزشک و رزرو خدمات آرایشگاه و پانسیون.
          </p>
        </div>

        <Link
          href="/vets"
          className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-950/30 transition-all active:scale-95"
        >
          <span>+ رزرو نوبت جدید</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-8 space-x-reverse space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`pb-4 px-2 border-b-2 transition-all ${
            activeTab === "appointments"
              ? "border-teal-500 text-teal-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          نوبت‌های ویزیت ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab("records")}
          className={`pb-4 px-2 border-b-2 transition-all ${
            activeTab === "records"
              ? "border-teal-500 text-teal-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          پرونده و نسخ دیجیتال ({medicalRecords.length})
        </button>

        <button
          onClick={() => setActiveTab("services")}
          className={`pb-4 px-2 border-b-2 transition-all ${
            activeTab === "services"
              ? "border-teal-500 text-teal-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          رزرو آرایشگاه و پانسیون (با بررسی واکسن)
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-400">در حال دریافت سوابق...</p>
        </div>
      ) : activeTab === "appointments" ? (
        /* APPOINTMENTS TAB */
        appointments.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400">
            <div className="text-4xl mb-3">🗓️</div>
            <h3 className="text-lg font-bold text-white mb-2">هنوز هیچ نوبت ویزیتی ثبت نشده است</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              شما می‌توانید با جستجو در مراکز درمانی معتمد بونیو، برای معاینه یا چکاپ دوره‌ای پت خود نوبت آنلاین دریافت کنید.
            </p>
            <Link
              href="/vets"
              className="inline-block rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-500"
            >
              مشاهده کلینیک‌ها و رزرو نوبت
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cancellation Policy Banner */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                <ShieldCheck className="w-4 h-4" />
                <span>خط‌مشی شفاف لغو و استرداد نوبت‌های درمانی بونیو (کیف پول محور)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1">
                  <span className="font-bold text-emerald-400 block">بیش از ۷۲ ساعت تا موعد نوبت</span>
                  <span className="text-white font-extrabold text-sm block">۱۰۰٪ استرداد کامل</span>
                  <p className="text-[11px] text-slate-400">بدون هیچ‌گونه کسر کارمزد • واریز آنی به کیف پول</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1">
                  <span className="font-bold text-amber-400 block">بین ۴۸ تا ۷۲ ساعت تا نوبت</span>
                  <span className="text-white font-extrabold text-sm block">۹۰٪ استرداد وجه</span>
                  <p className="text-[11px] text-slate-400">۱۰٪ کارمزد رزرو کلینیک • واریز مابقی به کیف پول</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1">
                  <span className="font-bold text-rose-400 block">کمتر از ۴۸ ساعت تا موعد نوبت</span>
                  <span className="text-white font-extrabold text-sm block">۸۰٪ استرداد وجه</span>
                  <p className="text-[11px] text-slate-400">۲۰٪ کارمزد کنسلی اضطراری • واریز مابقی به کیف پول</p>
                </div>
              </div>
            </div>

            {cancelSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{cancelSuccessMsg}</span>
              </div>
            )}

            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base text-white">{appt.clinicName}</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        appt.status === "CONFIRMED"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : appt.status === "CANCELLED"
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {appt.status === "CONFIRMED"
                        ? "تایید شده"
                        : appt.status === "CANCELLED"
                        ? "لغو شده"
                        : "در انتظار"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    پزشک معالج: <strong className="text-teal-400">{appt.vetName}</strong> ({appt.vetSpeciality})
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>🐾 نام پت: <strong className="text-slate-200">{appt.petName}</strong></span>
                    <span>•</span>
                    <span>📅 تاریخ: <strong className="text-slate-200">{appt.appointmentDate}</strong></span>
                    <span>•</span>
                    <span>⏰ ساعت: <strong className="text-teal-300">{appt.timeslot}</strong></span>
                  </div>

                  <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 inline-block">
                    علت مراجعه: {appt.reasonForVisit}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">هزینه ویزیت:</span>
                    <span className="text-sm font-extrabold text-white">
                      {appt.totalFeeToman.toLocaleString("fa-IR")} تومان
                    </span>
                    <span className="block text-[10px] text-emerald-400 mt-0.5">✓ پرداخت آنلاین موفق</span>
                  </div>

                  {appt.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleOpenCancelModal(appt)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white px-4 py-2 text-xs font-semibold transition-all active:scale-95"
                    >
                      لغو این نوبت
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "records" ? (
        /* MEDICAL RECORDS TAB */
        medicalRecords.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400">
            <div className="text-4xl mb-3">🩺</div>
            <h3 className="text-lg font-bold text-white mb-2">هنوز پرونده بالینی برای این پت ثبت نشده است</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              پس از حضور در کلینیک، پزشک معالج نسخ دیجیتال، سوابق واکسیناسیون و وضعیت سلامت را مستقیماً در این بخش ثبت خواهد کرد.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {medicalRecords.map((rec) => (
              <div
                key={rec.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl space-y-4"
              >
                {/* Record Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-400 font-extrabold text-base">پرونده بالینی معاینه دوره‌ای</span>
                      <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                        نظام دامپزشکی: {rec.vetSignatureLicense}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      پزشک ثبت‌کننده: <strong className="text-white">{rec.vetName}</strong> ({rec.vetSpeciality})
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">تاریخ معاینه: {rec.visitDate}</span>
                </div>

                {/* Diagnosis */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-1">تشخیص و ارزیابی پزشک:</h4>
                  <p className="text-sm text-slate-200 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 leading-relaxed">
                    {rec.diagnosis}
                  </p>
                </div>

                {/* Prescriptions */}
                {rec.prescriptions && rec.prescriptions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-teal-400 mb-2">نسخه و داروهای تجویزی:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rec.prescriptions.map((p, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-teal-500/20 bg-teal-950/10 p-3.5 space-y-1 text-xs"
                        >
                          <div className="flex justify-between font-bold text-white">
                            <span>💊 {p.drug_name}</span>
                            <span className="text-teal-300 font-normal">{p.dosage}</span>
                          </div>
                          <p className="text-slate-400 text-[11px]">دستور مصرف: {p.instructions}</p>
                          {p.duration_days && (
                            <span className="text-[10px] text-slate-500 block">دوره مصرف: {p.duration_days} روز</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vaccine & Biometrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">واکسیناسیون ثبت‌شده:</span>
                    <strong className="text-emerald-300">{rec.vaccineAdministered || "بدون واکسن"}</strong>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">موعد تمدید واکسن بعدی:</span>
                    <strong className="text-slate-200 font-mono">{rec.vaccineNextDueDate || "مشخص نشده"}</strong>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">وزن ثبت‌شده پت:</span>
                    <strong className="text-slate-200">{rec.weightKg ? `${rec.weightKg} کیلوگرم` : "—"}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* GROOMING & BOARDING SERVICES (Task 17.1) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4 border border-emerald-500/30">
                <span>🛡️</span>
                <span>تاییدیه خودکار واکسیناسیون (Task 17.1)</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mb-2">
                رزرو خدمات آرایشگاه، شست‌وشو و پانسیون حیوانات خانگی
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                جهت حفظ ایمنی و جلوگیری از انتقال بیماری‌های واگیر، پذیرش در مراکز پانسیون و آرایشگاه منوط به ثبت واکسیناسیون معتبر در شناسنامه الکترونیک پت است.
              </p>

              {/* Service Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "GROOMING",
                    title: "آرایش و اصلاح مو تخصصی",
                    fee: "۳۸۰,۰۰۰ تومان",
                    desc: "کوتاهی فرم نژادی، گره‌زدایی، ناخن‌گیری و بهداشت گوش",
                  },
                  {
                    id: "WASH_AND_SPA",
                    title: "شست‌وشو و اسپای درمانی",
                    fee: "۲۹۰,۰۰۰ تومان",
                    desc: "شست‌وشو با شامپوی ضدحساسیت و ماساژ تسکین‌دهنده پوست",
                  },
                  {
                    id: "BOARDING",
                    title: "پانسیون شبانه‌روزی VIP",
                    fee: "۶۵۰,۰۰۰ تومان / هر شب",
                    desc: "سوئیت اختصاصی، بازی و نظارت ۲۴ ساعته دامپزشک مقیم",
                  },
                  {
                    id: "DAY_CARE",
                    title: "مهد روزانه و نگهداری ساعتی",
                    fee: "۳۲۰,۰۰۰ تومان",
                    desc: "بازی گروهی و نگهداری روزانه در غیاب سرپرست",
                  },
                ].map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceType(srv.id as any)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      selectedServiceType === srv.id
                        ? "border-teal-500 bg-teal-950/20 shadow-md ring-2 ring-teal-500/30"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm">{srv.title}</h4>
                      <span className="text-xs font-bold text-teal-400">{srv.fee}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{srv.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Booking Confirmation Form */}
          <div>
            <form
              onSubmit={handleBookService}
              className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl space-y-4"
            >
              <h3 className="font-extrabold text-white text-base pb-3 border-b border-slate-800">
                مشخصات و اعتبارسنجی رزرو
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">حیوان خانگی انتخابی:</label>
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-white font-bold">{activePet?.name || "میلو"}</span>
                  <span className="text-emerald-400 font-semibold">✓ شناسنامه متصل</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">تاریخ مراجعه یا تحویل:</label>
                <input
                  type="text"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/90 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">بازه ساعتی ترجیحی:</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/90 border border-slate-700 px-3 py-2 text-sm text-white"
                >
                  <option value="۱۰:۰۰ - ۱۲:۰۰">۱۰:۰۰ الی ۱۲:۰۰ صبح</option>
                  <option value="۱۴:۰۰ - ۱۶:۰۰">۱۴:۰۰ الی ۱۶:۰۰ بعدازظهر</option>
                  <option value="۱۶:۰۰ - ۱۸:۰۰">۱۶:۰۰ الی ۱۸:۰۰ عصر</option>
                </select>
              </div>

              {selectedServiceType === "BOARDING" && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">مدت زمان اقامت (شب):</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950/90 border border-slate-700 px-3 py-2 text-sm text-white"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pickup"
                  checked={pickupRequired}
                  onChange={(e) => setPickupRequired(e.target.checked)}
                  className="rounded border-slate-700 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="pickup" className="text-xs text-slate-300 cursor-pointer">
                  نیاز به تاکسی اختصاصی اعزام پت (پیک‌آپ رفت و برگشت)
                </label>
              </div>

              {serviceError && (
                <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs leading-relaxed">
                  ⚠️ {serviceError}
                </div>
              )}

              {serviceBookingResult && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <span>✓</span>
                    <span>{serviceBookingResult.message}</span>
                  </div>
                  <p>کد پیگیری: <strong className="font-mono">{serviceBookingResult.bookingId}</strong></p>
                  <p>تاییدیه واکسیناسیون: <strong className="text-emerald-400">معتبر (آخرین واکسن {serviceBookingResult.lastVaccineDate})</strong></p>
                  <p className="pt-1 text-white font-extrabold text-sm">
                    مبلغ کل: {serviceBookingResult.totalFeeToman.toLocaleString("fa-IR")} تومان
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={bookingServiceLoading}
                className="w-full rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold py-3 shadow-lg shadow-teal-950/30 transition-all active:scale-95 disabled:opacity-50 text-sm"
              >
                {bookingServiceLoading ? "در حال استعلام واکسن و ثبت..." : "بررسی واکسن و تأیید نوبت"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tiered Cancellation & Wallet Refund Modal */}
      {cancellingAppt && (() => {
        // Calculate remaining hours and refund tier
        const remainingHours = 54; // Mock 54 hours remaining
        const refundPercent = remainingHours > 72 ? 100 : remainingHours >= 48 ? 90 : 80;
        const refundAmount = Math.round((cancellingAppt.totalFeeToman * refundPercent) / 100);
        const penaltyAmount = cancellingAppt.totalFeeToman - refundAmount;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">تأیید لغو نوبت و محاسبه استرداد وجه</h3>
                    <p className="text-xs text-slate-400">محاسبه هوشمند براساس زمان باقی‌مانده تا شروع نوبت</p>
                  </div>
                </div>
                <button
                  onClick={() => setCancellingAppt(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>مرکز درمانی / پزشک:</span>
                  <span className="font-bold text-white">{cancellingAppt.clinicName} — {cancellingAppt.vetName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>زمان نوبت:</span>
                  <span className="font-bold text-teal-400">{cancellingAppt.appointmentDate} (ساعت {cancellingAppt.timeslot})</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>زمان تخمینی باقی‌مانده:</span>
                  <span className="font-mono font-bold text-amber-400">{remainingHours} ساعت (بازه ۴۸ تا ۷۲ ساعت)</span>
                </div>
              </div>

              {/* Tiered Refund Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>مبلغ پرداختی ویزیت:</span>
                  <span className="font-mono text-white">{cancellingAppt.totalFeeToman.toLocaleString("fa-IR")} تومان</span>
                </div>
                <div className="flex justify-between items-center text-amber-400">
                  <span>درصد استرداد مجاز:</span>
                  <span className="font-bold">{refundPercent}٪</span>
                </div>
                {penaltyAmount > 0 && (
                  <div className="flex justify-between items-center text-rose-400">
                    <span>کارمزد کسر شده ناشی از کنسلی ({100 - refundPercent}٪):</span>
                    <span className="font-mono font-bold">{penaltyAmount.toLocaleString("fa-IR")} - تومان</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-extrabold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" />
                    <span>مبلغ قابل عودت به کیف پول بونیو:</span>
                  </span>
                  <span className="font-mono text-base">{refundAmount.toLocaleString("fa-IR")} تومان</span>
                </div>
              </div>

              {/* Notice */}
              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                با تأیید لغو، این نوبت برای سایر بیماران آزاد شده و مبلغ فوق بلافاصله به موجودی حساب کیف پول شما افزوده می‌شود. شما می‌توانید این موجودی را در خریدهای بعدی یا رزرو نوبت مصرف کرده یا درخواست تسویه شبا ثبت نمایید.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingAppt(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 text-xs transition-colors"
                >
                  انصراف و حفظ نوبت
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmCancellation(cancellingAppt, refundAmount)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-lg shadow-red-950/40"
                >
                  تأیید لغو و واریز به کیف پول
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
