import Link from "next/link";
import { Logo } from "@/components/brand/logo";

type BrandLockupProps = {
  compact?: boolean;
  href?: string;
};

export function BrandLockup({
  compact = false,
  href = "/admin",
}: BrandLockupProps) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center gap-3 rounded-xl"
      aria-label="DocumentCollector home"
    >
      <Logo size={compact ? "compact" : "default"} className="shrink-0" />
      <span className="hidden border-l border-border pl-3 sm:block">
        <span className="block text-sm font-bold tracking-tight text-foreground">
          DocumentCollector
        </span>
        <span className="block text-[11px] text-muted-foreground">
          Powered by MBWays
        </span>
      </span>
    </Link>
  );
}
