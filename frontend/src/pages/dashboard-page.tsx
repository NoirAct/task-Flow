import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { appApi } from "@/services/app";

export function DashboardPage() {
  const { t } = useTranslation(["dashboard", "common"]);
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: appApi.dashboard,
  });

  const summary = data?.summary;

  if (isLoading || !summary) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  const cards = [
    { label: t("dashboard:pending"), value: summary.tasks.pending },
    { label: t("dashboard:inProgress"), value: summary.tasks.inProgress },
    { label: t("dashboard:done"), value: summary.tasks.done },
    { label: t("dashboard:hours"), value: summary.hoursWorked },
    { label: t("dashboard:productivity"), value: `${summary.productivity}%` },
    { label: t("dashboard:overdue"), value: summary.tasks.overdue },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("dashboard:title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {user ? `${user.name} · ${t("dashboard:subtitle")}` : t("dashboard:subtitle")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-fg-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-fg">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-fg-muted">{t("dashboard:projects")}</p>
          <p className="mt-2 text-2xl font-semibold">{summary.projectsCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-fg-muted">{t("dashboard:teams")}</p>
          <p className="mt-2 text-2xl font-semibold">{summary.teamCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-fg-muted">{t("dashboard:assigned")}</p>
          <p className="mt-2 text-2xl font-semibold">{summary.tasks.myAssigned}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-fg">{t("dashboard:activity")}</h2>
        {summary.activity.length === 0 ? (
          <p className="text-sm text-fg-muted">{t("dashboard:noActivity")}</p>
        ) : (
          <ul className="space-y-2">
            {summary.activity.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-fg">
                  <strong>{item.user.name}</strong> · {item.action}
                  {item.project ? ` · ${item.project.key}` : ""}
                </span>
                <span className="shrink-0 text-xs text-fg-subtle">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
