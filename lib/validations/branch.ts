import { z } from "zod";

export const createBranchSchema = z.object({
  city: z.string().min(1).max(100),
  address: z.string().min(1).max(300),
  phone: z.string().min(1).max(40),
  email: z.string().max(150).optional(),
  isHeadOffice: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const updateBranchSchema = createBranchSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
