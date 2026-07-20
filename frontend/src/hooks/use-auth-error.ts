import { useTranslation } from "react-i18next";
import { ApiError } from "@/services/api";

export function useAuthErrorMessage() {
  const { t } = useTranslation(["auth", "common"]);

  return (error: unknown) => {
    if (error instanceof ApiError && error.code) {
      const key = `errors.${error.code}` as const;
      const translated = t(key, { ns: "auth", defaultValue: "" });
      if (translated) return translated;
    }
    if (error instanceof Error && error.message === "Failed to fetch") {
      return t("common:errors.network");
    }
    return t("common:errors.generic");
  };
}
