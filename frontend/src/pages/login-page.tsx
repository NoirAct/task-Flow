import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/contexts/auth-context";
import { useAuthErrorMessage } from "@/hooks/use-auth-error";

export function LoginPage() {
  const { t } = useTranslation("auth");
  const { login } = useAuth();
  const navigate = useNavigate();
  const getError = useAuthErrorMessage();
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z.object({
    email: z.string().email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.required")),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      navigate("/app", { replace: true });
    } catch (error) {
      setFormError(getError(error));
    }
  });

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("subtitle")}</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <Input
          label={t("fields.email")}
          type="email"
          autoComplete="email"
          placeholder={t("placeholders.email")}
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label={t("fields.password")}
          autoComplete="current-password"
          placeholder={t("placeholders.password")}
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-accent hover:underline">
            {t("links.forgotPassword")}
          </Link>
        </div>

        {formError ? (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>
        ) : null}

        <Button type="submit" loading={isSubmitting} className="w-full">
          {t("actions.login")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        {t("links.noAccount")}{" "}
        <Link to="/register" className="font-medium text-accent hover:underline">
          {t("links.createOne")}
        </Link>
      </p>
    </div>
  );
}
