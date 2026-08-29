import "server-only";

import type {
  ShopifyScriptsI18n,
  ShopifyScriptsShop,
} from "@shopify/hydrogen";

const DEFAULT_STORE_DOMAIN = "mock.shop";
const DEFAULT_SHOP_ID = "gid://shopify/Shop/68817551382";

export function getStoreDomain() {
  return process.env.PUBLIC_STORE_DOMAIN?.trim() || DEFAULT_STORE_DOMAIN;
}

export function getPublicStorefrontToken() {
  return process.env.PUBLIC_STOREFRONT_API_TOKEN?.trim() || undefined;
}

export function getShopifyRuntimeConfig(): {
  shop: ShopifyScriptsShop;
  i18n: ShopifyScriptsI18n;
} {
  const shop: ShopifyScriptsShop = {
    shopId: process.env.SHOP_ID?.trim() || DEFAULT_SHOP_ID,
    storefrontId: process.env.PUBLIC_STOREFRONT_ID?.trim() || "0",
    myshopifyDomain: getStoreDomain(),
  };
  const i18n: ShopifyScriptsI18n = {
    country: "IN",
    language: "EN",
    currency: "INR",
  };

  return { shop, i18n };
}
