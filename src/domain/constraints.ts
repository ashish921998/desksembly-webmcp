import { DomainError } from "@/src/domain/errors";
import type {
  ProductVariantRef,
  SceneItem,
  WorldConstraints,
} from "@/src/domain/types";
import { ANCHOR_BY_ID } from "@/src/world/anchors";

export function moneyToMinorUnits(amount: string) {
  return Math.round(Number.parseFloat(amount) * 100);
}

export function validateVariant(
  variant: ProductVariantRef,
  constraints: WorldConstraints,
  expectedRole: ProductVariantRef["role"],
) {
  if (!variant.available) {
    throw new DomainError("UNAVAILABLE_VARIANT", `${variant.title} is unavailable.`);
  }
  if (variant.market !== constraints.market) {
    throw new DomainError(
      "MARKET_UNAVAILABLE",
      `${variant.title} is not available in market ${constraints.market}.`,
    );
  }
  if (variant.price.currencyCode !== constraints.budget.currencyCode) {
    throw new DomainError(
      "INVALID_INPUT",
      `${variant.title} uses ${variant.price.currencyCode}, not ${constraints.budget.currencyCode}.`,
    );
  }
  if (variant.role !== expectedRole) {
    throw new DomainError("INVALID_INPUT", `${variant.title} does not satisfy role ${expectedRole}.`);
  }
  const disallowed = new Set(constraints.disallowedTags.map((tag) => tag.toLowerCase()));
  if (variant.tags?.some((tag) => disallowed.has(tag.toLowerCase()))) {
    throw new DomainError("INVALID_INPUT", `${variant.title} has a disallowed tag.`);
  }
}

export function validateBudget(items: readonly SceneItem[], constraints: WorldConstraints) {
  const total = items.reduce(
    (sum, item) => sum + moneyToMinorUnits(item.variant.price.amount),
    0,
  );
  if (total > moneyToMinorUnits(constraints.budget.amount)) {
    throw new DomainError(
      "BUDGET_CONFLICT",
      `The setup exceeds the ${constraints.budget.currencyCode} ${constraints.budget.amount} budget.`,
    );
  }
}

export function validateItemCount(items: readonly SceneItem[], constraints: WorldConstraints) {
  if (items.length < constraints.minItems || items.length > constraints.maxItems) {
    throw new DomainError(
      "NO_VALID_PLAN",
      `The setup requires ${constraints.minItems}–${constraints.maxItems} products.`,
    );
  }
}

export function findConstraintShockItems(
  items: readonly SceneItem[],
  constraints: WorldConstraints,
) {
  return items.filter((item) => {
    const anchor = ANCHOR_BY_ID.get(item.anchorId);
    return !anchor || anchor.minDeskWidthCm > constraints.deskWidthCm;
  });
}
