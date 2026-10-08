import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { MaterialRepository } from "@/lib/repositories/material.repository";
import { CityRepository } from "@/lib/repositories/city.repository";
import { CityCoverage } from "@/components/site/city-coverage";
import { theme, pagePadX } from "@/lib/theme";
import { ImagePlaceholder } from "@/components/site/ui";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { RequirementForm } from "@/components/site/requirement-form";
import {
  MATERIAL_PAGE_CONTENT,
  neutralMaterialContent,
  type MaterialPageContent,
} from "@/lib/material-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Prebuild every published material at deploy time, plus every material
// defined in lib/material-pages.ts even if its database row doesn't exist
// yet — see the fallback in the page component below for why.
export async function generateStaticParams() {
  const materials = await MaterialRepository.findAll({
    publishedOnly: true,
  });

  const dbSlugs = new Set(materials.map((m) => m.slug));
  const allSlugs = new Set([...dbSlugs, ...Object.keys(MATERIAL_PAGE_CONTENT)]);
  return Array.from(allSlugs).map((slug) => ({ slug }));
}

// Revalidate page every hour
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const material = await MaterialRepository.findBySlug(slug);

  if (material) {
    return buildMetadata({
      title: `${material.name} — Architectural Material System`,
      description: material.description ?? material.tagline,
      path: `/materials/${material.slug}`,
      image: material.heroImage ?? undefined,
    });
  }

  const fallback = MATERIAL_PAGE_CONTENT[slug];
  if (!fallback) return {};
  return buildMetadata({
    title: `${fallback.name} — Architectural Material System`,
    description: fallback.intro,
    path: `/materials/${slug}`,
    image: fallback.heroImage,
  });
}

export default async function MaterialDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const material = await MaterialRepository.findBySlug(slug);

  if (!material) {
    // Not in the database yet — same situation (and same fix) as the
    // product-type pages: a material added to lib/material-pages.ts is live
    // in code the moment this merges, but its database row only exists
    // once someone reseeds. Rather than 404 until then, render a minimal
    // page from that file's content alone — hero image, name, the same
    // shared enquiry form as every other page. Once the real row exists,
    // the full page above takes over automatically at this same URL.
    const fallback = MATERIAL_PAGE_CONTENT[slug];
    if (!fallback) notFound();

    const name = fallback.name;

    return (
      <main
        style={{
          padding: `clamp(48px, 8vw, 110px) ${pagePadX} clamp(64px, 10vw, 160px)`,
        }}
      >
        <Breadcrumbs
          items={[
            { name: "Products", path: "/materials" },
            { name, path: `/materials/${slug}` },
          ]}
        />

        <h1
          style={{
            fontFamily: theme.font.serif,
            fontWeight: 400,
            fontSize: "clamp(56px, 12.5vw, 210px)",
            lineHeight: 0.86,
            letterSpacing: "-0.03em",
            margin: "0 0 clamp(28px, 4vw, 48px)",
          }}
        >
          {name}
        </h1>

        <div
          style={{
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
            aspectRatio: "16/9",
            overflow: "hidden",
            position: "relative",
            background: "#F6F4F1",
          }}
        >
          <Image
            src={fallback.heroImage}
            alt={fallback.heroAlt}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

        <div style={{ paddingTop: "clamp(40px, 6vw, 72px)" }}>
          <p style={{ maxWidth: "60ch", fontSize: 15, lineHeight: 1.75, color: "#4A4844" }}>
            {fallback.intro}
          </p>
        </div>

        <RequirementForm
          eyebrow={fallback.ctaEyebrow}
          description={fallback.ctaDescription}
          idPrefix={slug}
        />
      </main>
    );
  }

  const related = await MaterialRepository.findRelated(material.num, 3);

  const totalMaterials = await MaterialRepository.countPublished();

  const cities = await CityRepository.findAll();

  const topCities = cities.slice(0, 8);


  /*
   * ------------------------------------------------------------
   * GRC HERO IMAGE
   * ------------------------------------------------------------
   *
   * GRC image:
   *
   * /public/images/grc-hero.jpeg
   *
   * Browser URL:
   *
   * /images/grc-hero.jpeg
   *
   * It is displayed only on:
   *
   * /materials/grc
   *
   * Other materials continue using their database heroImage
   * or the ImagePlaceholder.
   */

  const materialSlug = material.slug.toLowerCase();
  const isGRC = materialSlug === "grc";
  const isFRP = materialSlug === "frp";
  const isTerracotta =
    materialSlug === "terracotta" || materialSlug === "teracotta";

  // Content for materials configured in lib/material-pages.ts (WPC, NHPS, ...)
  const extraContent = MATERIAL_PAGE_CONTENT[materialSlug];

  const specialContent: MaterialPageContent = isFRP
    ? {
        eyebrow: "FRP — Architectural Applications",
        intro:
          "FRP can be used across residential, commercial, hospitality and institutional projects to create distinctive architectural forms and detailing.",
        applicationsLabel: "FRP Applications",
        applications: [
          {
            title: "FRP Jali & Screens",
            description:
              "For facades, balconies, partitions and decorative applications.",
          },
          {
            title: "FRP Pillars & Columns",
            description: "For entrances, facades and architectural spaces.",
          },
          {
            title: "FRP Arches",
            description: "For doors, windows, entrances and facade detailing.",
          },
          {
            title: "FRP Stone Cladding",
            description:
              "For adding texture and character to architectural surfaces.",
          },
          {
            title: "FRP Facade Elements",
            description: "For contemporary and decorative building elevations.",
          },
          {
            title: "FRP Cornices & Mouldings",
            description:
              "For rooflines, windows, doors and architectural transitions.",
          },
          {
            title: "FRP Bases & Architectural Details",
            description: "For columns, walls and other design applications.",
          },
        ],
        productsLabel: "FRP Products",
        productsText:
          "Our architectural FRP range includes: FRP Jali | FRP Pillars | FRP Arches | FRP Cornices | FRP Mouldings | FRP Facade Elements | FRP Stone Cladding | FRP Bases | Custom FRP Elements",
        productsDescription:
          "Whether you need an FRP jali, pillar, cornice, moulding or custom facade element, solutions can be developed around the design, dimensions and application requirements of your project.",
        whyChoose: [
          {
            title: "Design-Focused Approach",
            description:
              "FRP elements designed to complement the overall architectural vision of a project.",
          },
          {
            title: "Custom Solutions",
            description:
              "Explore custom forms, patterns, profiles and dimensions based on your requirements.",
          },
          {
            title: "Wide Range of Applications",
            description:
              "From FRP jali and pillars to arches, cornices, mouldings and facade elements.",
          },
          {
            title: "Project-Oriented Support",
            description:
              "Suitable for architects, builders, interior designers and project teams.",
          },
          {
            title: "PAN-India Delivery",
            description:
              "Supporting FRP requirements for projects across India.",
          },
        ],
        ctaEyebrow: "FRP By Devyora",
        ctaDescription:
          "Share your drawing, reference image, dimensions or project requirement with By Devyora to explore the right FRP solution for your project.",
      }
    : isTerracotta
      ? {
          eyebrow: "Terracotta — Architectural Applications",
          intro:
            "Add warmth, texture and natural character to your spaces with terracotta products By Devyora. From terracotta pots and planters to vases and larger decorative pieces, our collection is designed for architectural, landscape and interior applications.",
          applicationsLabel: "Terracotta Products",
          applications: [
            {
              title: "Terracotta Pots",
              description:
                "Natural and versatile pots for gardens, entrances, balconies and indoor spaces.",
            },
            {
              title: "Large Terracotta Pots",
              description:
                "Statement pieces for landscapes, courtyards, entrances and hospitality spaces.",
            },
            {
              title: "Terracotta Planters",
              description:
                "Earthy planters designed to complement residential, commercial and landscape settings.",
            },
            {
              title: "Terracotta Vases",
              description:
                "Decorative forms that add warmth and handcrafted character to interiors and curated spaces.",
            },
            {
              title: "Custom & Decorative Terracotta Elements",
              description:
                "Terracotta pieces developed around specific design and project requirements.",
            },
          ],
          productsLabel: "Terracotta Products",
          productsText:
            "Our terracotta collection includes terracotta pots, large terracotta pots, terracotta planters, terracotta vases and custom decorative terracotta elements.",
          productsDescription:
            "Explore terracotta products designed to bring natural warmth, texture and character to architectural, landscape and interior spaces.",
          whyChoose: [
            {
              title: "Design-Focused Collection",
              description:
                "Contemporary terracotta forms suited to different architectural styles.",
            },
            {
              title: "Multiple Applications",
              description:
                "From pots and planters to vases and decorative elements.",
            },
            {
              title: "Natural Aesthetic",
              description:
                "Earthy tones and textures that bring warmth and character to spaces.",
            },
            {
              title: "Project-Friendly Solutions",
              description:
                "Suitable for residential, commercial, hospitality and landscape requirements.",
            },
            {
              title: "Custom Requirements",
              description:
                "Options can be explored based on design, dimensions and project requirements.",
            },
          ],
          ctaEyebrow: "Terracotta By Devyora",
          ctaDescription:
            "Explore terracotta pots, large terracotta pots, terracotta planters and terracotta vases designed to bring natural warmth, texture and character to architectural, landscape and interior spaces.",
        }
      : isGRC
        ? {
          eyebrow: "GRC — Architectural Applications",
          intro:
            "GRC can be used across residential, commercial, hospitality and institutional architecture for creating distinctive architectural details and refined facades.",
          applicationsLabel: "GRC Products & Applications",
          applications: [
            {
              title: "GRC Jali",
              description: "For facades, screens, balconies and partitions.",
            },
            {
              title: "GRC Pillars & Columns",
              description:
                "For entrances, elevations and architectural spaces.",
            },
            {
              title: "GRC Arches",
              description: "For doors, windows and facade detailing.",
            },
            {
              title: "GRC Cornices & Mouldings",
              description:
                "For rooflines, windows, doors and facade transitions.",
            },
            {
              title: "GRC Facade Elements",
              description:
                "For contemporary and traditional architectural elevations.",
            },
            {
              title: "GRC Stone Cladding",
              description:
                "For adding texture and architectural character to exterior surfaces.",
            },
            {
              title: "GRC Bases & Architectural Details",
              description:
                "For columns, walls and other structural or decorative applications.",
            },
          ],
          productsLabel: "GRC Products",
          productsText:
            "Our architectural GRC range includes jali, pillars, arches, cornices, mouldings, facade elements, stone cladding, bases and custom architectural details.",
          productsDescription:
            "Whether you are looking for a decorative GRC jali, architectural cornice or a custom facade element, products can be developed around the design, dimensions and application requirements of your project.",
          whyChoose: [
            {
              title: "Architectural Design Focus",
              description:
                "GRC elements designed to complement the overall architecture of a project.",
            },
            {
              title: "Custom Solutions",
              description:
                "Explore custom patterns, profiles, dimensions and architectural details.",
            },
            {
              title: "Wide Product Range",
              description:
                "From GRC jali and pillars to cornices, mouldings and facade elements.",
            },
            {
              title: "Project-Oriented Support",
              description:
                "Suitable for architects, builders, designers and large-scale projects.",
            },
            {
              title: "PAN-India Delivery",
              description: "GRC solutions available for projects across India.",
            },
          ],
          ctaEyebrow: "GRC By Devyora",
          ctaDescription:
            "Share your drawing, reference image, dimensions or project requirement with Devyora to explore the right GRC solution for your project.",
        }
        : (extraContent ?? neutralMaterialContent(material.name));

  return (
    <main
      style={{
        padding: `0 ${pagePadX} clamp(60px, 8vw, 120px)`,
      }}
    >
      {/* =========================================================
          BREADCRUMBS
      ========================================================= */}

      <div
        style={{
          paddingTop: "clamp(24px, 4vw, 40px)",
        }}
      >
        <Breadcrumbs
          items={[
            {
              name: "Products",
              path: "/materials",
            },
            {
              name: material.name,
              path: `/materials/${material.slug}`,
            },
          ]}
        />
      </div>

      {/* =========================================================
          MATERIAL HERO TEXT
      ========================================================= */}

      <section
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(24px, 4vw, 48px) 0 clamp(32px, 5vw, 60px)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: theme.color.accent,
            marginBottom: "clamp(20px, 3vw, 36px)",
          }}
        >
          {String(material.num).padStart(3, "0")} /{" "}
          {String(totalMaterials).padStart(3, "0")} — Architectural System
        </div>

        <h1
          style={{
            fontFamily: theme.font.serif,
            fontWeight: 400,
            fontSize: "clamp(56px, 12.5vw, 210px)",
            lineHeight: 0.86,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          {material.name}
        </h1>

        <p
          style={{
            maxWidth: "40ch",
            margin: "clamp(28px, 4vw, 48px) 0 0",
            fontSize: "clamp(16px, 1.4vw, 21px)",
            lineHeight: 1.6,
            color: "#4A4844",
          }}
        >
          {material.tagline}
        </p>
      </section>

      {/* =========================================================
          HERO IMAGE
      ========================================================= */}

      <div
        style={{
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          aspectRatio: "16/9",
          overflow: "hidden",
          position: "relative",
          background: "#F6F4F1",
        }}
      >
        {isGRC ? (
          <Image
            src="/images/GRC.webp"
            alt="GRC architectural facade by Devyora"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : isFRP ? (
          <Image
            src="/images/FRP.webp"
            alt="FRP architectural facade by Devyora"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : isTerracotta ? (
          <Image
            src="/images/Tera.webp"
            alt="Terracotta architectural facade by Devyora"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : extraContent ? (
          <Image
            src={extraContent.heroImage}
            alt={extraContent.heroAlt}
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : material.heroImage ? (
          <Image
            src={material.heroImage}
            alt={`${material.name} — Architectural Material`}
            fill
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : (
          <ImagePlaceholder
            label={`${material.name} — Hero`}
            aspectRatio="16/9"
          />
        )}
      </div>

      {/* =========================================================
          MATERIAL INTRODUCTION
      ========================================================= */}

      <section
        style={{
          padding: "clamp(70px, 10vw, 150px) 0 0",
        }}
      >
          {/* =======================================================
              INTRO
          ======================================================= */}

          <div
            style={{
              maxWidth: "900px",
              marginBottom: "clamp(60px, 8vw, 110px)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: theme.color.accent,
                marginBottom: 24,
              }}
            >
              {specialContent.eyebrow}
            </div>

            <p
              style={{
                fontFamily: theme.font.serif,
                fontSize: "clamp(28px, 4vw, 52px)",
                lineHeight: 1.15,
                letterSpacing: "-0.015em",
                margin: 0,
                color: theme.color.ink,
              }}
            >
              {specialContent.intro}
            </p>
          </div>

          {/* =======================================================
              MATERIAL APPLICATIONS
          ======================================================= */}

          {specialContent.applications.length > 0 && (
          <div
            style={{
              borderTop: `1px solid ${theme.color.ink}`,
            }}
          >
            <div
              style={{
                padding: "20px 0",
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: theme.color.accent,
              }}
            >
              {specialContent.applicationsLabel}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
                borderTop: `1px solid ${theme.color.border}`,
              }}
            >
              {specialContent.applications.map((item, index) => (
                <div
                  key={item.title}
                  style={{
                    padding: "clamp(24px, 3vw, 38px) clamp(20px, 3vw, 34px)",
                    borderRight: `1px solid ${theme.color.border}`,
                    borderBottom: `1px solid ${theme.color.border}`,
                    minHeight: 150,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      color: theme.color.accent,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <h3
                      style={{
                        fontFamily: theme.font.serif,
                        fontSize: "clamp(21px, 2vw, 28px)",
                        fontWeight: 400,
                        lineHeight: 1.1,
                        margin: "0 0 10px",
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: theme.color.muted,
                        margin: 0,
                        maxWidth: "42ch",
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* =======================================================
              MATERIAL PRODUCTS
          ======================================================= */}

          {(specialContent.productsText || specialContent.productsDescription) && (
          <div
            className="grid-stack-tablet"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(180px, 0.6fr) minmax(300px, 1.4fr)",
              gap: "clamp(30px, 6vw, 100px)",
              padding: "clamp(70px, 9vw, 130px) 0",
              borderBottom: `1px solid ${theme.color.border}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: theme.color.accent,
              }}
            >
              {specialContent.productsLabel}
            </div>

            <div>
              <p
                style={{
                  fontFamily: theme.font.serif,
                  fontSize: "clamp(25px, 3vw, 40px)",
                  lineHeight: 1.2,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {specialContent.productsText}
                <br />
                <br />
                {specialContent.productsDescription}
              </p>
            </div>
          </div>
          )}

          {/* =======================================================
              WHY CHOOSE BY DEVYORA
          ======================================================= */}

          {specialContent.whyChoose.length > 0 && (
          <div
            style={{
              padding: "clamp(70px, 9vw, 130px) 0",
              borderBottom: `1px solid ${theme.color.border}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: theme.color.accent,
                marginBottom: "clamp(30px, 5vw, 55px)",
              }}
            >
              Why Choose By Devyora?
            </div>

            <div>
              {specialContent.whyChoose.map((item, index) => (
                <div
                  key={item.title}
                  className="grid-stack-tablet"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "60px minmax(220px, 0.7fr) minmax(280px, 1.3fr)",
                    gap: "clamp(15px, 3vw, 40px)",
                    alignItems: "baseline",
                    padding: "clamp(18px, 2.5vw, 28px) 0",
                    borderTop:
                      index === 0 ? `1px solid ${theme.color.border}` : "none",
                    borderBottom: `1px solid ${theme.color.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      color: theme.color.accent,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span
                    style={{
                      fontFamily: theme.font.serif,
                      fontSize: "clamp(19px, 2vw, 26px)",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </span>

                  <span
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: theme.color.muted,
                    }}
                  >
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* =======================================================
              MATERIAL REQUIREMENT FORM
          ======================================================= */}

          <RequirementForm
            eyebrow={specialContent.ctaEyebrow}
            description={specialContent.ctaDescription}
            idPrefix={materialSlug}
          />
      </section>

      {/* =========================================================
          SPECIFICATION + APPLICATIONS
      ========================================================= */}

      {(material.specs.length > 0 || material.applications.length > 0) && (
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
          gap: "clamp(28px, 5vw, 80px)",
          padding: "clamp(48px, 7vw, 110px) 0 0",
        }}
      >
        {/* =======================================================
            SPECIFICATION
        ======================================================= */}

        {material.specs.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: theme.color.accent,
              paddingBottom: 18,
              borderBottom: `1px solid ${theme.color.ink}`,
            }}
          >
            Specification
          </div>

          {material.specs.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 24,
                padding: "16px 0",
                borderBottom: `1px solid ${theme.color.border}`,
                fontSize: 14,
              }}
            >
              <span
                style={{
                  color: theme.color.muted,
                }}
              >
                {s.key}
              </span>

              <span
                style={{
                  textAlign: "right",
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
        )}

        {/* =======================================================
            APPLICATIONS
        ======================================================= */}

        {material.applications.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: theme.color.accent,
              paddingBottom: 18,
              borderBottom: `1px solid ${theme.color.ink}`,
            }}
          >
            Applications
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              paddingTop: 22,
            }}
          >
            {material.applications.map((a) => (
              <Link
                key={a.id}
                href={
                  topCities[0]
                    ? `/materials/${material.slug}/${a.slug}/${topCities[0].slug}`
                    : "#"
                }
                style={{
                  padding: "8px 16px",
                  border: `1px solid ${theme.color.border}`,
                  fontSize: 12,
                  color: theme.color.muted,
                }}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>
        )}
      </section>
      )}

      {/* =========================================================
          CITY COVERAGE
      ========================================================= */}

      <CityCoverage
        label={
          material.applications[0]
            ? `${material.name} ${material.applications[0].label}, by city`
            : `${material.name}, by city`
        }
        entityName={
          material.applications[0]
            ? `${material.name} ${material.applications[0].label}`
            : material.name
        }
        // Always the 3-segment shape, even with no application — Next.js
        // doesn't allow two different dynamic segment names (e.g.
        // [application] and [city]) at the same path level, so a 2-segment
        // fallback here would collide with the city page's own route.
        // "overview" is a non-matching application slug the destination
        // page (materials/[slug]/[application]/[city]) already treats as
        // "no specific application" rather than 404ing.
        basePath={`/materials/${material.slug}/${material.applications[0]?.slug ?? "overview"}`}
      />

      {/* =========================================================
          PRODUCTS BUILT ON THIS MATERIAL
      ========================================================= */}

      {material.products.length > 0 && (
        <section
          style={{
            padding: "clamp(56px, 9vw, 130px) 0 0",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: theme.color.accent,
              paddingBottom: 20,
              borderBottom: `1px solid ${theme.color.ink}`,
              marginBottom: 28,
            }}
          >
            Products in this system
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))",
              gap: "clamp(20px, 3vw, 32px)",
            }}
          >
            {material.products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <ImagePlaceholder label={p.name} />

                <span
                  style={{
                    fontFamily: theme.font.serif,
                    fontSize: 20,
                  }}
                >
                  {p.name}
                </span>

                {p.shortDescription && (
                  <span
                    style={{
                      fontSize: 12,
                      color: theme.color.muted,
                    }}
                  >
                    {p.shortDescription}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          RELATED SYSTEMS
      ========================================================= */}

      {related.length > 0 && (
        <section
          style={{
            padding: "clamp(56px, 9vw, 130px) 0 0",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: theme.color.accent,
              paddingBottom: 20,
              borderBottom: `1px solid ${theme.color.ink}`,
            }}
          >
            Related systems
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(230px, 100%), 1fr))",
              gap: 1,
              background: theme.color.border,
            }}
          >
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/materials/${r.slug}`}
                style={{
                  background: "#FFFFFF",
                  padding: "clamp(24px, 3vw, 40px) clamp(18px, 2vw, 28px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    color: theme.color.accent,
                  }}
                >
                  {String(r.num).padStart(3, "0")}
                </span>

                <span
                  style={{
                    fontFamily: theme.font.serif,
                    fontSize: "clamp(24px, 2.4vw, 34px)",
                    lineHeight: 1.05,
                  }}
                >
                  {r.name}
                </span>

                <span
                  style={{
                    fontSize: 13,
                    color: theme.color.muted,
                  }}
                >
                  {r.tagline}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          BACK TO ALL PRODUCTS
      ========================================================= */}

      <div
        style={{
          paddingTop: "clamp(48px, 7vw, 96px)",
        }}
      >
        <Link
          href="/materials"
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: theme.color.muted,
          }}
        >
          ← All products
        </Link>
      </div>
    </main>
  );
}
