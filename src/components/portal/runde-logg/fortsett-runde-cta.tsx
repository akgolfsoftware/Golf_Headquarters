"use client";

/**
 * «Fortsett runde» når localStorage-kladd finnes.
 * Én inngang — peker til live eller etterpå avhengig av kladd.modus.
 */

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { lesKladdCached, lesKladdServer } from "@/lib/runde-logg/draft";
import { T, Icon } from "@/components/v2";

const abonnerIngen = () => () => {};

type Props = {
  /** compact = rad/kort-stil; pill = lime CTA */
  variant?: "row" | "pill";
  className?: string;
};

export function FortsettRundeCta({ variant = "row" }: Props) {
  const kladd = useSyncExternalStore(abonnerIngen, lesKladdCached, lesKladdServer);
  if (!kladd || kladd.steg === "oppsett") return null;

  const hullNr = (kladd.aktivtHullIdx ?? 0) + 1;
  const href =
    kladd.modus === "live" ? "/portal/runde/live" : "/portal/runde/logg";
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
          background: T.lime,
          color: T.onLime,
          fontFamily: T.ui,
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
          background: "color-mix(in srgb, var(--v2-lime) 18%, transparent)",
          color: T.forest,
          flex: "none",
        }}
      >
        <Icon name="play" size={16} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: T.ui,
            fontSize: 14,
            fontWeight: 700,
            color: T.fg,
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: T.ui,
            fontSize: 12,
            color: T.mut,
            marginTop: 2,
          }}
        >
          {sub} · lagret på denne enheten
        </span>
      </span>
      <Icon name="chevron-right" size={16} style={{ color: T.mut }} />
    </Link>
  );
}
