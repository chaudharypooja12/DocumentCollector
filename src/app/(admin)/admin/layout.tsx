import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { TemplatesProvider } from "@/providers/templates-provider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <TemplatesProvider>
      <AdminShell>{children}</AdminShell>
    </TemplatesProvider>
  );
}
