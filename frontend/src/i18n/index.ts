import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enAuth from "./locales/en/auth.json";
import enBoard from "./locales/en/board.json";
import enCommon from "./locales/en/common.json";
import enNav from "./locales/en/nav.json";
import enProjects from "./locales/en/projects.json";
import ptAuth from "./locales/pt-BR/auth.json";
import ptBoard from "./locales/pt-BR/board.json";
import ptCommon from "./locales/pt-BR/common.json";
import ptNav from "./locales/pt-BR/nav.json";
import ptProjects from "./locales/pt-BR/projects.json";

export const LOCALE_STORAGE_KEY = "taskflow.locale";

const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
const initialLng = savedLocale === "en" || savedLocale === "pt-BR" ? savedLocale : "pt-BR";

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      nav: enNav,
      projects: enProjects,
      board: enBoard,
    },
    "pt-BR": {
      common: ptCommon,
      auth: ptAuth,
      nav: ptNav,
      projects: ptProjects,
      board: ptBoard,
    },
  },
  lng: initialLng,
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common", "auth", "nav", "projects", "board"],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
