"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { theme } from "@/lib/theme";
import { RUSTIC_PAPER, RUSTIC_PAPER_COLOR } from "@/lib/rustic-paper";

type Phase = "idle" | "entering" | "revealing" | "exiting";

// Tuned to the reference recording: cover -> text wipe -> upward reveal.
const ENTER_MS = 520;
const REVEAL_MS = 760;
const EXIT_MS = 620;
const CURTAIN_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const BRAND_TITLE = "By Devyora";

const ROUTE_TITLES: Record<string, string> = {
  "/": BRAND_TITLE,
  "/materials": "Products",
  "/projects": "Projects",
  "/journal": "Journal",
  "/manufacturing": "Manufacturing",
  "/about": "About",
  "/contact": "Contact",
};

type TransitionContextValue = {
  start: (href: string, title: string) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("usePageTransition must be used inside <PageTransitionProvider>");
  return ctx;
}

function cleanPath(href: string) {
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href.split(/[?#]/)[0];
  }
}

function titleForAnchor(anchor: HTMLAnchorElement) {
  const explicit = anchor.dataset.transitionTitle?.trim();
  if (explicit) return explicit;

  const path = cleanPath(anchor.href);
  if (ROUTE_TITLES[path]) return ROUTE_TITLES[path];

  const pathParts = path.split("/").filter(Boolean);
  if (pathParts[0] === "categories") return "Categories";

  // Detail cards normally contain the destination name. Prefer the first
  // meaningful text node instead of labels such as “View system”.
  const text = anchor.innerText.replace(/\s+/g, " ").trim();
  const useful = text
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean)
    .find((part) => !/^(view|read|all|browse|learn|discover|open|back|download)/i.test(part));

  return useful || BRAND_TITLE;
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [title, setTitle] = useState(BRAND_TITLE);
  const pendingHref = useRef<string | null>(null);
  const revealDeadline = useRef(0);

  function begin(titleText: string, href?: string) {
    if (phase !== "idle") return;
    setTitle(titleText || BRAND_TITLE);
    pendingHref.current = href ?? null;
    setPhase("entering");

    window.setTimeout(() => {
      revealDeadline.current = Date.now() + REVEAL_MS;
      setPhase("revealing");
    }, ENTER_MS);
  }

  function start(href: string, label: string) {
    if (phase !== "idle" || cleanPath(href) === pathname) return;
    const destination = new URL(href, window.location.origin);
    pendingHref.current = destination.pathname;
    setTitle(label || BRAND_TITLE);
    setPhase("entering");
    router.push(href);

    window.setTimeout(() => {
      revealDeadline.current = Date.now() + REVEAL_MS;
      setPhase("revealing");
    }, ENTER_MS);
  }

  // Covers every normal internal <a>/<Link>, including links that have not
  // been manually converted to TransitionLink yet.
  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (phase !== "idle") return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      // TransitionLink already owns this click; avoid starting the same
      // animation twice through the global delegated listener.
      if (anchor.dataset.transitionTitle) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search && !url.hash) return;
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/")) return;

      event.preventDefault();
      start(`${url.pathname}${url.search}${url.hash}`, titleForAnchor(anchor));
    }

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [phase, pathname]);

  // Browser Back/Forward: show the brand wordmark-style title, matching the
  // reference recording's return animation, before revealing the destination.
  useEffect(() => {
    function onPopState() {
      if (phase !== "idle") return;
      const destination = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      begin(BRAND_TITLE, destination);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [phase]);

  // Don't reveal until Next has actually rendered the destination route.
  useEffect(() => {
    if (phase !== "revealing") return;
    if (pendingHref.current && pathname !== cleanPath(pendingHref.current)) return;

    const wait = Math.max(0, revealDeadline.current - Date.now());
    const timer = window.setTimeout(() => setPhase("exiting"), wait);
    return () => window.clearTimeout(timer);
  }, [phase, pathname]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const timer = window.setTimeout(() => {
      setPhase("idle");
      pendingHref.current = null;
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <TransitionContext.Provider value={{ start }}>
      {children}
      <PageTransitionOverlay phase={phase} title={title} />
    </TransitionContext.Provider>
  );
}

function PageTransitionOverlay({ phase, title }: { phase: Phase; title: string }) {
  const visible = phase !== "idle";
  const translateY = phase === "idle" || phase === "exiting" ? "100%" : "0%";
  const wiped = phase === "revealing" || phase === "exiting";

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        overflow: "hidden",
        backgroundColor: RUSTIC_PAPER_COLOR,
        backgroundImage: `url("${RUSTIC_PAPER}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transform: `translate3d(0, ${translateY}, 0)`,
        transition: `transform ${phase === "exiting" ? EXIT_MS : ENTER_MS}ms cubic-bezier(0.77, 0, 0.175, 1)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: visible ? "auto" : "none",
        cursor: "none",
        userSelect: "none",
        willChange: "transform",
      }}
    >
      <div
        className="curtain-title"
        style={{
          position: "relative",
          display: "inline-block",
          fontFamily: CURTAIN_FONT,
          fontSize: "clamp(42px, 4.4vw, 86px)",
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: "-0.035em",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {/* Reference animation starts white, then paints black from left to right.
            Previously this was two stacked copies of the title — a plain white
            span, plus a black copy on top clipped by an animated width — so the
            wipe was really two independently-rendered text layers lining up on
            top of each other. They never quite matched: a composited (GPU)
            layer promoted by the animating width rasterizes text with slightly
            different sub-pixel positioning than the plain one beneath it, so a
            hairline sliver of the white layer always peeked out past the black
            one, worst on descenders (the "g" in Flooring, the "p" in Dimapur).
            Rendering the title once and animating a background gradient through
            it (clipped to the glyphs via background-clip: text) gets the same
            left-to-right paint-wipe with only one glyph render, so there is
            nothing for a second layer to drift out of alignment with. On phone
            widths this title wraps onto 2 centered lines instead (see the media
            query in globals.css); a shorter second line starts further right
            than the first, so this same box-relative gradient sweep would
            desync across lines exactly like the old width-wipe did — that
            media query swaps it for a plain color crossfade there, which has no
            box geometry to desync with. */}
        <span
          className="curtain-title-text"
          data-wiped={wiped}
          style={{
            backgroundImage: `linear-gradient(to right, ${theme.color.ink} 50%, #FFFFFF 50%)`,
            backgroundSize: "200% 100%",
            backgroundPositionX: wiped ? "0%" : "100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            transition: `background-position-x ${REVEAL_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
          }}
        >
          {title}
        </span>
      </div>
    </div>
  );
}
