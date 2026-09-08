"use client";

import { Settings as SettingsIcon, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { PageHeading } from "@/components/admin/page-heading";
import { PaymentDemoSettings } from "@/components/admin/payment-demo-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Label } from "@/components/ui/label";

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
        icon={SettingsIcon}
        demo
      />
      <Card className="max-w-2xl">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <SettingsIcon className="size-5" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-bold">Workspace preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These fields preview the intended Admin settings experience.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("Preview updated for this tab only. Nothing was saved.");
          }}
          className="mt-6 space-y-5"
        >
          <div>
            <Label htmlFor="settings-display-name">Admin display name</Label>
            <Input
              id="settings-display-name"
              className="mt-2"
              value={values.displayName}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="settings-reply-email">Reply email</Label>
            <Input
              id="settings-reply-email"
              type="email"
              className="mt-2"
              value={values.replyEmail}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  replyEmail: event.target.value,
                }))
              }
            />
          </div>
          <InlineAlert>
            The MBWays logo and “Powered by MBWays” identity are fixed product
            elements and cannot be replaced here.
          </InlineAlert>
          {message ? (
            <p role="status" className="text-sm text-success">
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
      <PaymentDemoSettings />
    </>
  );
}
