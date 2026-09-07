import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DocumentCollector",
    template: "%s | DocumentCollector",
  },
  description:
    "Create temporary document requests and generate A4 PDFs privately on your device.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
