import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

type EmptyStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  const { t } = useTranslation("common");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-canvas p-3 text-fg-subtle">
        <Inbox className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-fg">{title ?? t("empty.title")}</h3>
        <p className="mt-1 max-w-sm text-sm text-fg-muted">
          {description ?? t("empty.description")}
        </p>
      </div>
    </div>
  );
}
