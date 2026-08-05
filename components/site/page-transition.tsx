"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { theme } from "@/lib/theme";

/**
 * Curtain-style route transition, modeled on the reveal used on mutina.it
 * product pages: a solid panel rises to cover the screen, the destination
 * title wipes in left-to-right, then the panel rises further to reveal the
 * new page underneath.
 *
 * Timings are fixed (not tied to real load time) for a predictable feel, but
 * the "revealing" phase won't hand off to "exiting" until the route has
 * actually changed underneath it — so a slow navigation holds the curtain
 * a little longer instead of revealing a half-loaded page.
 */

type Phase = "idle" | "entering" | "revealing" | "exiting";

const ENTER_MS = 420; // curtain rises to cover the screen
const REVEAL_MS = 650; // title wipes from muted to ink, left to right
const EXIT_MS = 480; // curtain rises off-screen, revealing the new page

type TransitionContextValue = {
  start: (href: string, title: string) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("usePageTransition must be used inside <PageTransitionProvider>");
  return ctx;
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [title, setTitle] = useState("");
  const pendingHref = useRef<string | null>(null);
  const revealDeadline = useRef(0);

  function start(href: string, label: string) {
    if (phase !== "idle" || href === pathname) return;
    pendingHref.current = href;
    setTitle(label);
    setPhase("entering");
    router.push(href);
    window.setTimeout(() => {
      revealDeadline.current = Date.now() + REVEAL_MS;
      setPhase("revealing");
    }, ENTER_MS);
  }

  // Don't leave "revealing" until the route has actually caught up.
  useEffect(() => {
    if (phase !== "revealing") return;
    if (pendingHref.current && pathname !== pendingHref.current) return;
    const wait = Math.max(0, revealDeadline.current - Date.now());
    const t = window.setTimeout(() => setPhase("exiting"), wait);
    return () => window.clearTimeout(t);
  }, [phase, pathname]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const t = window.setTimeout(() => {
      setPhase("idle");
      pendingHref.current = null;
    }, EXIT_MS);
    return () => window.clearTimeout(t);
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
  const translateY = phase === "idle" ? "100%" : phase === "exiting" ? "100%" : "0%";
  const wiped = phase === "revealing" || phase === "exiting";

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: theme.color.mutedBg,
        transform: `translateY(${translateY})`,
        transition: `transform ${phase === "exiting" ? EXIT_MS : ENTER_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(10px, 1.4vw, 18px)" }}>
        <span
          style={{
            position: "relative",
            display: "inline-block",
            fontFamily: theme.font.serif,
            fontSize: "clamp(32px, 6vw, 84px)",
            letterSpacing: "-0.02em",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          {/* base layer: muted, fully visible as soon as the curtain covers the screen */}
          <span style={{ color: "rgba(18,17,16,0.28)" }}>{title}</span>
          {/* wipe layer: full ink color, width animates 0 -> 100% left to right */}
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              color: theme.color.ink,
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: wiped ? "100%" : "0%",
              transition: `width ${REVEAL_MS - 100}ms cubic-bezier(0.65, 0, 0.35, 1)`,
            }}
          >
            {title}
          </span>
        </span>

        {/* Logo mark — settles in just below the title, right after the wipe finishes */}
        <Image
          src="/images/logo.png"
          alt="By Devyora"
          width={146}
          height={80}
          style={{
            height: "clamp(18px, 2.2vw, 26px)",
            width: "auto",
            opacity: wiped ? 1 : 0,
            transform: wiped ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 420ms ease 160ms, transform 420ms ease 160ms",
          }}
        />
      </div>
    </div>
  );
}
