import { z } from "zod";

export const DEMO_GATEWAY = "RAZORPAY_MOCK" as const;
export const MAX_DEMO_AMOUNT_MINOR = 100_000_000;

export const countryCodeSchema = z.enum(["IN", "AE"]);
export const currencyCodeSchema = z.enum(["INR", "AED"]);

export type DemoCountryCode = z.infer<typeof countryCodeSchema>;
export type DemoCurrencyCode = z.infer<typeof currencyCodeSchema>;

export type DemoCountryPrice = {
  countryCode: DemoCountryCode;
  countryName: string;
  currency: DemoCurrencyCode;
  amountMinor: number;
  enabled: boolean;
};

export type DemoPaymentConfig = {
  countryCode: DemoCountryCode;
  currency: DemoCurrencyCode;
  amountMinor: number;
  gateway: typeof DEMO_GATEWAY;
  priceRevision: number;
  linkRevision: number;
};

export const DEFAULT_DEMO_PRICES: Record<DemoCountryCode, DemoCountryPrice> = {
  IN: {
    countryCode: "IN",
    countryName: "India",
    currency: "INR",
    amountMinor: 20_000,
    enabled: true,
  },
  AE: {
    countryCode: "AE",
    countryName: "United Arab Emirates",
    currency: "AED",
    amountMinor: 2_000,
    enabled: true,
  },
};

export const demoPaymentConfigSchema = z
  .object({
    countryCode: countryCodeSchema,
    currency: currencyCodeSchema,
    amountMinor: z.number().int().positive().max(MAX_DEMO_AMOUNT_MINOR),
    gateway: z.literal(DEMO_GATEWAY),
    priceRevision: z.number().int().positive(),
    linkRevision: z.number().int().positive(),
  })
  .strict()
  .superRefine((payment, context) => {
    const expectedCurrency = DEFAULT_DEMO_PRICES[payment.countryCode].currency;
    if (payment.currency !== expectedCurrency) {
      context.addIssue({
        code: "custom",
        message: `${payment.countryCode} payments must use ${expectedCurrency}.`,
        path: ["currency"],
      });
    }
  });

export function formatDemoMoney(
  amountMinor: number,
  currency: DemoCurrencyCode,
): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function parseDemoMajorAmount(value: string): number | null {
  if (!/^\d{1,7}(?:\.\d{1,2})?$/u.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  if (!whole) return null;
  const amountMinor =
    Number.parseInt(whole, 10) * 100 +
    Number.parseInt(fraction.padEnd(2, "0") || "0", 10);
  return amountMinor > 0 && amountMinor <= MAX_DEMO_AMOUNT_MINOR
    ? amountMinor
    : null;
}

export function toDemoPaymentConfig(
  price: DemoCountryPrice,
  priceRevision = 1,
  linkRevision = 1,
): DemoPaymentConfig {
  return demoPaymentConfigSchema.parse({
    countryCode: price.countryCode,
    currency: price.currency,
    amountMinor: price.amountMinor,
    gateway: DEMO_GATEWAY,
    priceRevision,
    linkRevision,
  });
}
