import { UserRound } from "lucide-react";
import { DemoList } from "@/components/admin/demo-list";
import { PageHeading } from "@/components/admin/page-heading";
import { demoUsers } from "@/modules/admin/fixtures";

export default function UsersPage() {
  return (
    <>
      <PageHeading
        eyebrow="People"
        title="Users"
        description="A responsive preview of the persistent user records planned for Phase 2. These examples are static and contain no real information."
        demo
      />
      <DemoList
        icon={<UserRound className="size-5" aria-hidden="true" />}
        items={demoUsers.map((user) => ({
          id: user.id,
          title: user.name,
          subtitle: user.updatedAt,
          meta: `${user.country} · ${user.documents} documents`,
          status: user.status,
          tone:
            user.status === "Submitted"
              ? "success"
              : user.status === "In progress"
                ? "brand"
                : "neutral",
        }))}
      />
    </>
  );
}
