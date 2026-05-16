import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "./globals.css";

import { cn } from "@/lib/utils";

import { Toaster } from "@/components/ui/sonner";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

function safeMetadataBase(): URL {
  const raw = (process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "http://localhost:3000").trim();
  try {
    return new URL(raw);
  } catch {
    console.warn("[layout] NEXTAUTH_URL/AUTH_URL inválido — usando localhost como metadataBase.");
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: safeMetadataBase(),
  title: "Horyzonn OS",
  description: "Sistema interno de operação · Horyzonn",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Horyzonn OS",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-dvh antialiased", sans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
