/**
 * AK Golf HQ — DiagnoseKort
 * Analytikerkjeden i ett kort: SYMPTOM (dommen i klarspråk) → BEVIS (mini-viz:
 * deg mot navngitt baseline + datagrunnlag ALLTID synlig) → RESEPT (AK-formel-akse
 * + «Planlegg dette»). Kjede-rail binder stegene. Tap = --down (aldri lime);
 * akse-chip bruker --axis-*-soft/-text — lys-trygg (aldri lime-tekst på lys).
 */

export type DiagnoseBevis = {
  /** Enhet vist etter verdiene, f.eks. "%" eller "slag". */
  enhet?: string;
  /** Spillerens verdi, f.eks. { label: "Deg", verdi: 52 }. */
  spiller: { label: string; verdi: number | string };
  /** Navngitt baseline, f.eks. { label: "Kat. A-snitt", verdi: 68 }. */
  baseline: { label: string; verdi: number | string };
};

export type DiagnoseResept = {
  /** Pyramide-akse (KANONISK 5) — farger chip via --axis-*-soft/-text. */
  akse: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  /** Valgfri arena-/CS-kode i chip, f.eks. "M2" eller "CS90". */
  kode?: string;
  /** Resepten i klarspråk, f.eks. «Kravtrening på innspill 100–150 m — tre økter per uke.» */
  tekst?: string;
};

export type DiagnoseKortProps = {
  /** Symptomet i klarspråk (helten), f.eks. «Mister 0,8 slag på innspill 100–150 m». */
  symptom?: string;
  /** Mini-viz: deg mot navngitt baseline (to barer + verdier). */
  bevis?: DiagnoseBevis;
  /** Datagrunnlag — ALLTID synlig. F.eks. "14 runder · 62 innspill". Mangler det, vises det ærlig. */
  grunnlag?: string;
  /** AK-formel-akse + klarspråk-resept. */
  resept?: DiagnoseResept;
  /** CTA-tekst. Default «Planlegg dette». */
  ctaTekst?: string;
  /** Primærhandling — uten den vises ingen CTA. */
  onPlanlegg?: () => void;
  /** Progressiv dybde — én kodevei: nybegynner (symptom+resept) · ovet (+bevis-viz) · elite (+fagkode-chip). Default "ovet". */
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/* Pyramide-aksene (KANONISK 5) → css-var-suffiks */
const AKSER: Record<DiagnoseResept["akse"], string> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

/* Progressiv dybde — én kodevei (NesteFokusKort-mønsteret). Fagkode kun elite. */
const NIVA = {
  nybegynner: { visBevis: false, visKode: false },
  ovet:       { visBevis: true,  visKode: false },
  elite:      { visBevis: true,  visKode: true  },
};

function fmtV(v: number | string | null | undefined): string {
  if (v == null) return "—";
  return String(v).replace(".", ",");
}

function Steg({ lbl, siste, children }: { lbl: string; siste?: boolean; children: React.ReactNode }) {
  return (
    <div className={`ak-dgk__steg${siste ? " ak-dgk__steg--siste" : ""}`}>
      <span className="ak-dgk__rail" aria-hidden="true">
        <span className="ak-dgk__dot" />
        {!siste && <span className="ak-dgk__strek" />}
      </span>
      <div className="ak-dgk__body">
        <span className="ak-dgk__lbl">{lbl}</span>
        {children}
      </div>
    </div>
  );
}

export function DiagnoseKort({
  symptom,
  bevis,
  grunnlag,
  resept,
  ctaTekst = "Planlegg dette",
  onPlanlegg,
  nivaa = "ovet",
  loading = false,
  tomt = false,
  className = "",
  style,
}: DiagnoseKortProps) {
  if (loading) {
    return (
      <div className={`ak-dgk ${className}`} style={style} aria-busy="true">
        <span className="ak-dgk__eyebrow">Diagnose</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="ak-dgk__skel" style={{ width: "72%" }} />
          <div className="ak-dgk__skel" style={{ width: "100%" }} />
          <div className="ak-dgk__skel" style={{ width: "54%" }} />
        </div>
      </div>
    );
  }
  if (tomt || !symptom) {
    return (
      <div className={`ak-dgk ${className}`} style={style} role="status">
        <span className="ak-dgk__eyebrow">Diagnose</span>
        <h3 className="ak-dgk__symptom" style={{ color: "var(--text-2)" }}>Ingen diagnose ennå</h3>
        <p className="ak-dgk__tomtekst" style={{ marginTop: 8 }}>
          Diagnoser settes når det er nok runder til å skille mønster fra støy — logg 3–5 runder til.
        </p>
      </div>
    );
  }

  const N = NIVA[nivaa] || NIVA.ovet;
  const sp = bevis?.spiller;
  const bl = bevis?.baseline;
  const maksRef = Math.max(Number(sp?.verdi) || 0, Number(bl?.verdi) || 0) * 1.08 || 1;
  const akseKey = resept?.akse ? AKSER[resept.akse] : null;

  return (
    <div className={`ak-dgk ${className}`} style={style}>
      <span className="ak-dgk__eyebrow">Diagnose</span>

      <Steg lbl="Symptom">
        <h3 className="ak-dgk__symptom">{symptom}</h3>
      </Steg>

      <Steg lbl="Bevis">
        {N.visBevis && sp && bl && (
          <div className="ak-dgk__bars">
            {[{ d: sp, fyll: "color-mix(in srgb, var(--down) 62%, transparent)" },
              { d: bl, fyll: "var(--border-strong)" }].map(({ d, fyll }, i) => (
              <div key={i} className="ak-dgk__brad">
                <span className="ak-dgk__bnavn">{d.label}</span>
                <span className="ak-dgk__btrack">
                  <span className="ak-dgk__bfyll" style={{ width: `${Math.min(100, (Number(d.verdi) / maksRef) * 100)}%`, background: fyll }} />
                </span>
                <span className="ak-dgk__bverdi">{fmtV(d.verdi)}{bevis?.enhet ? ` ${bevis.enhet}` : ""}</span>
              </div>
            ))}
          </div>
        )}
        {/* Datagrunnlag ALLTID synlig — mangler det, sies det ærlig */}
        <span className="ak-dgk__grunnlag">{grunnlag || "Datagrunnlag mangler — diagnosen er usikker"}</span>
      </Steg>

      <Steg lbl="Resept" siste>
        {resept?.tekst && <p className="ak-dgk__rtekst">{resept.tekst}</p>}
        <div className="ak-dgk__rrad">
          {onPlanlegg && <button type="button" className="ak-dgk__cta" onClick={onPlanlegg}>{ctaTekst}</button>}
          {N.visKode && akseKey && resept && (
            <span className="ak-dgk__chip" style={{ background: `var(--axis-${akseKey}-soft)`, color: `var(--axis-${akseKey}-text)` }}>
              {resept.akse}{resept.kode ? ` · ${resept.kode}` : ""}
            </span>
          )}
        </div>
      </Steg>
    </div>
  );
}
