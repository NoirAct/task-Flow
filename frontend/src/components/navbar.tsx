import { Bell, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";

export function Navbar() {
  const { t } = useTranslation(["nav", "common"]);
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-canvas px-3 py-2 text-sm text-fg-subtle">
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">{t("nav:search")}</span>
        <kbd className="ml-auto hidden rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle sm:inline">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-1.5">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <Tooltip content={t("nav:notifications")}>
          <Button variant="ghost" size="sm" aria-label={t("nav:notifications")}>
            <Bell className="h-4 w-4" />
          </Button>
        </Tooltip>

        {user ? (
          <div className="ml-1 flex items-center gap-2 border-l border-border pl-3">
            <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium text-fg">{user.name}</p>
              <button
                type="button"
                onClick={() => void logout()}
                className="text-xs text-fg-muted hover:text-fg"
              >
                {t("common:actions.logout")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
