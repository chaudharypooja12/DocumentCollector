import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const tones = {
  brand: "border-primary/25 bg-primary/5 text-foreground",
  success: "border-success/25 bg-success/5 text-foreground",
  warning: "border-warning/25 bg-warning/5 text-foreground",
  danger: "border-destructive/25 bg-destructive/5 text-foreground",
};

export function InlineAlert({
  children,
  tone = "brand",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <Alert
      variant={tone === "danger" ? "destructive" : "default"}
      className={cn(
        "leading-6 [&>svg]:static [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg~*]:pl-0",
        tones[tone],
        className,
      )}
    >
      {children}
    </Alert>
  );
}
