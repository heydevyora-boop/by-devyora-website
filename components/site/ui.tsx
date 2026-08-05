import Link from "next/link";
import { theme } from "@/lib/theme";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, marginBottom: "clamp(18px, 3vw, 32px)" }}>
      {children}
    </div>
  );
}

export function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        background: theme.color.ink,
        color: theme.color.onDark,
        padding: "15px 32px",
        fontSize: 11,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Link>
  );
}

export function SecondaryButton({ href, children, dark }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        border: `1px solid ${dark ? theme.color.onDark : theme.color.ink}`,
        color: dark ? theme.color.onDark : theme.color.ink,
        padding: "15px 32px",
        fontSize: 11,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Link>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: theme.color.accent,
        paddingBottom: 20,
        borderBottom: `1px solid ${theme.color.ink}`,
        marginBottom: "clamp(28px, 4vw, 44px)",
      }}
    >
      {children}
    </div>
  );
}

export function ImagePlaceholder({ label, aspectRatio = "4/3" }: { label: string; aspectRatio?: string }) {
  return (
    <div
      style={{
        aspectRatio,
        background: theme.color.mutedBg,
        border: `1px solid ${theme.color.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.faint }}>{label}</span>
    </div>
  );
}
