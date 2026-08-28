"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * «Fortsett runde» når localStorage-kladd finnes.
 * Én inngang — peker til live eller etterpå avhengig av kladd.modus.
 */

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { lesKladdCached, lesKladdServer } from "@/lib/runde-logg/draft";
import { Icon } from "@/components/v2";

const abonnerIngen = () => () => {};

type Props = {
  /** compact = rad/kort-stil; pill = ink CTA */
  variant?: "row" | "pill";
  className?: string;
};

/** true når en runde-kladd finnes (ikke oppsett-steget) — for betinget kort-skall rundt CTA-en. */
export function useHarRundeKladd(): boolean {
  const kladd = useSyncExternalStore(abonnerIngen, lesKladdCached, lesKladdServer);
  return kladd != null && kladd.steg !== "oppsett";
}

export function FortsettRundeCta({ variant = "row" }: Props) {
  const kladd = useSyncExternalStore(abonnerIngen, lesKladdCached, lesKladdServer);
  if (!kladd || kladd.steg === "oppsett") return null;

  const hullNr = (kladd.aktivtHullIdx ?? 0) + 1;
  // PP-3: slag-/hull-føringen bor nå på /runde/live for begge modi —
  // /runde/logg er det nye ettskjerms etterregistrerings-skjemaet.
  const href = "/portal/runde/live";
  const title = `Fortsett runde · hull ${hullNr}`;
  const sub =
    kladd.oppsett.courseNavn?.trim() ||
    (kladd.modus === "live" ? "Live på banen" : "Etterpå-føring");

  if (variant === "pill") {
    return (
      <Link
        href={href}
        style={{
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 999,
          background: TL.fill,
          color: TL.onFill,
          fontFamily: TL.font.sans,
          fontSize: 13,
          fontWeight: 700,
          padding: "10px 16px",
        }}
      >
        <Icon name="play" size={14} />
        {title}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: `color-mix(in srgb, ${TL.fill} 14%, transparent)`,
          color: TL.text,
          flex: "none",
        }}
      >
        <Icon name="play" size={16} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: TL.font.sans,
            fontSize: 14,
            fontWeight: 700,
            color: TL.text,
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: TL.font.sans,
            fontSize: 12,
            color: TL.mute,
            marginTop: 2,
          }}
        >
          {sub} · lagret på denne enheten
        </span>
      </span>
      <Icon name="chevron-right" size={16} style={{ color: TL.mute }} />
    </Link>
  );
}
