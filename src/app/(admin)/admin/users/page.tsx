"use client";

import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { PageHeading } from "@/components/admin/page-heading";
import { Badge } from "@/components/ui/badge";
import { demoUsers, type DemoUser } from "@/data/admin-fixtures";

const columns: DataTableColumn<DemoUser>[] = [
  {
    id: "name",
    header: "User",
    value: (user) => user.name,
    cell: (user) => <span className="font-semibold">{user.name}</span>,
  },
  { id: "country", header: "Country", value: (user) => user.country },
  {
    id: "documents",
    header: "Documents",
    value: (user) => user.documents,
  },
  { id: "updated", header: "Updated", value: (user) => user.updatedAt },
  {
    id: "status",
    header: "Status",
    value: (user) => user.status,
    cell: (user) => (
      <Badge
        tone={
          user.status === "Submitted"
            ? "success"
            : user.status === "In progress"
              ? "brand"
              : "neutral"
        }
      >
        {user.status}
      </Badge>
    ),
  },
];

export default function UsersPage() {
  return (
    <>
      <PageHeading
        eyebrow="People"
        title="Users"
        description="A responsive preview of the persistent user records planned for Phase 2. These examples are static and contain no real information."
        demo
      />
      <DataTable
        caption="Demonstration users"
        columns={columns}
        rows={demoUsers}
        rowKey={(user) => user.id}
        searchPlaceholder="Search users"
        exportFileName="documentcollector-demo-users.csv"
      />
    </>
  );
}
