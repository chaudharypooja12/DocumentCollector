import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using DocumentCollector, powered by MBWays, in Phase 1.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 8, 2026">
      <section>
        <h2 className="text-lg font-bold text-foreground">
          About this tool
        </h2>
        <p className="mt-2">
          DocumentCollector is a document-collection utility owned and
          operated by MBWays. It helps an Admin request specific documents
          from a person and guides that person through capturing them on a
          phone, without requiring an account.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          Phase 1 scope and limitations
        </h2>
        <p className="mt-2">
          Phase 1 is a frontend-only preview. It has no authenticated Admin
          session, no persistent storage, and no server-side validation.
          Generated links, captures, and PDFs exist only in the current
          browser tab. Do not rely on Phase 1 for production document
          collection; secure, persistent handling begins in a later phase.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          Acceptable use
        </h2>
        <p className="mt-2">
          Do not use DocumentCollector to request documents you are not
          authorized to collect, or to capture or transmit unlawful content.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          Intellectual property
        </h2>
        <p className="mt-2">
          The MBWays name, logo, and DocumentCollector branding may not be
          copied, altered, or reused without permission.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">Contact</h2>
        <p className="mt-2">
          Questions about these terms can be sent to{" "}
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
