import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/status-badge";

async function getStats() {
  const [materials, categories, products, published, enquiriesNew, enquiriesTotal] = await Promise.all([
    prisma.material.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.enquiry.count(),
  ]);
  return { materials, categories, products, published, enquiriesNew, enquiriesTotal };
}

async function getRecentEnquiries() {
  return prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6 });
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #E4E1DC",
  padding: "20px 24px",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

export default async function AdminDashboardPage() {
  const [stats, recentEnquiries] = await Promise.all([getStats(), getRecentEnquiries()]);

  const cards = [
    { label: "Materials", value: stats.materials, href: "/admin/materials" },
    { label: "Categories", value: stats.categories, href: "/admin/categories" },
    { label: "Products", value: `${stats.published} / ${stats.products}`, sublabel: "published / total", href: "/admin/products" },
    { label: "New enquiries", value: stats.enquiriesNew, sublabel: `${stats.enquiriesTotal} total`, href: "/admin/enquiries" },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
        {cards.map((c) => (
          <Link key={c.label} href={c.href} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={cardStyle}>
              <span style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8C6A45" }}>
                {c.label}
              </span>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, lineHeight: 1 }}>{c.value}</span>
              {c.sublabel && <span style={{ fontSize: 11, color: "#6B6862" }}>{c.sublabel}</span>}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>Recent enquiries</h2>
        <Link href="/admin/enquiries" style={{ fontSize: 12, color: "#8C6A45" }}>View all →</Link>
      </div>

      <div style={{ border: "1px solid #E4E1DC" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F6F4F1", borderBottom: "1px solid #E4E1DC" }}>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6862" }}>Name</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6862" }}>Type</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6862" }}>Status</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6862" }}>Received</th>
            </tr>
          </thead>
          <tbody>
            {recentEnquiries.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "24px 16px", textAlign: "center", color: "#6B6862" }}>
                  No enquiries yet.
                </td>
              </tr>
            )}
            {recentEnquiries.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #E4E1DC" }}>
                <td style={{ padding: "10px 16px" }}>{e.firstName} {e.lastName}</td>
                <td style={{ padding: "10px 16px" }}>{e.type}</td>
                <td style={{ padding: "10px 16px" }}><StatusBadge value={e.status} /></td>
                <td style={{ padding: "10px 16px", color: "#6B6862" }}>{e.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
