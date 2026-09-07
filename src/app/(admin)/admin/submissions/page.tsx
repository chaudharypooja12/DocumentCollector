"use client";

import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { PageHeading } from "@/components/admin/page-heading";
import { ReactivationDemo } from "@/components/admin/reactivation-demo";
import { Badge } from "@/components/ui/badge";
import { demoSubmissions, type DemoSubmission } from "@/data/admin-fixtures";

const columns: DataTableColumn<DemoSubmission>[] = [
  {
    id: "reference",
    header: "Reference",
    value: (item) => item.reference,
    cell: (item) => <span className="font-semibold">{item.reference}</span>,
  },
  {
    id: "documents",
    header: "Documents",
    value: (item) => item.documents,
  },
  { id: "created", header: "Created", value: (item) => item.createdAt },
  {
    id: "status",
    header: "Status",
    value: (item) => item.status,
    cell: (item) => (
      <Badge
        tone={
          item.status === "Ready"
            ? "success"
            : item.status === "Review"
              ? "warning"
              : "brand"
        }
      >
        {item.status}
      </Badge>
    ),
  },
];

export default function SubmissionsPage() {
  return (
    <>
      <PageHeading
        eyebrow="Collection"
        title="Submissions"
        description="Submission history becomes available after the secure Phase 2 backend is connected. This screen currently demonstrates the intended workflow."
        demo
      />
      <DataTable
        caption="Demonstration submissions"
        columns={columns}
        rows={demoSubmissions}
        rowKey={(item) => item.id}
        searchPlaceholder="Search submissions"
        exportFileName="documentcollector-demo-submissions.csv"
      />
      <ReactivationDemo />
    </>
  );
}
