import { z } from "zod";

export const materialSpecSchema = z.object({
  key: z.string().min(1).max(60),
  value: z.string().min(1).max(200),
  order: z.number().int().min(0).default(0),
});

export const materialApplicationSchema = z.object({
  label: z.string().min(1).max(60),
  order: z.number().int().min(0).default(0),
});

export const materialImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(160).optional(),
  order: z.number().int().min(0).default(0),
});

export const createMaterialSchema = z.object({
  num: z.number().int().min(1),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, kebab-case"),
  name: z.string().min(1).max(80),
  tagline: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  material: z.string().max(200).optional(),
  finishes: z.string().max(200).optional(),
  formats: z.string().max(120).default("Standard & made to drawing"),
  leadTime: z.string().max(60).default("6–10 weeks"),
  heroImage: z.string().url().optional(),
  published: z.boolean().default(true),
  specs: z.array(materialSpecSchema).max(20).optional(),
  applications: z.array(materialApplicationSchema).max(20).optional(),
  images: z.array(materialImageSchema).max(30).optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
