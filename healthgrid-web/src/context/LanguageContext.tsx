'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, SUPPORTED_LANGUAGES, LanguageOption } from '@/lib/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hi',
  setLang: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('hi');

  useEffect(() => {
    const saved = localStorage.getItem('jh_healthgrid_lang') as Language;
    if (saved && (saved === 'hi' || saved === 'en' || saved === 'sant' || saved === 'bn')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('jh_healthgrid_lang', newLang);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[lang] || translations.hi;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to Hindi or English
    if (translations.hi[key]) return translations.hi[key];
    if (translations.en[key]) return translations.en[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
