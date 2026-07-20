import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  error?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const { t } = useTranslation("auth");
    const [visible, setVisible] = useState(false);
    const inputId = id ?? props.name;

    return (
      <label className="flex w-full flex-col gap-1.5">
        {label ? (
          <span className="text-sm font-medium text-fg-muted">{label}</span>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            className={cn(
              "h-10 w-full rounded-md border border-border bg-surface px-3 pr-10 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:ring-2 focus:ring-accent/20",
              error && "border-danger focus:border-danger focus:ring-danger/20",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((current) => !current)}
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 text-fg-subtle hover:text-fg"
            aria-label={visible ? t("actions.hidePassword") : t("actions.showPassword")}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </label>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
