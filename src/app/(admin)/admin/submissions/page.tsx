import { Files } from "lucide-react";
import { DemoList } from "@/components/admin/demo-list";
import { PageHeading } from "@/components/admin/page-heading";
import { ReactivationDemo } from "@/components/admin/reactivation-demo";
import { demoSubmissions } from "@/modules/admin/fixtures";

export default function SubmissionsPage() {
  return (
    <>
      <PageHeading
        eyebrow="Collection"
        title="Submissions"
        description="Submission history becomes available after the secure Phase 2 backend is connected. This screen currently demonstrates the intended workflow."
        demo
      />
      <DemoList
        icon={<Files className="size-5" aria-hidden="true" />}
        items={demoSubmissions.map((item) => ({
          id: item.id,
          title: item.reference,
          subtitle: item.createdAt,
          meta: `${item.documents} required documents`,
          status: item.status,
          tone:
            item.status === "Ready"
              ? "success"
              : item.status === "Review"
                ? "warning"
                : "brand",
        }))}
      />
      <ReactivationDemo />
    </>
  );
}
