"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  Search,
  Filter,
  ShieldCheck,
  Trash2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminReviewItem {
  id: string;
  productName: string;
  productSku: string;
  customerName: string;
  isVerifiedPurchase: boolean;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
}

export function AdminReviewsManagement() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([
    {
      id: "rev-1",
      productName: "غذای خشک گربه داخل خانه رویال کنین ۴ کیلوگرم",
      productSku: "RC-CAT-IND-001",
      customerName: "الهام کریمی",
      isVerifiedPurchase: true,
      rating: 5,
      title: "عالی برای گربه‌های پرشین کم‌تحرک",
      content:
        "گربه من خیلی بدغذا بود اما از وقتی این غذا رو با ضمانت ۴ ساعته بونیو تحویل گرفتم اشتهاش عالی شده و بوی مدفوعش هم خیلی کم شده.",
      createdAt: "۲ ساعت پیش",
      status: "APPROVED",
    },
    {
      id: "rev-2",
      productName: "خمیر مولتی ویتامین سگ بیفار ۱۰۰ گرم",
      productSku: "BEA-DOG-VIT-003",
      customerName: "محمدرضا سلیمانی",
      isVerifiedPurchase: true,
      rating: 4,
      title: "کیفیت خوب ولی تاریخ انقضا بررسی شود",
      content: "محصول پلمپ و باکیفیت بود، اثرش روی شادابی سگم خوب بود. فقط تاریخ انقضا حدود ۶ ماه مونده بود.",
      createdAt: "دیروز",
      status: "PENDING",
    },
    {
      id: "rev-3",
      productName: "غذای خشک سگ بالغ نژاد بزرگ رویال کنین",
      productSku: "RC-DOG-MAX-002",
      customerName: "کاربر ناشناس",
      isVerifiedPurchase: false,
      rating: 1,
      title: "تبلیغ برند دیگر",
      content: "برید از برند خارجی دیگه بخرید این اصلا خوب نیست و فیک هستش لینک سایت: ...",
      createdAt: "۳ روز پیش",
      status: "FLAGGED",
    },
  ]);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpdateStatus = (id: string, newStatus: "APPROVED" | "REJECTED" | "FLAGGED") => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این دیدگاه اطمینان دارید؟")) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesSearch =
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-elevated p-5 rounded-3xl border border-border/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-bold text-foreground">مدیریت و ممیزی دیدگاه‌های خریداران</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            بررسی اصالت نظرات با نشان خرید تأییدشده (Verified Purchase) و نظارت بر رعایت اخلاق و عدم تبلیغات کاذب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground bg-surface-subtle px-3 py-1.5 rounded-xl border border-border/60">
            {reviews.filter((r) => r.status === "PENDING").length} نظر در انتظار تایید
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-subtle/50 p-4 rounded-2xl border border-border/60">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute start-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نظرات، نام کاربر یا کالا..."
            className="w-full ps-9 pe-3 py-1.5 text-xs bg-surface-elevated border border-border/70 rounded-xl focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-surface-elevated border border-border/70 rounded-xl px-2.5 py-1.5 font-bold text-foreground focus:outline-hidden"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="PENDING">در انتظار بررسی</option>
            <option value="APPROVED">تأیید شده (نمایش عمومی)</option>
            <option value="REJECTED">رد شده</option>
            <option value="FLAGGED">گزارش تخلف / مشکوک</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-3">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-3xl bg-surface-elevated border border-border/70 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-foreground">{rev.customerName}</span>
                {rev.isVerifiedPurchase ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    خریدار تأییدشده بونیو
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded-full border border-border/60">
                    کاربر عمومی
                  </span>
                )}
                <span className="text-xs text-muted-foreground">• برای محصول:</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{rev.productName}</span>
                <span className="text-xs font-mono text-muted-foreground">({rev.createdAt})</span>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-3.5 h-3.5",
                      star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-border"
                    )}
                  />
                ))}
                {rev.title && <span className="text-xs font-bold text-foreground ms-2">{rev.title}</span>}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{rev.content}</p>
            </div>

            {/* Moderation Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                  rev.status === "APPROVED" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                  rev.status === "PENDING" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                  rev.status === "REJECTED" && "bg-rose-500/10 text-rose-600 border-rose-500/20",
                  rev.status === "FLAGGED" && "bg-purple-500/10 text-purple-600 border-purple-500/20"
                )}
              >
                {rev.status === "APPROVED" && "تأیید شده"}
                {rev.status === "PENDING" && "در انتظار بررسی"}
                {rev.status === "REJECTED" && "رد شده"}
                {rev.status === "FLAGGED" && "تخلف مشکوک"}
              </span>

              {rev.status !== "APPROVED" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(rev.id, "APPROVED")}
                  className="py-1.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                  title="تأیید و انتشار عمومی"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تأیید
                </button>
              )}

              {rev.status !== "REJECTED" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(rev.id, "REJECTED")}
                  className="py-1.5 px-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-bold hover:bg-rose-500/20 transition-colors border border-rose-500/30 flex items-center gap-1"
                  title="رد دیدگاه"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  رد
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDelete(rev.id)}
                className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-elevated text-muted-foreground hover:text-rose-600 border border-border/60 transition-colors"
                title="حذف دیدگاه"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
