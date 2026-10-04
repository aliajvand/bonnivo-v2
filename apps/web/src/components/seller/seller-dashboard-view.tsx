"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Package,
  Truck,
  TrendingUp,
  Clock,
  AlertCircle,
  Edit2,
  Save,
  Search,
  Check,
  RefreshCw,
} from "lucide-react";

interface OfferItem {
  id: string;
  productTitle: string;
  barcode: string;
  priceTomans: number;
  stockQuantity: number;
  isActive: boolean;
}

interface SellerOrder {
  orderItemId: string;
  orderId: string;
  productTitle: string;
  quantity: number;
  unitPriceTomans: number;
  commissionTomans: number;
  orderStatus: "PAYMENT_PENDING" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED";
  shippingAddress: string;
  shippingTimeslot: string;
  createdAt: string;
  trackingNumber?: string;
}

const INITIAL_OFFERS: OfferItem[] = [
  {
    id: "off-1",
    productTitle: "غذای خشک رویال کنین مکسی ادالت ۱۵ کیلوگرم",
    barcode: "3182550732154",
    priceTomans: 4850000,
    stockQuantity: 14,
    isActive: true,
  },
  {
    id: "off-2",
    productTitle: "غذای خشک گربه رفلکس پلاس عقیم‌شده ۲ کیلوگرم",
    barcode: "8692631024512",
    priceTomans: 890000,
    stockQuantity: 6,
    isActive: true,
  },
  {
    id: "off-3",
    productTitle: "خاک بستر معطر گربه ژوانیت ۱۰ لیتری",
    barcode: "6260114920112",
    priceTomans: 240000,
    stockQuantity: 28,
    isActive: true,
  },
];

const INITIAL_ORDERS: SellerOrder[] = [
  {
    orderItemId: "item-101",
    orderId: "BNV-7841",
    productTitle: "غذای خشک رویال کنین مکسی ادالت ۱۵ کیلوگرم",
    quantity: 1,
    unitPriceTomans: 4850000,
    commissionTomans: 485000,
    orderStatus: "PAID",
    shippingAddress: "تهران، شهرک غرب، بلوار فرحزادی، پلاک ۴۴",
    shippingTimeslot: "امروز، شیفت عصر (۱۶ تا ۲۰)",
    createdAt: "امروز، ۱۰:۱۵",
  },
  {
    orderItemId: "item-102",
    orderId: "BNV-7819",
    productTitle: "غذای خشک گربه رفلکس پلاس عقیم‌شده ۲ کیلوگرم",
    quantity: 2,
    unitPriceTomans: 890000,
    commissionTomans: 178000,
    orderStatus: "SHIPPED",
    shippingAddress: "تهران، یوسف‌آباد، خیابان اسدآبادی، کوچه ۱۸",
    shippingTimeslot: "امروز، شیفت صبح (۱۰ تا ۱۴)",
    createdAt: "امروز، ۰۸:۳۰",
    trackingNumber: "BNV-EXP-9921",
  },
];

export function SellerDashboardView() {
  const [activeTab, setActiveTab] = useState<"inventory" | "orders" | "finance">("inventory");
  const [offers, setOffers] = useState<OfferItem[]>(INITIAL_OFFERS);
  const [orders, setOrders] = useState<SellerOrder[]>(INITIAL_ORDERS);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  // Price & stock inline update
  const handlePriceChange = (id: string, newPrice: number) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, priceTomans: Math.max(0, newPrice) } : o))
    );
  };

  const handleStockChange = (id: string, delta: number) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, stockQuantity: Math.max(0, o.stockQuantity + delta) } : o))
    );
  };

  const handleToggleActive = (id: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, isActive: !o.isActive } : o))
    );
  };

  const handleSimulateExcelUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      // Simulating new stock imported from spreadsheet
      setOffers((prev) =>
        prev.map((o) => ({ ...o, stockQuantity: o.stockQuantity + 5 }))
      );
      setTimeout(() => setUploadSuccess(false), 4000);
    }, 1200);
  };

  const handleMarkShipped = (orderItemId: string) => {
    const tracking = trackingInputs[orderItemId] || `BNV-EXP-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrders((prev) =>
      prev.map((ord) =>
        ord.orderItemId === orderItemId
          ? { ...ord, orderStatus: "SHIPPED", trackingNumber: tracking }
          : ord
      )
    );
  };

  const filteredOffers = offers.filter((o) =>
    o.productTitle.includes(searchTerm) || o.barcode.includes(searchTerm)
  );

  const totalGross = orders.reduce((sum, ord) => sum + ord.unitPriceTomans * ord.quantity, 0);
  const totalCommission = orders.reduce((sum, ord) => sum + ord.commissionTomans, 0);
  const netPayout = totalGross - totalCommission;

  return (
    <div className="space-y-8">
      {/* 1. Header Profile Banner */}
      <div className="glass-card rounded-4xl p-6 sm:p-8 border border-border/70 relative overflow-hidden shadow-glass">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">
                  پنل مدیریت فروشگاه پت‌شاپ طلایی
                </h1>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تایید هویت KYC ✓</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted mt-1">
                کد فروشنده: BNV-S-9041 • تسویه‌حساب به شبا: IR1100000000000000000011 • نرخ کارمزد بونیو: ۱۰٪
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateExcelUpload}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs sm:text-sm font-bold shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? "در حال پردازش اکسل..." : "بارگذاری اکسل انبار"}</span>
            </button>
          </div>
        </div>

        {uploadSuccess && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>فایل اکسل با موفقیت پردازش شد؛ موجودی ۳ قلم کالا در انبار به‌روزرسانی شد.</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-border/50">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "inventory"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface-subtle text-muted hover:text-foreground"
            }`}
          >
            مدیریت موجودی و قیمت‌ها ({offers.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "orders"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface-subtle text-muted hover:text-foreground"
            }`}
          >
            سفارش‌ها و ارسال پیک ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("finance")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "finance"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface-subtle text-muted hover:text-foreground"
            }`}
          >
            تسویه‌حساب و کارمزد
          </button>
        </div>
      </div>

      {/* 2. Tab: Inventory & Excel */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="glass-card rounded-4xl p-6 border border-border/70 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="جستجو در عنوان یا بارکد کالا..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pr-10 pl-4 rounded-2xl bg-surface-subtle border border-border/70 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted">
                <span>نمایش {filteredOffers.length} قلم کالا</span>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto rounded-2xl border border-border/50">
              <table className="w-full text-right text-xs">
                <thead className="bg-surface-subtle text-muted font-bold border-b border-border/50">
                  <tr>
                    <th className="py-3 px-4">عنوان کالا و بارکد</th>
                    <th className="py-3 px-4">قیمت فروشگاه (تومان)</th>
                    <th className="py-3 px-4">موجودی انبار</th>
                    <th className="py-3 px-4">وضعیت عرضه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredOffers.map((item) => (
                    <tr key={item.id} className="hover:bg-black/2 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-bold text-foreground block text-sm">
                          {item.productTitle}
                        </span>
                        <span className="text-[11px] text-muted font-mono">{item.barcode}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="10000"
                            value={item.priceTomans}
                            onChange={(e) => handlePriceChange(item.id, parseInt(e.target.value, 10) || 0)}
                            className="w-32 h-9 px-3 rounded-xl bg-surface-subtle border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <span className="text-muted text-[11px]">تومان</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockChange(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-surface-subtle border border-border flex items-center justify-center font-bold hover:bg-black/5"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-sm">{item.stockQuantity}</span>
                          <button
                            onClick={() => handleStockChange(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-surface-subtle border border-border flex items-center justify-center font-bold hover:bg-black/5"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleActive(item.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-surface-subtle text-muted border border-border"
                          }`}
                        >
                          {item.isActive ? "فعال در Buy Box ✓" : "غیرفعال"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tab: Orders & Fulfillment (Task 7.3) */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="glass-card rounded-4xl p-6 border border-border/70 space-y-4">
            <h2 className="text-base font-black text-foreground">
              سفارش‌های جدید نیازمند آماده‌سازی و ارسال
            </h2>
            <p className="text-xs text-muted">
              طبق SLA بونیو، سفارش‌های ثبت‌شده در شیفت تهران باید ظرف حداکثر ۲ ساعت بسته‌بندی و تحویل پیک گردند.
            </p>

            <div className="space-y-4 pt-2">
              {orders.map((ord) => (
                <div
                  key={ord.orderItemId}
                  className="p-5 rounded-3xl bg-surface-subtle border border-border/60 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary text-sm">
                          سفارش #{ord.orderId}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            ord.orderStatus === "SHIPPED"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                          }`}
                        >
                          {ord.orderStatus === "SHIPPED" ? "تحویل به پیک شد" : "در انتظار ارسال فوری"}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted mt-1 block">
                        ثبت سفارش: {ord.createdAt} • شیفت تحویل: {ord.shippingTimeslot}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-muted block">مبلغ سفارش سهم فروشگاه</span>
                      <span className="text-base font-black text-foreground">
                        {(ord.unitPriceTomans * ord.quantity).toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-foreground block">
                        کالای ارسالی: {ord.quantity} عدد {ord.productTitle}
                      </span>
                      <span className="text-xs text-muted block">
                        آدرس مقصد تهران: {ord.shippingAddress}
                      </span>
                    </div>

                    {ord.orderStatus === "PAID" ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="کد رهگیری پیک بونیو..."
                          value={trackingInputs[ord.orderItemId] || ""}
                          onChange={(e) =>
                            setTrackingInputs({ ...trackingInputs, [ord.orderItemId]: e.target.value })
                          }
                          className="h-10 px-3.5 rounded-2xl bg-white border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          onClick={() => handleMarkShipped(ord.orderItemId)}
                          className="px-4 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-xs transition-all shrink-0 flex items-center gap-1.5"
                        >
                          <Truck className="w-4 h-4" />
                          <span>تحویل به پیک</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-50 px-3.5 py-2 rounded-2xl border border-blue-200">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span>کد رهگیری: {ord.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab: Finance & Commission */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-3xl p-5 border border-border/70">
              <span className="text-xs text-muted block mb-1">فروش ناخالص دوره</span>
              <span className="text-xl font-black text-foreground">
                {totalGross.toLocaleString("fa-IR")} تومان
              </span>
            </div>
            <div className="glass-card rounded-3xl p-5 border border-border/70">
              <span className="text-xs text-muted block mb-1">کارمزد پلتفرم بونیو (۱۰٪)</span>
              <span className="text-xl font-black text-rose-600">
                {totalCommission.toLocaleString("fa-IR")} تومان
              </span>
            </div>
            <div className="glass-card rounded-3xl p-5 border border-border/70">
              <span className="text-xs text-muted block mb-1">خالص واریزی به شبا</span>
              <span className="text-xl font-black text-emerald-600">
                {netPayout.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
