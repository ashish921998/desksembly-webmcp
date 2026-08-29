import { handleShopifyRedirects } from "@shopify/hydrogen";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { routeTemplates } from "@/src/commerce/route-templates";
import { getStorefrontClient } from "@/src/commerce/storefront";

export default function NotFound() {
  return (
    <main className="shell">
      <section className="shell__hero">
        <Suspense fallback={null}>
          <RedirectChecker />
        </Suspense>
        <p className="shell__eyebrow">404</p>
        <h1>That parcel missed the desk.</h1>
        <p className="shell__lede">The requested storefront page was not found.</p>
      </section>
    </main>
  );
}

async function RedirectChecker() {
  await connection();
  const url = (await headers()).get("x-storefront-url");

  if (url) {
    const result = await handleShopifyRedirects({
      request: new Request(url),
      routeTemplates,
      storefrontClient: await getStorefrontClient(),
    });
    const location = result?.headers.get("location");
    if (location) redirect(location);
  }

  return null;
}
