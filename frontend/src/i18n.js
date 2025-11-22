
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
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

// Initialize with stored language preference or default to English
const storedLang = localStorage.getItem("preferredLang") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: storedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
