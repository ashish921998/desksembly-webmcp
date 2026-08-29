export const PROJECT_TOOL_PREFIX = "deskbuilder." as const;

export const TOOL_NAMES = {
  getScene: "deskbuilder.get_scene",
  previewPlan: "deskbuilder.preview_plan",
  stagePlan: "deskbuilder.stage_plan",
  moveProduct: "deskbuilder.move_product",
  getReview: "deskbuilder.get_review",
} as const;

export const DESKBUILDER_TOOL_NAMES = Object.values(TOOL_NAMES);
