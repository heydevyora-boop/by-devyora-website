import Image from "next/image";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { pagePadX, theme } from "@/lib/theme";
import { TransitionLink } from "./transition-link";
import { ProductNavDropdown } from "./product-nav-dropdown";
import { MobileNav } from "./mobile-nav";
import { PRODUCT_TYPES } from "@/lib/product-types";

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
    {
      name: "WPC",
      slug: byName.get("wpc")?.slug ?? "wpc",
      image: "/images/nav-products/WPC.webp",
    },
    {
      name: "UHPC",
      slug: byName.get("uhpc")?.slug ?? "uhpc",
      image: "/images/nav-products/UHPC.webp",
    },
    {
      name: "Marble",
      slug: byName.get("marble")?.slug ?? "marble",
      image: "/images/nav-products/Marble.webp",
    },
    {
      name: "GRG POP",
      slug: byName.get("grg pop")?.slug ?? "grg-pop",
      image: "/images/nav-products/GRG-POP.webp",
    },
    {
      name: "Planters",
      slug: byName.get("planters")?.slug ?? "planters",
      image: "/images/nav-products/Planters.webp",
    },
    {
      name: "Wall Art",
      slug: byName.get("wall art")?.slug ?? "wall-art",
      image: "/images/nav-products/Wall-Art.webp",
    },
    {
      name: "Brass",
      slug: byName.get("brass")?.slug ?? "brass",
      image: "/images/nav-products/Brass.webp",
    },
    {
      name: "Handmade Ceramics",
      slug: byName.get("handmade ceramics")?.slug ?? "handmade-ceramics",
      image: "/images/nav-products/Handmade-Ceramics.webp",
    },
  ].map((item) => ({ ...item, types: PRODUCT_TYPES[item.slug] }));

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
        className="desktop-nav"
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

      <MobileNav nav={NAV} products={productMenu} />
    </header>
  );
}
