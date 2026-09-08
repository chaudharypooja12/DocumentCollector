import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PaymentDemoProvider } from "@/providers/payment-demo-provider";
import { TemplatesProvider } from "@/providers/templates-provider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PaymentDemoProvider>
      <TemplatesProvider>
        <AdminShell>{children}</AdminShell>
      </TemplatesProvider>
    </PaymentDemoProvider>
  );
}
