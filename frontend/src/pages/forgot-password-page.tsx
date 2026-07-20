import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthErrorMessage } from "@/hooks/use-auth-error";
import { authApi } from "@/services/auth";

export function ForgotPasswordPage() {
  const { t } = useTranslation("auth");
  const getError = useAuthErrorMessage();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const schema = z.object({
    email: z.string().email(t("validation.emailInvalid")),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setDevResetUrl(null);
    try {
      const result = await authApi.forgotPassword(values.email);
      setSuccess(true);
      if (result.resetUrl) setDevResetUrl(result.resetUrl);
    } catch (error) {
      setFormError(getError(error));
    }
  });

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("forgotTitle")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("forgotSubtitle")}</p>
      </div>

      {success ? (
        <div className="space-y-4">
          <p className="rounded-md bg-success-soft px-3 py-2 text-sm text-success">
            {t("messages.forgotSent")}
          </p>
          {devResetUrl ? (
            <div className="rounded-md border border-border bg-canvas p-3 text-sm">
              <p className="mb-2 text-fg-muted">{t("messages.devResetHint")}</p>
              <a href={devResetUrl} className="break-all text-accent hover:underline">
                {devResetUrl}
              </a>
            </div>
          ) : null}
          <Link to="/login" className="inline-block text-sm font-medium text-accent hover:underline">
            {t("actions.backToLogin")}
          </Link>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <Input
            label={t("fields.email")}
            type="email"
            autoComplete="email"
            placeholder={t("placeholders.email")}
            error={errors.email?.message}
            {...register("email")}
          />

          {formError ? (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>
          ) : null}

          <Button type="submit" loading={isSubmitting} className="w-full">
            {t("actions.forgot")}
          </Button>

          <Link
            to="/login"
            className="text-center text-sm font-medium text-accent hover:underline"
          >
            {t("actions.backToLogin")}
          </Link>
        </form>
      )}
    </div>
  );
}
