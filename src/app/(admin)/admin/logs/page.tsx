"use client";

import { ScrollText } from "lucide-react";
import { PageHeading } from "@/components/admin/page-heading";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { demoLogs, type DemoLogEntry } from "@/data/admin-fixtures";

const columns: DataTableColumn<DemoLogEntry>[] = [
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

export default function LogsPage() {
  return (
    <>
      <PageHeading eyebrow="Activity" title="Logs" icon={ScrollText} demo />
      <DataTable
        caption="Demonstration activity log"
        columns={columns}
        rows={demoLogs}
        rowKey={(log) => log.id}
        searchPlaceholder="Search logs"
        exportFileName="documentcollector-demo-logs.csv"
      />
    </>
  );
}
