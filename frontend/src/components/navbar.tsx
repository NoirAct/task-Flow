import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";

type NavbarProps = {
  onOpenCommand: () => void;
};

export function Navbar({ onOpenCommand }: NavbarProps) {
  const { t } = useTranslation(["nav", "common"]);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4">
      <button
        type="button"
        onClick={onOpenCommand}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-canvas px-3 py-2 text-left text-sm text-fg-subtle hover:border-fg-subtle/50"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">{t("nav:search")}</span>
        <kbd className="ml-auto hidden rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-1.5">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <div className="relative">
          <Tooltip content={t("nav:notifications")}>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("nav:notifications")}
              onClick={() => setOpen((current) => !current)}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-danger" />
              ) : null}
            </Button>
          </Tooltip>

          {open ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-20"
                aria-label="Close"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <p className="text-sm font-medium">{t("nav:notifications")}</p>
                  <button
                    type="button"
                    className="text-xs text-accent hover:underline"
                    onClick={() => void markAllRead()}
                  >
                    Mark all
                  </button>
                </div>
                <ul className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-fg-muted">—</li>
                  ) : (
                    notifications.slice(0, 20).map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`block w-full px-3 py-2 text-left hover:bg-canvas ${
                            item.readAt ? "opacity-70" : ""
                          }`}
                          onClick={() => {
                            void markRead(item.id);
                            setOpen(false);
                          }}
                        >
                          <p className="text-sm font-medium text-fg">{item.title}</p>
                          {item.body ? (
                            <p className="text-xs text-fg-muted">{item.body}</p>
                          ) : null}
                          {item.link ? (
                            <Link
                              to={item.link}
                              className="text-[11px] text-accent hover:underline"
                              onClick={(event) => event.stopPropagation()}
                            >
                              Open
                            </Link>
                          ) : null}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {user ? (
          <div className="ml-1 flex items-center gap-2 border-l border-border pl-3">
            <Link to="/app/settings">
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            </Link>
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
