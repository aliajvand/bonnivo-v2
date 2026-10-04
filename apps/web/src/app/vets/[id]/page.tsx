"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ClinicDetail, Veterinarian, TimeslotItem } from "@/types/vet";
import { fetchClinicDetail, fetchTimeslots, bookAppointment } from "@/lib/api/vets";
import { usePet } from "@/context/pet-context";

export default function ClinicBookingPage() {
  const params = useParams();
  const router = useRouter();
  const clinicId = params.id as string;
  const { pets, activePet } = usePet();

  const [clinic, setClinic] = useState<ClinicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVet, setSelectedVet] = useState<Veterinarian | null>(null);

  // Booking form state
  const [selectedDate, setSelectedDate] = useState<string>("۱۴۰۳/۰۸/۱۵");
  const [timeslots, setTimeslots] = useState<TimeslotItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedPetId, setSelectedPetId] = useState<string>(activePet?.id || "");
  const [reasonForVisit, setReasonForVisit] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadClinic() {
      setLoading(true);
      const detail = await fetchClinicDetail(clinicId);
      setClinic(detail);
      if (detail && detail.veterinarians.length > 0) {
        setSelectedVet(detail.veterinarians[0]);
      }
      setLoading(false);
    }
    if (clinicId) {
      loadClinic();
    }
  }, [clinicId]);

  useEffect(() => {
    if (activePet && !selectedPetId) {
      setSelectedPetId(activePet.id);
    }
  }, [activePet, selectedPetId]);

  useEffect(() => {
    async function loadSlots() {
      if (selectedVet) {
        const slots = await fetchTimeslots(selectedVet.id, selectedDate);
        setTimeslots(slots);
        const firstAvail = slots.find((s) => s.isAvailable);
        if (firstAvail) setSelectedSlot(firstAvail.time);
      }
    }
    loadSlots();
  }, [selectedVet, selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedPetId) {
      setErrorMessage("لطفاً حیوان خانگی مورد نظر را برای نوبت ویزیت انتخاب کنید.");
      return;
    }
    if (!selectedVet || !clinic) {
      setErrorMessage("دامپزشک انتخابی نامعتبر است.");
      return;
    }
    if (!selectedSlot) {
      setErrorMessage("لطفاً یکی از تایم‌اسلات‌های خالی را انتخاب کنید.");
      return;
    }
    if (!reasonForVisit.trim()) {
      setErrorMessage("لطفاً علت مراجعه یا علائم بالینی را ذکر بفرمایید.");
      return;
    }

    setSubmitting(true);
    try {
      await bookAppointment({
        petId: selectedPetId,
        clinicId: clinic.id,
        vetId: selectedVet.id,
        appointmentDate: selectedDate,
        timeslot: selectedSlot,
        reasonForVisit: reasonForVisit.trim(),
        notes: notes.trim() || undefined,
      });

      setSuccessMessage("نوبت ویزیت با موفقیت ثبت و پیامک تایید ارسال شد!");
      setTimeout(() => {
        router.push("/dashboard/appointments");
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در ثبت نوبت. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center" dir="rtl">
        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-slate-400">در حال بارگذاری پروفایل کلینیک و شیفت‌ها...</p>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center" dir="rtl">
        <div className="text-4xl mb-3">🏥</div>
        <h2 className="text-xl font-bold text-white mb-2">کلینیک مورد نظر یافت نشد</h2>
        <Link href="/vets" className="text-teal-400 hover:underline text-sm font-semibold">
          بازگشت به دایرکتوری کلینیک‌ها ←
        </Link>
      </div>
    );
  }

  const daysOptions = [
    { label: "امروز (سه‌شنبه)", value: "۱۴۰۳/۰۸/۱۵" },
    { label: "فردا (چهارشنبه)", value: "۱۴۰۳/۰۸/۱۶" },
    { label: "پنج‌شنبه", value: "۱۴۰۳/۰۸/۱۷" },
    { label: "شنبه آینده", value: "۱۴۰۳/۰۸/۱۹" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/vets" className="hover:text-teal-300">
          کلینیک‌های دامپزشکی
        </Link>
        <span>/</span>
        <span className="text-slate-200">{clinic.name}</span>
      </div>

      {/* Clinic Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{clinic.name}</h1>
              {clinic.isEmergency24h && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1 text-xs font-bold">
                  اورژانس شبانه‌روزی ۲۴ ساعته
                </span>
              )}
            </div>
            <p className="text-teal-400 font-semibold text-sm mt-1">{clinic.district}</p>
            <p className="text-slate-300 text-sm mt-2">📍 {clinic.address}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-center sm:text-right">
              <span className="text-xs text-slate-400">امتیاز رضایت مراجعین</span>
              <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-lg">
                <span>★</span>
                <span>{clinic.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-500 font-normal">({clinic.reviewsCount} نظر)</span>
              </div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-800" />
            <div>
              <span className="text-xs text-slate-400">تماس پذیرش</span>
              <p className="text-sm font-bold text-white font-mono" dir="ltr">
                {clinic.phoneNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="pt-6">
          <h4 className="text-xs font-bold text-slate-400 mb-2">خدمات و تجهیزات کلینیک:</h4>
          <div className="flex flex-wrap gap-2">
            {clinic.services.map((s, idx) => (
              <span
                key={idx}
                className="rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700/60 px-3 py-1 text-xs"
              >
                ✓ {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Doctors & Shift Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Veterinarian */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
            <h2 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs">
                ۱
              </span>
              انتخاب پزشک معالج و شیفت کاری
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clinic.veterinarians.map((vet) => (
                <div
                  key={vet.id}
                  onClick={() => setSelectedVet(vet)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    selectedVet?.id === vet.id
                      ? "border-teal-500 bg-teal-950/20 shadow-md ring-2 ring-teal-500/30"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{vet.fullName}</h3>
                      <p className="text-xs text-teal-400 font-medium mt-0.5">{vet.speciality}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {vet.medicalLicenseNumber}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{vet.bio}</p>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">تعرفه ویزیت:</span>
                    <span className="font-bold text-teal-300">
                      {vet.consultationFeeToman.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Date & Timeslot Picker */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
            <h2 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs">
                ۲
              </span>
              انتخاب تاریخ و ساعت نوبت
            </h2>

            {/* Date selection tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {daysOptions.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedDate(d.value)}
                  className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                    selectedDate === d.value
                      ? "bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-950/40"
                      : "bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {d.label}
                  <div className="text-[11px] opacity-80 mt-0.5 font-normal">{d.value}</div>
                </button>
              ))}
            </div>

            {/* Timeslots */}
            <h4 className="text-xs font-bold text-slate-400 mb-3">تایم‌اسلات‌های ویزیت در دسترس:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {timeslots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.isAvailable}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    !slot.isAvailable
                      ? "bg-slate-900/50 text-slate-600 border-slate-800/40 line-through cursor-not-allowed"
                      : selectedSlot === slot.time
                      ? "bg-teal-500/20 text-teal-300 border-teal-500 ring-2 ring-teal-500/30"
                      : "bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {slot.time}
                  {!slot.isAvailable && <span className="block text-[10px] font-normal text-red-400/80 mt-0.5">رزرو شده</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Pet Selection & Confirmation Form */}
        <div className="space-y-6">
          <form
            onSubmit={handleBook}
            className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl space-y-5"
          >
            <h3 className="font-extrabold text-white text-base pb-3 border-b border-slate-800">
              مشخصات نوبت و پت
            </h3>

            {/* Pet selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                انتخاب حیوان خانگی برای ویزیت:
              </label>
              {pets.length > 0 ? (
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/90 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species === "DOG" ? "سگ" : "گربه"} - نژاد {p.breed})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-300">
                  هنوز پتی ثبت نکرده‌اید. لطفاً ابتدا در داشبورد پت خود را ایجاد کنید.
                </div>
              )}
            </div>

            {/* Reason for visit */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                علت مراجعه یا علائم اصلی:
              </label>
              <input
                type="text"
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="مثال: چکاپ دوره‌ای، واکسن سالانه، لنگش پا..."
                className="w-full rounded-xl bg-slate-950/90 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                توضیحات تکمیلی برای پزشک (اختیاری):
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="سابقه بیماری، داروهای مصرفی فعلی یا حساسیت..."
                className="w-full rounded-xl bg-slate-950/90 border border-slate-700 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>کلینیک:</span>
                <span className="font-semibold text-slate-200">{clinic.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>دامپزشک:</span>
                <span className="font-semibold text-slate-200">{selectedVet?.fullName || "—"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>زمان نوبت:</span>
                <span className="font-semibold text-teal-300">{selectedDate} ساعت {selectedSlot}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>هزینه ویزیت:</span>
                <span className="font-extrabold text-sm text-white">
                  {selectedVet ? selectedVet.consultationFeeToman.toLocaleString("fa-IR") : 0} تومان
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold">
                ✓ {successMessage}
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold py-3.5 shadow-lg shadow-teal-950/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? "در حال ثبت نوبت..." : "تأیید و رزرو نوبت ویزیت"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
