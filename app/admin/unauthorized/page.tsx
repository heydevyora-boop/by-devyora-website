export default function UnauthorizedPage() {
  return (
    <div style={{ fontFamily: "Archivo, sans-serif" }}>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 12 }}>
        Not authorized
      </h1>
      <p style={{ color: "#6B6862", fontSize: 14, lineHeight: 1.6, maxWidth: "48ch" }}>
        Your account doesn&apos;t have access to this section. If you think this is a
        mistake, ask an admin to update your role.
      </p>
      <a href="/admin" style={{ fontSize: 12, color: "#8C6A45" }}>
        ← Back to dashboard
      </a>
    </div>
  );
}
