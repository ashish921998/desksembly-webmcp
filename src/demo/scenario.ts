import { MOCK_DESK_PRODUCTS } from "@/src/commerce/mock-catalog";

export const STARTER_PROMPT =
  "Build a cozy work-from-home desk setup under $350 for a small room in the US. No RGB. Keep the orange lamp.";

export const STARTER_SELECTIONS = [
  {
    merchandiseId: MOCK_DESK_PRODUCTS[1].merchandiseId,
    role: "display" as const,
    reason: "Compact display for a small room.",
  },
  {
    merchandiseId: MOCK_DESK_PRODUCTS[2].merchandiseId,
    role: "input" as const,
    reason: "Quiet no-RGB keyboard.",
  },
  {
    merchandiseId: MOCK_DESK_PRODUCTS[3].merchandiseId,
    role: "audio" as const,
    reason: "Small speaker for calm background audio.",
  },
  {
    merchandiseId: MOCK_DESK_PRODUCTS[5].merchandiseId,
    role: "decor" as const,
    preferredAnchorId: "decor-back",
    reason: "A warm plant for the wide desk.",
  },
] as const;

export const CONSTRAINT_SHOCK_PROMPT =
  "Fit this on a 90 cm desk, keep it under $300, and only use items available in the US.";

export const CONSTRAINT_SHOCK_SELECTIONS = [
  STARTER_SELECTIONS[0],
  STARTER_SELECTIONS[1],
  STARTER_SELECTIONS[2],
  {
    merchandiseId: MOCK_DESK_PRODUCTS[9].merchandiseId,
    role: "decor" as const,
    preferredAnchorId: "organization-left",
    reason: "Compact replacement for the 90 cm desk.",
  },
] as const;
