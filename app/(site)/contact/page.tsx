import type { Metadata } from "next";
import { BranchRepository } from "@/lib/repositories/branch.repository";
import { theme, pagePadX } from "@/lib/theme";
import { Eyebrow, ImagePlaceholder } from "@/components/site/ui";
import { ContactForm } from "@/components/site/contact-form";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with By Devyora — architects, dealers and general enquiries. Head office in Bhopal, showroom in Mumbai.",
  path: "/contact",
});

export default async function ContactPage() {
  const branches = await BranchRepository.findAll();

  return (
    <main>
      <section style={{ padding: `clamp(100px, 14vw, 180px) ${pagePadX} clamp(48px, 7vw, 96px)` }}>
        <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />
        <Eyebrow>Get in Touch</Eyebrow>
        <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(52px, 9vw, 140px)", lineHeight: 0.9, letterSpacing: "-0.02em", margin: 0 }}>
          Contact
        </h1>
      </section>

      <ImagePlaceholder label="Google Map — Bhopal" aspectRatio="21/7" />

      <div style={{ padding: `clamp(48px, 7vw, 96px) ${pagePadX} clamp(64px, 10vw, 160px)` }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "clamp(28px, 4vw, 56px)", paddingBottom: "clamp(48px, 7vw, 96px)", borderBottom: `1px solid ${theme.color.border}` }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, marginBottom: 8 }}>Head Office</div>
            <span style={{ fontSize: 15, lineHeight: 1.6, color: "#4A4844" }}>Bhopal, Madhya Pradesh<br />India</span>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, marginBottom: 8 }}>Reach Us</div>
            <span style={{ fontSize: 15, lineHeight: 1.6, color: "#4A4844" }}>studio@bydevyora.com<br />+91 000 000 0000</span>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, marginBottom: 8 }}>Hours</div>
            <span style={{ fontSize: 15, lineHeight: 1.6, color: "#4A4844" }}>Mon – Sat: 9:00 – 18:00<br />Sunday: Closed<br />Factory visits by appointment</span>
          </div>
        </section>

        <section style={{ paddingTop: "clamp(48px, 7vw, 96px)" }}>
          <ContactForm />
        </section>

        <section style={{ paddingTop: "clamp(64px, 10vw, 160px)" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 20, borderBottom: `1px solid ${theme.color.ink}`, marginBottom: "clamp(28px, 4vw, 44px)" }}>
            Offices & Showrooms
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", borderTop: `1px solid ${theme.color.border}`, borderLeft: `1px solid ${theme.color.border}` }}>
            {branches.map((br) => (
              <div key={br.id} style={{ background: "#FFFFFF", padding: "clamp(24px, 3vw, 40px)", display: "flex", flexDirection: "column", gap: 12, borderRight: `1px solid ${theme.color.border}`, borderBottom: `1px solid ${theme.color.border}` }}>
                <span style={{ fontFamily: theme.font.serif, fontSize: "clamp(20px, 1.8vw, 26px)", lineHeight: 1.15 }}>{br.city}</span>
                <span style={{ fontSize: 13, color: theme.color.muted, lineHeight: 1.6 }}>{br.address}</span>
                <span style={{ fontSize: 13, color: "#4A4844" }}>{br.phone}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
