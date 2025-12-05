import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslations from "./i18n/en";
import hiTranslations from "./i18n/hi";
import asTranslations from "./i18n/as";

const resources = {
  en: {
    translation: enTranslations,
  },
  hi: {
    translation: hiTranslations,
  },
  as: {
    translation: asTranslations,
  },
};


const getInitialLanguage = () => {
  try {
    const stored = localStorage.getItem("preferredLang");
    if (stored && resources[stored]) {
      return stored;
    }
    
    
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split("-")[0].toLowerCase();
    
    if (resources[langCode]) {
      return langCode;
    }
    
    return "en";
  } catch (error) {
    console.warn("Error detecting language:", error);
    return "en";
  }
};

const initialLanguage = getInitialLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    supportedLngs: ["en", "hi", "as"],
    nonExplicitSupportedLngs: false,
    
    
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "preferredLang",
    },
    
    
    interpolation: {
      escapeValue: false, 
      formatSeparator: ",",
    },
    
    
    react: {
      useSuspense: false,
    },
    
    
    debug: process.env.NODE_ENV === "development",
    
    
    saveMissing: false,
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },
    
    
    defaultNS: "translation",
    ns: ["translation"],
  });


i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("preferredLang", lng);
    document.documentElement.lang = lng;
  } catch (error) {
    console.warn("Error saving language preference:", error);
  }
});


if (typeof document !== "undefined") {
  document.documentElement.lang = initialLanguage;
}

export default i18n;
