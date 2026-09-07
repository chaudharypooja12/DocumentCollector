"use client";

import { LockKeyhole, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card } from "@/components/shared/ui";

export function ReactivationDemo() {
  const [reactivated, setReactivated] = useState(false);

  return (
    <Card className="mt-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-orange-300/8 p-2.5 text-orange-200">
            {reactivated ? (
              <RotateCcw className="size-5" />
            ) : (
              <LockKeyhole className="size-5" />
            )}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold">Same-link reactivation preview</h2>
              <Badge tone={reactivated ? "success" : "warning"}>
                {reactivated ? "Reactivated" : "Submitted / locked"}
              </Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Phase 2 will reactivate the existing token without generating a
              new link. This control changes only this demonstration card and
              resets on refresh.
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
