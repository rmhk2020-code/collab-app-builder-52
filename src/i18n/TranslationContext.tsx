import { createContext, useContext, ReactNode, useCallback } from "react";
import { translations, Language, TranslationKey } from "./translations";
import { useSettings } from "@/contexts/SettingsContext";

interface TranslationContextType {
  t: (key: TranslationKey) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: { code: Language; name: string }[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const languageNames: Record<Language, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const { appPreferences, setAppPreferences } = useSettings();
  
  const language = (appPreferences.language as Language) || "en";

  const t = useCallback((key: TranslationKey): string => {
    const langTranslations = translations[language] || translations.en;
    return langTranslations[key] || translations.en[key] || key;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setAppPreferences({
      ...appPreferences,
      language: lang,
    });
    // Also set the document language
    document.documentElement.lang = lang;
  }, [appPreferences, setAppPreferences]);

  const availableLanguages = Object.entries(languageNames).map(([code, name]) => ({
    code: code as Language,
    name,
  }));

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage, availableLanguages }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
