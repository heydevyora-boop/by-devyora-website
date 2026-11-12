"use client";

import { useEffect, useRef } from "react";

export type RailProduct = {
  name: string;
  slug: string;
  image: string;
};

/**
 * The auto-scrolling, drag/swipe-able row of material cards shown in the
 * Products dropdown (desktop) and the hamburger menu (mobile) — the same
 * component, so both share one implementation of the rail mechanics
 * instead of two copies that could drift apart.
 *
 * Auto-scroll + manual drag-to-scroll, driven by JS (scrollLeft on a
 * genuinely scrollable track) rather than a CSS transform/keyframe, for two
 * reasons: it lets a mouse (or a finger, via native touch scrolling) drag
 * the rail left and right, and it lets "paused while hovered" be real
 * mouse-presence state instead of CSS :focus-within — which stayed true
 * (and the animation stayed paused) after clicking a card, even once the
 * pointer had moved away, since the clicked button kept focus. Touch
 * devices get native swipe scrolling for free from overflow-x; this only
 * adds drag handling for an actual mouse.
 */
export function ProductRail({
  products,
  active,
  onSelect,
  renderCardExtra,
}: {
  products: RailProduct[];
  /** Whether this rail's auto-scroll should run — tie this to whatever
   * open/closed state controls the menu this rail lives in, so a closed,
   * invisible rail isn't animating in the background. */
  active: boolean;
  onSelect: (product: RailProduct) => void;
  /** Optional extra control rendered on top of each card (e.g. the
   * Products dropdown's types-reveal chevron) — passed its own `wasDrag`
   * check so a drag release doesn't also trigger whatever this renders. */
  renderCardExtra?: (
    product: RailProduct,
    isClone: boolean,
    wasDrag: () => boolean
  ) => React.ReactNode;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isTouchingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const dragDistanceRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const rail = railRef.current;
    if (!rail) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // A full set-width (half the doubled track's scrollWidth) every
    // `products.length * 7` seconds.
    const halfWidth = rail.scrollWidth / 2;
    const durationMs = products.length * 7000;
    const pxPerMs = halfWidth / durationMs;

    // Tracks the true (sub-pixel) scroll position in JS, rather than
    // reading it back from rail.scrollLeft each frame. At narrower card
    // sizes (small viewports with fewer pixels to cover), the per-frame
    // increment can be well under 1px — but the DOM's scrollLeft rounds to
    // the nearest whole pixel, so accumulating onto that rounded value
    // throws the fractional part away every single frame and the rail
    // simply never moves past its first rounded pixel. Keeping the real
    // value here and only writing the rounded result to the DOM lets it
    // keep accumulating normally.
    let pos = rail.scrollLeft;
    let rafId: number;
    let lastTime: number | null = null;

    function step(time: number) {
      if (lastTime === null) lastTime = time;
      const dt = time - lastTime;
      lastTime = time;

      if (rail) {
        if (isDraggingRef.current || isTouchingRef.current) {
          // The mouse-drag handler writes straight to rail.scrollLeft, and
          // an active touch gesture scrolls it natively — either way, keep
          // this loop's own tracked position following the real one so
          // auto-scroll resumes from the right place once released,
          // instead of fighting the drag/swipe or snapping back afterwards.
          pos = rail.scrollLeft;
        } else if (!isHoveringRef.current) {
          pos += pxPerMs * dt;
          rail.scrollLeft = pos;
        }
        // Runs every frame regardless of pause state, so a manual drag or
        // swipe that crosses into the clone set wraps just as seamlessly
        // as auto-scroll. If a drag is in progress when this fires,
        // dragStartScrollRef has to shift by the same amount, or the next
        // pointermove would jump the track back using a now-stale start
        // position.
        const half = rail.scrollWidth / 2;
        if (pos >= half) {
          pos -= half;
          rail.scrollLeft = pos;
          if (isDraggingRef.current) dragStartScrollRef.current -= half;
        }
      }
      rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [active, products.length]);

  // Deliberately NOT using setPointerCapture here: capturing the pointer on
  // the rail retargets the browser's mouseup/click to the rail itself
  // instead of whatever card (or its extra control) is under the cursor,
  // so those stopped receiving clicks entirely. Tracking the drag with
  // plain window listeners (the standard "grab to scroll" pattern) avoids
  // that — the click still lands on the real button, and wasDrag() below
  // is what tells that click to ignore itself if it was really a drag.
  function onRailPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!railRef.current) return;

    // Touch (and pen) swipes scroll the rail natively — no custom math
    // needed — but the auto-scroll loop above still needs to know a
    // gesture is in progress so it stops nudging scrollLeft itself while a
    // finger is actively dragging it.
    if (event.pointerType !== "mouse") {
      isTouchingRef.current = true;
      const onTouchEnd = () => {
        isTouchingRef.current = false;
        window.removeEventListener("pointerup", onTouchEnd);
        window.removeEventListener("pointercancel", onTouchEnd);
      };
      window.addEventListener("pointerup", onTouchEnd);
      window.addEventListener("pointercancel", onTouchEnd);
      return;
    }

    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = railRef.current.scrollLeft;
    railRef.current.dataset.dragging = "true";

    function onMove(moveEvent: PointerEvent) {
      if (!railRef.current) return;
      const delta = moveEvent.clientX - dragStartXRef.current;
      dragDistanceRef.current = Math.abs(delta);
      railRef.current.scrollLeft = dragStartScrollRef.current - delta;
    }

    function onUp() {
      isDraggingRef.current = false;
      if (railRef.current) delete railRef.current.dataset.dragging;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  // A click that's really the end of a drag shouldn't also navigate or
  // trigger a card's extra control.
  function wasDrag() {
    return dragDistanceRef.current > 5;
  }

  return (
    <div
      ref={railRef}
      className="product-rail"
      onMouseEnter={() => {
        isHoveringRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveringRef.current = false;
      }}
      onPointerDown={onRailPointerDown}
    >
      <div className="product-rail-track">
        {[false, true].map((isClone) => (
          <div
            key={isClone ? "clone" : "original"}
            className={isClone ? "product-rail-set product-rail-clone" : "product-rail-set"}
            aria-hidden={isClone || undefined}
          >
            {products.map((product) => (
              <div key={product.slug} className="product-rail-card" style={{ position: "relative" }}>
                <button
                  type="button"
                  className="dropdown-item-link"
                  tabIndex={isClone ? -1 : undefined}
                  onClick={() => {
                    if (wasDrag()) return;
                    onSelect(product);
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

                {renderCardExtra?.(product, isClone, wasDrag)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
