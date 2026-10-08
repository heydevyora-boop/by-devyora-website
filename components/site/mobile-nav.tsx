"use client";

import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { TransitionLink } from "./transition-link";
import { usePageTransition } from "./page-transition";
import { ProductRail, type RailProduct } from "./product-rail";

type NavItem = {
  href: string;
  label: string;
};

export function MobileNav({
  nav,
  products,
}: {
  nav: NavItem[];
  products: RailProduct[];
}) {
  const [open, setOpen] = useState(false);
  const { start } = usePageTransition();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="mobile-menu-toggle"
        style={{
          appearance: "none",
          border: 0,
          background: "transparent",
          padding: 8,
          margin: "-8px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 5,
          cursor: "pointer",
        }}
      >
        <span
          style={{
            display: "block",
            width: 22,
            height: 1,
            background: theme.color.ink,
            transition: "transform 200ms ease, opacity 200ms ease",
            transform: open ? "translateY(6px) rotate(45deg)" : "none",
          }}
        />
        <span
          style={{
            display: "block",
            width: 22,
            height: 1,
            background: theme.color.ink,
            transition: "opacity 200ms ease",
            opacity: open ? 0 : 1,
          }}
        />
        <span
          style={{
            display: "block",
            width: 22,
            height: 1,
            background: theme.color.ink,
            transition: "transform 200ms ease, opacity 200ms ease",
            transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
          }}
        />
      </button>

      <div
        aria-hidden={!open}
        className="mobile-menu-panel"
        style={{
          position: "fixed",
          top: "var(--site-header-height, 81px)",
          left: 0,
          right: 0,
          height: "calc(100vh - var(--site-header-height, 81px))",
          zIndex: 30,
          background: theme.color.bg,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transform: open ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 200ms ease, transform 240ms cubic-bezier(0.22, 1, 0.36, 1), visibility 240ms",
        }}
      >
        <div style={{ paddingTop: 20 }}>
          <div
            style={{
              padding: "0 clamp(20px, 5vw, 40px)",
              marginBottom: 16,
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: theme.color.muted,
            }}
          >
            Products
          </div>

          {/* Same auto-scrolling, swipe/drag-able image rail as the desktop
              Products dropdown (components/site/product-nav-dropdown.tsx) —
              shared via ProductRail so both stay visually and behaviourally
              identical. Native touch scrolling on the rail handles swipe;
              auto-scroll only runs while this menu is open. */}
          <ProductRail
            products={products}
            active={open}
            onSelect={(product) => {
              setOpen(false);
              start(`/materials/${product.slug}`, product.name);
            }}
          />
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "28px clamp(20px, 5vw, 40px) 40px",
          }}
        >
          <TransitionLink
            href="/materials"
            title="Products"
            onClick={() => setOpen(false)}
            style={{
              padding: "0 0 22px",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: theme.color.muted,
            }}
          >
            View all products →
          </TransitionLink>

          {nav.map((item) => (
            <TransitionLink
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={() => setOpen(false)}
              style={{
                padding: "18px 0",
                borderTop: `1px solid ${theme.color.border}`,
                fontSize: 22,
                fontFamily: theme.font.serif,
                color: theme.color.ink,
              }}
            >
              {item.label}
            </TransitionLink>
          ))}
        </nav>
      </div>
    </>
  );
}
