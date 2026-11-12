/**
 * Renders one JSON-LD <script> tag. Safe against script-injection via the
 * data itself: JSON.stringify never produces a literal "</script>" sequence
 * unless a string value contains it verbatim, so we escape that one
 * character sequence defensively before injecting.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
