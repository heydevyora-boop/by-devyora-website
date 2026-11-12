"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Option = { label: string; value: string };

type FilterSelectProps = {
  paramKey: string;
  options: Option[];
  placeholder: string;
};

/** Same "URL is the state" pattern as SearchInput — no local fetching. */
export function FilterSelect({ paramKey, options, placeholder }: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramKey) ?? "";

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(paramKey, next);
    else params.delete(paramKey);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      style={{
        padding: "10px 14px",
        border: "1px solid #E4E1DC",
        background: "#F6F4F1",
        fontFamily: "Archivo, sans-serif",
        fontSize: 13,
        outline: "none",
        color: value ? "#121110" : "#6B6862",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
