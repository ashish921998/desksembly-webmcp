"use client";

import { ShopifyScripts } from "@shopify/hydrogen/react";
import type {
  ShopifyScriptsI18n,
  ShopifyScriptsShop,
} from "@shopify/hydrogen";
import { useRouter } from "next/navigation";
import { routeTemplates } from "@/src/commerce/route-templates";

type ShopifyRuntimeProps = {
  shop: ShopifyScriptsShop;
  i18n: ShopifyScriptsI18n;
};

export function ShopifyRuntime({ shop, i18n }: ShopifyRuntimeProps) {
  const router = useRouter();

  return (
    <ShopifyScripts
      shop={shop}
      i18n={i18n}
      routes={routeTemplates}
      navigate={(url) => router.push(url)}
      shopifyAnalytics={false}
      webMcp
    />
  );
}
