/** Shape every admin list page reads from `searchParams`. */
export type ListSearchParams = Record<string, string | string[] | undefined>;

export function toSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Builds an href that preserves existing query params while overriding the given ones. */
export function buildQueryString(
  current: ListSearchParams,
  overrides: Record<string, string | number | undefined>
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    const v = toSingle(value);
    if (v !== undefined) params.set(key, v);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
