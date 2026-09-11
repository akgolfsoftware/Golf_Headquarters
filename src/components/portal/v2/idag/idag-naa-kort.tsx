"use client";

/** Fasit: valgt Train-lock ZIP (4), PH-01 I dag v3 + components/status-pill.jsx. */
import Link from "next/link";
import { Check, Play } from "lucide-react";
import { TL } from "@/lib/v2/train-lock";
import { IDAG_UI } from "@/lib/portal/idag-visning";
import type { NaaKort } from "./IDagTrainLock";
import { TrainLockStatus, TrainLockChip, TrainLockFremdrift } from "@/components/train-lock/v3-elementer";
import "./idag-train-lock.module.css";
const PYRAMIDE_NIVAER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
function Cta({ href, barn, dim }: { href: string; barn: string; dim?: boolean }) {
  return (
    <Link
      href={href}
      className={dim ? "v2-press v2-focus" : "v2-press v2-focus ph01-cta-prim"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
        padding: "10px 18px",
        gap: 9,
        textAlign: "center",
        borderRadius: 999,
        background: dim ? TL.dim : TL.fill,
        color: dim ? TL.text : TL.onFill,
        fontFamily: TL.font.sans,
        fontSize: 16,
        fontWeight: dim ? 600 : 700,
        textDecoration: "none",
        marginTop: 18,
      }}
    >
      {barn === IDAG_UI.startOkt && <Play size={20} aria-hidden />}
      {barn}
    </Link>
  );
}

function TekstLenke({ href, barn }: { href: string; barn: string }) {
  return (
    <Link
      href={href}
      className="v2-press"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 44,
        fontSize: 15,
        fontWeight: 600,
        color: TL.mute,
        textDecoration: "none",
      }}
    >
      {barn}
    </Link>
  );
}

/** PH-01b: 5-segments pyramide-indikator — aktivt nivå hvitt, resten dim. */
function PyramideStripe({ aktiv }: { aktiv: string }) {
  return (
    <div style={{ marginTop: 12, display: "flex", gap: 3 }}>
      {PYRAMIDE_NIVAER.map((nivaa) => {
        const er = nivaa === aktiv;
        return (
          <div key={nivaa} style={{ flex: 1 }}>
            <div style={{ height: 3, borderRadius: 2, background: er ? TL.text : TL.dim }} />
            <div
              style={{
                marginTop: 3,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: er ? TL.text : TL.mute,
                textAlign: "center",
              }}
            >
              {nivaa}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function IDagNaaKort({ naa }: { naa: NaaKort }) {
  const fys = naa.pyramide === "FYS";
  // Hero-feltet er en bilde-plassholder i fasiten — uten bilde blir det bare et hull.
  const hero = fys && Boolean(naa.heroBilde);
  return (
    <div
      className={hero ? undefined : "ph01-naa"}
      style={{ background: TL.elev, borderRadius: TL.radius.card, boxShadow: TL.shadowCard, overflow: hero ? "hidden" : undefined, minWidth: 0 }}
    >
      {hero && (
        <div
          style={{
            height: 120,
            borderRadius: 12,
            background: `${TL.elev} center/cover no-repeat url(${JSON.stringify(naa.heroBilde)})`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 10,
              bottom: 8,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            FYS · {naa.tittel}
          </span>
        </div>
      )}
      <div className={hero ? "ph01-naa" : undefined} style={hero ? undefined : { display: "contents" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <TrainLockStatus variant={naa.fullfort ? "ok" : "warm"}>
          {naa.fullfort && <Check size={12} strokeWidth={2.5} aria-hidden />}
          {naa.fullfort ? IDAG_UI.fullfort : naa.live ? IDAG_UI.live : IDAG_UI.naa}
        </TrainLockStatus>
        <span style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{naa.tid}</span>
      </div>
      <div
        className="ph01-naa-tittel"
        style={{
          marginTop: 12,
          overflowWrap: "anywhere",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
          color: TL.text,
        }}
      >
        {naa.tittel}
      </div>
      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {naa.meta.split(" · ").filter(Boolean).map((meta, i) => <TrainLockChip key={`${i}-${meta}`}>{meta}</TrainLockChip>)}
      </div>
      {naa.fremdriftPst != null && (
        <>
          <TrainLockFremdrift verdi={naa.fremdriftPst / 100} label="Økten" />
          {naa.fremdriftTekst && (
            <div style={{ marginTop: 9, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
              {naa.fremdriftTekst}
            </div>
          )}
        </>
      )}
      {fys && naa.pyramide && (
        /* PH-01b (telefon) har pyramide-stripen; PH-01 Mac har den ikke — der
           står bare fremdriftsstreken. `.ph01-kun-telefon` skjuler den ≥1101px. */
        <div className="ph01-kun-telefon">
          <PyramideStripe aktiv={naa.pyramide} />
        </div>
      )}
      <Cta href={naa.ctaHref} barn={naa.ctaTekst} />
      {naa.sekundarTekst && naa.sekundarHref && <TekstLenke href={naa.sekundarHref} barn={naa.sekundarTekst} />}
      </div>
    </div>
  );
}
