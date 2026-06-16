import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KLLM's Dashboard",
  description: "Research guests, generate questions, draft outreach — all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
