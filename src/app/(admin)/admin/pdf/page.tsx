import { Download, FileText } from "lucide-react";
import { PageHeading } from "@/components/admin/page-heading";
import { Badge, Button, Card } from "@/components/shared/ui";

const files = [
  { name: "Complete_Documents.pdf", type: "Combined", pages: 5 },
  { name: "Passport.pdf", type: "Individual", pages: 1 },
  { name: "Photograph.pdf", type: "Individual", pages: 1 },
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
      <Card>
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-white/7 p-2.5 text-primary">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {file.pages} A4 page
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{file.type}</Badge>
                <Button
                  variant="secondary"
                  disabled
                  title="Available with persistent submissions in Phase 2"
                >
                  <Download className="size-4" /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
