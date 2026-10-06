"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePageTransition } from "./page-transition";
import { TransitionLink } from "./transition-link";

type ProductItem = {
  name: string;
  slug: string;
  image: string;
};

export function ProductNavDropdown({ products }: { products: ProductItem[] }) {
  const [open, setOpen] = useState(false);
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
                  {products.map((product) => (
                    <button
                      key={product.slug}
                      type="button"
                      className="product-rail-card"
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
                        style={{
                          display: "block",
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
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
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
