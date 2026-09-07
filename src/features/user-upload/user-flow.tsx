"use client";

import {
  AlertTriangle,
  Clock3,
  Download,
  FileCheck2,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CaptureSlot } from "@/components/capture/capture-slot";
import { CameraDialog } from "@/components/capture/camera-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Progress } from "@/components/ui/progress";
import {
  decodeRequestPayload,
  getEncodedRequestFromHash,
  RequestLinkError,
  type Phase1RequestPayload,
} from "@/lib/request-link";
import { COMPLETE_PDF_NAME, createCombinedPdf } from "@/lib/pdf";
import {
  CaptureProvider,
  useCaptures,
  type CaptureSide,
} from "@/features/user-upload/capture-store";

type ResolverState =
  | { status: "loading" }
  | { status: "valid"; request: Phase1RequestPayload }
  | { status: "expired" }
  | { status: "invalid" };

function StateCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="page-shell flex min-h-[calc(100svh-7rem)] items-center justify-center py-8">
      <Card className="w-full max-w-lg text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted text-primary">
          {icon}
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </Card>
    </main>
  );
}

function UserHeader() {
  return (
    <header className="border-b border-border bg-header backdrop-blur-xl">
      <div className="page-shell flex min-h-20 items-center justify-between gap-3">
        <BrandLockup href="/u" />
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <ShieldCheck className="size-4 text-success" />
            Files stay on this device
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

type CaptureTarget = {
  documentId: string;
  documentName: string;
  side: CaptureSide;
};

function Checklist() {
  const {
    request,
    captures,
    setCapture,
    clearCaptures,
    status,
    setStatus,
    isComplete,
    completed,
    required,
  } = useCaptures();
  const [target, setTarget] = useState<CaptureTarget | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pdf, setPdf] = useState<{ blob: Blob; url: string } | null>(null);
  const [generationError, setGenerationError] = useState("");

  useEffect(
    () => () => {
      if (pdf) URL.revokeObjectURL(pdf.url);
    },
    [pdf],
  );

  async function generate() {
    setConfirming(false);
    setGenerationError("");
    setStatus("GENERATING");
    try {
      const blob = await createCombinedPdf(request, captures);
      setPdf({ blob, url: URL.createObjectURL(blob) });
      clearCaptures();
      setStatus("SUBMITTED");
    } catch {
      setGenerationError(
        "The PDF could not be generated. Check the captures and try again.",
      );
      setStatus("COLLECTING");
    }
  }

  async function sharePdf() {
    if (!pdf) return;
    const file = new File([pdf.blob], COMPLETE_PDF_NAME, {
      type: "application/pdf",
    });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "Complete documents",
        text: "Combined document PDF generated on this device.",
        files: [file],
      });
    }
  }

  if (status === "SUBMITTED" && pdf) {
    return (
      <main className="page-shell py-8 sm:py-12">
        <Card className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success/12 text-success">
            <FileCheck2 className="size-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Documents are ready.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your combined A4 PDF was generated entirely on this device. Download
            or share it now; it disappears when this page closes.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={pdf.url}
              download={COMPLETE_PDF_NAME}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 text-sm font-semibold"
            >
              <Download className="size-4" /> Download PDF
            </a>
            {navigator.canShare?.({
              files: [
                new File([pdf.blob], COMPLETE_PDF_NAME, {
                  type: "application/pdf",
                }),
              ],
            }) ? (
              <Button variant="secondary" onClick={sharePdf}>
                <Share2 className="size-4" /> Share PDF
              </Button>
            ) : null}
          </div>
          <InlineAlert
            tone="warning"
            className="mt-7 flex items-start gap-3 text-left"
          >
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-warning" />
            <p className="text-xs leading-5 text-muted-foreground">
              This tab is now locked against edits. Phase 1 does not persist the
              lock after refresh; authoritative locking and same-link
              reactivation begin in Phase 2.
            </p>
          </InlineAlert>
        </Card>
      </main>
    );
  }

  return (
    <>
      <main className="page-shell pb-32 pt-7 sm:pt-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-7">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Document request
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Capture your documents
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Follow the checklist below. Your images are processed locally and
              never uploaded.
            </p>
          </div>

          <Card className="mb-5">
            <Progress
              value={(completed / required) * 100}
              label={`${completed} of ${required} captures complete`}
            />
            <InlineAlert
              tone="success"
              className="mt-4 flex items-start gap-3 text-xs"
            >
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
              Refreshing or closing this page permanently clears all captures.
            </InlineAlert>
          </Card>

          <div className="space-y-4">
            {request.documents.map((document, index) => (
              <Card key={document.id}>
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="font-bold">{document.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {document.type === "SINGLE"
                        ? "One image · one A4 page"
                        : "Front and back · one shared A4 page"}
                    </p>
                  </div>
                </div>
                <div
                  className={
                    document.type === "FRONT_BACK"
                      ? "grid gap-3 sm:grid-cols-2"
                      : ""
                  }
                >
                  {document.type === "SINGLE" ? (
                    <CaptureSlot
                      documentId={document.id}
                      documentName={document.name}
                      side="SINGLE"
                      onCapture={setTarget}
                    />
                  ) : (
                    <>
                      <CaptureSlot
                        documentId={document.id}
                        documentName={document.name}
                        side="FRONT"
                        onCapture={setTarget}
                      />
                      <CaptureSlot
                        documentId={document.id}
                        documentName={document.name}
                        side="BACK"
                        onCapture={setTarget}
                      />
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {generationError ? (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive"
            >
              {generationError}
            </p>
          ) : null}
        </div>
      </main>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-border bg-header p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">
              {isComplete
                ? "Ready to generate"
                : `${required - completed} remaining`}
            </p>
            <p className="text-xs text-muted-foreground">
              Nothing will be uploaded.
            </p>
          </div>
          <Button
            className="w-full sm:ml-auto sm:w-auto"
            disabled={!isComplete}
            loading={status === "GENERATING"}
            onClick={() => setConfirming(true)}
          >
            {status === "GENERATING" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <FileCheck2 className="size-4" />
            )}
            Generate documents
          </Button>
        </div>
      </div>

      {target ? (
        <CameraDialog
          title={`${target.documentName}${
            target.side === "SINGLE"
              ? ""
              : ` — ${target.side.toLocaleLowerCase()}`
          }`}
          onClose={() => setTarget(null)}
          onAccept={(image) => {
            setCapture(
              target.documentId,
              target.side,
              image.blob,
              image.width,
              image.height,
            );
            setTarget(null);
          }}
        />
      ) : null}

      {confirming ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <Card
            role="dialog"
            aria-modal="true"
            aria-labelledby="generation-title"
            className="max-w-md"
          >
            <h2 id="generation-title" className="text-xl font-bold">
              Generate and lock this tab?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The PDF is created locally. After generation, captures cannot be
              changed in this tab, and nothing is sent to MBWays.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                Keep editing
              </Button>
              <Button onClick={generate}>Generate PDF</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}

export function UserFlow() {
  const [state, setState] = useState<ResolverState>({ status: "loading" });

  useEffect(() => {
    const resolve = window.setTimeout(() => {
      const encoded = getEncodedRequestFromHash(window.location.hash);
      if (!encoded) {
        setState({ status: "invalid" });
        return;
      }
      try {
        setState({ status: "valid", request: decodeRequestPayload(encoded) });
      } catch (error) {
        setState({
          status:
            error instanceof RequestLinkError && error.code === "EXPIRED"
              ? "expired"
              : "invalid",
        });
      }
    }, 0);
    return () => window.clearTimeout(resolve);
  }, []);

  return (
    <div className="min-h-svh">
      <UserHeader />
      {state.status === "loading" ? (
        <StateCard
          icon={<LoaderCircle className="size-7 animate-spin" />}
          title="Opening request"
          description="Checking the document checklist on this device."
        />
      ) : state.status === "expired" ? (
        <StateCard
          icon={<Clock3 className="size-7" />}
          title="This link has expired"
          description="Please contact your administrator and ask for a new temporary request."
        />
      ) : state.status === "invalid" ? (
        <StateCard
          icon={<AlertTriangle className="size-7" />}
          title="This link is not valid"
          description="The request may be incomplete or damaged. Ask the administrator to share it again."
        />
      ) : (
        <CaptureProvider request={state.request}>
          <Checklist />
        </CaptureProvider>
      )}
    </div>
  );
}
