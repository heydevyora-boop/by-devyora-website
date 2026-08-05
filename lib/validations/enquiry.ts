import { z } from "zod";

export const enquiryTypeSchema = z.enum(["ARCHITECT", "DEALER", "GENERAL"]);
export const enquiryStatusSchema = z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"]);

export const createEnquirySchema = z.object({
  type: enquiryTypeSchema,
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(6, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-()\s]+$/, "Enter a valid phone number"),
  company: z.string().max(160).optional(),
  message: z.string().min(1, "Message is required").max(4000),
  productsInterested: z.array(z.string().max(60)).max(10).default([]),
  source: z.string().max(60).default("website"),
});

export const updateEnquiryStatusSchema = z.object({
  id: z.string().cuid(),
  status: enquiryStatusSchema,
});

export const assignEnquirySchema = z.object({
  id: z.string().cuid(),
  assignedToId: z.string().cuid().nullable(), // null = unassign
});

export const addFollowUpNoteSchema = z.object({
  enquiryId: z.string().cuid(),
  note: z.string().min(1, "Note can't be empty").max(2000),
  followUpDate: z.coerce.date().optional(),
});

export const enquiryListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: enquiryStatusSchema.optional(),
  type: enquiryTypeSchema.optional(),
  assignedToId: z.string().optional(), // supports the literal "unassigned"
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type UpdateEnquiryStatusInput = z.infer<typeof updateEnquiryStatusSchema>;
export type AssignEnquiryInput = z.infer<typeof assignEnquirySchema>;
export type AddFollowUpNoteInput = z.infer<typeof addFollowUpNoteSchema>;
export type EnquiryListQuery = z.infer<typeof enquiryListQuerySchema>;
