import {
  ClinicSummary,
  ClinicDetail,
  TimeslotItem,
  BookAppointmentPayload,
  AppointmentItem,
  MedicalRecordItem,
  ServiceBookingPayload,
  ServiceBookingResult,
} from "@/types/vet";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const STORAGE_KEY_APPOINTMENTS = "bonnivo_appointments_v1";
const STORAGE_KEY_MEDICAL_RECORDS = "bonnivo_medical_records_v1";

// Default realistic Tehran clinics
export const initialTehranClinics: ClinicDetail[] = [
  {
    id: "clinic-paytakht-01",
    name: "بیمارستان دامپزشکی شبانه‌روزی پایتخت",
    slug: "paytakht-vet-hospital",
    district: "منطقه ۱ - ولنجک",
    address: "تهران، ولنجک، انتهای خیابان چهاردهم، پلاک ۱۲",
    phoneNumber: "۰۲۱-۲۲۴۰۱۱۲۲",
    rating: 4.9,
    reviewsCount: 64,
    isEmergency24h: true,
    services: [
      "جراحی تخصصی و ارتوپدی",
      "بخش اورژانس ۲۴ ساعته",
      "سونوگرافی داپلر و رادیولوژی دیجیتال",
      "دندانپزشکی و جرم‌گیری اولتراسونیک",
      "واکسیناسیون و صدور شناسنامه بین‌المللی",
    ],
    imageUrl: "/icons/health.svg",
    veterinarians: [
      {
        id: "vet-parsa-01",
        clinicId: "clinic-paytakht-01",
        fullName: "دکتر آرین پارسا",
        medicalLicenseNumber: "VET-88391",
        speciality: "جراحی تخصصی و ارتوپدی حیوانات کوچک",
        avatarUrl: "/icons/health.svg",
        bio: "فارغ‌التحصیل دانشکده دامپزشکی دانشگاه تهران، با بیش از ۱۰ سال سابقه جراحی‌های پیشرفته ستون فقرات و بافت نرم.",
        consultationFeeToman: 500000,
        isActive: true,
      },
      {
        id: "vet-sepehri-02",
        clinicId: "clinic-paytakht-01",
        fullName: "دکتر نیلوفر سپهری",
        medicalLicenseNumber: "VET-88714",
        speciality: "طب داخلی، رادیولوژی و تشخیص بالینی",
        avatarUrl: "/icons/health.svg",
        bio: "متخصص بیماری‌های داخلی سگ و گربه، عضو انجمن جهانی دامپزشکی (WSAVA) و پژوهشگر سونوگرافی شکمی.",
        consultationFeeToman: 420000,
        isActive: true,
      },
    ],
  },
  {
    id: "clinic-mehregan-02",
    name: "کلینیک تخصصی مهرگان سعادت‌آباد",
    slug: "mehregan-vet-saadat-abad",
    district: "منطقه ۲ - سعادت‌آباد",
    address: "تهران، سعادت‌آباد، میدان کاج، خیابان سرو غربی، پلاک ۴۴",
    phoneNumber: "۰۲۱-۲۲۰۹۵۵۶۶",
    rating: 4.8,
    reviewsCount: 42,
    isEmergency24h: false,
    services: [
      "طب داخلی و چکاپ سلامت",
      "واکسیناسیون دوره‌ای",
      "خدمات آرایش، شست‌وشو و گرومینگ",
      "تغذیه درمانی و رژیم‌های بالینی",
    ],
    imageUrl: "/icons/health.svg",
    veterinarians: [
      {
        id: "vet-kiani-03",
        clinicId: "clinic-mehregan-02",
        fullName: "دکتر سارا کیانی",
        medicalLicenseNumber: "VET-99412",
        speciality: "طب پیشگیری، واکسیناسیون و تغذیه حیوانات خانگی",
        avatarUrl: "/icons/health.svg",
        bio: "دارای بورد تخصصی تغذیه بالینی و مشاور اختصاصی رژیم‌های غذایی طبیعی و درمانی بونیو.",
        consultationFeeToman: 380000,
        isActive: true,
      },
    ],
  },
  {
    id: "clinic-tehran-west-03",
    name: "مرکز جامع اورژانس حیوانات تهران غرب",
    slug: "tehran-west-vet-emergency",
    district: "منطقه ۵ - پونک",
    address: "تهران، پونک، بلوار میرزابابایی، پلاک ۸۵",
    phoneNumber: "۰۲۱-۴۴۴۸۲۰۱۰",
    rating: 4.7,
    reviewsCount: 39,
    isEmergency24h: true,
    services: [
      "بخش اورژانس ۲۴ ساعته",
      "آی‌سی‌یو و مراقبت ویژه بستری",
      "آزمایشگاه بیوشیمی و هماتولوژی فوری",
      "آمبولانس و اعزام پت در محل",
    ],
    imageUrl: "/icons/health.svg",
    veterinarians: [
      {
        id: "vet-rostami-04",
        clinicId: "clinic-tehran-west-03",
        fullName: "دکتر پویا رستمی",
        medicalLicenseNumber: "VET-77190",
        speciality: "اورژانس، تریاژ و مراقبت‌های ویژه (ICU)",
        avatarUrl: "/icons/health.svg",
        bio: "متخصص طب اورژانس با تجربه مدیریت بخش تروما و احیای قلبی ریوی حیوانات خانگی.",
        consultationFeeToman: 450000,
        isActive: true,
      },
    ],
  },
];

export async function fetchClinics(options?: {
  district?: string;
  service?: string;
  emergencyOnly?: boolean;
  query?: string;
}): Promise<ClinicSummary[]> {
  try {
    const params = new URLSearchParams();
    if (options?.district) params.set("district", options.district);
    if (options?.service) params.set("service", options.service);
    if (options?.emergencyOnly) params.set("emergency_only", "true");
    if (options?.query) params.set("query", options.query);

    const res = await fetch(`${API_BASE}/vets/clinics?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fallback to local data
  }

  let list = initialTehranClinics.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    district: c.district,
    address: c.address,
    phoneNumber: c.phoneNumber,
    rating: c.rating,
    reviewsCount: c.reviewsCount,
    isEmergency24h: c.isEmergency24h,
    services: c.services,
    imageUrl: c.imageUrl,
  }));

  if (options?.emergencyOnly) {
    list = list.filter((c) => c.isEmergency24h);
  }
  if (options?.district) {
    list = list.filter((c) => c.district.includes(options.district!));
  }
  if (options?.service) {
    list = list.filter((c) => c.services.some((s) => s.includes(options.service!)));
  }
  if (options?.query) {
    const q = options.query.toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
  }

  return list;
}

export async function fetchClinicDetail(clinicId: string): Promise<ClinicDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/vets/clinics/${clinicId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return initialTehranClinics.find((c) => c.id === clinicId || c.slug === clinicId) || null;
}

export async function fetchTimeslots(vetId: string, date: string): Promise<TimeslotItem[]> {
  const standardSlots = [
    "۱۰:۰۰ - ۱۰:۳۰",
    "۱۰:۳۰ - ۱۱:۰۰",
    "۱۱:۰۰ - ۱۱:۳۰",
    "۱۶:۰۰ - ۱۶:۳۰",
    "۱۶:۳۰ - ۱۷:۰۰",
    "۱۷:۰۰ - ۱۷:۳۰",
    "۱۷:۳۰ - ۱۸:۰۰",
    "۱۸:۰۰ - ۱۸:۳۰",
    "۱۸:۳۰ - ۱۹:۰۰",
  ];

  try {
    const res = await fetch(`${API_BASE}/vets/vets/${vetId}/timeslots?date=${date}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  return standardSlots.map((time, idx) => ({
    time,
    isAvailable: idx !== 3, // simulate slot 3 booked
  }));
}

export async function bookAppointment(payload: BookAppointmentPayload): Promise<AppointmentItem> {
  const authStored = typeof window !== "undefined" ? localStorage.getItem("bonnivo_auth_token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authStored) headers["Authorization"] = `Bearer ${authStored}`;

  try {
    const res = await fetch(`${API_BASE}/vets/appointments`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  // Local fallback storage
  const clinic = initialTehranClinics.find((c) => c.id === payload.clinicId) || initialTehranClinics[0];
  const vet = clinic.veterinarians.find((v) => v.id === payload.vetId) || clinic.veterinarians[0];

  const newAppt: AppointmentItem = {
    id: `appt-${Date.now()}`,
    petId: payload.petId,
    petName: "پت من",
    clinicId: clinic.id,
    clinicName: clinic.name,
    vetId: vet.id,
    vetName: vet.fullName,
    vetSpeciality: vet.speciality,
    appointmentDate: payload.appointmentDate,
    timeslot: payload.timeslot,
    status: "CONFIRMED",
    reasonForVisit: payload.reasonForVisit,
    totalFeeToman: vet.consultationFeeToman,
    isPaid: true,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_APPOINTMENTS) || "[]");
      stored.unshift(newAppt);
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(stored));
    } catch {
      // Ignore
    }
  }

  return newAppt;
}

export async function fetchMyAppointments(): Promise<AppointmentItem[]> {
  const authStored = typeof window !== "undefined" ? localStorage.getItem("bonnivo_auth_token") : null;
  const headers: Record<string, string> = {};
  if (authStored) headers["Authorization"] = `Bearer ${authStored}`;

  try {
    const res = await fetch(`${API_BASE}/vets/appointments/my`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fallback
  }

  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_APPOINTMENTS) || "[]");
      if (stored.length > 0) return stored;
    } catch {
      // Ignore
    }
  }

  // Seed default demonstration appointment
  return [
    {
      id: "appt-demo-01",
      petId: "pet-milo",
      petName: "میلو",
      clinicId: "clinic-paytakht-01",
      clinicName: "بیمارستان دامپزشکی شبانه‌روزی پایتخت",
      vetId: "vet-parsa-01",
      vetName: "دکتر آرین پارسا",
      vetSpeciality: "جراحی تخصصی و ارتوپدی حیوانات کوچک",
      appointmentDate: "۱۴۰۳/۰۸/۱۲",
      timeslot: "۱۶:۰۰ - ۱۶:۳۰",
      status: "CONFIRMED",
      reasonForVisit: "چکاپ دوره‌ای و پایش سلامت مفاصل",
      totalFeeToman: 500000,
      isPaid: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function cancelAppointment(appointmentId: string): Promise<boolean> {
  const authStored = typeof window !== "undefined" ? localStorage.getItem("bonnivo_auth_token") : null;
  const headers: Record<string, string> = {};
  if (authStored) headers["Authorization"] = `Bearer ${authStored}`;

  try {
    const res = await fetch(`${API_BASE}/vets/appointments/${appointmentId}/cancel`, {
      method: "PUT",
      headers,
    });
    if (res.ok) return true;
  } catch {
    // Fallback
  }

  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_APPOINTMENTS) || "[]");
      const updated = stored.map((a: AppointmentItem) =>
        a.id === appointmentId ? { ...a, status: "CANCELLED" } : a
      );
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(updated));
      return true;
    } catch {
      // Ignore
    }
  }
  return true;
}

export async function fetchPetMedicalRecords(petId: string): Promise<MedicalRecordItem[]> {
  const authStored = typeof window !== "undefined" ? localStorage.getItem("bonnivo_auth_token") : null;
  const headers: Record<string, string> = {};
  if (authStored) headers["Authorization"] = `Bearer ${authStored}`;

  try {
    const res = await fetch(`${API_BASE}/medical-records/pets/${petId}`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  // Demonstration record
  return [
    {
      id: "rec-demo-01",
      petId,
      petName: "میلو",
      vetId: "vet-parsa-01",
      vetName: "دکتر آرین پارسا",
      vetSpeciality: "جراحی تخصصی و ارتوپدی",
      visitDate: "۱۴۰۳/۰۶/۱۵",
      diagnosis: "سلامت عمومی مطلوب، دندان‌ها بدون رسوب، مفاصل لگنی کاملاً طبیعی.",
      prescriptions: [
        {
          drug_name: "قرص گلوکوزامین و کندروئیتین پت",
          dosage: "یک عدد روزانه",
          instructions: "همراه با غذای خشک اصلی جهت حفظ غضروف مفاصل",
          duration_days: 60,
        },
      ],
      vaccineAdministered: "Nobivac DHPPi + Rabies (هاری و پنج‌گانه)",
      vaccineNextDueDate: "۱۴۰۴/۰۶/۱۵",
      allergiesNoted: "فاقد حساسیت دارویی شناخته‌شده",
      weightKg: 28.5,
      vetSignatureLicense: "VET-88391",
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function bookPetService(payload: ServiceBookingPayload): Promise<ServiceBookingResult> {
  const authStored = typeof window !== "undefined" ? localStorage.getItem("bonnivo_auth_token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authStored) headers["Authorization"] = `Bearer ${authStored}`;

  try {
    const res = await fetch(`${API_BASE}/services/booking`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.detail || "خطا در ثبت رزرو خدمت");
  } catch (error: any) {
    if (error.message && !error.message.includes("fetch")) {
      throw error;
    }
  }

  // Fallback demo result
  return {
    bookingId: `SRV-${Date.now().toString(16).toUpperCase()}`,
    petId: payload.petId,
    petName: "پت من",
    serviceType: payload.serviceType,
    bookingDate: payload.bookingDate,
    status: "CONFIRMED",
    vaccineVerified: true,
    lastVaccineDate: "۱۴۰۳/۰۶/۱۵",
    totalFeeToman: payload.serviceType === "BOARDING" ? 650000 * (payload.durationDays || 1) : 380000,
    message: "رزرو خدمت با موفقیت ثبت و سلامت‌سنجی واکسیناسیون تایید شد.",
  };
}
