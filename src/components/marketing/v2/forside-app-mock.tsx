"use client";

/**
 * PlayerHQ-eksempel i markedshero — bygget av ekte v2-primitiver (Skjerm m.m.).
 * Tallene er illustrasjon, ikke en navngitt spiller.
 */

import {
  Caps,
  FordelingRad,
  Kort,
  Rad,
  Skjerm,
  StatusPill,
  TallHero,
  Trend,
  AvatarInit,
} from "@/components/v2";
import { T } from "@/lib/v2/tokens";

export type AppSkjermId = "hjem" | "plan" | "analyse";

function HjemInnhold() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AvatarInit navn="Spiller" size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Caps size={9}>I dag</Caps>
          <div style={{ fontFamily: T.ui, fontSize: 15, fontWeight: 700, color: T.fg }}>
            God trening
          </div>
        </div>
        <StatusPill tone="info">Eksempel</StatusPill>
      </div>
      <TallHero label="SG total (siste 8)" value="−0,4" size={44} />
      <Kort pad="12px 14px" eyebrow="Ukeplan">
        <Rad title="Tirsdag · Approach" sub="60 min · range" trailing={null} />
        <Rad title="Torsdag · Nærspill" sub="45 min · green" trailing={null} last />
      </Kort>
    </div>
  );
}

function PlanInnhold() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Caps size={9}>Plan · uke</Caps>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>
        Fokus: innspill
      </div>
      <FordelingRad code="TEK" label="Teknisk" pct={25} value="25 %" />
      <FordelingRad code="SLAG" label="Golfslag" pct={40} value="40 %" />
      <FordelingRad code="SPILL" label="Spill" pct={20} value="20 %" />
      <FordelingRad code="FYS" label="Fysisk" pct={15} value="15 %" last />
      <Kort pad="10px 12px">
        <Rad title="Drill · 50–100 m" sub="3×8 · kvalitet før kvantitet" trailing={null} last />
      </Kort>
    </div>
  );
}

function AnalyseInnhold() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Caps size={9}>Analyse</Caps>
      <Trend series={[-1.1, -0.9, -0.7, -0.5, -0.4, -0.3]} height={72} />
      <Kort pad="10px 12px" eyebrow="Mot baseline">
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: 0, lineHeight: 1.5 }}>
          Stolpene viser slag vunnet eller tapt mot valgt nivå. Eksempel-data.
        </p>
      </Kort>
    </div>
  );
}

export function AppSkjermInnhold({ id }: { id: AppSkjermId }) {
  if (id === "plan") return <PlanInnhold />;
  if (id === "analyse") return <AnalyseInnhold />;
  return <HjemInnhold />;
}

/** Mobiltelefon-ramme med PlayerHQ-innhold. */
export function PlayerHqTelefon({
  aktiv,
  scale = 0.88,
}: {
  aktiv: AppSkjermId;
  scale?: number;
}) {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        width: 390,
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <Skjerm
        aktiv={aktiv === "hjem" ? "hjem" : aktiv === "plan" ? "plan" : "analyse"}
        mobile
      >
        <AppSkjermInnhold id={aktiv} />
      </Skjerm>
    </div>
  );
}
