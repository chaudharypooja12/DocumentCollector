import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PaymentDemoProvider } from "@/providers/payment-demo-provider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PaymentDemoProvider>
      <AdminShell>{children}</AdminShell>
    </PaymentDemoProvider>
  );
}
