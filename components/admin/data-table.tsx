import type { ReactNode } from "react";

export type Column<T> = {
  header: string;
  /** Render the cell for a row. Keep this presentational — actions live in a dedicated column. */
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyState?: ReactNode;
};

/**
 * Presentational table — no fetching, no state. The page (Server Component)
 * fetches data with the repository's paginated/filtered query and passes
 * rows straight in; SearchInput/FilterSelect/Pagination drive the URL,
 * which drives the next server render.
 */
export function DataTable<T>({ columns, rows, rowKey, emptyState }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div
        style={{
          border: "1px solid #E4E1DC",
          padding: "48px 24px",
          textAlign: "center",
          color: "#6B6862",
          fontSize: 13,
        }}
      >
        {emptyState ?? "No results."}
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #E4E1DC", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#F6F4F1", borderBottom: "1px solid #E4E1DC" }}>
            {columns.map((col) => (
              <th
                key={col.header}
                style={{
                  textAlign: col.align ?? "left",
                  padding: "12px 16px",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#6B6862",
                  fontWeight: 500,
                  width: col.width,
                  whiteSpace: "nowrap",
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} style={{ borderBottom: "1px solid #E4E1DC" }}>
              {columns.map((col) => (
                <td
                  key={col.header}
                  style={{ padding: "12px 16px", textAlign: col.align ?? "left", verticalAlign: "middle" }}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
