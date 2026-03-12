"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "./dictionaries/en";

// Lazy-load non-English dictionaries
const DICT_LOADERS: Record<string, () => Promise<{ default: Record<string, string> }>> = {
  ms: () => import("./dictionaries/ms"),
  id: () => import("./dictionaries/id"),
  th: () => import("./dictionaries/th"),
  vi: () => import("./dictionaries/vi"),
  zh: () => import("./dictionaries/zh"),
};

export type Locale = "en" | "ms" | "id" | "th" | "vi" | "zh";

export interface LocaleInfo {
  code: Locale;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: "en", nativeLabel: "English", flag: "🇬🇧" },
  { code: "ms", nativeLabel: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "id", nativeLabel: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "th", nativeLabel: "ภาษาไทย", flag: "🇹🇭" },
  { code: "vi", nativeLabel: "Tiếng Việt", flag: "🇻🇳" },
  { code: "zh", nativeLabel: "中文", flag: "🇨🇳" },
];

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
});

const STORAGE_KEY = "finlytics-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [dict, setDict] = useState<Record<string, string>>(en);

  // Read from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && DICT_LOADERS[saved]) {
      setLocaleState(saved);
    }
  }, []);

  // Load dictionary when locale changes
  useEffect(() => {
    if (locale === "en") {
      setDict(en);
    } else {
      DICT_LOADERS[locale]?.().then((mod) => setDict(mod.default));
    }
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string): string => dict[key] ?? en[key] ?? key,
    [dict]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
