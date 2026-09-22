import type { Metadata } from "next";
import Image from "next/image";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { theme, pagePadX } from "@/lib/theme";
import { TransitionLink } from "@/components/site/transition-link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Products — Architectural Material Systems",
  description:
    "Explore By Devyora's architectural material collections including GRC, FRP, terracotta, WPC, planters, railings, columns, jali, cladding and screens.",
  path: "/materials",
});

export const revalidate = 3600;

const FEATURED_COLLECTIONS = [
  { label: "GRC", match: "GRC" },
  { label: "FRP", match: "FRP" },
  { label: "Terracotta", match: "Terracotta" },
  { label: "WPC", match: "WPC" },
  { label: "Planters", match: "Planters" },
];

function imageFor(material: {
  heroImage: string | null;
  images: { url: string }[];
}) {
  return material.heroImage || material.images[0]?.url || null;
}

export default async function MaterialsPage() {
  const materials = await MaterialRepository.findAll({ publishedOnly: true });

  const featured = FEATURED_COLLECTIONS.map((collection) => {
    const material = materials.find(
      (item) => item.name.toLowerCase() === collection.match.toLowerCase()
    );
    return material ? { ...collection, material } : null;
  }).filter(Boolean) as Array<
    (typeof FEATURED_COLLECTIONS)[number] & { material: (typeof materials)[number] }
  >;

  return (
    <main style={{ background: "#F7F6F3", color: theme.color.ink }}>
      <Breadcrumbs items={[{ name: "Products", path: "/materials" }]} />

      {/* Reference-style collection hero */}
      <section
        style={{
          position: "relative",
          minHeight: "clamp(360px, 47vw, 620px)",
          margin: `0 ${pagePadX}`,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1918",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,.72), rgba(0,0,0,.22), rgba(0,0,0,.68))",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=2200&q=88')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(100%) contrast(1.08)",
            opacity: 0.72,
          }}
        />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", color: "#fff" }}>
          <span
            style={{
              display: "block",
              marginBottom: 20,
              fontSize: 10,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              opacity: 0.72,
            }}
          >
            By Devyora / Architectural Collections
          </span>
          <h1
            style={{
              margin: 0,
              fontFamily: theme.font.sans,
              fontSize: "clamp(52px, 8vw, 124px)",
              fontWeight: 300,
              lineHeight: 0.92,
              letterSpacing: "-0.055em",
            }}
          >
            Our Collections
          </h1>
        </div>
      </section>

      {/* Image-led collection navigation, matching the reference layout */}
      <section
        style={{
          padding: `clamp(28px, 4vw, 54px) ${pagePadX} clamp(54px, 7vw, 90px)`,
          background: "#FFFFFF",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "clamp(10px, 1.5vw, 22px)",
            overflowX: "auto",
          }}
        >
          {featured.map(({ label, material }) => {
            const image = imageFor(material);
            return (
              <TransitionLink
                key={material.id}
                href={`/materials/${material.slug}`}
                title={material.name}
                style={{
                  minWidth: 150,
                  color: theme.color.ink,
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "1.48 / 1",
                    overflow: "hidden",
                    background: "#E9E7E2",
                  }}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={`${material.name} architectural collection`}
                      fill
                      sizes="(max-width: 800px) 42vw, 18vw"
                      style={{
                        objectFit: "cover",
                        transition: "transform 500ms cubic-bezier(.2,.65,.2,1)",
                      }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#E9E7E2" }} />
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 13,
                    fontFamily: theme.font.sans,
                    fontSize: 12,
                    letterSpacing: "0.02em",
                  }}
                >
                  <span>{label}</span>
                  <span style={{ color: theme.color.faint }}>↗</span>
                </div>
              </TransitionLink>
            );
          })}
        </div>
      </section>

      {/* Product listing */}
      <section
        style={{
          padding: `0 ${pagePadX} clamp(80px, 10vw, 150px)`,
          background: "#F2F1EE",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            padding: "17px 0",
            borderTop: `1px solid ${theme.color.ink}`,
            borderBottom: `1px solid ${theme.color.border}`,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>All architectural systems</span>
          <span style={{ color: theme.color.muted }}>
            {String(materials.length).padStart(2, "0")} collections
          </span>
        </div>

        <div
          className="grid-cols-3-to-1-phone"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "clamp(18px, 2.5vw, 34px)",
            paddingTop: "clamp(28px, 4vw, 58px)",
          }}
        >
          {materials.map((material) => {
            const image = imageFor(material);

            return (
              <TransitionLink
                key={material.id}
                href={`/materials/${material.slug}`}
                title={material.name}
                style={{
                  display: "block",
                  color: theme.color.ink,
                  textDecoration: "none",
                }}
              >
                <article>
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1.42 / 1",
                      overflow: "hidden",
                      background: "#E5E3DE",
                    }}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={`${material.name} — By Devyora`}
                        fill
                        sizes="(max-width: 800px) 92vw, 31vw"
                        style={{
                          objectFit: "cover",
                          transition: "transform 600ms cubic-bezier(.2,.65,.2,1)",
                        }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#E5E3DE" }} />
                    )}

                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 12,
                        padding: "6px 9px",
                        background: "rgba(20,19,18,.74)",
                        color: "#fff",
                        fontSize: 9,
                        letterSpacing: "0.18em",
                      }}
                    >
                      {String(material.num).padStart(3, "0")}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 14,
                      alignItems: "start",
                      padding: "16px 0 22px",
                      borderBottom: `1px solid ${theme.color.border}`,
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontFamily: theme.font.sans,
                          fontSize: "clamp(20px, 2vw, 29px)",
                          fontWeight: 400,
                          lineHeight: 1.05,
                          letterSpacing: "-0.035em",
                        }}
                      >
                        {material.name}
                      </h2>
                      <p
                        style={{
                          margin: "9px 0 0",
                          maxWidth: "34ch",
                          color: theme.color.muted,
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        {material.tagline}
                      </p>
                    </div>
                    <span
                      style={{
                        paddingTop: 3,
                        fontSize: 18,
                        fontWeight: 300,
                      }}
                    >
                      ↗
                    </span>
                  </div>
                </article>
              </TransitionLink>
            );
          })}
        </div>
      </section>
    </main>
  );
}
