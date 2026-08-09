"use client";

/**
 * PlayerHQ · AI foreslår drills — v2 Presis + B-pakke (status + én vei per kort).
 * Tom = full grønn vei til tester. T.* only.
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  AkseChip,
  CTAPill,
  InnsiktChip,
  TomTilstand,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import type { AxisKind } from "@/lib/portal-ai/ai-data";

export type DrillSuggestion = {
  id: string;
  rank: number;
  axis: AxisKind;
  axisLabel: string;
  title: string;
  meta: string[];
  matchPct: number;
  why: string;
};

export type ForeslaDrillV2Data = {
  playerFirstName: string;
  analysedTestCount: number;
  suggestions: DrillSuggestion[];
};

/** AxisKind (små bokstaver, datalag) → AkseKey (pyramide-nøkkel). */
function tilAkseKey(a: AxisKind): AkseKey {
  return a.toUpperCase() as AkseKey;
}

function ForslagKort({ drill }: { drill: DrillSuggestion }) {
  return (
    <Kort hover style={{ borderLeft: `3px solid ${T.ax[tilAkseKey(drill.axis)]}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 9999,
            background: T.panel3,
            border: `1px solid ${T.borderS}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: T.mono,
            fontSize: 11,
            fontWeight: 700,
            color: T.fg,
            flex: "none",
          }}
        >
          {drill.rank}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <AkseChip a={tilAkseKey(drill.axis)} />
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginTop: 7, letterSpacing: "-0.01em" }}>
            {drill.title}
          </div>
          {drill.meta.length > 0 && (
            <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, marginTop: 5 }}>
              {drill.meta.join(" · ")}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flex: "none" }}>
          <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: drill.matchPct >= 80 ? T.lime : T.fg, fontVariantNumeric: "tabular-nums" }}>
            {drill.matchPct}
            <span style={{ fontSize: 11, color: T.mut }}> %</span>
          </span>
          <Caps size={8.5} style={{ marginTop: 2, textAlign: "right" }}>Match</Caps>
        </div>
      </div>

      <div style={{ marginTop: 12, borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}`, padding: "10px 12px" }}>
        <Caps size={9} color={T.handling}>Hvorfor denne</Caps>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: "5px 0 0" }}>{drill.why}</p>
      </div>

      <div style={{ marginTop: 12 }}>
        <Link href={`/portal/drills/${drill.id}`} style={{ textDecoration: "none" }}>
          <CTAPill icon="arrow-right" full enTing>Åpne drill</CTAPill>
        </Link>
      </div>
    </Kort>
  );
}

export function ForeslaDrillV2({ data }: { data: ForeslaDrillV2Data }) {
  const { playerFirstName, analysedTestCount, suggestions } = data;
  return (
    <div data-paper-wave-g="foresladrill" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Foreslå drill</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>Trening</span>
        </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: "10px 0 0", lineHeight: 1.55 }}>
            Matchet mot dine svakeste områder fra tester.
          </p>
        </div>
      </div>

      <InnsiktChip>
        {analysedTestCount > 0 ? (
          <>
            Analysert <span style={{ color: T.fg, fontWeight: 600 }}>{analysedTestCount} tester</span>
            {suggestions.length > 0 ? ` · ${suggestions.length} forslag` : ""}.
          </>
        ) : (
          "Ingen testdata å analysere ennå."
        )}
      </InnsiktChip>

      {suggestions.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="target"
            title="Ingen drill-forslag"
            sub="Enten mangler testdata, eller øvelsesbanken er tom (ingen oppspinnede drills). Ta tester når banken har godkjente øvelser."
          />
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/tren/tester" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill icon="arrow-right" full enTing>
                Gå til tester
              </CTAPill>
            </Link>
          </div>
        </Kort>
      ) : (
        <>
          {suggestions.map((d) => (
            <ForslagKort key={d.id} drill={d} />
          ))}
          <Link
            href="/portal/drills"
            style={{
              textDecoration: "none",
              alignSelf: "center",
              fontFamily: T.ui,
              fontSize: 12,
              fontWeight: 600,
              color: T.mut,
            }}
          >
            Se hele øvelsesbanken →
          </Link>
        </>
      )}
    </div>
  );
}
