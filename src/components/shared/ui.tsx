import type {
  ButtonHTMLAttributes,
  ChangeEventHandler,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  className,
  variant = "primary",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-orange-950/30 hover:brightness-110",
    secondary: "border border-white/15 bg-white/8 text-white hover:bg-white/12",
    ghost: "text-white/75 hover:bg-white/8 hover:text-white",
    danger:
      "border border-danger/35 bg-danger/10 text-red-100 hover:bg-danger/20",
  };

  return (
    <button
      className={twMerge(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("glass-card p-5 sm:p-6", className)} {...props} />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={twMerge(
        "min-h-11 w-full rounded-xl border border-white/12 bg-black/20 px-3.5 text-sm text-white placeholder:text-white/35 transition hover:border-white/20 focus:border-primary",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={twMerge(
        "min-h-11 w-full rounded-xl border border-white/12 bg-[#151925] px-3.5 text-sm text-white transition hover:border-white/20 focus:border-primary",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-5 accent-primary"
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-200">{error}</span>
      ) : null}
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
}) {
  const tones = {
    neutral: "border-white/10 bg-white/7 text-white/70",
    success: "border-success/25 bg-success/10 text-emerald-200",
    warning: "border-warning/25 bg-warning/10 text-amber-100",
    danger: "border-danger/25 bg-danger/10 text-red-100",
    brand: "border-primary/25 bg-primary/10 text-orange-100",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  const bounded = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="mb-2 flex justify-between gap-3 text-xs text-white/60">
        <span>{label}</span>
        <span>{Math.round(bounded)}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/8"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(bounded)}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width]"
          style={{ width: `${bounded}%` }}
        />
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 rounded-2xl bg-white/8 p-3 text-primary">{icon}</div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/60">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}

export function InlineAlert({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "success" | "warning" | "danger";
}) {
  const tones = {
    brand: "border-primary/20 bg-primary/8 text-orange-100",
    success: "border-success/20 bg-success/8 text-emerald-100",
    warning: "border-warning/20 bg-warning/8 text-amber-100",
    danger: "border-danger/20 bg-danger/8 text-red-100",
  };
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`rounded-xl border p-4 text-sm leading-6 ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

export function Toast({
  children,
  visible,
}: {
  children: ReactNode;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 max-w-sm rounded-xl border border-white/15 bg-[#151925] px-4 py-3 text-sm shadow-2xl"
    >
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={twMerge(
        "block animate-pulse rounded-xl bg-white/8 motion-reduce:animate-none",
        className,
      )}
    />
  );
}
