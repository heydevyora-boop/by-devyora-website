import Link from "next/link";
import { theme } from "@/lib/theme";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo";
import { JsonLd } from "./json-ld";

/**
 * Pass the trail once, get both the visible breadcrumb nav and its matching
 * BreadcrumbList JSON-LD — keeping them as two separate hand-written things
 * is how they drift out of sync (visible trail says one thing, schema says
 * another, and Google penalizes the mismatch).
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ name: "Home", path: "/" }, ...items];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <nav aria-label="Breadcrumb" style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11, color: theme.color.muted, marginBottom: 24 }}>
        {trail.map((item, i) => (
          <span key={item.path} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span>/</span>}
            {i === trail.length - 1 ? (
              <span style={{ color: theme.color.ink }}>{item.name}</span>
            ) : (
              <Link href={item.path}>{item.name}</Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
