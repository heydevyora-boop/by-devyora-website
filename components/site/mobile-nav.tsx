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

type ProductType = { name: string; slug: string };

type ProductItem = RailProduct & {
  // Sub-types shown in the expandable panel under each card — same shape
  // and source (lib/product-types.ts via header.tsx) as the desktop
  // Products dropdown's types panel.
  types?: ProductType[];
};

export function MobileNav({
  nav,
  products,
}: {
  nav: NavItem[];
  products: ProductItem[];
}) {
  const [open, setOpen] = useState(false);
  const [openTypesFor, setOpenTypesFor] = useState<string | null>(null);
  const { start } = usePageTransition();

  // Don't carry a selection over to the next time the menu opens.
  useEffect(() => {
    if (!open) setOpenTypesFor(null);
  }, [open]);

  const selectedProduct = products.find((p) => p.slug === openTypesFor) ?? null;

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
            renderCardExtra={(product, isClone, wasDrag) => {
              const typesOpen = !isClone && openTypesFor === product.slug;
              return (
                // Reveals that material's types in the shared panel below the
                // rail — a separate control from the card above so it never
                // triggers navigation. Same enlarged hit area as the desktop
                // dropdown's chevron, since the same imprecise-tap problem
                // applies here too.
                <button
                  type="button"
                  aria-label={`${product.name} types`}
                  aria-expanded={typesOpen}
                  tabIndex={isClone ? -1 : undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (wasDrag()) return;
                    setOpenTypesFor((current) => (current === product.slug ? null : product.slug));
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "60%",
                    height: "60%",
                    appearance: "none",
                    border: 0,
                    background: "transparent",
                    cursor: isClone ? "default" : "pointer",
                    pointerEvents: isClone ? "none" : "auto",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 26,
                      height: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "rgba(18,17,16,0.55)",
                    }}
                  >
                    <svg
                      width="11"
                      height="7"
                      viewBox="0 0 11 7"
                      fill="none"
                      style={{
                        transform: typesOpen ? "rotate(180deg)" : "none",
                        transition: "transform 200ms ease",
                      }}
                    >
                      <path d="M1 1L5.5 5.5L10 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              );
            }}
          />

          {/* TYPES PANEL — shared across all cards, same shape as the desktop
              dropdown's. Sits outside .product-rail so it's never clipped by
              the rail's overflow mask. */}
          <div
            style={{
              padding: "0 clamp(20px, 5vw, 40px)",
              maxHeight: selectedProduct ? 320 : 0,
              overflow: "hidden",
              transition: "max-height 280ms ease",
            }}
          >
            {selectedProduct && (
              <div style={{ borderTop: `1px solid ${theme.color.border}`, padding: "18px 0 4px" }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#8C6A45",
                    marginBottom: 14,
                  }}
                >
                  {selectedProduct.name} — Types
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingBottom: 14 }}>
                  {selectedProduct.types && selectedProduct.types.length > 0 ? (
                    selectedProduct.types.map((t) => (
                      <TransitionLink
                        key={t.slug}
                        href={`/products/${t.slug}-sample`}
                        title={t.name}
                        onClick={() => setOpen(false)}
                        className="type-pill"
                        style={{
                          padding: "9px 16px",
                          border: `1px solid ${theme.color.border}`,
                          fontSize: 12,
                          color: theme.color.ink,
                        }}
                      >
                        {t.name}
                      </TransitionLink>
                    ))
                  ) : (
                    <span style={{ fontSize: 12, color: "#A6A29B" }}>Types coming soon.</span>
                  )}
                </div>
              </div>
            )}
          </div>
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
