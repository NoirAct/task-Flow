import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { appApi } from "@/services/app";
import { cn } from "@/utils/cn";

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const { t } = useTranslation("dashboard");
  if (previous === 0 && current === 0) return null;
  const delta =
    previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
  const positive = delta >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
      )}
      title={t("comparisonHint")}
    >
      {positive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {positive ? "+" : ""}
      {delta}%
    </span>
  );
}

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

  const comparison = summary.comparison;

  const cards: Array<{ label: string; value: number | string; trend?: React.ReactNode }> = [
    { label: t("dashboard:pending"), value: summary.tasks.pending },
    { label: t("dashboard:inProgress"), value: summary.tasks.inProgress },
    {
      label: t("dashboard:done"),
      value: summary.tasks.done,
      trend: (
        <TrendBadge
          current={comparison.doneCurrent}
          previous={comparison.donePrevious}
        />
      ),
    },
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
            <div className="mt-2 flex items-center gap-2">
              <p className="text-3xl font-semibold tabular-nums text-fg">{card.value}</p>
              {card.trend}
            </div>
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
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-fg">{t("dashboard:activity")}</h2>
          <TrendBadge
            current={comparison.activityCurrent}
            previous={comparison.activityPrevious}
          />
        </div>
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
