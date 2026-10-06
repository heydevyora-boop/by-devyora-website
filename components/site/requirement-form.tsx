import { theme } from "@/lib/theme";

/**
 * The "Bring your drawing to life" enquiry form.
 *
 * One implementation, shared by every material page (/materials/[slug]) and
 * every product page (/products/[slug]) — the fields, styling and submit
 * target are identical everywhere on purpose. Only the eyebrow and the
 * sentence under the heading change, so each page can name what it's about.
 *
 * `idPrefix` keeps the label/input id pairs unique per page.
 */
export function RequirementForm({
  eyebrow,
  description,
  idPrefix,
}: {
  eyebrow: string;
  description: string;
  idPrefix: string;
}) {
  const fieldWrapper = {
    borderTop: "1px solid rgba(255,255,255,0.25)",
  } as const;

  const labelStyle = {
    display: "block",
    paddingTop: 14,
    marginBottom: 7,
    fontSize: 9,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: theme.color.accent,
  } as const;

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 15,
    padding: "8px 0 18px",
  } as const;

  return (
    <section
      className="grid-stack-tablet"
      style={{
        marginTop: "clamp(60px, 8vw, 110px)",
        padding: "clamp(45px, 7vw, 85px) clamp(25px, 5vw, 70px)",
        background: theme.color.ink,
        color: "#FFFFFF",
        display: "grid",
        gridTemplateColumns: "minmax(260px, 0.8fr) minmax(320px, 1.2fr)",
        gap: "clamp(45px, 8vw, 120px)",
        alignItems: "start",
      }}
    >
      {/* FORM INTRODUCTION */}

      <div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: theme.color.accent,
            marginBottom: 24,
          }}
        >
          {eyebrow}
        </div>

        <h2
          style={{
            fontFamily: theme.font.serif,
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 68px)",
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
            margin: "0 0 28px",
          }}
        >
          Bring your
          <br />
          drawing to life.
        </h2>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.68)",
            maxWidth: "40ch",
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      {/* REQUIREMENT FORM */}

      <form
        action="/contact"
        method="GET"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {/* NAME */}

        <div style={fieldWrapper}>
          <label htmlFor={`${idPrefix}-name`} style={labelStyle}>
            Name
          </label>

          <input
            id={`${idPrefix}-name`}
            name="name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            required
            style={inputStyle}
          />
        </div>

        {/* EMAIL */}

        <div style={fieldWrapper}>
          <label htmlFor={`${idPrefix}-email`} style={labelStyle}>
            Email
          </label>

          <input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            style={inputStyle}
          />
        </div>

        {/* PHONE */}

        <div style={fieldWrapper}>
          <label htmlFor={`${idPrefix}-phone`} style={labelStyle}>
            Phone
          </label>

          <input
            id={`${idPrefix}-phone`}
            name="phone"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            autoComplete="tel"
            required
            style={inputStyle}
          />
        </div>

        {/* REQUIREMENTS */}

        <div
          style={{
            ...fieldWrapper,
            borderBottom: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <label htmlFor={`${idPrefix}-requirements`} style={labelStyle}>
            Project Requirements
          </label>

          <textarea
            id={`${idPrefix}-requirements`}
            name="requirements"
            placeholder="Tell us about your project, dimensions, quantity, design or requirements..."
            required
            rows={5}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        {/* SUBMIT */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            paddingTop: 28,
          }}
        >
          <button
            type="submit"
            style={{
              border: "none",
              background: "#FFFFFF",
              color: theme.color.ink,
              padding: "15px 28px",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Submit Requirement →
          </button>
        </div>
      </form>
    </section>
  );
}
