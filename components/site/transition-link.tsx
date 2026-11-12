"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, CSSProperties, MouseEvent, ReactNode } from "react";
import { usePageTransition } from "./page-transition";

/**
 * Drop-in replacement for next/link. On click it triggers the curtain
 * page-transition (showing `title`) before handing off to the real
 * navigation. Used on Material cards, Product cards — anywhere the
 * destination has a clear, short name worth announcing mid-transition.
 */
export function TransitionLink({
  href,
  title,
  children,
  style,
  onClick,
  ...rest
}: {
  href: string;
  title: string;
  children: ReactNode;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "style" | "onClick">) {
  const { start } = usePageTransition();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // Run the caller's own onClick first (e.g. closing a dropdown) — pulling
    // it out of `rest` instead of letting it spread onto <Link> after this
    // handler, which would silently replace this handler instead of running
    // alongside it, skipping the curtain transition below with no warning.
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Let modified clicks (open in new tab, etc.) behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    start(href, title);
  }

  return (
    <Link href={href} style={style} onClick={handleClick} data-transition-title={title} {...rest}>
      {children}
    </Link>
  );
}
