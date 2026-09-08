"use client";

import { RotateCcw, WalletCards } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatDemoMoney,
  parseDemoMajorAmount,
  type DemoCountryCode,
} from "@/lib/payment-demo";
import { usePaymentDemo } from "@/providers/payment-demo-provider";

function PriceEditor({ countryCode }: { countryCode: DemoCountryCode }) {
  const { prices, setAmountMinor, setEnabled } = usePaymentDemo();
  const price = prices[countryCode];
  const [draft, setDraft] = useState(String(price.amountMinor / 100));
  const amountMinor = parseDemoMajorAmount(draft);

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">{price.countryName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {price.currency} · revision {price.revision}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`enable-${countryCode}`}
            checked={price.enabled}
            onCheckedChange={(checked) =>
              setEnabled(countryCode, checked === true)
            }
          />
          <Label htmlFor={`enable-${countryCode}`} className="font-normal">
            Enabled
          </Label>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-2 block text-sm font-semibold">
            Price in {price.currency}
          </span>
          <Input
            type="number"
            min="0.01"
            max="1000000"
            step="0.01"
            value={draft}
            aria-invalid={amountMinor === null}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          disabled={
            amountMinor === null || amountMinor === price.amountMinor
          }
          onClick={() => {
            if (amountMinor !== null) setAmountMinor(countryCode, amountMinor);
          }}
        >
          Apply demo price
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Current link price: {formatDemoMoney(price.amountMinor, price.currency)}
      </p>
    </div>
  );
}

export function PaymentDemoSettings() {
  const { prices, resetPrices } = usePaymentDemo();
  const [resetVersion, setResetVersion] = useState(0);

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <WalletCards className="size-5" />
          </span>
          <h2 className="text-lg font-bold">Payment demo</h2>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            resetPrices();
            setResetVersion((current) => current + 1);
          }}
        >
          <RotateCcw className="size-4" /> Reset
        </Button>
      </div>
      <InlineAlert tone="warning" className="mt-5">
        Demo payment — no money will be charged. Prices reset on refresh and are
        not shared with another tab.
      </InlineAlert>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <PriceEditor
          key={`IN-${prices.IN.revision}-${resetVersion}`}
          countryCode="IN"
        />
        <PriceEditor
          key={`AE-${prices.AE.revision}-${resetVersion}`}
          countryCode="AE"
        />
      </div>
    </Card>
  );
}
