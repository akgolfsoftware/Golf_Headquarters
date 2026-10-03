import Link from "next/link";
import { Target } from "lucide-react";
import { AkseMerke, StatusPille, TomTilstand } from "@/components/precision/pa";
import type { AxisKind } from "@/lib/portal-ai/ai-data";

/**
 * PlayerHQ · AI foreslår drills.
 * Tom = vei til tester. Match-tallet kommer ferdig regnet fra siden.
 */

export type DrillSuggestion = {
  id: string;
  rank: number;
  axis: AxisKind;
  axisLabel: string;
  title: string;
  meta: string[];
  matchPct: number;
  why: string;
  href?: string;
};

export type ForeslaDrillV2Data = {
  playerFirstName: string;
  analysedTestCount: number;
  suggestions: DrillSuggestion[];
};

export function ForeslaDrillV2({ data }: { data: ForeslaDrillV2Data }) {
  const { analysedTestCount, suggestions } = data;
  return (
    <div className="ph-flate">
      <header>
        <p>Trening</p>
        <h1>Foreslå drill</h1>
        <p>Matchet mot dine svakeste områder fra tester.</p>
      </header>

      <section className="pa-card ph-kort">
        <p>Grunnlag</p>
        <strong>
          {analysedTestCount > 0
            ? `Analysert ${analysedTestCount} tester${suggestions.length > 0 ? ` · ${suggestions.length} forslag` : ""}.`
            : "Ingen testdata å analysere ennå."}
        </strong>
      </section>

      {suggestions.length === 0 ? (
        <section className="pa-card ph-kort">
          <TomTilstand
            icon={Target}
            title="Ingen drill-forslag"
            text="Enten mangler testdata, eller øvelsesbanken er tom (ingen oppspinnede drills). Ta tester når banken har godkjente øvelser."
          />
          <Link href="/portal/tren/tester" className="pa-btn pa-btn--primary pa-btn--full">
            Gå til tester
          </Link>
        </section>
      ) : (
        <>
          {suggestions.map((drill) => (
            <section key={drill.id} className="pa-card ph-kort">
              <p>Rang {drill.rank}</p>
              <AkseMerke axis={drill.axis} />
              <strong>{drill.title}</strong>
              {drill.meta.length > 0 && <small>{drill.meta.join(" · ")}</small>}
              <StatusPille tone={drill.matchPct >= 80 ? "ok" : "neutral"}>{drill.matchPct} % match</StatusPille>
              <small>Hvorfor denne</small>
              <small>{drill.why}</small>
              <Link href={drill.href ?? `/portal/drills/${drill.id}`} className="pa-btn pa-btn--primary pa-btn--full">
                Åpne drill
              </Link>
            </section>
          ))}
          <Link href="/portal/drills" className="pa-btn pa-btn--secondary pa-btn--full">
            Se hele øvelsesbanken
          </Link>
        </>
      )}
    </div>
  );
}
