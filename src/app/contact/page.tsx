import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact MBWays about DocumentCollector.",
};

const contactItems = [
  {
    icon: Mail,
    label: "Email",
    value: "info@mbways.com",
    href: "mailto:info@mbways.com",
  },
  {
    icon: Clock,
    label: "Office hours",
    value: "Mon–Sat, 10:00 AM – 7:00 PM IST",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Shop No. 14, Garg Plaza, Bhera Enclave, Paschim Vihar, Delhi 110087",
  },
];

export default function ContactPage() {
  return (
    <LegalPage title="Contact Us" updated="September 8, 2026">
      <p>
        DocumentCollector is powered by MBWays. For questions about this tool
        or MBWays&apos; consultancy services, reach out using any of the
        details below.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {contactItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-muted/35 p-4"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <item.icon className="size-4" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground">
              {item.label}
            </p>
            {"href" in item && item.href ? (
              <a
                href={item.href}
                className="text-sm text-primary hover:underline"
              >
                {item.value}
              </a>
            ) : (
              <p className="text-sm">{item.value}</p>
            )}
          </div>
        ))}
      </div>
    </LegalPage>
  );
}
