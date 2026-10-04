"use client";

import { useState } from "react";
import {
  MessageSquare,
  Headphones,
  PhoneCall,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "ai",
    text: "سلام! من دستیار هوشمند بونیو هستم. هر سوالی درباره تغذیه، سلامت، انتخاب محصول یا وضعیت سفارش‌های پت‌تون دارید از من بپرسید!",
    time: "هم‌اکنون",
  },
];

const SUGGESTIONS = [
  "بهترین رژیم غذایی برای کنترل وزن پت چیه؟",
  "چطور وضعیت پت گمشده را فعال کنم؟",
  "ارسال سفارشات تهران چند ساعت طول می‌کشه؟",
];

export function SupportDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      time: "هم‌اکنون",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // AI smart response simulation
    setTimeout(() => {
      let reply = "بله، تیم متخصص تغذیه و سلامت بونیو همیشه اینجاست. در صورتی که نیاز به بررسی دقیق پزشکی دارید، پیشنهاد می‌کنیم از بخش پاسپورت سلامت با دامپزشک آنلاین مشورت کنید.";

      if (text.includes("وزن") || text.includes("غذا")) {
        reply = "برای کنترل وزن پت، محاسبه‌گر هوشمند بازسفارش بونیو بر اساس وزن فعلی و نژاد، حجم استاندارد روزانه را در داشبورد مراقبت مشخص می‌کند. پیشنهاد می‌کنیم از غذاهای کم‌کالری با فیبر بالا استفاده کنید.";
      } else if (text.includes("گم") || text.includes("پاسپورت")) {
        reply = "در صورت مفقودی، کافیست وارد بخش «پاسپورت QR» در داشبورد شوید و دکمه «اعلام وضعیت حیوان گم شده» را بزنید تا هر یابنده‌ای با اسکن قلاده، فوراً با شما تماس بگیرد و لوکیشن ارسال شود.";
      } else if (text.includes("ارسال") || text.includes("تهران")) {
        reply = "کلیه سفارش‌های داخل تهران در دو شیفت سریع (صبح ۱۰ تا ۱۴ و عصر ۱۶ تا ۲۰) با بسته‌بندی ایمن و ضمانت بازگشت ۴ ساعته ارسال می‌شوند.";
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: reply,
        time: "هم‌اکنون",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <>
      {/* Floating Launcher Button (Positioned at Bottom-Right per request) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl transition-all transform hover:scale-105 active:scale-95 group border border-white/20 select-none"
        aria-label="پشتیبانی و دستیار هوشمند بونیو"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
          <span className="w-2 h-2 rounded-full bg-emerald-300 absolute -top-0.5 -right-0.5 animate-ping" />
        </div>
        <span className="text-xs font-bold hidden sm:inline">دستیار هوشمند بونیو</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="glass-card w-full max-w-md h-full bg-background/95 backdrop-blur-xl border-l border-border/80 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-border/50 flex items-center justify-between bg-surface-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">دستیار هوشمند بونیو</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-muted">پاسخگوی آنلاین ۲۴ ساعته</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Phone Support Hotline Banner */}
            <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-primary font-bold">
                <PhoneCall className="w-4 h-4" />
                <span>پشتیبانی تلفنی اضطراری:</span>
              </div>
              <a
                href="tel:02191000000"
                className="font-mono font-black text-primary hover:underline dir-ltr text-xs bg-white px-2.5 py-1 rounded-full border border-primary/20"
              >
                ۰۲۱-۹۱۰۰۰۰۰۰
              </a>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${
                    m.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                      m.sender === "user"
                        ? "bg-primary text-white"
                        : "bg-surface-subtle border border-border text-primary"
                    }`}
                  >
                    {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-primary text-white font-medium"
                        : "bg-surface-subtle border border-border/70 text-foreground"
                    }`}
                  >
                    <p>{m.text}</p>
                    <span
                      className={`text-[10px] block mt-1 ${
                        m.sender === "user" ? "text-white/70 text-left" : "text-muted text-right"
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <div className="w-7 h-7 rounded-xl bg-surface-subtle border border-border flex items-center justify-center text-primary">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-surface-subtle rounded-2xl px-4 py-2 text-xs">
                    <span className="animate-pulse">در حال نگارش پاسخ...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="p-3 bg-surface-subtle/50 border-t border-border/50 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-border/60 text-[11px] text-muted hover:text-foreground hover:border-primary transition-all text-right"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-border/60 bg-surface-subtle">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="سوال خود را اینجا بنویسید..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-2xl bg-white border border-border/70 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  className="w-11 h-11 rounded-2xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4 transform rotate-180" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
