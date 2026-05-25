import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language =
  | 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu'
  | 'kn' | 'ml' | 'pa' | 'or' | 'as' | 'ur';

export interface LanguageOption {
  code: Language;
  nameEn: string;
  nameNative: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', nameEn: 'English',   nameNative: 'English' },
  { code: 'hi', nameEn: 'Hindi',     nameNative: 'हिन्दी' },
  { code: 'bn', nameEn: 'Bengali',   nameNative: 'বাংলা' },
  { code: 'ta', nameEn: 'Tamil',     nameNative: 'தமிழ்' },
  { code: 'te', nameEn: 'Telugu',    nameNative: 'తెలుగు' },
  { code: 'mr', nameEn: 'Marathi',   nameNative: 'मराठी' },
  { code: 'gu', nameEn: 'Gujarati',  nameNative: 'ગુજરાતી' },
  { code: 'kn', nameEn: 'Kannada',   nameNative: 'ಕನ್ನಡ' },
  { code: 'ml', nameEn: 'Malayalam', nameNative: 'മലയാളം' },
  { code: 'pa', nameEn: 'Punjabi',   nameNative: 'ਪੰਜਾਬੀ' },
  { code: 'or', nameEn: 'Odia',      nameNative: 'ଓଡ଼ିଆ' },
  { code: 'as', nameEn: 'Assamese',  nameNative: 'অসমীয়া' },
  { code: 'ur', nameEn: 'Urdu',      nameNative: 'اردو' },
];

export function languageName(code: Language): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.nameEn ?? 'English';
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, hi: string) => string;
  /** Full English name of the selected language — pass to AI requests. */
  aiLanguageName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'future_jaano_lang';

function isSupported(value: string | null): value is Language {
  return !!value && SUPPORTED_LANGUAGES.some(l => l.code === value);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isSupported(saved)) setLanguage(saved);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  // UI is bilingual (EN ↔ HI). For non-English Indian languages, UI shows Hindi
  // (closest available), but AI responses come back in the user's selected language.
  const t = (en: string, hi: string) => (language === 'en' ? en : hi);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t,
        aiLanguageName: languageName(language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
