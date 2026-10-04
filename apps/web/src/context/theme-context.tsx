"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Read stored preference or system preference
    const stored = localStorage.getItem("bonyo-theme") as Theme | null;
    const initial = stored || "light";
    setThemeState(initial);

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effectiveDark = initial === "dark" || (initial === "system" && prefersDark);
    setIsDark(effectiveDark);

    if (effectiveDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("bonyo-theme", newTheme);

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effectiveDark = newTheme === "dark" || (newTheme === "system" && prefersDark);
    setIsDark(effectiveDark);

    if (effectiveDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
