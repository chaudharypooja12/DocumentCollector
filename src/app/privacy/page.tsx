import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How DocumentCollector, powered by MBWays, handles information in Phase 1.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 8, 2026">
      <section>
        <h2 className="text-lg font-bold text-foreground">Overview</h2>
        <p className="mt-2">
          DocumentCollector is a tool owned and operated by MBWays
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;). This policy explains how
          DocumentCollector handles information during its current Phase 1
          release.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          Phase 1 privacy by design
        </h2>
        <p className="mt-2">
          Phase 1 has no backend, no database, and no file uploads. Every
          document request link, captured image, entered detail (name, age,
          gender, phone, and address), and generated PDF stays only in your
          browser&apos;s current-page memory. Nothing is transmitted to
          MBWays or stored on a server. Closing or refreshing the page
          permanently clears this information.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          Information we do not collect
        </h2>
        <p className="mt-2">
          We do not collect analytics, cookies, or tracking identifiers in
          Phase 1. Request links are deliberately built to exclude names,
          phone numbers, emails, or images from the link itself.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          Contacting us about privacy
        </h2>
        <p className="mt-2">
          If you have questions about this policy, contact MBWays at{" "}
          <a
            href="mailto:info@mbways.com"
            className="font-semibold text-primary underline"
          >
            info@mbways.com
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
