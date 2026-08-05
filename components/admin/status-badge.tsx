const COLORS: Record<string, { bg: string; fg: string }> = {
  PUBLISHED: { bg: "#E8F0E6", fg: "#3A6B33" },
  DRAFT: { bg: "#F0EEE9", fg: "#6B6862" },
  ARCHIVED: { bg: "#F3E7E5", fg: "#8C4A3F" },
  NEW: { bg: "#E9E1D6", fg: "#8C6A45" },
  CONTACTED: { bg: "#E6ECF0", fg: "#33566B" },
  QUALIFIED: { bg: "#EAE6F3", fg: "#5B4A8C" },
  PROPOSAL_SENT: { bg: "#FBF1DF", fg: "#9C7A1E" },
  WON: { bg: "#E8F0E6", fg: "#3A6B33" },
  LOST: { bg: "#F3E7E5", fg: "#8C4A3F" },
  CLOSED: { bg: "#F0EEE9", fg: "#6B6862" },
};

export function StatusBadge({ value }: { value: string }) {
  const c = COLORS[value] ?? { bg: "#F0EEE9", fg: "#6B6862" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        background: c.bg,
        color: c.fg,
      }}
    >
      {value}
    </span>
  );
}
