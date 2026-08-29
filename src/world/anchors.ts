import type { ProductDimensions, ProductRole } from "@/src/domain/types";

export type DeskAnchor = {
  id: string;
  label: string;
  roles: ProductRole[];
  minDeskWidthCm: number;
  maxFootprint: Pick<ProductDimensions, "widthCm" | "depthCm">;
  position: [number, number, number];
};

export const DESK_ANCHORS: readonly DeskAnchor[] = [
  {
    id: "lamp-left",
    label: "Left lamp corner",
    roles: ["lamp"],
    minDeskWidthCm: 90,
    maxFootprint: { widthCm: 24, depthCm: 24 },
    position: [-1.9, 0, -0.35],
  },
  {
    id: "display-center",
    label: "Compact center display",
    roles: ["display"],
    minDeskWidthCm: 90,
    maxFootprint: { widthCm: 54, depthCm: 24 },
    position: [0, 0, -0.55],
  },
  {
    id: "display-wide",
    label: "Wide center display",
    roles: ["display"],
    minDeskWidthCm: 120,
    maxFootprint: { widthCm: 72, depthCm: 30 },
    position: [0.35, 0, -0.55],
  },
  {
    id: "input-front",
    label: "Front input zone",
    roles: ["input"],
    minDeskWidthCm: 90,
    maxFootprint: { widthCm: 48, depthCm: 22 },
    position: [0, 0, 0.45],
  },
  {
    id: "audio-right",
    label: "Right audio zone",
    roles: ["audio"],
    minDeskWidthCm: 90,
    maxFootprint: { widthCm: 24, depthCm: 22 },
    position: [1.85, 0, -0.05],
  },
  {
    id: "organization-left",
    label: "Left organization zone",
    roles: ["organization", "decor"],
    minDeskWidthCm: 90,
    maxFootprint: { widthCm: 28, depthCm: 24 },
    position: [-1.35, 0, 0.4],
  },
  {
    id: "decor-back",
    label: "Wide-desk decor zone",
    roles: ["decor"],
    minDeskWidthCm: 120,
    maxFootprint: { widthCm: 26, depthCm: 20 },
    position: [1.2, 0, -0.7],
  },
] as const;

export const ANCHOR_BY_ID = new Map(DESK_ANCHORS.map((anchor) => [anchor.id, anchor]));
