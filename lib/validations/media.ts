import { z } from "zod";

export const assetResourceTypeSchema = z.enum(["IMAGE", "VIDEO", "RAW"]);

/** What the client sends back after a successful direct-to-Cloudinary upload, to persist an Asset row. */
export const confirmUploadSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  folder: z.string().min(1).default("bydevyora"),
  resourceType: assetResourceTypeSchema.default("IMAGE"),
  format: z.string().max(20).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive(),
  name: z.string().min(1).max(200),
  alt: z.string().max(200).optional(),
});

export const updateAssetAltSchema = z.object({
  id: z.string().cuid(),
  alt: z.string().min(1, "Alt text is required for accessibility & SEO").max(200),
});

export const mediaListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  resourceType: assetResourceTypeSchema.optional(),
  missingAltOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(24),
});

export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
export type UpdateAssetAltInput = z.infer<typeof updateAssetAltSchema>;
export type MediaListQuery = z.infer<typeof mediaListQuerySchema>;
