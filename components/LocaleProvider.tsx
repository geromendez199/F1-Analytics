"use client";

import { createContext, useContext, useEffect } from "react";
import type { Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("es");

export function useLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({
  locale,
  children
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
