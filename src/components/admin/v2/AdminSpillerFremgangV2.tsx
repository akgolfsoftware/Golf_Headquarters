"use client";

/**
 * AgencyOS Spiller-fremgang — v2 (retning C «Presis»). Rekomponerer den ekte
 * skjermen src/app/admin/spillere/[id]/fremgang/page.tsx i v2-idiomet, men med
 * IDENTISK funksjon + datakontrakt: spillerens utvikling siste 8 uker —
 *   1) SG per område over tid (ukesnitt → trendkurve per akse),
 *   2) treningsvolum per uke (ukestotal-trend + fordeling per område),
 *   3) korrelasjon trening ↔ SG-fremgang (Pearson r + klarspråk-tolkning).
 *
 * Bygget utelukkende av v2-komponentbiblioteket (src/components/v2) — ingen
 * ad-hoc visualiseringer, ingen rå hex (kun T.*). Ærlige tomrom: områder/uker
 * uten datapunkter utelates eller får tom-tilstand, aldri fabrikerte tall.
 * Anbefalinger er klarspråk, aldri sperre.
 */

import { T, fmtSg } from "@/lib/v2/tokens";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  Trend,
  DeltaChip,
  FordelingRad,
  InnsiktChip,
  TomTilstand,
} from "@/components/v2";

// ── Datakontrakt (mappes fra den ekte loaderen i ruten) ─────────
export interface FremgangV2Omrade {
  /** SG-kode (OTT/APP/ARG/PUTT). */
  kode: string;
  /** Norsk områdenavn (ordbok: ARG = Nærspill). */
  label: string;
  /** Ukesnitt-SG eldst → nyest (ekte målepunkter). */
  serie: number[];
  /** Kort ukelabel per punkt (f.eks. «W23»). */
  ukeLabels: string[];
  /** Siste ukesnitt-SG. */
  siste: number;
  /** Endring fra forrige uke. null = bare én måling. */
  trend: number | null;
}
export interface FremgangV2VolumUke {
  uke: string;
  total: number;
}
export interface FremgangV2VolumOmrade {
  kode: string;
  label: string;
  minutter: number;
}
export type FremgangV2Tolkning = "positiv" | "negativ" | "ingen" | "for_lite_data";
export interface FremgangV2Korrelasjon {
  kode: string;
  label: string;
  r: number | null;
  datapunkter: number;
  tolkning: FremgangV2Tolkning;
}
export interface FremgangV2Data {
  navn: string;
  uker: number;
  harRunder: boolean;
  /** Områder med minst ett SG-datapunkt. */
  omrader: FremgangV2Omrade[];
  /** Ukestotal treningsminutter, sortert eldst → nyest. */
  volumUker: FremgangV2VolumUke[];
  /** Sum treningsminutter per område i perioden (kun > 0). */
  volumOmrader: FremgangV2VolumOmrade[];
  volumTotal: number;
  /** Alle fire områder (også de med for lite data). */
  korrelasjon: FremgangV2Korrelasjon[];
}

/** r-formatering: fortegn + komma-desimal, 2 desimaler (aldri rå punktum-float). */
function fmtR(r: number): string {
  return (r > 0 ? "+" : r < 0 ? "−" : "") + Math.abs(r).toFixed(2).replace(".", ",");
}

const TOLK_TEKST: Record<FremgangV2Tolkning, string> = {
  positiv: "Trening hjelper",
  negativ: "Sjekk metode",
  ingen: "Ingen klar sammenheng",
  for_lite_data: "For lite data",
};

function tolkFarge(t: FremgangV2Tolkning): string {
  return t === "positiv" ? T.up : t === "negativ" ? T.down : T.mut;
}

/** Mini-trendkurve per område med padded y-akse (Trend tåler ikke flat serie). */
function OmradeTrend({ o }: { o: FremgangV2Omrade }) {
  const lo = Math.min(...o.serie);
  const hi = Math.max(...o.serie);
  const pad = Math.max(0.5, (hi - lo) * 0.15);
  const visDelta = o.trend != null && Math.abs(o.trend) >= 0.05;
  return (
    <div
      style={{
        background: T.panel2,
        border: `1px solid ${T.border}`,
        borderRadius: T.rRow,
        padding: "13px 15px",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg2 }}>{o.label}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 15,
              fontWeight: 700,
              color: o.siste >= 0 ? T.up : T.down,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmtSg(o.siste)}
          </span>
          {visDelta && <DeltaChip v={fmtSg(o.trend as number)} dir={(o.trend as number) < 0 ? "down" : "up"} />}
        </span>
      </div>
      <div style={{ marginTop: 10 }}>
        {o.serie.length >= 2 ? (
          <Trend series={o.serie} height={52} yMin={lo - pad} yMax={hi + pad} baseline={0} fmt={fmtSg} />
        ) : (
          <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>Bare én måling — trenger to for en kurve.</span>
        )}
      </div>
    </div>
  );
}

export function AdminSpillerFremgangV2({ data }: { data: FremgangV2Data }) {
  const { navn, uker, harRunder, omrader, volumUker, volumOmrader, volumTotal, korrelasjon } = data;

  // Navn med kursiv lime-aksent på etternavn (v2-tittelidiom).
  const deler = navn.trim().split(" ");
  const em = deler.length > 1 ? deler.pop() : undefined;
  const fornavn = deler.join(" ");

  // Datadrevet innsikt: svakeste område nå (aldri fabrikert, aldri sperre).
  const svakest = omrader.length ? omrader.reduce((a, b) => (b.siste < a.siste ? b : a)) : null;

  const periode = `Siste ${uker} uker`;

  // ── Hode ────────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Fremgang</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em={em}>{em ? `${fornavn} ` : navn}</Tittel>
        </div>
      </div>
      <div className="hidden md:block">
        <Caps size={9}>{periode}</Caps>
      </div>
    </div>
  );

  // ── 1) SG per område over tid ───────────────────────────────────
  const sgKort = (
    <Kort eyebrow="SG per område" action={<Caps size={9}>{periode}</Caps>}>
      {!harRunder || omrader.length === 0 ? (
        <TomTilstand
          icon="trending-up"
          title="Ingen runder registrert"
          sub="Logg runder med Strokes Gained for å se utviklingen per område."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 10 }}>
          {omrader.map((o) => (
            <OmradeTrend key={o.kode} o={o} />
          ))}
        </div>
      )}
    </Kort>
  );

  // ── 2) Treningsvolum per uke ────────────────────────────────────
  const volTotaler = volumUker.map((v) => v.total);
  const volMaks = volTotaler.length ? Math.max(...volTotaler) : 0;
  const volumKort = (
    <Kort eyebrow="Treningsvolum per uke" action={<Caps size={9}>{periode}</Caps>}>
      {volumUker.length === 0 ? (
        <TomTilstand icon="dumbbell" title="Ingen treningslogg" sub="Ingen registrert trening i perioden." />
      ) : (
        <>
          {volumUker.length >= 2 ? (
            <Trend
              series={volTotaler}
              height={76}
              yMin={0}
              yMax={(volMaks || 1) * 1.15}
              baseline={null}
              fmt={(v) => `${Math.round(v)}`}
              xLabels={volumUker.map((v) => v.uke)}
            />
          ) : (
            <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
              {volumUker[0].total} min <span style={{ color: T.mut, fontWeight: 400 }}>· {volumUker[0].uke}</span>
            </span>
          )}
          {volumOmrader.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Caps size={9}>Fordeling per område</Caps>
              <div style={{ marginTop: 6 }}>
                {volumOmrader.map((v, i) => (
                  <FordelingRad
                    key={v.kode}
                    label={v.label}
                    pct={volumTotal > 0 ? (v.minutter / volumTotal) * 100 : 0}
                    value={`${v.minutter} min`}
                    last={i === volumOmrader.length - 1}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Kort>
  );

  // ── 3) Trening vs SG-fremgang (korrelasjon) ─────────────────────
  const korrKort = (
    <Kort eyebrow="Trening vs SG-fremgang" action={<Caps size={9}>Pearson r</Caps>}>
      {korrelasjon.map((k, i) => (
        <Rad
          key={k.kode}
          leading={
            <span
              style={{
                width: 46,
                flex: "none",
                fontFamily: T.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: T.fg2,
              }}
            >
              {k.kode}
            </span>
          }
          title={k.label}
          sub={`${k.datapunkter} datapunkter`}
          meta={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.fg,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {k.r !== null ? fmtR(k.r) : "—"}
              </span>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: tolkFarge(k.tolkning),
                  background:
                    k.tolkning === "positiv" || k.tolkning === "negativ"
                      ? `color-mix(in srgb,${tolkFarge(k.tolkning)} 12%,transparent)`
                      : "transparent",
                  borderRadius: 5,
                  padding: "3px 7px",
                  whiteSpace: "nowrap",
                }}
              >
                {TOLK_TEKST[k.tolkning]}
              </span>
            </span>
          }
          trailing={null}
          last={i === korrelasjon.length - 1}
        />
      ))}
    </Kort>
  );

  const innsikt = svakest ? (
    <InnsiktChip>
      {svakest.label} er svakeste område nå (SG {fmtSg(svakest.siste)}) — legg vekt der i planleggingen.
    </InnsiktChip>
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {sgKort}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
        {volumKort}
        {korrKort}
      </div>
      {innsikt}
    </div>
  );
}
