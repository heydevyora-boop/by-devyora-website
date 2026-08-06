import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { PageTransitionProvider } from "@/components/site/page-transition";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Architectural Materials Made to Drawing`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Cast, moulded and fired architectural materials for facades, thresholds and landscapes — made to drawing.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Archivo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#FFFFFF",
          WebkitFontSmoothing: "antialiased",
          fontFamily: "Archivo, system-ui, sans-serif",
          fontWeight: 300,
          letterSpacing: "0.01em",
          color: "#121110",
        }}
      >
        <PageTransitionProvider>{children}</PageTransitionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
