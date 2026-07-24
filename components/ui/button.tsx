import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] font-semibold hover:opacity-90 active:scale-[0.97] shadow-[0_0_40px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_0_40px_-15px_rgba(255,255,255,0.35)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] font-medium hover:bg-[var(--surface-hover)] active:scale-[0.97]",
  outline:
    "border border-[var(--input)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface)]",
  ghost: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
} as const;

const buttonSizes = {
  sm: "h-9 rounded-none px-4 text-xs",
  default: "h-11 rounded-none px-6 text-sm",
  lg: "h-12 rounded-none px-8 text-sm sm:h-14",
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  ref?: React.Ref<HTMLButtonElement>;
}

function Button({
  className,
  variant = "primary",
  size = "default",
  disabled,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      ref={ref}
      disabled={disabled ? true : undefined}
      suppressHydrationWarning
    />
  );
}

export { Button };
export type { ButtonProps };
