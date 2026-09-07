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

export default function Home() {
  return (
    <div className="min-h-svh">
      <header className="border-b border-white/8 bg-[#090b11]/75 backdrop-blur-2xl">
        <div className="page-shell flex min-h-20 items-center justify-between gap-3">
          <BrandLockup href="/" />
          <Link
            href="/admin/login"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/7 px-4 text-sm font-semibold transition hover:bg-white/12"
          >
            Admin workspace
          </Link>
        </div>
      </header>

      <main>
        <section className="page-shell grid min-h-[calc(100svh-5rem)] items-center gap-12 py-14 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/8 px-3 py-1.5 text-xs font-semibold text-orange-100">
              <Sparkles className="size-4" />
              Private, mobile-first document collection
            </div>
            <h1 className="text-balance mt-6 max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-6xl">
              Turn document requests into a{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                guided phone workflow.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
              DocumentCollector helps MBWays prepare a temporary checklist,
              guide each camera capture, and produce a clean A4 PDF directly on
              the user&apos;s device.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/login"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 text-sm font-semibold shadow-xl shadow-orange-950/35 transition hover:brightness-110"
              >
                Open Admin workspace <ArrowRight className="size-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/7 px-6 text-sm font-semibold transition hover:bg-white/12"
              >
                See how it works
              </a>
            </div>
            <div className="mt-8 flex items-start gap-3 text-sm text-white/50">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
              <p>
                Phase 1 uploads nothing and stores nothing. Images and PDFs
                remain in the current browser tab.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 rounded-full bg-primary/15 blur-3xl" />
            <div className="glass-card-strong relative overflow-hidden p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-5">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                    Request preview
                  </p>
                  <h2 className="mt-1 text-xl font-bold">Student documents</h2>
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-emerald-200">
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
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-4"
                  >
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-sm font-bold text-orange-200">
                      {number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{name}</p>
                      <p className="mt-0.5 text-xs text-white/45">{type}</p>
                    </div>
                    <FileCheck2 className="size-5 text-white/25" />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/5 p-3 text-xs text-white/55">
                <Link2 className="size-4 text-primary" /> Share by secure link
                or QR code
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-white/8 bg-black/15"
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
                <article key={title} className="glass-card p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-orange-200">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="page-shell flex flex-col gap-3 py-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <p>DocumentCollector — Powered by MBWays</p>
        <p>Opening Pathways to Opportunities.</p>
      </footer>
    </div>
  );
}
