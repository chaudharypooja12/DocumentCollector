import type { Metadata } from "next";
import { UserFlow } from "@/modules/user-upload/user-flow";

export const metadata: Metadata = {
  title: "Document request",
  description: "Capture requested documents securely on your device.",
};

export default function UserPage() {
  return <UserFlow />;
}
