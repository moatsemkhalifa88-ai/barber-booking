import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerSolid" | "onDark" | "outlineOnDark";

const baseClasses =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md px-6 text-base font-semibold transition-colors duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100";

const variantClasses: Record<ButtonVariant, string> = {
  // The one accent: orange fill, dark text (8.4:1), 1px darker edge so it reads on light grounds.
  primary: "border border-brand-edge bg-brand text-on-brand hover:bg-brand-hover",
  secondary: "border border-border-strong bg-surface text-fg hover:border-fg hover:bg-surface-2",
  ghost: "min-h-11 px-2 text-accent underline-offset-4 hover:underline",
  danger: "border border-error bg-surface text-error hover:bg-error-soft",
  dangerSolid: "bg-error text-on-primary hover:bg-error/90",
  onDark: "border border-brand-edge bg-brand text-on-brand hover:bg-brand-hover",
  outlineOnDark: "border border-on-ink/60 text-on-ink hover:bg-on-ink/10",
};

interface ButtonBaseProps {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
  /** Shows a spinner; pair with `disabled` while an action is pending. */
  loading?: boolean;
}

type ButtonAsButton = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Button({
  variant = "primary",
  children,
  className = "",
  href,
  loading = false,
  ...rest
}: ButtonAsButton | ButtonAsLink) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      aria-busy={loading || undefined}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
