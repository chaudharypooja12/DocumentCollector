import type { ReactNode } from "react";
import { Badge, Card } from "@/components/shared/ui";

export type DemoListItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
};

export function DemoList({
  items,
  icon,
}: {
  items: DemoListItem[];
  icon: ReactNode;
}) {
  return (
    <Card className="p-0">
      <div className="hidden grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-white/8 px-6 py-3 text-xs font-semibold tracking-wide text-white/40 uppercase sm:grid">
        <span>Record</span>
        <span>Details</span>
        <span>Status</span>
      </div>
      <div className="divide-y divide-white/8">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid gap-4 p-5 sm:grid-cols-[1.2fr_1fr_auto] sm:items-center sm:px-6"
          >
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-white/7 p-2 text-primary">
                {icon}
              </span>
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="mt-1 text-xs text-white/45">{item.subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-white/60">{item.meta}</p>
            <div>
              <Badge tone={item.tone ?? "neutral"}>{item.status}</Badge>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
