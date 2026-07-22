"use client";

/**
 * PlayerHQ · Talent · Mitt nivå — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { T, Caps, Tittel, Kort, StatusPill, HjelpTips, RadarProfil } from "@/components/v2";
import type { TalentAkseKey } from "./TalentFellesV2";

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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Talent · Mitt nivå</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="nivå">Mitt</Tittel>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <StatusPill tone="lime">Nivå {data.niva}</StatusPill>
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
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
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap, alignItems: "center" }}>
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
              <span aria-hidden style={{ width: 18, height: 3, borderRadius: 2, background: T.lime, flex: "none" }} />
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>
                <strong style={{ fontWeight: 700 }}>Deg</strong> — siste evaluering
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                aria-hidden
                style={{ width: 18, height: 0, borderTop: `2px dashed ${T.fg2}`, flex: "none" }}
              />
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
                <strong style={{ fontWeight: 700 }}>Kohort-snitt</strong> — {data.niva},{" "}
                {harKohort ? `${data.kohortAntall} spillere` : "ingen andre spillere ennå"}
              </span>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: 0 }}>
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
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap }}>
          {data.akser.map((a) => (
            <AkseDetalj key={a.key} akse={a} harKohort={harKohort} />
          ))}
        </div>
      </Kort>
    </div>
  );
}

function AkseDetalj({ akse, harKohort }: { akse: TalentMittNivaAkse; harKohort: boolean }) {
  const minPct = akse.verdi === null ? 0 : Math.max(0, Math.min(100, (akse.verdi / 10) * 100));
  const kohortPct =
    akse.kohort === null ? 0 : Math.max(0, Math.min(100, (akse.kohort / 10) * 100));

  return (
    <div style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: T.rRow, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{akse.label}</span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, fontVariantNumeric: "tabular-nums", flex: "none" }}>
          {fmt10(akse.verdi)}
          {harKohort && <span> / {fmt10(akse.kohort)} snitt</span>}
        </span>
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: "6px 0 0" }}>
        {AKSE_FORKLARING[akse.key]}
      </p>
      <div style={{ position: "relative", height: 7, borderRadius: 9999, background: T.track, marginTop: 12 }}>
        <div style={{ width: `${minPct}%`, height: "100%", borderRadius: 9999, background: T.lime, opacity: 0.9 }} />
        {harKohort && (
          <span
            aria-hidden
            title={`Kohort-snitt: ${fmt10(akse.kohort)}`}
            style={{ position: "absolute", left: `${kohortPct}%`, top: -3, width: 2, height: 13, background: T.fg, borderRadius: 1 }}
          />
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
        <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>0</span>
        <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>10</span>
      </div>
    </div>
  );
}
