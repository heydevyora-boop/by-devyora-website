"use client";

import { useEffect, useRef, useState } from "react";
import { usePageTransition } from "./page-transition";
import { TransitionLink } from "./transition-link";
import { ProductRail, type RailProduct } from "./product-rail";

type ProductType = { name: string; slug: string };

type ProductItem = RailProduct & {
  // Sub-types shown in the expandable panel under each card, each one
  // linking to its own product page. Left unset (or empty) until a
  // material has real types — the panel then shows a "coming soon"
  // placeholder instead of an empty box.
  types?: ProductType[];
};

export function ProductNavDropdown({ products }: { products: ProductItem[] }) {
  const [open, setOpen] = useState(false);
  const [openTypesFor, setOpenTypesFor] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { start } = usePageTransition();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Don't carry a selection over to the next time the menu opens.
  useEffect(() => {
    if (!open) setOpenTypesFor(null);
  }, [open]);

  const selectedProduct = products.find((p) => p.slug === openTypesFor) ?? null;

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        style={{
          appearance: "none",
          border: 0,
          outline: 0,
          background: "transparent",
          padding: 0,
          margin: 0,
          font: "inherit",
          color: "inherit",
          cursor: "pointer",
          letterSpacing: "inherit",
          textTransform: "inherit",
          fontWeight: "inherit",
        }}
      >
        Products
      </button>

      <div
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: "var(--site-header-height, 81px)",
          left: 0,
          right: 0,
          zIndex: 100,
          // Reverted to plain white — the rustic-paper texture (reused from
          // the page-transition curtain) looked weird here once seen live,
          // both behind the card rail and behind the types panel below it.
          background: "#FFFFFF",
          borderTop: "1px solid #E4E1DC",
          borderBottom: "1px solid #121110",
          boxShadow: open ? "0 18px 40px rgba(18,17,16,0.08)" : "none",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transform: open ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity 180ms ease, transform 240ms cubic-bezier(0.22, 1, 0.36, 1), visibility 240ms",
        }}
      >
        {/* Single-row product rail. Two identical copies of the list sit in one
            scrollable track; the auto-scroll effect inside ProductRail wraps
            scrollLeft by half the track's width so the loop is seamless.
            Auto-scroll pauses while the mouse is over it or while dragging;
            a mouse can also drag it left/right directly, and touch devices
            can swipe it via native scrolling. */}
        <div style={{ paddingTop: 48 }}>
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
                // triggers navigation.
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
                    top: 8,
                    right: 8,
                    width: 26,
                    height: 26,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    appearance: "none",
                    border: 0,
                    borderRadius: "50%",
                    background: "rgba(18,17,16,0.55)",
                    cursor: isClone ? "default" : "pointer",
                    pointerEvents: isClone ? "none" : "auto",
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
                </button>
              );
            }}
          />
        </div>

        {/* TYPES PANEL — shared across all cards, populated once real type
            copy exists per material (ProductItem.types). Sits outside
            .product-rail so it's never clipped by the rail's overflow mask. */}
        <div
          style={{
            width: "min(1440px, 100%)",
            margin: "0 auto",
            padding: "0 clamp(20px, 3vw, 48px)",
            maxHeight: selectedProduct ? 280 : 0,
            overflow: "hidden",
            transition: "max-height 280ms ease",
          }}
        >
          {selectedProduct && (
            <div
              style={{
                borderTop: "1px solid #E4E1DC",
                padding: "22px 0 26px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#8C6A45",
                  marginBottom: 16,
                }}
              >
                {selectedProduct.name} — Types
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
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
                        border: "1px solid #E4E1DC",
                        fontSize: 12,
                        color: "#121110",
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

        <div
          style={{
            width: "min(1440px, 100%)",
            margin: "0 auto",
            padding: "0 clamp(20px, 3vw, 48px) 34px",
          }}
        >
          <TransitionLink
            href="/materials"
            title="Products"
            onClick={() => setOpen(false)}
            style={{
              display: "inline-block",
              marginTop: 28,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#6B6862",
            }}
          >
            View all products ↗
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
