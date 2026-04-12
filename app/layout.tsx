import type { Metadata } from "next";

import { SipwiseProvider } from "@/components/sipwise-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "sip'n shot",
  description: "AI-powered party drink guide. Get personalized drink suggestions, bottle counts, and a pacing plan for any event.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SipwiseProvider>{children}</SipwiseProvider>
      </body>
    </html>
  );
}
