"use client";

/**
 * PlayerHQ Gjør — v2 (retning C «Presis»). Komponert fra
 * ui_kits/v2/phq-skjermer.jsx → funksjonen Gjor, men med EKTE data fra
 * getGjennomforeData (src/lib/portal-gjennomfore/gjennomfore-data.ts).
 * Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc UI. Ingen rå hex (T.*).
 *
 * Ærlighet fremfor mockup-fasade: mockupen viser en LIVE repetisjons-teller
 * (treff-rate, «på rad nå», 9/15 treff, hits-prikker). Datakontrakten har ingen
 * live-rep-felter, så de er IKKE fabrikkert — de er meldt som gap. Skjermen
 * bygges av det loaderen faktisk gir: dagens/ventende økter, status og
 * live-inngangen (href) til hver økt.
 *
 * V2Shell (montert i (v2preview)/v2-gjor/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { GjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import {
  T,
  Caps,
  Tittel,
  StatusPill,
  KpiFlis,
  Kort,
  Rad,
  TallHero,
  CTAPill,
  AkseChip,
  TomTilstand,
  Icon,
} from "@/components/v2";

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────── */

/** Minutter → «2,5 t» (≥60) eller «45 min». */
function fmtTid(min: number): string {
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} t`;
  return `${min} min`;
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function GjorV2({ data }: { data: GjennomforeData }) {
  const mobile = useMobile();
  const router = useRouter();
  const { datoTekst, antall, totalMin, nesteOkt, resteAvDagen, fullfortIdag } = data;

  const live = nesteOkt?.status === "now";

  // Adaptivt hode: live-økt · neste økt · alt fullført · tomt.
  let headerCaps: string;
  let titelChildren: string;
  let titelEm: string;
  let headerStatus: ReactNode = null;
  if (nesteOkt && live) {
    headerCaps = `Pågående økt · startet ${nesteOkt.tid}`;
    titelChildren = `${nesteOkt.pyramidArea} ·`;
    titelEm = nesteOkt.tittel;
    headerStatus = <StatusPill tone="lime">Live</StatusPill>;
  } else if (nesteOkt) {
    headerCaps = `Neste økt · ${nesteOkt.relTidTekst}`;
    titelChildren = `${nesteOkt.pyramidArea} ·`;
    titelEm = nesteOkt.tittel;
    headerStatus = <StatusPill tone="info">kl {nesteOkt.tid}</StatusPill>;
  } else {
    headerCaps = datoTekst;
    titelChildren = "Dagens";
    titelEm = "program";
    if (antall > 0) headerStatus = <StatusPill tone="up">Alt fullført</StatusPill>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>{headerCaps}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em={titelEm}>{titelChildren}</Tittel>
          </div>
        </div>
        {headerStatus}
      </div>

      {/* BETA-RUNDE: runde-føring skal nås med maks 2 trykk fra åpnet app —
          alltid synlig her på Gjør, uavhengig av dagens økter. */}
      <Kort tint eyebrow="Runde">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>Spille runde?</div>
            <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 4 }}>
              Før slag for slag på banen — SG beregnes automatisk når du lagrer.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/portal/runde/live" style={{ textDecoration: "none" }}>
              <CTAPill ghost={nesteOkt != null} icon="flag">Før runde slag for slag</CTAPill>
            </Link>
            <Link href="/portal/runde/logg" style={{ textDecoration: "none" }}>
              <CTAPill ghost icon="list">Logg tidligere runde</CTAPill>
            </Link>
          </div>
        </div>
      </Kort>

      {antall === 0 ? (
        <Kort>
          <TomTilstand
            icon="calendar"
            title="Ingen økter i dag"
            sub="Nyt hviledagen — eller legg til en økt i Plan."
          />
        </Kort>
      ) : (
        <>
          {/* KPI-rad — ekte dagssammendrag (mockupens live-rep-fliser finnes ikke i data) */}
          <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: T.gap }}>
            <KpiFlis label="Økter i dag" value={String(antall)} tint />
            <KpiFlis label="Planlagt tid" value={fmtTid(totalMin)} />
            <div className="hidden md:block">
              <KpiFlis label="Fullført" value={`${fullfortIdag.length} / ${antall}`} />
            </div>
          </div>

          {/* Øvelser i økta — drills fra neste/pågående økt (ingen per-drill status i data) */}
          {nesteOkt && (
            <Kort eyebrow="Øvelser i økta" action={<Caps size={9}>{nesteOkt.antallDrills} øvelser</Caps>}>
              {nesteOkt.drillNavn.length > 0 ? (
                nesteOkt.drillNavn.map((navn, i) => (
                  <Rad
                    key={i}
                    leading={
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 9999,
                          flex: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: T.panel2,
                          border: `1px solid ${T.border}`,
                        }}
                      >
                        <Icon name="circle" size={13} style={{ color: T.mut }} />
                      </span>
                    }
                    title={navn}
                    trailing={null}
                    last={i === nesteOkt.drillNavn.length - 1}
                  />
                ))
              ) : (
                <TomTilstand icon="list" title="Ingen øvelser lagt til" sub="Coachen legger til øvelser i Workbench." />
              )}
            </Kort>
          )}

          {/* Live-inngang + avslutt-flyt */}
          {nesteOkt && (
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]" style={{ gap: T.gap }}>
              <Kort tint eyebrow={live ? "Aktiv økt · live-inngang" : "Neste økt"}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
                  <TallHero
                    value={nesteOkt.varighet}
                    unit="min"
                    size={mobile ? 40 : 44}
                    accent
                    sub={`${nesteOkt.sted} · ${nesteOkt.coachNavn}`}
                  />
                  <Link href={nesteOkt.href} style={{ textDecoration: "none" }}>
                    <CTAPill icon="play">{live ? "Fortsett økt" : "Start økt"}</CTAPill>
                  </Link>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <AkseChip a={nesteOkt.pyramidArea} />
                  <StatusPill tone={live ? "lime" : "info"}>
                    {live ? `Live · kl ${nesteOkt.tid}` : nesteOkt.relTidTekst}
                  </StatusPill>
                </div>
              </Kort>

              <Kort eyebrow="Når du er ferdig">
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
                  Logg kvalitet, RPE og følelse — så sendes økta til {nesteOkt.coachNavn} med ett trykk.
                </p>
                <div style={{ marginTop: 12 }}>
                  <Link href={`${nesteOkt.href}?logg=1`} style={{ textDecoration: "none" }}>
                    <CTAPill ghost={!live} icon="send">Avslutt og send</CTAPill>
                  </Link>
                </div>
              </Kort>
            </div>
          )}

          {/* Resten av dagen */}
          {resteAvDagen.length > 0 && (
            <Kort eyebrow="Resten av dagen" action={<Caps size={9}>{resteAvDagen.length} økter</Caps>}>
              {resteAvDagen.map((o, i) => (
                <Rad
                  key={o.id}
                  leading={
                    <span style={{ width: 44, flex: "none", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut }}>
                      {o.tid}
                    </span>
                  }
                  title={o.tittel}
                  sub={o.meta}
                  meta={<AkseChip a={o.pyramidArea} />}
                  onClick={() => router.push(o.href)}
                  last={i === resteAvDagen.length - 1}
                />
              ))}
            </Kort>
          )}

          {/* Fullført i dag */}
          {fullfortIdag.length > 0 && (
            <Kort eyebrow="Fullført i dag" action={<Caps size={9}>{fullfortIdag.length} fullført</Caps>}>
              {fullfortIdag.map((o, i) => (
                <Rad
                  key={o.id}
                  leading={
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 9999,
                        flex: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: T.panel2,
                        border: "1px solid transparent",
                      }}
                    >
                      <Icon name="check" size={13} style={{ color: T.up }} />
                    </span>
                  }
                  title={o.tittel}
                  sub={`${o.tid} · ${o.varighet} min`}
                  trailing={
                    o.trengerLogg ? (
                      <StatusPill tone="warn">Trenger logg</StatusPill>
                    ) : (
                      <StatusPill tone="up">Logget</StatusPill>
                    )
                  }
                  onClick={() => router.push(o.trengerLogg ? `${o.href}?logg=1` : o.href)}
                  last={i === fullfortIdag.length - 1}
                />
              ))}
            </Kort>
          )}
        </>
      )}
    </div>
  );
}
