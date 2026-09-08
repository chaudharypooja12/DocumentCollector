"use client";

import { Settings as SettingsIcon, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { PageHeading } from "@/components/admin/page-heading";
import { PaymentDemoSettings } from "@/components/admin/payment-demo-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Label } from "@/components/ui/label";
import { demoLogs, type DemoLogEntry } from "@/data/admin-fixtures";

const defaults = {
  displayName: "MBWays Admin",
  replyEmail: "info@mbways.com",
};

const logColumns: DataTableColumn<DemoLogEntry>[] = [
  {
    id: "event",
    header: "Event",
    value: (log) => log.event,
    cell: (log) => <span className="font-semibold">{log.event}</span>,
  },
  { id: "actor", header: "Actor", value: (log) => log.actor },
  { id: "details", header: "Details", value: (log) => log.details },
  { id: "timestamp", header: "Timestamp", value: (log) => log.timestamp },
];

export default function SettingsPage() {
  const [values, setValues] = useState(defaults);
  const [message, setMessage] = useState("");

  return (
    <>
      <PageHeading title="Settings" icon={SettingsIcon} demo />
      <Card>
        <h2 className="text-lg font-bold">Workspace preferences</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("Preview updated for this tab only. Nothing was saved.");
          }}
          className="mt-6 space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="settings-display-name">
                Admin display name
              </Label>
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

      <h2 className="mt-8 mb-4 text-lg font-bold">Activity logs</h2>
      <DataTable
        caption="Demonstration activity log"
        columns={logColumns}
        rows={demoLogs}
        rowKey={(log) => log.id}
        searchPlaceholder="Search logs"
        exportFileName="documentcollector-demo-logs.csv"
      />
    </>
  );
}
