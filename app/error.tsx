"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Swap this for your monitoring provider's capture call (Sentry.captureException,
    // etc.) once one is wired up — see README-deployment.md. Vercel's own logs
    // already pick up this console.error in the meantime.
    console.error("Unhandled page error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 40,
        fontFamily: "Archivo, system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 12 }}>Something went wrong</h1>
      <p style={{ color: "#6B6862", fontSize: 14, marginBottom: 24, maxWidth: "48ch" }}>
        We've logged the error. Try again, or head back to the homepage.
      </p>
      <button
        onClick={reset}
        style={{ background: "#121110", color: "#FFFFFF", border: 0, padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
