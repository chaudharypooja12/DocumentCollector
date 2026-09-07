"use client";

import { RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { PageHeading } from "@/components/admin/page-heading";
import { Button, Card, Input } from "@/components/shared/ui";

const defaults = {
  displayName: "MBWays Admin",
  replyEmail: "info@mbways.com",
};

export default function SettingsPage() {
  const [values, setValues] = useState(defaults);
  const [message, setMessage] = useState("");

  return (
    <>
      <PageHeading
        eyebrow="Workspace"
        title="Settings"
        description="Explore the planned settings interface. Changes exist only until this page is refreshed and cannot alter MBWays ownership."
        demo
      />
      <Card className="max-w-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("Preview updated for this tab only. Nothing was saved.");
          }}
          className="space-y-5"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Admin display name
            </span>
            <Input
              value={values.displayName}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Reply email
            </span>
            <Input
              type="email"
              value={values.replyEmail}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  replyEmail: event.target.value,
                }))
              }
            />
          </label>
          <div className="rounded-xl border border-orange-300/15 bg-orange-300/6 p-4 text-sm leading-6 text-orange-100/80">
            The MBWays logo and “Powered by MBWays” identity are fixed product
            elements and cannot be replaced here.
          </div>
          {message ? (
            <p role="status" className="text-sm text-emerald-200">
              {message}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit">
              <Save className="size-4" /> Apply preview
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setValues(defaults);
                setMessage("Preview reset to its original values.");
              }}
            >
              <RotateCcw className="size-4" /> Reset
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
