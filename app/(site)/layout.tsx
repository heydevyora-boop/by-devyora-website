import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MaterialRepository } from "@/lib/repositories/material.repository";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const materials = await MaterialRepository.findAll({ publishedOnly: true });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteHeader
        materials={materials.map((m) => ({ id: m.id, slug: m.slug, name: m.name, tagline: m.tagline }))}
      />
      <main style={{ flex: 1 }}>{children}</main>
      <SiteFooter />
    </div>
  );
}
