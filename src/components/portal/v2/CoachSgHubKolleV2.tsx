"use client";

/**
 * PlayerHQ · SG-hub · Coach-modus per-kølle analyse — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Kort,
  Caps,
  Tittel,
  KpiFlis,
  DataTabell,
  type DataTabellColumn,
  PillVelger,
  HjelpTips,
  T,
} from "@/components/v2";
import { DPlanePlot } from "@/components/sg-hub/DPlanePlot";
import { StrikeHeatmap } from "@/components/sg-hub/StrikeHeatmap";
import { SmashCurvePlot } from "@/components/sg-hub/SmashCurvePlot";
import type { DPlaneResult } from "@/lib/sg-hub/d-plane";
import type { StrikeResult } from "@/lib/sg-hub/strike-pattern";
import type { SmashCurveResult } from "@/lib/sg-hub/smash-curve";
import { setSgHubMode } from "@/app/portal/(legacy)/mal/sg-hub/mode-action";

export interface KolleSkuddRad {
  nr: number;
  face: string; // "−1,2°"
  path: string;
  smash: string;
  clubSpeed: string; // "104,3 mph"
  ballSpeed: string;
  lengde: string; // "231 m/yd (TrackMan-total)"
}

export interface CoachSgHubKolleV2Data {
  spillerNavn: string;
  kolle: string;
  antallSlag: number;
  antallOkter: number;
  advanced: boolean;
  dplaneLabel: string;
  dplaneKonsistensPct: number;
  sweetPct: number;
  avgSmash: number;
  optimumSpeed: number; // mph, 0 = for lite data
  aboveOptimumPct: number;
  dplane: DPlaneResult;
  strike: StrikeResult;
  smash: SmashCurveResult;
  skudd: KolleSkuddRad[];
}

const SKUDD_COLS: DataTabellColumn[] = [
  { key: "nr", label: "#", mono: true },
  { key: "face", label: "Face (°)", mono: true, align: "right" },
  { key: "path", label: "Path (°)", mono: true, align: "right" },
  { key: "smash", label: "Smash", mono: true, align: "right" },
  { key: "clubSpeed", label: "Kølle (mph)", mono: true, align: "right" },
  { key: "ballSpeed", label: "Ball (mph)", mono: true, align: "right" },
  { key: "lengde", label: "Total", mono: true, align: "right" },
];

/** Enkel/Avansert — samme preferanse (setSgHubMode) som resten av SG-huben. */
function ModusVelger({ advanced }: { advanced: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div style={{ opacity: pending ? 0.6 : 1 }}>
      <PillVelger
        options={[
          { v: "simple", l: "Enkel" },
          { v: "advanced", l: "Avansert" },
        ]}
        value={advanced ? "advanced" : "simple"}
        onChange={(v) => {
          const mode = v === "advanced" ? "advanced" : "simple";
          if ((mode === "advanced") === advanced) return;
          startTransition(async () => {
            await setSgHubMode(mode);
            router.refresh();
          });
        }}
      />
    </div>
  );
}

export function CoachSgHubKolleV2({ data }: { data: CoachSgHubKolleV2Data }) {
  return (
    <>
      {/* Coach-modus-banner */}
      <Kort tint pad="12px 20px">
        <Caps color={T.lime}>Coach-modus · {data.spillerNavn}</Caps>
      </Kort>

      {/* Topptekst + modus */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Caps>Per-kølle analyse</Caps>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <Tittel mobile em={data.kolle} />
            <HjelpTips k="trackman" />
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: "8px 0 0" }}>
            {data.antallSlag} slag · {data.antallOkter} økt{data.antallOkter !== 1 ? "er" : ""} · TrackMan
          </p>
        </div>
        <ModusVelger advanced={data.advanced} />
      </div>

      {/* Nøkkeltall */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: T.gap }}>
        <Kort>
          <Caps size={9}>D-Plane</Caps>
          <div style={{ fontFamily: T.disp, fontSize: 20, fontWeight: 700, color: T.fg, marginTop: 12 }}>{data.dplaneLabel}</div>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 8 }}>{data.dplaneKonsistensPct} % konsistens</span>
        </Kort>
        <KpiFlis label="Sweet spot" value={`${data.sweetPct} %`} instant />
        <Kort>
          <Caps size={9}>Optimum speed</Caps>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 12 }}>
            <span style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
              {data.optimumSpeed > 0 ? String(data.optimumSpeed).replace(".", ",") : "—"}
            </span>
            {data.optimumSpeed > 0 && <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>mph</span>}
          </div>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 8 }}>
            {data.aboveOptimumPct > 0 ? `${data.aboveOptimumPct} % over optimum` : "For lite data"}
          </span>
        </Kort>
      </div>

      {/* D-Plane */}
      <Kort eyebrow="D-Plane · kurvemønster" action={<HjelpTips k="dPlane" />}>
        {!data.advanced && (
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "0 0 12px" }}>
            Dominerende mønster: <span style={{ color: T.fg, fontWeight: 600 }}>{data.dplaneLabel}</span>{" "}
            ({data.dplaneKonsistensPct} % av slagene)
          </p>
        )}
        <DPlanePlot result={data.dplane} advanced={data.advanced} />
      </Kort>

      {/* Strike heatmap */}
      <Kort eyebrow="Strike heatmap · kontaktpunkt">
        {!data.advanced && (
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "0 0 12px" }}>
            {data.sweetPct} % sweet spot · snitt smash factor {String(data.avgSmash).replace(".", ",")}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <StrikeHeatmap result={data.strike} advanced={data.advanced} />
        </div>
      </Kort>

      {/* Smash curve */}
      <Kort eyebrow="Smash curve · effektivitets-optimum" action={<HjelpTips k="smashFactor" />}>
        {!data.advanced && data.optimumSpeed > 0 && (
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "0 0 12px" }}>
            Optimalt club speed: <span style={{ color: T.fg, fontWeight: 600 }}>{String(data.optimumSpeed).replace(".", ",")} mph</span>
            {data.aboveOptimumPct > 0 && <> · {data.aboveOptimumPct} % over optimum</>}
          </p>
        )}
        <SmashCurvePlot result={data.smash} advanced={data.advanced} />
      </Kort>

      {/* Slag-tabell (kun avansert) */}
      {data.advanced && (
        <Kort eyebrow="Slag-statistikk · alle slag">
          <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, margin: "0 0 10px" }}>
            «Total» er TrackMan-total lengde per slag. Shot-annotasjoner aktiveres når
            ShotAnnotationPopover kobles inn i hovedversjonen.
          </p>
          <div style={{ overflowX: "auto" }}>
            <DataTabell
              columns={SKUDD_COLS}
              rows={data.skudd.map((s) => ({
                nr: s.nr,
                face: s.face,
                path: s.path,
                smash: s.smash,
                clubSpeed: s.clubSpeed,
                ballSpeed: s.ballSpeed,
                lengde: s.lengde,
              }))}
              sortKey="nr"
              sortDir="asc"
            />
          </div>
        </Kort>
      )}
    </>
  );
}
