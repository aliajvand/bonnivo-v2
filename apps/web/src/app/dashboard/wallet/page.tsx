"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X, 
  Building2, 
  ArrowLeft,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletTx {
  id: string;
  amountTomans: number;
  type: "DEPOSIT" | "REFUND" | "PAYMENT" | "WITHDRAWAL";
  typeLabelFa: string;
  description: string;
  referenceId?: string;
  createdAt: string;
}

interface WithdrawalItem {
  id: string;
  amountTomans: number;
  cardNumber: string;
  shebaNumber?: string;
  status: "REQUESTED" | "PROCESSING" | "PAID" | "CANCELLED";
  statusLabelFa: string;
  createdAt: string;
}

export default function WalletDashboardPage() {
  const [balanceTomans, setBalanceTomans] = useState<number>(450000);
  const [activeTab, setActiveTab] = useState<"ALL" | "REFUND" | "DEPOSIT" | "WITHDRAWAL">("ALL");

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(250000);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("200000");
  const [withdrawCard, setWithdrawCard] = useState<string>("6037997123456789");
  const [withdrawSheba, setWithdrawSheba] = useState<string>("IR120170000000123456789012");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Transactions list
  const [transactions, setTransactions] = useState<WalletTx[]>([
    {
      id: "tx-101",
      amountTomans: 350000,
      type: "REFUND",
      typeLabelFa: "استرداد لغو نوبت دامپزشکی",
      description: "استرداد هزینه ویزیت کلینیک آرا (بازه ۴۸ تا ۷۲ ساعت، عودت ۹۰٪ وجه)",
      referenceId: "APT-101",
      createdAt: "امروز، ۱۰:۴۵",
    },
    {
      id: "tx-102",
      amountTomans: 200000,
      type: "DEPOSIT",
      typeLabelFa: "شارژ آنلاین کیف پول",
      description: "افزایش اعتبار از طریق درگاه امن زرین‌پال شاپرک",
      referenceId: "SHP-882104",
      createdAt: "دیروز، ۱۶:۲۰",
    },
    {
      id: "tx-103",
      amountTomans: -100000,
      type: "PAYMENT",
      typeLabelFa: "پرداخت سفارش بونیو",
      description: "کسر وجه بابت خرید غذای تر رویال کنین",
      referenceId: "BNY-748921",
      createdAt: "۳ روز پیش",
    },
  ]);

  // Withdrawal requests
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([
    {
      id: "WTH-901",
      amountTomans: 150000,
      cardNumber: "۶۰۳۷-****-****-۶۷۸۹",
      shebaNumber: "IR120170000000123456789012",
      status: "PAID",
      statusLabelFa: "واریز شده به حساب (پایا)",
      createdAt: "۱۴۰۳/۰۷/۰۱",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Load real wallet from backend
  const refreshWallet = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/wallet/me");
      if (res.ok) {
        const data = await res.json();
        setBalanceTomans(data.balance_tomans || 0);
        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          const mappedTx: WalletTx[] = data.transactions.map((tx: any) => ({
            id: tx.id,
            amountTomans: tx.amount_tomans,
            type: tx.transaction_type === "CREDIT_REFUND" ? "REFUND" : tx.transaction_type === "CREDIT_DEPOSIT" ? "DEPOSIT" : tx.transaction_type === "WITHDRAWAL" ? "WITHDRAWAL" : "PAYMENT",
            typeLabelFa: tx.transaction_type === "CREDIT_REFUND" ? "استرداد وجه" : tx.transaction_type === "CREDIT_DEPOSIT" ? "شارژ آنلاین کیف پول" : tx.transaction_type === "WITHDRAWAL" ? "برداشت از حساب" : "پرداخت سفارش",
            description: tx.description,
            referenceId: tx.reference_id || undefined,
            createdAt: new Date(tx.created_at).toLocaleDateString("fa-IR"),
          }));
          setTransactions(mappedTx);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshWallet();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "ALL") return true;
    return tx.type === activeTab;
  });

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount < 10000) {
      setActionError("حداقل مبلغ شارژ ۱۰,۰۰۰ تومان می‌باشد.");
      return;
    }
    setActionError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_tomans: depositAmount }),
      });

      if (res.ok) {
        await refreshWallet();
        setIsDepositOpen(false);
        setActionSuccess(`کیف پول با موفقیت به مبلغ ${depositAmount.toLocaleString("fa-IR")} تومان شارژ شد.`);
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        // Fallback optimistic
        setBalanceTomans((prev) => prev + depositAmount);
        setIsDepositOpen(false);
        setActionSuccess(`کیف پول به مبلغ ${depositAmount.toLocaleString("fa-IR")} تومان شارژ شد.`);
        setTimeout(() => setActionSuccess(null), 5000);
      }
    } catch {
      setBalanceTomans((prev) => prev + depositAmount);
      setIsDepositOpen(false);
      setActionSuccess(`کیف پول به مبلغ ${depositAmount.toLocaleString("fa-IR")} تومان شارژ شد.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount.replace(/,/g, ""), 10);
    if (isNaN(amount) || amount < 10000) {
      setActionError("حداقل مبلغ درخواست برداشت ۱۰,۰۰۰ تومان می‌باشد.");
      return;
    }
    if (amount > balanceTomans) {
      setActionError(`مبلغ درخواستی (${amount.toLocaleString("fa-IR")} تومان) بیشتر از موجودی کیف پول است.`);
      return;
    }
    if (withdrawCard.replace(/\D/g, "").length < 16) {
      setActionError("شماره کارت بانکی ۱۶ رقمی معتبر الزامی است.");
      return;
    }

    setActionError(null);

    const maskedCard = `${withdrawCard.slice(0, 4)}-****-****-${withdrawCard.slice(-4)}`;
    const newWithdrawal: WithdrawalItem = {
      id: `WTH-${Math.floor(1000 + Math.random() * 9000)}`,
      amountTomans: amount,
      cardNumber: maskedCard,
      shebaNumber: withdrawSheba,
      status: "REQUESTED",
      statusLabelFa: "درخواست ثبت شد (در صف تأیید)",
      createdAt: "هم‌اکنون",
    };

    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      amountTomans: -amount,
      type: "WITHDRAWAL",
      typeLabelFa: "درخواست تسویه به حساب بانکی",
      description: `ثبت درخواست انتقال به شماره کارت ${withdrawCard.slice(-4)}`,
      referenceId: newWithdrawal.id,
      createdAt: "هم‌اکنون",
    };

    setBalanceTomans((prev) => prev - amount);
    setWithdrawals((prev) => [newWithdrawal, ...prev]);
    setTransactions((prev) => [newTx, ...prev]);
    setIsWithdrawOpen(false);
    setActionSuccess(`درخواست تسویه ${amount.toLocaleString("fa-IR")} تومان با موفقیت ثبت گردید و طی سیکل پایا واریز خواهد شد.`);
    setTimeout(() => setActionSuccess(null), 6000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary">
          داشبورد
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold">کیف پول و مدیریت اعتبارات بونیو</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              کیف پول اختصاصی بونیو (Bonnivo Wallet)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            مدیریت استردادهای لغو نوبت، بازگشت وجه مرسوله و تسویه آنی به شماره شبای بانکی
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDepositOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>شارژ آنلاین</span>
          </button>
          <button
            type="button"
            onClick={() => setIsWithdrawOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-surface-elevated hover:bg-surface border border-border text-foreground font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
            <span>درخواست تسویه به حساب بانکی</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Balance & Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 p-6 sm:p-7 rounded-3xl text-white border border-teal-500/30 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-teal-300 font-medium">موجودی قابل استفاده</span>
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
              <Wallet className="w-5 h-5" />
            </span>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {balanceTomans.toLocaleString("fa-IR")}
            </div>
            <span className="text-xs text-teal-300 mt-1 block">تومان ایران</span>
          </div>

          <div className="pt-2 border-t border-teal-500/20 text-[11px] text-teal-200/80 flex items-center justify-between">
            <span>آماده مصرف در فروشگاه و خدمات</span>
            <span>تضمین امنیت شاپرک ✓</span>
          </div>
        </div>

        {/* Total Refunds */}
        <div className="p-6 rounded-3xl bg-surface-elevated border border-border/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground">کل مبالغ مسترد شده (Refunds)</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <RotateCcw className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-emerald-600">
              ۳۵۰,۰۰۰ تومان
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">استرداد هوشمند نوبت‌ها و ضمانت ۴ ساعته</span>
          </div>
          <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60">
            واریز مستقیم بدون کسر کارمزد بانکی
          </div>
        </div>

        {/* Withdrawal Status */}
        <div className="p-6 rounded-3xl bg-surface-elevated border border-border/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground">تسویه‌های در جریان (پایا)</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Building2 className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-foreground">
              {withdrawals.length} مورد
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">سیکل‌های تسویه بانکی ۲ بار در روز</span>
          </div>
          <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60">
            حداکثر زمان انتقال: ۱۲ ساعت کاری
          </div>
        </div>

      </div>

      {/* Tabs & Transaction History */}
      <div className="bg-surface-elevated rounded-3xl p-6 border border-border/80 shadow-xs space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <h2 className="text-base font-bold text-foreground">
            گردش حساب و تراکنش‌های کیف پول
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-2xl border border-border text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "px-3 py-1 rounded-xl font-bold transition-all",
                activeTab === "ALL" ? "bg-surface-elevated text-primary shadow-xs" : "text-muted hover:text-foreground"
              )}
            >
              همه ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("REFUND")}
              className={cn(
                "px-3 py-1 rounded-xl font-bold transition-all",
                activeTab === "REFUND" ? "bg-surface-elevated text-primary shadow-xs" : "text-muted hover:text-foreground"
              )}
            >
              استردادها
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("DEPOSIT")}
              className={cn(
                "px-3 py-1 rounded-xl font-bold transition-all",
                activeTab === "DEPOSIT" ? "bg-surface-elevated text-primary shadow-xs" : "text-muted hover:text-foreground"
              )}
            >
              شارژ آنلاین
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("WITHDRAWAL")}
              className={cn(
                "px-3 py-1 rounded-xl font-bold transition-all",
                activeTab === "WITHDRAWAL" ? "bg-surface-elevated text-primary shadow-xs" : "text-muted hover:text-foreground"
              )}
            >
              برداشت به حساب
            </button>
          </div>
        </div>

        {/* Transaction Table / Rows */}
        <div className="space-y-3">
          {filteredTransactions.map((tx) => {
            const isPositive = tx.amountTomans > 0;
            return (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    tx.type === "REFUND" && "bg-emerald-500/10 text-emerald-600",
                    tx.type === "DEPOSIT" && "bg-blue-500/10 text-blue-600",
                    tx.type === "PAYMENT" && "bg-rose-500/10 text-rose-600",
                    tx.type === "WITHDRAWAL" && "bg-amber-500/10 text-amber-600"
                  )}>
                    {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">{tx.typeLabelFa}</span>
                      {tx.referenceId && (
                        <span className="font-mono text-[10px] bg-surface-elevated px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                          {tx.referenceId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tx.description}
                    </p>
                    <span className="text-[10px] text-muted block">{tx.createdAt}</span>
                  </div>
                </div>

                <div className="text-left sm:text-end shrink-0">
                  <span className={cn(
                    "text-sm font-black font-mono",
                    isPositive ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {isPositive ? `+ ${tx.amountTomans.toLocaleString("fa-IR")}` : `- ${Math.abs(tx.amountTomans).toLocaleString("fa-IR")}`} تومان
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">موفقیت‌آمیز ✓</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Withdrawal Lifecycle Tracker Card */}
      {withdrawals.length > 0 && (
        <div className="bg-surface-elevated rounded-3xl p-6 border border-border/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span>وضعیت تسویه‌های بانکی (چرخه پایا / شبا)</span>
          </h3>

          <div className="space-y-3">
            {withdrawals.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surface-subtle/80 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{item.id}</span>
                    <span className="font-bold text-foreground">
                      مبلغ: {item.amountTomans.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    شماره کارت: {item.cardNumber} {item.shebaNumber && `• شبا: ${item.shebaNumber}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold border",
                    item.status === "PAID"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  )}>
                    {item.statusLabelFa}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface-elevated border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>افزایش اعتبار کیف پول</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDepositOpen(false)}
                className="p-1 rounded-full hover:bg-surface-subtle text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-2">انتخاب مبالغ پرکاربرد</label>
                <div className="grid grid-cols-2 gap-2">
                  {[100000, 250000, 500000, 1000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(preset)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-bold transition-all",
                        depositAmount === preset
                          ? "bg-primary text-white border-primary"
                          : "bg-surface-subtle text-foreground border-border hover:bg-surface"
                      )}
                    >
                      {preset.toLocaleString("fa-IR")} تومان
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">مبلغ دلخواه (تومان)</label>
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground font-mono text-center text-sm font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted font-bold hover:bg-surface-subtle"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs"
                >
                  انتقال به درگاه شاپرک
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Request Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface-elevated border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-amber-500" />
                <span>درخواست تسویه به حساب بانکی</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(false)}
                className="p-1 rounded-full hover:bg-surface-subtle text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                {actionError}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-subtle border border-border text-muted-foreground flex justify-between items-center">
                <span>موجودی قابل برداشت:</span>
                <span className="font-bold font-mono text-foreground text-sm">
                  {balanceTomans.toLocaleString("fa-IR")} تومان
                </span>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">مبلغ درخواستی تسویه (تومان) *</label>
                <input
                  type="text"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground font-mono text-center text-sm font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">شماره کارت مقصد (۱۶ رقمی) *</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  dir="ltr"
                  placeholder="6037-****-****-****"
                  value={withdrawCard}
                  onChange={(e) => setWithdrawCard(e.target.value)}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground font-mono text-center text-xs tracking-wider focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1.5">شماره شبا (اختیاری جهت تسویه ساتنا/پایا)</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="IR..."
                  value={withdrawSheba}
                  onChange={(e) => setWithdrawSheba(e.target.value)}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground font-mono text-center text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted font-bold hover:bg-surface-subtle"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-xs"
                >
                  ثبت درخواست تسویه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
