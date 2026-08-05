import type { Metadata } from "next";
import { ManufacturingRepository } from "@/lib/repositories/branch.repository";
import { theme, pagePadX } from "@/lib/theme";
import { Eyebrow, ImagePlaceholder, PrimaryButton } from "@/components/site/ui";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Manufacturing — Our Facility",
  description: "A 50,000 sq ft integrated facility, from mould-making to dispatch. ISO 9001 and ISO 14001 certified.",
  path: "/manufacturing",
});

export default async function ManufacturingPage() {
  const [steps, stats, certifications] = await Promise.all([
    ManufacturingRepository.findSteps(),
    ManufacturingRepository.findStats(),
    ManufacturingRepository.findCertifications(),
  ]);
  const standards = stats.filter((s) => s.type === "QUALITY_STANDARD");
  const infra = stats.filter((s) => s.type === "INFRASTRUCTURE");

  return (
    <main>
      <section style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: `clamp(100px, 14vw, 180px) ${pagePadX} clamp(48px, 7vw, 96px)`, background: theme.color.mutedBg }}>
        <Breadcrumbs items={[{ name: "Manufacturing", path: "/manufacturing" }]} />
        <Eyebrow>Our Facility</Eyebrow>
        <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(52px, 9vw, 140px)", lineHeight: 0.88, letterSpacing: "-0.025em", margin: 0 }}>
          Manufacturing
        </h1>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <div style={{ padding: `clamp(48px, 7vw, 96px) clamp(28px, 4vw, 56px)`, display: "flex", flexDirection: "column", justifyContent: "center", gap: "clamp(20px, 3vw, 28px)" }}>
          <Eyebrow>Factory Overview</Eyebrow>
          <h2 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-0.015em", margin: 0 }}>
            50,000 sq ft
            <br />
            of precision
          </h2>
          <p style={{ maxWidth: "44ch", margin: 0, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: 1.65, color: "#4A4844" }}>
            Our integrated facility houses mould-making, casting, curing, finishing and quality inspection under
            one roof — giving us full control from drawing to dispatch.
          </p>
        </div>
        <ImagePlaceholder label="Factory — Aerial" aspectRatio="4/3" />
      </section>

      <section style={{ padding: `clamp(64px, 10vw, 160px) ${pagePadX}` }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 20, borderBottom: `1px solid ${theme.color.ink}`, marginBottom: "clamp(36px, 5vw, 64px)" }}>
          Manufacturing Process
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", borderTop: `1px solid ${theme.color.border}`, borderLeft: `1px solid ${theme.color.border}` }}>
          {steps.map((s) => (
            <div key={s.id} style={{ background: "#FFFFFF", padding: "clamp(28px, 3.5vw, 48px) clamp(20px, 2.5vw, 32px)", display: "flex", flexDirection: "column", gap: 16, borderRight: `1px solid ${theme.color.border}`, borderBottom: `1px solid ${theme.color.border}` }}>
              <span style={{ fontSize: 11, letterSpacing: "0.2em", color: theme.color.accent, fontVariantNumeric: "tabular-nums" }}>{s.num}</span>
              <span style={{ fontFamily: theme.font.serif, fontSize: "clamp(22px, 2vw, 30px)", lineHeight: 1.1 }}>{s.title}</span>
              <span style={{ fontSize: 13, lineHeight: 1.6, color: theme.color.muted }}>{s.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: `clamp(64px, 10vw, 160px) ${pagePadX}`, background: theme.color.ink, color: "#FFFFFF" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(28px, 5vw, 80px)" }}>
          <div>
            <Eyebrow>Quality Standards</Eyebrow>
            <h2 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-0.015em", margin: 0 }}>
              Every piece tested,
              <br />
              every batch certified
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignSelf: "end" }}>
            {standards.map((st) => (
              <div key={st.id} style={{ display: "flex", justifyContent: "space-between", gap: 20, padding: "18px 0", borderBottom: "1px solid rgba(255,255,255,0.12)", fontSize: 14 }}>
                <span style={{ color: theme.color.onDarkMuted }}>{st.label}</span>
                <span>{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: `clamp(64px, 10vw, 160px) ${pagePadX}` }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 20, borderBottom: `1px solid ${theme.color.ink}`, marginBottom: "clamp(36px, 5vw, 64px)" }}>
          Infrastructure
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "clamp(20px, 3vw, 36px)" }}>
          {infra.map((inf) => (
            <div key={inf.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontFamily: theme.font.serif, fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-0.02em" }}>{inf.value}</span>
              <span style={{ fontSize: 13, color: theme.color.muted, lineHeight: 1.5 }}>{inf.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: `clamp(48px, 7vw, 96px) ${pagePadX}`, background: theme.color.mutedBg }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 20, borderBottom: "1px solid #D6D2CC", marginBottom: "clamp(28px, 4vw, 44px)" }}>
          Certifications
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 1, background: "#D6D2CC" }}>
          {certifications.map((cert) => (
            <div key={cert.id} style={{ background: "#FFFFFF", padding: "clamp(24px, 3vw, 40px)", flex: "1 1 200px", minWidth: 180, display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontFamily: theme.font.serif, fontSize: "clamp(18px, 1.6vw, 24px)", lineHeight: 1.15 }}>{cert.name}</span>
              <span style={{ fontSize: 12, color: theme.color.muted }}>{cert.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: `clamp(64px, 10vw, 140px) ${pagePadX}`, background: theme.color.ink, color: "#FFFFFF", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <h2 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1, margin: 0 }}>
            Schedule a factory visit
          </h2>
          <p style={{ margin: 0, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: 1.6, color: theme.color.onDarkMuted }}>
            See our processes firsthand. We welcome architects, specifiers and developers.
          </p>
          <PrimaryButton href="/contact">Book a visit</PrimaryButton>
        </div>
      </section>
    </main>
  );
}
