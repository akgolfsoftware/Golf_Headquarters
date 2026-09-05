"use client";

/**
 * PlayerHQ · Min kurve — Train-lock (Ø19, 05.09.2026).
 *
 * Fasit: designsystem/train-lock/PH-21 Min kurve.dc.html
 *   (PH-21a Min kurve iPhone · PH-21b Min kurve desktop 1280 · PH-21c Min kurve tom iPhone)
 *   + designsystem/train-lock/PH-21L Min kurve lys.dc.html (Lys PH-21a/b/c — kun tokenbytte).
 *
 * Fargegrammatikk (DESIGN-SYSTEM §1, 30.08): kurven og båndet er spillerens
 * egne data → `TL.viz.dot` (#B08968, «shot»). Aktivt sesongvalg → `TL.viz.target`.
 * Hvit er hierarki, aldri en dataserie. Ingen persentil, ingen kullrangering —
 * plassering står alltid som «innen klasse».
 *
 * TruthLayer: alle tall kommer ferdig regnet fra `byggMinKurve` (ren, testet).
 * Denne komponenten regner ingenting selv utover geometri.
 *
 * Bevisst avvik fra fasiten: turneringsradene er ikke trykkbare — det finnes
 * ingen detaljside for en enkelt turnering på spillerflaten, og en press-
 * tilstand uten mål er en falsk affordanse.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { TilbakeLenke } from "@/components/v2";
import { TL, TL_BREKK } from "@/lib/v2/train-lock";
import { fmtSlag, fmtToPar, type KurvePunkt, type MinKurve } from "@/lib/domain/min-kurve";

export type SesongLenke = { label: string; href: string; aktiv: boolean };

export type MinKurveProps = {
  kurve: MinKurve;
  dataSistHentet: Date | null;
  sesongLenker: SesongLenke[];
  /** Hvor «Se turneringsprogrammet» peker i tom tilstand. */
  programHref: string;
  /** Tilbake til Analyse-huben — fasitens «‹ Analyse»-rad. */
  tilbakeHref: string;
};

const DATO = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });
const DATO_KORT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
const MND_KORT = new Intl.DateTimeFormat("nb-NO", { month: "short", timeZone: "Europe/Oslo" });

const KILDE = "Norsk turneringsdata";

function fmtDato(d: Date): string {
  return DATO.format(d);
}
function fmtMnd(d: Date): string {
  return MND_KORT.format(d).replace(".", "").toUpperCase();
}

type Skjerm = "compact" | "wide";

function useSkjerm(): Skjerm {
  const [s, setS] = useState<Skjerm>("compact");
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${TL_BREKK.macRail}px)`);
    const oppdater = () => setS(mq.matches ? "wide" : "compact");
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return s;
}

/* ── Små byggesteiner (fasitens eksakte verdier) ──────────────────────────── */

const caps: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: TL.mute,
};
const meta13: React.CSSProperties = { fontSize: 13, color: TL.mute, lineHeight: 1.5 };
const kropp15: React.CSSProperties = { fontSize: 15, fontWeight: 600, lineHeight: 1.5 };
const tab: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

function Flate({ children, pad = 20, style }: { children: React.ReactNode; pad?: number | string; style?: React.CSSProperties }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: pad, minWidth: 0, ...style }}>
      {children}
    </div>
  );
}

function PrimaerLenke({ href, children, style }: { href: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <Link
      href={href}
      className="v2-press v2-focus"
      style={{
        height: 48,
        borderRadius: TL.radius.pill,
        background: TL.fill,
        color: TL.onFill,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 700,
        textDecoration: "none",
        ...style,
      }}
    >
      {children}
    </Link>
  );
}

function Legende({ rad }: { rad?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: rad ? "row" : "column", alignItems: rad ? "center" : "stretch", gap: rad ? 24 : 8 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: TL.mute }}>
        <span style={{ width: 16, height: 3, borderRadius: 2, background: TL.viz.dot, flexShrink: 0 }} />
        Snitt til-par i turneringen
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: TL.mute }}>
        <span style={{ width: 16, height: 10, borderRadius: 2, background: TL.viz.dot, opacity: 0.42, flexShrink: 0 }} />
        Beste og verste runde i samme turnering
      </span>
    </div>
  );
}

/* ── Kurven ───────────────────────────────────────────────────────────────── */

type KurveGeo = { w: number; h: number; venstre: number; hoyre: number; topp: number; bunn: number; prikk: number; sistePrikk: number };

const GEO_MOBIL: KurveGeo = { w: 340, h: 180, venstre: 14, hoyre: 330, topp: 9, bunn: 170, prikk: 4.5, sistePrikk: 7 };
const GEO_DESKTOP: KurveGeo = { w: 900, h: 320, venstre: 60, hoyre: 860, topp: 11, bunn: 290, prikk: 5, sistePrikk: 8 };

function xFor(i: number, n: number, g: KurveGeo): number {
  if (n <= 1) return (g.venstre + g.hoyre) / 2;
  return g.venstre + (i * (g.hoyre - g.venstre)) / (n - 1);
}

function Kurve({ punkter, yAkse, geo }: { punkter: KurvePunkt[]; yAkse: MinKurve["yAkse"]; geo: KurveGeo }) {
  const n = punkter.length;
  const spenn = Math.max(1, yAkse.maks - yAkse.min);
  const y = (v: number) => geo.topp + ((yAkse.maks - v) / spenn) * (geo.bunn - geo.topp);
  const pts = punkter.map((p, i) => ({ x: xFor(i, n, geo), y: y(p.snitt), beste: p.beste, verste: p.verste }));

  // Bånd-polygoner per sammenhengende løp av punkter med bånd (aldri et
  // anslag der båndet mangler).
  const baand: string[] = [];
  let lop: typeof pts = [];
  const flush = () => {
    if (lop.length >= 2) {
      const over = lop.map((p) => `${p.x} ${y(p.verste as number)}`).join(" L");
      const under = [...lop].reverse().map((p) => `${p.x} ${y(p.beste as number)}`).join(" L");
      baand.push(`M${over} L${under} Z`);
    }
    lop = [];
  };
  for (const p of pts) {
    if (p.beste != null && p.verste != null) lop.push(p);
    else flush();
  }
  flush();

  const linje = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const midt = yAkse.etiketter[1];

  return (
    <svg width="100%" height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} preserveAspectRatio="none" style={{ display: "block", color: TL.text }} aria-hidden="true">
      <path d={`M${geo.venstre} ${y(yAkse.maks)} H${geo.hoyre} M${geo.venstre} ${y(midt)} H${geo.hoyre}`} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
      <path d={`M${geo.venstre} ${geo.bunn} H${geo.hoyre}`} stroke="currentColor" strokeOpacity={0.14} strokeWidth={1.5} />
      {geo === GEO_DESKTOP && <path d={`M${geo.venstre} ${geo.topp + 19} V${geo.bunn}`} stroke="currentColor" strokeOpacity={0.14} strokeWidth={1.5} />}
      {baand.map((d, i) => (
        <path key={i} d={d} fill={TL.viz.dot} fillOpacity={0.22} />
      ))}
      {n > 1 && <path d={linje} stroke={TL.viz.dot} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === n - 1 ? geo.sistePrikk : geo.prikk} fill={TL.viz.dot} />
      ))}
    </svg>
  );
}

function XEtiketter({ punkter, geo, kort }: { punkter: KurvePunkt[]; geo: KurveGeo; kort: boolean }) {
  const n = punkter.length;
  const etiketter: { pct: number; tekst: string; siste: boolean }[] = [];
  let forrigeMnd = "";
  punkter.forEach((p, i) => {
    const tekst = kort ? fmtMnd(p.dato) : DATO_KORT.format(p.dato);
    const siste = i === n - 1;
    if (kort && tekst === forrigeMnd) {
      // Én etikett per måned — den siste turneringen vinner over den forrige i samme måned.
      if (!siste) return;
      etiketter.pop();
    }
    forrigeMnd = tekst;
    etiketter.push({ pct: (xFor(i, n, geo) / geo.w) * 100, tekst, siste });
  });
  return (
    <div style={{ position: "relative", height: 19, paddingTop: 8 }}>
      {etiketter.map((e, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: 8,
            left: `${e.pct}%`,
            transform: i === 0 ? "none" : i === etiketter.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
            fontSize: 11,
            fontWeight: 600,
            color: e.siste ? TL.text : TL.mute,
            ...tab,
          }}
        >
          {e.tekst}
        </span>
      ))}
    </div>
  );
}

function YEtiketter({ yAkse, bredde, padding }: { yAkse: MinKurve["yAkse"]; bredde: number; padding: string }) {
  return (
    <div style={{ width: bredde, display: "flex", flexDirection: "column", justifyContent: "space-between", padding, flexShrink: 0 }}>
      {yAkse.etiketter.map((v) => (
        <span key={v} style={{ fontSize: 11, fontWeight: 600, color: TL.mute, ...tab }}>
          {v > 0 ? `+${v}` : `${v}`}
        </span>
      ))}
    </div>
  );
}

/* ── Turneringsliste ──────────────────────────────────────────────────────── */

function plasseringTekst(p: KurvePunkt): string {
  return p.plassering != null ? `${p.plassering}. innen klasse` : "plassering ikke registrert";
}

function TurneringslisteMobil({ punkter }: { punkter: KurvePunkt[] }) {
  const nyesteForst = [...punkter].reverse();
  return (
    <Flate pad="4px 20px">
      {nyesteForst.map((p, i) => (
        <div
          key={p.turneringId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 0",
            borderBottom: i < nyesteForst.length - 1 ? `1px solid ${TL.hair}` : "none",
            minWidth: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.navn}</div>
            <div style={{ marginTop: 2, fontSize: 13, color: TL.mute, ...tab }}>
              {fmtDato(p.dato)} · {p.runder} {p.runder === 1 ? "runde" : "runder"} · {plasseringTekst(p)}
            </div>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, ...tab }}>{fmtToPar(p.snitt)}</span>
        </div>
      ))}
    </Flate>
  );
}

function TurneringstabellDesktop({ punkter }: { punkter: KurvePunkt[] }) {
  const nyesteForst = [...punkter].reverse();
  const kol: React.CSSProperties[] = [
    { width: 100 },
    { flex: 1, minWidth: 0 },
    { width: 90, textAlign: "right" },
    { width: 120, textAlign: "right" },
    { width: 150, textAlign: "right" },
  ];
  return (
    <Flate pad="4px 22px">
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: `1px solid ${TL.hair}` }}>
        {["Dato", "Turnering", "Runder", "Snitt til-par", "Plassering"].map((t, i) => (
          <span key={t} style={{ ...caps, ...kol[i] }}>
            {t}
          </span>
        ))}
      </div>
      {nyesteForst.map((p, i) => (
        <div
          key={p.turneringId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 0",
            borderBottom: i < nyesteForst.length - 1 ? `1px solid ${TL.hair}` : "none",
          }}
        >
          <span style={{ ...kol[0], fontSize: 15, fontWeight: 600, color: TL.mute, ...tab }}>{fmtDato(p.dato)}</span>
          <span style={{ ...kol[1], fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.navn}</span>
          <span style={{ ...kol[2], fontSize: 15, fontWeight: 600, ...tab }}>{p.runder}</span>
          <span style={{ ...kol[3], fontSize: 15, fontWeight: 600, ...tab }}>{fmtToPar(p.snitt)}</span>
          <span style={{ ...kol[4], fontSize: 15, fontWeight: 600, color: TL.mute, ...tab }}>{plasseringTekst(p)}</span>
        </div>
      ))}
    </Flate>
  );
}

/* ── Tom tilstand (PH-21c) ────────────────────────────────────────────────── */

function MinKurveTom({ kurve, dataSistHentet, programHref }: { kurve: MinKurve; dataSistHentet: Date | null; programHref: string }) {
  const under = kurve.koblet
    ? "Kurven begynner på den første runden du spiller i klasse. Da har du et punkt — og etter to turneringer har du en retning."
    : "Når profilen din er koblet, dukker turneringene dine opp her av seg selv.";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
      <Flate pad="22px 20px">
        <svg width="100%" height={140} viewBox="0 0 320 140" preserveAspectRatio="none" style={{ display: "block", color: TL.text }} aria-hidden="true">
          <path d="M10 130 H310" stroke="currentColor" strokeOpacity={0.14} strokeWidth={1.5} />
          <path d="M10 20 V130" stroke="currentColor" strokeOpacity={0.14} strokeWidth={1.5} />
          <path d="M10 40 H310 M10 85 H310" stroke="currentColor" strokeOpacity={0.06} strokeWidth={1} />
          <circle cx={10} cy={130} r={6} fill={TL.dim} />
        </svg>
        <div style={{ marginTop: 18, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.35 }}>{kurve.tomGrunn}</div>
        <div style={{ marginTop: 8, ...kropp15, color: TL.mute }}>{under}</div>
      </Flate>

      <Flate>
        <div style={caps}>Hva som havner her</div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {["Snitt til-par per runde i hver turnering", "Beste og verste runde som et bånd rundt linja", "Plassering innen din klasse i turneringen"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: TL.dim, flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: TL.mute }}>{t}</span>
            </div>
          ))}
        </div>
      </Flate>

      <PrimaerLenke href={programHref} style={{ marginTop: 4 }}>
        Se turneringsprogrammet
      </PrimaerLenke>
      <div style={meta13}>
        Kilde: {KILDE}
        {dataSistHentet ? ` · data hentet ${fmtDato(dataSistHentet)}` : ""}
      </div>
    </div>
  );
}

/* ── Hovedkomponent ───────────────────────────────────────────────────────── */

export function MinKurveTrainLock({ kurve, dataSistHentet, sesongLenker, programHref, tilbakeHref }: MinKurveProps) {
  const skjerm = useSkjerm();

  if (kurve.punkter.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TilbakeLenke href={tilbakeHref}>Analyse</TilbakeLenke>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>Min kurve</h1>
        <MinKurveTom kurve={kurve} dataSistHentet={dataSistHentet} programHref={programHref} />
      </div>
    );
  }

  const snitt = kurve.snittSiste;
  const kildeLinje = `Kilde: ${KILDE}${dataSistHentet ? ` · data hentet ${fmtDato(dataSistHentet)}` : ""}`;
  const sesongTittel = kurve.valgtSesong === "alle" ? "Alle sesonger" : `Turneringer ${kurve.valgtSesong}`;
  const alleLenke = sesongLenker.find((l) => l.label === "Alle sesonger");
  const visAlleCta = kurve.sesonger.length > 1 && kurve.valgtSesong !== "alle" && alleLenke;

  if (skjerm === "wide") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Fasitens toppbar (58px): tilbake/brødsmule til venstre, sesongpiller til høyre. */}
        <div style={{ height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: `1px solid ${TL.hair}`, marginBottom: 22 }}>
          <TilbakeLenke href={tilbakeHref}>Analyse</TilbakeLenke>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {sesongLenker.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="v2-press v2-focus"
              aria-current={l.aktiv ? "page" : undefined}
              style={{
                height: 44,
                padding: "0 18px",
                borderRadius: TL.radius.pill,
                background: l.aktiv ? TL.dock : "transparent",
                color: l.aktiv ? TL.viz.target : TL.mute,
                display: "flex",
                alignItems: "center",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                ...tab,
              }}
            >
              {l.label}
            </Link>
          ))}
          </div>
        </div>

        <div style={{ display: "flex", minWidth: 0 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>Min kurve</h1>
                <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600, color: TL.mute }}>Til-par per runde, målt turnering for turnering.</div>
              </div>
              <span style={{ fontSize: 13, color: TL.mute, ...tab }}>{kildeLinje}</span>
            </div>

            <Flate pad={22} style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={caps}>Snitt til-par · siste {snitt?.antall ?? 0} {snitt?.antall === 1 ? "turnering" : "turneringer"}</div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em", ...tab }}>{snitt ? fmtToPar(snitt.verdi) : "—"}</span>
                    {snitt && <span style={{ fontSize: 15, fontWeight: 600, color: TL.mute, ...tab }}>sist {fmtDato(snitt.sistDato)}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={caps}>Bredden på båndet</div>
                  <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", ...tab }}>
                    {kurve.baand ? `${fmtSlag(kurve.baand.forst)} → ${fmtSlag(kurve.baand.sist)} slag` : "—"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
                <YEtiketter yAkse={kurve.yAkse} bredde={34} padding="24px 0 40px" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Kurve punkter={kurve.punkter} yAkse={kurve.yAkse} geo={GEO_DESKTOP} />
                  <XEtiketter punkter={kurve.punkter} geo={GEO_DESKTOP} kort={false} />
                </div>
              </div>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${TL.hair}` }}>
                <Legende rad />
              </div>
            </Flate>

            <div style={{ marginTop: 22, ...caps }}>Turneringshistorikk</div>
            <div style={{ marginTop: 10 }}>
              <TurneringstabellDesktop punkter={kurve.punkter} />
            </div>
            <div style={{ marginTop: 12, ...meta13 }}>Tallet i kolonnen er snittet av rundene dine i den turneringen, ikke én enkelt runde.</div>
          </div>

          <div style={{ width: 340, flexShrink: 0, borderLeft: `1px solid ${TL.hair}`, padding: "0 0 0 24px" }}>
            <div style={caps}>Sesongen din</div>
            <Flate style={{ marginTop: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.35 }}>{kurve.sesongTekst?.tittel}</div>
              <div style={{ marginTop: 8, ...kropp15, color: TL.mute }}>{kurve.sesongTekst?.under}</div>
            </Flate>

            <div style={{ marginTop: 22, ...caps }}>Grunnlaget</div>
            <Flate pad="4px 18px" style={{ marginTop: 10 }}>
              {[
                ["Turneringer", String(kurve.grunnlag.turneringer)],
                ["Runder", String(kurve.grunnlag.runder)],
                ["Beste runde", kurve.grunnlag.besteRunde ? `${fmtToPar(kurve.grunnlag.besteRunde.toPar)} · ${fmtDato(kurve.grunnlag.besteRunde.dato)}` : "—"],
                ["Data hentet", dataSistHentet ? fmtDato(dataSistHentet) : "—"],
              ].map(([k, v], i, arr) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: i < arr.length - 1 ? `1px solid ${TL.hair}` : "none" }}>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: TL.mute, ...tab }}>{v}</span>
                </div>
              ))}
            </Flate>

            {visAlleCta && (
              <PrimaerLenke href={alleLenke.href} style={{ marginTop: 18 }}>
                Se alle sesonger
              </PrimaerLenke>
            )}
            <div style={{ marginTop: 14, ...meta13 }}>Kurven sammenligner deg med deg selv. Vi viser deg ikke plassering i årskullet.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ marginBottom: 16 }}>
        <TilbakeLenke href={tilbakeHref}>Analyse</TilbakeLenke>
      </div>
      <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>Min kurve</h1>
      <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600, color: TL.mute, lineHeight: 1.45 }}>Til-par per runde, turnering for turnering. Bare din egen linje.</div>

      <Flate style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em", ...tab }}>{snitt ? fmtToPar(snitt.verdi) : "—"}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: TL.mute }}>snitt til-par</span>
        </div>
        <div style={{ marginTop: 6, ...meta13, ...tab }}>
          {snitt && (
            <>
              Snitt per runde i {snitt.antall === 1 ? "den siste turneringen" : `de ${snitt.antall} siste turneringene`} · sist {fmtDato(snitt.sistDato)}
              <br />
            </>
          )}
          {kildeLinje}
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <YEtiketter yAkse={kurve.yAkse} bredde={30} padding="2px 0 30px" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Kurve punkter={kurve.punkter} yAkse={kurve.yAkse} geo={GEO_MOBIL} />
            <XEtiketter punkter={kurve.punkter} geo={GEO_MOBIL} kort />
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${TL.hair}` }}>
          <Legende />
        </div>
      </Flate>

      {kurve.baandTekst && (
        <Flate style={{ marginTop: 12 }}>
          <div style={caps}>Båndet</div>
          <div style={{ marginTop: 8, ...kropp15 }}>{kurve.baandTekst}</div>
        </Flate>
      )}

      <div style={{ marginTop: 22, ...caps }}>{sesongTittel}</div>
      <div style={{ marginTop: 10 }}>
        <TurneringslisteMobil punkter={kurve.punkter} />
      </div>

      {visAlleCta && (
        <PrimaerLenke href={alleLenke.href} style={{ marginTop: 16 }}>
          Se alle sesonger
        </PrimaerLenke>
      )}
      <div style={{ marginTop: 12, ...meta13 }}>Plasseringen er innen din klasse i den turneringen — den sier ingenting om hvor du står i årskullet.</div>
    </div>
  );
}
