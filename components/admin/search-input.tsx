"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SearchInputProps = {
  placeholder?: string;
  paramKey?: string;
  debounceMs?: number;
};

/**
 * Uncontrolled-feeling search box: types locally, pushes a debounced router
 * update to `?q=...` (resetting `page` to 1), and lets the Server Component
 * page re-fetch. No client-side data fetching here — the URL is the state.
 */
export function SearchInput({ placeholder = "Search…", paramKey = "q", debounceMs = 350 }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramKey) ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setValue(searchParams.get(paramKey) ?? "");
    // Only re-sync from URL when the param actually changes externally (e.g. "clear filters").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get(paramKey)]);

  function handleChange(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set(paramKey, next);
      else params.delete(paramKey);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, debounceMs);
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: "10px 14px",
        border: "1px solid #E4E1DC",
        background: "#F6F4F1",
        fontFamily: "Archivo, sans-serif",
        fontSize: 13,
        outline: "none",
        minWidth: 240,
      }}
    />
  );
}
