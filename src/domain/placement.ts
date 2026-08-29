import { DomainError } from "@/src/domain/errors";
import type { ProductVariantRef, WorldConstraints } from "@/src/domain/types";
import { ANCHOR_BY_ID, DESK_ANCHORS } from "@/src/world/anchors";

function fits(variant: ProductVariantRef, anchorId: string, constraints: WorldConstraints) {
  const anchor = ANCHOR_BY_ID.get(anchorId);
  if (!anchor || !anchor.roles.includes(variant.role)) return false;
  if (anchor.minDeskWidthCm > constraints.deskWidthCm) return false;
  if (!variant.dimensions) return true;
  return (
    variant.dimensions.widthCm <= anchor.maxFootprint.widthCm &&
    variant.dimensions.depthCm <= anchor.maxFootprint.depthCm
  );
}

export function chooseAnchor(options: {
  variant: ProductVariantRef;
  constraints: WorldConstraints;
  occupied: ReadonlySet<string>;
  preferredAnchorId?: string;
}) {
  const { variant, constraints, occupied, preferredAnchorId } = options;
  if (preferredAnchorId) {
    if (occupied.has(preferredAnchorId) || !fits(variant, preferredAnchorId, constraints)) {
      throw new DomainError("ANCHOR_CONFLICT", `${preferredAnchorId} cannot hold ${variant.title}.`);
    }
    return preferredAnchorId;
  }

  const anchor = DESK_ANCHORS.find(
    (candidate) => !occupied.has(candidate.id) && fits(variant, candidate.id, constraints),
  );
  if (!anchor) {
    throw new DomainError("ANCHOR_CONFLICT", `No compatible desk anchor fits ${variant.title}.`);
  }
  return anchor.id;
}

export function assertValidMove(options: {
  variant: ProductVariantRef;
  targetAnchorId: string;
  constraints: WorldConstraints;
  occupied: ReadonlySet<string>;
}) {
  if (options.occupied.has(options.targetAnchorId)) {
    throw new DomainError("ANCHOR_CONFLICT", `${options.targetAnchorId} is already occupied.`);
  }
  if (!fits(options.variant, options.targetAnchorId, options.constraints)) {
    throw new DomainError("ANCHOR_CONFLICT", `${options.targetAnchorId} is not a valid placement.`);
  }
}
