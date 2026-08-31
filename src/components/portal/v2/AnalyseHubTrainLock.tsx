"use client";

/**
 * Analyse-hub. Broadie venstre, TrackMan høyre på desktop.
 * Fasit: designsystem/train-lock/TM-04 Analyse-hub TrackMan.dc.html
 * Fasit: designsystem/train-lock/PH-10 Analyse.dc.html (én flate, innganger under fold)
 * Fasit: designsystem/train-lock/PH-16 Analyse tom.dc.html (tom: én setning + CTA)
 * Fasit: designsystem/train-lock/TM-09 Mini-kart og runde.dc.html (TM-09a/b/f
 * «Analyse mini»: TrackMan-kortet får hullkart-bakgrunn (HoleMap, "mini")
 * + «Se full spredning»-lenketeksten, i stedet for et blankt rutenett).
 * Lys: designsystem/train-lock/B3 Lys nøkkelskjermer.dc.html (Lys PH-10
 * Analyse) — mekanisk (PX-7, 29.08.2026): filen leser konsekvent TL.* uten
 * hardkodet hex, verifisert med grep — ingen manuell lys-finpuss utover det.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import type { TmHubData } from "@/lib/portal-analyse/tm-hub-data";
import {
  HOLE_MAP_VIEWBOX_MINI,
  HoleMapTargetLine,
  HoleMapTerrain,
  HoleMapTerrainStyle,
  HOLE_MAP_TARGET_MINI,
} from "@/components/trackman/HoleMap";

function Caps({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: TL.storrelse.caps,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.caps,
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      {children}
    </span>
  );
}

function Kort({ children, mt = 12 }: { children: React.ReactNode; mt?: number }) {
  return (
    <div style={{ marginTop: mt, background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
      {children}
    </div>
  );
}

const PIL = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TL.mute} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5 L16 12 L9 19" />
  </svg>
);

function SgBar({ verdi }: { verdi: number | null }) {
  /* Fasitens skala, målt i PH-10/TM-04: +0,81 → 32px og −1,18 → 47px, altså
     ~40px per SG-enhet mot halvhøyden 52. Appen brukte cap 2 (26px per enhet),
     som gjorde ekte SG-verdier nesten usynlige. */
  const cap = 1.3;
  const hMax = 52;
  if (verdi == null || !Number.isFinite(verdi) || verdi === 0) {
    return (
      <div style={{ position: "relative", width: "100%", height: 104, marginTop: 8 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 52, height: 1, background: TL.hair }} />
      </div>
    );
  }
  const px = Math.min(hMax, (Math.abs(verdi) / cap) * hMax);
  const positiv = verdi > 0;
  return (
    <div style={{ position: "relative", width: "100%", height: 104, marginTop: 8 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 52, height: 1, background: TL.hair }} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          width: 28,
          background: TL.text,
          opacity: positiv ? 1 : 0.4,
          borderRadius: positiv ? "4px 4px 0 0" : "0 0 4px 4px",
          ...(positiv ? { bottom: 52, height: px } : { top: 53, height: px }),
        }}
      />
    </div>
  );
}

function VinduKort({ vindu }: { vindu: TmHubData["vindu"] }) {
  return (
    <Kort mt={0}>
      <Caps>I vindu i dag</Caps>
      {vindu ? (
        <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: TL.text }}>
            {vindu.i}
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
            / {vindu.av}
          </span>
        </div>
      ) : (
        <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: TL.text, lineHeight: 1.4 }}>
          Ingen vindu logget i dag.
        </div>
      )}
    </Kort>
  );
}

function CaddieKort({ data }: { data: TmHubData }) {
  return (
    <>
      {data.lekkasje ? (
        <Kort mt={0}>
          <Caps>Caddie · Broadie</Caps>
          <div style={{ marginTop: 8, fontSize: 17, fontWeight: 600, lineHeight: 1.4, color: TL.text, textWrap: "pretty" }}>
            {data.lekkasje.setning}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
            {data.lekkasje.meta}
          </div>
        </Kort>
      ) : (
        <Kort mt={0}>
          <Caps>Caddie · Broadie</Caps>
          <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: TL.text }}>Ingen SG ennå</div>
          <div style={{ marginTop: 8, fontSize: 13, color: TL.mute }}>
            Når du har runder med slag, viser vi lekkasjen her. TrackMan blandes aldri inn i dette tallet.
          </div>
        </Kort>
      )}
    </>
  );
}

function SgKort({ data }: { data: TmHubData }) {
  return (
      <Kort mt={0}>
        <Caps>SG siste 5 runder</Caps>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {data.sgAkser.map((a) => (
            <div key={a.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: TL.text,
                  opacity: a.verdi != null && a.verdi < 0 ? 0.45 : 1,
                }}
              >
                {a.tekst}
              </span>
              <SgBar verdi={a.verdi} />
              <div style={{ marginTop: 8 }}>
                <Caps>{a.etikett}</Caps>
              </div>
            </div>
          ))}
        </div>
        {data.lekkasjeLinje && (
          <div style={{ marginTop: 12, fontSize: 13, color: TL.mute }}>{data.lekkasjeLinje}</div>
        )}
      </Kort>
  );
}

function TrackManKort({ data }: { data: TmHubData }) {
  if (!data.trackman) {
    return (
      <Kort mt={0}>
        <Caps>TrackMan · automatisk</Caps>
        <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: TL.text }}>Ingen økt ennå</div>
        <div style={{ marginTop: 8, fontSize: 13, color: TL.mute }}>
          Last opp CSV eller HTML — spredningen lander her automatisk.
        </div>
      </Kort>
    );
  }
  const tm = data.trackman;
  return (
    <Kort mt={0}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <Caps>TrackMan · automatisk · {tm.klubb}</Caps>
        <div style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{tm.datoKort}</div>
      </div>
      <div style={{ marginTop: 8, fontSize: 17, fontWeight: 600, lineHeight: 1.4, color: TL.text, textWrap: "pretty" }}>
        {tm.setning}
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{tm.meta}</div>
      <div className="tm-holemap-terrain" style={{ marginTop: 14, position: "relative" }}>
        <HoleMapTerrainStyle />
        <svg
          viewBox={HOLE_MAP_VIEWBOX_MINI}
          role="img"
          aria-label="Hullkart med slag"
          style={{ display: "block", width: "100%", aspectRatio: "240 / 120", borderRadius: 16 }}
        >
          <HoleMapTerrain variant={tm.variant} size="mini" />
          <HoleMapTargetLine variant={tm.variant} target={HOLE_MAP_TARGET_MINI[tm.variant]} size="mini" />
          {tm.ellipse && (
            <ellipse
              cx={tm.ellipse.cx}
              cy={tm.ellipse.cy}
              rx={tm.ellipse.rx}
              ry={tm.ellipse.ry}
              fill="none"
              stroke={TL.text}
              strokeOpacity="0.18"
              strokeWidth="1"
            />
          )}
          {tm.punkter.map((p, i) => (
            <g key={i}>
              <circle cx={p.cx} cy={p.cy} r="3.5" fill={TL.viz.dot} />
              {p.siste && <circle cx={p.cx} cy={p.cy} r="6.5" fill="none" stroke={TL.text} strokeWidth="1.2" />}
            </g>
          ))}
        </svg>
      </div>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, gap: 12 }}>
        <span style={{ color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{tm.kpis}</span>
        <Link href={`/portal/analysere/trackman/${tm.sessionId}`} className="v2-press v2-focus" style={{ fontWeight: 600, color: TL.text, textDecoration: "none" }}>
          Se full spredning
        </Link>
      </div>
    </Kort>
  );
}

function Dypere({ rader }: { rader: TmHubData["dypere"] }) {
  return (
    <div style={{ marginTop: 20 }}>
      <Caps>Gå dypere</Caps>
      <div style={{ marginTop: 10, background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px" }}>
        {rader.map((r, i) => (
          <Link
            key={r.href}
            href={r.href}
            className="v2-press v2-focus"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "15px 0",
              borderBottom: i < rader.length - 1 ? `1px solid ${TL.hair}` : "none",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: TL.text }}>{r.tittel}</div>
            <div style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{r.meta}</div>
            {PIL}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AnalyseHubTrainLock({ data }: { data: TmHubData }) {
  /* PH-16: helt tom — én setning + CTA, aldri dummy-graf. */
  const helTom =
    data.vindu == null &&
    data.lekkasje == null &&
    data.trackman == null &&
    data.sgAkser.every((a) => a.verdi == null || a.verdi === 0);
  if (helTom) {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Caps>{data.dagLabel}</Caps>
        <h1
          style={{
            margin: "6px 0 0",
            fontSize: TL.storrelse.tittel,
            fontWeight: TL.vekt.tittel,
            letterSpacing: TL.track.tittel,
            lineHeight: 1.1,
            color: TL.text,
          }}
        >
          Analyse
        </h1>
        <Kort mt={18}>
          <div style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.5, color: TL.mute }}>
            Ingen data ennå. SG kommer fra runder og tester.
          </div>
          <Link
            href="/portal/coach"
            className="v2-press v2-focus"
            style={{
              marginTop: 16,
              height: 48,
              borderRadius: 999,
              background: TL.fill,
              color: TL.onFill,
              fontSize: 16,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            Be Anders hente SG
          </Link>
        </Kort>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div className="flex flex-col gap-2 min-[834px]:flex-row min-[834px]:items-baseline min-[834px]:gap-4">
        <div>
          <div className="min-[834px]:hidden">
            <Caps>{data.dagLabel}</Caps>
          </div>
          <h1
            style={{
              margin: "6px 0 0",
              fontSize: TL.storrelse.tittel,
              fontWeight: TL.vekt.tittel,
              letterSpacing: TL.track.tittel,
              lineHeight: 1.1,
              color: TL.text,
            }}
          >
            Analyse
          </h1>
        </div>
        <span className="hidden min-[834px]:inline" style={{ fontSize: 13, color: TL.mute }}>
          {data.dagLabel}
        </span>
      </div>

      <div className="mt-[18px] flex flex-col gap-3 min-[834px]:grid min-[834px]:grid-cols-2 min-[834px]:items-start min-[834px]:gap-8">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="hidden min-[834px]:block">
            <Caps>Broadie · SG</Caps>
          </div>
          <VinduKort vindu={data.vindu} />
          <CaddieKort data={data} />
          {/* TM-04a (telefon) rekkefølge: vindu → Broadie → TrackMan-kort →
              SG-stolper → Gå dypere. På desktop bor TrackMan i høyre kolonne
              (HANDOFF §TM: «Broadie venstre / TrackMan høyre på desktop»). */}
          <div className="min-[834px]:hidden">
            <TrackManKort data={data} />
          </div>
          <SgKort data={data} />
          <div className="min-[834px]:hidden">
            <Dypere rader={data.dypere} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <div className="hidden min-[834px]:block">
            <Caps>TrackMan</Caps>
          </div>
          <div className="hidden min-[834px]:block">
            <TrackManKort data={data} />
          </div>
          <div className="hidden min-[834px]:block">
            <Dypere rader={data.dypere.filter((r) => r.tittel !== "Tester")} />
          </div>
        </div>
      </div>
    </div>
  );
}
