import Link from "next/link";
import {
  ArrowRight,
  Camera,
  FileCheck2,
  Link2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-svh">
      <header className="border-b border-border bg-header backdrop-blur-xl">
        <div className="page-shell flex min-h-20 items-center justify-between gap-3">
          <BrandLockup href="/" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline">
              <Link href="/admin/login">Admin workspace</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="page-shell grid min-h-[calc(100svh-5rem)] items-center gap-12 py-14 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-4" />
              Private, mobile-first document collection
            </div>
            <h1 className="text-balance mt-6 max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-6xl">
              Turn document requests into a{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                guided phone workflow.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              DocumentCollector helps MBWays prepare a temporary checklist,
              guide each camera capture, and produce a clean A4 PDF directly on
              the user&apos;s device.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/admin/login">
                  Open Admin workspace <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
            <div className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
              <p>
                Phase 1 uploads nothing and stores nothing. Images and PDFs
                remain in the current browser tab.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 rounded-full bg-primary/15 blur-3xl" />
            <Card className="relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-5">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                    Request preview
                  </p>
                  <h2 className="mt-1 text-xl font-bold">Student documents</h2>
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  3 hours
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["Passport", "Front + Back", "1"],
                  ["Photograph", "Single image", "2"],
                  ["Residence proof", "Single image", "3"],
                ].map(([name, type, number]) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-muted/35 p-4"
                  >
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-sm font-bold text-primary">
                      {number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {type}
                      </p>
                    </div>
                    <FileCheck2 className="size-5 text-muted-foreground/50" />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                <Link2 className="size-4 text-primary" /> Share by secure link
                or QR code
              </div>
            </Card>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-border bg-muted/30"
        >
          <div className="page-shell py-16">
            <p className="text-center text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Simple from request to PDF
            </p>
            <h2 className="text-balance mx-auto mt-3 max-w-2xl text-center text-3xl font-bold">
              No user account. No complicated upload portal.
            </h2>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Link2,
                  title: "1. Create a request",
                  copy: "Admin selects the required document names, capture type, order, and expiry.",
                },
                {
                  icon: Camera,
                  title: "2. Capture on phone",
                  copy: "The shared link opens the checklist directly with guided camera and file fallback.",
                },
                {
                  icon: FileCheck2,
                  title: "3. Generate locally",
                  copy: "The browser arranges captures into an A4 PDF ready to download or share.",
                },
              ].map(({ icon: Icon, title, copy }) => (
                <Card key={title}>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {copy}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="page-shell flex flex-col gap-4 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>DocumentCollector — Powered by MBWays</p>
        <nav aria-label="Legal" className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact Us
          </Link>
        </nav>
        <p>Opening Pathways to Opportunities.</p>
      </footer>
    </div>
  );
}
