import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/empty-state";

export function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation("nav");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">{t(titleKey)}</h1>
      <EmptyState description={t("comingSoon")} />
    </div>
  );
}
