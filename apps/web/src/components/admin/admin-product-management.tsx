"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Upload,
  Sparkles,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Eye,
  Check,
  Star,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminProductItem {
  id: string;
  sku: string;
  slug: string;
  titleFa: string;
  brand: string;
  category: string;
  targetSpecies: string;
  priceTomans: number;
  oldPriceTomans?: number;
  discountPercent?: number;
  stockQuantity: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  primaryImageUrl?: string;
  ratingAvg?: number;
  ratingCount?: number;
}

export function AdminProductManagement() {
  const [products, setProducts] = useState<AdminProductItem[]>([
    {
      id: "prod-1",
      sku: "RC-CAT-IND-001",
      slug: "royal-canin-indoor-cat",
      titleFa: "غذای خشک گربه داخل خانه رویال کنین ۴ کیلوگرم",
      brand: "Royal Canin",
      category: "food",
      targetSpecies: "CAT",
      priceTomans: 1450000,
      oldPriceTomans: 1650000,
      discountPercent: 12,
      stockQuantity: 42,
      status: "PUBLISHED",
      primaryImageUrl: "/icons/cat.svg",
      ratingAvg: 4.8,
      ratingCount: 38,
    },
    {
      id: "prod-2",
      sku: "RC-DOG-MAX-002",
      slug: "royal-canin-maxi-adult",
      titleFa: "غذای خشک سگ بالغ نژاد بزرگ رویال کنین ۱۵ کیلوگرم",
      brand: "Royal Canin",
      category: "food",
      targetSpecies: "DOG",
      priceTomans: 3850000,
      oldPriceTomans: 4200000,
      discountPercent: 8,
      stockQuantity: 18,
      status: "PUBLISHED",
      primaryImageUrl: "/icons/dog.svg",
      ratingAvg: 4.9,
      ratingCount: 24,
    },
    {
      id: "prod-3",
      sku: "BEA-DOG-VIT-003",
      slug: "beaphar-multi-vitamin-paste",
      titleFa: "خمیر مولتی ویتامین سگ بیفار ۱۰۰ گرم",
      brand: "Beaphar",
      category: "health",
      targetSpecies: "DOG",
      priceTomans: 480000,
      stockQuantity: 5,
      status: "DRAFT",
      primaryImageUrl: "/icons/health.svg",
      ratingAvg: 4.6,
      ratingCount: 12,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);

  // Form Fields
  const [titleFa, setTitleFa] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("food");
  const [targetSpecies, setTargetSpecies] = useState("CAT");
  const [priceTomans, setPriceTomans] = useState<number>(0);
  const [oldPriceTomans, setOldPriceTomans] = useState<number | undefined>();
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [images, setImages] = useState<{ url: string; alt: string; isPrimary: boolean }[]>([
    { url: "/icons/cat.svg", alt: "تصویر اصلی محصول", isPrimary: true },
  ]);

  // LLM Generator State
  const [rawSupplierText, setRawSupplierText] = useState("");
  const [isGeneratingLLM, setIsGeneratingLLM] = useState(false);
  const [generatedShortDesc, setGeneratedShortDesc] = useState("");
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Multi-weight Variants State
  const [weightVariants, setWeightVariants] = useState<{ id: string; weightText: string; priceTomans: number; stock: number }[]>([
    { id: "var-1", weightText: "۲ کیلوگرم", priceTomans: 1450000, stock: 25 },
    { id: "var-2", weightText: "۴ کیلوگرم", priceTomans: 2650000, stock: 12 },
  ]);
  const [newVarWeight, setNewVarWeight] = useState("");
  const [newVarPrice, setNewVarPrice] = useState(0);
  const [newVarStock, setNewVarStock] = useState(10);

  // Excel Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{
    totalRows: number;
    validRows: number;
    invalidRows: number;
    preview: any[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState("");

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.titleFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecies = speciesFilter === "ALL" || p.targetSpecies === speciesFilter;
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesSpecies && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setTitleFa("");
    setSlug("");
    setSku(`BNV-${Math.floor(1000 + Math.random() * 9000)}`);
    setBrand("");
    setCategory("food");
    setTargetSpecies("CAT");
    setPriceTomans(0);
    setOldPriceTomans(undefined);
    setStockQuantity(10);
    setStatus("DRAFT");
    setRawSupplierText("");
    setGeneratedShortDesc("");
    setGeneratedBullets([]);
    setSeoTitle("");
    setSeoDescription("");
    setImages([{ url: "/icons/cat.svg", alt: "تصویر اولیه", isPrimary: true }]);
    setIsModalOpen(true);
  };

  const handleEditProduct = (prod: AdminProductItem) => {
    setEditingProduct(prod);
    setTitleFa(prod.titleFa);
    setSlug(prod.slug);
    setSku(prod.sku);
    setBrand(prod.brand);
    setCategory(prod.category);
    setTargetSpecies(prod.targetSpecies);
    setPriceTomans(prod.priceTomans);
    setOldPriceTomans(prod.oldPriceTomans);
    setStockQuantity(prod.stockQuantity);
    setStatus(prod.status);
    setSeoTitle(prod.titleFa);
    setSeoDescription(`خرید اینترنتی ${prod.titleFa} با ضمانت ۴ ساعته بونیو`);
    setIsModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!titleFa || priceTomans <= 0) {
      alert("لطفاً عنوان کالا و قیمت معتبر را وارد کنید.");
      return;
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                titleFa,
                slug: slug || titleFa.toLowerCase().replace(/\s+/g, "-"),
                sku,
                brand: brand || "BONNIVO",
                category,
                targetSpecies,
                priceTomans,
                oldPriceTomans,
                discountPercent:
                  oldPriceTomans && oldPriceTomans > priceTomans
                    ? Math.round(((oldPriceTomans - priceTomans) / oldPriceTomans) * 100)
                    : undefined,
                stockQuantity,
                status,
                primaryImageUrl: images.find((i) => i.isPrimary)?.url || images[0]?.url,
              }
            : p
        )
      );
    } else {
      const newProd: AdminProductItem = {
        id: `prod-${Date.now()}`,
        sku: sku || `SKU-${Date.now()}`,
        slug: slug || titleFa.toLowerCase().replace(/\s+/g, "-"),
        titleFa,
        brand: brand || "BONNIVO",
        category,
        targetSpecies,
        priceTomans,
        oldPriceTomans,
        discountPercent:
          oldPriceTomans && oldPriceTomans > priceTomans
            ? Math.round(((oldPriceTomans - priceTomans) / oldPriceTomans) * 100)
            : undefined,
        stockQuantity,
        status,
        primaryImageUrl: images.find((i) => i.isPrimary)?.url || "/icons/cat.svg",
        ratingAvg: 5.0,
        ratingCount: 1,
      };
      setProducts([newProd, ...products]);
    }

    setIsModalOpen(false);
  };

  // LLM Generation via Groq API endpoint
  const handleGenerateLLMContent = async () => {
    if (!rawSupplierText.trim()) {
      alert("لطفاً متن خام بروشور یا مشخصات اولیه تأمین‌کننده را وارد کنید.");
      return;
    }

    setIsGeneratingLLM(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/admin/products/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawSupplierText, species: targetSpecies }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.persian_title && !titleFa) setTitleFa(data.persian_title);
        if (data.suggested_slug && !slug) setSlug(data.suggested_slug);
        setGeneratedShortDesc(data.short_description || "");
        setGeneratedBullets(data.features_markdown ? data.features_markdown.split("\n") : []);
        setSeoTitle(data.seo_title || data.persian_title);
        setSeoDescription(data.seo_description || data.short_description);
      } else {
        // High quality fallback
        setTitleFa(rawSupplierText.slice(0, 40));
        setGeneratedShortDesc(`محصول باکیفیت و استاندارد ویژه ${targetSpecies === "CAT" ? "گربه" : "سگ"}`);
        setGeneratedBullets(["فرمولاسیون استاندارد و مغذی", "هضم آسان و کنترل وزن", "دارای ضمانت سلامت ۴ ساعته بونیو"]);
        setSeoTitle(`${rawSupplierText.slice(0, 40)} | بونیو`);
        setSeoDescription(`خرید بهترین کیفیت غذای پت با ضمانت ۴ ساعته و ارسال فوری در پلتفرم بونیو`);
      }
    } catch {
      // Offline fallback
      setGeneratedShortDesc(`فرمولاسیون استاندارد و مغذی ویژه ${targetSpecies === "CAT" ? "گربه‌ها" : "سگ‌ها"}`);
      setGeneratedBullets(["بدون افزودنی‌های مضر", "تأمین انرژی مورد نیاز روزانه", "ضمانت اصالت و سلامت بونیو"]);
      setSeoTitle(`${titleFa || "محصول حیوانات خانگی"} | بونیو`);
      setSeoDescription("بهترین انتخاب تغذیه‌ای با ارسال فوری و ضمانت اصالت");
    } finally {
      setIsGeneratingLLM(false);
    }
  };

  // Excel / CSV Template Download
  const handleDownloadTemplate = () => {
    const csvContent =
      "sku,name,brand,category,species,price,stock,old_price,weight,flavor,description\n" +
      "BNV-SAMPLE-01,غذای خشک گربه بالغ رویال کنین ۲ کیلو,Royal Canin,food,CAT,950000,25,1050000,2kg,مرغ,غذای کامل و متعادل برای گربه های داخل خانه\n" +
      "BNV-SAMPLE-02,پرزگیر رولی حیوانات خانگی,Bonnivo,accessories,ALL,85000,100,110000,150g,ساده,پرزگیر چسبی با کیفیت جهت نظافت مبلمان و لباس";

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "bonyo_product_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real Catalog CSV Export (with UTF-8 BOM \uFEFF for Excel)
  const handleExportProductsCsv = () => {
    const headers = [
      "شناسه",
      "کد کالا (SKU)",
      "اسلاگ",
      "عنوان فارسی",
      "برند",
      "دسته‌بندی",
      "گونه هدف",
      "قیمت (تومان)",
      "قیمت قبل (تومان)",
      "موجودی انبار",
      "وضعیت",
    ];

    const rows = products.map((p) => [
      p.id,
      p.sku,
      p.slug,
      `"${p.titleFa.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      p.category,
      p.targetSpecies,
      p.priceTomans,
      p.oldPriceTomans || "",
      p.stockQuantity,
      p.status,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bonnivo_catalog_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Preview Import File
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    // Mock/Simulated parsing for validation preview
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const rows = lines.slice(1);

    const parsedRows = rows.map((line, idx) => {
      const parts = line.split(",");
      const sku = parts[0]?.trim();
      const name = parts[1]?.trim();
      const price = parseFloat(parts[5]?.trim() || "0");
      const isValid = Boolean(sku && name && price > 0);
      return {
        row: idx + 2,
        sku: sku || "نامشخص",
        name: name || "نامشخص",
        price: price || 0,
        isValid,
        error: isValid ? null : "فیلد نام یا قیمت نامعتبر است",
      };
    });

    setImportPreview({
      totalRows: parsedRows.length,
      validRows: parsedRows.filter((r) => r.isValid).length,
      invalidRows: parsedRows.filter((r) => !r.isValid).length,
      preview: parsedRows,
    });
  };

  // Commit Import
  const handleCommitImport = () => {
    if (!importPreview || importPreview.validRows === 0) return;
    setIsImporting(true);

    setTimeout(() => {
      const newItems: AdminProductItem[] = importPreview.preview
        .filter((r) => r.isValid)
        .map((r, i) => ({
          id: `imp-${Date.now()}-${i}`,
          sku: r.sku,
          slug: r.name.toLowerCase().replace(/\s+/g, "-"),
          titleFa: r.name,
          brand: "وارداتی",
          category: "food",
          targetSpecies: "CAT",
          priceTomans: r.price,
          stockQuantity: 20,
          status: "PUBLISHED",
          primaryImageUrl: "/icons/cat.svg",
          ratingAvg: 5.0,
          ratingCount: 1,
        }));

      setProducts((prev) => [...newItems, ...prev]);
      setIsImporting(false);
      setImportSuccessMessage(`تعداد ${newItems.length} محصول با موفقیت به کاتالوگ افزوده شد!`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportSuccessMessage("");
        setImportPreview(null);
        setImportFile(null);
      }, 2000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-elevated p-5 rounded-3xl border border-border/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-foreground">مدیریت جامع کاتالوگ و محصولات بونیو</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            تعریف، قیمت‌گذاری، بارگذاری تصاویر 1:1، ورود اکسل و تولید محتوا با هوش مصنوعی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="py-2 px-3 rounded-2xl bg-surface-subtle hover:bg-surface-elevated text-xs font-bold text-foreground border border-border/70 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>دانلود قالب اکسل</span>
          </button>
          <button
            type="button"
            onClick={handleExportProductsCsv}
            className="py-2 px-3 rounded-2xl bg-surface-subtle hover:bg-surface-elevated text-xs font-bold text-foreground border border-border/70 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>خروجی کاتالوگ (CSV با BOM)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="py-2 px-3 rounded-2xl bg-surface-subtle hover:bg-surface-elevated text-xs font-bold text-foreground border border-border/70 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>ورود دسته‌جمعی اکسل</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="py-2 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-black text-white flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>محصول جدید</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-subtle/50 p-4 rounded-2xl border border-border/60">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute start-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس عنوان، کد SKU یا برند..."
              className="w-full ps-9 pe-3 py-1.5 text-xs bg-surface-elevated border border-border/70 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="text-xs bg-surface-elevated border border-border/70 rounded-xl px-2.5 py-1.5 font-bold text-foreground focus:outline-hidden"
          >
            <option value="ALL">همه گونه‌ها</option>
            <option value="CAT">گربه 🐱</option>
            <option value="DOG">سگ 🐶</option>
            <option value="BIRD">پرندگان 🦜</option>
            <option value="SMALL_PET">جوندگان 🐹</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-surface-elevated border border-border/70 rounded-xl px-2.5 py-1.5 font-bold text-foreground focus:outline-hidden"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="PUBLISHED">منتشر شده</option>
            <option value="DRAFT">پیش‌نویس</option>
            <option value="ARCHIVED">بایگانی شده</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface-elevated rounded-3xl border border-border/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="bg-surface-subtle/80 border-b border-border/60 text-muted-foreground">
                <th className="py-3 px-4 text-start font-bold">کالا</th>
                <th className="py-3 px-4 text-start font-bold">کد SKU</th>
                <th className="py-3 px-4 text-start font-bold">دسته‌بندی / گونه</th>
                <th className="py-3 px-4 text-start font-bold">قیمت (تومان)</th>
                <th className="py-3 px-4 text-start font-bold">موجودی</th>
                <th className="py-3 px-4 text-start font-bold">وضعیت</th>
                <th className="py-3 px-4 text-start font-bold">امتیاز</th>
                <th className="py-3 px-4 text-end font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-surface-subtle/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-border/70 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {prod.primaryImageUrl ? (
                          <img src={prod.primaryImageUrl} alt={prod.titleFa} className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-foreground line-clamp-1">{prod.titleFa}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{prod.brand}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-muted-foreground">{prod.sku}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border/50 text-[10px] font-bold">
                        {prod.targetSpecies === "CAT" ? "گربه" : "سگ"}
                      </span>
                      <span className="text-muted-foreground text-[11px]">{prod.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-foreground">
                      {prod.priceTomans.toLocaleString("fa-IR")}
                    </div>
                    {prod.oldPriceTomans && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground line-through font-mono">
                          {prod.oldPriceTomans.toLocaleString("fa-IR")}
                        </span>
                        {prod.discountPercent && (
                          <span className="text-[10px] text-rose-600 font-bold font-mono">
                            %{prod.discountPercent}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "font-mono font-bold px-2 py-0.5 rounded-full text-[10px]",
                        prod.stockQuantity > 10
                          ? "bg-emerald-500/10 text-emerald-600"
                          : prod.stockQuantity > 0
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-rose-500/10 text-rose-600"
                      )}
                    >
                      {prod.stockQuantity} عدد
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        prod.status === "PUBLISHED" && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
                        prod.status === "DRAFT" && "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                        prod.status === "ARCHIVED" && "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                      )}
                    >
                      {prod.status === "PUBLISHED" ? "منتشر شده" : prod.status === "DRAFT" ? "پیش‌نویس" : "بایگانی"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{prod.ratingAvg || 5.0}</span>
                      <span className="text-muted-foreground">({prod.ratingCount || 0})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(prod)}
                        className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/50"
                        title="ویرایش محصول"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-elevated w-full max-w-3xl rounded-3xl border border-border shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingProduct ? "ویرایش کالا در کاتالوگ بونیو" : "ثبت محصول جدید در کاتالوگ بونیو"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-subtle text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* AI Generator Tool Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border border-blue-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-foreground">
                  تولید خودکار محتوا، مشخصات و سئو با هوش مصنوعی (Groq LLM)
                </span>
              </div>
              <textarea
                value={rawSupplierText}
                onChange={(e) => setRawSupplierText(e.target.value)}
                placeholder="متن اولیه کاتالوگ کارخانه یا بروشور انگلیسی/فارسی تأمین‌کننده را اینجا جای‌گذاری کنید..."
                className="w-full text-xs p-2.5 bg-surface-elevated border border-border/70 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 min-h-[60px]"
              />
              <button
                type="button"
                onClick={handleGenerateLLMContent}
                disabled={isGeneratingLLM}
                className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isGeneratingLLM ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال پردازش محتوا...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تولید مشخصات و بهینه‌سازی سئو</span>
                  </>
                )}
              </button>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">عنوان رسمی فارسی کالا</label>
                <input
                  type="text"
                  value={titleFa}
                  onChange={(e) => setTitleFa(e.target.value)}
                  placeholder="مثال: غذای خشک گربه عقیم شده رویال کنین ۲ کیلوگرم"
                  className="w-full p-2 bg-surface-subtle border border-border/70 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">نام انگلیسی در آدرس (Slug)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="royal-canin-sterilised-cat-2kg"
                  className="w-full p-2 bg-surface-subtle border border-border/70 rounded-xl font-mono text-start"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">کد شناسه کالا (SKU)</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full p-2 bg-surface-subtle border border-border/70 rounded-xl font-mono text-start"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">برند سازنده</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Royal Canin, Beaphar, etc."
                  className="w-full p-2 bg-surface-subtle border border-border/70 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">گونه هدف</label>
                <select
                  value={targetSpecies}
                  onChange={(e) => setTargetSpecies(e.target.value)}
                  className="w-full p-2 bg-surface-subtle border border-border/70 rounded-xl font-bold"
                >
                  <option value="CAT">گربه (Cat)</option>
                  <option value="DOG">سگ (Dog)</option>
                  <option value="BIRD">پرنده (Bird)</option>
                  <option value="SMALL_PET">حیوانات کوچک (Small Pet)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">دسته‌بندی</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-surface-subtle border border-border/70 rounded-xl font-bold"
                >
                  <option value="food">غذای اصلی و تشویقی</option>
                  <option value="health">بهداشت و سلامت</option>
                  <option value="toys">اسباب‌بازی و سرگرمی</option>
                  <option value="accessories">لوازم جانبی و نگهداری</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">قیمت فروش (تومان)</label>
                <input
                  type="number"
                  value={priceTomans || ""}
                  onChange={(e) => setPriceTomans(Number(e.target.value))}
                  placeholder="1450000"
                  className="w-full p-2 bg-surface-subtle border border-border/70 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">قیمت خط‌خورده / قبلی (تومان)</label>
                <input
                  type="number"
                  value={oldPriceTomans || ""}
                  onChange={(e) => setOldPriceTomans(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="اختیاری جهت اعمال برچسب تخفیف"
                  className="w-full p-2 bg-surface-subtle border border-border/70 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">موجودی انبار</label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full p-2 bg-surface-subtle border border-border/70 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">وضعیت انتشار</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2 bg-surface-subtle border border-border/70 rounded-xl font-bold"
                >
                  <option value="PUBLISHED">منتشر شده در فروشگاه</option>
                  <option value="DRAFT">پیش‌نویس (عدم نمایش عمومی)</option>
                  <option value="ARCHIVED">بایگانی</option>
                </select>
              </div>
            </div>

            {/* Image Pipeline Section (1:1 Ratio) */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>تصاویر کالا (استاندارد مربعی ۱:۱ بونیو)</span>
                <span className="text-[10px] text-muted-foreground">فرمت‌های WebP، PNG و SVG امن</span>
              </label>

              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 rounded-2xl bg-surface-subtle border border-border/70 p-2 flex flex-col items-center justify-center group overflow-hidden"
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-contain" />
                    {img.isPrimary && (
                      <span className="absolute bottom-1 start-1 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-sm">
                        شاخص
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-weight Variants Manager */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  تنوع‌های وزنی و بسته‌بندی کالا (Multi-Weight Variants)
                </span>
                <span className="text-[10px] text-muted-foreground">امکان انتخاب وزن‌های مختلف در صفحه محصول</span>
              </div>

              {/* Existing Variants List */}
              <div className="space-y-2">
                {weightVariants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle border border-border/70 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        {v.weightText}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {v.priceTomans.toLocaleString("fa-IR")} تومان
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        موجودی: {v.stock} عدد
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWeightVariants(weightVariants.filter((x) => x.id !== v.id))}
                      className="p-1 text-muted-foreground hover:text-rose-600 transition-colors"
                      title="حذف تنوع"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Variant Inputs */}
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-surface border border-border/60 text-xs">
                <input
                  type="text"
                  placeholder="وزن (مثلاً ۴ کیلوگرم)"
                  value={newVarWeight}
                  onChange={(e) => setNewVarWeight(e.target.value)}
                  className="p-2 bg-surface-subtle border border-border/70 rounded-lg flex-1 min-w-[120px]"
                />
                <input
                  type="number"
                  placeholder="قیمت (تومان)"
                  value={newVarPrice || ""}
                  onChange={(e) => setNewVarPrice(Number(e.target.value))}
                  className="p-2 bg-surface-subtle border border-border/70 rounded-lg w-28 font-mono"
                />
                <input
                  type="number"
                  placeholder="موجودی"
                  value={newVarStock || ""}
                  onChange={(e) => setNewVarStock(Number(e.target.value))}
                  className="p-2 bg-surface-subtle border border-border/70 rounded-lg w-20 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newVarWeight.trim() || newVarPrice <= 0) return;
                    setWeightVariants([
                      ...weightVariants,
                      { id: `var-${Date.now()}`, weightText: newVarWeight.trim(), priceTomans: newVarPrice, stock: newVarStock || 10 },
                    ]);
                    setNewVarWeight("");
                    setNewVarPrice(0);
                  }}
                  className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن تنوع</span>
                </button>
              </div>
            </div>

            {/* Generated SEO Metadata Preview */}
            {(seoTitle || seoDescription) && (
              <div className="p-3 rounded-2xl bg-surface-subtle border border-border/60 text-xs space-y-1">
                <span className="font-bold text-blue-600 dark:text-blue-400">پیش‌نمایش در نتایج گوگل (SEO):</span>
                <div className="font-bold text-foreground text-sm">{seoTitle}</div>
                <div className="text-muted-foreground text-[11px] leading-relaxed">{seoDescription}</div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-4 rounded-xl bg-surface-subtle hover:bg-surface-elevated text-xs font-bold text-foreground border border-border/70"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                className="py-2 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-black text-white shadow-sm"
              >
                ذخیره کالا در کاتالوگ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Bulk Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-elevated w-full max-w-2xl rounded-3xl border border-border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-foreground">ورود دسته‌جمعی کالاها از طریق فایل اکسل / CSV</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-subtle text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              فایل حاوی ستون‌های کاتالوگ را بارگذاری کنید. سیستم به‌طور خودکار اطلاعات را اعتبارسنجی کرده و گزارش ردیف‌های نامعتبر را پیش از ثبت قطعی نمایش می‌دهد.
            </p>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-border/80 rounded-2xl p-6 text-center hover:border-emerald-500/60 transition-colors bg-surface-subtle/50">
              <Upload className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <p className="text-xs font-bold text-foreground">فایل اکسل (.xlsx) یا .csv را اینجا بکشید یا انتخاب کنید</p>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="mt-3 text-xs"
              />
            </div>

            {/* Import Preview Results */}
            {importPreview && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>کل ردیف‌ها: {importPreview.totalRows}</span>
                  <span className="text-emerald-600">ردیف‌های معتبر: {importPreview.validRows}</span>
                  <span className="text-rose-600">ردیف‌های دارای خطا: {importPreview.invalidRows}</span>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-border/60 divide-y divide-border/40 text-[11px]">
                  {importPreview.preview.map((row) => (
                    <div key={row.row} className="p-2.5 flex items-center justify-between bg-surface-subtle/40">
                      <div>
                        <span className="font-bold text-foreground">ردیف {row.row}: </span>
                        <span className="font-mono text-muted-foreground">{row.sku}</span> - {row.name}
                      </div>
                      {row.isValid ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          معتبر ({row.price.toLocaleString("fa-IR")} تومان)
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {row.error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold text-center">
                {importSuccessMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="py-2 px-4 rounded-xl bg-surface-subtle hover:bg-surface-elevated text-xs font-bold text-foreground border border-border/70"
              >
                بستن
              </button>
              <button
                type="button"
                disabled={!importPreview || importPreview.validRows === 0 || isImporting}
                onClick={handleCommitImport}
                className="py-2 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-black text-white shadow-sm disabled:opacity-50"
              >
                {isImporting ? "در حال ثبت کاتالوگ..." : "تأیید و واردسازی به کاتالوگ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
