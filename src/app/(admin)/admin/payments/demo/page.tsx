import { CreditCard } from "lucide-react";
import { PageHeading } from "@/components/admin/page-heading";
import { PaymentLifecycleDemo } from "@/components/admin/payment-lifecycle-demo";

export default function PaymentDemoPage() {
  return (
    <>
      <PageHeading
        eyebrow="Frontend-only UI testing"
        title="Payment lifecycle demo"
        description="Test India and UAE payment, expiry, renewal, repricing, and upload-retention states without a gateway or real charge."
        icon={CreditCard}
        demo
      />
      <PaymentLifecycleDemo />
    </>
  );
}
