import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useAuthErrorMessage } from "@/hooks/use-auth-error";

export function RegisterPage() {
  const { t } = useTranslation("auth");
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const getError = useAuthErrorMessage();
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z
    .object({
      name: z.string().min(2, t("validation.nameMin")),
      email: z.string().email(t("validation.emailInvalid")),
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
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerUser(values.name, values.email, values.password);
      navigate("/app", { replace: true });
    } catch (error) {
      setFormError(getError(error));
    }
  });

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("registerTitle")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("registerSubtitle")}</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <Input
          label={t("fields.name")}
          autoComplete="name"
          placeholder={t("placeholders.name")}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label={t("fields.email")}
          type="email"
          autoComplete="email"
          placeholder={t("placeholders.email")}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label={t("fields.password")}
          type="password"
          autoComplete="new-password"
          placeholder={t("placeholders.password")}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label={t("fields.confirmPassword")}
          type="password"
          autoComplete="new-password"
          placeholder={t("placeholders.password")}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {formError ? (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>
        ) : null}

        <Button type="submit" loading={isSubmitting} className="w-full">
          {t("actions.register")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        {t("links.hasAccount")}{" "}
        <Link to="/login" className="font-medium text-accent hover:underline">
          {t("links.signIn")}
        </Link>
      </p>
    </div>
  );
}
