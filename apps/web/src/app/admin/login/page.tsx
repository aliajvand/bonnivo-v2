"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldAlert, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { adminLogin, adminForgotPassword } from "@/lib/api/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage("لطفاً نام کاربری و گذرواژه را وارد نمایید.");
      return;
    }

    try {
      setIsLoading(true);
      await adminLogin(usernameOrEmail.trim(), password, rememberMe);
      router.push("/admin");
    } catch (err: any) {
      setErrorMessage(err.message || "نام کاربری یا گذرواژه نادرست است.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;

    try {
      setIsForgotLoading(true);
      const msg = await adminForgotPassword(forgotInput.trim());
      setForgotMessage(msg);
    } catch {
      setForgotMessage("در صورت وجود حساب کاربری، دستورالعمل ارسال شد.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f1] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-[#3c434a]">
      {/* WordPress-style Top Logo */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-16 h-16 rounded-full bg-[#1d2327] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <span className="text-2xl font-black tracking-tight text-emerald-400">B</span>
          </div>
        </Link>
        <h1 className="mt-3 text-lg font-bold text-[#1d2327]">ورود به مدیریت بونیو</h1>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[360px]">
        {/* Error Notice (Classic WP Style with red right border) */}
        {errorMessage && (
          <div
            className="mb-4 bg-white border border-[#c3c4c7] border-r-4 border-r-[#d63638] p-3 text-xs leading-relaxed text-[#2c3338] shadow-sm rounded-sm"
            role="alert"
          >
            <div className="flex items-center gap-2 font-medium text-[#d63638] mb-1">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>خطای احراز هویت</span>
            </div>
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="user_login" className="block text-xs font-semibold text-[#2c3338] mb-1.5">
                نام کاربری یا نشانی ایمیل
              </label>
              <input
                id="user_login"
                type="text"
                autoComplete="username"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#8c8f94] rounded text-sm focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-right dir-rtl transition-colors"
                placeholder="admin یا admin@bonnivo.ir"
              />
            </div>

            <div>
              <label htmlFor="user_pass" className="block text-xs font-semibold text-[#2c3338] mb-1.5">
                گذرواژه
              </label>
              <div className="relative">
                <input
                  id="user_pass"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-[#8c8f94] rounded text-sm focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-left dir-ltr transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8c8f94] hover:text-[#2c3338]"
                  title={showPassword ? "پنهان کردن گذرواژه" : "نمایش گذرواژه"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#50575e]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]"
                />
                <span>مرا به خاطر بسپار</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded text-sm font-semibold text-white bg-[#2271b1] hover:bg-[#135e96] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2271b1] disabled:opacity-50 transition-colors shadow-sm"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    در حال بررسی...
                  </span>
                ) : (
                  "ورود"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Navigation Links */}
        <div className="mt-4 flex flex-col items-center gap-2 text-xs text-[#50575e]">
          <button
            type="button"
            onClick={() => {
              setShowForgotModal(true);
              setForgotMessage(null);
            }}
            className="hover:text-[#2271b1] hover:underline transition-colors"
          >
            گذرواژه را فراموش کرده‌اید؟
          </button>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[#2271b1] hover:underline transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به بونیو</span>
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded border border-[#c3c4c7] shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#1d2327]">بازیابی گذرواژه مدیریت</h2>
            <p className="text-xs text-[#50575e] leading-relaxed">
              نام کاربری یا ایمیل خود را وارد کنید. در صورت تطابق، توکن ۳۰ دقیقه‌ای بازیابی ثبت خواهد شد.
            </p>

            {forgotMessage ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="text"
                  required
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  placeholder="نام کاربری یا ایمیل..."
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded text-xs focus:outline-none focus:border-[#2271b1]"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-[#50575e] hover:bg-neutral-100 rounded"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2271b1] hover:bg-[#135e96] rounded disabled:opacity-50"
                  >
                    {isForgotLoading ? "ارسال..." : "دریافت گذرواژه تازه"}
                  </button>
                </div>
              </form>
            )}

            {forgotMessage && (
              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 text-xs bg-[#2271b1] text-white rounded hover:bg-[#135e96]"
                >
                  بستن
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
