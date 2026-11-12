"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import type { ActionState } from "./enquiry.actions";

/**
 * Server action bound to the login form. Uses Auth.js's signIn() with
 * redirect: false so we can return field-level errors instead of throwing
 * across the network boundary.
 */
export async function loginAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState<{ redirectTo: string }>> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true, data: { redirectTo: "/admin" } };
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
          return { ok: false, error: "Incorrect email or password." };
        default:
          return { ok: false, error: "Sign-in failed. Please try again." };
      }
    }
    // NEXT_REDIRECT is thrown internally by signIn() in some configurations —
    // rethrow anything that isn't a recognized AuthError so Next.js can handle it.
    throw err;
  }
}

export async function logoutAction() {
  const { signOut } = await import("@/lib/auth");
  await signOut({ redirectTo: "/login" });
}
