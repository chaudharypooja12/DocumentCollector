"use client";

import { LockKeyhole, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ReactivationDemo() {
  const [reactivated, setReactivated] = useState(false);

  return (
    <Card className="mt-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-primary/8 p-2.5 text-primary">
            {reactivated ? (
              <RotateCcw className="size-5" />
            ) : (
              <LockKeyhole className="size-5" />
            )}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold">Link renewal preview</h2>
              <Badge tone={reactivated ? "success" : "warning"}>
                {reactivated ? "Reactivated" : "Submitted / locked"}
              </Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Production renewal can extend the existing token or rotate it and
              revoke the old one. This control changes only this demonstration
              card and resets on refresh.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setReactivated((value) => !value)}
        >
          <RotateCcw className="size-4" />
          {reactivated ? "Reset preview" : "Preview reactivation"}
        </Button>
      </div>
    </Card>
  );
}
