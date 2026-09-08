"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  GripVertical,
  Mail,
  Plus,
  RefreshCw,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildRequestUrl,
  createPaidRequestPayload,
  MAX_DOCUMENTS,
  MAX_QR_VALUE_LENGTH,
  RequestLinkError,
  type DocumentType,
} from "@/lib/request-link";
import {
  formatDemoMoney,
  toDemoPaymentConfig,
  type DemoCountryCode,
} from "@/lib/payment-demo";
import { usePaymentDemo } from "@/providers/payment-demo-provider";

const documentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Enter a document name").max(80),
  type: z.enum(["SINGLE", "FRONT_BACK"]),
});

const requestSchema = z
  .object({
    documents: z.array(documentSchema).min(1).max(MAX_DOCUMENTS),
    expiryHours: z.number().int().min(1).max(6),
    countryCode: z.enum(["IN", "AE"]),
  })
  .superRefine((data, context) => {
    const names = new Set<string>();
    data.documents.forEach((document, index) => {
      const name = document.name.trim().toLocaleLowerCase();
      if (names.has(name)) {
        context.addIssue({
          code: "custom",
          message: "Document names must be unique",
          path: ["documents", index, "name"],
        });
      }
      names.add(name);
    });
  });

type RequestForm = z.infer<typeof requestSchema>;

function newDocument(name = ""): RequestForm["documents"][number] {
  return { id: crypto.randomUUID(), name, type: "SINGLE" };
}

function SortableDocument({
  id,
  index,
  count,
  control,
  register,
  errors,
  onMove,
  onRemove,
}: {
  id: string;
  index: number;
  count: number;
  control: Control<RequestForm>;
  register: UseFormRegister<RequestForm>;
  errors: FieldErrors<RequestForm>;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border border-border bg-muted/35 p-4 ${
        isDragging ? "relative z-10 border-primary/60 shadow-xl" : ""
      }`}
    >
      <div className="grid gap-3 sm:grid-cols-[44px_1fr_180px_auto] sm:items-start">
        <button
          type="button"
          className="hidden size-11 cursor-grab items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
          aria-label={`Drag document ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <label>
          <span className="mb-2 block text-xs font-semibold text-muted-foreground">
            Document {index + 1}
          </span>
          <Input
            placeholder="e.g. Passport"
            {...register(`documents.${index}.name`)}
            aria-invalid={Boolean(errors.documents?.[index]?.name)}
          />
          {errors.documents?.[index]?.name?.message ? (
            <span className="mt-1 block text-xs text-destructive">
              {errors.documents[index]?.name?.message}
            </span>
          ) : null}
        </label>
        <label>
          <span className="mb-2 block text-xs font-semibold text-muted-foreground">
            Capture type
          </span>
          <Controller
            control={control}
            name={`documents.${index}.type`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="min-h-11 rounded-xl">
                  <SelectValue aria-label={field.value} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Single image</SelectItem>
                  <SelectItem value="FRONT_BACK">Front + back</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </label>
        <div className="flex items-end gap-1 sm:pt-6">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-25"
            aria-label={`Move document ${index + 1} up`}
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === count - 1}
            className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-25"
            aria-label={`Move document ${index + 1} down`}
          >
            <ArrowDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={count === 1}
            className="inline-flex size-11 items-center justify-center rounded-xl text-destructive hover:bg-destructive/10 disabled:opacity-25"
            aria-label={`Remove document ${index + 1}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function RequestBuilder() {
  const { prices } = usePaymentDemo();
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [feedback, setFeedback] = useState("");
  const [generationError, setGenerationError] = useState("");
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      documents: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          name: "Passport",
          type: "FRONT_BACK" as DocumentType,
        },
        {
          id: "00000000-0000-4000-8000-000000000002",
          name: "Photograph",
          type: "SINGLE" as DocumentType,
        },
      ],
      expiryHours: 3,
      countryCode: "IN" as DemoCountryCode,
    },
  });
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "documents",
    keyName: "fieldKey",
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const values = useWatch({ control });
  const watchedDocuments = values.documents ?? [];
  const selectedCountry = values.countryCode ?? "IN";
  const selectedPrice = prices[selectedCountry];
  const configurationKey = JSON.stringify({
    documents: watchedDocuments.map(({ id, name, type }) => ({
      id,
      name,
      type,
    })),
    expiryHours: values.expiryHours,
    countryCode: selectedCountry,
    amountMinor: selectedPrice.amountMinor,
    priceRevision: selectedPrice.revision,
    priceEnabled: selectedPrice.enabled,
  });
  const previousConfigurationKey = useRef(configurationKey);
  const totalCaptures = watchedDocuments.reduce(
    (sum, document) => sum + (document.type === "FRONT_BACK" ? 2 : 1),
    0,
  );

  useEffect(() => {
    if (previousConfigurationKey.current === configurationKey) return;

    previousConfigurationKey.current = configurationKey;
    setGeneratedUrl("");
    setFeedback("");
    setGenerationError("");
  }, [configurationKey]);

  function reorder(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const from = fields.findIndex((field) => field.id === event.active.id);
    const to = fields.findIndex((field) => field.id === event.over?.id);
    if (from >= 0 && to >= 0) move(from, to);
  }

  const generate = handleSubmit((data) => {
    setGeneratedUrl("");
    setFeedback("");
    setGenerationError("");
    try {
      const price = prices[data.countryCode];
      if (!price.enabled) {
        setGenerationError(
          `${price.countryName} payments are disabled in demo settings.`,
        );
        return;
      }
      const payload = createPaidRequestPayload(
        data.documents,
        data.expiryHours,
        toDemoPaymentConfig(price, price.revision),
      );
      setGeneratedUrl(buildRequestUrl(window.location.origin, payload));
      setFeedback("A new temporary link was generated.");
    } catch (error) {
      setGenerationError(
        error instanceof RequestLinkError && error.code === "TOO_LARGE"
          ? "This checklist is too large for a temporary link. Shorten document names or remove documents and try again."
          : "The temporary link could not be generated. Review the checklist and try again.",
      );
    }
  });

  async function copyLink() {
    await navigator.clipboard.writeText(generatedUrl);
    setFeedback("Link copied to clipboard.");
  }

  async function nativeShare() {
    if (!navigator.share) {
      setFeedback("Native sharing is unavailable on this device.");
      return;
    }
    await navigator.share({
      title: "Document request from MBWays",
      text: "Open this temporary link to capture the requested documents.",
      url: generatedUrl,
    });
    setFeedback("Share sheet opened.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
      <Card>
        <form onSubmit={generate} className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Required documents</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add labels only. Never include a person&apos;s name or contact
                details.
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {fields.length}/{MAX_DOCUMENTS}
            </span>
          </div>

          <DndContext
            id="request-document-order"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={reorder}
          >
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <SortableDocument
                    key={field.id}
                    id={field.id}
                    index={index}
                    count={fields.length}
                    control={control}
                    register={register}
                    errors={errors}
                    onMove={(from, to) => {
                      if (to >= 0 && to < fields.length) move(from, to);
                    }}
                    onRemove={() => remove(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            type="button"
            variant="secondary"
            disabled={fields.length >= MAX_DOCUMENTS}
            onClick={() => append(newDocument())}
          >
            <Plus className="size-4" /> Add document
          </Button>

          <div className="border-t border-border pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Billing country
                </span>
                <Controller
                  control={control}
                  name="countryCode"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="min-h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="AE">
                          United Arab Emirates (Dubai)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </label>
              <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Link expiry
              </span>
              <Controller
                control={control}
                name="expiryHours"
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="min-h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((hour) => (
                        <SelectItem key={hour} value={String(hour)}>
                          {hour} {hour === 1 ? "hour" : "hours"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              </label>
            </div>
            {!selectedPrice.enabled ? (
              <InlineAlert tone="danger" className="mt-4">
                {selectedPrice.countryName} is disabled in Payment Demo
                settings.
              </InlineAlert>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={!selectedPrice.enabled}
          >
            {generatedUrl ? (
              <RefreshCw className="size-4" />
            ) : (
              <Send className="size-4" />
            )}
            {generatedUrl ? "Regenerate link" : "Generate temporary link"}
          </Button>
          {generationError ? (
            <InlineAlert tone="danger">{generationError}</InlineAlert>
          ) : null}
        </form>
      </Card>

      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-bold">Request summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Documents</dt>
              <dd className="font-semibold">{watchedDocuments.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Captures required</dt>
              <dd className="font-semibold">{totalCaptures}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Expires after</dt>
              <dd className="font-semibold">{values.expiryHours ?? 3} hours</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Country</dt>
              <dd className="text-right font-semibold">
                {selectedPrice.countryName}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Payment</dt>
              <dd className="font-semibold">
                {formatDemoMoney(
                  selectedPrice.amountMinor,
                  selectedPrice.currency,
                )}
              </dd>
            </div>
          </dl>
          <InlineAlert tone="warning" className="mt-5">
            Demo payment — no money will be charged. The link carries only this
            checklist, expiry, country code, and fixed price; it contains no
            user information.
          </InlineAlert>
        </Card>

        {generatedUrl ? (
          <Card className="text-center">
            {generatedUrl.length <= MAX_QR_VALUE_LENGTH ? (
              <div className="mx-auto w-fit rounded-2xl bg-white p-3">
                <QRCodeSVG
                  value={generatedUrl}
                  size={180}
                  level="M"
                  aria-label="QR code for temporary document request"
                />
              </div>
            ) : (
              <InlineAlert tone="warning">
                This link is too long for a reliable QR code. Use Copy, Share,
                WhatsApp, or Email instead.
              </InlineAlert>
            )}
            <p className="mt-4 break-all rounded-xl bg-muted p-3 text-left text-xs text-muted-foreground">
              {generatedUrl}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" onClick={copyLink}>
                <Copy className="size-4" /> Copy
              </Button>
              <Button type="button" variant="secondary" onClick={nativeShare}>
                <Share2 className="size-4" /> Share
              </Button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(generatedUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold hover:bg-muted"
              >
                <Send className="size-4" /> WhatsApp
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent("Document request from MBWays")}&body=${encodeURIComponent(generatedUrl)}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold hover:bg-muted"
              >
                <Mail className="size-4" /> Email
              </a>
            </div>
            {feedback ? (
              <p
                role="status"
                className="mt-4 flex items-center justify-center gap-2 text-xs text-success"
              >
                <Check className="size-4" /> {feedback}
              </p>
            ) : null}
          </Card>
        ) : null}
      </div>
    </div>
  );
}
