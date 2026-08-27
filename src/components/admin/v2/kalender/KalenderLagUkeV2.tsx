"use client";

/**
 * AgencyOS Kalender-lag — KA-01/KA-05 (Loop 7/C3, natt-plan bølge 2).
 *
 * Egen, ny flate (`/admin/kalender/lag`) — IKKE samme komponent som
 * `AgencyKalenderV2` (booking-uka på `/admin/kalender`). Viser fem lag på
 * tvers av domenet med øye-toggle (Økter/Skole/Turneringer/Tester/Booking),
 * og KA-05 rom-/sim-kollisjonsvarsel. Ingen Google-lag her (anti-scope:
 * ingen Google-API i Loop 7).
 *
 * Innhold redigeres ALDRI her — kalenderen viser tid og sted, «Åpne i
 * Workbench»/«Vis bookinger»/«Vis tester» sender videre til kilden
 * (fasitens egen regel, KA-01 filmstripen: «ingen formel/reps her»).
 *
 * Desktop (≥1101px, TL_BREKK.macRail): lag-sidebar + ukegrid (dag-lister,
 * ikke pikselnøyaktig tidsakse — porter oppførsel/hierarki, ikke fasitens
 * rå CSS, jf. CLAUDE.md §Design) + inspektørpanel. Mobil: lag-chips +
 * dag-velger + agenda for valgt dag (AG-11-mønster, forenklet fra
 * side-om-side-overlapp til stablet liste).
 *
 * Kun TL — CLAUDE.md invariant 2.
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
import type { KalenderLagUkeData } from "@/app/admin/kalender/lag/data";

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

function Inspektor({ hendelse, data }: { hendelse: KalenderHendelse | null; data: KalenderLagUkeData }) {
  if (!hendelse) {
    return <TlTomTilstand icon="calendar" title="Ingen hendelse valgt" sub="Velg en rad for å se detaljer." />;
  }
  const kolliderer = data.kollidererIder.has(hendelse.id);
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
          {DAG_KORT[data.dager.indexOf(hendelse.dato)] ?? ""} {tidVisning(hendelse)}
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
        <TlKnapp variant="primaer" full style={{ marginTop: 18 }} href="/admin/bookinger">
          Åpne bookinger
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
        {DAG_KORT[data.dager.indexOf(hendelse.dato)] ?? ""} {tidVisning(hendelse)}
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
      return "bookinger";
    case "TESTER":
      return "tester";
    case "TURNERING":
      return "turneringer";
    case "SKOLE":
      return "skole";
  }
}

export function KalenderLagUkeV2({ data }: { data: KalenderLagUkeData }) {
  const mobil = useErMobil(1101);
  const [synligeLag, setSynligeLag] = useState<Set<KalenderLag>>(new Set(ALLE_LAG));
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [valgtDag, setValgtDag] = useState<string>(data.idagIso && data.dager.includes(data.idagIso) ? data.idagIso : data.dager[0]);

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

  const header = (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
          Kalender · Lag
        </div>
        <div style={{ marginTop: 4, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
          {data.periode}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href={data.nav.forrige} className="v2-press v2-focus" style={{ display: "flex", color: TL.mute }}>
          <Icon name="chevron-left" size={16} />
        </Link>
        <Link href={data.nav.idag} className="v2-press v2-focus" style={{ fontSize: 13, color: TL.mute, fontWeight: 600 }}>
          I dag
        </Link>
        <Link href={data.nav.neste} className="v2-press v2-focus" style={{ display: "flex", color: TL.mute }}>
          <Icon name="chevron-right" size={16} />
        </Link>
      </div>
      {antallKollisjoner > 0 && (
        <TlBadge tone="fare">
          {antallKollisjoner} {antallKollisjoner === 1 ? "romkollisjon" : "romkollisjoner"}
        </TlBadge>
      )}
      <div style={{ marginLeft: "auto", fontSize: 13, color: TL.mute }}>
        Oversikt og gjennomføring — innhold redigeres i kilden
      </div>
    </div>
  );

  if (mobil) {
    const dagHendelser = perDag.get(valgtDag) ?? [];
    return (
      <div>
        {header}
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
        <div style={{ display: "flex", marginBottom: 14 }}>
          {data.dager.map((dato, i) => {
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
                <span style={{ fontSize: 11, fontWeight: 600, color: TL.mute }}>{DAG_KORT[i][0]}</span>
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
        {dagHendelser.length === 0 ? (
          <TlTomTilstand icon="calendar" title="Ingen hendelser denne dagen" sub="Ingen av de synlige lagene har noe her." />
        ) : (
          <div>
            {dagHendelser.map((h) => (
              <TlRad
                key={h.id}
                title={h.tittel}
                sub={`${LAG_LABEL[h.lag]}${h.undertekst ? ` · ${h.undertekst}` : ""}`}
                meta={tidVisning(h)}
                trailing={data.kollidererIder.has(h.id) ? <Icon name="triangle-alert" size={14} style={{ color: TL.text }} /> : undefined}
                href={h.href}
                chevron={!!h.href}
              />
            ))}
          </div>
        )}
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
          {data.dager.map((dato, i) => {
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
                      kolliderer={data.kollidererIder.has(h.id)}
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
          <Inspektor hendelse={valgtHendelse} data={data} />
        </div>
      </div>
    </div>
  );
}
