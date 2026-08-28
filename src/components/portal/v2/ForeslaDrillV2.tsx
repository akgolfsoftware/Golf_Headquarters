"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ · AI foreslår drills — v2 Presis + B-pakke (status + én vei per kort).
 * Tom = full grønn vei til tester. T.* only.
 */

import Link from "next/link";
import {
  T,
  Caps,
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
            background: TL.dim,
            border: `1px solid ${TL.hair}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: TL.font.mono,
            fontSize: 11,
            fontWeight: 700,
            color: TL.text,
            flex: "none",
          }}
        >
          {drill.rank}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <AkseChip a={tilAkseKey(drill.axis)} />
          <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 16, color: TL.text, marginTop: 7, letterSpacing: "-0.01em" }}>
            {drill.title}
          </div>
          {drill.meta.length > 0 && (
            <div style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute, marginTop: 5 }}>
              {drill.meta.join(" · ")}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flex: "none" }}>
          <span style={{ fontFamily: TL.font.mono, fontSize: 22, fontWeight: 700, color: drill.matchPct >= 80 ? TL.fill : TL.text, fontVariantNumeric: "tabular-nums" }}>
            {drill.matchPct}
            <span style={{ fontSize: 11, color: TL.mute }}> %</span>
          </span>
          <Caps size={8.5} style={{ marginTop: 2, textAlign: "right" }}>Match</Caps>
        </div>
      </div>

      <div style={{ marginTop: 12, borderRadius: 12, background: TL.dock, border: `1px solid ${TL.hair}`, padding: "10px 12px" }}>
        <Caps size={9} color={TL.fill}>Hvorfor denne</Caps>
        <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55, margin: "5px 0 0" }}>{drill.why}</p>
      </div>

      <div style={{ marginTop: 12 }}>
        <Link href={`/portal/drills/${drill.id}`} style={{ textDecoration: "none" }}>
          <CTAPill icon="arrow-right" full>Åpne drill</CTAPill>
        </Link>
      </div>
    </Kort>
  );
}

export function ForeslaDrillV2({ data }: { data: ForeslaDrillV2Data }) {
  const { analysedTestCount, suggestions } = data;
  return (
    <div data-paper-wave-g="foresladrill" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Foreslå drill</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Trening</span>
        </div>
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "10px 0 0", lineHeight: 1.55 }}>
            Matchet mot dine svakeste områder fra tester.
          </p>
        </div>
      </div>

      <InnsiktChip>
        {analysedTestCount > 0 ? (
          <>
            Analysert <span style={{ color: TL.text, fontWeight: 600 }}>{analysedTestCount} tester</span>
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
              <CTAPill icon="arrow-right" full>
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
              fontFamily: TL.font.sans,
              fontSize: 12,
              fontWeight: 600,
              color: TL.mute,
            }}
          >
            Se hele øvelsesbanken →
          </Link>
        </>
      )}
    </div>
  );
}
