import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

/**
 * Every permission the app knows about, grouped by domain.
 * Keep this as the single source of truth — actions/repositories/UI all read from it.
 */
export const PERMISSIONS = {
  MATERIAL_CREATE: "material:create",
  MATERIAL_UPDATE: "material:update",
  MATERIAL_DELETE: "material:delete",

  CATEGORY_MANAGE: "category:manage",

  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",
  PRODUCT_PUBLISH: "product:publish",

  VARIANT_MANAGE: "variant:manage",

  PROJECT_CREATE: "project:create",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",

  BLOG_CREATE: "blog:create",
  BLOG_UPDATE: "blog:update",
  BLOG_PUBLISH: "blog:publish",
  BLOG_DELETE: "blog:delete",

  DOWNLOAD_MANAGE: "download:manage",

  MEDIA_MANAGE: "media:manage",

  ENQUIRY_VIEW: "enquiry:view",
  ENQUIRY_MANAGE: "enquiry:manage",

  USER_MANAGE: "user:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Role → permission set. ADMIN implicitly has everything EDITOR has, plus more. */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  EDITOR: [
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.VARIANT_MANAGE,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_UPDATE,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.ENQUIRY_VIEW,
  ],
  ADMIN: Object.values(PERMISSIONS),
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Server-side guard for use inside Server Actions / Route Handlers.
 * Throws UnauthorizedError if not signed in, ForbiddenError if signed in
 * but missing the required permission. Returns the session on success.
 */
export async function requirePermission(permission: Permission) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if (!hasPermission(session.user.role, permission)) throw new ForbiddenError();
  return session;
}

/** Lighter-weight guard: just requires an authenticated session, any role. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session;
}

/** Requires the ADMIN role specifically. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if (session.user.role !== "ADMIN") throw new ForbiddenError();
  return session;
}
