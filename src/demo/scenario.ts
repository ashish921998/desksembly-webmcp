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
] as const;
