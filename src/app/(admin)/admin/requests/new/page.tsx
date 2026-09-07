import { PageHeading } from "@/components/admin/page-heading";
import { RequestBuilder } from "@/components/admin/request-builder";

export default function NewRequestPage() {
  return (
    <>
      <PageHeading
        eyebrow="Functional Phase 1 workflow"
        title="Create a document request"
        description="Choose the document checklist and generate a temporary link that opens directly on the user's phone. The link expires in six hours or less."
      />
      <RequestBuilder />
    </>
  );
}
