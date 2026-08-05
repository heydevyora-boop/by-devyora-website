export const theme = {
  color: {
    bg: "#FFFFFF",
    ink: "#121110",
    accent: "#8C6A45",
    border: "#E4E1DC",
    borderStrong: "#121110",
    muted: "#6B6862",
    mutedBg: "#F6F4F1",
    subtleBg: "#E9E1D6",
    faint: "#A6A29B",
    dark: "#121110",
    onDark: "#FFFFFF",
    onDarkMuted: "#A6A29B",
  },
  font: {
    serif: "'Instrument Serif', serif",
    sans: "Archivo, system-ui, sans-serif",
  },
} as const;

export const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: theme.color.accent,
};

export const pagePadX = "clamp(20px, 5vw, 72px)";
