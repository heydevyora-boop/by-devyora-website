import { theme } from "@/lib/theme";
import { SERVICE_STATES } from "@/lib/data/service-cities";

/**
 * "<Material or product>, by city" — every state and city By Devyora lists,
 * grouped by state in a compact grid: a small state label over its cities.
 * Several columns on a desk, two on a phone, so the full list stays short;
 * a long pair of names wraps within its column rather than running into the next.
 */
export function CityCoverage({ label }: { label: string }) {
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

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(165px, 100%), 1fr))",
          columnGap: "clamp(20px, 3vw, 40px)",
          rowGap: "clamp(16px, 2vw, 22px)",
        }}
      >
        {SERVICE_STATES.map(({ state, cities }) => (
          <li key={state} style={{ minWidth: 0 }}>
            <span
              style={{
                display: "block",
                fontSize: 9.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: theme.color.faint,
                marginBottom: 5,
              }}
            >
              {state}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 13,
                lineHeight: 1.5,
                color: theme.color.ink,
                overflowWrap: "anywhere",
              }}
            >
              {cities.map((city, index) => (
                <span key={city}>
                  {/* Spaces around the dot let a long pair wrap onto a second line. */}
                  {index > 0 && <span style={{ color: theme.color.accent }}>{" · "}</span>}
                  {city}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
