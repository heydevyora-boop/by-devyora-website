"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled root-layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 40 }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: "#6B6862", marginBottom: 24 }}>Please try again.</p>
        <button onClick={reset} style={{ background: "#121110", color: "#fff", border: 0, padding: "12px 24px", cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
