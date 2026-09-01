import Image from "next/image";
import { pagePadX, theme } from "@/lib/theme";

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${theme.color.border}`,
        padding: `clamp(36px, 5vw, 64px) ${pagePadX}`,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 28,
        fontSize: 12,
        color: theme.color.muted,
      }}
    >
      <Image
        src="/images/logo.png"
        alt="By Devyora"
        width={653}
        height={112}
        style={{ height: 34, width: "auto" }}
      />
      <span>
        Architectural products
        <br />
        made to drawing.
      </span>
      <span>
        studio@bydevyora.com
        <br />
        +91 000 000 0000
      </span>
      <span style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase" }}>© 2026</span>
    </footer>
  );
}
