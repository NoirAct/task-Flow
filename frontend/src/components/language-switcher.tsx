import { useTranslation } from "react-i18next";
import { LOCALE_STORAGE_KEY } from "@/i18n";
import { cn } from "@/utils/cn";

type Locale = "pt-BR" | "en";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation("common");
  const current = (i18n.language === "en" ? "en" : "pt-BR") as Locale;

  function setLocale(locale: Locale) {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    void i18n.changeLanguage(locale);
  }

  return (
    <div className={cn("inline-flex rounded-md border border-border bg-surface p-0.5", className)}>
      <button
        type="button"
        onClick={() => setLocale("pt-BR")}
        className={cn(
          "rounded px-2.5 py-1 text-xs font-medium transition-colors",
          current === "pt-BR" ? "bg-canvas text-fg" : "text-fg-muted hover:text-fg",
        )}
        aria-label={t("language.pt")}
      >
        PT
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded px-2.5 py-1 text-xs font-medium transition-colors",
          current === "en" ? "bg-canvas text-fg" : "text-fg-muted hover:text-fg",
        )}
        aria-label={t("language.en")}
      >
        EN
      </button>
    </div>
  );
}
