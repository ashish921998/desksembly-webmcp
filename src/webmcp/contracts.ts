import { z } from "zod";
import {
  moveProductInputSchema,
  planSelectionSchema,
  stagePlanInputSchema,
  worldConstraintsSchema,
} from "@/src/domain/schemas";

export const getSceneToolInputSchema = z.object({}).strict();

export const previewPlanToolInputSchema = z
  .object({
    expectedSceneVersion: z.number().int().nonnegative(),
    constraints: worldConstraintsSchema,
    selections: z.array(planSelectionSchema).min(3).max(5),
  })
  .strict();

export const stagePlanToolInputSchema = stagePlanInputSchema;
export const moveProductToolInputSchema = moveProductInputSchema;

export const getReviewToolInputSchema = z
  .object({ expectedSceneVersion: z.number().int().nonnegative() })
  .strict();

export const TOOL_INPUT_SCHEMAS = {
  getScene: z.toJSONSchema(getSceneToolInputSchema),
  previewPlan: z.toJSONSchema(previewPlanToolInputSchema),
  stagePlan: z.toJSONSchema(stagePlanToolInputSchema),
  moveProduct: z.toJSONSchema(moveProductToolInputSchema),
  getReview: z.toJSONSchema(getReviewToolInputSchema),
} as const;
