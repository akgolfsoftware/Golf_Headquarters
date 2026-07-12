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
import { ForslagArk, NyOktArk, ValgtOktSeksjon, type WorkbenchV2Actions, type NyOktInput } from "./WorkbenchV2Sheets";
import { WorkbenchColdstart } from "./WorkbenchColdstart";
import type { WeekSuggestion } from "@/lib/ai-plan/week-suggest";
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

/** eb (AkseKey, stor bokstav) → ax (Axis, liten bokstav) for optimistiske temp-events. */
const AKSE_TO_AXIS: Record<AkseKey, WeekEvent["ax"]> = {
  FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn",
};
/** Optimistisk temp-id-prefiks — brukes til å style pending-tilstand og luke ut ved rollback. */
const OPTIMISTIC_PREFIX = "optimistic-";
const erOptimistisk = (id?: string) => !!id && id.startsWith(OPTIMISTIC_PREFIX);

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

/* ── Drag-and-drop-payload (tidslinje + bibliotek → dag-kolonne) ── */
const DND_MIME = "application/x-akgolf-wb";
type DndPayload =
  | { kind: "move"; sessionId: string }
  | { kind: "add"; title: string; durMin: number; akse?: AkseKey }
  | { kind: "mal"; templateId: string; name: string; sessionCount: number; varighetUker: number };

function lesDndPayload(e: React.DragEvent): DndPayload | null {
  try {
    const raw = e.dataTransfer.getData(DND_MIME);
    if (!raw) return null;
    return JSON.parse(raw) as DndPayload;
  } catch {
    return null;
  }
}

/* ── Tidslinje-blokk ───────────────────────────────────── */
function TLBlokk({ o, valgt, onVelg, dragbar }: { o: WeekEvent; valgt: boolean; onVelg: (id: string) => void; dragbar?: boolean }) {
  const start = o.h + (o.m ?? 0) / 60;
  const dur = o.durMin / 60;
  const h = dur * HOUR_H;
  const kompakt = h < 42;
  const ak = o.eb as AkseKey;
  const col = T.ax[ak] || T.mut;
  const done = o.compliance === "pa-plan";
  const avvik = o.compliance === "avvik" || o.compliance === "ikke-gjennomfort";
  const pending = erOptimistisk(o.id);
  const ramme = avvik ? T.down : valgt ? T.lime : T.border;
  const top = Math.max(0, (start - START_TIME) * HOUR_H + 2);
  const dragId = dragbar && !pending ? o.id : undefined;
  return (
    <div
      data-wb-okt={o.id ?? undefined}
      onClick={() => o.id && !pending && onVelg(o.id)}
      draggable={!!dragId}
      onDragStart={dragId ? (e) => {
        e.dataTransfer.setData(DND_MIME, JSON.stringify({ kind: "move", sessionId: dragId } satisfies DndPayload));
        e.dataTransfer.effectAllowed = "move";
      } : undefined}
      style={{
        position: "absolute", top, left: 3, right: 3, height: Math.max(18, h - 4),
        borderRadius: 8, padding: kompakt ? "2px 7px" : "5px 8px", cursor: pending ? "default" : dragbar ? "grab" : "pointer", overflow: "hidden",
        background: `color-mix(in srgb, ${col} 15%, ${T.panel3})`,
        border: `1px ${pending ? "dashed" : "solid"} ${ramme}`,
        borderLeft: `3px solid ${col}`,
        opacity: pending ? 0.6 : 1,
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

/** Ukekalender: 7 dag-kolonner × timelinje, økter absolutt posisjonert.
 *  Med `onDropMove`/`onDropAdd` (kun når skrivesiden finnes) er kolonnene
 *  drop-soner: dra en økt-blokk til ny dag, eller en bibliotek-brikke inn
 *  på et klokkeslett (Y-posisjon → time, snappet til hel/halv). */
function WBTidslinje({ dager, valgt, onVelg, onDropMove, onDropAdd, onTomKlikk, onDropMal }: {
  dager: DagKol[];
  valgt: string | null;
  onVelg: (id: string) => void;
  onDropMove?: (sessionId: string, dayIndex: number) => void;
  onDropAdd?: (item: { title: string; durMin: number; akse?: AkseKey }, dayIndex: number, hour: number, minute: number) => void;
  /** I1: trykk på tom flate i en dag-kolonne → Ny økt med dag+tid prefylt. */
  onTomKlikk?: (dayIndex: number, hour: number, minute: number) => void;
  /** Dra en MAL til canvas → bekreftelses-popup (Anders-logikken). */
  onDropMal?: (mal: { templateId: string; name: string; sessionCount: number; varighetUker: number }) => void;
}) {
  const [dropDag, setDropDag] = useState<number | null>(null);
  const timer: number[] = [];
  for (let h = START_TIME; h <= END_TIME; h++) timer.push(h);
  const bodyH = (timer.length - 1) * HOUR_H;
  const droppbar = !!(onDropMove || onDropAdd);

  /** Y-posisjon i kolonnen → {hour, minute} snappet til nærmeste halvtime. */
  const tidFraY = (e: React.DragEvent, kolonne: HTMLElement): { hour: number; minute: number } => {
    const y = e.clientY - kolonne.getBoundingClientRect().top;
    const raa = START_TIME + y / HOUR_H;
    const snappet = Math.round(raa * 2) / 2;
    const klemt = Math.max(START_TIME, Math.min(END_TIME - 1, snappet));
    return { hour: Math.floor(klemt), minute: klemt % 1 === 0.5 ? 30 : 0 };
  };

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
            <div
              key={i}
              data-wb-dag={i}
              onDragOver={droppbar ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dropDag !== i) setDropDag(i); } : undefined}
              onDragLeave={droppbar ? () => setDropDag((v) => (v === i ? null : v)) : undefined}
              onClick={onTomKlikk ? (e) => {
                if (e.target !== e.currentTarget) return; // kun tom flate, ikke økt-blokker
                const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
                const raa = START_TIME + y / HOUR_H;
                const snappet = Math.max(START_TIME, Math.min(END_TIME - 1, Math.round(raa * 2) / 2));
                onTomKlikk(i, Math.floor(snappet), snappet % 1 === 0.5 ? 30 : 0);
              } : undefined}
              onDrop={droppbar ? (e) => {
                e.preventDefault();
                setDropDag(null);
                const payload = lesDndPayload(e);
                if (!payload) return;
                if (payload.kind === "move" && onDropMove) onDropMove(payload.sessionId, i);
                if (payload.kind === "add" && onDropAdd) {
                  const { hour, minute } = tidFraY(e, e.currentTarget);
                  onDropAdd({ title: payload.title, durMin: payload.durMin, akse: payload.akse }, i, hour, minute);
                }
                if (payload.kind === "mal" && onDropMal) {
                  onDropMal({ templateId: payload.templateId, name: payload.name, sessionCount: payload.sessionCount, varighetUker: payload.varighetUker });
                }
              } : undefined}
              style={{
                flex: 1, minWidth: 0, position: "relative", borderLeft: `1px solid ${T.border}`,
                background: dropDag === i
                  ? `color-mix(in srgb, ${T.lime} 8%, transparent)`
                  : d.today ? `color-mix(in srgb, ${T.lime} 3%, transparent)` : "transparent",
                outline: dropDag === i ? `1px dashed color-mix(in srgb, ${T.lime} 45%, transparent)` : "none",
                outlineOffset: -2,
                transition: "background 80ms",
              }}
            >
              {d.events.map((o, j) => (
                <TLBlokk
                  key={o.id ?? `${i}-${j}`}
                  o={o}
                  valgt={!!o.id && valgt === o.id}
                  onVelg={onVelg}
                  dragbar={!!onDropMove && !!o.id && (o.source ?? "plan") === "plan"}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Kort>
  );
}

/* ── Bibliotek (venstre) ───────────────────────────────── */
function PalettBrikke({ tittel, akse, durMin, sub, onClick }: { tittel: string; akse?: AkseKey; durMin?: number; sub: string; onClick?: () => void }) {
  // Dragbar når den er klikkbar (skriveside finnes): dras rett inn på et
  // klokkeslett i uketidslinja i stedet for å gå via Ny økt-arket.
  const dragbar = !!onClick && durMin != null;
  return (
    <button
      type="button"
      onClick={onClick}
      draggable={dragbar}
      onDragStart={dragbar ? (e) => {
        e.dataTransfer.setData(DND_MIME, JSON.stringify({ kind: "add", title: tittel, durMin, akse } satisfies DndPayload));
        e.dataTransfer.effectAllowed = "copy";
      } : undefined}
      className="v2-press v2-focus"
      style={{ appearance: "none", textAlign: "left", width: "100%", padding: "8px 9px", borderRadius: 10, background: T.panel2, border: `1px dashed ${T.borderS}`, cursor: dragbar ? "grab" : onClick ? "pointer" : "default", minWidth: 0 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {akse && <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[akse] || T.mut, flex: "none" }} />}
        <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tittel}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>{sub}</span>
        {onClick && <Icon name="plus" size={10} style={{ color: T.mut, marginLeft: "auto", flex: "none" }} />}
      </div>
    </button>
  );
}

export const LPHASE_LABEL: Record<string, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialisering",
  TURNERING: "Turneringsperiode",
};

export function WBBibliotek({ data, tab, setTab, sok, setSok, onVelgOkt, onBrukMal }: {
  data: WorkbenchData;
  tab: string; setTab: (t: string) => void;
  sok: string; setSok: (s: string) => void;
  /** Ett-klikks «legg til»: åpner Ny økt-arket forhåndsutfylt fra brikken. */
  onVelgOkt?: (item: { title: string; durMin: number; akse?: AkseKey }) => void;
  /** Fasit-fiks: mal-kortene var døde — «Bruk» legger inn mal-uke 1. */
  onBrukMal?: (templateId: string) => void;
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
        {[["maler", "Maler"], ["okter", "Økter"]].map(([id, l]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className="v2-press v2-focus" style={{ appearance: "none", cursor: "pointer", flex: 1, fontFamily: T.mono, fontSize: 9, fontWeight: 700, padding: "6px 0", borderRadius: 8, border: `1px solid ${tab === id ? "transparent" : T.border}`, background: tab === id ? T.lime : T.panel2, color: tab === id ? T.onLime : T.fg2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</button>
        ))}
      </div>
      {tab === "maler" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <Caps size={9}>Planmaler</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut }}>{data.planTemplates?.length ?? 0}</span>
          </div>
          {maler.length ? maler.map((m) => (
            <div
              key={m.id}
              draggable={!!onBrukMal}
              onDragStart={onBrukMal ? (e) => {
                e.dataTransfer.setData(DND_MIME, JSON.stringify({ kind: "mal", templateId: m.id, name: m.name, sessionCount: m.sessionCount, varighetUker: m.varighetUker } satisfies DndPayload));
                e.dataTransfer.effectAllowed = "copy";
              } : undefined}
              style={{ padding: "11px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}`, cursor: onBrukMal ? "grab" : "default" }}
            >
              <span style={{ display: "block", minWidth: 0, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, display: "block", marginTop: 3 }}>{m.sessionCount} økter · {LPHASE_LABEL[m.lPhase] ?? m.lPhase} · {m.varighetUker} uker</span>
              {onBrukMal && (
                <button
                  type="button"
                  onClick={() => onBrukMal(m.id)}
                  className="v2-press v2-focus"
                  style={{ appearance: "none", cursor: "pointer", marginTop: 8, width: "100%", padding: "6px 0", borderRadius: 8, border: `1px solid ${T.borderS}`, background: T.panel3, color: T.fg2, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}
                >
                  Bruk · legg inn uke 1
                </button>
              )}
            </div>
          )) : <TomTilstand icon="search" title="Ingen mal" sub={sok ? "Prøv et annet søk." : "Ingen godkjente planmaler ennå."} />}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {okter.length ? okter.map((b) => (
            <PalettBrikke
              key={b.pid}
              tittel={b.title}
              akse={b.cat as AkseKey}
              durMin={b.dur}
              sub={fmtVarighet(b.dur)}
              onClick={onVelgOkt ? () => onVelgOkt({ title: b.title, durMin: b.dur, akse: b.cat as AkseKey }) : undefined}
            />
          )) : <TomTilstand icon="search" title="Ingen treff" sub={sok ? "Prøv et annet søk." : "Ingen standardøkter i biblioteket ennå."} />}
        </div>
      )}
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

export function WBBalanse({ data, valgtOkt, valgtDag, weekNumber, actions, weekOffset, onEndret }: {
  data: WorkbenchData;
  valgtOkt: WeekEvent | null;
  /** Dagindeks (0=man) for valgt økt — brukes i slett-popupen. -1 = ukjent. */
  valgtDag?: number;
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

      {/* WB2 (fasit G5): samlet spillerinnsikt øverst i inspektøren —
          fokus + plan-etterlevelse + neste turnering. Kun ekte kilder;
          rader uten kilde utelates helt. */}
      <BalSeksjon label="Spilleren nå">
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {fokus && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}` }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="target" size={13} style={{ color: T.lime }} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fokus.label}</div>
                <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, marginTop: 1 }}>Fokus · {fokus.kilde === "coach" ? "satt av coach" : "beregnet fra SG-gap"}</div>
              </div>
            </div>
          )}
          {data.adherencePct != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}` }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="check-check" size={13} style={{ color: data.adherencePct >= 70 ? T.up : data.adherencePct >= 40 ? T.warn : T.down }} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{data.adherencePct} %</span>
                  <HjelpTips k="planEtterlevelse" size={11} />
                </div>
                <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, marginTop: 1 }}>Plan-etterlevelse denne uka</div>
              </div>
              <div style={{ width: 52, height: 5, borderRadius: 9999, background: T.track, overflow: "hidden", flex: "none" }}>
                <div style={{ width: `${Math.min(100, data.adherencePct)}%`, height: "100%", borderRadius: 9999, background: data.adherencePct >= 70 ? T.up : data.adherencePct >= 40 ? T.warn : T.down }} />
              </div>
            </div>
          )}
          {data.tournaments && data.tournaments.length > 0 ? (
            data.tournaments.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}` }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="trophy" size={13} style={{ color: n.soon ? T.warn : T.fg2 }} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.tn}</div>
                  <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, marginTop: 1 }}>Neste turnering</div>
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: n.soon ? T.warn : T.fg2, flex: "none" }}>{n.td}</span>
              </div>
            ))
          ) : (
            !fokus && data.adherencePct == null && <TomTilstand icon="flag" title="Ingen innsikt ennå" sub="Fokus, etterlevelse og turneringer vises når planen er i gang." />
          )}
        </div>
      </BalSeksjon>

      <BalSeksjon label="Valgt økt">
        {valgtOkt ? (
          <ValgtOktSeksjon okt={valgtOkt} dag={valgtDag} actions={actions} weekOffset={weekOffset} onEndret={onEndret} />
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

/* ── Måned-nivå (kalendergrid med økt-prikker per dag) ─── */
function MndNivaa({ data, onVelgDato }: { data: WorkbenchData; onVelgDato: (dato: Date) => void }) {
  const weekStart = data.weekStartISO ? new Date(data.weekStartISO) : new Date();
  const now = new Date();
  const ar = weekStart.getFullYear();
  const mnd = weekStart.getMonth();
  const forste = new Date(ar, mnd, 1);
  const dagerIMnd = new Date(ar, mnd + 1, 0).getDate();
  // Grid starter på mandagen i uka der 1. faller (ISO-uke).
  const startPad = (forste.getDay() + 6) % 7;
  const celler = startPad + dagerIMnd;
  const rader = Math.ceil(celler / 7);

  const innhold = new Map((data.monthDays ?? []).map((d) => [d.dateISO, d]));
  const nokkel = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const iDag = nokkel(now);
  const totalOkter = (data.monthDays ?? []).reduce((a, d) => a + d.count, 0);

  return (
    <Kort eyebrow={`${MANEDER[mnd][0].toUpperCase() + MANEDER[mnd].slice(1)} ${ar}`} action={<Caps size={9}>{totalOkter} økter</Caps>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 4 }}>
        {DOW7.map((d) => (
          <span key={d} style={{ textAlign: "center", fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em", color: T.mut, padding: "2px 0 6px" }}>{d}</span>
        ))}
        {Array.from({ length: rader * 7 }, (_, i) => {
          const dagNr = i - startPad + 1;
          if (dagNr < 1 || dagNr > dagerIMnd) return <span key={i} />;
          const dato = new Date(ar, mnd, dagNr);
          const c = innhold.get(nokkel(dato));
          const erIDag = nokkel(dato) === iDag;
          const totMin = c ? c.axes.reduce((a, x) => a + x.min, 0) : 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onVelgDato(dato)}
              title={c ? `${c.count} økter · ${fmtTimer(totMin / 60)}` : "Ingen økter — trykk for å åpne uka"}
              className="v2-press v2-focus"
              style={{
                appearance: "none", cursor: "pointer", minHeight: 64, padding: "6px 7px",
                borderRadius: 10, textAlign: "left", display: "flex", flexDirection: "column", gap: 5,
                background: erIDag ? `color-mix(in srgb, ${T.lime} 7%, ${T.panel2})` : T.panel2,
                border: `1px solid ${erIDag ? `color-mix(in srgb, ${T.lime} 40%, transparent)` : T.border}`,
              }}
            >
              <span style={{ fontFamily: T.disp, fontSize: 13, fontWeight: 700, color: erIDag ? T.lime : c ? T.fg : T.mut }}>{dagNr}</span>
              {c ? (
                <>
                  <span style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {c.axes.map((x) => (
                      <span key={x.ax} title={`${AKSE_NAVN[x.ax.toUpperCase() as AkseKey] ?? x.ax} · ${fmtVarighet(x.min)}`} style={{ width: 7, height: 7, borderRadius: 9999, background: T.ax[x.ax.toUpperCase() as AkseKey] ?? T.mut }} />
                    ))}
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 8, color: T.mut }}>{c.count} · {fmtVarighet(totMin)}</span>
                </>
              ) : null}
            </button>
          );
        })}
      </div>
      <span style={{ display: "block", marginTop: 10, fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>Trykk en dag for å åpne uka i tidslinja.</span>
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
          const pending = erOptimistisk(o.id);
          return (
            <div key={o.id ?? j} onClick={() => o.id && !pending && onVelg(o.id)} style={{ padding: "9px 11px", borderRadius: 10, background: T.panel2, border: `1px ${pending ? "dashed" : "solid"} ${sel ? T.lime : T.border}`, borderLeft: `3px solid ${col}`, cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1 }}>
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
/* ── Selve Workbench ───────────────────────────────────── */
export function WorkbenchV2({ data, insights, playerName, planStatus, actions }: WorkbenchV2Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Zoom + valgt økt bor i URL-en (?zoom= / ?okt=) så visningen overlever
  // router.refresh() etter endringer, remount og deling av lenke.
  const zoomParam = searchParams.get("zoom");
  const [nivaa, setNivaaState] = useState(
    zoomParam === "ar" || zoomParam === "maned" || zoomParam === "dag" ? zoomParam : "uke",
  );
  const [tab, setTab] = useState("maler");
  const [sok, setSok] = useState("");
  const [nyOktApen, setNyOktApen] = useState(false);
  const [nyOktPrefill, setNyOktPrefill] = useState<{ title: string; durMin: number; akse?: AkseKey } | null>(null);
  // I1: trykk på tom luke i tidslinja → Ny økt med dag + klokkeslett prefylt.
  const [nyOktSted, setNyOktSted] = useState<{ dayIndex: number; tid: string } | null>(null);
  // Mal dratt til canvas → bekreftelses-popup (Anders-logikken).
  const [malBekreft, setMalBekreft] = useState<{ templateId: string; name: string; sessionCount: number; varighetUker: number } | null>(null);
  const [malLegger, setMalLegger] = useState(false);
  const [melding, setMelding] = useState<{ tone: "up" | "down" | "info"; tekst: string } | null>(null);
  const [pubLoading, setPubLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [forslag, setForslag] = useState<{ suggestions: WeekSuggestion[]; usedAi: boolean } | null>(null);
  const [dupLoading, setDupLoading] = useState(false);
  const [merApen, setMerApen] = useState(false);

  // Optimistisk UI: flytt/ny økt vises i tidslinja UMIDDELBART (før serveren har
  // svart), rulles tilbake ved feil. ALDRI for sletting (destruktivt — se
  // ValgtOktSeksjon.slett i WorkbenchV2Sheets.tsx, forblir synkron med bekreftelse).
  const [pendingMoves, setPendingMoves] = useState<{ key: string; sessionId: string; toDayIndex: number }[]>([]);
  const [pendingAdds, setPendingAdds] = useState<{ key: string; dayIndex: number; event: WeekEvent }[]>([]);
  // Publiser-status vises som «Til godkjenning» med det samme — ekte planStatus
  // kommer med router.refresh(); effekten under nullstiller når den ankommer.
  const [optimisticStatus, setOptimisticStatus] = useState<PlanStatus | null>(null);

  const baseDager = useMemo(() => (data ? byggDager(data) : []), [data]);
  const dager = useMemo(() => {
    if (pendingMoves.length === 0 && pendingAdds.length === 0) return baseDager;
    const next = baseDager.map((d) => ({ ...d, events: [...d.events] }));
    for (const mv of pendingMoves) {
      for (const day of next) {
        const idx = day.events.findIndex((e) => e.id === mv.sessionId);
        if (idx !== -1) {
          const [ev] = day.events.splice(idx, 1);
          next[mv.toDayIndex]?.events.push(ev);
          break;
        }
      }
    }
    for (const add of pendingAdds) {
      next[add.dayIndex]?.events.push(add.event);
    }
    return next;
  }, [baseDager, pendingMoves, pendingAdds]);
  // Pending (optimistiske) økter er IKKE valgbare — de har ingen ekte id ennå,
  // så «Valgt økt»-panelet (flytt/slett) ville feilet på dem. Vises kun i tidslinja.
  const alleEvents = useMemo(() => dager.flatMap((d) => d.events).filter((e) => e.id && !erOptimistisk(e.id)), [dager]);

  // Ekte serverdata har landet (router.refresh() etter en vellykket mutasjon) —
  // de optimistiske overleggene har gjort jobben sin og lukes. Reset skjer
  // under render (React-sanksjonert «adjust state when props change»-mønster),
  // ikke i effekt — unngår kaskade-render.
  const [forrigeData, setForrigeData] = useState(data);
  if (forrigeData !== data) {
    setForrigeData(data);
    setPendingMoves([]);
    setPendingAdds([]);
  }
  const [forrigePlanStatus, setForrigePlanStatus] = useState(planStatus);
  if (forrigePlanStatus !== planStatus) {
    setForrigePlanStatus(planStatus);
    setOptimisticStatus(null);
  }
  const [valgtId, setValgtIdState] = useState<string | null>(searchParams.get("okt"));
  const valgtOkt = useMemo(() => alleEvents.find((e) => e.id === valgtId) ?? alleEvents[0] ?? null, [alleEvents, valgtId]);
  // Dagindeksen mistes i alleEvents-flatMap — slås opp for slett-popupen («dag · tid»).
  const valgtDag = useMemo(
    () => (valgtOkt ? dager.findIndex((d) => d.events.some((e) => e.id === valgtOkt.id)) : -1),
    [dager, valgtOkt],
  );

  // Skriv zoom/valg til URL med replace (skal ikke forurense historikken).
  const oppdaterUrl = (mut: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mut(params);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const setNivaa = (v: string) => {
    setNivaaState(v);
    oppdaterUrl((p) => {
      if (v === "uke") p.delete("zoom");
      else p.set("zoom", v);
    });
  };
  const setValgtId = (id: string | null) => {
    setValgtIdState(id);
    oppdaterUrl((p) => {
      if (id) p.set("okt", id);
      else p.delete("okt");
    });
  };

  const weekNumber = data?.summary?.weekNumber ?? 0;
  const weekOffset = data?.weekOffset ?? 0;
  const st = statusLabel(optimisticStatus ?? planStatus);
  const adher = data?.adherencePct;
  // Ekte avvik-tall for uka (lib/workbench/compliance.ts sin oktCompliance,
  // beregnet server-side per økt): «avvik» = aktivt avbrutt/hoppet over/kansellert,
  // «ikke-gjennomfort» = forfalt uten registrert gjennomføring. CANON-fasechipen
  // (data.canonChip) svarer på et annet spørsmål (pyramide-balanse i perioden) og
  // er nesten alltid null uten en aktiv sesongplan-periode — bruk den ALDRI som
  // stedfortreder for compliance-avvik.
  const avvikOkter = alleEvents.filter((e) => e.compliance === "avvik" || e.compliance === "ikke-gjennomfort").length;
  const harAvvik = avvikOkter > 0;
  const avvikTekst = harAvvik ? `${avvikOkter} avvik denne uka` : "Ingen avvik";
  const aktivDag = dager.find((d) => d.today) ?? dager.find((d) => d.events.length > 0) ?? null;

  const goToWeek = (delta: number) => {
    const target = Math.max(WEEK_OFFSET_MIN, Math.min(WEEK_OFFSET_MAX, weekOffset + delta));
    if (target === weekOffset) return;
    const params = new URLSearchParams(searchParams.toString());
    if (target === 0) params.delete("uke");
    else params.set("uke", String(target));
    params.delete("okt"); // valgt økt er uke-spesifikk
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handlePublish = async () => {
    if (!actions || pubLoading) return;
    setPubLoading(true);
    setMelding(null);
    setOptimisticStatus("PENDING_PLAYER"); // status-pillen hopper til «Til godkjenning» med det samme
    const res = await actions.publish();
    setPubLoading(false);
    if (res.ok) {
      setMelding({ tone: "up", tekst: "Planen er sendt til godkjenning." });
      router.refresh();
    } else {
      setOptimisticStatus(null);
      setMelding({ tone: "down", tekst: res.error ?? "Kunne ikke publisere planen." });
    }
  };

  const handleSuggest = async () => {
    if (!actions?.suggestWeek || suggestLoading) return;
    setSuggestLoading(true);
    setMelding(null);
    const res = await actions.suggestWeek(weekOffset);
    setSuggestLoading(false);
    if (res.ok && res.suggestions && res.suggestions.length > 0) {
      setForslag({ suggestions: res.suggestions, usedAi: res.usedAi ?? false });
    } else {
      setMelding({ tone: "down", tekst: res.message ?? "Kunne ikke foreslå uke." });
    }
  };

  const handleBrukForslag = async (variant: WeekSuggestion) => {
    if (!actions?.applySuggestion) {
      return { ok: false, error: "Lagring er ikke tilgjengelig her." };
    }
    const res = await actions.applySuggestion(variant, weekOffset);
    if (res.ok) {
      setForslag(null);
      setMelding({ tone: "up", tekst: `${res.count ?? 0} økter lagt inn i uka.` });
      router.refresh();
    }
    return res;
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

  const velgFraBibliotek = (item: { title: string; durMin: number; akse?: AkseKey }) => {
    setNyOktPrefill(item);
    setNyOktApen(true);
  };

  const bekreftMal = async () => {
    if (!actions?.applyTemplate || !malBekreft || malLegger) return;
    setMalLegger(true);
    const res = await actions.applyTemplate(malBekreft.templateId);
    setMalLegger(false);
    setMalBekreft(null);
    if (res.ok) {
      setMelding({ tone: "up", tekst: `Mal-uke 1 fra «${malBekreft.name}» lagt inn — juster på tidslinja.` });
      router.refresh();
    } else {
      setMelding({ tone: "down", tekst: res.error ?? "Kunne ikke bruke malen." });
    }
  };

  // Fasit-fiks: mal-kortene i biblioteket legger inn mal-uke 1 (var døde).
  const brukMalFraBibliotek = async (templateId: string) => {
    if (!actions?.applyTemplate) return;
    setMelding(null);
    const res = await actions.applyTemplate(templateId);
    if (res.ok) {
      setMelding({ tone: "up", tekst: "Mal-uke 1 lagt inn — juster øktene på tidslinja." });
      router.refresh();
    } else {
      setMelding({ tone: "down", tekst: res.error ?? "Kunne ikke bruke malen." });
    }
  };

  // Dra en økt-blokk til en annen dag-kolonne → samme optimistiske flytting
  // som Flytt-knappen i Valgt økt-panelet.
  const handleDropMove = async (sessionId: string, dayIndex: number) => {
    const ev = alleEvents.find((e) => e.id === sessionId);
    if (!ev) return;
    const fraDag = dager.findIndex((d) => d.events.some((e) => e.id === sessionId));
    if (fraDag === dayIndex) return;
    const res = await optimisticMoveSession(sessionId, dayIndex, weekOffset);
    if (res.ok) router.refresh();
    else setMelding({ tone: "down", tekst: res.error ?? "Kunne ikke flytte økten." });
  };

  // Dra en bibliotek-brikke inn på et klokkeslett → BEKREFTELSES-POPUP
  // (Anders-logikken: dra til canvas → popup der alt kan justeres, eller bare
  // bekreft). Arket åpnes forhåndsutfylt med brikken + dag/tid fra slippunktet.
  const handleDropAdd = (
    item: { title: string; durMin: number; akse?: AkseKey },
    dayIndex: number,
    hour: number,
    minute: number,
  ) => {
    setNyOktPrefill(item);
    setNyOktSted({ dayIndex, tid: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` });
    setNyOktApen(true);
  };

  // Måned-cellen → hopp til uka datoen ligger i (uke-zoom).
  const velgDatoFraMnd = (dato: Date) => {
    const mandagAv = (d: Date) => {
      const m = new Date(d);
      m.setHours(0, 0, 0, 0);
      m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
      return m;
    };
    const visningsMandag = data?.weekStartISO ? new Date(data.weekStartISO) : mandagAv(new Date());
    const basisMandag = new Date(visningsMandag);
    basisMandag.setDate(basisMandag.getDate() - weekOffset * 7);
    const delta = Math.round((mandagAv(dato).getTime() - basisMandag.getTime()) / (7 * 86_400_000));
    const target = Math.max(WEEK_OFFSET_MIN, Math.min(WEEK_OFFSET_MAX, delta));
    const params = new URLSearchParams(searchParams.toString());
    if (target === 0) params.delete("uke");
    else params.set("uke", String(target));
    params.delete("zoom");
    params.delete("okt");
    setNivaaState("uke");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleCreateSession = async (input: NyOktInput): Promise<{ ok: boolean; error?: string }> => {
    if (!actions) return { ok: false, error: "Ikke tilgjengelig." };
    // Vis økta i tidslinja umiddelbart (dempet/stiplet, se erOptimistisk) —
    // fjernes ved feil, erstattes av ekte data når router.refresh() lander.
    const addKey = `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`;
    const tempEvent: WeekEvent = {
      id: addKey,
      source: "plan",
      status: "PLANNED",
      h: input.hour,
      m: input.minute,
      durMin: input.durMin,
      ax: AKSE_TO_AXIS[input.akse],
      eb: input.akse,
      ttl: input.title,
      meta: [],
    };
    setPendingAdds((prev) => [...prev, { key: addKey, dayIndex: input.dayIndex, event: tempEvent }]);
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
      setNyOktPrefill(null);
      setNyOktSted(null);
      router.refresh();
    } else {
      setPendingAdds((prev) => prev.filter((p) => p.key !== addKey));
    }
    return res;
  };

  // moveSession-wrapper: flytter økta til ny dag i tidslinja med det samme
  // (ValgtOktSeksjon i WorkbenchV2Sheets.tsx kaller denne via actions-proppen),
  // ruller tilbake overlegget hvis serveren avviser flyttingen.
  const optimisticMoveSession = async (
    sessionId: string,
    dayIndex: number,
    weekOffsetArg?: number,
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!actions) return { ok: false, error: "Ikke tilgjengelig." };
    const moveKey = `${sessionId}:${Date.now()}`;
    setPendingMoves((prev) => [...prev, { key: moveKey, sessionId, toDayIndex: dayIndex }]);
    const res = await actions.moveSession(sessionId, dayIndex, weekOffsetArg);
    if (!res.ok) {
      setPendingMoves((prev) => prev.filter((p) => p.key !== moveKey));
    }
    return res;
  };
  const balanseActions = actions ? { ...actions, moveSession: optimisticMoveSession } : actions;

  if (!data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Caps>Workbench</Caps>
        <Kort><TomTilstand icon="calendar" title="Ingen plandata" sub="Fant ingen treningsplan for spilleren." /></Kort>
      </div>
    );
  }

  // G7 · Coldstart (fasit): helt tom plan (ingen økter i uka, ingen timer,
  // ingen sesongplan) → guidet start i stedet for tomt grid. Aldri blindgate.
  const heltTom =
    alleEvents.length === 0 &&
    (data.axisHours ?? []).every((x) => x.hours === 0) &&
    (data.seasonBlocks ?? []).length === 0 &&
    pendingAdds.length === 0;
  if (heltTom && actions) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Caps>Workbench · {playerName}</Caps>
        {melding && (
          <Kort pad="10px 14px"><span style={{ fontFamily: T.ui, fontSize: 12.5, color: melding.tone === "down" ? T.down : T.fg }}>{melding.tekst}</span></Kort>
        )}
        <WorkbenchColdstart
          data={data}
          playerName={playerName}
          onBrukMal={actions.applyTemplate ? async (templateId) => {
            const res = await actions.applyTemplate!(templateId);
            if (res.ok) {
              setMelding({ tone: "up", tekst: "Første uke er lagt inn fra malen — juster den på tidslinja." });
              router.refresh();
            }
            return res;
          } : undefined}
          onForeslaaUke={actions.suggestWeek ? handleSuggest : undefined}
          foreslarUke={suggestLoading}
        />
        {forslag && (
          <ForslagArk
            suggestions={forslag.suggestions}
            usedAi={forslag.usedAi}
            onLukk={() => setForslag(null)}
            onBruk={handleBrukForslag}
          />
        )}
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
        <Felt label="Zoom"><PillVelger options={[{ v: "ar", l: "Årsplan" }, { v: "maned", l: "Måned" }, { v: "uke", l: "Uke" }, { v: "dag", l: "Økt" }]} value={nivaa} onChange={setNivaa} /></Felt>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 14px", borderRadius: 12, background: `color-mix(in srgb, ${harAvvik ? T.warn : T.up} 6%, transparent)`, border: `1px solid color-mix(in srgb, ${harAvvik ? T.warn : T.up} 32%, transparent)`, flex: "none" }}>
          <span style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.fg, lineHeight: 0.9, fontVariantNumeric: "tabular-nums", flex: "none" }}>{adher != null ? `${adher}%` : "–"}</span>
          <div style={{ flex: "none", maxWidth: 150 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, whiteSpace: "nowrap" }}>Plan-etterlevelse</span>
              <HjelpTips k="planEtterlevelse" size={11} />
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: harAvvik ? T.warn : T.up, display: "block", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{avvikTekst}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          {actions && (
            <button type="button" onClick={() => setNyOktApen(true)} className="v2-press v2-focus" style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, height: 38, padding: "0 14px", borderRadius: 10, background: T.panel3, border: `1px solid ${T.borderS}`, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}><Icon name="plus" size={14} />Ny økt</button>
          )}
          {actions?.suggestWeek && (
            <button type="button" onClick={handleSuggest} disabled={suggestLoading} title="AI-forslag for uka" className="v2-press v2-focus" style={{ appearance: "none", cursor: suggestLoading ? "default" : "pointer", width: 38, height: 38, borderRadius: 10, background: T.panel3, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: suggestLoading ? 0.5 : 1 }}><Icon name="sparkles" size={15} style={{ color: T.lime }} /></button>
          )}
          {actions && (
            <Knapp icon="send" onClick={handlePublish} disabled={pubLoading}>{pubLoading ? "Publiserer…" : "Publiser"}</Knapp>
          )}
        </div>
      </div>

      {/* TOPP-BAR — mobil (<md): to kompakte rader + «Mer» for Foreslå/Gjenta */}
      <div className="flex md:hidden" style={{ flexDirection: "column", gap: 10, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mut, display: "block" }}>Workbench</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, minWidth: 0 }}>
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{playerName}</span>
              <StatusPill tone={st.tone}>{st.l}</StatusPill>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, background: `color-mix(in srgb, ${harAvvik ? T.warn : T.up} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${harAvvik ? T.warn : T.up} 32%, transparent)`, flex: "none" }}>
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
          {(actions?.suggestWeek || actions?.duplicateWeek) && (
            <button
              type="button"
              onClick={() => setMerApen((v) => !v)}
              title="Mer"
              className="v2-press v2-focus"
              style={{ appearance: "none", cursor: "pointer", width: 44, height: 44, flex: "none", borderRadius: 12, background: merApen ? T.panel2 : T.panel3, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            >
              <Icon name="more-horizontal" size={17} style={{ color: T.fg2 }} />
            </button>
          )}
        </div>

        {merApen && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 12, borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
            {actions?.suggestWeek && (
              <Knapp icon="sparkles" ghost onClick={handleSuggest} disabled={suggestLoading}>{suggestLoading ? "Foreslår…" : "Foreslå uke"}</Knapp>
            )}
            {actions?.duplicateWeek && (
              <Knapp icon="repeat" ghost onClick={handleDuplicate} disabled={dupLoading}>{dupLoading ? "Kopierer…" : "Gjenta forrige uke"}</Knapp>
            )}
          </div>
        )}
      </div>

      {/* MELDING — resultat av siste handling (publiser/foreslå/gjenta) */}
      {melding && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: `color-mix(in srgb, ${melding.tone === "down" ? T.down : melding.tone === "up" ? T.up : T.info} 9%, ${T.panel})`, border: `1px solid color-mix(in srgb, ${melding.tone === "down" ? T.down : melding.tone === "up" ? T.up : T.info} 30%, transparent)` }}>
          <Icon name={melding.tone === "down" ? "alert-triangle" : melding.tone === "up" ? "check" : "info"} size={14} style={{ color: melding.tone === "down" ? T.down : melding.tone === "up" ? T.up : T.info, flex: "none" }} />
          <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>{melding.tekst}</span>
          <button type="button" onClick={() => setMelding(null)} className="v2-press v2-focus" style={{ appearance: "none", cursor: "pointer", background: "transparent", border: "none", color: T.mut, display: "inline-flex", flex: "none", padding: 0 }}>
            <Icon name="x" size={13} />
          </button>
        </div>
      )}

      {/* BRØDSMULE + insight-linje — desktop (md+): uendret */}
      <div className="hidden md:flex" style={{ alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {[["ar", `Sesong ${new Date().getFullYear()}`, "circle"], ["maned", MANEDER[new Date().getMonth()][0].toUpperCase() + MANEDER[new Date().getMonth()].slice(1), "circle-dot"], ["uke", `Uke ${weekNumber}`, "calendar"]].map(([v, l, ic], i, arr) => (
            <span key={v} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <button type="button" onClick={() => setNivaa(v)} className="v2-press v2-focus" style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 11px", borderRadius: 9999, border: `1px solid ${nivaa === v ? `color-mix(in srgb, ${T.lime} 30%, transparent)` : "transparent"}`, background: nivaa === v ? `color-mix(in srgb, ${T.lime} 7%, transparent)` : "transparent", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: nivaa === v ? T.fg : T.fg2 }}>
                <Icon name={ic} size={13} style={{ color: nivaa === v ? T.lime : T.mut }} />{l}
              </button>
              {i < arr.length - 1 && <Icon name="chevron-right" size={13} style={{ color: T.mut }} />}
            </span>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 4 }}>
            <button type="button" onClick={() => goToWeek(-1)} disabled={weekOffset <= WEEK_OFFSET_MIN} title="Forrige uke" className="v2-press v2-focus" style={{ appearance: "none", cursor: weekOffset <= WEEK_OFFSET_MIN ? "default" : "pointer", width: 26, height: 26, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: weekOffset <= WEEK_OFFSET_MIN ? 0.4 : 1 }}>
              <Icon name="chevron-left" size={13} style={{ color: T.fg2 }} />
            </button>
            <button type="button" onClick={() => goToWeek(1)} disabled={weekOffset >= WEEK_OFFSET_MAX} title="Neste uke" className="v2-press v2-focus" style={{ appearance: "none", cursor: weekOffset >= WEEK_OFFSET_MAX ? "default" : "pointer", width: 26, height: 26, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: weekOffset >= WEEK_OFFSET_MAX ? 0.4 : 1 }}>
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
      <div className="flex md:hidden" style={{ alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ZoomBrodsmule
            sti={[`Sesong ${new Date().getFullYear()}`, MANEDER[new Date().getMonth()][0].toUpperCase() + MANEDER[new Date().getMonth()].slice(1), `Uke ${weekNumber}`]}
            onHopp={(i) => setNivaa((["ar", "maned", "uke"] as const)[i])}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flex: "none" }}>
          <button type="button" onClick={() => goToWeek(-1)} disabled={weekOffset <= WEEK_OFFSET_MIN} title="Forrige uke" className="v2-press v2-focus" style={{ appearance: "none", cursor: weekOffset <= WEEK_OFFSET_MIN ? "default" : "pointer", width: 36, height: 36, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: weekOffset <= WEEK_OFFSET_MIN ? 0.4 : 1 }}>
            <Icon name="chevron-left" size={14} style={{ color: T.fg2 }} />
          </button>
          <button type="button" onClick={() => goToWeek(1)} disabled={weekOffset >= WEEK_OFFSET_MAX} title="Neste uke" className="v2-press v2-focus" style={{ appearance: "none", cursor: weekOffset >= WEEK_OFFSET_MAX ? "default" : "pointer", width: 36, height: 36, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: weekOffset >= WEEK_OFFSET_MAX ? 0.4 : 1 }}>
            <Icon name="chevron-right" size={14} style={{ color: T.fg2 }} />
          </button>
        </div>
      </div>

      {/* TRE KOLONNER — desktop (md+): uendret (grid-cols-1 md→lg, 3-kol fra lg) */}
      <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-[206px_1fr_302px]" style={{ gap: T.gap, alignItems: "start" }}>
        <WBBibliotek data={data} tab={tab} setTab={setTab} sok={sok} setSok={setSok} onVelgOkt={actions ? velgFraBibliotek : undefined} onBrukMal={actions?.applyTemplate ? brukMalFraBibliotek : undefined} />
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
          {insights?.line && <InnsiktChip>{insights.line}</InnsiktChip>}
          {nivaa === "uke" && (
            <WBTidslinje
              dager={dager}
              valgt={valgtOkt?.id ?? null}
              onVelg={setValgtId}
              onDropMove={actions ? handleDropMove : undefined}
              onDropAdd={actions ? handleDropAdd : undefined}
              onTomKlikk={actions ? (dayIndex, hour, minute) => {
                setNyOktSted({ dayIndex, tid: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` });
                setNyOktApen(true);
              } : undefined}
              onDropMal={actions?.applyTemplate ? setMalBekreft : undefined}
            />
          )}
          {nivaa === "ar" && <AarNivaa data={data} />}
          {nivaa === "dag" && <DagNivaa dag={aktivDag} valgt={valgtOkt?.id ?? null} onVelg={setValgtId} />}
          {nivaa === "maned" && <MndNivaa data={data} onVelgDato={velgDatoFraMnd} />}
        </div>
        <WBBalanse
          data={data}
          valgtOkt={valgtOkt}
          valgtDag={valgtDag}
          weekNumber={weekNumber}
          actions={balanseActions}
          weekOffset={weekOffset}
          onEndret={() => router.refresh()}
        />
      </div>

      {/* Mobil (<md): tidslinje/agenda først, Bibliotek + Balanse som utfellbare seksjoner under — ikke side-kolonner */}
      <div className="flex md:hidden" style={{ flexDirection: "column", gap: T.gap }}>
        {insights?.line && <InnsiktChip>{insights.line}</InnsiktChip>}
        {nivaa === "uke" && <WBTidslinjeMobil dager={dager} valgt={valgtOkt?.id ?? null} onVelg={setValgtId} />}
        {nivaa === "ar" && <AarNivaaMobil data={data} />}
        {nivaa === "dag" && <DagNivaa dag={aktivDag} valgt={valgtOkt?.id ?? null} onVelg={setValgtId} />}
        {nivaa === "maned" && <MndNivaa data={data} onVelgDato={velgDatoFraMnd} />}

        <MobilFold tittel="Bibliotek" ikon="layers">
          <WBBibliotek data={data} tab={tab} setTab={setTab} sok={sok} setSok={setSok} onVelgOkt={actions ? velgFraBibliotek : undefined} onBrukMal={actions?.applyTemplate ? brukMalFraBibliotek : undefined} />
        </MobilFold>
        <MobilFold tittel="Balanse" ikon="activity">
          <WBBalanse
            data={data}
            valgtOkt={valgtOkt}
          valgtDag={valgtDag}
            weekNumber={weekNumber}
            actions={balanseActions}
            weekOffset={weekOffset}
            onEndret={() => router.refresh()}
          />
        </MobilFold>
      </div>

      {malBekreft && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={malLegger ? undefined : () => setMalBekreft(null)} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
          <div style={{ position: "relative", width: "min(400px, 100%)", background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="layers" size={16} style={{ color: T.lime }} />
              <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>Legg inn mal</h2>
            </div>
            <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{malBekreft.name}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, marginTop: 3 }}>{malBekreft.sessionCount} økter · {malBekreft.varighetUker} uker · uke 1 legges i uke {weekNumber}</div>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, margin: "10px 0 0", lineHeight: 1.5 }}>
              Øktene legges på {playerName.split(" ")[0]} sine foretrukne dager — alt kan justeres på tidslinja etterpå.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <Knapp ghost onClick={() => setMalBekreft(null)} disabled={malLegger}>Avbryt</Knapp>
              <Knapp icon="check" onClick={bekreftMal} disabled={malLegger}>{malLegger ? "Legger inn…" : "Bekreft"}</Knapp>
            </div>
          </div>
        </div>
      )}

      {forslag && (
        <ForslagArk
          suggestions={forslag.suggestions}
          usedAi={forslag.usedAi}
          onLukk={() => setForslag(null)}
          onBruk={handleBrukForslag}
        />
      )}

      {nyOktApen && actions && (
        <NyOktArk
          defaultDayIndex={nyOktSted?.dayIndex ?? (aktivDag ? dager.indexOf(aktivDag) : 0)}
          defaultTid={nyOktSted?.tid}
          defaultTitle={nyOktPrefill?.title}
          defaultAkse={nyOktPrefill?.akse}
          defaultDurMin={nyOktPrefill?.durMin}
          onLukk={() => { setNyOktApen(false); setNyOktPrefill(null); setNyOktSted(null); }}
          onOpprett={handleCreateSession}
        />
      )}
    </div>
  );
}
