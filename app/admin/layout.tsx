import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { logoutAction } from "@/app/actions/auth.actions";

// `built: false` marks sections whose repositories/actions/permissions exist
// but whose admin pages haven't been written yet — hidden from the nav so we
// don't ship links that 404. Flip to true as each is built.
const NAV = [
  { href: "/admin", label: "Dashboard", built: true, show: () => true },
  { href: "/admin/materials", label: "Materials", built: true, show: (role: string) => hasPermission(role as never, PERMISSIONS.MATERIAL_UPDATE) },
  { href: "/admin/categories", label: "Categories", built: true, show: (role: string) => hasPermission(role as never, PERMISSIONS.CATEGORY_MANAGE) },
  { href: "/admin/products", label: "Products", built: true, show: (role: string) => hasPermission(role as never, PERMISSIONS.PRODUCT_UPDATE) },
  { href: "/admin/media", label: "Media library", built: true, show: (role: string) => hasPermission(role as never, PERMISSIONS.MEDIA_MANAGE) },
  { href: "/admin/projects", label: "Projects", built: false, show: (role: string) => hasPermission(role as never, PERMISSIONS.PROJECT_UPDATE) },
  { href: "/admin/blog", label: "Blog", built: true, show: (role: string) => hasPermission(role as never, PERMISSIONS.BLOG_UPDATE) },
  { href: "/admin/downloads", label: "Downloads", built: true, show: (role: string) => hasPermission(role as never, PERMISSIONS.DOWNLOAD_MANAGE) },
  { href: "/admin/enquiries", label: "Enquiries", built: true, show: (role: string) => hasPermission(role as never, PERMISSIONS.ENQUIRY_VIEW) },
  { href: "/admin/users", label: "Users", built: false, show: (role: string) => hasPermission(role as never, PERMISSIONS.USER_MANAGE) },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already blocks unauthenticated access to /admin/*, but every
  // Server Component that touches sensitive data should verify its own
  // session too — middleware can be bypassed by direct data-fetching bugs,
  // this cannot.
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Archivo, sans-serif" }}>
      <aside
        style={{
          width: 220,
          borderRight: "1px solid #E4E1DC",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <Image src="/images/logo.jpeg" alt="By Devyora" width={146} height={80} style={{ height: 32, width: "auto" }} />
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8C6A45", marginTop: 6 }}>
            Studio
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.filter((item) => item.built && item.show(role)).map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{ fontSize: 13, padding: "8px 0", color: "#121110", textDecoration: "none" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ marginTop: "auto", fontSize: 12, color: "#6B6862" }}>
          <div>{session.user.name}</div>
          <div style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: "0.14em" }}>{role}</div>
          <form action={logoutAction} style={{ marginTop: 12 }}>
            <button
              type="submit"
              style={{
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#6B6862",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
}
