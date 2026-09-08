"use client";

import {
  Clock3,
  FileArchive,
  Link2,
  RefreshCw,
  RotateCw,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InlineAlert } from "@/components/ui/inline-alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDemoMoney,
  type DemoCountryCode,
  type DemoCurrencyCode,
} from "@/lib/payment-demo";
import { usePaymentDemo } from "@/providers/payment-demo-provider";

type ScenarioId =
  | "india-awaiting"
  | "uae-cancelled"
  | "expired"
  | "late-paid"
  | "superseded"
  | "duplicate";

type LifecycleState = {
  scenarioId: ScenarioId;
  title: string;
  countryCode: DemoCountryCode;
  currency: DemoCurrencyCode;
  originalAmountMinor: number;
  currentAmountMinor: number;
  priceRevision: number;
  originalPriceRevision: number;
  linkRevision: number;
  linkState: "ACTIVE" | "EXPIRED" | "PAID" | "DELETED";
  paymentState:
    | "AWAITING"
    | "CANCELLED"
    | "PAID"
    | "SUPERSEDED"
    | "REFUNDED";
  uploads: number;
  expiresAt: Date;
  events: string[];
};

const scenarioLabels: Record<ScenarioId, string> = {
  "india-awaiting": "India · awaiting payment",
  "uae-cancelled": "UAE · checkout cancelled",
  expired: "Expired · uploads retained",
  "late-paid": "Paid at expiry boundary",
  superseded: "Old-price attempt superseded",
  duplicate: "Duplicate payment refunded",
};

function createScenario(scenarioId: ScenarioId): LifecycleState {
  const now = Date.now();
  const base = {
    scenarioId,
    priceRevision: 1,
    originalPriceRevision: 1,
    linkRevision: 1,
    uploads: 3,
  };
  switch (scenarioId) {
    case "uae-cancelled":
      return {
        ...base,
        title: scenarioLabels[scenarioId],
        countryCode: "AE",
        currency: "AED",
        originalAmountMinor: 2_000,
        currentAmountMinor: 2_000,
        linkState: "ACTIVE",
        paymentState: "CANCELLED",
        expiresAt: new Date(now + 75 * 60_000),
        events: [
          "Three document captures retained.",
          "Customer cancelled demo checkout.",
          "Payment retry remains available until expiry.",
        ],
      };
    case "expired":
      return {
        ...base,
        title: scenarioLabels[scenarioId],
        countryCode: "AE",
        currency: "AED",
        originalAmountMinor: 2_000,
        currentAmountMinor: 2_000,
        linkState: "EXPIRED",
        paymentState: "AWAITING",
        expiresAt: new Date(now - 20 * 60_000),
        events: [
          "Link expired before payment.",
          "Public access blocked.",
          "Three private uploads retained for Admin action.",
        ],
      };
    case "late-paid":
      return {
        ...base,
        title: scenarioLabels[scenarioId],
        countryCode: "IN",
        currency: "INR",
        originalAmountMinor: 20_000,
        currentAmountMinor: 20_000,
        linkState: "PAID",
        paymentState: "PAID",
        expiresAt: new Date(now - 5_000),
        events: [
          "Checkout opened before expiry.",
          "First captured payment verified after the boundary.",
          "Payment honored and PDF generation unlocked.",
        ],
      };
    case "superseded":
      return {
        ...base,
        title: scenarioLabels[scenarioId],
        countryCode: "IN",
        currency: "INR",
        originalAmountMinor: 20_000,
        currentAmountMinor: 25_000,
        priceRevision: 2,
        linkRevision: 2,
        linkState: "ACTIVE",
        paymentState: "SUPERSEDED",
        expiresAt: new Date(now + 3 * 60 * 60_000),
        events: [
          "Admin selected the latest India price.",
          "Old unpaid attempt kept for audit and marked superseded.",
          "New mock order uses price revision 2.",
        ],
      };
    case "duplicate":
      return {
        ...base,
        title: scenarioLabels[scenarioId],
        countryCode: "AE",
        currency: "AED",
        originalAmountMinor: 2_000,
        currentAmountMinor: 2_000,
        linkState: "PAID",
        paymentState: "REFUNDED",
        expiresAt: new Date(now + 2 * 60 * 60_000),
        events: [
          "First captured payment fulfilled the request.",
          "A second captured payment was detected.",
          "Duplicate payment refund recorded idempotently.",
        ],
      };
    default:
      return {
        ...base,
        title: scenarioLabels[scenarioId],
        countryCode: "IN",
        currency: "INR",
        originalAmountMinor: 20_000,
        currentAmountMinor: 20_000,
        linkState: "ACTIVE",
        paymentState: "AWAITING",
        expiresAt: new Date(now + 2 * 60 * 60_000),
        events: [
          "Three document captures retained.",
          "Request is waiting for payment.",
        ],
      };
  }
}

export function PaymentLifecycleDemo() {
  const { prices } = usePaymentDemo();
  const [state, setState] = useState(() => createScenario("expired"));
  const [hours, setHours] = useState(6);
  const [priceChoice, setPriceChoice] = useState<"ORIGINAL" | "LATEST">(
    "ORIGINAL",
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const latest = prices[state.countryCode];
  const canRenew =
    state.linkState !== "PAID" &&
    state.linkState !== "DELETED" &&
    state.uploads > 0;
  const chosenAmount =
    priceChoice === "ORIGINAL"
      ? state.originalAmountMinor
      : latest.amountMinor;
  const countryLabel = state.countryCode === "IN" ? "India" : "UAE / Dubai";
  const expiryLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(state.expiresAt),
    [state.expiresAt],
  );

  function renew(rotate: boolean) {
    if (!canRenew || (priceChoice === "LATEST" && !latest.enabled)) return;
    const nextRevision = rotate ? state.linkRevision + 1 : state.linkRevision;
    const usesLatest = priceChoice === "LATEST";
    setState((current) => ({
      ...current,
      currentAmountMinor: chosenAmount,
      priceRevision: usesLatest
        ? latest.revision
        : current.originalPriceRevision,
      linkRevision: nextRevision,
      linkState: "ACTIVE",
      paymentState: "AWAITING",
      expiresAt: new Date(Date.now() + hours * 60 * 60_000),
      events: [
        ...current.events,
        `${rotate ? "New token issued; displayed old token invalidated" : "Existing token extended"} for ${hours} ${hours === 1 ? "hour" : "hours"}.`,
        `${usesLatest ? "Latest" : "Original"} price selected: ${formatDemoMoney(chosenAmount, state.currency)}.`,
        `${current.uploads} uploads preserved.`,
      ],
    }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-bold">Preset scenario</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Admin and customer flows are independent fixtures in Phase 1.
          </p>
          <Select
            value={state.scenarioId}
            onValueChange={(value) =>
              setState(createScenario(value as ScenarioId))
            }
          >
            <SelectTrigger className="mt-5 min-h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(scenarioLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <InlineAlert tone="warning" className="mt-5">
            Demo payment — no money will be charged. This page does not control
            a customer tab and resets on refresh.
          </InlineAlert>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Renew unpaid request</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold">
                New duration
              </span>
              <Select
                value={String(hours)}
                onValueChange={(value) => setHours(Number(value))}
              >
                <SelectTrigger className="min-h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, index) => index + 1).map(
                    (hour) => (
                    <SelectItem key={hour} value={String(hour)}>
                      {hour} {hour === 1 ? "hour" : "hours"}
                    </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">
                Renewal price
              </span>
              <Select
                value={priceChoice}
                onValueChange={(value) =>
                  setPriceChoice(value as "ORIGINAL" | "LATEST")
                }
              >
                <SelectTrigger className="min-h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORIGINAL">
                    Original ·{" "}
                    {formatDemoMoney(
                      state.originalAmountMinor,
                      state.currency,
                    )}
                  </SelectItem>
                  <SelectItem value="LATEST" disabled={!latest.enabled}>
                    Latest ·{" "}
                    {formatDemoMoney(latest.amountMinor, latest.currency)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
          {!latest.enabled ? (
            <p className="mt-3 text-xs text-warning">
              Latest pricing is unavailable because {countryLabel} is disabled.
              The original snapshot remains selectable.
            </p>
          ) : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!canRenew}
              onClick={() => renew(false)}
            >
              <RefreshCw className="size-4" /> Extend same link
            </Button>
            <Button
              type="button"
              disabled={!canRenew}
              onClick={() => renew(true)}
            >
              <RotateCw className="size-4" /> Issue new token
            </Button>
          </div>
          <Button
            type="button"
            variant="danger"
            className="mt-3 w-full"
            disabled={state.uploads === 0}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" /> Delete retained uploads
          </Button>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              Lifecycle preview
            </p>
            <h2 className="mt-2 text-xl font-bold">{state.title}</h2>
          </div>
          <Badge
            tone={
              state.linkState === "PAID"
                ? "success"
                : state.linkState === "EXPIRED" ||
                    state.linkState === "DELETED"
                  ? "danger"
                  : "warning"
            }
          >
            {state.linkState}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-muted p-4">
            <dt className="text-muted-foreground">Country and price</dt>
            <dd className="mt-1 font-semibold">
              {countryLabel} ·{" "}
              {formatDemoMoney(state.currentAmountMinor, state.currency)}
            </dd>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <dt className="text-muted-foreground">Link revision</dt>
            <dd className="mt-1 font-semibold">v{state.linkRevision}</dd>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <dt className="text-muted-foreground">Retained uploads</dt>
            <dd className="mt-1 font-semibold">{state.uploads}</dd>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <dt className="text-muted-foreground">Payment state</dt>
            <dd className="mt-1 font-semibold">{state.paymentState}</dd>
          </div>
          <div className="rounded-xl bg-muted p-4 sm:col-span-2">
            <dt className="text-muted-foreground">Expiry</dt>
            <dd className="mt-1 font-semibold">{expiryLabel}</dd>
          </div>
        </dl>

        <div className="mt-7">
          <h3 className="font-bold">Event timeline</h3>
          <ol className="mt-4 space-y-4 border-l border-border pl-5">
            {state.events.map((event, index) => (
              <li key={`${index}-${event}`} className="relative text-sm">
                <span className="absolute top-1.5 -left-[1.45rem] size-2 rounded-full bg-primary" />
                {event}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileArchive className="size-4 text-primary" /> Upload fixture
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link2 className="size-4 text-primary" /> Simulated token
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="size-4 text-primary" /> In-memory expiry
          </div>
        </div>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete retained uploads?</DialogTitle>
            <DialogDescription>
              This changes only the selected fixture. Production deletion will
              require a backend audit record and private-storage cleanup.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
            >
              Keep uploads
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setState((current) => ({
                  ...current,
                  uploads: 0,
                  linkState: "DELETED",
                  events: [
                    ...current.events,
                    "Admin confirmed deletion; fixture uploads removed.",
                  ],
                }));
                setDeleteOpen(false);
              }}
            >
              <Trash2 className="size-4" /> Delete uploads
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
