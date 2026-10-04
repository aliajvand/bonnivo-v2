"use client";

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent, ClipboardEvent } from "react";
import Image from "next/image";
import { 
  X, 
  Phone, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export function OtpAuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    activeStep, 
    setActiveStep,
    phoneNumber, 
    countdownSeconds, 
    isTimerActive, 
    requestOtp, 
    verifyOtp, 
    resendOtp 
  } = useAuth();

  const [inputPhone, setInputPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP field when entering OTP step
  useEffect(() => {
    if (activeStep === "OTP_VERIFY") {
      setOtpDigits(["", "", "", "", ""]);
      setErrorMessage(null);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [activeStep]);

  if (!isAuthModalOpen) return null;

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await requestOtp(inputPhone);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message || "خطا در برقراری ارتباط");
    }
  };

  const handleOtpDigitChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) {
      const copy = [...otpDigits];
      copy[index] = "";
      setOtpDigits(copy);
      return;
    }

    const char = val.slice(-1); // Take last entered digit
    const copy = [...otpDigits];
    copy[index] = char;
    setOtpDigits(copy);

    // Auto-advance to next input
    if (index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 5);
    if (pasted.length === 5) {
      setOtpDigits(pasted.split(""));
      inputRefs.current[4]?.focus();
    }
  };

  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 5) {
      setErrorMessage("لطفاً تمامی ۵ رقم کد تأیید را وارد کنید.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const res = await verifyOtp(code);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message || "کد تأیید نامعتبر است.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div 
        className="relative w-full max-w-md rounded-4xl p-6 sm:p-8 bg-surface border border-border/80 shadow-2xl space-y-6 text-foreground animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 start-5 p-2 rounded-full bg-surface-subtle hover:bg-black/5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="بستن پنجره"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center p-2 border border-primary/20">
            <Image
              src="/icons/bonnivo-logo-mark.svg"
              alt="بونیو"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            {activeStep === "PHONE_ENTRY" && "ورود یا ثبت‌نام در بونیو"}
            {activeStep === "OTP_VERIFY" && "تأیید شماره موبایل"}
            {activeStep === "SUCCESS" && "خوش آمدید!"}
          </h2>

          <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
            {activeStep === "PHONE_ENTRY" && "برای دسترسی به پرونده هوشمند پت، برنامه مراقبت و ثبت سفارش"}
            {activeStep === "OTP_VERIFY" && `کد تأیید پیامک‌شده به شماره ${phoneNumber} را وارد کنید.`}
            {activeStep === "SUCCESS" && "ورود شما با موفقیت انجام شد."}
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Phone Entry */}
        {activeStep === "PHONE_ENTRY" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                شماره موبایل خود را وارد کنید:
              </label>
              
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  required
                  autoFocus
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="09123456789"
                  maxLength={11}
                  className="w-full bg-surface-subtle text-foreground text-sm font-mono tracking-widest p-3.5 ps-10 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
                />
                <Phone className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
              <span className="text-[10px] text-muted-foreground block">
                کد یکبار مصرف ۵ رقمی جهت احراز هویت پیامک خواهد شد.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || inputPhone.length < 10}
              className={cn(
                "w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2",
                (isSubmitting || inputPhone.length < 10) && "opacity-60 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <span>در حال ارسال پیامک...</span>
              ) : (
                <>
                  <span>دریافت کد تأیید پیامکی</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 5-Digit OTP Verification */}
        {activeStep === "OTP_VERIFY" && (
          <form onSubmit={handleOtpVerifySubmit} className="space-y-5">
            {/* Discrete 5 Boxes */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3" dir="ltr">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={cn(
                    "w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl border bg-surface-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary/30",
                    digit ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground"
                  )}
                />
              ))}
            </div>

            {/* Timer & Resend Controls */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setActiveStep("PHONE_ENTRY")}
                className="text-muted-foreground hover:text-primary transition-colors text-[11px]"
              >
                ویرایش شماره موبایل
              </button>

              <div className="flex items-center gap-2">
                {isTimerActive ? (
                  <span className="font-mono text-muted-foreground font-bold">
                    {formatTimer(countdownSeconds)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="inline-flex items-center gap-1 text-primary font-bold hover:underline text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ارسال مجدد کد</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpDigits.join("").length !== 5}
              className={cn(
                "w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2",
                (isSubmitting || otpDigits.join("").length !== 5) && "opacity-60 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <span>در حال اعتبارسنجی کد...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>تأیید و ورود به حساب</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Success Animation */}
        {activeStep === "SUCCESS" && (
          <div className="py-6 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 animate-in zoom-in-90 duration-300">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <p className="text-sm font-bold text-foreground">
              ورود شما با موفقیت تأیید شد
            </p>
          </div>
        )}

        {/* Security Reassurance */}
        <div className="text-center pt-2 border-t border-border/50 text-[10px] text-muted flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>احراز هویت امن و رمزنگاری‌شده توسط بونیو</span>
        </div>

      </div>
    </div>
  );
}
