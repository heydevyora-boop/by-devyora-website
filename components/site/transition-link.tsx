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
  ...rest
}: {
  href: string;
  title: string;
  children: ReactNode;
  style?: CSSProperties;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "style">) {
  const { start } = usePageTransition();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks (open in new tab, etc.) behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    start(href, title);
  }

  return (
    <Link href={href} style={style} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
