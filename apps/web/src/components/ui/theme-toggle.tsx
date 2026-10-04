"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "تغییر به تم روشن" : "تغییر به تم تاریک"}
      className={cn(
        "relative p-2 rounded-xl transition-all duration-200 flex items-center gap-2",
        "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
        className
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-300" />
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? "حالت روز" : "حالت شب"}
        </span>
      )}
    </button>
  );
}
