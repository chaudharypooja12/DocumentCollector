"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileStack,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests/new", label: "Create request", icon: FileStack },
  { href: "/admin/payments/demo", label: "Payment demo", icon: CreditCard },
  { href: "/admin/users", label: "Users", icon: UserRound },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

function getPageTitle(pathname: string) {
  return (
    navigation.find(({ href }) =>
      href === "/admin" ? pathname === href : pathname.startsWith(href),
    )?.label ?? "Admin workspace"
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") {
    return children;
  }

  const nav = (
    <nav aria-label="Admin navigation" className="space-y-1.5">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-svh bg-content">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-sidebar px-5 py-4 lg:flex lg:flex-col">
        <BrandLockup />
        <div className="mt-8 flex-1">{nav}</div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold text-primary">
            Phase 1 workspace
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Demo data resets on refresh. No information is saved.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border bg-header backdrop-blur-xl lg:ml-72">
        <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Open navigation"
                >
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[min(88vw,20rem)] bg-sidebar"
              >
                <SheetHeader className="text-left">
                  <BrandLockup />
                  <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigate the DocumentCollector Admin workspace.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-7">{nav}</div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {getPageTitle(pathname)}
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              DocumentCollector · Powered by MBWays
            </p>
          </div>

          <ThemeToggle />
          <Button asChild variant="outline">
            <Link href="/admin/login" aria-label="Logout">
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="min-h-[calc(100svh-4rem)] lg:pl-72">
        <div className="page-shell py-7 sm:py-9">{children}</div>
      </main>
    </div>
  );
}
