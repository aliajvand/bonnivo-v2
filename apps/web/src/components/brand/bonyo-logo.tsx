"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BonyoLogoProps {
  variant?: "horizontal" | "mark" | "vertical" | "compact";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  showSubtitle?: boolean;
  subtitle?: string;
  showEnglishBrand?: boolean;
  themeMode?: "auto" | "dark" | "light";
}

export function BonyoLogo({
  variant = "horizontal",
  className,
  size = "md",
  href = "/",
  showSubtitle = false,
  subtitle = "اکوسیستم هوشمند زندگی و سلامت پت",
  showEnglishBrand = false,
  themeMode = "auto",
}: BonyoLogoProps) {
  // Sizing definitions
  const dimensions = {
    sm: { width: 28, height: 28, text: "text-lg", imgClass: "w-7 h-7" },
    md: { width: 36, height: 36, text: "text-2xl", imgClass: "w-9 h-9" },
    lg: { width: 44, height: 44, text: "text-3xl", imgClass: "w-11 h-11" },
    xl: { width: 56, height: 56, text: "text-4xl", imgClass: "w-14 h-14" },
  }[size];

  // Inverted class for image based on themeMode
  const imgInvertClass =
    themeMode === "dark"
      ? "brightness-0 invert"
      : themeMode === "light"
      ? ""
      : "dark:invert";

  // Text color based on themeMode
  const textColorClass =
    themeMode === "dark"
      ? "text-white"
      : themeMode === "light"
      ? "text-stone-900"
      : "text-stone-900 dark:text-white";

  // Official logo mark rendered from /icons/bonnivo-logo-mark.svg
  const LogoMark = (
    <div className={cn("relative shrink-0 flex items-center justify-center select-none", dimensions.imgClass)}>
      <Image
        src="/icons/bonnivo-logo-mark.svg"
        alt="لوگوی بنیوو"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className={cn("w-full h-full object-contain transition-all", imgInvertClass)}
      />
    </div>
  );

  const content = (
    <div
      className={cn(
        "flex items-center gap-2.5 select-none transition-transform hover:opacity-95 active:scale-[0.99]",
        variant === "vertical" && "flex-col text-center",
        className
      )}
    >
      {LogoMark}

      {variant !== "mark" && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 leading-none">
            {/* Primary Persian Brand Name */}
            <span
              className={cn(
                "font-black tracking-tight font-sans",
                textColorClass,
                dimensions.text
              )}
            >
              بنیوو
            </span>

            {/* English brand name only shown when explicitly requested (omitted by default for clean Persian look) */}
            {showEnglishBrand && (
              <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">
                BONNIVO
              </span>
            )}
          </div>

          {showSubtitle && (
            <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-1 font-light">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
        aria-label="بنیوو - صفحه اصلی"
      >
        {content}
      </Link>
    );
  }

  return content;
}
