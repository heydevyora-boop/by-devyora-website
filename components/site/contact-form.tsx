"use client";

import { useActionState } from "react";
import { useState } from "react";
import { theme } from "@/lib/theme";
import { submitEnquiry } from "@/app/actions/enquiry.actions";

const FORM_CONFIG = {
  ARCHITECT: {
    label: "Architect",
    title: "Architect Enquiry",
    subtitle: "Specifying for a project? Share the details and we'll arrange a consultation with our design team.",
    companyPlaceholder: "Firm / practice name",
    showProducts: true,
  },
  DEALER: {
    label: "Dealer",
    title: "Dealer Enquiry",
    subtitle: "Interested in distributing By Devyora products? Tell us about your market and territory.",
    companyPlaceholder: "Company name",
    showProducts: false,
  },
  GENERAL: {
    label: "General",
    title: "General Contact",
    subtitle: "Have a question or just want to say hello? We'd love to hear from you.",
    companyPlaceholder: "",
    showProducts: true,
  },
} as const;

const inputStyle: React.CSSProperties = {
  padding: "14px 18px",
  border: `1px solid ${theme.color.border}`,
  background: theme.color.mutedBg,
  fontFamily: theme.font.sans,
  fontSize: 14,
  fontWeight: 300,
  outline: "none",
  width: "100%",
};

export function ContactForm() {
  const [tab, setTab] = useState<keyof typeof FORM_CONFIG>("ARCHITECT");
  const cfg = FORM_CONFIG[tab];
  const [state, formAction, isPending] = useActionState(submitEnquiry, null);

  if (state?.ok) {
    return (
      <div style={{ border: `1px solid ${theme.color.border}`, padding: "clamp(32px, 5vw, 56px)", textAlign: "center" }}>
        <h2 style={{ fontFamily: theme.font.serif, fontSize: 28, margin: "0 0 12px" }}>Thank you</h2>
        <p style={{ color: theme.color.muted, fontSize: 14 }}>
          Your enquiry has been received — our team will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", borderBottom: `1px solid ${theme.color.border}`, marginBottom: "clamp(36px, 5vw, 56px)" }}>
        {(Object.keys(FORM_CONFIG) as Array<keyof typeof FORM_CONFIG>).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{
              padding: "16px 28px",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              border: 0,
              borderBottom: `2px solid ${tab === key ? theme.color.ink : "transparent"}`,
              background: "transparent",
              color: tab === key ? theme.color.ink : theme.color.muted,
              cursor: "pointer",
              fontFamily: theme.font.sans,
            }}
          >
            {FORM_CONFIG[key].label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(28px, 5vw, 80px)" }}>
        <div>
          <h2 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: 1.05, margin: "0 0 16px" }}>
            {cfg.title}
          </h2>
          <p style={{ maxWidth: "44ch", margin: 0, fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: 1.6, color: theme.color.muted }}>
            {cfg.subtitle}
          </p>
        </div>

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <input type="hidden" name="type" value={tab} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <input name="firstName" type="text" placeholder="First name" style={inputStyle} required />
            <input name="lastName" type="text" placeholder="Last name" style={inputStyle} required />
          </div>
          <input name="email" type="email" placeholder="Email address" style={inputStyle} required />
          <input name="phone" type="tel" placeholder="Phone number" style={inputStyle} required />
          {cfg.companyPlaceholder && <input name="company" type="text" placeholder={cfg.companyPlaceholder} style={inputStyle} />}
          {cfg.showProducts && (
            <select name="productsInterested" style={{ ...inputStyle, color: theme.color.muted }} multiple={false} defaultValue="">
              <option value="" disabled>Products of interest</option>
              {["GRC", "FRP", "Terracotta", "WPC", "Cladding", "Jali", "Screens", "Other"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}
          <textarea name="message" placeholder="Your message" rows={5} style={{ ...inputStyle, resize: "vertical" }} required />

          {state && !state.ok && <p style={{ color: "#B3261E", fontSize: 12 }}>{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            style={{
              alignSelf: "flex-start",
              background: theme.color.ink,
              color: "#FFFFFF",
              border: 0,
              padding: "15px 36px",
              fontFamily: theme.font.sans,
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "Sending…" : "Submit enquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
