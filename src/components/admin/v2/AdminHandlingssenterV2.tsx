"use client";

/**
 * AgencyOS Handlingssenter — v2 (retning C «Presis»). Coach-kontekst: alle
 * åpne handlinger/oppgaver samlet, gruppert etter hastegrad. Ingen mockup
 * fantes — komponert utelukkende av v2-biblioteket (src/components/v2), ingen
 * ad-hoc UI-primitiver, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart fra den ekte skjermen
 * (src/app/admin/handlingssenter/page.tsx + handlingssenter-client.tsx):
 *   - OppgaveCache-rader (Notion-sync) med samme sortering (forfaller asc).
 *   - Filtre alle/haster/mine/ferdig med teller (single-select, som originalen).
 *   - Valg av oppgave → detaljpanel (status, prioritet, spiller, forfall,
 *     kategori, beskrivelse) med «Merk fullført» (optimistisk lokal state).
 *   - Header-tall: åpne · fullført i dag.
 *   - «Ny oppgave» (statisk, som originalen — ingen mutasjon fantes der heller).
 *
 * Recompose-beslutning (retning C): originalens tre view-moduser
 * (Kanban/Tabell/Liste) kollapser til ÉN gruppert hastegrad-liste — brief-en
 * beskriver skjermen nettopp slik («Handlings-liste gruppert etter hastegrad»).
 * All funksjon (bla, filtrer, velg, detalj, merk fullført) er bevart.
 *
 * Mobil: detaljpanelet flyttes fra høyre kolonne til et bunn-ark (tap på rad
 * → ark), så 375px-flaten er ekte mobil, ikke krympet to-panel-desktop.
 */

import { useMemo, useState } from "react";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  StatusPill,
  KpiFlis,
  PillTabs,
  CTAPill,
  Knapp,
  TomTilstand,
  InnsiktChip,
  Icon,
  T,
  type StatusTone,
} from "@/components/v2";

// ── Datakontrakt (mappes fra OppgaveCache i ruten) ──────────────
export type HandlingKol = "todo" | "doing" | "done" | "backlog";
export type HandlingPri = "high" | "mid" | "low";

export interface HandlingRad {
  id: string;
  tittel: string;
  spiller: string;
  priKey: HandlingPri;
  priLabel: string;
  tag: string;
  due: string;
  statusLabel: string;
  col: HandlingKol;
  desc: string;
}
export interface AdminHandlingssenterData {
  dato: string;
  oppgaver: HandlingRad[];
}

type Filter = "alle" | "haster" | "mine" | "ferdig";

// Prioritet → StatusPill-tone (klarspråk, aldri sperre-språk).
const PRI_TONE: Record<HandlingPri, StatusTone> = {
  high: "down",
  mid: "warn",
  low: "info",
};
// Kanban-status → StatusPill-tone.
const STATUS_TONE: Record<HandlingKol, StatusTone> = {
  todo: "warn",
  doing: "info",
  done: "up",
  backlog: "info",
};
// Hastegrad-bånd (høy → lav) for gruppering i lista.
const BAND: { key: HandlingPri; label: string }[] = [
  { key: "high", label: "Haster" },
  { key: "mid", label: "Normal" },
  { key: "low", label: "Lav prioritet" },
];

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

// ── Detaljinnhold (delt av desktop-panel og mobil-ark) ──────────
function DetaljInnhold({
  item,
  ferdig,
  onMarkDone,
}: {
  item: HandlingRad;
  ferdig: boolean;
  onMarkDone: (id: string) => void;
}) {
  const rader: { label: string; verdi: React.ReactNode }[] = [
    {
      label: "Status",
      verdi: (
        <StatusPill tone={ferdig ? "up" : STATUS_TONE[item.col]}>
          {ferdig ? "Fullført" : item.statusLabel}
        </StatusPill>
      ),
    },
    {
      label: "Prioritet",
      verdi: <StatusPill tone={PRI_TONE[item.priKey]}>{item.priLabel}</StatusPill>,
    },
    {
      label: "Spiller",
      verdi: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <AvatarInit navn={item.spiller} size={22} />
          <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
            {item.spiller}
          </span>
        </span>
      ),
    },
    {
      label: "Forfall",
      verdi: (
        <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>
          {item.due}
        </span>
      ),
    },
    {
      label: "Kategori",
      verdi: (
        <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 8px" }}>
          {item.tag}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, lineHeight: 1.3, letterSpacing: "-0.01em", color: T.fg, margin: 0 }}>
        {item.tittel}
      </h2>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {rader.map((r, i) => (
          <div
            key={r.label}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: i === rader.length - 1 ? "none" : `1px solid ${T.border}` }}
          >
            <Caps size={9}>{r.label}</Caps>
            {r.verdi}
          </div>
        ))}
      </div>

      <div style={{ fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.55, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
        {item.desc}
      </div>

      {ferdig ? (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.up, background: `color-mix(in srgb,${T.up} 12%,transparent)`, borderRadius: 9999, padding: "11px 18px" }}>
          <Icon name="check-circle" size={14} style={{ color: T.up }} />
          Fullført
        </span>
      ) : (
        <Knapp icon="check" full onClick={() => onMarkDone(item.id)}>
          Merk fullført
        </Knapp>
      )}
    </div>
  );
}

export function AdminHandlingssenterV2({ data, meg }: { data: AdminHandlingssenterData; meg?: string | null }) {
  const [filter, setFilter] = useState<Filter>("alle");
  const [ferdigSett, setFerdigSett] = useState<ReadonlySet<string>>(() => new Set());
  const [valgtId, setValgtId] = useState<string | null>(data.oppgaver[0]?.id ?? null);
  const [arkAapen, setArkAapen] = useState(false);

  // Optimistisk lokal «merk fullført»: kilde-raden endres ikke, vi overstyrer
  // status via ferdigSett (samme effekt som originalens lokale mutasjon).
  const erFerdig = (o: HandlingRad) => o.col === "done" || ferdigSett.has(o.id);

  const tellere = useMemo(() => {
    const åpne = data.oppgaver.filter((o) => !erFerdig(o)).length;
    const fullført = data.oppgaver.filter((o) => erFerdig(o)).length;
    const haster = data.oppgaver.filter((o) => o.priKey === "high" && !erFerdig(o)).length;
    return { åpne, fullført, haster };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.oppgaver, ferdigSett]);

  const filterCounts: Record<Filter, number> = {
    alle: data.oppgaver.length,
    haster: data.oppgaver.filter((o) => o.priKey === "high").length,
    mine: meg ? data.oppgaver.filter((o) => o.spiller === meg).length : 0,
    ferdig: data.oppgaver.filter((o) => erFerdig(o)).length,
  };

  const filtrert = data.oppgaver.filter((o) => {
    if (filter === "haster") return o.priKey === "high";
    if (filter === "mine") return meg ? o.spiller === meg : false;
    if (filter === "ferdig") return erFerdig(o);
    return true;
  });

  const valgt = filtrert.find((o) => o.id === valgtId) ?? filtrert[0] ?? null;

  function velg(id: string) {
    setValgtId(id);
    setArkAapen(true);
  }
  function markFullfør(id: string) {
    setFerdigSett((forr) => new Set(forr).add(id));
  }

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>
          {data.dato} · AgencyOS · {pl(tellere.åpne, "åpen", "åpne")} · {tellere.fullført} fullført
        </Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="senter.">Handlings</Tittel>
        </div>
      </div>
      <div className="hidden md:inline-flex">
        <CTAPill icon="plus">Ny oppgave</CTAPill>
      </div>
    </div>
  );

  // ── KPI-flis (3) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Åpne oppgaver" value={tellere.åpne} />
      <KpiFlis label="Haster nå" value={tellere.haster} varsle={tellere.haster > 0} />
      <KpiFlis label="Fullført i dag" value={tellere.fullført} />
    </div>
  );

  // ── Filter (single-select, som originalen) ────────────────────
  const filterTabs = (["alle", "haster", "mine", "ferdig"] as Filter[]).map((f) => ({
    id: f,
    l: `${{ alle: "Alle", haster: "Haster", mine: "Mine", ferdig: "Ferdig" }[f]} · ${filterCounts[f]}`,
  }));
  const filtre = (
    <PillTabs tabs={filterTabs} value={filter} onChange={(id) => setFilter(id as Filter)} />
  );

  // ── Liste gruppert etter hastegrad ────────────────────────────
  const liste =
    filtrert.length === 0 ? (
      <Kort>
        <TomTilstand
          icon="check-circle"
          title="Ingen oppgaver her"
          sub="Ingen handlinger matcher dette filteret akkurat nå."
        />
      </Kort>
    ) : (
      <Kort
        eyebrow="Handlinger · etter hastegrad"
        action={<Caps size={9}>{pl(filtrert.length, "sak", "saker")}</Caps>}
      >
        {BAND.map((b) => {
          const rader = filtrert.filter((o) => o.priKey === b.key);
          if (rader.length === 0) return null;
          return (
            <div key={b.key} style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0 6px" }}>
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: PRI_TONE[b.key] === "down" ? T.down : PRI_TONE[b.key] === "warn" ? T.warn : T.info, flex: "none" }} />
                <Caps size={9}>{b.label}</Caps>
                <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.mut }}>{rader.length}</span>
              </div>
              {rader.map((o, i) => {
                const ferdig = erFerdig(o);
                return (
                  <Rad
                    key={o.id}
                    onClick={() => velg(o.id)}
                    leading={<AvatarInit navn={o.spiller} size={30} />}
                    title={o.tittel}
                    sub={`${o.spiller} · ${o.tag} · Forfaller ${o.due}`}
                    meta={
                      <StatusPill tone={ferdig ? "up" : PRI_TONE[o.priKey]}>
                        {ferdig ? "Fullført" : o.priLabel}
                      </StatusPill>
                    }
                    trailing={
                      valgt?.id === o.id
                        ? <span style={{ width: 2, height: 20, borderRadius: 2, background: T.lime, flex: "none" }} />
                        : undefined
                    }
                    last={i === rader.length - 1}
                  />
                );
              })}
            </div>
          );
        })}
      </Kort>
    );

  // ── Detaljpanel (desktop) ─────────────────────────────────────
  const detalj = valgt ? (
    <Kort tint eyebrow="Oppgave · detalj">
      <DetaljInnhold item={valgt} ferdig={erFerdig(valgt)} onMarkDone={markFullfør} />
    </Kort>
  ) : (
    <Kort tint>
      <TomTilstand icon="list" title="Ingen valgt" sub="Velg en handling for å se detaljer." />
    </Kort>
  );

  // ── AI-innsikt → Handlingssenter ──────────────────────────────
  const innsiktTekst =
    tellere.haster > 0
      ? `${pl(tellere.haster, "sak haster", "saker haster")} akkurat nå — ta de øverst i lista først.`
      : tellere.åpne > 0
        ? `${pl(tellere.åpne, "åpen handling", "åpne handlinger")} igjen — ingen haster, jobb deg nedover i ro.`
        : "Alt er ryddet — ingen åpne handlinger akkurat nå.";
  const innsikt = <InnsiktChip>{innsiktTekst}</InnsiktChip>;

  // ── Mobil bunn-ark (detalj) ───────────────────────────────────
  const mobilArk =
    arkAapen && valgt ? (
      <div className="lg:hidden" style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div
          onClick={() => setArkAapen(false)}
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(2px)" }}
        />
        <div style={{ position: "relative", background: T.panel, borderTop: `1px solid ${T.borderS}`, borderRadius: "20px 20px 0 0", padding: "10px 18px calc(18px + env(safe-area-inset-bottom))", maxHeight: "84vh", overflowY: "auto", boxShadow: "0 -24px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ width: 36, height: 4, borderRadius: 9999, background: T.borderS }} />
            <button
              type="button"
              onClick={() => setArkAapen(false)}
              className="v2-press v2-focus"
              aria-label="Lukk"
              style={{ appearance: "none", width: 30, height: 30, borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Icon name="x" size={15} style={{ color: T.fg2 }} />
            </button>
          </div>
          <DetaljInnhold item={valgt} ferdig={erFerdig(valgt)} onMarkDone={markFullfør} />
        </div>
      </div>
    ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {filtre}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {liste}
        <div className="hidden lg:block">{detalj}</div>
      </div>
      {innsikt}
      {mobilArk}
    </div>
  );
}
