import type { Metadata } from "next";
import { theme, pagePadX } from "@/lib/theme";
import { Eyebrow, ImagePlaceholder } from "@/components/site/ui";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: "Since 2008 — the By Devyora story. Architectural materials manufactured in Bhopal, delivered across India.",
  path: "/about",
});

const LEADERS = [
  { name: "Rajesh Kumar", role: "Founder & Managing Director", bio: "Nearly two decades in architectural manufacturing. Established By Devyora's first GRC production line in 2008." },
  { name: "Anita Sharma", role: "Head of Design", bio: "Formerly with Studio Lotus. Leads the technical design team, translating architects' drawings into production-ready specifications." },
  { name: "Vikram Singh", role: "Director of Operations", bio: "Oversees the integrated facility and supply chain, ensuring on-time delivery to project sites across the country." },
];

const TIMELINE = [
  { year: "2008", event: "Founded in Bhopal with a single GRC production bay." },
  { year: "2012", event: "Added FRP and terracotta lines, expanding the manufacturing range beyond GRC." },
  { year: "2016", event: "Expanded to 50,000 sq ft. Introduced WPC and composite railing systems." },
  { year: "2019", event: "ISO 9001 and ISO 14001 certified. Crossed 300 projects delivered." },
  { year: "2022", event: "Launched the architectural jali and screen division." },
  { year: "2026", event: "500+ projects completed. Eleven material systems in production." },
];

const VALUES = [
  { title: "Precision", desc: "± 2mm tolerance is our standard. We measure every piece before it leaves the factory." },
  { title: "Craft", desc: "Machines cut the mould; hands finish the surface. Skilled craftsmen at every stage." },
  { title: "Collaboration", desc: "We work alongside architects from first sketch to site installation." },
  { title: "Integrity", desc: "Honest specifications, tested materials, certified results. No shortcuts." },
];

// Every city named here is drawn from SERVICE_STATES (lib/data/service-cities.ts)
// — the same canonical, India-only list the product and material pages use for
// their own "by city" sections — so this never drifts into invented or foreign
// cities of its own.
const REGIONS = [
  { region: "North India", cities: "Chandigarh, Gurugram, Jaipur, Lucknow, Dehradun, Shimla" },
  { region: "South India", cities: "Bengaluru, Chennai, Hyderabad, Kochi, Thiruvananthapuram, Visakhapatnam" },
  { region: "West India", cities: "Mumbai, Pune, Ahmedabad, Gandhinagar, Panaji" },
  { region: "East India", cities: "Kolkata, Bhubaneswar, Patna, Ranchi" },
  { region: "Central India", cities: "Bhopal, Indore, Raipur" },
  { region: "Northeast India", cities: "Guwahati, Shillong, Itanagar, Imphal, Agartala" },
];

export default function AboutPage() {
  return (
    <main>
      <section style={{ padding: `clamp(100px, 14vw, 180px) ${pagePadX} clamp(48px, 7vw, 96px)` }}>
        <Breadcrumbs items={[{ name: "About", path: "/about" }]} />
        <Eyebrow>About By Devyora</Eyebrow>
        <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(48px, 8vw, 120px)", lineHeight: 0.9, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
          Materials, made
          <br />
          by hand and drawing
        </h1>
        <p style={{ maxWidth: "56ch", fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: 1.65, color: "#4A4844" }}>
          Since 2008, By Devyora has manufactured architectural materials — GRC, FRP, terracotta and
          composite systems — for facades, thresholds and landscapes across India.
        </p>
      </section>

      <ImagePlaceholder label="Facility — Wide" aspectRatio="21/8" />

      {/* Values */}
      <section style={{ padding: `clamp(64px, 10vw, 140px) ${pagePadX}` }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 20, borderBottom: `1px solid ${theme.color.ink}`, marginBottom: "clamp(28px, 4vw, 44px)" }}>
          What we stand for
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "clamp(24px, 3vw, 40px)" }}>
          {VALUES.map((v) => (
            <div key={v.title}>
              <h3 style={{ fontFamily: theme.font.serif, fontSize: 26, margin: "0 0 12px" }}>{v.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: theme.color.muted, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: `clamp(64px, 10vw, 140px) ${pagePadX}`, background: theme.color.mutedBg }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, marginBottom: "clamp(28px, 4vw, 44px)" }}>
          Our history
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {TIMELINE.map((t) => (
            <div key={t.year} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 24, padding: "20px 0", borderBottom: "1px solid #D6D2CC" }}>
              <span style={{ fontFamily: theme.font.serif, fontSize: 24 }}>{t.year}</span>
              <span style={{ fontSize: 14, color: "#4A4844", lineHeight: 1.6 }}>{t.event}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership */}
      <section style={{ padding: `clamp(64px, 10vw, 140px) ${pagePadX}` }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 20, borderBottom: `1px solid ${theme.color.ink}`, marginBottom: "clamp(28px, 4vw, 44px)" }}>
          Leadership
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "clamp(28px, 4vw, 48px)" }}>
          {LEADERS.map((l) => (
            <div key={l.name}>
              <ImagePlaceholder label="Founder — Portrait" aspectRatio="4/5" />
              <h3 style={{ fontFamily: theme.font.serif, fontSize: 22, margin: "16px 0 4px" }}>{l.name}</h3>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.color.accent, marginBottom: 12 }}>{l.role}</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: theme.color.muted, margin: 0 }}>{l.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Service regions */}
      <section style={{ padding: `clamp(64px, 10vw, 140px) ${pagePadX}`, background: theme.color.ink, color: "#FFFFFF" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, marginBottom: "clamp(28px, 4vw, 44px)" }}>
          Where we work
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "clamp(24px, 3vw, 40px)" }}>
          {REGIONS.map((r) => (
            <div key={r.region}>
              <h3 style={{ fontFamily: theme.font.serif, fontSize: 22, margin: "0 0 10px" }}>{r.region}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: theme.color.onDarkMuted, margin: 0 }}>{r.cities}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
