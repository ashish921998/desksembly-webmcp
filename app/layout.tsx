import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ShopifyRuntime } from "@/src/experience/ShopifyRuntime";
import { getShopifyRuntimeConfig } from "@/src/commerce/shopify-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Desksembly — WebMCP miniature desk builder",
  description:
    "A Shopify-backed miniature desk world designed for shoppers and browser agents.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const runtime = getShopifyRuntimeConfig();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ShopifyRuntime shop={runtime.shop} i18n={runtime.i18n} />
        {children}
      </body>
    </html>
  );
}
