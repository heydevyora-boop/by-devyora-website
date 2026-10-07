import { theme } from "@/lib/theme";
import { TransitionLink } from "./transition-link";
import { SERVICE_CITIES } from "@/lib/data/service-cities";

/**
 * "<Material or product>, by city" — every city By Devyora lists, as one
 * flat, flowing, linked list (no state grouping — a flat list reads faster
 * and keeps every city equally prominent instead of splitting attention
 * across 28 state labels).
 *
 * Each city links to `${basePath}/<city-slug>` — e.g. a material page
 * passes `/materials/grc/facades` so "Bhopal" becomes
 * `/materials/grc/facades/bhopal`, and a product/type page passes
 * `/products/<slug>` so "Bhopal" becomes `/products/grc-jali-sample/bhopal`.
 * Those landing pages aren't built yet, so these are forward-looking links
 * on purpose — ready for when per-city pages like "GRC Jali in Bhopal" exist.
 */
export function CityCoverage({ label, basePath }: { label: string; basePath: string }) {
  return (
    <section style={{ padding: "clamp(40px, 6vw, 72px) 0 0" }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: theme.color.accent,
          paddingBottom: 18,
          borderBottom: `1px solid ${theme.color.ink}`,
          marginBottom: 26,
        }}
      >
        {label}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", rowGap: 10 }}>
        {SERVICE_CITIES.map((city, index) => (
          <span key={city.slug} style={{ display: "inline-flex", alignItems: "baseline" }}>
            <TransitionLink
              href={`${basePath}/${city.slug}`}
              title={city.name}
              style={{ fontSize: 13, color: theme.color.accent }}
            >
              {city.name}
            </TransitionLink>
            {index < SERVICE_CITIES.length - 1 && (
              <span
                aria-hidden="true"
                style={{ color: theme.color.border, margin: "0 12px", fontSize: 12 }}
              >
                ·
              </span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
