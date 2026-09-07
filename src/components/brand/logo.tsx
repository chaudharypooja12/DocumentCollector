import { useId } from "react";
import { cn } from "@/lib/utils";

const sizes = {
  compact: "h-11 w-auto",
  default: "h-14 w-auto",
  large: "h-auto w-full max-w-sm",
};

export function Logo({
  className,
  size = "default",
}: {
  className?: string;
  size?: keyof typeof sizes;
}) {
  const maskId = `mbways-logo-mask-${useId().replaceAll(":", "")}`;

  return (
    <svg
      viewBox="0 0 500 310"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MBWays - Opening Pathways to Opportunities"
      className={cn(sizes[size], className)}
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="500"
          height="310"
        >
          <image href="/brand/logo-neutral-mask.png" width="500" height="310" />
        </mask>
      </defs>
      <rect
        width="500"
        height="310"
        fill="var(--logo-neutral)"
        mask={`url(#${maskId})`}
      />
      <image href="/brand/logo-orange-layer.png" width="500" height="310" />
    </svg>
  );
}
