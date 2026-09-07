import type { ReactNode } from "react";
import { Badge } from "@/components/shared/ui";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
  demo = false,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  demo?: boolean;
}) {
  return (
    <div className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {eyebrow ? (
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              {eyebrow}
            </p>
          ) : null}
          {demo ? <Badge tone="warning">Phase 1 demonstration</Badge> : null}
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
