import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTranslation } from "react-i18next";

export function AuthLayout() {
  const { t } = useTranslation("common");

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--accent) 18%, transparent), transparent), linear-gradient(to bottom, transparent, var(--canvas))",
        }}
      />

      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-fg">
            TF
          </div>
          <div>
            <p className="text-sm font-semibold text-fg">{t("app.name")}</p>
            <p className="text-xs text-fg-muted">{t("app.tagline")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-16 pt-8">
        <Outlet />
      </main>
    </div>
  );
}
