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
import { Badge, Card } from "@/components/shared/ui";
import { demoSubmissions } from "@/modules/admin/fixtures";

const stats = [
  {
    label: "Demo requests",
    value: "12",
    icon: FileStack,
    tone: "text-orange-300",
  },
  { label: "In progress", value: "4", icon: Clock3, tone: "text-amber-300" },
  { label: "Demo users", value: "8", icon: UserRound, tone: "text-blue-300" },
  {
    label: "Ready PDFs",
    value: "6",
    icon: CheckCircle2,
    tone: "text-emerald-300",
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
          <Link
            href="/admin/requests/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 text-sm font-semibold shadow-lg shadow-orange-950/30 transition hover:brightness-110"
          >
            Create request <ArrowRight className="size-4" />
          </Link>
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
                <p className="text-sm text-white/55">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
              </div>
              <span className={`rounded-xl bg-white/7 p-2.5 ${tone}`}>
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
              <p className="mt-1 text-sm text-white/50">
                Illustrative data only; nothing is stored.
              </p>
            </div>
            <Badge>Demo</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {demoSubmissions.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{item.reference}</p>
                  <p className="mt-1 text-xs text-white/50">
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
          <p className="mt-3 text-sm leading-6 text-white/60">
            Phase 1 has no database, uploads, accounts, or browser storage.
            Captures stay on the user&apos;s device and disappear when the page
            closes.
          </p>
          <Link
            href="/admin/requests/new"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-orange-200 hover:text-white"
          >
            Build a temporary request <ArrowRight className="size-4" />
          </Link>
        </Card>
      </div>
    </>
  );
}
