import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "danger";
  className?: string;
};

const tones = {
  neutral: "bg-canvas text-fg-muted border-border",
  accent: "bg-accent-soft text-accent border-transparent",
  success: "bg-success-soft text-success border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
