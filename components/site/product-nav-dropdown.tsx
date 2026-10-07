"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePageTransition } from "./page-transition";
import { TransitionLink } from "./transition-link";
import { RUSTIC_PAPER, RUSTIC_PAPER_COLOR } from "@/lib/rustic-paper";

type ProductType = { name: string; slug: string };

type ProductItem = {
  name: string;
  slug: string;
  image: string;
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
          // Same rustic-paper texture as the page-transition curtain — reused
          // here (not approximated) per request, behind/around and below the
          // cards. backgroundSize: cover keeps it seamless as the panel's
          // height changes (e.g. the types panel opening) at any viewport.
          backgroundColor: RUSTIC_PAPER_COLOR,
          backgroundImage: `url("${RUSTIC_PAPER}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
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
            track that slides left by exactly 50% (see .product-rail in
            globals.css), so the loop is seamless. Pauses on hover/focus. */}
        <div style={{ paddingTop: 48 }}>
          <div className="product-rail" data-open={open}>
            <div
              className="product-rail-track"
              style={
                {
                  "--product-rail-duration": `${products.length * 7}s`,
                } as CSSProperties
              }
            >
              {[false, true].map((isClone) => (
                <div
                  key={isClone ? "clone" : "original"}
                  className={isClone ? "product-rail-set product-rail-clone" : "product-rail-set"}
                  aria-hidden={isClone || undefined}
                >
                  {products.map((product) => {
                    const typesOpen = !isClone && openTypesFor === product.slug;
                    return (
                    <div key={product.slug} className="product-rail-card" style={{ position: "relative" }}>
                      <button
                        type="button"
                        className="dropdown-item-link"
                        tabIndex={isClone ? -1 : undefined}
                        onClick={() => {
                          setOpen(false);
                          start(`/materials/${product.slug}`, product.name);
                        }}
                        style={{
                          appearance: "none",
                          border: 0,
                          background: "transparent",
                          padding: 0,
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                          color: "#121110",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "282 / 170",
                            overflow: "hidden",
                            background: "#F6F4F1",
                          }}
                        >
                          <img
                            src={product.image}
                            alt={isClone ? "" : `${product.name} architectural material`}
                            loading="eager"
                            decoding="async"
                            draggable={false}
                            style={{
                              display: "block",
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>

                        <span
                          className="dropdown-item-name"
                          style={{
                            display: "inline-block",
                            marginTop: 11,
                            fontFamily: "Arial, Helvetica, sans-serif",
                            fontSize: "clamp(14px, 1.1vw, 18px)",
                            lineHeight: 1.2,
                            letterSpacing: "-0.01em",
                            textTransform: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {product.name}
                          <span className="dropdown-item-underline" />
                        </span>
                      </button>

                      {/* Reveals that material's types in the shared panel below the
                          rail — a separate control from the card above so it never
                          triggers navigation. */}
                      <button
                        type="button"
                        aria-label={`${product.name} types`}
                        aria-expanded={typesOpen}
                        tabIndex={isClone ? -1 : undefined}
                        onClick={(event) => {
                          event.stopPropagation();
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
                    </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
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
