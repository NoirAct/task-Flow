import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Project } from "@/types/project";

const COLORS = ["#1f6feb", "#1a7f37", "#bf8700", "#cf222e", "#8250df", "#0550ae"];

type ProjectFormDialogProps = {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
  onSubmit: (values: {
    name: string;
    description?: string | null;
    key?: string;
    color: string;
  }) => Promise<void>;
};

export function ProjectFormDialog({
  open,
  onClose,
  project,
  onSubmit,
}: ProjectFormDialogProps) {
  const { t } = useTranslation(["projects", "common"]);
  const isEdit = Boolean(project);

  const schema = z.object({
    name: z.string().min(2, t("validation.nameMin")),
    description: z.string().max(500).optional(),
    key: z
      .string()
      .optional()
      .refine(
        (value) => !value || /^[A-Za-z][A-Za-z0-9]{1,5}$/.test(value),
        t("validation.keyInvalid"),
      ),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      key: "",
      color: COLORS[0],
    },
  });

  const color = watch("color");

  useEffect(() => {
    if (!open) return;
    reset({
      name: project?.name ?? "",
      description: project?.description ?? "",
      key: project?.key ?? "",
      color: project?.color ?? COLORS[0],
    });
  }, [open, project, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      description: values.description?.trim() ? values.description.trim() : null,
      key: isEdit ? undefined : values.key?.trim() ? values.key.trim().toUpperCase() : undefined,
      color: values.color,
    });
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} title={isEdit ? t("edit") : t("create")}>
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Input
          label={t("fields.name")}
          placeholder={t("placeholders.name")}
          error={errors.name?.message}
          {...register("name")}
        />

        {!isEdit ? (
          <Input
            label={t("fields.key")}
            placeholder={t("placeholders.key")}
            error={errors.key?.message}
            {...register("key")}
          />
        ) : null}

        <label className="flex w-full flex-col gap-1.5">
          <span className="text-sm font-medium text-fg-muted">{t("fields.description")}</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder={t("placeholders.description")}
            {...register("description")}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-fg-muted">{t("fields.color")}</span>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={swatch}
                onClick={() => setValue("color", swatch, { shouldValidate: true })}
                className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-105"
                style={{
                  backgroundColor: swatch,
                  borderColor: color === swatch ? "var(--fg)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("actions.cancel", { ns: "common" })}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? t("actions.save") : t("actions.create")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
