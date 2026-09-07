"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileStack,
  Files,
  LayoutDashboard,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { BrandLockup } from "@/components/shared/brand-lockup";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests/new", label: "Create request", icon: FileStack },
  { href: "/admin/users", label: "Users", icon: UserRound },
  { href: "/admin/submissions", label: "Submissions", icon: Files },
  { href: "/admin/pdf", label: "PDF management", icon: FileStack },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") {
    return children;
  }

  const nav = (
    <nav aria-label="Admin navigation" className="space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
              active
                ? "bg-primary text-white shadow-lg shadow-orange-950/20"
                : "text-white/65 hover:bg-white/7 hover:text-white"
            }`}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#090b11]/85 backdrop-blur-2xl lg:hidden">
        <div className="page-shell flex min-h-16 items-center justify-between">
          <BrandLockup compact />
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/6"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-admin-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open ? (
          <div id="mobile-admin-navigation" className="page-shell pb-4">
            <div className="glass-card-strong p-3">{nav}</div>
          </div>
        ) : null}
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/8 bg-[#090b11]/75 p-5 backdrop-blur-2xl lg:block">
        <BrandLockup />
        <div className="mt-10">{nav}</div>
        <div className="absolute right-5 bottom-5 left-5 rounded-2xl border border-orange-400/15 bg-orange-400/6 p-4">
          <p className="text-xs font-semibold text-orange-100">
            Phase 1 workspace
          </p>
          <p className="mt-1 text-xs leading-5 text-white/50">
            Demo data resets on refresh. No information is saved.
          </p>
        </div>
      </aside>

      <main className="min-h-svh lg:pl-72">
        <div className="page-shell py-7 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
