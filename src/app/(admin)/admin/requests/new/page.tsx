import { FileStack } from "lucide-react";
import { PageHeading } from "@/components/admin/page-heading";
import { RequestBuilder } from "@/components/admin/request-builder";

export default function NewRequestPage() {
  return (
    <>
      <PageHeading title="Create a document request" icon={FileStack} />
      <RequestBuilder />
    </>
  );
}
