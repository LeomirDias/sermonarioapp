import "./globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sermonário App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased`}>
        <NuqsAdapter>
          {children}
          <SpeedInsights />
        </NuqsAdapter>
        <Toaster position="top-right" richColors theme="light" />
      </body>
    </html>
  );
}
