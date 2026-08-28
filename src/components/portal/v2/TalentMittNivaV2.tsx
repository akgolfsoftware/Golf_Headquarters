"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ · Talent · Mitt nivå — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { Kort, StatusPill, HjelpTips, RadarProfil, Icon } from "@/components/v2";
import type { TalentAkseKey } from "./TalentFellesV2";

/** Én rad i «Testresultater · CANON» — bygget fra TalentTracking.testNivaaer (T4-synken). */
export interface TalentTestNivaaRad {
  omraade: string;
  omraadeLabel: string;
  testNavn: string;
  sisteScore: number;
  /** ISO-dato. */
  sisteDato: string;
  antallTester: number;
  benchmarkLabel: string | null;
  trend: "opp" | "ned" | "flat" | null;
}

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export interface TalentMittNivaAkse {
  key: TalentAkseKey;
  label: string;
  /** Din verdi (1–10), null = ikke vurdert. */
  verdi: number | null;
  /** Kohort-snitt for samme akse (beregnet i page). */
  kohort: number | null;
}

export interface TalentMittNivaData {
  niva: string;
  kohortAntall: number;
  akser: TalentMittNivaAkse[];
  /** Testresultater fra CANON-batteriet, nyeste område først. Tom = ingen tester ennå. */
  testNivaaer: TalentTestNivaaRad[];
}

/* Kort tekstforklaring per akse (uendret copy fra legacy-skjermen). */
const AKSE_FORKLARING: Record<TalentAkseKey, string> = {
  fysisk:
    "Styrke, mobilitet, utholdenhet og klubbhastighet. Grunnlaget for distanse og skadefri trening.",
  teknikk:
    "Swing-mekanikk, kontakt, ballbane og repeterbarhet på alle køller — fra wedge til driver.",
  taktikk:
    "Beslutninger på banen: course management, vindtilpasning, valg av kølle og lekt risiko.",
  mental:
    "Pre-shot rutine, fokus under press, restitusjon mellom slag og evnen til å lukke en runde.",
  motivasjon:
    "Indre driv, treningsiver og evnen til å holde retning over måneder — ikke bare i gode uker.",
};

function fmt10(v: number | null): string {
  return v === null ? "—" : v.toFixed(1).replace(".", ",");
}

export function TalentMittNivaV2({ data }: { data: TalentMittNivaData }) {
  const harKohort = data.kohortAntall > 0;

  return (
    <div data-paper-wave-g="talentmittniva" data-paper-portal-talent-mitt-niva data-paper-slug="playerhq-talent" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode */}
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Mitt nivå</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Talent</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <StatusPill tone="lime">Nivå {data.niva}</StatusPill>
          <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute }}>
            {harKohort
              ? `Dine fem akser mot snittet for ${data.kohortAntall} andre spillere på ${data.niva}-nivå.`
              : `Ingen andre spillere på ${data.niva}-nivå ennå — radaren viser bare deg.`}
          </span>
        </div>
      </div>

      {/* Radar + legend */}
      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Deg mot snittet <HjelpTips k="talentVurdering" size={11} />
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RadarProfil
              akser={data.akser.map((a) => ({ label: a.label, verdi: a.verdi }))}
              sammenlign={harKohort ? data.akser.map((a) => a.kohort) : null}
              max={10}
              size={320}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden style={{ width: 18, height: 3, borderRadius: 2, background: TL.fill, flex: "none" }} />
              <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text }}>
                <strong style={{ fontWeight: 700 }}>Deg</strong> — siste evaluering
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                aria-hidden
                style={{ width: 18, height: 0, borderTop: `2px dashed ${TL.mute}`, flex: "none" }}
              />
              <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>
                <strong style={{ fontWeight: 700 }}>Kohort-snitt</strong> — {data.niva},{" "}
                {harKohort ? `${data.kohortAntall} spillere` : "ingen andre spillere ennå"}
              </span>
            </div>
            <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
              Akser hvor du ligger utenfor snittet er styrker. Akser hvor du ligger innenfor er
              typisk arbeidsområder for neste periode.
            </p>
          </div>
        </div>
      </Kort>

      {/* Akser i detalj */}
      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Akser i detalj <HjelpTips k="kohortSnitt" size={11} />
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
          {data.akser.map((a) => (
            <AkseDetalj key={a.key} akse={a} harKohort={harKohort} />
          ))}
        </div>
      </Kort>

      {/* Testresultater — CANON-batteriet (T4-synken), C4/Loop 8: første talent-skjerm som leser testNivaaer. */}
      {data.testNivaaer.length > 0 && (
        <Kort eyebrow="Testresultater · CANON">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.testNivaaer.map((r) => (
              <TestNivaaRad key={r.omraade} rad={r} />
            ))}
          </div>
        </Kort>
      )}
    </div>
  );
}

function fmtDato(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" }).format(d);
}

const TREND_IKON: Record<NonNullable<TalentTestNivaaRad["trend"]>, { navn: "trending-up" | "trending-down" | "minus"; farge: string }> = {
  opp: { navn: "trending-up", farge: TL.ok },
  ned: { navn: "trending-down", farge: TL.danger },
  flat: { navn: "minus", farge: TL.mute },
};

function TestNivaaRad({ rad }: { rad: TalentTestNivaaRad }) {
  const trendIkon = rad.trend ? TREND_IKON[rad.trend] : null;
  return (
    <div style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "12px 16px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{rad.omraadeLabel}</span>
        {trendIkon && <Icon name={trendIkon.navn} size={14} style={{ color: trendIkon.farge, flex: "none" }} />}
      </div>
      <p style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>
        {rad.testNavn} · {fmtDato(rad.sisteDato)} · {rad.antallTester} {rad.antallTester === 1 ? "test" : "tester"}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
        <span style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
          {fmt10(rad.sisteScore)}
        </span>
        {rad.benchmarkLabel && (
          <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute }}>{rad.benchmarkLabel}</span>
        )}
      </div>
    </div>
  );
}

function AkseDetalj({ akse, harKohort }: { akse: TalentMittNivaAkse; harKohort: boolean }) {
  const minPct = akse.verdi === null ? 0 : Math.max(0, Math.min(100, (akse.verdi / 10) * 100));
  const kohortPct =
    akse.kohort === null ? 0 : Math.max(0, Math.min(100, (akse.kohort / 10) * 100));

  return (
    <div style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{akse.label}</span>
        <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums", flex: "none" }}>
          {fmt10(akse.verdi)}
          {harKohort && <span> / {fmt10(akse.kohort)} snitt</span>}
        </span>
      </div>
      <p style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, lineHeight: 1.55, margin: "6px 0 0" }}>
        {AKSE_FORKLARING[akse.key]}
      </p>
      <div style={{ position: "relative", height: 7, borderRadius: 9999, background: TL.hair, marginTop: 12 }}>
        <div style={{ width: `${minPct}%`, height: "100%", borderRadius: 9999, background: TL.fill, opacity: 0.9 }} />
        {harKohort && (
          <span
            aria-hidden
            title={`Kohort-snitt: ${fmt10(akse.kohort)}`}
            style={{ position: "absolute", left: `${kohortPct}%`, top: -3, width: 2, height: 13, background: TL.text, borderRadius: 1 }}
          />
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
        <span style={{ fontFamily: TL.font.mono, fontSize: 8.5, color: TL.mute }}>0</span>
        <span style={{ fontFamily: TL.font.mono, fontSize: 8.5, color: TL.mute }}>10</span>
      </div>
    </div>
  );
}
