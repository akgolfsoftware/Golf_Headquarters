/**
 * <Stat> — pull-out statistikk-komponent for MDX-artikler.
 * Viser ett stort mono-tall med label under.
 *
 * Bruk i .mdx: <Stat verdi="82%" label="PGA Tour-putter fra 3m som går inn" />
 */

type StatProps = {
  verdi: string;
  label: string;
  sublabel?: string;
};

export function Stat({ verdi, label, sublabel }: StatProps) {
  return (
    <div
      style={{
        background: "var(--s-card, var(--card))",
        border: "1px solid var(--s-border, var(--border))",
        borderRadius: "var(--s-r-lg, 1rem)",
        padding: "2rem",
        margin: "2rem 0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(56px, 8vw, 88px)",
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: "var(--s-primary, var(--primary))",
        }}
      >
        {verdi}
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 500,
          marginTop: "0.75rem",
          color: "var(--s-fg, var(--foreground))",
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>
      {sublabel && (
        <div
          style={{
            fontSize: 14,
            marginTop: "0.35rem",
            color: "var(--s-muted-fg, var(--muted-foreground))",
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}
