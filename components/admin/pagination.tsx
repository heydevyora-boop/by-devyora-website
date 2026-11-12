import Link from "next/link";
import type { ListSearchParams } from "@/lib/list-params";
import { buildQueryString } from "@/lib/list-params";

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  searchParams: ListSearchParams;
  basePath: string;
};

const btnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #E4E1DC",
  fontSize: 12,
  textDecoration: "none",
  color: "#121110",
};

const disabledStyle: React.CSSProperties = {
  ...btnStyle,
  color: "#A6A29B",
  borderColor: "#E4E1DC",
  pointerEvents: "none",
};

export function Pagination({ page, totalPages, total, perPage, searchParams, basePath }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const hrefFor = (p: number) => `${basePath}${buildQueryString(searchParams, { page: p })}`;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, fontSize: 12 }}>
      <span style={{ color: "#6B6862" }}>
        {total === 0 ? "0 results" : `${from}–${to} of ${total}`}
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        {page <= 1 ? (
          <span style={disabledStyle}>←</span>
        ) : (
          <Link href={hrefFor(page - 1)} style={btnStyle}>←</Link>
        )}
        <span style={{ ...btnStyle, borderColor: "#121110" }}>{page}</span>
        <span style={{ display: "flex", alignItems: "center", color: "#6B6862" }}>of {totalPages}</span>
        {page >= totalPages ? (
          <span style={disabledStyle}>→</span>
        ) : (
          <Link href={hrefFor(page + 1)} style={btnStyle}>→</Link>
        )}
      </div>
    </div>
  );
}
