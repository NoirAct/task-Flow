import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthErrorMessage } from "@/hooks/use-auth-error";
import { authApi } from "@/services/auth";

export function ResetPasswordPage() {
  const { t } = useTranslation("auth");
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const getError = useAuthErrorMessage();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const schema = z
    .object({
      password: z.string().min(8, t("validation.passwordMin")),
      confirmPassword: z.string().min(1, t("validation.required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    if (!token) {
      setFormError(t("errors.INVALID_RESET_TOKEN"));
      return;
    }
    try {
      await authApi.resetPassword(token, values.password);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (error) {
      setFormError(getError(error));
    }
  });

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("resetTitle")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("resetSubtitle")}</p>
      </div>

      {success ? (
        <div className="space-y-4">
          <p className="rounded-md bg-success-soft px-3 py-2 text-sm text-success">
            {t("messages.resetSuccess")}
          </p>
          <Link to="/login" className="inline-block text-sm font-medium text-accent hover:underline">
            {t("actions.backToLogin")}
          </Link>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <PasswordInput
            label={t("fields.password")}
            autoComplete="new-password"
            placeholder={t("placeholders.password")}
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordInput
            label={t("fields.confirmPassword")}
            autoComplete="new-password"
            placeholder={t("placeholders.password")}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {formError ? (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>
          ) : null}

          <Button type="submit" loading={isSubmitting} className="w-full">
            {t("actions.reset")}
          </Button>
        </form>
      )}
    </div>
  );
}
