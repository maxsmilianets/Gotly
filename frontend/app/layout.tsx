import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Gotly",
  description: "Aplikacja do zarządzania projektami i zadaniami",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
