"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { pagePadX, theme } from "@/lib/theme";
import { ImagePlaceholder } from "./ui";
import { usePageTransition } from "./page-transition";

type NavMaterial = { id: string; slug: string; name: string; tagline: string };

const NAV = [
  { href: "/materials", label: "Collections", dropdown: true },
  { href: "/projects", label: "Projects", dropdown: false },
  { href: "/journal", label: "Journal", dropdown: false },
  { href: "/manufacturing", label: "Manufacturing", dropdown: false },
  { href: "/about", label: "About", dropdown: false },
  { href: "/contact", label: "Contact", dropdown: false },
] as const;

export function SiteHeader({ materials }: { materials: NavMaterial[] }) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { start } = usePageTransition();

  // Close the dropdown on any click outside the header (the panel included,
  // since it's rendered inside the same <header>).
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <header
      ref={headerRef}
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
        borderBottom: `2px solid ${theme.color.ink}`,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Image
          src="/images/logo.png"
          alt="By Devyora"
          width={653}
          height={112}
          priority
          style={{ height: 40, width: "auto" }}
        />
        
      </Link>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: "clamp(16px, 2.4vw, 36px)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: theme.color.ink,
        }}
      >
        {NAV.map((item) =>
          item.dropdown ? (
            <div key={item.href}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen((v) => !v);
                }}
                style={{ fontWeight: 700, cursor: "pointer" }}
              >
                {item.label}
              </a>
            </div>
          ) : (
            <Link key={item.href} href={item.href} style={{ fontWeight: 700 }}>
              {item.label}
            </Link>
          )
        )}
      </nav>

      {/* Dropdown panel — full width, sits directly under the header, opens
          on clicking "Products" and closes on click-outside (see the effect
          above) or when a material link is clicked. Always mounted (rather
          than open && <div>) so the opacity/transform transition below can
          actually animate in and out instead of popping abruptly. */}
      <div
        aria-hidden={!open}
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#FFFFFF",
          borderBottom: `1px solid ${theme.color.border}`,
          boxShadow: "0 16px 32px rgba(18,17,16,0.08)",
          padding: `28px ${pagePadX} 32px`,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-10px)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 20,
          }}
        >
          {materials.map((m) => (
            <a
              key={m.id}
              href={`/materials/${m.slug}`}
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                start(`/materials/${m.slug}`, m.name);
              }}
              className="dropdown-item-link"
              style={{ display: "flex", flexDirection: "column", gap: 10, cursor: "pointer" }}
            >
              <ImagePlaceholder label={m.name} aspectRatio="4/3" />
              <span
                className="dropdown-item-name"
                style={{
                  display: "inline-block",
                  fontFamily: theme.font.serif,
                  fontSize: 18,
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: "normal",
                  width: "fit-content",
                }}
              >
                {m.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
