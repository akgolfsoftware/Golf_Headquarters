"use client";

/**
 * WORKBENCH — v2 (retning C «Presis»). Flaggskipet: delt av coach og spiller
 * via `role`-prop. Komponert 1:1 fra ui_kits/v2/wb.jsx (window.V2WB) → dense
 * topp-bar · zoom-brødsmule · tre kolonner (BIBLIOTEK | TIDSLINJE | BALANSE),
 * men med EKTE data fra loadWorkbenchContext (src/lib/workbench/load-context.ts).
 *
 * Ærlighet (prosjekt-regel): kun v2-komponenter fra "@/components/v2"; ingen
 * ad-hoc UI; ingen oppdiktede tall. Felter uten kilde i datamodellen (ACWR- og
 * SG-trendgrafer, numerisk «plan-kvalitet»-score) er IKKE fabrikert — de vises
 * som ærlig tom-tilstand eller er utelatt (se gaps i leveransen). Skrivesiden
 * (ny/flytt/slett økt, publiser, Caddie-forslag, dupliser uke) er koblet via
 * `actions`-prop (WorkbenchV2Sheets.tsx) — siden binder spiller- eller
 * coach-server-actions og sender ned; uten `actions` (forhåndsvisning) er
 * knappene skjult, aldri døde.
 *
 * V2Shell (montert i (v2preview)/v2-workbench/page.tsx) eier chrome-en.
 */

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  T,
  Caps,
  Kort,
  Knapp,
  PillVelger,
  AKSE_NAVN,
  StatusPill,
  TomTilstand,
  FordelingRad,
  InnsiktChip,
  Icon,
  HjelpTips,
  ZoomBrodsmule,
} from "@/components/v2";
import { PalettSok } from "@/components/v2/wb-composer";
import { NyOktArk, ValgtOktSeksjon, type WorkbenchV2Actions, type NyOktInput } from "./WorkbenchV2Sheets";
import { WBTidslinjeMobil, AarNivaaMobil, MobilFold } from "./WorkbenchV2Mobil";
import type { AkseKey } from "@/lib/v2/tokens";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import type { WorkbenchInsights } from "@/lib/workbench/types";
import type { WeekEvent } from "@/lib/workbench/week-types";
import type { PlanStatus } from "@/generated/prisma/client";
import { fmtVarighet, fmtTimer, toKl } from "@/lib/workbench/v2-format";
import { WEEK_OFFSET_MIN, WEEK_OFFSET_MAX } from "@/lib/workbench/session-move-math";

export type { WorkbenchV2Actions } from "./WorkbenchV2Sheets";

/* ── Konstanter ────────────────────────────────────────── */
const DOW7 = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
export const MANEDER = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
const HOUR_H = 44;
const START_TIME = 7;
const END_TIME = 21;

type Role = "coach" | "player";

export interface WorkbenchV2Props {
  data?: WorkbenchData;
  insights?: WorkbenchInsights | null;
  role: Role;
  playerName: string;
  coachName?: string;
  planStatus?: PlanStatus | null;
  /** Skrivesiden — utelatt (forhåndsvisning) skjuler alle muterende knapper. */
  actions?: WorkbenchV2Actions;
}

/* ── Rene hjelpere ─────────────────────────────────────── */

/** Planstatus → menneskelig etikett + tone. */
function statusLabel(s: PlanStatus | null | undefined): { l: string; tone: "info" | "up" | "down" | "lime" | "warn" } {
  switch (s) {
    case "ACTIVE": return { l: "Aktiv", tone: "lime" };
    case "ACCEPTED": return { l: "Godtatt", tone: "up" };
    case "PENDING_PLAYER": return { l: "Til godkjenning", tone: "warn" };
    case "REJECTED": return { l: "Endring bedt om", tone: "down" };
    case "PAUSED": return { l: "Pause", tone: "warn" };
    case "ARCHIVED": return { l: "Arkivert", tone: "down" };
    default: return { l: "Utkast", tone: "info" };
  }
}

/* ── Tidslinje-blokk ───────────────────────────────────── */
function TLBlokk({ o, valgt, onVelg }: { o: WeekEvent; valgt: boolean; onVelg: (id: string) => void }) {
  const start = o.h + (o.m ?? 0) / 60;
  const dur = o.durMin / 60;
  const h = dur * HOUR_H;
  const kompakt = h < 42;
  const ak = o.eb as AkseKey;
  const col = T.ax[ak] || T.mut;
  const done = o.compliance === "pa-plan";
  const avvik = o.compliance === "avvik" || o.compliance === "ikke-gjennomfort";
  const ramme = avvik ? T.down : valgt ? T.lime : T.border;
  const top = Math.max(0, (start - START_TIME) * HOUR_H + 2);
  return (
    <div
      onClick={() => o.id && onVelg(o.id)}
      style={{
        position: "absolute", top, left: 3, right: 3, height: Math.max(18, h - 4),
        borderRadius: 8, padding: kompakt ? "2px 7px" : "5px 8px", cursor: "pointer", overflow: "hidden",
        background: `color-mix(in srgb, ${col} 15%, ${T.panel3})`,
        border: `1px solid ${ramme}`,
        borderLeft: `3px solid ${col}`,
        boxShadow: avvik
          ? `0 0 0 1px color-mix(in srgb, ${T.down} 25%, transparent)`
          : valgt
            ? `0 0 0 1px color-mix(in srgb, ${T.lime} 35%, transparent)`
            : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.03em", color: `color-mix(in srgb, ${col} 55%, ${T.fg})`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{AKSE_NAVN[ak] || o.eb} · {toKl(o.h, o.m)}</span>
        {done && <Icon name="check" size={9} style={{ color: T.up, marginLeft: "auto", flex: "none" }} />}
        {avvik && <Icon name="alert-triangle" size={9} style={{ color: T.down, marginLeft: "auto", flex: "none" }} />}
      </div>
      {!kompakt && <div style={{ fontFamily: T.ui, fontSize: 10.5, fontWeight: 600, color: T.fg, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.ttl}</div>}
      {!kompakt && h >= 58 && <div style={{ fontFamily: T.mono, fontSize: 8, color: T.mut, marginTop: 2 }}>{toKl(o.h, o.m)} · {fmtVarighet(o.durMin)}</div>}
    </div>
  );
}

/** Ukekalender: 7 dag-kolonner × timelinje, økter absolutt posisjonert. */
function WBTidslinje({ dager, valgt, onVelg }: { dager: DagKol[]; valgt: string | null; onVelg: (id: string) => void }) {
  const timer: number[] = [];
  for (let h = START_TIME; h <= END_TIME; h++) timer.push(h);
  const bodyH = (timer.length - 1) * HOUR_H;
  return (
    <Kort pad="0" style={{ overflow: "hidden" }}>
      {/* Dag-header */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: 44, flex: "none" }} />
        {dager.map((d, i) => (
          <div key={i} style={{ flex: 1, minWidth: 0, textAlign: "center", padding: "9px 0 8px", borderLeft: `1px solid ${T.border}`, background: d.today ? `color-mix(in srgb, ${T.lime} 6%, transparent)` : "transparent" }}>
            <div style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em", color: d.today ? T.lime : T.mut }}>{d.dow}</div>
            <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: d.today ? T.fg : T.fg2, marginTop: 1 }}>{d.dato}</div>
            {d.today && <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: 9999, background: T.lime, marginTop: 3 }} />}
          </div>
        ))}
      </div>
      {/* Kropp: tidsakse + 7 dag-kolonner */}
      <div style={{ display: "flex", position: "relative", height: bodyH }}>
        <div style={{ width: 44, flex: "none", position: "relative" }}>
          {timer.filter((_, i) => i % 3 === 0).map((h) => (
            <span key={h} style={{ position: "absolute", top: (h - START_TIME) * HOUR_H - 5, right: 8, fontFamily: T.mono, fontSize: 9, color: T.mut }}>{h}:00</span>
          ))}
        </div>
        <div style={{ flex: 1, position: "relative", display: "flex" }}>
          {timer.filter((_, i) => i % 3 === 0 && i > 0).map((h) => (
            <span key={h} style={{ position: "absolute", left: 0, right: 0, top: (h - START_TIME) * HOUR_H, height: 1, background: "rgba(255,255,255,0.03)" }} />
          ))}
          {dager.map((d, i) => (
            <div key={i} style={{ flex: 1, minWidth: 0, position: "relative", borderLeft: `1px solid ${T.border}`, background: d.today ? `color-mix(in srgb, ${T.lime} 3%, transparent)` : "transparent" }}>
              {d.events.map((o, j) => <TLBlokk key={o.id ?? `${i}-${j}`} o={o} valgt={!!o.id && valgt === o.id} onVelg={onVelg} />)}
            </div>
          ))}
        </div>
      </div>
    </Kort>
  );
}

/* ── Bibliotek (venstre) ───────────────────────────────── */
function PalettBrikke({ tittel, akse, sub }: { tittel: string; akse?: AkseKey; sub: string }) {
  return (
    <div style={{ padding: "8px 9px", borderRadius: 10, background: T.panel2, border: `1px dashed ${T.borderS}`, cursor: "grab", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {akse && <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[akse] || T.mut, flex: "none" }} />}
        <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tittel}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>{sub}</span>
        <Icon name="grip-vertical" size={10} style={{ color: T.mut, marginLeft: "auto", flex: "none" }} />
      </div>
    </div>
  );
}

export const LPHASE_LABEL: Record<string, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialisering",
  TURNERING: "Turneringsperiode",
};

export function WBBibliotek({ data, tab, setTab, sok, setSok }: {
  data: WorkbenchData;
  tab: string; setTab: (t: string) => void;
  sok: string; setSok: (s: string) => void;
}) {
  const treff = (txt: string) => !sok || txt.toLowerCase().includes(sok.toLowerCase());
  const maler = (data.planTemplates ?? []).filter((m) => treff(m.name));
  const okter = (data.paletteItems ?? []).filter((b) => treff(b.title));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Caps size={10}>Bibliotek</Caps>
      </div>
      <PalettSok value={sok} onChange={setSok} placeholder="Søk…" />
      <div style={{ display: "flex", gap: 4 }}>
        {[["maler", "Maler"], ["okter", "Økter"], ["driller", "Driller"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ appearance: "none", cursor: "pointer", flex: 1, fontFamily: T.mono, fontSize: 9, fontWeight: 700, padding: "6px 0", borderRadius: 8, border: `1px solid ${tab === id ? "transparent" : T.border}`, background: tab === id ? T.lime : T.panel2, color: tab === id ? T.onLime : T.fg2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</button>
        ))}
      </div>
      {tab === "maler" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <Caps size={9}>Planmaler</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut }}>{data.planTemplates?.length ?? 0}</span>
          </div>
          {maler.length ? maler.map((m) => (
            <div key={m.id} style={{ padding: "11px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                <Icon name="arrow-right" size={13} style={{ color: T.mut, flex: "none" }} />
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, display: "block", marginTop: 3 }}>{m.sessionCount} økter · {LPHASE_LABEL[m.lPhase] ?? m.lPhase} · {m.varighetUker} uker</span>
            </div>
          )) : <TomTilstand icon="search" title="Ingen mal" sub={sok ? "Prøv et annet søk." : "Ingen godkjente planmaler ennå."} />}
        </div>
      ) : tab === "okter" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {okter.length ? okter.map((b) => (
            <PalettBrikke key={b.pid} tittel={b.title} akse={b.cat as AkseKey} sub={fmtVarighet(b.dur)} />
          )) : <TomTilstand icon="search" title="Ingen treff" sub={sok ? "Prøv et annet søk." : "Ingen standardøkter i biblioteket ennå."} />}
        </div>
      ) : (
        <TomTilstand icon="layers" title="Ingen driller" sub="Drill-bibliotek er ikke koblet ennå." />
      )}
      <button style={{ appearance: "none", cursor: "pointer", width: "100%", marginTop: 2, padding: "10px 0", borderRadius: 10, background: "transparent", border: `1px dashed ${T.borderS}`, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.fg2, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="plus" size={13} />Tom plan</button>
    </div>
  );
}

/* ── Balanse (høyre) ───────────────────────────────────── */
function BalSeksjon({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <Caps size={9}>{label}</Caps>{right}
      </div>
      {children}
    </div>
  );
}

export function WBBalanse({ data, valgtOkt, weekNumber, actions, weekOffset, onEndret }: {
  data: WorkbenchData;
  valgtOkt: WeekEvent | null;
  weekNumber: number;
  actions?: WorkbenchV2Actions;
  weekOffset: number;
  onEndret: () => void;
}) {
  const axis = data.axisHours ?? [];
  const totalT = axis.reduce((a, x) => a + x.hours, 0);
  const fokus = data.fokus;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="activity" size={15} style={{ color: T.lime }} />
        <span style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg }}>Balanse</span>
        <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>uke {weekNumber}</span>
      </div>

      {fokus && (
        <InnsiktChip>
          <span style={{ fontWeight: 700 }}>Fokus:</span> {fokus.label}
          <span style={{ color: T.mut }}> · {fokus.kilde === "coach" ? "satt av coach" : "beregnet fra SG-gap"}</span>
        </InnsiktChip>
      )}

      <BalSeksjon label="Neste viktig">
        {data.tournaments && data.tournaments.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {data.tournaments.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}` }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="trophy" size={13} style={{ color: T.fg2 }} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.tn}</div>
                  <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, marginTop: 1 }}>Turnering</div>
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: n.soon ? T.warn : T.fg2, flex: "none" }}>{n.td}</span>
              </div>
            ))}
          </div>
        ) : <TomTilstand icon="flag" title="Ingen turnering" sub="Ingen kommende turneringer registrert." />}
      </BalSeksjon>

      <BalSeksjon label="Valgt økt">
        {valgtOkt ? (
          <ValgtOktSeksjon okt={valgtOkt} actions={actions} weekOffset={weekOffset} onEndret={onEndret} />
        ) : <TomTilstand icon="target" title="Ingen økt valgt" sub="Trykk en økt i tidslinja." />}
      </BalSeksjon>

      <BalSeksjon label="Ukens fordeling · timer" right={<span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.fg2 }}>{fmtTimer(totalT)}</span>}>
        {totalT > 0 ? (
          axis.filter((x) => x.hours > 0).map((x, i, arr) => (
            <FordelingRad
              key={x.lbl}
              label={x.lbl}
              pct={Math.round((x.hours / totalT) * 100)}
              value={fmtTimer(x.hours)}
              last={i === arr.length - 1}
            />
          ))
        ) : <TomTilstand icon="activity" title="Ingen økter" sub="Ukens plan er tom." />}
      </BalSeksjon>
    </div>
  );
}

/* ── Årsplan-nivå (seasonBlocks) ───────────────────────── */
function AarNivaa({ data }: { data: WorkbenchData }) {
  const now = useState(() => Date.now())[0];
  const blocks = data.seasonBlocks ?? [];
  if (blocks.length === 0) {
    return <Kort><TomTilstand icon="calendar" title="Ingen sesongplan" sub="Ingen periodeblokker lagt inn for året ennå." /></Kort>;
  }
  return (
    <Kort eyebrow="Sesongperioder">
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
        {blocks.map((b) => {
          const start = new Date(b.startDate);
          const end = new Date(b.endDate);
          const naa = start.getTime() <= now && now <= end.getTime();
          return (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", margin: "0 -4px", borderRadius: 10, background: naa ? `color-mix(in srgb, ${T.lime} 5%, transparent)` : "transparent" }}>
              <span style={{ width: 150, flex: "none" }}>
                <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: naa ? T.fg : T.fg2, display: "block" }}>{LPHASE_LABEL[b.lPhase] ?? b.lPhase}</span>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{start.getDate()}. {MANEDER[start.getMonth()].slice(0, 3)}–{end.getDate()}. {MANEDER[end.getMonth()].slice(0, 3)}</span>
              </span>
              <span style={{ flex: 1, fontFamily: T.ui, fontSize: 11.5, color: T.mut, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.focus ?? ""}</span>
              {naa && <StatusPill>Nå</StatusPill>}
            </div>
          );
        })}
      </div>
    </Kort>
  );
}

/* ── Dag-nivå (agenda for valgt/i-dag) ─────────────────── */
export function DagNivaa({ dag, valgt, onVelg }: { dag: DagKol | null; valgt: string | null; onVelg: (id: string) => void }) {
  if (!dag || dag.events.length === 0) {
    return <Kort><TomTilstand icon="calendar" title="Ingen økter" sub="Ingen planlagte økter denne dagen." /></Kort>;
  }
  return (
    <Kort eyebrow={`${dag.dow} ${dag.dato} · tidslinje`} action={<Caps size={9}>{dag.events.length} økter</Caps>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {dag.events.map((o, j) => {
          const ak = o.eb as AkseKey;
          const col = T.ax[ak] || T.mut;
          const sel = !!o.id && valgt === o.id;
          return (
            <div key={o.id ?? j} onClick={() => o.id && onVelg(o.id)} style={{ padding: "9px 11px", borderRadius: 10, background: T.panel2, border: `1px solid ${sel ? T.lime : T.border}`, borderLeft: `3px solid ${col}`, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.fg2 }}>{toKl(o.h, o.m)}</span>
                <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, color: `color-mix(in srgb, ${col} 55%, ${T.fg})` }}>{AKSE_NAVN[ak] || o.eb}</span>
                <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>{fmtVarighet(o.durMin)}</span>
              </div>
              <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, marginTop: 5 }}>{o.ttl}</div>
            </div>
          );
        })}
      </div>
    </Kort>
  );
}

/* ── Dag-kolonne-modell ────────────────────────────────── */
export type DagKol = { dow: string; dato: string; today: boolean; events: WeekEvent[] };

function byggDager(data: WorkbenchData): DagKol[] {
  const monday = data.weekStartISO ? new Date(data.weekStartISO) : new Date();
  const now = new Date();
  const inneverende = (data.weekOffset ?? 0) === 0;
  const weekDays = data.weekDays ?? [];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const wd = weekDays[i];
    const today = wd?.today ?? (inneverende && d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());
    return { dow: DOW7[i], dato: String(d.getDate()), today, events: wd?.events ?? [] };
  });
}

/* ── Topp-bar ──────────────────────────────────────────── */
function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase", color: T.mut }}>{label}</span>
      {children}
    </div>
  );
}
function MiniToggle({ options, value, onChange }: { options: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: 3, height: 34, alignItems: "center" }}>
      {options.map(([v, l]) => {
        const on = value === v;
        return <button key={v} onClick={() => onChange(v)} style={{ appearance: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", padding: "0 11px", height: 26, borderRadius: 9999, border: "none", color: on ? T.onLime : T.fg2, background: on ? T.lime : "transparent", whiteSpace: "nowrap" }}>{l}</button>;
      })}
    </div>
  );
}

/* ── Selve Workbench ───────────────────────────────────── */
export function WorkbenchV2({ data, insights, role, playerName, planStatus, actions }: WorkbenchV2Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [rolle, setRolle] = useState<Role>(role);
  const [nivaa, setNivaa] = useState("uke");
  const [tab, setTab] = useState("maler");
  const [sok, setSok] = useState("");
  const [verktoy, setVerktoy] = useState<"alle" | "fys">("alle");
  const [nyOktApen, setNyOktApen] = useState(false);
  const [melding, setMelding] = useState<{ tone: "up" | "down" | "info"; tekst: string } | null>(null);
  const [pubLoading, setPubLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [dupLoading, setDupLoading] = useState(false);
  const [merApen, setMerApen] = useState(false);

  const dager = useMemo(() => (data ? byggDager(data) : []), [data]);
  const alleEvents = useMemo(() => dager.flatMap((d) => d.events).filter((e) => e.id), [dager]);
  const [valgtId, setValgtId] = useState<string | null>(null);
  const valgtOkt = useMemo(() => alleEvents.find((e) => e.id === valgtId) ?? alleEvents[0] ?? null, [alleEvents, valgtId]);

  const weekNumber = data?.summary?.weekNumber ?? 0;
  const weekOffset = data?.weekOffset ?? 0;
  const st = statusLabel(planStatus);
  const adher = data?.adherencePct;
  const canon = data?.canonChip;
  const aktivDag = dager.find((d) => d.today) ?? dager.find((d) => d.events.length > 0) ?? null;

  const goToWeek = (delta: number) => {
    const target = Math.max(WEEK_OFFSET_MIN, Math.min(WEEK_OFFSET_MAX, weekOffset + delta));
    if (target === weekOffset) return;
    const params = new URLSearchParams(searchParams.toString());
    if (target === 0) params.delete("uke");
    else params.set("uke", String(target));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handlePublish = async () => {
    if (!actions || pubLoading) return;
    setPubLoading(true);
    setMelding(null);
    const res = await actions.publish();
    setPubLoading(false);
    if (res.ok) {
      setMelding({ tone: "up", tekst: "Planen er sendt til godkjenning." });
      router.refresh();
    } else {
      setMelding({ tone: "down", tekst: res.error ?? "Kunne ikke publisere planen." });
    }
  };

  const handleSuggest = async () => {
    if (!actions?.suggestWeek || suggestLoading) return;
    setSuggestLoading(true);
    setMelding(null);
    const res = await actions.suggestWeek(weekNumber);
    setSuggestLoading(false);
    setMelding({
      tone: res.ok ? "info" : "down",
      tekst: res.message ?? (res.ok ? "Forslag lagt inn." : "Kunne ikke foreslå uke."),
    });
  };

  const handleDuplicate = async () => {
    if (!actions?.duplicateWeek || dupLoading) return;
    setDupLoading(true);
    setMelding(null);
    const res = await actions.duplicateWeek(weekOffset);
    setDupLoading(false);
    if (res.ok) {
      setMelding({ tone: "up", tekst: `${res.count ?? 0} økter kopiert fra forrige uke.` });
      router.refresh();
    } else {
      setMelding({ tone: "down", tekst: res.error ?? "Forrige uke har ingen økter." });
    }
  };

  const handleCreateSession = async (input: NyOktInput): Promise<{ ok: boolean; error?: string }> => {
    if (!actions) return { ok: false, error: "Ikke tilgjengelig." };
    const res = await actions.addSession({
      dayIndex: input.dayIndex,
      title: input.title,
      durMin: input.durMin,
      area: input.akse,
      hour: input.hour,
      minute: input.minute,
      weekOffset,
    });
    if (res.ok) {
      setNyOktApen(false);
      router.refresh();
    }
    return res;
  };

  if (!data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Caps>Workbench</Caps>
        <Kort><TomTilstand icon="calendar" title="Ingen plandata" sub="Fant ingen treningsplan for spilleren." /></Kort>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, position: "relative" }}>
      {/* TOPP-BAR — desktop (md+): uendret */}
      <div className="hidden md:flex" style={{ alignItems: "flex-end", gap: 16, flexWrap: "wrap", paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mut, display: "block" }}>Workbench</span>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, letterSpacing: "-0.02em", margin: "3px 0 6px" }}>{playerName}</div>
          <StatusPill tone={st.tone}>{st.l}</StatusPill>
        </div>
        <Felt label="Rolle"><MiniToggle options={[["coach", "Coach"], ["player", "Spiller"]]} value={rolle} onChange={(v) => setRolle(v as Role)} /></Felt>
        <Felt label="Zoom"><PillVelger options={[{ v: "ar", l: "Årsplan" }, { v: "maned", l: "Måned" }, { v: "uke", l: "Uke" }, { v: "dag", l: "Økt" }]} value={nivaa} onChange={setNivaa} /></Felt>
        <Felt label="Verktøy"><MiniToggle options={[["alle", "Alle"], ["fys", "Fysisk"]]} value={verktoy} onChange={(v) => setVerktoy(v as "alle" | "fys")} /></Felt>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 14px", borderRadius: 12, background: `color-mix(in srgb, ${canon ? T.warn : T.up} 6%, transparent)`, border: `1px solid color-mix(in srgb, ${canon ? T.warn : T.up} 32%, transparent)`, flex: "none" }}>
          <span style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.fg, lineHeight: 0.9, fontVariantNumeric: "tabular-nums", flex: "none" }}>{adher != null ? `${adher}%` : "–"}</span>
          <div style={{ flex: "none", maxWidth: 150 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, whiteSpace: "nowrap" }}>Plan-etterlevelse</span>
              <HjelpTips k="planEtterlevelse" size={11} />
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: canon ? T.warn : T.up, display: "block", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{canon ?? "Ingen avvik"}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          {actions && (
            <button onClick={() => setNyOktApen(true)} style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, height: 38, padding: "0 14px", borderRadius: 10, background: T.panel3, border: `1px solid ${T.borderS}`, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}><Icon name="plus" size={14} />Ny økt</button>
          )}
          {actions?.suggestWeek && (
            <button onClick={handleSuggest} disabled={suggestLoading} title="AI-forslag for uka" style={{ appearance: "none", cursor: suggestLoading ? "default" : "pointer", width: 38, height: 38, borderRadius: 10, background: T.panel3, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: suggestLoading ? 0.5 : 1 }}><Icon name="sparkles" size={15} style={{ color: T.lime }} /></button>
          )}
          {actions && (
            <Knapp icon="send" onClick={handlePublish} disabled={pubLoading}>{pubLoading ? "Publiserer…" : "Publiser"}</Knapp>
          )}
        </div>
      </div>

      {/* TOPP-BAR — mobil (<md): to kompakte rader + «Mer» for Rolle/Verktøy/AI/Gjenta */}
      <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mut, display: "block" }}>Workbench</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, minWidth: 0 }}>
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{playerName}</span>
              <StatusPill tone={st.tone}>{st.l}</StatusPill>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, background: `color-mix(in srgb, ${canon ? T.warn : T.up} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${canon ? T.warn : T.up} 32%, transparent)`, flex: "none" }}>
            <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{adher != null ? `${adher}%` : "–"}</span>
            <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.mut, whiteSpace: "nowrap" }}>etterlevelse</span>
          </div>
        </div>

        <div style={{ overflowX: "auto", paddingBottom: 1 }}>
          <PillVelger options={[{ v: "ar", l: "Årsplan" }, { v: "maned", l: "Måned" }, { v: "uke", l: "Uke" }, { v: "dag", l: "Økt" }]} value={nivaa} onChange={setNivaa} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {actions && (
            <div style={{ flex: 1 }}>
              <Knapp icon="plus" ghost full onClick={() => setNyOktApen(true)}>Ny økt</Knapp>
            </div>
          )}
          {actions && (
            <div style={{ flex: 1 }}>
              <Knapp icon="send" full onClick={handlePublish} disabled={pubLoading}>{pubLoading ? "Publiserer…" : "Publiser"}</Knapp>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMerApen((v) => !v)}
            title="Mer"
            style={{ appearance: "none", cursor: "pointer", width: 44, height: 44, flex: "none", borderRadius: 12, background: merApen ? T.panel2 : T.panel3, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            <Icon name="more-horizontal" size={17} style={{ color: T.fg2 }} />
          </button>
        </div>

        {merApen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12, borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
            <Felt label="Rolle"><MiniToggle options={[["coach", "Coach"], ["player", "Spiller"]]} value={rolle} onChange={(v) => setRolle(v as Role)} /></Felt>
            <Felt label="Verktøy"><MiniToggle options={[["alle", "Alle"], ["fys", "Fysisk"]]} value={verktoy} onChange={(v) => setVerktoy(v as "alle" | "fys")} /></Felt>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {actions?.suggestWeek && (
                <Knapp icon="sparkles" ghost onClick={handleSuggest} disabled={suggestLoading}>{suggestLoading ? "Foreslår…" : "Foreslå uke"}</Knapp>
              )}
              {actions?.duplicateWeek && (
                <Knapp icon="repeat" ghost onClick={handleDuplicate} disabled={dupLoading}>{dupLoading ? "Kopierer…" : "Gjenta forrige uke"}</Knapp>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MELDING — resultat av siste handling (publiser/foreslå/gjenta) */}
      {melding && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: `color-mix(in srgb, ${melding.tone === "down" ? T.down : melding.tone === "up" ? T.up : T.info} 9%, ${T.panel})`, border: `1px solid color-mix(in srgb, ${melding.tone === "down" ? T.down : melding.tone === "up" ? T.up : T.info} 30%, transparent)` }}>
          <Icon name={melding.tone === "down" ? "alert-triangle" : melding.tone === "up" ? "check" : "info"} size={14} style={{ color: melding.tone === "down" ? T.down : melding.tone === "up" ? T.up : T.info, flex: "none" }} />
          <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>{melding.tekst}</span>
          <button type="button" onClick={() => setMelding(null)} style={{ appearance: "none", cursor: "pointer", background: "transparent", border: "none", color: T.mut, display: "inline-flex", flex: "none", padding: 0 }}>
            <Icon name="x" size={13} />
          </button>
        </div>
      )}

      {/* BRØDSMULE + insight-linje — desktop (md+): uendret */}
      <div className="hidden md:flex" style={{ alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {[["ar", `Sesong ${new Date().getFullYear()}`, "circle"], ["maned", MANEDER[new Date().getMonth()][0].toUpperCase() + MANEDER[new Date().getMonth()].slice(1), "circle-dot"], ["uke", `Uke ${weekNumber}`, "calendar"]].map(([v, l, ic], i, arr) => (
            <span key={v} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setNivaa(v)} style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 11px", borderRadius: 9999, border: `1px solid ${nivaa === v ? `color-mix(in srgb, ${T.lime} 30%, transparent)` : "transparent"}`, background: nivaa === v ? `color-mix(in srgb, ${T.lime} 7%, transparent)` : "transparent", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: nivaa === v ? T.fg : T.fg2 }}>
                <Icon name={ic} size={13} style={{ color: nivaa === v ? T.lime : T.mut }} />{l}
              </button>
              {i < arr.length - 1 && <Icon name="chevron-right" size={13} style={{ color: T.mut }} />}
            </span>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 4 }}>
            <button type="button" onClick={() => goToWeek(-1)} disabled={weekOffset <= WEEK_OFFSET_MIN} title="Forrige uke" style={{ appearance: "none", cursor: weekOffset <= WEEK_OFFSET_MIN ? "default" : "pointer", width: 26, height: 26, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: weekOffset <= WEEK_OFFSET_MIN ? 0.4 : 1 }}>
              <Icon name="chevron-left" size={13} style={{ color: T.fg2 }} />
            </button>
            <button type="button" onClick={() => goToWeek(1)} disabled={weekOffset >= WEEK_OFFSET_MAX} title="Neste uke" style={{ appearance: "none", cursor: weekOffset >= WEEK_OFFSET_MAX ? "default" : "pointer", width: 26, height: 26, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: weekOffset >= WEEK_OFFSET_MAX ? 0.4 : 1 }}>
              <Icon name="chevron-right" size={13} style={{ color: T.fg2 }} />
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {actions?.suggestWeek && (
            <Knapp icon="sparkles" onClick={handleSuggest} disabled={suggestLoading}>{suggestLoading ? "Foreslår…" : "Foreslå uke"}</Knapp>
          )}
          {actions?.duplicateWeek && (
            <Knapp icon="repeat" ghost onClick={handleDuplicate} disabled={dupLoading}>{dupLoading ? "Kopierer…" : "Gjenta forrige uke"}</Knapp>
          )}
        </div>
      </div>

      {/* BRØDSMULE — mobil (<md): kompakt sti (wb-mobil ZoomBrodsmule) + uke-nav */}
      <div className="md:hidden" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ZoomBrodsmule
            sti={[`Sesong ${new Date().getFullYear()}`, MANEDER[new Date().getMonth()][0].toUpperCase() + MANEDER[new Date().getMonth()].slice(1), `Uke ${weekNumber}`]}
            onHopp={(i) => setNivaa((["ar", "maned", "uke"] as const)[i])}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flex: "none" }}>
          <button type="button" onClick={() => goToWeek(-1)} disabled={weekOffset <= WEEK_OFFSET_MIN} title="Forrige uke" style={{ appearance: "none", cursor: weekOffset <= WEEK_OFFSET_MIN ? "default" : "pointer", width: 36, height: 36, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: weekOffset <= WEEK_OFFSET_MIN ? 0.4 : 1 }}>
            <Icon name="chevron-left" size={14} style={{ color: T.fg2 }} />
          </button>
          <button type="button" onClick={() => goToWeek(1)} disabled={weekOffset >= WEEK_OFFSET_MAX} title="Neste uke" style={{ appearance: "none", cursor: weekOffset >= WEEK_OFFSET_MAX ? "default" : "pointer", width: 36, height: 36, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: weekOffset >= WEEK_OFFSET_MAX ? 0.4 : 1 }}>
            <Icon name="chevron-right" size={14} style={{ color: T.fg2 }} />
          </button>
        </div>
      </div>

      {/* TRE KOLONNER — desktop (md+): uendret (grid-cols-1 md→lg, 3-kol fra lg) */}
      <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-[206px_1fr_302px]" style={{ gap: T.gap, alignItems: "start" }}>
        <WBBibliotek data={data} tab={tab} setTab={setTab} sok={sok} setSok={setSok} />
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
          {insights?.line && <InnsiktChip>{insights.line}</InnsiktChip>}
          {nivaa === "uke" && <WBTidslinje dager={dager} valgt={valgtOkt?.id ?? null} onVelg={setValgtId} />}
          {nivaa === "ar" && <AarNivaa data={data} />}
          {nivaa === "dag" && <DagNivaa dag={aktivDag} valgt={valgtOkt?.id ?? null} onVelg={setValgtId} />}
          {nivaa === "maned" && <Kort><TomTilstand icon="calendar" title="Månedsvisning" sub="Bruk Uke for tidslinje eller Årsplan for sesongperiodene — månedsaggregat er ikke koblet ennå." /></Kort>}
        </div>
        <WBBalanse
          data={data}
          valgtOkt={valgtOkt}
          weekNumber={weekNumber}
          actions={actions}
          weekOffset={weekOffset}
          onEndret={() => router.refresh()}
        />
      </div>

      {/* Mobil (<md): tidslinje/agenda først, Bibliotek + Balanse som utfellbare seksjoner under — ikke side-kolonner */}
      <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {insights?.line && <InnsiktChip>{insights.line}</InnsiktChip>}
        {nivaa === "uke" && <WBTidslinjeMobil dager={dager} valgt={valgtOkt?.id ?? null} onVelg={setValgtId} />}
        {nivaa === "ar" && <AarNivaaMobil data={data} />}
        {nivaa === "dag" && <DagNivaa dag={aktivDag} valgt={valgtOkt?.id ?? null} onVelg={setValgtId} />}
        {nivaa === "maned" && <Kort><TomTilstand icon="calendar" title="Månedsvisning" sub="Bruk Uke for tidslinje eller Årsplan for sesongperiodene — månedsaggregat er ikke koblet ennå." /></Kort>}

        <MobilFold tittel="Bibliotek" ikon="layers">
          <WBBibliotek data={data} tab={tab} setTab={setTab} sok={sok} setSok={setSok} />
        </MobilFold>
        <MobilFold tittel="Balanse" ikon="activity">
          <WBBalanse
            data={data}
            valgtOkt={valgtOkt}
            weekNumber={weekNumber}
            actions={actions}
            weekOffset={weekOffset}
            onEndret={() => router.refresh()}
          />
        </MobilFold>
      </div>

      {nyOktApen && actions && (
        <NyOktArk
          defaultDayIndex={aktivDag ? dager.indexOf(aktivDag) : 0}
          onLukk={() => setNyOktApen(false)}
          onOpprett={handleCreateSession}
        />
      )}
    </div>
  );
}
