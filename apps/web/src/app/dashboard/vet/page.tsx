"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  CalendarCheck,
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  Heart,
  Syringe,
  Pill,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientAppointment {
  id: string;
  petName: string;
  petSpecies: "DOG" | "CAT";
  breed: string;
  age: string;
  ownerName: string;
  ownerPhone: string;
  time: string;
  serviceType: "CHECKUP" | "VACCINATION" | "SURGERY" | "DENTAL";
  notes: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  allergies?: string[];
  lastVaccine?: string;
}

export default function VetDashboardPage() {
  const [activeTab, setActiveTab] = useState<"appointments" | "patients" | "analytics">("appointments");
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);

  const [appointments, setAppointments] = useState<PatientAppointment[]>([
    {
      id: "APT-101",
      petName: "مایلو",
      petSpecies: "DOG",
      breed: "گلدن رتریور",
      age: "۲ سال و ۳ ماه",
      ownerName: "فرزاد حسینی",
      ownerPhone: "09121234567",
      time: "۱۰:۳۰ صبح",
      serviceType: "CHECKUP",
      notes: "چکاپ دوره‌ای و ارزیابی مفاصل پای راست",
      status: "SCHEDULED",
      allergies: ["حساسیت به پروتئین مرغ"],
      lastVaccine: "۱۴۰۳/۰۲/۱۵ (هپاتیت و پاروو)",
    },
    {
      id: "APT-102",
      petName: "لونا",
      petSpecies: "CAT",
      breed: "بریتیش شورت‌هیر",
      age: "۱ سال",
      ownerName: "مینا رستگار",
      ownerPhone: "09359876543",
      time: "۱۱:۴۵ صبح",
      serviceType: "VACCINATION",
      notes: "دوز یادآور واکسن سه‌گانه و قرص انگل فصلی",
      status: "IN_PROGRESS",
      allergies: [],
      lastVaccine: "۱۴۰۲/۰۶/۲۰",
    },
    {
      id: "APT-103",
      petName: "تدی",
      petSpecies: "DOG",
      breed: "شیتزو سوپرفلت",
      age: "۴ سال",
      ownerName: "امیر صبوری",
      ownerPhone: "09125556677",
      time: "۱۴:۰۰ بعدازظهر",
      serviceType: "DENTAL",
      notes: "جرم‌گیری دندان و معاینه لثه تحت آرام‌بخش سبک",
      status: "SCHEDULED",
      allergies: ["حساسیت به پنی‌سیلین"],
      lastVaccine: "۱۴۰۲/۱۱/۱۰",
    },
  ]);

  const handleUpdateStatus = (id: string, newStatus: PatientAppointment["status"]) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    if (selectedAppointment?.id === id) {
      setSelectedAppointment((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Vet Clinical Header */}
      <div className="bg-surface-elevated/80 dark:bg-slate-900/60 p-5 rounded-3xl border border-border/80 backdrop-blur-xl shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-foreground">
                میز کار تخصصی دامپزشکی بونیو
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
                کلینیک دکتر رادمنش
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              مدیریت نوبت‌های بالینی، پرونده بیماران و ثبت وضعیت واکسیناسیون با رضایت سرپرست
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-surface-subtle p-1 rounded-2xl border border-border/60 text-xs font-bold">
          <button
            onClick={() => setActiveTab("appointments")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all",
              activeTab === "appointments"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            نوبت‌های امروز ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab("patients")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all",
              activeTab === "patients"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            پرونده بیماران
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all",
              activeTab === "analytics"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            آمار کلینیک
          </button>
        </div>
      </div>

      {/* KPI Stats (Scoped only to this Clinic/Vet) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">ویزیت‌های برنامه‌ریزی‌شده</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">۸ مورد</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">پرونده‌های فعال</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">۱۴۲ پت</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">واکسیناسیون‌های این ماه</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">۳۹ دوز</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Syringe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">رضایت مراجعین</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">۴.۹ / ۵</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "appointments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments List (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-foreground">لیست مراجعین امروز</h2>
              <span className="text-xs text-muted-foreground">چهارشنبه، ۱۱ مهر</span>
            </div>

            {appointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => setSelectedAppointment(apt)}
                className={cn(
                  "p-4 rounded-2xl bg-surface-elevated border transition-all cursor-pointer",
                  selectedAppointment?.id === apt.id
                    ? "border-teal-500 shadow-md ring-1 ring-teal-500/30"
                    : "border-border/70 hover:border-border"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center text-lg font-bold">
                      {apt.petSpecies === "DOG" ? "🐶" : "🐱"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{apt.petName}</span>
                        <span className="text-xs text-muted-foreground">({apt.breed})</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        سرپرست: {apt.ownerName} • {apt.time}
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                      apt.status === "SCHEDULED" && "bg-blue-500/10 text-blue-600 border border-blue-500/20",
                      apt.status === "IN_PROGRESS" && "bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse",
                      apt.status === "COMPLETED" && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    )}
                  >
                    {apt.status === "SCHEDULED" && "در انتظار"}
                    {apt.status === "IN_PROGRESS" && "در حال معاینه"}
                    {apt.status === "COMPLETED" && "معاینه شد"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                  علت مراجعه: {apt.notes}
                </p>
              </div>
            ))}
          </div>

          {/* Clinical Details Drawer / Inspection Box */}
          <div className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-600" />
              جزئیات بالینی بیمار
            </h3>

            {selectedAppointment ? (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-surface-subtle border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-bold text-foreground">
                      {selectedAppointment.petName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      سن: {selectedAppointment.age}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    نژاد: {selectedAppointment.breed} | سرپرست: {selectedAppointment.ownerName}
                  </div>
                </div>

                {/* Allergies / Medical Alerts */}
                {selectedAppointment.allergies && selectedAppointment.allergies.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      هشدارهای بالینی و حساسیت:
                    </div>
                    {selectedAppointment.allergies.map((al, i) => (
                      <div key={i}>• {al}</div>
                    ))}
                  </div>
                )}

                {/* Medical History snippet */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">آخرین واکسن ثبت شده:</span>
                    <span className="font-bold text-foreground">{selectedAppointment.lastVaccine || "نامشخص"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">علت ویزیت فعلی:</span>
                    <span className="font-bold text-foreground">{selectedAppointment.notes}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  {selectedAppointment.status === "SCHEDULED" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, "IN_PROGRESS")}
                      className="w-full py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
                    >
                      شروع معاینه بالینی
                    </button>
                  )}
                  {selectedAppointment.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, "COMPLETED")}
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      تکمیل و ثبت در پرونده بونیو
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-xs">
                یک نوبت از لیست کنار انتخاب کنید تا اطلاعات پرونده و ثبت ویزیت نمایش یابد.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === "patients" && (
        <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">بانک اطلاعات پرونده‌های بالینی با رضایت سرپرست</h2>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="جستجو بر اساس نام پت یا شماره سرپرست..."
                className="w-full bg-surface-subtle text-xs rounded-xl ps-8 pe-3 py-1.5 border border-border/60"
              />
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute start-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="divide-y divide-border/40 text-xs">
            {appointments.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-foreground">{p.petName} ({p.breed})</div>
                  <div className="text-muted-foreground mt-0.5">سرپرست: {p.ownerName} • {p.ownerPhone}</div>
                </div>
                <button
                  type="button"
                  className="py-1 px-3 rounded-lg bg-surface-subtle hover:bg-surface-elevated border border-border/60 text-xs font-bold text-teal-600"
                >
                  مشاهده سوابق درمانی
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground">گزارش آماری عملکرد کلینیک</h2>
          <p className="text-xs text-muted-foreground">
            داده‌های مالی و مراجعین صرفاً به همین کلینیک محدود بوده و ایزوله هستند.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-surface-subtle border">
              <div className="text-xs text-muted-foreground">درآمد ویزیت‌های این ماه</div>
              <div className="text-xl font-bold font-mono mt-1">۱۴,۸۰۰,۰۰۰ تومان</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-subtle border">
              <div className="text-xs text-muted-foreground">پذیرش بدون اتلاف وقت</div>
              <div className="text-xl font-bold font-mono mt-1">۹۴٪</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-subtle border">
              <div className="text-xs text-muted-foreground">یادآورهای ارسالی موفق</div>
              <div className="text-xl font-bold font-mono mt-1">۸۸ پیامک</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
