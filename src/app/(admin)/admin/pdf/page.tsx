"use client";

import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { PageHeading } from "@/components/admin/page-heading";
import { Badge } from "@/components/ui/badge";

const files = [
  {
    id: "pdf-1",
    name: "Complete_Documents.pdf",
    type: "Combined",
    pages: 5,
    status: "Preview",
  },
  {
    id: "pdf-2",
    name: "Passport.pdf",
    type: "Individual",
    pages: 1,
    status: "Preview",
  },
  {
    id: "pdf-3",
    name: "Photograph.pdf",
    type: "Individual",
    pages: 1,
    status: "Preview",
  },
];

type DemoPdf = (typeof files)[number];

const columns: DataTableColumn<DemoPdf>[] = [
  {
    id: "name",
    header: "File",
    value: (file) => file.name,
    cell: (file) => <span className="font-semibold">{file.name}</span>,
  },
  { id: "type", header: "Type", value: (file) => file.type },
  { id: "pages", header: "A4 pages", value: (file) => file.pages },
  {
    id: "status",
    header: "Availability",
    value: (file) => file.status,
    cell: (file) => <Badge>{file.status}</Badge>,
  },
];

export default function PdfPage() {
  return (
    <>
      <PageHeading
        eyebrow="Documents"
        title="PDF management"
        description="Phase 1 creates PDFs only on the user device. These static examples preview the downloads available to Admin after Phase 2."
        demo
      />
      <DataTable
        caption="Demonstration PDF files"
        columns={columns}
        rows={files}
        rowKey={(file) => file.id}
        searchPlaceholder="Search PDF files"
        exportFileName="documentcollector-demo-pdfs.csv"
      />
    </>
  );
}
