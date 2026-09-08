"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Copy,
  LayoutTemplate,
  Mail,
  RefreshCw,
  Send,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineAlert } from "@/components/ui/inline-alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildRequestUrl,
  createRequestPayload,
  MAX_QR_VALUE_LENGTH,
  RequestLinkError,
} from "@/lib/request-link";
import { useTemplates } from "@/providers/templates-provider";

const requestSchema = z.object({
  templateId: z.string().min(1, "Choose a document template"),
  expiryHours: z.number().int().min(1).max(6),
});

type RequestForm = z.infer<typeof requestSchema>;

export function RequestBuilder() {
  const { templates } = useTemplates();
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [feedback, setFeedback] = useState("");
  const [generationError, setGenerationError] = useState("");
  const { control, handleSubmit, watch } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      templateId: templates[0]?.id ?? "",
      expiryHours: 3,
    },
  });
  const templateId = watch("templateId");
  const expiryHours = watch("expiryHours");
  const selectedTemplate = templates.find(
    (template) => template.id === templateId,
  );
  const totalCaptures =
    selectedTemplate?.documents.reduce(
      (sum, document) => sum + (document.type === "FRONT_BACK" ? 2 : 1),
      0,
    ) ?? 0;
  const configurationKey = JSON.stringify({ templateId, expiryHours });
  const previousConfigurationKey = useRef(configurationKey);

  useEffect(() => {
    if (previousConfigurationKey.current === configurationKey) return;

    previousConfigurationKey.current = configurationKey;
    setGeneratedUrl("");
    setFeedback("");
    setGenerationError("");
  }, [configurationKey]);

  const generate = handleSubmit((data) => {
    setGeneratedUrl("");
    setFeedback("");
    setGenerationError("");
    const template = templates.find((item) => item.id === data.templateId);
    if (!template) {
      setGenerationError("Choose a document template to continue.");
      return;
    }
    try {
      const payload = createRequestPayload(
        template.documents,
        data.expiryHours,
      );
      setGeneratedUrl(buildRequestUrl(window.location.origin, payload));
      setFeedback("A new temporary link was generated.");
    } catch (error) {
      setGenerationError(
        error instanceof RequestLinkError && error.code === "TOO_LARGE"
          ? "This checklist is too large for a temporary link. Use a shorter template and try again."
          : "The temporary link could not be generated. Review the template and try again.",
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

  if (templates.length === 0) {
    return (
      <InlineAlert tone="warning">
        No document templates exist yet.{" "}
        <Link href="/admin/templates" className="font-semibold underline">
          Create a template
        </Link>{" "}
        first, then return here to generate a request.
      </InlineAlert>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
      <Card>
        <form onSubmit={generate} className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Document template</h2>
            <Button asChild variant="link" size="sm" className="px-0">
              <Link href="/admin/templates">
                <LayoutTemplate className="size-4" /> Manage templates
              </Link>
            </Button>
          </div>

          <Controller
            control={control}
            name="templateId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="min-h-11 rounded-xl">
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {selectedTemplate ? (
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.documents.map((document) => (
                <Badge key={document.id} tone="neutral">
                  {document.name}
                  {document.type === "FRONT_BACK" ? " (Front + Back)" : ""}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="border-t border-border pt-5">
            <label className="block max-w-xs">
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

          <Button type="submit" className="w-full sm:w-auto">
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
              <dd className="font-semibold">
                {selectedTemplate?.documents.length ?? 0}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Captures required</dt>
              <dd className="font-semibold">{totalCaptures}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Expires after</dt>
              <dd className="font-semibold">{expiryHours ?? 3} hours</dd>
            </div>
          </dl>
          <div className="mt-5 rounded-xl border border-success/20 bg-success/5 p-4 text-xs leading-5 text-muted-foreground">
            No user information is requested or stored. The link carries only
            this checklist and its expiry.
          </div>
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
