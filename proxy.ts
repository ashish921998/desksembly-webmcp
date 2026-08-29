import { handleShopifyRoutes } from "@shopify/hydrogen";
import { NextResponse, type NextRequest } from "next/server";
import { createRouteSessionManager } from "@/src/commerce/route-session";
import { createStorefrontClientForRequest } from "@/src/commerce/storefront";

export function proxy(request: NextRequest) {
  const { requestContext, storefrontClient } =
    createStorefrontClientForRequest(request);
  const shopifyRoute = handleShopifyRoutes({
    request,
    requestContext,
    storefrontClient,
    sessionManager: createRouteSessionManager(request),
  });

  if (shopifyRoute) return shopifyRoute;

  const response = NextResponse.next({
    request: { headers: requestContext.getForwardedRequestHeaders() },
  });
  requestContext.applyResponseHeaders(response.headers);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/data|favicon.ico).*)"],
};
