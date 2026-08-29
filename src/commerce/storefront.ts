import "server-only";

import {
  createShopifyRequestContext,
  createStorefrontClient,
} from "@shopify/hydrogen";
import { headers } from "next/headers";
import { cache } from "react";
import {
  getPublicStorefrontToken,
  getStoreDomain,
} from "@/src/commerce/shopify-config";

const I18N = { country: "IN", language: "EN" } as const;

export function createStorefrontClientForRequest(request: Request) {
  const requestContext = createShopifyRequestContext({ request, i18n: I18N });
  const storefrontClient = createStorefrontClient({
    type: "public",
    requestContext,
    config: {
      storeDomain: getStoreDomain(),
      publicStorefrontToken: getPublicStorefrontToken(),
    },
  });

  return { requestContext, storefrontClient };
}

export const getStorefrontClient = cache(async () => {
  const requestHeaders = await headers();
  const requestContext = createShopifyRequestContext({
    request: { headers: requestHeaders },
    i18n: I18N,
  });

  return createStorefrontClient({
    type: "public",
    requestContext,
    config: {
      storeDomain: getStoreDomain(),
      publicStorefrontToken: getPublicStorefrontToken(),
    },
  });
});
