"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    label?: string;
  }
>(({ className, value = 0, label, ...props }, ref) => {
  const bounded = Math.min(100, Math.max(0, value ?? 0));
  return (
    <div className={className}>
      {label ? (
        <div className="mb-2 flex justify-between gap-3 text-xs text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(bounded)}%</span>
        </div>
      ) : null}
      <ProgressPrimitive.Root
        ref={ref}
        className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20"
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-gradient-to-r from-primary to-secondary transition-all"
          style={{ transform: `translateX(-${100 - bounded}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
