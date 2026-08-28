"use client";

/**
 * AgencyOS Spiller-fremgang — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * SG · volum · korrelasjon. T.* only.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { fmtSg } from "@/lib/v2/tokens";
import { Caps, Kort, Rad, Trend, DeltaChip, FordelingRad, InnsiktChip, TomTilstand, StatusPill, CTAPill, TilbakeLenke } from "@/components/v2";
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
  /** Spillerens bruker-id — for tilbake-lenke til profilen. */
  spillerId: string;
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
  return t === "positiv" ? TL.ok : t === "negativ" ? TL.danger : TL.mute;
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
        background: TL.dock,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.row,
        padding: "13px 15px",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.mute }}>{o.label}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: TL.font.mono,
              fontSize: 15,
              fontWeight: 700,
              color: o.siste >= 0 ? TL.ok : TL.danger,
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
          <span style={{ fontFamily: TL.font.mono, fontSize: 9.5, color: TL.mute }}>Bare én måling — trenger to for en kurve.</span>
        )}
      </div>
    </div>
  );
}

export function AdminSpillerFremgangV2({ data }: { data: FremgangV2Data }) {
  const { navn, spillerId, uker, harRunder, omrader, volumUker, volumOmrader, volumTotal, korrelasjon } = data;

  // Datadrevet innsikt: svakeste område nå (aldri fabrikert, aldri sperre).
  const svakest = omrader.length ? omrader.reduce((a, b) => (b.siste < a.siste ? b : a)) : null;

  const periode = `Siste ${uker} uker`;

  // ── Hode — B: status ───────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <TilbakeLenke href={`/admin/spillere/${spillerId}`}>Tilbake til {navn}</TilbakeLenke>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Fremgang</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Spiller</span>
        </div>
          <Caps size={9} style={{ display: "block", marginTop: 6 }}>{periode}</Caps>
        </div>
        <StatusPill tone={harRunder ? "lime" : "warn"}>
          {harRunder ? "Har data" : "Mangler runder"}
        </StatusPill>
      </div>
    </div>
  );

  const primaerCta = (
    <Link href={`/admin/spillere/${spillerId}/plan`} style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="layout-dashboard" full>
        Åpne plan i Workbench
      </CTAPill>
    </Link>
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
            <span style={{ fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
              {volumUker[0].total} min <span style={{ color: TL.mute, fontWeight: 400 }}>· {volumUker[0].uke}</span>
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
                fontFamily: TL.font.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: TL.mute,
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
                  fontFamily: TL.font.mono,
                  fontSize: 13,
                  fontWeight: 700,
                  color: TL.text,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {k.r !== null ? fmtR(k.r) : "—"}
              </span>
              <span
                style={{
                  fontFamily: TL.font.mono,
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
    <div data-paper-wave-h="spiller-fremgang" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      {hode}
      {primaerCta}
      {sgKort}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16, alignItems: "start" }}>
        {volumKort}
        {korrKort}
      </div>
      {innsikt}
    </div>
  );
}
