import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileStack,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PageHeading } from "@/components/admin/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoSubmissions } from "@/data/admin-fixtures";

const stats = [
  {
    label: "Demo requests",
    value: "12",
    icon: FileStack,
    tone: "text-primary",
  },
  { label: "In progress", value: "4", icon: Clock3, tone: "text-warning" },
  {
    label: "Demo users",
    value: "8",
    icon: UserRound,
    tone: "text-blue-700 dark:text-blue-300",
  },
  {
    label: "Ready PDFs",
    value: "6",
    icon: CheckCircle2,
    tone: "text-success",
  },
];

export default function AdminDashboard() {
  return (
    <>
      <PageHeading
        eyebrow="Admin workspace"
        title="Collect documents without the back-and-forth."
        description="Configure a private, temporary checklist and share it by link or QR. In Phase 1, every request lives only inside its generated link."
        demo
        action={
          <Button asChild>
            <Link href="/admin/requests/new">
              Create request <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <section
        aria-label="Overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
              </div>
              <span className={`rounded-xl bg-muted p-2.5 ${tone}`}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                Recent demonstration activity
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Illustrative data only; nothing is stored.
              </p>
            </div>
            <Badge>Demo</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {demoSubmissions.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/35 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{item.reference}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.documents} documents · {item.createdAt}
                  </p>
                </div>
                <Badge
                  tone={
                    item.status === "Ready"
                      ? "success"
                      : item.status === "Review"
                        ? "warning"
                        : "brand"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute -top-16 -right-16 size-40 rounded-full bg-primary/20 blur-3xl" />
          <ShieldCheck className="size-8 text-primary" aria-hidden="true" />
          <h2 className="mt-5 text-xl font-bold">Private by design</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Phase 1 has no database, uploads, accounts, or browser storage.
            Captures stay on the user&apos;s device and disappear when the page
            closes.
          </p>
          <Button asChild variant="link" className="mt-4 px-0">
            <Link href="/admin/requests/new">
              Build a temporary request <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Card>
      </div>
    </>
  );
}
