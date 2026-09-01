import Image from "next/image";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { pagePadX, theme } from "@/lib/theme";
import { TransitionLink } from "./transition-link";
import { ProductNavDropdown } from "./product-nav-dropdown";

const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/journal", label: "Journal" },
  { href: "/manufacturing", label: "Manufacturing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const materials = await MaterialRepository.findAll({ publishedOnly: true });

  const byName = new Map(
    materials.map((material) => [material.name.trim().toLowerCase(), material])
  );

  const productMenu = [
    {
      name: "GRC",
      slug: byName.get("grc")?.slug ?? "grc",
      image: "/images/nav-products/GRC.webp",
    },
    {
      name: "FRP",
      slug: byName.get("frp")?.slug ?? "frp",
      image: "/images/nav-products/FRP.webp",
    },
    {
      name: "Terracotta",
      slug: byName.get("terracotta")?.slug ?? "terracotta",
      image: "/images/nav-products/Terracotta.webp",
    },
  ];

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
        height: "81px",
        boxSizing: "border-box",
        ["--site-header-height" as string]: "81px",
      }}
    >
      <TransitionLink
        href="/"
        title="By Devyora"
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
        <Image
          src="/images/logo.png"
          alt="By Devyora"
          width={653}
          height={112}
          priority
          style={{ height: 40, width: "auto" }}
        />
        
      </TransitionLink>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "clamp(16px, 2.4vw, 36px)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: theme.color.muted,
        }}
      >
        <ProductNavDropdown products={productMenu} />

        {NAV.map((item) => (
          <TransitionLink key={item.href} href={item.href} title={item.label}>
            {item.label}
          </TransitionLink>
        ))}
      </nav>
    </header>
  );
}
