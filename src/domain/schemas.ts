import { z } from "zod";

export const moneySchema = z
  .object({
    amount: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
    currencyCode: z.string().length(3),
  })
  .strict();

export const productRoleSchema = z.enum([
  "lamp",
  "display",
  "input",
  "audio",
  "seating",
  "organization",
  "decor",
]);

export const productVariantSchema = z
  .object({
    merchandiseId: z.string().min(1),
    productId: z.string().min(1),
    handle: z.string().min(1),
    title: z.string().min(1).max(120),
    variantTitle: z.string().min(1).max(120),
    role: productRoleSchema,
    imageUrl: z.string().url().nullable(),
    price: moneySchema,
    available: z.boolean(),
    market: z.string().length(2),
    dimensions: z
      .object({
        widthCm: z.number().positive(),
        depthCm: z.number().positive(),
        heightCm: z.number().positive(),
      })
      .strict()
      .optional(),
    tags: z.array(z.string().max(40)).max(20).optional(),
  })
  .strict();

export const worldConstraintsSchema = z
  .object({
    budget: moneySchema,
    deskWidthCm: z.number().int().min(60).max(240),
    market: z.string().length(2),
    styleTags: z.array(z.string().max(40)).max(10),
    disallowedTags: z.array(z.string().max(40)).max(10),
    minItems: z.number().int().min(1).max(5),
    maxItems: z.number().int().min(1).max(5),
  })
  .strict()
  .refine((value) => value.minItems <= value.maxItems, {
    message: "minItems must be less than or equal to maxItems",
  });

export const planSelectionSchema = z
  .object({
    merchandiseId: z.string().min(1),
    role: productRoleSchema,
    preferredAnchorId: z.string().min(1).optional(),
    reason: z.string().trim().min(1).max(180),
  })
  .strict();

export const previewPlanInputSchema = z
  .object({
    expectedSceneVersion: z.number().int().nonnegative(),
    constraints: worldConstraintsSchema,
    selections: z.array(planSelectionSchema).min(1).max(5),
  })
  .strict();

export const stagePlanInputSchema = z
  .object({
    expectedSceneVersion: z.number().int().nonnegative(),
    proposalId: z.string().min(1),
    proposalDigest: z.string().length(64),
  })
  .strict();

export const moveProductInputSchema = z
  .object({
    expectedSceneVersion: z.number().int().nonnegative(),
    itemId: z.string().min(1),
    targetAnchorId: z.string().min(1),
  })
  .strict();
