import Link from "next/link";

export type LiveLoopSteg = "for" | "under" | "etter";

/** FØR → UNDER → ETTER for PH-07. Samme lenker som før, Precision-natt. */
export function LiveLoopNav({
  aktiv,
  sessionId,
}: {
  aktiv: LiveLoopSteg;
  sessionId?: string;
}) {
  const base = sessionId ? `/portal/live/${sessionId}` : null;
  const steg: Array<{ id: LiveLoopSteg; label: string; sub: string; href: string | null }> = [
    { id: "for", label: "Før", sub: "planlegg", href: base ? `${base}/brief` : null },
    { id: "under", label: "Under", sub: "live-økt", href: base ? `${base}/active` : null },
    { id: "etter", label: "Etter", sub: "oppsummer", href: base ? `${base}/summary` : null },
  ];

  return (
    <nav aria-label="Sløyfen før, under og etter økta" className="ph07-loop">
      {steg.map((s) => {
        const on = s.id === aktiv;
        const inner = (
          <span className="ph07-loop-steg" aria-current={on ? "step" : undefined}>
            <span>{s.label}</span>
            <small>{s.sub}</small>
          </span>
        );
        return s.href && !on ? (
          <Link key={s.id} href={s.href} data-od-id={`loop-${s.id}`}>{inner}</Link>
        ) : (
          <span key={s.id} data-od-id={`loop-${s.id}`}>{inner}</span>
        );
      })}
    </nav>
  );
}
