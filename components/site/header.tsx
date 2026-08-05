import Link from "next/link";
import Image from "next/image";
import { pagePadX, theme } from "@/lib/theme";

const NAV = [
  { href: "/materials", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/journal", label: "Journal" },
  { href: "/manufacturing", label: "Manufacturing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: `20px ${pagePadX}`,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "saturate(140%) blur(6px)",
        borderBottom: `1px solid ${theme.color.border}`,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Image
          src="/images/logo.png"
          alt="By Devyora"
          width={120}
          height={80}
          priority
          style={{ height: 30, width: "auto" }}
          
        />
       
      </Link>
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: "clamp(16px, 2.4vw, 36px)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: theme.color.muted,
        }}
      >
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
