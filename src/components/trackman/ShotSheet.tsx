"use client";

/**
 * ShotSheet — TM-08f «Slag-ark fra prikk». Trykk på et slag i DispersionMap
 * åpner detaljene for AKKURAT det slaget: bunn-ark på mobil/iPad, artefakt-
 * panel (380px, fast til høyre) på Mac ≥1101px. ALDRI en ny rute/URL.
 *
 * Fasit: HANDOFF.md §LANSERINGSKJERNE A1–A4 (TM-08f):
 * «Slag 11 av 14: 11,4 m fra pin · carry 148,6 m · side +5,2 m · smash 1,37 ·
 * launch 16,4°» — vi har ikke pin-avstand for range-slag (kun side+carry,
 * se dispersion-map.ts), så linja bruker «avvik fra senter» i stedet for
 * «fra pin» der ekte pin-distanse mangler. Øvrig struktur følger fasiten.
 *
 * Eget lite ark-skall her (ikke BunnArk fra components/v2/bunn-ark.tsx) —
 * den bruker T.* (Paper) og CLAUDE.md forbyr å blande T/TL i samme skjerm.
 */

import { useEffect, useRef, useState } from "react";
import { TL, TL_BREKK } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import type { DispersionMapShot } from "@/lib/trackman/dispersion-map";

function komma(v: number | null, d: number): string {
  if (v == null) return "—";
  return v.toFixed(d).replace(".", ",");
}

function useErMac(breakpointPx = TL_BREKK.macRail): boolean {
  const [erMac, setErMac] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const oppdater = () => setErMac(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, [breakpointPx]);
  return erMac;
}

export interface ShotSheetProps {
  shot: DispersionMapShot | null;
  shotIndex: number;
  totalShots: number;
  onClose: () => void;
}

export function ShotSheet({ shot, shotIndex, totalShots, onClose }: ShotSheetProps) {
  const erMac = useErMac();
  const arkRef = useRef<HTMLDivElement>(null);
  const open = shot != null;

  useEffect(() => {
    if (!open) return;
    arkRef.current?.focus();
    const forrigeOverflow = document.body.style.overflow;
    if (!erMac) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = forrigeOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, erMac, onClose]);

  if (!open || !shot) return null;

  const avvik = Math.sqrt(shot.point.lateral ** 2 + shot.point.distance ** 2);

  const rader: [string, string][] = [
    ["Avvik fra senter", `${komma(avvik, 1)} m`],
    ["Carry", shot.carryDistance != null ? `${komma(shot.carryDistance, 1)} m` : "—"],
    ["Side", shot.side != null ? `${shot.side > 0 ? "+" : ""}${komma(shot.side, 1)} m` : "—"],
    ["Smash", komma(shot.smashFactor, 2)],
    ["Launch", shot.launchAngle != null ? `${komma(shot.launchAngle, 1)}°` : "—"],
  ];

  const innhold = (
    <div
      ref={arkRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Slag ${shot.shotNumber}`}
      style={{
        background: TL.elev,
        borderRadius: erMac ? TL.radius.card : `${TL.radius.sheet} ${TL.radius.sheet} 0 0`,
        border: `1px solid ${TL.hair}`,
        padding: "18px 20px calc(20px + env(safe-area-inset-bottom))",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        outline: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: TL.font.mono,
            fontSize: 11,
            letterSpacing: TL.track.caps,
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          Slag {shotIndex + 1} av {totalShots}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Lukk"
          style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: TL.mute }}
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      <div
        style={{
          fontFamily: TL.font.sans,
          fontSize: 15,
          fontWeight: 600,
          color: TL.text,
        }}
      >
        {rader.map(([label]) => label).join(" · ")}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {rader.map(([label, value], i) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i === rader.length - 1 ? "none" : `1px solid ${TL.hair}`,
            }}
          >
            <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>{label}</span>
            <span style={{ fontFamily: TL.font.mono, fontSize: 13, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
              {value}
            </span>
          </div>
        ))}
      </div>
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
          padding: 16,
          background: TL.scene,
          borderLeft: `1px solid ${TL.hair}`,
          overflowY: "auto",
        }}
      >
        {innhold}
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: TL.scrim }}
        aria-hidden="true"
      />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>{innhold}</div>
    </div>
  );
}
