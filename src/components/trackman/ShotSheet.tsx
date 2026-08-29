"use client";

/**
 * ShotSheet — TM-08f «Slag-ark fra prikk». Trykk på et slag i DispersionMap
 * åpner detaljene for AKKURAT det slaget: bunn-ark m/ dekorativt hullkart på
 * mobil/iPad, artefakt-panel (380px, fast til høyre, uten kart — hovedflaten
 * viser kartet allerede) på Mac ≥1101px. ALDRI en ny rute/URL.
 *
 * Fasit: designsystem/train-lock/TM-08f Slag-ark fra prikk.dc.html
 * (TM-08f1 iPhone / TM-08f2 iPad / TM-08f3 Mac 1440 — iPad-variantens
 * side-om-side kart+tekst er ikke portet 1:1 her; den deler mobil-layouten
 * (stablet), som beholder alle elementer i riktig rekkefølge.)
 *
 * Vi har ikke pin-avstand for range-slag (kun side+carry, se
 * dispersion-map.ts), så fasitens «11,4 m fra pin» blir «avvik fra senter»
 * her — øvrig struktur (stort tall → beskrivelse → kart → stat-kort →
 * Forrige/Neste → Lukk) følger fasiten.
 *
 * Eget lite ark-skall her (ikke BunnArk fra components/v2/bunn-ark.tsx) —
 * den bruker T.* (Paper) og CLAUDE.md forbyr å blande T/TL i samme skjerm.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { TL, TL_BREKK } from "@/lib/v2/train-lock";
import type { DispersionMapShot } from "@/lib/trackman/dispersion-map";
import {
  HOLE_MAP_TARGET,
  HOLE_MAP_VIEWBOX,
  HoleMapTargetLine,
  HoleMapTerrain,
  HoleMapTerrainStyle,
  holeMapProjection,
  type HoleMapVariant,
} from "./HoleMap";

function komma(v: number | null, d: number): string {
  if (v == null) return "—";
  return v.toFixed(d).replace(".", ",");
}

function useErStorre(breakpointPx: number): boolean {
  const [er, setEr] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const oppdater = () => setEr(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, [breakpointPx]);
  return er;
}

export interface ShotSheetProps {
  shot: DispersionMapShot | null;
  shotIndex: number;
  totalShots: number;
  /** Alle slag i klyngen — tegnes som svake prikker i mini-kartet, valgt slag får hvit ring. */
  allShots: DispersionMapShot[];
  variant: HoleMapVariant;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ShotSheet({ shot, shotIndex, totalShots, allShots, variant, onClose, onPrev, onNext }: ShotSheetProps) {
  const erMac = useErStorre(TL_BREKK.macRail);
  const arkRef = useRef<HTMLDivElement>(null);
  const open = shot != null;

  useEffect(() => {
    if (!open) return;
    arkRef.current?.focus();
    const forrigeOverflow = document.body.style.overflow;
    if (!erMac) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = forrigeOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, erMac, onClose, onPrev, onNext]);

  const anchor = HOLE_MAP_TARGET[variant];
  const projection = useMemo(() => {
    const points = allShots.map((s) => s.point);
    return holeMapProjection(points, 0, variant);
  }, [allShots, variant]);

  if (!open || !shot) return null;

  const avvik = Math.sqrt(shot.point.lateral ** 2 + shot.point.distance ** 2);
  const sideTekst =
    shot.side == null
      ? null
      : Math.abs(shot.side) < 1
        ? "midt på linja"
        : `${komma(Math.abs(shot.side), 1)} m ${shot.side > 0 ? "høyre" : "venstre"} for senter`;
  const bucketTekst = shot.bucket === "good" ? "innenfor 1σ" : shot.bucket === "acceptable" ? "1–2σ" : shot.bucket === "disaster" ? "utenfor 2σ" : null;
  const beskrivelse = [sideTekst, bucketTekst].filter(Boolean).join(" · ");

  const statRader: [string, string][] = [
    ["Carry", shot.carryDistance != null ? `${komma(shot.carryDistance, 1)} m` : "—"],
    ["Side", shot.side != null ? `${shot.side > 0 ? "+" : ""}${komma(shot.side, 1)} m` : "—"],
    ["Smash", komma(shot.smashFactor, 2)],
    ["Launch", shot.launchAngle != null ? `${komma(shot.launchAngle, 1)}°` : "—"],
  ];

  const capsStil = {
    fontFamily: TL.font.mono,
    fontSize: 11,
    letterSpacing: TL.track.caps,
    textTransform: "uppercase" as const,
    color: TL.mute,
  };

  const knappStil = {
    flex: 1,
    height: 44,
    borderRadius: TL.radius.pill,
    background: TL.dim,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: TL.font.sans,
    fontSize: 15,
    fontWeight: 600,
    color: TL.text,
    cursor: "pointer",
    border: "none",
  };

  const kart = (
    <div className="tm-holemap-terrain" style={{ background: TL.scene, borderRadius: TL.radius.card, overflow: "hidden" }}>
      <HoleMapTerrainStyle />
      <svg viewBox={HOLE_MAP_VIEWBOX} role="img" aria-label="Slagets plassering" style={{ display: "block", width: "100%", aspectRatio: "240 / 170" }}>
        <HoleMapTerrain variant={variant} />
        <HoleMapTargetLine variant={variant} target={{ x: anchor.x, y: anchor.y }} />
        {allShots.map((s) => {
          const isValgt = s.id === shot.id;
          const cx = projection.toX(s.point.lateral);
          const cy = projection.toY(s.point.distance);
          return (
            <circle
              key={s.id}
              cx={cx}
              cy={cy}
              r={isValgt ? 4.8 : 4}
              fill={TL.viz.dot}
              fillOpacity={isValgt ? 1 : 0.55}
              stroke={isValgt ? "#F5F5F5" : "none"}
              strokeWidth={isValgt ? 1.6 : 0}
            />
          );
        })}
      </svg>
    </div>
  );

  const statKort = (
    <div style={{ background: TL.dock, borderRadius: TL.radius.card, padding: "2px 16px" }}>
      {statRader.map(([label, value], i) => (
        <div
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderBottom: i === statRader.length - 1 ? "none" : `1px solid ${TL.hair}`,
          }}
        >
          <span style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>{label}</span>
          <span style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 600, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );

  const forrigeNeste = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button type="button" onClick={onPrev} disabled={shotIndex <= 0} style={{ ...knappStil, opacity: shotIndex <= 0 ? 0.4 : 1 }}>
        Forrige
      </button>
      <button type="button" onClick={onNext} disabled={shotIndex >= totalShots - 1} style={{ ...knappStil, opacity: shotIndex >= totalShots - 1 ? 0.4 : 1 }}>
        Neste
      </button>
    </div>
  );

  const bigTall = (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontFamily: TL.font.sans, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text, fontVariantNumeric: "tabular-nums" }}>
        {komma(avvik, 1)} m
      </span>
      <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>fra senter</span>
    </div>
  );

  if (erMac) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          zIndex: 60,
          padding: "40px 28px 48px",
          background: TL.scene,
          borderLeft: `1px solid ${TL.hair}`,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Slag ${shot.shotNumber}`}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={capsStil}>
            Slag {shotIndex + 1} av {totalShots}
          </span>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.mute }}>
            Lukk
          </button>
        </div>
        {bigTall}
        {beskrivelse && <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 15, color: TL.mute, lineHeight: 1.45 }}>{beskrivelse}.</p>}
        {statKort}
        {forrigeNeste}
      </div>
    );
  }

  const innhold = (
    <div
      ref={arkRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Slag ${shot.shotNumber}`}
      style={{
        background: TL.dock,
        borderRadius: `${TL.radius.sheet} ${TL.radius.sheet} 0 0`,
        border: `1px solid ${TL.hair}`,
        padding: "10px 16px calc(20px + env(safe-area-inset-bottom))",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        outline: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: TL.dim }} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={capsStil}>
          Slag {shotIndex + 1} av {totalShots}
        </span>
        <span style={capsStil}>{shot.club}</span>
      </div>
      {bigTall}
      {kart}
      {statKort}
      {forrigeNeste}
      <button type="button" onClick={onClose} style={{ height: 44, background: "none", border: "none", cursor: "pointer", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.mute }}>
        Lukk
      </button>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: TL.scrim }} aria-hidden="true" />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>{innhold}</div>
    </div>
  );
}
