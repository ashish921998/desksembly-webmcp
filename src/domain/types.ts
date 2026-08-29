export type ScenePhase =
  | "ready"
  | "planning"
  | "proposal"
  | "staging"
  | "editable"
  | "needs-revision"
  | "review"
  | "carting"
  | "ready-for-checkout"
  | "unsupported";

export type ProductRole =
  | "lamp"
  | "display"
  | "input"
  | "audio"
  | "seating"
  | "organization"
  | "decor";

export type Money = { amount: string; currencyCode: string };

export type ProductDimensions = {
  widthCm: number;
  depthCm: number;
  heightCm: number;
};

export type ProductVariantRef = {
  merchandiseId: string;
  productId: string;
  handle: string;
  title: string;
  variantTitle: string;
  role: ProductRole;
  imageUrl: string | null;
  price: Money;
  available: boolean;
  market: string;
  dimensions?: ProductDimensions;
  tags?: string[];
};

export type SceneItem = {
  id: string;
  variant: ProductVariantRef;
  anchorId: string;
  status: "proposal" | "confirmed" | "returning" | "carted" | "error";
  owner: "agent" | "human";
  locked: boolean;
  reason: string;
};

export type WorldConstraints = {
  budget: Money;
  deskWidthCm: number;
  market: string;
  styleTags: string[];
  disallowedTags: string[];
  minItems: number;
  maxItems: number;
};

export type SceneSnapshot = {
  sceneVersion: number;
  phase: ScenePhase;
  constraints: WorldConstraints;
  items: SceneItem[];
  occupiedAnchors: string[];
  lockedItemIds: string[];
  total: Money;
};

export type PlanSelection = {
  merchandiseId: string;
  role: ProductRole;
  preferredAnchorId?: string;
  reason: string;
};

export type PlanPlacement = {
  merchandiseId: string;
  role: ProductRole;
  anchorId: string;
  reason: string;
};

export type PlanProposal = {
  proposalId: string;
  basedOnSceneVersion: number;
  constraints: WorldConstraints;
  placements: PlanPlacement[];
  variants: ProductVariantRef[];
  rejected: Array<{ merchandiseId: string; code: string; message: string }>;
  digest: string;
};

export type KitReviewLine = {
  merchandiseId: string;
  title: string;
  variantTitle: string;
  quantity: number;
  price: Money;
};

export type KitReview = {
  reviewId: string;
  sceneVersion: number;
  lines: KitReviewLine[];
  total: Money;
  warnings: string[];
  digest: string;
};

export type ReviewApproval = {
  digest: string;
  approvedAt: number;
  expiresAt: number;
  consumed: boolean;
};

export type CartLineSnapshot = {
  merchandiseId: string;
  quantity: number;
};

export type CartSnapshot = {
  id: string;
  lines: CartLineSnapshot[];
  total: Money;
  checkoutUrl: string | null;
};

export type ActivityReceipt = {
  id: string;
  stage: "search" | "check" | "stage" | "review" | "cart";
  status: "pending" | "success" | "error";
  label: string;
};

export type SceneStoreState = {
  sceneVersion: number;
  phase: ScenePhase;
  constraints: WorldConstraints;
  itemsById: Record<string, SceneItem>;
  proposal: PlanProposal | null;
  review: KitReview | null;
  approval: ReviewApproval | null;
  activityReceipts: ActivityReceipt[];
  cartSnapshot: CartSnapshot | null;
  selectedItemId: string | null;
  reducedMotion: boolean;
  webMcpCapability: "checking" | "supported" | "unsupported" | "error";
  lastStableSnapshot: SceneSnapshot | null;
};
