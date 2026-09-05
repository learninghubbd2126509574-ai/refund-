import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  isBn: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  toggleLanguage: () => {},
  setLanguage: () => {},
  isBn: true,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('unity_app_lang');
    if (saved === 'en' || saved === 'bn') {
      return saved;
    }
    return 'bn'; // Default to Bengali as requested
  });

  useEffect(() => {
    localStorage.setItem('unity_app_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        setLanguage,
        isBn: language === 'bn',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
