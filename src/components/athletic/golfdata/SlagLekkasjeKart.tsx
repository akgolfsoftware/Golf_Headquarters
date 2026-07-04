/**
 * AK Golf HQ — SlagLekkasjeKart
 * Heatmap over avstandsbånd (tee → innspill i meter → nærspill → putting i fot),
 * farget etter SG per runde mot NAVNGITT baseline. Hvert bånd er trykkbart (≥44px)
 * og åpner analytikerkjeden (→ DiagnoseKort: symptom→bevis→resept). Én kolonne —
 * lesbar og trykkbar på 390px. Tap/gevinst = --down/--up (aldri lime).
 * Datagrunnlag alltid synlig. Tomt = onboarding, aldri blank.
 */

export type LekkasjeBaand = {
  /** Stabil id — sendes tilbake i onVelgBaand. */
  id: string;
  /** Visningsnavn: «Tee-slag», «Innspill 150–100 m», «Putting 0–6 ft» (putting ALLTID i fot). */
  label: string;
  /** SG per runde for båndet (negativ = tap). Farger heat + tall via --down/--up. */
  sg: number;
  /** Antall slag i datagrunnlaget for båndet (vises under label). */
  slag?: number;
};

export type SlagLekkasjeKartProps = {
  /** Avstandsbåndene, øverst→nederst (tee → innspill → nærspill → putt). */
  baand: LekkasjeBaand[];
  /** Navngitt baseline — ALLTID vist. F.eks. "Broadie scratch" / "Kat. A-snitt". */
  baseline?: string;
  /** Datagrunnlag, f.eks. "14 runder" — vises i baseline-linjen. */
  grunnlag?: string;
  /** Dommen over kartet. Default «Hvor slagene forsvinner». */
  tittel?: string;
  /** Markert bånd (analytikerkjeden åpen for dette båndet). */
  valgtId?: string;
  /** Klikk på bånd → åpne analytikerkjeden (DiagnoseKort). Uten handler er radene ikke trykkbare. */
  onVelgBaand?: (baand: LekkasjeBaand) => void;
  /** Progressiv dybde — én kodevei: nybegynner (kun kart) · ovet (+antall/hint) · elite (+sum-linje). Default "ovet". */
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function fmtSg(sg: number | null | undefined): string {
  if (sg == null || Number.isNaN(sg)) return "—";
  if (Math.abs(sg) < 0.005) return "0,0";
  return (sg > 0 ? "+" : "−") + Math.abs(sg).toFixed(1).replace(".", ",");
}

/* Progressiv dybde — én kodevei (NesteFokusKort-mønsteret) */
const NIVA = {
  nybegynner: { visAntall: false, visHint: false, visSum: false },
  ovet:       { visAntall: true,  visHint: true,  visSum: false },
  elite:      { visAntall: true,  visHint: true,  visSum: true  },
};

export function SlagLekkasjeKart({
  baand = [],
  baseline = "Broadie scratch",
  grunnlag,
  tittel = "Hvor slagene forsvinner",
  valgtId,
  onVelgBaand,
  nivaa = "ovet",
  loading = false,
  tomt = false,
  className = "",
  style,
}: SlagLekkasjeKartProps) {
  if (loading) {
    return (
      <div className={`ak-slk ${className}`} style={style} aria-busy="true">
        <span className="ak-slk__eyebrow">Slaglekkasje</span>
        <div className="ak-slk__rows">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="ak-slk__skel" />)}</div>
      </div>
    );
  }
  if (tomt || baand.length === 0) {
    return (
      <div className={`ak-slk ${className}`} style={style} role="status">
        <span className="ak-slk__eyebrow">Slaglekkasje</span>
        <h3 className="ak-slk__tittel" style={{ color: "var(--text-2)" }}>Ingen slagdata ennå</h3>
        <p className="ak-slk__tomtekst">Logg runder med slag-for-slag-data, så viser kartet hvor du taper og vinner slag mot {baseline}.</p>
      </div>
    );
  }
  const N = NIVA[nivaa] || NIVA.ovet;
  const maks = Math.max(0.4, ...baand.map((b) => Math.abs(b.sg ?? 0)));
  const sum = baand.reduce((a, b) => a + (b.sg ?? 0), 0);
  return (
    <div className={`ak-slk ${className}`} style={style}>
      <div>
        <span className="ak-slk__eyebrow">Slaglekkasje</span>
        <h3 className="ak-slk__tittel">{tittel}</h3>
        <div className="ak-slk__base">SG per runde · mot {baseline}{grunnlag ? ` · ${grunnlag}` : ""}</div>
      </div>
      <div className="ak-slk__rows">
        {baand.map((b) => {
          const sg = b.sg ?? 0;
          const t = Math.min(1, Math.abs(sg) / maks);
          const noytral = Math.abs(sg) < 0.05;
          const heat = noytral
            ? "var(--surface-2)"
            : sg < 0
              ? `color-mix(in srgb, var(--down) ${Math.round(8 + t * 26)}%, transparent)`
              : `color-mix(in srgb, var(--up) ${Math.round(6 + t * 16)}%, transparent)`;
          return (
            <button
              key={b.id}
              type="button"
              className="ak-slk__rad"
              style={{ background: heat }}
              aria-pressed={valgtId === b.id}
              disabled={!onVelgBaand}
              onClick={onVelgBaand ? () => onVelgBaand(b) : undefined}
            >
              <span className="ak-slk__lbl">
                {b.label}
                {N.visAntall && b.slag != null && <span className="ak-slk__n">{b.slag} slag</span>}
              </span>
              <span className="ak-slk__sg" style={{ color: noytral ? "var(--text-muted)" : sg < 0 ? "var(--down)" : "var(--up)" }}>
                {fmtSg(sg)}
              </span>
            </button>
          );
        })}
      </div>
      <div className="ak-slk__foot">
        <span className="ak-slk__legend">
          <span className="ak-slk__leg"><span className="ak-slk__sw" style={{ background: "color-mix(in srgb, var(--down) 30%, transparent)" }} />tap</span>
          <span className="ak-slk__leg"><span className="ak-slk__sw" style={{ background: "color-mix(in srgb, var(--up) 20%, transparent)" }} />gevinst</span>
          {N.visSum && (
            <span className="ak-slk__leg" style={{ color: sum < 0 ? "var(--down)" : "var(--up)", fontWeight: 700 }}>
              Sum {fmtSg(sum)} slag/runde
            </span>
          )}
        </span>
        {N.visHint && onVelgBaand && <span className="ak-slk__hint">Trykk et bånd for analyse</span>}
      </div>
    </div>
  );
}
