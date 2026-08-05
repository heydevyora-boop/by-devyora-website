"use server";

import { revalidatePath } from "next/cache";
import { createEnquirySchema, updateEnquiryStatusSchema, assignEnquirySchema, addFollowUpNoteSchema } from "@/lib/validations/enquiry";
import { EnquiryRepository } from "@/lib/repositories/enquiry.repository";
import { requirePermission, PERMISSIONS, UnauthorizedError, ForbiddenError } from "@/lib/permissions";

export type ActionState<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** Turns thrown auth errors into a normal ActionState instead of an uncaught exception. */
function toActionState(err: unknown, fallback: string): ActionState<never> {
  if (err instanceof UnauthorizedError) return { ok: false, error: "Please sign in to continue." };
  if (err instanceof ForbiddenError) return { ok: false, error: err.message };
  console.error(fallback, err);
  return { ok: false, error: fallback };
}

/** Submits the public Contact form (Architect / Dealer / General tabs). */
export async function submitEnquiry(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState<{ id: string }>> {
  const raw = {
    type: formData.get("type"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company") || undefined,
    message: formData.get("message"),
    productsInterested: formData.getAll("productsInterested"),
  };

  const parsed = createEnquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const enquiry = await EnquiryRepository.create(parsed.data);
    revalidatePath("/contact");
    return { ok: true, data: { id: enquiry.id } };
  } catch (err) {
    console.error("submitEnquiry failed:", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

/** Admin: update an enquiry's CRM status (NEW → CONTACTED → QUALIFIED → PROPOSAL_SENT → WON/LOST). */
export async function updateEnquiryStatusAction(input: unknown): Promise<ActionState> {
  try {
    await requirePermission(PERMISSIONS.ENQUIRY_MANAGE);
  } catch (err) {
    return toActionState(err, "Could not update enquiry.");
  }

  const parsed = updateEnquiryStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    await EnquiryRepository.updateStatus(parsed.data);
    revalidatePath("/admin/enquiries");
    return { ok: true, data: null };
  } catch (err) {
    console.error("updateEnquiryStatusAction failed:", err);
    return { ok: false, error: "Could not update enquiry." };
  }
}

/** Admin: assign (or unassign, with assignedToId: null) an enquiry to a salesperson. */
export async function assignEnquiryAction(input: unknown): Promise<ActionState> {
  try {
    await requirePermission(PERMISSIONS.ENQUIRY_MANAGE);
  } catch (err) {
    return toActionState(err, "Could not assign enquiry.");
  }

  const parsed = assignEnquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    await EnquiryRepository.assign(parsed.data);
    revalidatePath("/admin/enquiries");
    revalidatePath(`/admin/enquiries/${parsed.data.id}`);
    return { ok: true, data: null };
  } catch (err) {
    console.error("assignEnquiryAction failed:", err);
    return { ok: false, error: "Could not assign enquiry." };
  }
}

/** Admin: log a follow-up note, optionally with a next-follow-up date. */
export async function addFollowUpNoteAction(input: unknown): Promise<ActionState<{ id: string }>> {
  let session;
  try {
    session = await requirePermission(PERMISSIONS.ENQUIRY_MANAGE);
  } catch (err) {
    return toActionState(err, "Could not add note.");
  }

  const parsed = addFollowUpNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const note = await EnquiryRepository.addNote(parsed.data, session.user.id);
    revalidatePath(`/admin/enquiries/${parsed.data.enquiryId}`);
    return { ok: true, data: { id: note.id } };
  } catch (err) {
    console.error("addFollowUpNoteAction failed:", err);
    return { ok: false, error: "Could not add note." };
  }
}

export async function deleteEnquiryAction(id: string): Promise<ActionState> {
  try {
    await requirePermission(PERMISSIONS.ENQUIRY_MANAGE);
  } catch (err) {
    return toActionState(err, "Could not delete enquiry.");
  }
  try {
    await EnquiryRepository.delete(id);
    revalidatePath("/admin/enquiries");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteEnquiryAction failed:", err);
    return { ok: false, error: "Could not delete enquiry." };
  }
}
