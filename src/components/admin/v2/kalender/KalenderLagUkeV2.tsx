"use client";

/**
 * AgencyOS Kalender — KA-01/KA-02/KA-03/KA-05 (C3 lag + T7 samling).
 *
 * Fasit: designsystem/train-lock/KA-01 Agency Kalender uke Mac.dc.html
 * (mekanisk invertert lys = KA-01L Kalender uke lys.dc.html — verifisert
 * PX-6 28.08: ingen hardkodet hex i denne fila, lys følger token-swap),
 * KA-02 Agency Kalender maned Mac.dc.html (måned-rutenettet),
 * KA-03 Agency Kalender agenda iPhone.dc.html (mobil/dag-agendaen),
 * KA-05 Agency Kollisjon rom.dc.html (kollisjons-indikatoren på
 * BOOKING-laget).
 *
 * Én flate på `/admin/kalender`: uke (default), måned og dag. Fem lag med
 * øye-toggle. Booking er et lag — detalj/ny/tilgjengelighet er egne ruter
 * (wizard og skriveflyt), lenket herfra. Ingen Google.
 *
 * Ukegrid er kronologisk dag-liste, ikke pikselnøyaktig tidsakse
 * (CLAUDE.md §Design: port oppførsel/hierarki). Kun TL.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import {
  TlBadge,
  TlKnapp,
  TlRad,
  TlSwitchRad,
  TlTomTilstand,
} from "@/components/admin/v2/oppsett/tl-kit";
import {
  ALLE_LAG,
  klokkeslett,
  LAG_LABEL,
  LAG_MENY_LABEL,
  synlige,
  type KalenderHendelse,
  type KalenderLag,
} from "@/lib/domain/kalender-lag";
import type { KalenderLagUkeData, KalenderVisning } from "@/app/admin/kalender/lag/data";

function useErMobil(breakpointPx: number): boolean {
  const [mobil, setMobil] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const oppdater = () => setMobil(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, [breakpointPx]);
  return mobil;
}

const DAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function tidVisning(h: KalenderHendelse): string {
  if (h.heldag || h.startMin === null) return "Hele dagen";
  const start = klokkeslett(h.startMin);
  if (h.sluttMin === null) return start;
  return `${start}–${klokkeslett(h.sluttMin)}`;
}

function dagKortFor(data: KalenderLagUkeData, dato: string): string {
  if (data.visning === "maned") {
    const idx = data.rutenett.findIndex((c) => c.dato === dato);
    return DAG_KORT[idx === -1 ? 0 : idx % 7] ?? "";
  }
  const i = data.dager.indexOf(dato);
  return DAG_KORT[i] ?? "";
}

function HendelseKort({
  h,
  kolliderer,
  valgt,
  onVelg,
}: {
  h: KalenderHendelse;
  kolliderer: boolean;
  valgt: boolean;
  onVelg: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onVelg}
      className="v2-press v2-focus"
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        appearance: "none",
        border: "none",
        cursor: "pointer",
        background: TL.dock,
        borderRadius: TL.radius.card,
        padding: "8px 10px",
        marginBottom: 6,
        opacity: h.lesevisning ? 0.7 : 1,
        boxShadow: valgt
          ? `inset 0 0 0 2px ${TL.text}`
          : kolliderer
            ? `inset 0 0 0 2px ${TL.text}`
            : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: TL.mute,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {LAG_LABEL[h.lag]}
          {h.undertekst ? ` · ${h.undertekst}` : ""}
        </span>
        {kolliderer && <Icon name="triangle-alert" size={11} style={{ color: TL.text, flexShrink: 0 }} />}
      </div>
      <div
        style={{
          marginTop: 2,
          fontSize: 13,
          fontWeight: 600,
          color: TL.text,
          lineHeight: 1.25,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {h.tittel}
      </div>
      <div
        style={{
          marginTop: 2,
          fontSize: 11,
          color: TL.mute,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {tidVisning(h)}
      </div>
    </button>
  );
}

function LagSidebar({
  synligeLag,
  setSynligeLag,
}: {
  synligeLag: Set<KalenderLag>;
  setSynligeLag: (v: Set<KalenderLag>) => void;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TL.mute,
          marginBottom: 4,
        }}
      >
        Lag
      </div>
      {ALLE_LAG.map((lag, i) => (
        <TlSwitchRad
          key={lag}
          title={LAG_MENY_LABEL[lag]}
          sub={lag === "SKOLE" ? "Lesevisning" : undefined}
          on={synligeLag.has(lag)}
          onChange={() => {
            const neste = new Set(synligeLag);
            if (neste.has(lag)) neste.delete(lag);
            else neste.add(lag);
            setSynligeLag(neste);
          }}
          last={i === ALLE_LAG.length - 1}
        />
      ))}
      <div style={{ marginTop: 12, fontSize: 12, color: TL.mute, lineHeight: 1.55 }}>
        Kalenderen viser tid og sted. Innhold redigeres i Workbench, tester og bookinger.
      </div>
    </div>
  );
}

function Inspektor({
  hendelse,
  data,
  kollidererIder,
}: {
  hendelse: KalenderHendelse | null;
  data: KalenderLagUkeData;
  kollidererIder: Set<string>;
}) {
  if (!hendelse) {
    return <TlTomTilstand icon="calendar" title="Ingen hendelse valgt" sub="Velg en rad for å se detaljer." />;
  }
  const kolliderer = kollidererIder.has(hendelse.id);
  if (kolliderer) {
    const motparter = (hendelse.kollidererMed ?? [])
      .map((id) => data.hendelser.find((h) => h.id === id))
      .filter((h): h is KalenderHendelse => !!h);
    return (
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          Kollisjon · {hendelse.undertekst?.split(" · ").pop() ?? "Rom"}
        </div>
        <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
          {dagKortFor(data, hendelse.dato)} {tidVisning(hendelse)}
        </div>
        <div style={{ marginTop: 14 }}>
          {[hendelse, ...motparter].map((m, i) => (
            <div key={m.id} style={{ padding: "11px 0", borderBottom: i < motparter.length ? `1px solid ${TL.hair}` : "none" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>× {m.tittel}</div>
              <div style={{ marginTop: 2, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                {tidVisning(m)} · {LAG_LABEL[m.lag].toLowerCase()}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
          Ett rom, to bookinger. Flytt en av dem — treningsinnholdet påvirkes ikke.
        </div>
        <TlKnapp variant="primaer" full style={{ marginTop: 18 }} href={hendelse.href ?? data.nav.nyBookingHref}>
          Bytt tid
        </TlKnapp>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
        {LAG_LABEL[hendelse.lag]}
        {hendelse.undertekst ? ` · ${hendelse.undertekst}` : ""}
      </div>
      <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
        {hendelse.tittel}
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
        {dagKortFor(data, hendelse.dato)} {tidVisning(hendelse)}
      </div>
      <div style={{ marginTop: 14, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
        {hendelse.lesevisning
          ? "Skole er lesevisning — endres i skoleruta, ikke her."
          : "Innholdet redigeres i kilden. Kalenderen viser kun tid og sted."}
      </div>
      {hendelse.href && (
        <TlKnapp variant="primaer" full style={{ marginTop: 18 }} href={hendelse.href}>
          Åpne i {hrefLabel(hendelse.lag)}
        </TlKnapp>
      )}
    </div>
  );
}

function hrefLabel(lag: KalenderLag): string {
  switch (lag) {
    case "OEKTER":
      return "Workbench";
    case "BOOKING":
      return "bookingen";
    case "TESTER":
      return "tester";
    case "TURNERING":
      return "turneringer";
    case "SKOLE":
      return "skole";
  }
}

function VisningBytte({ nav, visning }: { nav: KalenderLagUkeData["nav"]; visning: KalenderVisning }) {
  const valg: { id: KalenderVisning; label: string; href: string }[] = [
    { id: "dag", label: "Dag", href: nav.dagHref },
    { id: "uke", label: "Uke", href: nav.ukeHref },
    { id: "maned", label: "Måned", href: nav.manedHref },
  ];
  return (
    <div
      role="tablist"
      aria-label="Kalendervisning"
      style={{
        height: 36,
        background: TL.dock,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        padding: 3,
        gap: 2,
      }}
    >
      {valg.map((v) => {
        const aktiv = visning === v.id;
        return (
          <Link
            key={v.id}
            href={v.href}
            role="tab"
            aria-selected={aktiv}
            className="v2-press v2-focus"
            style={{
              height: 30,
              borderRadius: 999,
              padding: "0 12px",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              background: aktiv ? TL.fill : "none",
              color: aktiv ? TL.onFill : TL.mute,
            }}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}

function LagChips({
  synligeLag,
  setSynligeLag,
}: {
  synligeLag: Set<KalenderLag>;
  setSynligeLag: (v: Set<KalenderLag>) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
      {ALLE_LAG.map((lag) => {
        const aktiv = synligeLag.has(lag);
        return (
          <button
            key={lag}
            type="button"
            className="v2-press v2-focus"
            onClick={() => {
              const neste = new Set(synligeLag);
              if (neste.has(lag)) neste.delete(lag);
              else neste.add(lag);
              setSynligeLag(neste);
            }}
            style={{
              appearance: "none",
              border: "none",
              cursor: "pointer",
              flex: "none",
              height: 30,
              padding: "0 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              background: aktiv ? TL.dim : "transparent",
              color: aktiv ? TL.text : TL.mute,
              boxShadow: aktiv ? "none" : `inset 0 0 0 1px ${TL.hair}`,
              whiteSpace: "nowrap",
            }}
          >
            {LAG_MENY_LABEL[lag]}
          </button>
        );
      })}
    </div>
  );
}

function AgendaListe({
  hendelser,
  kollidererIder,
}: {
  hendelser: KalenderHendelse[];
  kollidererIder: Set<string>;
}) {
  if (hendelser.length === 0) {
    return <TlTomTilstand icon="calendar" title="Ingen hendelser denne dagen" sub="Ingen av de synlige lagene har noe her." />;
  }
  return (
    <div>
      {hendelser.map((h) => (
        <TlRad
          key={h.id}
          title={h.tittel}
          sub={`${LAG_LABEL[h.lag]}${h.undertekst ? ` · ${h.undertekst}` : ""}`}
          meta={tidVisning(h)}
          trailing={kollidererIder.has(h.id) ? <Icon name="triangle-alert" size={14} style={{ color: TL.text }} /> : undefined}
          href={h.href}
          chevron={!!h.href}
        />
      ))}
    </div>
  );
}

export function KalenderLagUkeV2({
  data,
  startLag,
}: {
  data: KalenderLagUkeData;
  startLag?: KalenderLag;
}) {
  const mobil = useErMobil(1101);
  const [synligeLag, setSynligeLag] = useState<Set<KalenderLag>>(
    () => new Set(startLag ? [startLag] : ALLE_LAG),
  );
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [valgtDag, setValgtDag] = useState<string>(() => {
    if (data.visning === "dag") {
      const fraNav = data.dager.find((d) => data.nav.dagHref.includes(d));
      if (fraNav) return fraNav;
    }
    if (data.idagIso && data.dager.includes(data.idagIso)) return data.idagIso;
    return data.dager.find((d) => data.rutenett.find((c) => c.dato === d)?.iManed) ?? data.dager[0] ?? "";
  });

  const kollidererIder = useMemo(() => new Set(data.kollidererIder), [data.kollidererIder]);
  const synligeHendelser = useMemo(() => synlige(data.hendelser, synligeLag), [data.hendelser, synligeLag]);
  const perDag = useMemo(() => {
    const m = new Map<string, KalenderHendelse[]>();
    for (const dato of data.dager) m.set(dato, []);
    for (const h of synligeHendelser) {
      const liste = m.get(h.dato);
      if (liste) liste.push(h);
    }
    for (const [dato, liste] of m) {
      m.set(
        dato,
        [...liste].sort((a, b) => (a.startMin ?? -1) - (b.startMin ?? -1)),
      );
    }
    return m;
  }, [synligeHendelser, data.dager]);

  const valgtHendelse = valgtId ? (data.hendelser.find((h) => h.id === valgtId) ?? null) : null;
  const antallKollisjoner = data.kollisjoner.length;
  const visAgenda = mobil || data.visning === "dag";
  const visManed = data.visning === "maned" && !visAgenda;

  const header = (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
          Kalender
        </div>
        <div style={{ marginTop: 4, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
          {data.periode}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href={data.nav.forrige} className="v2-press v2-focus" style={{ display: "flex", color: TL.mute }} aria-label="Forrige">
          <Icon name="chevron-left" size={16} />
        </Link>
        <Link href={data.nav.idag} className="v2-press v2-focus" style={{ fontSize: 13, color: TL.mute, fontWeight: 600 }}>
          I dag
        </Link>
        <Link href={data.nav.neste} className="v2-press v2-focus" style={{ display: "flex", color: TL.mute }} aria-label="Neste">
          <Icon name="chevron-right" size={16} />
        </Link>
      </div>
      <VisningBytte nav={data.nav} visning={data.visning} />
      {antallKollisjoner > 0 && (
        <TlBadge tone="fare">
          {antallKollisjoner} {antallKollisjoner === 1 ? "romkollisjon" : "romkollisjoner"}
        </TlBadge>
      )}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href={data.nav.tilgjengelighetHref}
          className="v2-press v2-focus"
          style={{ fontSize: 13, color: TL.mute, fontWeight: 600, textDecoration: "none" }}
        >
          Tilgjengelighet
        </Link>
        <TlKnapp variant="primaer" href={data.nav.nyBookingHref}>
          Ny booking
        </TlKnapp>
      </div>
    </div>
  );

  if (visAgenda && data.visning === "maned") {
    const dagHendelser = perDag.get(valgtDag) ?? [];
    return (
      <div>
        {header}
        <LagChips synligeLag={synligeLag} setSynligeLag={setSynligeLag} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 4,
            marginBottom: 16,
          }}
        >
          {DAG_KORT.map((n) => (
            <div key={n} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: TL.mute, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {n}
            </div>
          ))}
          {data.rutenett.map((celle) => {
            const aktiv = celle.dato === valgtDag;
            const erIdag = celle.dato === data.idagIso;
            const n = perDag.get(celle.dato)?.length ?? 0;
            return (
              <button
                key={celle.dato}
                type="button"
                onClick={() => setValgtDag(celle.dato)}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  border: "none",
                  cursor: "pointer",
                  background: aktiv ? TL.fill : "transparent",
                  color: aktiv ? TL.onFill : celle.iManed ? TL.text : TL.mute,
                  borderRadius: 8,
                  padding: "8px 0 6px",
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: aktiv || erIdag ? 700 : 400,
                  boxShadow: !aktiv && erIdag ? `inset 0 0 0 1.5px ${TL.text}` : "none",
                  opacity: celle.iManed ? 1 : 0.45,
                }}
              >
                <div style={{ fontSize: 13 }}>{Number(celle.dato.slice(8, 10))}</div>
                {n > 0 && (
                  <div style={{ fontSize: 9, marginTop: 2, opacity: 0.8 }}>
                    {n}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <AgendaListe hendelser={dagHendelser} kollidererIder={kollidererIder} />
      </div>
    );
  }

  if (visAgenda) {
    const ukeDager = data.dager.slice(0, 7);
    const dagHendelser = perDag.get(valgtDag) ?? [];
    return (
      <div>
        {header}
        <LagChips synligeLag={synligeLag} setSynligeLag={setSynligeLag} />
        <div style={{ display: "flex", marginBottom: 14 }}>
          {ukeDager.map((dato, i) => {
            const aktiv = dato === valgtDag;
            const erIdag = dato === data.idagIso;
            return (
              <button
                key={dato}
                type="button"
                onClick={() => setValgtDag(dato)}
                className="v2-press v2-focus"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 0",
                  appearance: "none",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: TL.mute }}>{DAG_KORT[i]?.[0]}</span>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: aktiv ? 700 : erIdag ? 600 : 400,
                    background: aktiv ? TL.fill : "transparent",
                    color: aktiv ? TL.onFill : TL.text,
                    boxShadow: !aktiv && erIdag ? `inset 0 0 0 1.5px ${TL.text}` : "none",
                  }}
                >
                  {Number(dato.slice(8, 10))}
                </span>
              </button>
            );
          })}
        </div>
        <AgendaListe hendelser={dagHendelser} kollidererIder={kollidererIder} />
      </div>
    );
  }

  if (visManed) {
    return (
      <div>
        {header}
        <div style={{ display: "flex", gap: 0, minHeight: 0 }}>
          <div style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${TL.hair}`, paddingRight: 16 }}>
            <LagSidebar synligeLag={synligeLag} setSynligeLag={setSynligeLag} />
          </div>
          <div style={{ flex: 1, minWidth: 0, padding: "0 16px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 0,
                borderTop: `1px solid ${TL.hair}`,
                borderLeft: `1px solid ${TL.hair}`,
              }}
            >
              {DAG_KORT.map((n) => (
                <div
                  key={n}
                  style={{
                    textAlign: "center",
                    padding: "8px 0",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: TL.mute,
                    borderRight: `1px solid ${TL.hair}`,
                    borderBottom: `1px solid ${TL.hair}`,
                  }}
                >
                  {n}
                </div>
              ))}
              {data.rutenett.map((celle) => {
                const liste = perDag.get(celle.dato) ?? [];
                const erIdag = celle.dato === data.idagIso;
                const synlig = liste.slice(0, 3);
                return (
                  <div
                    key={celle.dato}
                    style={{
                      minHeight: 92,
                      minWidth: 0,
                      padding: "6px 6px 8px",
                      borderRight: `1px solid ${TL.hair}`,
                      borderBottom: `1px solid ${TL.hair}`,
                      opacity: celle.iManed ? 1 : 0.4,
                      background: erIdag ? TL.dock : "transparent",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: erIdag ? 700 : 500,
                        fontVariantNumeric: "tabular-nums",
                        color: TL.text,
                        marginBottom: 4,
                      }}
                    >
                      {Number(celle.dato.slice(8, 10))}
                    </div>
                    {synlig.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setValgtId(h.id)}
                        className="v2-press v2-focus"
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          appearance: "none",
                          border: "none",
                          cursor: "pointer",
                          background: valgtId === h.id ? TL.dim : "transparent",
                          color: TL.text,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 4px",
                          borderRadius: 4,
                          marginBottom: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {LAG_LABEL[h.lag]} {h.tittel}
                      </button>
                    ))}
                    {liste.length > 3 && (
                      <div style={{ fontSize: 10, color: TL.mute, paddingLeft: 4 }}>+{liste.length - 3}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ width: 300, flexShrink: 0, borderLeft: `1px solid ${TL.hair}`, paddingLeft: 20 }}>
            <Inspektor hendelse={valgtHendelse} data={data} kollidererIder={kollidererIder} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}
      <div style={{ display: "flex", gap: 0, minHeight: 0 }}>
        <div style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${TL.hair}`, paddingRight: 16 }}>
          <LagSidebar synligeLag={synligeLag} setSynligeLag={setSynligeLag} />
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 10,
            padding: "0 16px",
          }}
        >
          {data.dager.slice(0, 7).map((dato, i) => {
            const erIdag = dato === data.idagIso;
            const liste = perDag.get(dato) ?? [];
            return (
              <div key={dato} style={{ minWidth: 0 }}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "0 0 8px",
                    borderBottom: `1px solid ${TL.hair}`,
                    marginBottom: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: erIdag ? TL.text : TL.mute,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {DAG_KORT[i]} {Number(dato.slice(8, 10))}
                </div>
                {liste.length === 0 ? (
                  <div style={{ fontSize: 11, color: TL.mute, textAlign: "center", padding: "8px 0" }}>—</div>
                ) : (
                  liste.map((h) => (
                    <HendelseKort
                      key={h.id}
                      h={h}
                      kolliderer={kollidererIder.has(h.id)}
                      valgt={valgtId === h.id}
                      onVelg={() => setValgtId(h.id)}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
        <div style={{ width: 300, flexShrink: 0, borderLeft: `1px solid ${TL.hair}`, paddingLeft: 20 }}>
          <Inspektor hendelse={valgtHendelse} data={data} kollidererIder={kollidererIder} />
        </div>
      </div>
    </div>
  );
}
