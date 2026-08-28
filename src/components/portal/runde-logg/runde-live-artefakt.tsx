"use client";

/**
 * RU-01 — Runde er artefakt over I dag, ikke fane (Loop 9 / C5).
 * Viser kun når en runde-kladd finnes i localStorage (lesKladdCached/Server,
 * se draft.ts) — ingen kladd = ingen kort, akkurat som TrackMan-teaseren.
 * Mønster kopiert fra WorkbenchIDagArtefakt (PortalChatHjem.tsx): TL.*-tokens,
 * caps eyebrow, ett kort, én primær CTA.
 *
 * SG så langt regnes med samme motor som live-føringen selv bruker
 * (beregnSg/rundeTilSgShots) — kun på fullførte hull, aldri fabrikkert.
 */

import { useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { fmtSg } from "@/lib/v2/format";
import { Icon } from "@/components/v2/icon";
import { lesKladdCached, lesKladdServer } from "@/lib/runde-logg/draft";
import { scoreFraHull } from "@/lib/runde-logg/syntetiser-hurtig";
import { beregnSg } from "@/lib/domain/sg";
import { rundeTilSgShots } from "@/lib/runde-logg/til-sg-shots";

const abonnerIngen = () => () => {};

const kortStil: CSSProperties = {
  background: TL.elev,
  borderRadius: TL.radius.card,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const ctaStil: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  minHeight: 48,
  borderRadius: TL.radius.pill,
  background: TL.fill,
  color: TL.onFill,
  fontFamily: TL.font.sans,
  fontSize: 15,
  fontWeight: 700,
  textDecoration: "none",
  marginTop: 4,
};

export function RundeLiveArtefakt() {
  const kladd = useSyncExternalStore(abonnerIngen, lesKladdCached, lesKladdServer);

  if (!kladd || kladd.steg === "oppsett") return null;

  const eyebrow = (
    <div
      style={{
        fontFamily: TL.font.mono,
        fontSize: 10,
        letterSpacing: TL.track.caps,
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      runde
    </div>
  );

  const total = kladd.hullData.length;
  const ferdige = kladd.hullData.filter((h) => scoreFraHull(h) != null);

  let sgTotal: number | null = null;
  if (ferdige.length > 0) {
    try {
      sgTotal = beregnSg(rundeTilSgShots(ferdige)).total;
    } catch {
      sgTotal = null;
    }
  }

  if (kladd.steg === "oppsummering") {
    return (
      <div data-od-id="runde-idag-oppsummering" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {eyebrow}
        <div style={kortStil}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: TL.warm, flex: "none" }} aria-hidden="true" />
            <span
              style={{
                fontFamily: TL.font.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: TL.track.capsSm,
                textTransform: "uppercase",
                color: TL.warm,
              }}
            >
              Klar for oppsummering
            </span>
          </div>
          <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 16, fontWeight: 600, color: TL.text }}>
            {kladd.oppsett.courseNavn?.trim() || "Runden"}
          </h3>
          <p style={{ margin: 0, fontFamily: TL.font.mono, fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
            {ferdige.length} av {total} hull ført
          </p>
          <Link href="/portal/runde/live" className="v2-press v2-focus" style={ctaStil}>
            Fullfør
          </Link>
        </div>
      </div>
    );
  }

  const aktivtHull = kladd.hullData[kladd.aktivtHullIdx];
  const hullNr = kladd.aktivtHullIdx + 1;

  return (
    <div data-od-id="runde-idag-pagar" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {eyebrow}
      <div style={kortStil}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: TL.warm, flex: "none" }} aria-hidden="true" />
          <span
            style={{
              fontFamily: TL.font.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: TL.track.capsSm,
              textTransform: "uppercase",
              color: TL.warm,
            }}
          >
            {kladd.modus === "live" ? "Live på banen" : "Etterpå-føring"}
          </span>
        </div>
        <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 16, fontWeight: 600, color: TL.text }}>
          Hull {hullNr}
          <span style={{ color: TL.mute, fontWeight: 400 }}> / {total}</span>
        </h3>
        <p style={{ margin: 0, fontFamily: TL.font.mono, fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {kladd.oppsett.courseNavn?.trim() || "—"}
          {aktivtHull ? ` · par ${aktivtHull.par}` : ""} · {ferdige.length} av {total} fullført
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginTop: 4,
            paddingTop: 8,
            borderTop: `1px solid ${TL.hair}`,
          }}
        >
          <span style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute }}>
            SG så langt
          </span>
          <span
            style={{
              fontFamily: TL.font.mono,
              fontSize: 15,
              fontWeight: 700,
              color: TL.text,
              opacity: sgTotal != null && sgTotal < 0 ? TL.opasitet.negativ : 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {sgTotal == null ? "—" : fmtSg(sgTotal)}
          </span>
        </div>
        <Link href="/portal/runde/live" className="v2-press v2-focus" style={ctaStil}>
          <Icon name="play" size={14} />
          Fortsett
        </Link>
      </div>
    </div>
  );
}
