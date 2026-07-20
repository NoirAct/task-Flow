import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/theme-context";

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation("common");
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Tooltip content={t(`theme.${next}`)}>
      <Button
        variant="ghost"
        size="sm"
        aria-label={t("theme.label")}
        onClick={() => setTheme(next)}
      >
        {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </Tooltip>
  );
}
