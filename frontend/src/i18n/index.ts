import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enAuth from "./locales/en/auth.json";
import enBoard from "./locales/en/board.json";
import enCalendar from "./locales/en/calendar.json";
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enNav from "./locales/en/nav.json";
import enProfile from "./locales/en/profile.json";
import enProjects from "./locales/en/projects.json";
import enTeam from "./locales/en/team.json";
import ptAuth from "./locales/pt-BR/auth.json";
import ptBoard from "./locales/pt-BR/board.json";
import ptCalendar from "./locales/pt-BR/calendar.json";
import ptCommon from "./locales/pt-BR/common.json";
import ptDashboard from "./locales/pt-BR/dashboard.json";
import ptNav from "./locales/pt-BR/nav.json";
import ptProfile from "./locales/pt-BR/profile.json";
import ptProjects from "./locales/pt-BR/projects.json";
import ptTeam from "./locales/pt-BR/team.json";

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
      team: enTeam,
      dashboard: enDashboard,
      calendar: enCalendar,
      profile: enProfile,
    },
    "pt-BR": {
      common: ptCommon,
      auth: ptAuth,
      nav: ptNav,
      projects: ptProjects,
      board: ptBoard,
      team: ptTeam,
      dashboard: ptDashboard,
      calendar: ptCalendar,
      profile: ptProfile,
    },
  },
  lng: initialLng,
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common", "auth", "nav", "projects", "board", "team", "dashboard", "calendar", "profile"],
  interpolation: { escapeValue: false },
});

export default i18n;
