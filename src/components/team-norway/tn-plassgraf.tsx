import { TN } from "@/lib/v2/team-norway";

export type TnPlassSerie = { navn: string; punkter: { aar: number; plass: number }[] };

/** Fast rekkefølge: farge og strek skiller seriene, så de kan leses uten å se farge. */
const STIL = [
  { farge: TN.navy900, strek: undefined, tegn: "—" },
  { farge: TN.red600, strek: "6 4", tegn: "- -" },
  { farge: "var(--tn-akse-fys)", strek: "2 3", tegn: "···" },
  { farge: "var(--tn-akse-slag)", strek: "10 3 2 3", tegn: "-·-" },
] as const;

const rund = (n: number) => Math.round(n * 100) / 100;
const heltall = new Intl.NumberFormat("nb-NO");

/**
 * WAGR-plass år for år for inntil fire spillere (wireframe Referanse, «WAGR-plass år for år»).
 * Bedre plass står høyere. Ingen tekst inne i SVG-en, så grafen skalerer uten å forvrenge tall.
 */
export function TnPlassgraf({ serier, etikett }: { serier: TnPlassSerie[]; etikett: string }) {
  const alle = serier.flatMap((s) => s.punkter);
  const aar = [...new Set(alle.map((p) => p.aar))].sort((a, b) => a - b);
  if (aar.length < 2) return <p style={{ margin: 0, fontSize: 14.5, color: TN.ink500 }}>For få år med WAGR-plass til en graf ennå.</p>;
  const min = Math.min(...alle.map((p) => p.plass));
  const maks = Math.max(...alle.map((p) => p.plass));
  const spenn = maks - min || 1;
  const x = (a: number) => 4 + ((a - aar[0]!) / (aar.at(-1)! - aar[0]!)) * 92;
  const y = (plass: number) => 8 + ((plass - min) / spenn) * 84;
  return (
    <figure style={{ margin: 0, display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: TN.font.mono, fontSize: 12, color: TN.ink500, textAlign: "right" }}>
          <span>{heltall.format(min)}</span>
          <span>{heltall.format(maks)}</span>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={etikett} style={{ width: "100%", height: 200, display: "block", background: TN.ink50, borderRadius: TN.radius.md }}>
          {serier.map((s, i) => {
            const stil = STIL[i % STIL.length]!;
            const pkt = [...s.punkter].sort((a, b) => a.aar - b.aar);
            return (
              <g key={s.navn}>
                <polyline points={pkt.map((p) => `${rund(x(p.aar))},${rund(y(p.plass))}`).join(" ")} fill="none" stroke={stil.farge} strokeWidth={2} strokeDasharray={stil.strek} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, paddingLeft: 48, fontFamily: TN.font.mono, fontSize: 12, color: TN.ink500 }}>
        {aar.map((a) => <span key={a}>{a}</span>)}
      </div>
      <figcaption style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 13, color: TN.ink700 }}>
        {serier.map((s, i) => {
          const stil = STIL[i % STIL.length]!;
          return (
            <span key={s.navn} style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0, overflowWrap: "anywhere" }}>
              <span aria-hidden="true" style={{ fontFamily: TN.font.mono, fontWeight: 700, color: stil.farge }}>{stil.tegn}</span>
              {s.navn}
            </span>
          );
        })}
      </figcaption>
    </figure>
  );
}
