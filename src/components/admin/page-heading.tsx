import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
  demo = false,
  icon: Icon,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  demo?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {Icon ? (
          <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
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
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}
