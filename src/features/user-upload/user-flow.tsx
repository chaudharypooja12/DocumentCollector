"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Ban,
  Clock3,
  CreditCard,
  Download,
  FileCheck2,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Share2,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CaptureSlot } from "@/components/capture/capture-slot";
import { CameraDialog } from "@/components/capture/camera-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  decodeRequestPayload,
  getEncodedRequestFromHash,
  hasDemoPayment,
  RequestLinkError,
  type Phase1RequestPayload,
} from "@/lib/request-link";
import { formatDemoMoney } from "@/lib/payment-demo";
import { COMPLETE_PDF_NAME, createCombinedPdf } from "@/lib/pdf";
import {
  CaptureProvider,
  nextCaptureTarget,
  useCaptures,
  type CaptureTargetDescriptor,
} from "@/features/user-upload/capture-store";

const profileDetailsSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  age: z.number().int().min(1).max(120),
  gender: z.enum(["Male", "Female"]),
  phone: z.string().trim().min(6).max(20),
  permanentAddress: z.string().trim().min(1).max(200),
  residenceAddress: z.string().trim().min(1).max(200),
  sameAsPermanentAddress: z.boolean(),
});

type ProfileDetailsForm = z.infer<typeof profileDetailsSchema>;

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
  const [target, setTarget] = useState<CaptureTargetDescriptor | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pdf, setPdf] = useState<{ blob: Blob; url: string } | null>(null);
  const [generationError, setGenerationError] = useState("");
  const [remainingMs, setRemainingMs] = useState(
    Math.max(0, Date.parse(request.expiresAt) - Date.now()),
  );
  const verificationTimerRef = useRef<number | null>(null);
  const paidRequest = hasDemoPayment(request);
  const payment = paidRequest ? request.payment : null;
  const {
    register: registerProfile,
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileDetailsForm>({
    resolver: zodResolver(profileDetailsSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      age: undefined as unknown as number,
      gender: undefined as unknown as ProfileDetailsForm["gender"],
      phone: "",
      permanentAddress: "",
      residenceAddress: "",
      sameAsPermanentAddress: false,
    },
  });
  const sameAsPermanentAddress = watchProfile("sameAsPermanentAddress");
  const permanentAddress = watchProfile("permanentAddress");

  useEffect(() => {
    if (sameAsPermanentAddress) {
      setProfileValue("residenceAddress", permanentAddress, {
        shouldValidate: true,
      });
    }
  }, [sameAsPermanentAddress, permanentAddress, setProfileValue]);

  useEffect(
    () => () => {
      if (pdf) URL.revokeObjectURL(pdf.url);
    },
    [pdf],
  );

  useEffect(
    () => () => {
      if (verificationTimerRef.current !== null) {
        window.clearTimeout(verificationTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const updateExpiry = () => {
      const nextRemaining = Math.max(
        0,
        Date.parse(request.expiresAt) - Date.now(),
      );
      setRemainingMs(nextRemaining);
      if (nextRemaining === 0 && status !== "SUBMITTED") {
        setConfirming(false);
        setStatus("EXPIRED");
      }
    };
    updateExpiry();
    const interval = window.setInterval(updateExpiry, 1000);
    return () => window.clearInterval(interval);
  }, [request.expiresAt, setStatus, status]);

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
      setStatus(paidRequest ? "PAID" : "COLLECTING");
    }
  }

  function cancelCheckout() {
    setStatus("PAYMENT_CANCELLED");
  }

  function failCheckout() {
    setStatus("PAYMENT_FAILED");
  }

  function succeedCheckout() {
    setStatus("VERIFYING");
    verificationTimerRef.current = window.setTimeout(() => {
      verificationTimerRef.current = null;
      if (Date.now() >= Date.parse(request.expiresAt)) {
        setStatus("EXPIRED");
        return;
      }
      setStatus("PAID");
      void generate();
    }, 700);
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
              lock or payment after refresh; authoritative verification and
              renewal begin in the backend phases.
            </p>
          </InlineAlert>
        </Card>
      </main>
    );
  }

  if (status === "EXPIRED") {
    return (
      <StateCard
        icon={<Clock3 className="size-7" />}
        title="This link has expired"
        description="Your current-page captures cannot be paid for now. In production, an administrator can extend or replace the link while retaining private uploads."
      />
    );
  }

  const paymentMessage =
    status === "PAYMENT_CANCELLED"
      ? "Demo checkout was cancelled. Your captures are still available in this tab, and you can retry before expiry."
      : status === "PAYMENT_FAILED"
        ? "Demo payment was declined. No money was charged; review and retry before expiry."
        : "";
  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));

  return (
    <>
      <main className="page-shell pb-32 pt-7 sm:pt-10">
        <div className="mx-auto max-w-3xl">
          {payment ? (
            <InlineAlert tone="warning" className="mb-5">
              Demo payment — no money will be charged. This request costs{" "}
              <strong>
                {formatDemoMoney(payment.amountMinor, payment.currency)}
              </strong>{" "}
              for {payment.countryCode === "IN" ? "India" : "UAE / Dubai"}.
            </InlineAlert>
          ) : null}

          <Card className="mb-5">
            <Progress
              value={(completed / required) * 100}
              label={`${completed} of ${required} documents complete`}
            />
          </Card>

          <Card className="mb-5">
            <h2 className="text-lg font-bold">Basic details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Full name
                </span>
                <Input
                  placeholder="e.g. Priya Sharma"
                  {...registerProfile("fullName")}
                  aria-invalid={Boolean(profileErrors.fullName)}
                />
                {profileErrors.fullName ? (
                  <span className="mt-1 block text-xs text-destructive">
                    Enter your full name
                  </span>
                ) : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Age</span>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  placeholder="e.g. 28"
                  {...registerProfile("age", { valueAsNumber: true })}
                  aria-invalid={Boolean(profileErrors.age)}
                />
                {profileErrors.age ? (
                  <span className="mt-1 block text-xs text-destructive">
                    Enter a valid age
                  </span>
                ) : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Gender
                </span>
                <Controller
                  control={profileControl}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="min-h-11 rounded-xl">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {profileErrors.gender ? (
                  <span className="mt-1 block text-xs text-destructive">
                    Select a gender
                  </span>
                ) : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Phone number
                </span>
                <Input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  {...registerProfile("phone")}
                  aria-invalid={Boolean(profileErrors.phone)}
                />
                {profileErrors.phone ? (
                  <span className="mt-1 block text-xs text-destructive">
                    Enter a valid phone number
                  </span>
                ) : null}
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">
                  Permanent address
                </span>
                <Input
                  placeholder="House number, street, city, state"
                  {...registerProfile("permanentAddress")}
                  aria-invalid={Boolean(profileErrors.permanentAddress)}
                />
                {profileErrors.permanentAddress ? (
                  <span className="mt-1 block text-xs text-destructive">
                    Enter your permanent address
                  </span>
                ) : null}
              </label>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Controller
                  control={profileControl}
                  name="sameAsPermanentAddress"
                  render={({ field }) => (
                    <Checkbox
                      id="same-as-permanent"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  )}
                />
                <Label htmlFor="same-as-permanent" className="font-normal">
                  My residence address is the same as my permanent address
                </Label>
              </div>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">
                  Residence address
                </span>
                <Input
                  placeholder="House number, street, city, state"
                  {...registerProfile("residenceAddress")}
                  disabled={sameAsPermanentAddress}
                  aria-invalid={Boolean(profileErrors.residenceAddress)}
                />
                {profileErrors.residenceAddress ? (
                  <span className="mt-1 block text-xs text-destructive">
                    Enter your residence address
                  </span>
                ) : null}
              </label>
            </div>
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
                    {document.type === "SINGLE" ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        One image · one A4 page
                      </p>
                    ) : null}
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
          {paymentMessage ? (
            <InlineAlert tone="warning" className="mt-5">
              {paymentMessage}
            </InlineAlert>
          ) : null}
        </div>
      </main>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-border bg-header p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">
              {isComplete
                ? payment
                  ? `Ready for demo payment · ${remainingMinutes} min left`
                  : "Ready to generate"
                : `${required - completed} remaining`}
            </p>
            <p className="text-xs text-muted-foreground">
              Nothing will be uploaded.
            </p>
          </div>
          <Button
            className="w-full sm:ml-auto sm:w-auto"
            disabled={!isComplete}
            loading={status === "GENERATING" || status === "VERIFYING"}
            onClick={() => {
              if (status === "PAID" && generationError) {
                void generate();
                return;
              }
              void handleProfileSubmit(() => {
                setStatus(payment ? "READY_FOR_PAYMENT" : "COLLECTING");
                setConfirming(true);
              })();
            }}
          >
            {status === "GENERATING" || status === "VERIFYING" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : payment ? (
              <CreditCard className="size-4" />
            ) : (
              <FileCheck2 className="size-4" />
            )}
            {status === "PAID" && generationError
              ? "Retry PDF generation"
              : payment
                ? status === "PAYMENT_CANCELLED" ||
                  status === "PAYMENT_FAILED"
                  ? "Retry demo payment"
                  : `Continue to pay ${formatDemoMoney(payment.amountMinor, payment.currency)}`
                : "Generate documents"}
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
          sessionKey={`${target.documentId}:${target.side}`}
          onClose={() => setTarget(null)}
          onAccept={(image) => {
            setCapture(
              target.documentId,
              target.side,
              image.blob,
              image.width,
              image.height,
            );
            setTarget(nextCaptureTarget(request, captures, target));
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
              {payment ? "Review demo payment" : "Generate and lock this tab?"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {payment
                ? `Your captures are ready. Continue to a no-charge mock checkout for ${formatDemoMoney(payment.amountMinor, payment.currency)}. PDF download and sharing unlock only after simulated success.`
                : "The PDF is created locally. After generation, your details and captures cannot be changed in this tab, and nothing is sent to MBWays."}
            </p>
            {payment ? (
              <InlineAlert tone="warning" className="mt-4">
                Demo payment — no money will be charged and no payment details
                are collected.
              </InlineAlert>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                Keep editing
              </Button>
              <Button
                onClick={() => {
                  if (payment) {
                    setConfirming(false);
                    setStatus("CHECKOUT_OPEN");
                    return;
                  }
                  void generate();
                }}
              >
                {payment ? "Open mock checkout" : "Generate PDF"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      <Dialog
        open={status === "CHECKOUT_OPEN"}
        onOpenChange={(open) => {
          if (!open && status === "CHECKOUT_OPEN") cancelCheckout();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <CreditCard className="size-5" />
              </span>
              <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Mock hosted checkout
              </span>
            </div>
            <DialogTitle>
              {payment
                ? `Pay ${formatDemoMoney(payment.amountMinor, payment.currency)}`
                : "Demo payment"}
            </DialogTitle>
            <DialogDescription>
              Choose an outcome to test the customer experience. No card, bank,
              wallet, or UPI information is requested.
            </DialogDescription>
          </DialogHeader>
          <InlineAlert tone="warning">
            Demo payment — no money will be charged.
          </InlineAlert>
          <div className="grid gap-3">
            <Button type="button" onClick={succeedCheckout}>
              <FileCheck2 className="size-4" /> Simulate successful payment
            </Button>
            <Button type="button" variant="danger" onClick={failCheckout}>
              <XCircle className="size-4" /> Simulate declined payment
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={cancelCheckout}>
              <Ban className="size-4" /> Cancel checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
