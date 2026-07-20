import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";

export function DashboardPage() {
  const { t } = useTranslation(["nav", "common"]);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("nav:dashboard")}</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {user ? `${user.name} · ${user.email}` : null}
          </p>
        </div>
        <Badge tone="accent">{t("nav:comingSoon")}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {["pending", "inProgress", "done"].map((key) => (
          <div
            key={key}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <p className="text-sm text-fg-muted">{t("nav:comingSoon")}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-fg">—</p>
          </div>
        ))}
      </div>

      <EmptyState
        title={t("common:empty.title")}
        description={t("common:empty.description")}
      />
    </div>
  );
}
