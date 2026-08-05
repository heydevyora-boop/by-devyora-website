import { z } from "zod";

export const productStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const productSpecificationSchema = z.object({
  key: z.string().min(1).max(60),
  value: z.string().min(1).max(200),
  order: z.number().int().min(0).default(0),
});

export const productVariantSchema = z.object({
  id: z.string().cuid().optional(), // present when editing an existing variant
  sku: z.string().min(1).max(60),
  name: z.string().min(1).max(160),
  size: z.string().max(60).optional(),
  finish: z.string().max(60).optional(),
  color: z.string().max(60).optional(),
  price: z.coerce.number().positive().max(10_000_000).optional(),
  currency: z.string().length(3).default("INR"),
  inStock: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const productImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(160).optional(),
  variantId: z.string().cuid().optional(),
  isPrimary: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  sku: z.string().min(1).max(60),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, kebab-case"),
  name: z.string().min(1).max(200),
  materialId: z.string().cuid("Select a material"),
  categoryId: z.string().cuid().nullable().optional(),
  shortDescription: z.string().max(300).optional(),
  description: z.string().max(6000).optional(),
  status: productStatusSchema.default("DRAFT"),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  specifications: z.array(productSpecificationSchema).max(30).optional(),
  variants: z.array(productVariantSchema).max(30).optional(),
  images: z.array(productImageSchema).max(30).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().cuid(),
});

/** Just the filter/search/pagination params the admin products list page reads from the URL. */
export const productListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: productStatusSchema.optional(),
  materialId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
