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

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
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
  useCountUp,
} from "@/components/v2";
import { PalettSok } from "@/components/v2/wb-composer";
import { ForslagArk, NyOktArk, RedigerOktArk, ValgtOktSeksjon, type WorkbenchV2Actions, type NyOktInput, type OktArkDrill } from "./WorkbenchV2Sheets";
import { WorkbenchColdstart } from "./WorkbenchColdstart";
import { WorkbenchAarsplan, PeriodePalett, WBPeriodeStrip } from "./WorkbenchAarsplan";
import type { WeekSuggestion } from "@/lib/ai-plan/week-suggest";
import { WBTidslinjeMobil, MobilFold } from "./WorkbenchV2Mobil";
import type { AkseKey } from "@/lib/v2/tokens";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import { LPHASE_LABEL as LPHASE_LABEL_KANON, LPHASE_FARGE as LPHASE_FARGE_KANON } from "@/lib/labels/taxonomy";
import { sokOvelser, hentOktKomponist, hentMalOktDrills } from "@/lib/workbench/ovelse-sok";
import type { WorkbenchInsights } from "@/lib/workbench/types";
import type { WeekEvent } from "@/lib/workbench/week-types";
import type { PlanStatus, LFase } from "@/generated/prisma/client";
import { fmtVarighet, fmtTimer, toKl } from "@/lib/workbench/v2-format";
import { WEEK_OFFSET_MIN, WEEK_OFFSET_MAX } from "@/lib/workbench/session-move-math";
import { setWbMode } from "@/lib/workbench/wb-mode-action";
import { faseLabel } from "@/lib/ak-formel-visning";

export type { WorkbenchV2Actions } from "./WorkbenchV2Sheets";

/** Klarspråk for L-fase i tidslinje — tåler null/ukjent uten å kaste. */
function faseLabelSafe(lFase: string): string {
  try {
    return faseLabel(lFase as LFase);
  } catch {
    return lFase;
  }
}

/* ── Konstanter ────────────────────────────────────────── */
const DOW7 = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
export const MANEDER = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
const HOUR_H = 44;
const START_TIME = 5;
const END_TIME = 23;

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
  /** B40 §3 — Standard/Pro-modus (lesPreferences(user).wbMode). Default "pro". */
  wbMode?: "standard" | "pro";
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

/* ── dnd-kit: drag-payload (tidslinje + bibliotek → dag-kolonne) ──
   Native HTML5 DnD (draggable/onDragStart/onDrop) fungerer ikke på touch
   (iPad/mobil) — dragstart/drop fyrer aldri der. Erstattet med @dnd-kit/core
   sin PointerSensor (dekker mus OG touch via Pointer Events), 2026-07-14.
   8c.2: periode-brikker (PeriodePalett) er en EGEN drag-kontekst i
   WorkbenchAarsplan.tsx — fortsatt native HTML5 DnD, IKKE migrert her (se
   kommentar i den filen). */
type WbDragData =
  | { kind: "move"; sessionId: string; event: WeekEvent }
  | { kind: "add"; title: string; durMin: number; akse?: AkseKey }
  | { kind: "mal"; templateId: string; name: string; sessionCount: number; varighetUker: number };

/** Pointer-Y (skjermkoordinat ved slipp) → {hour, minute} snappet til nærmeste
 *  halvtime, relativt til toppen av dag-kolonnen den slippes i. Erstatter
 *  native `e.clientY` — dnd-kit gir ikke rå pointer-koordinater i onDragEnd,
 *  men activatorEvent (start-posisjon) + delta (bevegelse) gir samme tall. */
function tidFraPointerY(pointerY: number, kolonneTop: number): { hour: number; minute: number } {
  const y = pointerY - kolonneTop;
  const raa = START_TIME + y / HOUR_H;
  const snappet = Math.round(raa * 2) / 2;
  // Siste gyldige start er 30 min før stengetid (22:30 → 23:00-slutt).
  const klemt = Math.max(START_TIME, Math.min(END_TIME - 0.5, snappet));
  return { hour: Math.floor(klemt), minute: klemt % 1 === 0.5 ? 30 : 0 };
}

/* ── Tidslinje-blokk ───────────────────────────────────── */
/** Felles innhold (økt-boksen OG DragOverlay-spøkelset bruker samme visning). */
function TLBlokkInnhold({ o, kompakt, h, col }: { o: WeekEvent; kompakt: boolean; h: number; col: string }) {
  const ak = o.eb as AkseKey;
  const done = o.compliance === "pa-plan";
  const avvik = o.compliance === "avvik" || o.compliance === "ikke-gjennomfort";
  // Formel-linjer kun når blokken er høy nok — ellers bare tittel.
  const formelLinje = !kompakt && h >= 72
    ? [o.miljo, o.lFase ? faseLabelSafe(o.lFase) : null].filter(Boolean).join(" · ")
    : "";
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.03em", color: `color-mix(in srgb, ${col} 55%, ${T.fg})`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{AKSE_NAVN[ak] || o.eb} · {toKl(o.h, o.m)}</span>
        {done && <Icon name="check" size={9} style={{ color: T.up, marginLeft: "auto", flex: "none" }} />}
        {avvik && <Icon name="alert-triangle" size={9} style={{ color: T.down, marginLeft: "auto", flex: "none" }} />}
      </div>
      {!kompakt && <div style={{ fontFamily: T.ui, fontSize: 10.5, fontWeight: 600, color: T.fg, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.ttl}</div>}
      {!kompakt && h >= 58 && <div style={{ fontFamily: T.mono, fontSize: 8, color: T.mut, marginTop: 2 }}>{toKl(o.h, o.m)} · {fmtVarighet(o.durMin)}</div>}
      {formelLinje ? (
        <div style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, color: T.fg2, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {formelLinje}
        </div>
      ) : null}
    </>
  );
}

function TLBlokk({ o, dragKey, valgt, onVelg, dragbar }: { o: WeekEvent; /** Stabil id for dnd-kit — o.id kan mangle (fallback til dag+indeks). */ dragKey: string; valgt: boolean; onVelg: (id: string) => void; dragbar?: boolean }) {
  const start = o.h + (o.m ?? 0) / 60;
  const dur = o.durMin / 60;
  const h = dur * HOUR_H;
  const kompakt = h < 42;
  const ak = o.eb as AkseKey;
  const col = T.ax[ak] || T.mut;
  const avvik = o.compliance === "avvik" || o.compliance === "ikke-gjennomfort";
  const pending = erOptimistisk(o.id);
  const ramme = avvik ? T.down : valgt ? T.lime : T.border;
  const top = Math.max(0, (start - START_TIME) * HOUR_H + 2);
  const kanDra = dragbar && !pending && !!o.id;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `session:${dragKey}`,
    data: kanDra ? ({ kind: "move", sessionId: o.id as string, event: o } satisfies WbDragData) : undefined,
    disabled: !kanDra,
  });
  return (
    <div
      ref={setNodeRef}
      data-wb-okt={o.id ?? undefined}
      onClick={() => o.id && !pending && onVelg(o.id)}
      {...(kanDra ? attributes : undefined)}
      {...(kanDra ? listeners : undefined)}
      style={{
        position: "absolute", top, left: 3, right: 3, height: Math.max(18, h - 4),
        borderRadius: 8, padding: kompakt ? "2px 7px" : "5px 8px", cursor: pending ? "default" : dragbar ? "grab" : "pointer", overflow: "hidden",
        touchAction: kanDra ? "none" : undefined,
        background: `color-mix(in srgb, ${col} 15%, ${T.panel3})`,
        border: `1px ${pending ? "dashed" : "solid"} ${ramme}`,
        borderLeft: `3px solid ${col}`,
        opacity: isDragging ? 0.35 : pending ? 0.6 : 1,
        boxShadow: avvik
          ? `0 0 0 1px color-mix(in srgb, ${T.down} 25%, transparent)`
          : valgt
            ? `0 0 0 1px color-mix(in srgb, ${T.lime} 35%, transparent)`
            : "none",
      }}
    >
      <TLBlokkInnhold o={o} kompakt={kompakt} h={h} col={col} />
    </div>
  );
}

/** DragOverlay-spøkelset som følger pekeren under drag — dnd-kit har ingen
 *  automatisk «skjermbilde av kilden»-ghost slik native HTML5 DnD hadde, så
 *  dette gjenskaper samme visuelle tilbakemelding eksplisitt for alle tre
 *  drag-kildene (økt-blokk / bibliotek-brikke / mal-kort). */
function WBDragOverlayInnhold({ data }: { data: WbDragData }) {
  if (data.kind === "move") {
    const o = data.event;
    const h = Math.max(40, (o.durMin / 60) * HOUR_H);
    const kompakt = h < 42;
    const col = T.ax[o.eb as AkseKey] || T.mut;
    return (
      <div style={{ width: 200, borderRadius: 8, padding: kompakt ? "2px 7px" : "5px 8px", background: `color-mix(in srgb, ${col} 15%, ${T.panel3})`, border: `1px solid ${T.borderS}`, borderLeft: `3px solid ${col}`, boxShadow: "0 10px 28px rgba(0,0,0,0.4)", cursor: "grabbing" }}>
        <TLBlokkInnhold o={o} kompakt={kompakt} h={h} col={col} />
      </div>
    );
  }
  const akse = data.kind === "add" ? data.akse : undefined;
  const tittel = data.kind === "add" ? data.title : data.name;
  const sub = data.kind === "add" ? fmtVarighet(data.durMin) : `${data.sessionCount} økter · ${data.varighetUker} uker`;
  return (
    <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 4, padding: "8px 10px", borderRadius: 10, background: T.panel2, border: `1px dashed ${T.borderS}`, boxShadow: "0 10px 28px rgba(0,0,0,0.4)", cursor: "grabbing" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {akse && <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[akse] || T.mut, flex: "none" }} />}
        <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tittel}</span>
      </div>
      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{sub}</span>
    </div>
  );
}

/** Én dag-kolonne — egen komponent fordi dnd-kit sin `useDroppable` er en
 *  hook (kan ikke kalles inne i en `.map()`-callback). */
function WBTidslinjeDagKolonne({ dag, index, valgt, onVelg, droppbar, kanFlytteOkter, onTomKlikk }: {
  dag: DagKol;
  index: number;
  valgt: string | null;
  onVelg: (id: string) => void;
  droppbar: boolean;
  kanFlytteOkter: boolean;
  onTomKlikk?: (dayIndex: number, hour: number, minute: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${index}`,
    disabled: !droppbar,
  });
  return (
    <div
      ref={setNodeRef}
      data-wb-dag={index}
      onClick={onTomKlikk ? (e) => {
        if (e.target !== e.currentTarget) return; // kun tom flate, ikke økt-blokker
        const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
        const raa = START_TIME + y / HOUR_H;
        const snappet = Math.max(START_TIME, Math.min(END_TIME - 0.5, Math.round(raa * 2) / 2));
        onTomKlikk(index, Math.floor(snappet), snappet % 1 === 0.5 ? 30 : 0);
      } : undefined}
      style={{
        flex: 1, minWidth: 0, position: "relative", borderLeft: `1px solid ${T.border}`,
        background: isOver
          ? `color-mix(in srgb, ${T.lime} 8%, transparent)`
          : dag.today ? `color-mix(in srgb, ${T.lime} 3%, transparent)` : "transparent",
        outline: isOver ? `1px dashed color-mix(in srgb, ${T.lime} 45%, transparent)` : "none",
        outlineOffset: -2,
        transition: "background 80ms",
      }}
    >
      {dag.events.map((o, j) => (
        <TLBlokk
          key={o.id ?? `${index}-${j}`}
          dragKey={o.id ?? `${index}-${j}`}
          o={o}
          valgt={!!o.id && valgt === o.id}
          onVelg={onVelg}
          dragbar={kanFlytteOkter && !!o.id && (o.source ?? "plan") === "plan"}
        />
      ))}
    </div>
  );
}

/** Ukekalender: 7 dag-kolonner × timelinje, økter absolutt posisjonert.
 *  Med `kanFlytteOkter`/`kanLeggeTil`/`kanBrukeMal` (kun når skrivesiden
 *  finnes) er kolonnene drop-soner: dra en økt-blokk til ny dag, en
 *  bibliotek-brikke inn på et klokkeslett (Y-posisjon → time, snappet til
 *  hel/halv), eller en mal inn (dagen/tiden spiller ingen rolle for mal).
 *  Selve drop-håndteringen skjer sentralt i WorkbenchV2 sin DndContext —
 *  denne komponenten markerer bare dra-/slippbare flater. */
function WBTidslinje({ dager, valgt, onVelg, kanFlytteOkter, kanLeggeTil, kanBrukeMal, onTomKlikk }: {
  dager: DagKol[];
  valgt: string | null;
  onVelg: (id: string) => void;
  kanFlytteOkter?: boolean;
  kanLeggeTil?: boolean;
  kanBrukeMal?: boolean;
  /** I1: trykk på tom flate i en dag-kolonne → Ny økt med dag+tid prefylt. */
  onTomKlikk?: (dayIndex: number, hour: number, minute: number) => void;
}) {
  const timer: number[] = [];
  for (let h = START_TIME; h <= END_TIME; h++) timer.push(h);
  const bodyH = (timer.length - 1) * HOUR_H;
  const droppbar = !!(kanFlytteOkter || kanLeggeTil || kanBrukeMal);

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
          {timer.map((h) => (
            <span key={h} style={{ position: "absolute", top: (h - START_TIME) * HOUR_H - 5, right: 8, fontFamily: T.mono, fontSize: 9, color: T.mut }}>{String(h).padStart(2, "0")}:00</span>
          ))}
        </div>
        <div style={{ flex: 1, position: "relative", display: "flex" }}>
          {/* Gridlinjer i border-token (temariktig i begge moduser — den gamle
              hvit-alphaen var usynlig i lys modus): hel time markert, halvtime
              nedtonet så 30-min-snappingen har synlig anker. */}
          {timer.slice(1, -1).map((h) => (
            <span key={h} style={{ position: "absolute", left: 0, right: 0, top: (h - START_TIME) * HOUR_H, height: 1, background: `color-mix(in srgb, ${T.border} 70%, transparent)`, pointerEvents: "none" }} />
          ))}
          {timer.slice(0, -1).map((h) => (
            <span key={`half-${h}`} style={{ position: "absolute", left: 0, right: 0, top: (h - START_TIME) * HOUR_H + HOUR_H / 2, height: 1, background: `color-mix(in srgb, ${T.border} 32%, transparent)`, pointerEvents: "none" }} />
          ))}
          {dager.map((d, i) => (
            <WBTidslinjeDagKolonne
              key={i}
              dag={d}
              index={i}
              valgt={valgt}
              onVelg={onVelg}
              droppbar={droppbar}
              kanFlytteOkter={!!kanFlytteOkter}
              onTomKlikk={onTomKlikk}
            />
          ))}
        </div>
      </div>
    </Kort>
  );
}

/* ── Bibliotek (venstre) ───────────────────────────────── */
function PalettBrikke({ pid, tittel, akse, durMin, sub, onClick }: { pid: string; tittel: string; akse?: AkseKey; durMin?: number; sub: string; onClick?: () => void }) {
  // Dragbar når den er klikkbar (skriveside finnes): dras rett inn på et
  // klokkeslett i uketidslinja i stedet for å gå via Ny økt-arket.
  const dragbar = !!onClick && durMin != null;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `add:${pid}`,
    data: dragbar ? ({ kind: "add", title: tittel, durMin: durMin as number, akse } satisfies WbDragData) : undefined,
    disabled: !dragbar,
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      {...(dragbar ? attributes : undefined)}
      {...(dragbar ? listeners : undefined)}
      className="v2-press v2-focus"
      style={{ appearance: "none", textAlign: "left", width: "100%", padding: "8px 9px", borderRadius: 10, background: T.panel2, border: `1px dashed ${T.borderS}`, cursor: dragbar ? "grab" : onClick ? "pointer" : "default", minWidth: 0, touchAction: dragbar ? "none" : undefined, opacity: isDragging ? 0.35 : 1 }}
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

// Kanon-kilden er taxonomy (alle 7 periodetyper etter 8c.1) — re-eksporteres
// som Record<string,string> for eksisterende oppslag med løse strenger.
export const LPHASE_LABEL: Record<string, string> = LPHASE_LABEL_KANON;

/** Ett mal-kort i Bibliotek — egen komponent fordi dnd-kit sin `useDraggable`
 *  er en hook (kan ikke kalles inne i en `.map()`-callback). */
function WBMalKort({ mal, onBrukMal }: {
  mal: NonNullable<WorkbenchData["planTemplates"]>[number];
  onBrukMal?: (templateId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `mal:${mal.id}`,
    data: onBrukMal ? ({ kind: "mal", templateId: mal.id, name: mal.name, sessionCount: mal.sessionCount, varighetUker: mal.varighetUker } satisfies WbDragData) : undefined,
    disabled: !onBrukMal,
  });
  return (
    <div
      ref={setNodeRef}
      {...(onBrukMal ? attributes : undefined)}
      {...(onBrukMal ? listeners : undefined)}
      style={{ padding: "11px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}`, cursor: onBrukMal ? "grab" : "default", touchAction: onBrukMal ? "none" : undefined, opacity: isDragging ? 0.35 : 1 }}
    >
      <span style={{ display: "block", minWidth: 0, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mal.name}</span>
      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, display: "block", marginTop: 3 }}>{mal.sessionCount} økter · {LPHASE_LABEL[mal.lPhase] ?? mal.lPhase} · {mal.varighetUker} uker</span>
      {onBrukMal && (
        <button
          type="button"
          onClick={() => onBrukMal(mal.id)}
          className="v2-press v2-focus"
          style={{ appearance: "none", cursor: "pointer", marginTop: 8, width: "100%", padding: "6px 0", borderRadius: 8, border: `1px solid ${T.borderS}`, background: T.panel3, color: T.fg2, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          Bruk · legg inn uke 1
        </button>
      )}
    </div>
  );
}

/** Felles gruppetider denne uka (GroupSchedule) — ble lastet i loaderen uten
 *  å vises noe sted i V2 (Anders' feilklasse «lastes men kobles ikke»). */
function WBGruppetider({ slots }: { slots: NonNullable<WorkbenchData["groupSlots"]> }) {
  if (slots.length === 0) return null;
  const DAGER_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  return (
    <Kort pad="10px 12px" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>
        Gruppetider
      </span>
      {slots.map((s) => {
        const start = new Date(s.startAt);
        const kl = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
        return (
          <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, fontFamily: T.ui, fontSize: 11.5, color: T.fg2 }}>
            <Icon name="users" size={11} style={{ color: T.lime }} />
            {DAGER_KORT[s.dayIndex] ?? ""} {kl} · {s.groupName}
            {s.location ? ` · ${s.location}` : ""}
          </span>
        );
      })}
    </Kort>
  );
}


export function WBBibliotek({ data, tab, setTab, sok, setSok, onVelgOkt, onBrukMal, visPerioder, onLeggDrillIValgt, proMode = true, skjulTittel = false }: {
  data: WorkbenchData;
  tab: string; setTab: (t: string) => void;
  sok: string; setSok: (s: string) => void;
  /** Ett-klikks «legg til»: åpner Ny økt-arket forhåndsutfylt fra brikken. */
  onVelgOkt?: (item: { title: string; durMin: number; akse?: AkseKey; templateSessionId?: string }) => void;
  /** Fasit-fiks: mal-kortene var døde — «Bruk» legger inn mal-uke 1. */
  onBrukMal?: (templateId: string) => void;
  /** 8c.2: vis dragbare periode-brikker (årsplan-zoom). */
  visPerioder?: boolean;
  /** 8c.6: Driller-fanen — klikk legger drillen i VALGT økt. Uten = lesevisning. */
  onLeggDrillIValgt?: (drill: { exerciseId: string; navn: string }) => Promise<{ ok: boolean; error?: string }>;
  /** B40 §3/§5: mal-biblioteket er Pro-only. Default true — samme som Workbench for øvrig. */
  proMode?: boolean;
  /** Mobil: MobilFold-headeren viser allerede «Bibliotek» — dropp den interne. */
  skjulTittel?: boolean;
}) {
  const treff = (txt: string) => !sok || txt.toLowerCase().includes(sok.toLowerCase());
  // 8c.6 (fasit Palette): aksefilter-chips over listene.
  const [akseFilter, setAkseFilter] = useState<AkseKey | null>(null);
  // B40 §3: "maler" er Pro-only — hvis brukeren står der og bytter til
  // Standard, faller innholdet trygt tilbake til Økter (uten å fjerne
  // den lagrede tab-verdien, i tilfelle de bytter tilbake til Pro).
  const effectiveTab = !proMode && tab === "maler" ? "okter" : tab;
  const faner = proMode
    ? [["maler", "Maler"], ["okter", "Økter"], ["driller", "Driller"]]
    : [["okter", "Økter"], ["driller", "Driller"]];
  const maler = (data.planTemplates ?? []).filter((m) => treff(m.name));
  const okter = (data.paletteItems ?? []).filter((b) => treff(b.title) && (!akseFilter || b.cat === akseFilter));
  // Driller-fanen: øvelsesbanken via server-søk (debounced).
  const [driller, setDriller] = useState<{ id: string; name: string; pyramidArea: string }[]>([]);
  const [drillMelding, setDrillMelding] = useState<string | null>(null);
  useEffect(() => {
    if (tab !== "driller") return;
    const t = window.setTimeout(() => {
      sokOvelser(sok, akseFilter ?? undefined).then(setDriller).catch(() => setDriller([]));
    }, sok ? 250 : 0);
    return () => window.clearTimeout(t);
  }, [tab, sok, akseFilter]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      {!skjulTittel && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Caps size={10}>Bibliotek</Caps>
        </div>
      )}
      <PalettSok value={sok} onChange={setSok} placeholder="Søk…" />
      <div style={{ display: "flex", gap: 4 }}>
        {faner.map(([id, l]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className="v2-press v2-focus" style={{ appearance: "none", cursor: "pointer", flex: 1, fontFamily: T.mono, fontSize: 9, fontWeight: 700, padding: "6px 0", borderRadius: 8, border: `1px solid ${effectiveTab === id ? "transparent" : T.border}`, background: effectiveTab === id ? T.lime : T.panel2, color: effectiveTab === id ? T.onLime : T.fg2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</button>
        ))}
      </div>
      {visPerioder && (
        <div style={{ marginBottom: 4 }}>
          <PeriodePalett />
        </div>
      )}
      {effectiveTab !== "maler" && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }} data-wb-aksefilter>
          {([null, "FYS", "TEK", "SLAG", "SPILL", "TURN"] as (AkseKey | null)[]).map((f) => {
            const on = akseFilter === f;
            return (
              <button key={f ?? "alle"} type="button" onClick={() => setAkseFilter(f)} className="v2-press" style={{ appearance: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 8, fontWeight: 700, padding: "4px 8px", borderRadius: 9999, border: `1px solid ${on ? "transparent" : T.border}`, background: on ? (f ? T.ax[f] : T.lime) : T.panel2, color: on ? T.onLime : T.mut, letterSpacing: "0.04em" }}>
                {f ?? "ALLE"}
              </button>
            );
          })}
        </div>
      )}
      {effectiveTab === "maler" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <Caps size={9}>Planmaler</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut }}>{data.planTemplates?.length ?? 0}</span>
          </div>
          {maler.length ? maler.map((m) => (
            <WBMalKort key={m.id} mal={m} onBrukMal={onBrukMal} />
          )) : <TomTilstand icon="search" title="Ingen mal" sub={sok ? "Prøv et annet søk." : "Ingen godkjente planmaler ennå."} />}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {okter.length ? okter.map((b) => (
            <PalettBrikke
              key={b.pid}
              pid={b.pid}
              tittel={b.title}
              akse={b.cat as AkseKey}
              durMin={b.dur}
              sub={fmtVarighet(b.dur)}
              onClick={onVelgOkt ? () => onVelgOkt({ title: b.title, durMin: b.dur, akse: b.cat as AkseKey, templateSessionId: b.templateSessionId }) : undefined}
            />
          )) : <TomTilstand icon="search" title="Ingen treff" sub={sok ? "Prøv et annet søk." : "Ingen standardøkter i biblioteket ennå."} />}
        </div>
      )}
      {tab === "driller" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }} data-wb-drillerfane>
          <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>
            {onLeggDrillIValgt ? "Trykk en drill for å legge den i valgt økt." : "Øvelsesbanken (lesevisning)."}
          </span>
          {drillMelding && <InnsiktChip>{drillMelding}</InnsiktChip>}
          {driller.length ? driller.map((d) => (
            <button
              key={d.id}
              type="button"
              className="v2-press v2-focus"
              disabled={!onLeggDrillIValgt}
              onClick={onLeggDrillIValgt ? async () => {
                const res = await onLeggDrillIValgt({ exerciseId: d.id, navn: d.name });
                setDrillMelding(res.ok ? `«${d.name}» lagt i valgt økt.` : res.error ?? "Kunne ikke legge til.");
                window.setTimeout(() => setDrillMelding(null), 3500);
              } : undefined}
              style={{ appearance: "none", textAlign: "left", padding: "8px 10px", borderRadius: 10, background: T.panel2, border: `1px dashed ${T.borderS}`, cursor: onLeggDrillIValgt ? "pointer" : "default" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[d.pyramidArea as AkseKey] ?? T.mut, flex: "none" }} />
                <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                {onLeggDrillIValgt && <Icon name="plus" size={10} style={{ color: T.mut, flex: "none" }} />}
              </span>
            </button>
          )) : <TomTilstand icon="dumbbell" title="Ingen driller" sub={sok ? "Prøv et annet søk." : "Søk eller filtrer på område."} />}
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

/* ── WB3 (fasit G1): belastningsstripe under canvas ─────────────
   Ærlig konsekvens-visning av uka coachen bygger: planlagte timer i
   visningsuka mot kronisk ukesnitt (28 d / 4) + ACWR-kvote med fasit-
   terskler (>1,4 rød · >1,2 gul) + nedtelling til neste turnering.
   Rendres kun når det finnes belastningsdata — aldri pynte-tomrom. */
export function WBBelastning({ data }: { data: WorkbenchData }) {
  const b = data.belastning;
  if (!b) return null;
  const ukeT = data.summary ? data.summary.plannedHours : Math.round((b.akuttMin / 60) * 10) / 10;
  const snittT = Math.round((b.kroniskSnittMin / 60) * 10) / 10;
  const acwrTone = b.acwr == null ? T.mut : b.acwr > 1.4 ? T.down : b.acwr > 1.2 ? T.warn : T.up;
  const turnering = data.tournaments?.[0];
  return (
    <Kort pad="11px 16px">
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "none" }}>
          <Icon name="activity" size={13} style={{ color: T.fg2 }} />
          <Caps size={8.5}>Belastning</Caps>
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
          Denne uka <span style={{ fontWeight: 700 }}>{fmtTimer(ukeT)}</span>
          <span style={{ color: T.mut }}> · snitt 4 uker {fmtTimer(snittT)}</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flex: "none" }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", padding: "3px 8px", borderRadius: 9999, color: acwrTone, background: `color-mix(in srgb, ${acwrTone} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${acwrTone} 35%, transparent)` }}>
            ACWR {b.acwr != null ? b.acwr.toFixed(2).replace(".", ",") : "—"}
          </span>
          <HjelpTips k="acwr" size={11} />
        </span>
        {b.acwr != null && b.acwr > 1.2 && (
          <span style={{ fontFamily: T.ui, fontSize: 11, color: acwrTone }}>
            {b.acwr > 1.4 ? "Kraftig belastningsøkning — vurder å lette uka." : "Belastningen øker raskt — følg med."}
          </span>
        )}
        <span style={{ flex: 1 }} />
        {turnering && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "none" }}>
            <Icon name="trophy" size={12} style={{ color: turnering.soon ? T.warn : T.mut }} />
            <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: turnering.soon ? T.warn : T.fg2 }}>{turnering.td}</span>
            <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{turnering.tn}</span>
          </span>
        )}
      </div>
    </Kort>
  );
}

/* ── 8c.6: coach-notat i inspektøren (fasit Inspector; kun coach) ── */
function KoachNotatSeksjon({ coachNotat }: { coachNotat: NonNullable<WorkbenchV2Actions["coachNotat"]> }) {
  const [notater, setNotater] = useState<{ id: string; content: string; createdAt: string }[]>([]);
  const [tekst, setTekst] = useState("");
  const [lagrer, setLagrer] = useState(false);
  useEffect(() => {
    let aktiv = true;
    coachNotat.hent().then((res) => { if (aktiv && res.ok) setNotater(res.notater ?? []); });
    return () => { aktiv = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const lagre = async () => {
    if (!tekst.trim() || lagrer) return;
    setLagrer(true);
    const res = await coachNotat.lagre(tekst);
    setLagrer(false);
    if (res.ok) {
      setTekst("");
      const ny = await coachNotat.hent();
      if (ny.ok) setNotater(ny.notater ?? []);
    }
  };
  return (
    <BalSeksjon label="Coach-notat · privat">
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }} data-wb-coachnotat>
        {notater.map((n) => (
          <div key={n.id} style={{ padding: "8px 10px", borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}` }}>
            <p style={{ margin: 0, fontFamily: T.ui, fontSize: 11.5, color: T.fg, lineHeight: 1.45 }}>{n.content}</p>
            <span style={{ fontFamily: T.mono, fontSize: 8, color: T.mut }}>{new Date(n.createdAt).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}</span>
          </div>
        ))}
        <textarea
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder="Nytt notat — kun synlig for deg…"
          rows={2}
          style={{ width: "100%", resize: "vertical", background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 10px", color: T.fg, fontFamily: T.ui, fontSize: 12, outline: "none" }}
        />
        <Knapp ghost icon="file-text" full disabled={!tekst.trim() || lagrer} onClick={lagre}>
          {lagrer ? "Lagrer…" : "Lagre notat"}
        </Knapp>
      </div>
    </BalSeksjon>
  );
}

export function WBBalanse({ data, valgtOkt, valgtDag, weekNumber, actions, weekOffset, onEndret, skjulTittel = false }: {
  data: WorkbenchData;
  valgtOkt: WeekEvent | null;
  /** Dagindeks (0=man) for valgt økt — brukes i slett-popupen. -1 = ukjent. */
  valgtDag?: number;
  weekNumber: number;
  actions?: WorkbenchV2Actions;
  weekOffset: number;
  onEndret: () => void;
  /** Mobil: MobilFold-headeren viser allerede «Balanse» — dropp den interne. */
  skjulTittel?: boolean;
}) {
  const axis = data.axisHours ?? [];
  const totalT = axis.reduce((a, x) => a + x.hours, 0);
  const fokus = data.fokus;
  const adherDisp = useCountUp(data.adherencePct ?? 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
      {!skjulTittel && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="activity" size={15} style={{ color: T.lime }} />
          <span style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg }}>Balanse</span>
          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>uke {weekNumber}</span>
        </div>
      )}

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
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{adherDisp} %</span>
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

      {actions?.coachNotat && <KoachNotatSeksjon coachNotat={actions.coachNotat} />}

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
  // 8c.3 (fasit workbench-maaned): turneringer som markører + periodefarge.
  const turneringPaaDag = new Map<string, string>();
  for (const t of data.tournamentCalendar ?? []) {
    turneringPaaDag.set(nokkel(new Date(t.startDate)), t.title);
  }
  const periodeFarge = (d: Date): string | null => {
    for (const b of data.seasonBlocks ?? []) {
      if (new Date(b.startDate) <= d && d <= new Date(b.endDate)) return LPHASE_FARGE_KANON[b.lPhase] ?? null;
    }
    return null;
  };
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
          const turnering = turneringPaaDag.get(nokkel(dato));
          const pFarge = periodeFarge(dato);
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
                borderBottom: pFarge ? `2px solid color-mix(in srgb, ${pFarge} 70%, transparent)` : undefined,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontFamily: T.disp, fontSize: 13, fontWeight: 700, color: erIDag ? T.lime : c ? T.fg : T.mut }}>{dagNr}</span>
                {turnering && <Icon name="trophy" size={10} style={{ color: T.warn }} aria-label={turnering} />}
              </span>
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
export function DagNivaa({ dag, valgt, onVelg, dager, onFlytt }: {
  dag: DagKol | null;
  valgt: string | null;
  onVelg: (id: string) => void;
  /** Ukas dager — kun for "flytt til dag"-velgeren. Uten = ingen flytt-mulighet (samme touch-vei som knappen selv). */
  dager?: DagKol[];
  onFlytt?: (sessionId: string, dayIndex: number) => void;
}) {
  const [flyttId, setFlyttId] = useState<string | null>(null);
  if (!dag || dag.events.length === 0) {
    return <Kort><TomTilstand icon="calendar" title="Ingen økter" sub="Ingen planlagte økter denne dagen." /></Kort>;
  }
  const denneDagIndex = dager?.findIndex((d) => d.dato === dag.dato && d.dow === dag.dow) ?? -1;
  return (
    <Kort eyebrow={`${dag.dow} ${dag.dato} · tidslinje`} action={<Caps size={9}>{dag.events.length} økter</Caps>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {dag.events.map((o, j) => {
          const ak = o.eb as AkseKey;
          const col = T.ax[ak] || T.mut;
          const sel = !!o.id && valgt === o.id;
          const pending = erOptimistisk(o.id);
          const flyttApen = !!o.id && flyttId === o.id;
          return (
            <div key={o.id ?? j} className="v2-fade-in" style={{ padding: "9px 11px", borderRadius: 10, background: T.panel2, border: `1px ${pending ? "dashed" : "solid"} ${sel ? T.lime : T.border}`, borderLeft: `3px solid ${col}`, opacity: pending ? 0.6 : 1 }}>
              <div onClick={() => o.id && !pending && onVelg(o.id)} style={{ cursor: pending ? "default" : "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.fg2 }}>{toKl(o.h, o.m)}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, color: `color-mix(in srgb, ${col} 55%, ${T.fg})` }}>{AKSE_NAVN[ak] || o.eb}</span>
                  <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>{fmtVarighet(o.durMin)}</span>
                </div>
                <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, marginTop: 5 }}>{o.ttl}</div>
              </div>
              {onFlytt && dager && !pending && o.id && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFlyttId(flyttApen ? null : o.id!); }}
                    className="v2-press v2-focus"
                    style={{ appearance: "none", cursor: "pointer", marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", padding: 0, fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.lime }}
                  >
                    <Icon name="calendar" size={11} />
                    {flyttApen ? "Avbryt" : "Flytt til annen dag"}
                  </button>
                  {flyttApen && (
                    <div className="v2-fade-in" style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                      {dager.map((d, i) => {
                        const erDenneDagen = i === denneDagIndex;
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={erDenneDagen}
                            onClick={(e) => { e.stopPropagation(); setFlyttId(null); onFlytt(o.id!, i); }}
                            className="v2-press v2-focus"
                            style={{ appearance: "none", cursor: erDenneDagen ? "default" : "pointer", width: 34, height: 34, borderRadius: 9, background: erDenneDagen ? T.panel3 : T.panel, border: `1px solid ${erDenneDagen ? T.borderS : T.border}`, fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: erDenneDagen ? T.mut : T.fg2, opacity: erDenneDagen ? 0.5 : 1 }}
                            title={`${d.dow} ${d.dato}`}
                          >
                            {d.dow.slice(0, 2)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
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
export function WorkbenchV2({ data, insights, playerName, planStatus, actions, wbMode }: WorkbenchV2Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const proMode = wbMode !== "standard";
  const [modeBytterPending, startModeBytte] = useTransition();
  // B40 §3: Årsplan (periodisering/makro-faser) er Pro-only — utelates helt
  // fra zoom-velgeren i Standard, ikke bare deaktivert.
  const zoomOptions = proMode
    ? [{ v: "ar", l: "Årsplan" }, { v: "maned", l: "Måned" }, { v: "uke", l: "Uke" }, { v: "dag", l: "Økt" }]
    : [{ v: "maned", l: "Måned" }, { v: "uke", l: "Uke" }, { v: "dag", l: "Økt" }];

  function byttWbMode(neste: "standard" | "pro") {
    if (neste === (wbMode ?? "pro") || modeBytterPending) return;
    startModeBytte(async () => {
      await setWbMode(neste);
      router.refresh();
    });
  }

  // Zoom + valgt økt bor i URL-en (?zoom= / ?okt=) så visningen overlever
  // router.refresh() etter endringer, remount og deling av lenke. B40 §3:
  // Årsplan-zoom er Pro-only — en ?zoom=ar-lenke delt av en Pro-bruker skal
  // ikke smugle periodiserings-flaten inn hos en Standard-bruker.
  const zoomParam = searchParams.get("zoom");
  const [nivaa, setNivaaState] = useState(
    zoomParam === "ar" ? (proMode ? "ar" : "uke") : zoomParam === "maned" || zoomParam === "dag" ? zoomParam : "uke",
  );
  const [tab, setTab] = useState(proMode ? "maler" : "okter");
  const [sok, setSok] = useState("");
  const [nyOktApen, setNyOktApen] = useState(false);
  const [nyOktPrefill, setNyOktPrefill] = useState<{ title: string; durMin: number; akse?: AkseKey; drills?: OktArkDrill[] } | null>(null);
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
  // Coldstart-utgang: bruker valgte «start med blanke ark» — hopp forbi
  // guidet-start-skjermen og inn i den tomme tidslinja (Ny økt finnes der).
  const [manuellStart, setManuellStart] = useState(false);

  // dnd-kit: PointerSensor dekker BÅDE mus og touch (Pointer Events) — samme
  // sensor for iPad/mobil som desktop, ingen egen touch-håndtering. distance:8
  // sikrer at et vanlig trykk (under 8px bevegelse) fortsatt gir onClick i
  // stedet for å bli tolket som et drag (samme mønster som draggable-sessions.tsx).
  const wbSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [activeDrag, setActiveDrag] = useState<WbDragData | null>(null);

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

  // 8c.4: Cmd/Ctrl+D dupliserer valgt økt direkte (Notion-stil) — kopien
  // legges neste dag samme tid og er dragbar («fordel utover måneden»).
  const [dupliserMelding, setDupliserMelding] = useState<string | null>(null);
  useEffect(() => {
    if (!actions?.duplicateSession) return;
    const handler = async (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "d") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (!valgtOkt?.id || (valgtOkt.source ?? "plan") !== "plan") return;
      e.preventDefault();
      const res = await actions.duplicateSession!(valgtOkt.id);
      if (res.ok) {
        setDupliserMelding("Økt duplisert til neste dag — dra den dit du vil.");
        window.setTimeout(() => setDupliserMelding(null), 4000);
        router.refresh();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions, valgtOkt, router]);

  // 8c.5: universell økt-popup — trykk en økt i hvilken som helst visning →
  // popup med alt redigerbart (Anders: «alt skal være trykkbart»).
  const [redigerOktId, setRedigerOktId] = useState<string | null>(null);
  const velgOgAapne = (id: string) => {
    setValgtId(id);
    const okt = alleEvents.find((e) => e.id === id);
    const redigerbar = !!actions?.updateSession && okt && (okt.source ?? "plan") === "plan" &&
      !["COMPLETED", "ABANDONED", "SKIPPED", "CANCELLED"].includes(okt.status ?? "PLANNED");
    if (redigerbar) setRedigerOktId(id);
  };
  const redigerOkt = redigerOktId ? alleEvents.find((e) => e.id === redigerOktId) ?? null : null;
  const redigerDag = redigerOkt ? dager.findIndex((d) => d.events.some((e) => e.id === redigerOkt.id)) : -1;

  // 8c.6: Driller-fanen — klikk legger drillen i VALGT økt (append via
  // hentOktKomponist → updateSession replace-liste).
  const leggDrillIValgt = async (drill: { exerciseId: string; navn: string }): Promise<{ ok: boolean; error?: string }> => {
    if (!actions?.updateSession) return { ok: false, error: "Ingen skrivetilgang." };
    if (!valgtOkt?.id || (valgtOkt.source ?? "plan") !== "plan") return { ok: false, error: "Velg en plan-økt i tidslinja først." };
    const naa = await hentOktKomponist(valgtOkt.id);
    if (!naa.ok) return { ok: false, error: "Fikk ikke lastet økten." };
    const res = await actions.updateSession(valgtOkt.id, {
      drills: [
        ...(naa.drills ?? []).map((d) => ({ exerciseId: d.exerciseId, minutter: d.minutter, sett: d.sett, reps: d.reps, nivaa: d.nivaa })),
        { exerciseId: drill.exerciseId, minutter: null, sett: null, reps: null, nivaa: "vanlig" as const },
      ],
    });
    if (res.ok) router.refresh();
    return res;
  };

  // Skriv zoom/valg til URL med replace (skal ikke forurense historikken).
  const oppdaterUrl = (mut: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mut(params);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const setNivaa = (v: string) => {
    // B40 §3: uansett hvilken vei "ar" ble forsøkt nådd (PillVelger,
    // ZoomBrodsmule, «Legg årsplanen først»-CTA), Standard-modus faller
    // trygt tilbake til uke — myk grense, ikke en feilmelding.
    const neste = v === "ar" && !proMode ? "uke" : v;
    setNivaaState(neste);
    oppdaterUrl((p) => {
      if (neste === "uke") p.delete("zoom");
      else p.set("zoom", neste);
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
  const adherDisp = useCountUp(adher ?? 0);
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

  // WB4: diff-modal før publisering (lagt til / fjernet / endret + timer).
  const [pubDiff, setPubDiff] = useState<import("@/lib/workbench/publish-actions").PubliserDiff | null>(null);
  const handlePublish = async () => {
    if (!actions || pubLoading) return;
    if (actions.publishDiff && !pubDiff) {
      setPubLoading(true);
      const d = await actions.publishDiff();
      setPubLoading(false);
      if (d.ok && d.diff) {
        setPubDiff(d.diff);
        return; // modalen tar over — Bekreft kaller handlePublishBekreft
      }
      // Diff utilgjengelig → publiser direkte (aldri sperre).
    }
    await handlePublishBekreft();
  };
  const handlePublishBekreft = async () => {
    if (!actions || pubLoading) return;
    setPubDiff(null);
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

  const velgFraBibliotek = async (item: { title: string; durMin: number; akse?: AkseKey; templateSessionId?: string }) => {
    // Biblioteks-økta skal ta med INNHOLDET (drillene), ikke bare tittelen —
    // hentes før arket åpnes så alt står ferdig utfylt.
    let drills: OktArkDrill[] | undefined;
    if (item.templateSessionId) {
      try {
        const res = await hentMalOktDrills(item.templateSessionId);
        if (res.ok) drills = res.drills;
      } catch {
        // Uten drill-data åpner arket likevel — brukeren kan legge til selv.
      }
    }
    setNyOktPrefill({ title: item.title, durMin: item.durMin, akse: item.akse, drills });
    setNyOktApen(true);
  };

  const bekreftMal = async () => {
    if (!actions?.applyTemplate || !malBekreft || malLegger) return;
    setMalLegger(true);
    const res = await actions.applyTemplate(malBekreft.templateId);
    setMalLegger(false);
    setMalBekreft(null);
    if (res.ok) {
      // B40 §4: fasilitetskonsekvens — vis ØKTER SOM BLE TATT UT pga. anlegg,
      // ikke bare den generiske «lagt inn»-teksten (var stille frafall før).
      const tekst =
        res.justeringer && res.justeringer.length > 0
          ? `Mal-uke 1 fra «${malBekreft.name}» lagt inn. ${res.justeringer.join(" ")}`
          : `Mal-uke 1 fra «${malBekreft.name}» lagt inn — juster på tidslinja.`;
      setMelding({ tone: res.justeringer?.length ? "info" : "up", tekst });
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
      const tekst =
        res.justeringer && res.justeringer.length > 0
          ? `Mal-uke 1 lagt inn. ${res.justeringer.join(" ")}`
          : "Mal-uke 1 lagt inn — juster øktene på tidslinja.";
      setMelding({ tone: res.justeringer?.length ? "info" : "up", tekst });
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

  // dnd-kit sentral onDragEnd — WBTidslinje/WBBibliotek markerer bare
  // dra-/slippbare flater (useDraggable/useDroppable); selve mutasjonen
  // (samme logikk som de tre native onDrop-grenene hadde) skjer her, siden
  // handleDropMove/handleDropAdd/setMalBekreft lever i denne komponenten.
  const handleWbDragStart = (event: DragStartEvent) => {
    setActiveDrag((event.active.data.current as WbDragData | undefined) ?? null);
  };
  const handleWbDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;
    const dayMatch = /^day-(\d+)$/.exec(String(over.id));
    if (!dayMatch) return;
    const dayIndex = Number(dayMatch[1]);
    const payload = active.data.current as WbDragData | undefined;
    if (!payload) return;
    if (payload.kind === "move") {
      handleDropMove(payload.sessionId, dayIndex);
    } else if (payload.kind === "add") {
      // Samme Y→klokkeslett-utregning som native `tidFraY` brukte, men med
      // pointer-posisjon rekonstruert fra start-event + total bevegelse
      // (dnd-kit gir ikke rå clientY i onDragEnd).
      const activatorEvent = event.activatorEvent as PointerEvent | undefined;
      const pointerY = (activatorEvent?.clientY ?? over.rect.top) + event.delta.y;
      const { hour, minute } = tidFraPointerY(pointerY, over.rect.top);
      handleDropAdd({ title: payload.title, durMin: payload.durMin, akse: payload.akse }, dayIndex, hour, minute);
    } else if (payload.kind === "mal") {
      setMalBekreft({ templateId: payload.templateId, name: payload.name, sessionCount: payload.sessionCount, varighetUker: payload.varighetUker });
    }
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
    const payload = {
      dayIndex: input.dayIndex,
      title: input.title,
      durMin: input.durMin,
      area: input.akse,
      hour: input.hour,
      minute: input.minute,
      // Felles økt-ark (2026-07-13): AK-formel + driller følger med fra «Ny økt».
      ...(input.lFase || input.miljo
        ? { akFormel: { lFase: input.lFase, miljo: input.miljo } }
        : {}),
      ...(input.drills.length > 0
        ? {
            drills: input.drills.map((d) => ({
              exerciseId: d.exerciseId,
              nyNavn: d.exerciseId ? undefined : d.navn,
              nyPyramidArea: d.exerciseId ? undefined : input.akse,
              minutter: d.minutter,
              sett: d.sett,
              reps: d.reps,
              nivaa: d.nivaa,
              positionTaskId: d.positionTaskId,
            })),
          }
        : {}),
    };
    const res = await actions.addSession({ ...payload, weekOffset });
    if (!res.ok) {
      setPendingAdds((prev) => prev.filter((p) => p.key !== addKey));
      return res;
    }
    // Gjenta ukentlig (kalendermønster, 2026-07-19): samme økt legges inn i
    // ukene fremover via samme action med weekOffset+i — hver uke blir en
    // selvstendig økt (kan flyttes/endres/slettes uavhengig). Delvis feil
    // stopper ikke det som alt er lagt inn — meldes ærlig i stedet.
    const gjenta = Math.max(1, Math.min(12, input.gjentaUker ?? 1));
    let lagtInn = 1;
    for (let i = 1; i < gjenta; i++) {
      const r = await actions.addSession({ ...payload, weekOffset: weekOffset + i });
      if (r.ok) lagtInn++;
    }
    if (gjenta > 1) {
      setMelding(
        lagtInn === gjenta
          ? { tone: "up", tekst: `Økten er lagt inn ${gjenta} uker fremover.` }
          : { tone: "down", tekst: `Økten ble lagt inn i ${lagtInn} av ${gjenta} uker — sjekk ukene og legg til resten manuelt.` },
      );
    }
    setNyOktApen(false);
    setNyOktPrefill(null);
    setNyOktSted(null);
    router.refresh();
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
  // 8c.2: eksplisitt årsplan-zoom vinner over coldstart — Anders' års-først-
  // flyt: legg periodiseringen FØR første økt/mal (coldstart lenker hit).
  if (heltTom && actions && nivaa !== "ar" && !manuellStart) {
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
              // B40 §4: fasilitetskonsekvens — samme myke varsel som brukMalFraBibliotek/bekreftMal.
              const tekst =
                res.justeringer && res.justeringer.length > 0
                  ? `Første uke er lagt inn fra malen. ${res.justeringer.join(" ")}`
                  : "Første uke er lagt inn fra malen — juster den på tidslinja.";
              setMelding({ tone: res.justeringer?.length ? "info" : "up", tekst });
              router.refresh();
            }
            return res;
          } : undefined}
          onForeslaaUke={actions.suggestWeek ? handleSuggest : undefined}
          foreslarUke={suggestLoading}
          onAarsplan={actions.lagrePeriode ? () => setNivaa("ar") : undefined}
          onManuelt={() => setManuellStart(true)}
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
    <DndContext
      sensors={wbSensors}
      collisionDetection={pointerWithin}
      onDragStart={handleWbDragStart}
      onDragEnd={handleWbDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, position: "relative" }}>
      {/* TOPP-BAR — desktop (md+): uendret */}
      <div className="hidden md:flex" style={{ alignItems: "flex-end", gap: 16, flexWrap: "wrap", paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mut, display: "block" }}>Workbench</span>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, letterSpacing: "-0.02em", margin: "3px 0 6px" }}>{playerName}</div>
          <StatusPill tone={st.tone}>{st.l}</StatusPill>
        </div>
        <Felt label="Zoom"><PillVelger options={zoomOptions} value={nivaa} onChange={setNivaa} /></Felt>
        <Felt label="Modus">
          <PillVelger
            options={[{ v: "standard", l: "Standard" }, { v: "pro", l: "Pro" }]}
            value={wbMode ?? "pro"}
            onChange={(v) => byttWbMode(v === "standard" ? "standard" : "pro")}
          />
        </Felt>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 14px", borderRadius: 12, background: `color-mix(in srgb, ${harAvvik ? T.warn : T.up} 6%, transparent)`, border: `1px solid color-mix(in srgb, ${harAvvik ? T.warn : T.up} 32%, transparent)`, flex: "none" }}>
          <span style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.fg, lineHeight: 0.9, fontVariantNumeric: "tabular-nums", flex: "none" }}>{adher != null ? `${adherDisp}%` : "–"}</span>
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
            <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{adher != null ? `${adherDisp}%` : "–"}</span>
            <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.mut, whiteSpace: "nowrap" }}>etterlevelse</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ overflowX: "auto", paddingBottom: 1, flex: 1, minWidth: 0 }}>
            <PillVelger options={zoomOptions} value={nivaa} onChange={setNivaa} />
          </div>
          <div style={{ flex: "none" }}>
            <PillVelger
              options={[{ v: "standard", l: "Std" }, { v: "pro", l: "Pro" }]}
              value={wbMode ?? "pro"}
              onChange={(v) => byttWbMode(v === "standard" ? "standard" : "pro")}
            />
          </div>
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
        <WBBibliotek data={data} tab={tab} setTab={setTab} sok={sok} setSok={setSok} onVelgOkt={actions ? velgFraBibliotek : undefined} onBrukMal={actions?.applyTemplate ? brukMalFraBibliotek : undefined} visPerioder={nivaa === "ar" && !!actions?.lagrePeriode} onLeggDrillIValgt={actions?.updateSession ? leggDrillIValgt : undefined} proMode={proMode} />
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
          {dupliserMelding && <InnsiktChip>{dupliserMelding}</InnsiktChip>}
          {insights?.line && <InnsiktChip>{insights.line}</InnsiktChip>}
          {nivaa === "uke" && data.weekStartISO && (
            <WBPeriodeStrip
              data={data}
              vindu={{ fra: new Date(data.weekStartISO), til: new Date(new Date(data.weekStartISO).getTime() + 6 * 86_400_000) }}
              onTilAarsplan={() => setNivaa("ar")}
            />
          )}
          {nivaa === "maned" && data.weekStartISO && (
            <WBPeriodeStrip
              data={data}
              vindu={{
                fra: new Date(new Date(data.weekStartISO).getFullYear(), new Date(data.weekStartISO).getMonth(), 1),
                til: new Date(new Date(data.weekStartISO).getFullYear(), new Date(data.weekStartISO).getMonth() + 1, 0),
              }}
              onTilAarsplan={() => setNivaa("ar")}
            />
          )}
          {nivaa === "uke" && data.groupSlots && <WBGruppetider slots={data.groupSlots} />}
          {nivaa === "uke" && (
            <div key="uke" className="v2-fade-in">
              <WBTidslinje
                dager={dager}
                valgt={valgtOkt?.id ?? null}
                onVelg={velgOgAapne}
                kanFlytteOkter={!!actions}
                kanLeggeTil={!!actions}
                kanBrukeMal={!!actions?.applyTemplate}
                onTomKlikk={actions ? (dayIndex, hour, minute) => {
                  setNyOktSted({ dayIndex, tid: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` });
                  setNyOktApen(true);
                } : undefined}
              />
            </div>
          )}
          {nivaa === "uke" && proMode && <WBBelastning data={data} />}
          {nivaa === "ar" && (
            <div key="ar" className="v2-fade-in">
              <WorkbenchAarsplan
                data={data}
                handlers={actions?.lagrePeriode && actions?.slettPeriode ? { lagre: actions.lagrePeriode, slett: actions.slettPeriode } : undefined}
                onEndret={() => router.refresh()}
              />
            </div>
          )}
          {nivaa === "dag" && <div key="dag" className="v2-fade-in"><DagNivaa dag={aktivDag} valgt={valgtOkt?.id ?? null} onVelg={velgOgAapne} dager={dager} onFlytt={actions ? handleDropMove : undefined} /></div>}
          {nivaa === "maned" && <div key="maned" className="v2-fade-in"><MndNivaa data={data} onVelgDato={velgDatoFraMnd} /></div>}
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
        {nivaa === "uke" && data.weekStartISO && (
          <WBPeriodeStrip
            data={data}
            vindu={{ fra: new Date(data.weekStartISO), til: new Date(new Date(data.weekStartISO).getTime() + 6 * 86_400_000) }}
            onTilAarsplan={() => setNivaa("ar")}
          />
        )}
        {nivaa === "uke" && data.groupSlots && <WBGruppetider slots={data.groupSlots} />}
        {nivaa === "uke" && <div key="uke" className="v2-fade-in"><WBTidslinjeMobil dager={dager} valgt={valgtOkt?.id ?? null} onVelg={velgOgAapne} onFlytt={actions ? handleDropMove : undefined} /></div>}
        {nivaa === "uke" && proMode && <WBBelastning data={data} />}
        {nivaa === "ar" && (
          <div key="ar" className="v2-fade-in">
            <WorkbenchAarsplan
              data={data}
              handlers={actions?.lagrePeriode && actions?.slettPeriode ? { lagre: actions.lagrePeriode, slett: actions.slettPeriode } : undefined}
              onEndret={() => router.refresh()}
            />
          </div>
        )}
        {nivaa === "dag" && <div key="dag" className="v2-fade-in"><DagNivaa dag={aktivDag} valgt={valgtOkt?.id ?? null} onVelg={velgOgAapne} dager={dager} onFlytt={actions ? handleDropMove : undefined} /></div>}
        {nivaa === "maned" && <div key="maned" className="v2-fade-in"><MndNivaa data={data} onVelgDato={velgDatoFraMnd} /></div>}

        <MobilFold tittel="Bibliotek" ikon="layers">
          <WBBibliotek data={data} tab={tab} setTab={setTab} sok={sok} setSok={setSok} onVelgOkt={actions ? velgFraBibliotek : undefined} onBrukMal={actions?.applyTemplate ? brukMalFraBibliotek : undefined} visPerioder={nivaa === "ar" && !!actions?.lagrePeriode} onLeggDrillIValgt={actions?.updateSession ? leggDrillIValgt : undefined} proMode={proMode} skjulTittel />
        </MobilFold>
        <MobilFold tittel="Balanse" ikon="activity">
          <WBBalanse
            skjulTittel
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

      {pubDiff && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={() => setPubDiff(null)} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
          <div role="dialog" aria-label="Bekreft publisering" className="v2-sheet-in" style={{ position: "relative", width: "min(440px, 100%)", maxHeight: "85vh", overflowY: "auto", background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="send" size={16} style={{ color: T.lime }} />
              <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>Publiser plan</h2>
            </div>
            {pubDiff.forsteGang ? (
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: "12px 0 0", lineHeight: 1.55 }}>
                Første publisering — hele planen sendes til spilleren for godkjenning.
              </p>
            ) : (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }} data-wb-pubdiff>
                {pubDiff.lagtTil.length > 0 && (
                  <div>
                    <Caps size={8.5}>Lagt til ({pubDiff.lagtTil.length})</Caps>
                    {pubDiff.lagtTil.map((r, i) => <div key={i} style={{ fontFamily: T.ui, fontSize: 12, color: T.up, marginTop: 3 }}>+ {r.title} · {r.nar}</div>)}
                  </div>
                )}
                {pubDiff.fjernet.length > 0 && (
                  <div>
                    <Caps size={8.5}>Fjernet ({pubDiff.fjernet.length})</Caps>
                    {pubDiff.fjernet.map((r, i) => <div key={i} style={{ fontFamily: T.ui, fontSize: 12, color: T.down, marginTop: 3 }}>− {r.title} · {r.nar}</div>)}
                  </div>
                )}
                {pubDiff.endret.length > 0 && (
                  <div>
                    <Caps size={8.5}>Endret ({pubDiff.endret.length})</Caps>
                    {pubDiff.endret.map((r, i) => <div key={i} style={{ fontFamily: T.ui, fontSize: 12, color: T.warn, marginTop: 3 }}>~ {r.title} — {r.hva}</div>)}
                  </div>
                )}
                {pubDiff.lagtTil.length === 0 && pubDiff.fjernet.length === 0 && pubDiff.endret.length === 0 && (
                  <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen endringer siden forrige publisering.</span>
                )}
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fg2, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                  Belastning: {fmtTimer(pubDiff.minutterFor / 60)} → <span style={{ fontWeight: 700, color: pubDiff.minutterNa > pubDiff.minutterFor ? T.warn : T.fg }}>{fmtTimer(pubDiff.minutterNa / 60)}</span> planlagt fremover
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <Knapp ghost onClick={() => setPubDiff(null)} disabled={pubLoading}>Avbryt</Knapp>
              <Knapp icon="send" onClick={handlePublishBekreft} disabled={pubLoading}>{pubLoading ? "Publiserer…" : "Bekreft og publiser"}</Knapp>
            </div>
          </div>
        </div>
      )}

      {redigerOkt && actions && (
        <RedigerOktArk
          okt={redigerOkt}
          dag={redigerDag}
          weekOffset={weekOffset}
          actions={actions}
          onLukk={() => setRedigerOktId(null)}
          onEndret={() => router.refresh()}
        />
      )}

      {malBekreft && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={malLegger ? undefined : () => setMalBekreft(null)} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
          <div role="dialog" aria-label="Legg inn mal" className="v2-sheet-in" style={{ position: "relative", width: "min(400px, 100%)", background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
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
          defaultDrills={nyOktPrefill?.drills}
          onLukk={() => { setNyOktApen(false); setNyOktPrefill(null); setNyOktSted(null); }}
          onOpprett={handleCreateSession}
          searchTeknisk={actions.searchTeknisk}
        />
      )}
    </div>
    <DragOverlay dropAnimation={null}>
      {activeDrag ? <WBDragOverlayInnhold data={activeDrag} /> : null}
    </DragOverlay>
    </DndContext>
  );
}
