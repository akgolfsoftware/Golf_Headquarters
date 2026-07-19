// Standardisert seksjonsheader (premium-pass): mono-nummer i muted + eyebrow i
// teal + H2 — identisk rytme på alle sider i micrositen.
export function SeksjonHeader({
  nr,
  eyebrow,
  tittel,
  ingress,
}: {
  nr: string;
  eyebrow: string;
  tittel: string;
  ingress?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3.5">
        <span
          className="text-sm font-medium"
          style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}
        >
          {nr}
        </span>
        <span
          className="text-[13px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--teal-600)" }}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        className="mt-3 text-[30px] font-bold leading-[1.06] sm:text-[38px]"
        style={{ color: "var(--ink)" }}
      >
        {tittel}
      </h2>
      {ingress ? (
        <p
          className="mt-3.5 max-w-2xl text-[17px] leading-relaxed"
          style={{ color: "var(--fg-2)" }}
        >
          {ingress}
        </p>
      ) : null}
    </div>
  );
}
