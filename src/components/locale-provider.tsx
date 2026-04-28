"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "pt",
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("pt");

  useEffect(() => {
    const saved = localStorage.getItem("ai-peak-locale") as Locale | null;
    let detected: Locale = "pt";
    if (saved && ["pt", "en", "zh"].includes(saved)) {
      detected = saved;
    } else {
      // Auto-detect from browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("zh")) {
        detected = "zh";
      } else if (browserLang.startsWith("en")) {
        detected = "en";
      } else {
        detected = "pt";
      }
    }
    // Defer state update to avoid synchronous setState in effect
    const raf = requestAnimationFrame(() => setLocale(detected));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("ai-peak-locale", newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
