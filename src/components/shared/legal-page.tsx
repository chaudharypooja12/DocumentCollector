import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Card } from "@/components/ui/card";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh">
      <header className="border-b border-border bg-header backdrop-blur-xl">
        <div className="page-shell flex min-h-20 items-center justify-between gap-3">
          <BrandLockup href="/" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin/login"
              className="hidden text-sm font-semibold text-muted-foreground hover:text-foreground sm:inline"
            >
              Admin workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="page-shell py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Last updated {updated}
          </p>
          <Card className="mt-8 space-y-6 leading-7 text-muted-foreground">
            {children}
          </Card>
        </div>
      </main>

      <footer className="page-shell flex flex-col gap-3 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>DocumentCollector — Powered by MBWays</p>
        <p>Opening Pathways to Opportunities.</p>
      </footer>
    </div>
  );
}
