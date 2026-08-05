import Link from "next/link";
import { TagRepository } from "@/lib/repositories/blog.repository";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteTagAction } from "@/app/actions/blog.actions";
import { TagForm } from "@/components/admin/tag-form";

type TagRow = Awaited<ReturnType<typeof TagRepository.findAll>>[number];

export default async function TagsPage() {
  const tags = await TagRepository.findAll();

  const columns: Column<TagRow>[] = [
    { header: "Name", cell: (t) => t.name },
    { header: "Slug", cell: (t) => <span style={{ color: "#6B6862" }}>{t.slug}</span> },
    { header: "Posts", cell: (t) => t._count.posts, align: "center" },
    {
      header: "",
      align: "right",
      cell: (t) => <DeleteButton id={t.id} action={deleteTagAction} confirmMessage={`Delete "${t.name}"?`} />,
    },
  ];

  return (
    <div>
      <Link href="/admin/blog" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6862" }}>
        ← Blog
      </Link>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, margin: "16px 0 24px" }}>Tags</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>
        <DataTable columns={columns} rows={tags} rowKey={(t) => t.id} emptyState="No tags yet." />
        <TagForm />
      </div>
    </div>
  );
}
