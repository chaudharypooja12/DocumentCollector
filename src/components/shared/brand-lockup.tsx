import Image from "next/image";
import Link from "next/link";

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
      <span
        className={`relative block shrink-0 ${
          compact ? "h-[60px] w-[97px]" : "h-[68px] w-[110px]"
        }`}
      >
        <Image
          src="/brand/logo.svg"
          fill
          sizes={compact ? "97px" : "110px"}
          alt="MBWays - Opening Pathways to Opportunities"
          className="object-contain"
          priority
        />
      </span>
      <span className="hidden border-l border-white/15 pl-3 sm:block">
        <span className="block text-sm font-bold tracking-tight text-white">
          DocumentCollector
        </span>
        <span className="block text-[11px] text-white/60">
          Powered by MBWays
        </span>
      </span>
    </Link>
  );
}
