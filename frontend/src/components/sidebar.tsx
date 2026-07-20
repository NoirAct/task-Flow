import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

const links: Array<{
  to: string;
  icon: typeof LayoutDashboard;
  labelKey: "dashboard" | "projects" | "calendar" | "team" | "settings";
  end?: boolean;
}> = [
  { to: "/app", icon: LayoutDashboard, labelKey: "dashboard", end: true },
  { to: "/app/projects", icon: FolderKanban, labelKey: "projects" },
  { to: "/app/calendar", icon: CalendarDays, labelKey: "calendar" },
  { to: "/app/team", icon: Users, labelKey: "team" },
  { to: "/app/settings", icon: Settings, labelKey: "settings" },
];

export function Sidebar() {
  const { t } = useTranslation(["nav", "common"]);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-fg">
          TF
        </div>
        <span className="text-sm font-semibold tracking-tight text-fg">
          {t("common:app.name")}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ to, icon: Icon, labelKey, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-fg-muted hover:bg-canvas hover:text-fg",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {t(`nav:${labelKey}`)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
