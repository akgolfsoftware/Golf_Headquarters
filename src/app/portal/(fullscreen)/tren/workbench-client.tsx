"use client";

// Workbench v2 — klient-komponent.
//
// To moduser: STATUS (hvor er jeg?) og PLAN (hva skal jeg gjøre?)
// Plan-modus har zoom-akse: År → Måned → Uke → Dag → Økt
//
// Dette er en 1:1 portering av /public/design/workbench-v2.html til TSX.
// Hardkodet data for Markus R.P. · Uke 21 · Spesialisering-periode.
// Server actions / Prisma kobles på i senere fase.

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import "./workbench-v2.css";
import {
  AiForeslaUkeModal,
  AskCoachModal,
  DisciplineKey,
  DisciplineModal,
  EditSessionModal,
  EmptySlotPopover,
  EventPreviewPopover,
  LogSessionModal,
  MessagesDrawer,
  ModalName,
  NewGoalModal,
  NotificationsPopover,
  NyEktModal,
  NyEktPrefill,
  PlanAdjustModal,
  TrackManImportModal,
  UkeEvent,
} from "./workbench-modaler";

/* ─── SVG sprite (Lucide-style ikoner) ─────────────────────────────── */

function SvgSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <symbol id="ic-home" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </symbol>
        <symbol id="ic-bell" viewBox="0 0 24 24">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </symbol>
        <symbol id="ic-cal" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </symbol>
        <symbol id="ic-target" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </symbol>
        <symbol id="ic-bar" viewBox="0 0 24 24">
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </symbol>
        <symbol id="ic-user" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </symbol>
        <symbol id="ic-clipboard" viewBox="0 0 24 24">
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </symbol>
        <symbol id="ic-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </symbol>
        <symbol id="ic-plus" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </symbol>
        <symbol id="ic-arrow-right" viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </symbol>
        <symbol id="ic-chev-l" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </symbol>
        <symbol id="ic-chev-r" viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </symbol>
        <symbol id="ic-up" viewBox="0 0 24 24">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </symbol>
        <symbol id="ic-down" viewBox="0 0 24 24">
          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
          <polyline points="16 17 22 17 22 11" />
        </symbol>
        <symbol id="ic-sparkles" viewBox="0 0 24 24">
          <path d="M12 3l1.9 5.7L19.6 10.6 13.9 12.5 12 18.2 10.1 12.5 4.4 10.6 10.1 8.7Z" />
        </symbol>
        <symbol id="ic-flag" viewBox="0 0 24 24">
          <path d="M4 22V4" />
          <path d="M4 4h11l-2 4 2 4H4" />
        </symbol>
        <symbol id="ic-star" viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </symbol>
        <symbol id="ic-msg" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </symbol>
        <symbol id="ic-eye" viewBox="0 0 24 24">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </symbol>
        <symbol id="ic-hammer" viewBox="0 0 24 24">
          <path d="M15 12l-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9" />
          <path d="M17.64 15L22 10.64" />
          <path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
        </symbol>
        <symbol id="ic-grip" viewBox="0 0 24 24">
          <circle cx="9" cy="6" r="1" />
          <circle cx="15" cy="6" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="9" cy="18" r="1" />
          <circle cx="15" cy="18" r="1" />
        </symbol>
        <symbol id="ic-check" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </symbol>
        <symbol id="ic-import" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </symbol>
        <symbol id="ic-trophy" viewBox="0 0 24 24">
          <path d="M6 9H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h3" />
          <path d="M18 9h2a2 2 0 0 0 2-2V6a1 1 0 0 0-1-1h-3" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </symbol>
        <symbol id="ic-flame" viewBox="0 0 24 24">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </symbol>
        <symbol id="ic-trash" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </symbol>
        <symbol id="ic-alert" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </symbol>
        <symbol id="ic-clock" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </symbol>
        <symbol id="ic-map-pin" viewBox="0 0 24 24">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </symbol>
        <symbol id="ic-refresh" viewBox="0 0 24 24">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
          <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
        </symbol>
        <symbol id="ic-moon" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </symbol>
      </defs>
    </svg>
  );
}

const Icon = ({
  id,
  width,
  height,
  strokeWidth = 1.75,
}: {
  id: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <use href={`#${id}`} />
  </svg>
);

/* ─── Uke-event data ───────────────────────────────────────────────── */

const UKE_EVENTS: UkeEvent[] = [
  { id: "pitch-mon", d: 0, h: 9, dur: 60, k: "slag", t: "Pitch 50—100m, lav", time: "09:00 — 10:00", dayLabel: "Mandag 19. mai", reps: 184, drill: "Pitch 50—100m, lav trajectory", focus: "Landing-sone ±3m · spinn lav", assigned: "Selvplanlagt", status: "fullfort", statusText: "FULLFØRT", goal: "Approach 100—150m er <strong>prio 1</strong> — pitch er forberedelse for de korte iron-skuddene." },
  { id: "iron-mon", d: 0, h: 14, dur: 90, k: "tek", t: "Iron CS70 → CS80", time: "14:00 — 15:30", dayLabel: "Mandag 19. mai", reps: 240, drill: "Iron-progresjon CS70 → CS80", focus: "Snitt-CS opp fra 74 til <strong>76 mph</strong>", assigned: "Av Anders K.", status: "planlagt", statusText: "PLANLAGT · NESTE OPP", goal: "Bidrar til <strong>Top 10 NM Slag</strong> via approach-kontroll på 100—150m." },
  { id: "mental-mon", d: 0, h: 16, dur: 15, k: "turn", t: "Mental visualisering", time: "16:00 — 16:15", dayLabel: "Mandag 19. mai", reps: 0, drill: "Pre-Sørlands ritual", focus: "Visualiser hull 1 + 12 på Mandal", assigned: "Egen-økt", status: "planlagt", statusText: "PLANLAGT", goal: "Forberedelse for <strong>Sørlandsåpent</strong> · 21 dager." },
  { id: "fys-tue", d: 1, h: 11, dur: 30, k: "fys", t: "Beinbøy + core", time: "11:00 — 11:30", dayLabel: "Tirsdag 20. mai", reps: 0, drill: "Beinbøy + core", focus: "4 sett · core-stabilitet", assigned: "Egen-økt", status: "planlagt", statusText: "PLANLAGT", goal: "Bygger fundament for CS-progresjon." },
  { id: "bunker-wed", d: 2, h: 9, dur: 90, k: "slag", t: "Bunker-eskalering", time: "09:00 — 10:30", dayLabel: "Onsdag 21. mai", reps: 80, drill: "Bunker-eskalering", focus: "Greenside · escalating distances", assigned: "Selvplanlagt", status: "planlagt", statusText: "PLANLAGT", goal: "Bossum har 4 bunker-omkransede greener." },
  { id: "spillsim-wed", d: 2, h: 17, dur: 90, k: "spill", t: "9-hulls spillsim", time: "17:00 — 18:30", dayLabel: "Onsdag 21. mai", reps: 9, drill: "9-hulls spillsim", focus: "Score-runde · klubbvalg", assigned: "Egen-økt", status: "planlagt", statusText: "PLANLAGT", goal: "Sjekker form før Bossum Open lørdag." },
  { id: "driver-fri", d: 4, h: 11, dur: 60, k: "tek", t: "Driver grunntrening", time: "11:00 — 12:00", dayLabel: "Fredag 23. mai", reps: 120, drill: "Driver grunntrening", focus: "CS 112 mph stable · smash 1,48", assigned: "Av Anders K.", status: "planlagt", statusText: "PLANLAGT", goal: "Bidrar til <strong>HCP +2,0</strong> via driving-distance." },
  { id: "bossum-sat", d: 5, h: 9, dur: 240, k: "spill", t: "Bossum Open · R1", time: "09:00 — 13:00", dayLabel: "Lørdag 24. mai", reps: 18, drill: "Turnerings-runde", focus: "18 hull · runde 1 · tee 09:00", assigned: "Turnering", status: "turnering", statusText: "TURNERING", goal: "Form-test før Sørlandsåpent. Mål: under 73." },
  { id: "putt-sun", d: 6, h: 18, dur: 30, k: "slag", t: "Putting 0—3m", time: "18:00 — 18:30", dayLabel: "Søndag 25. mai", reps: 100, drill: "Putting 0—3m blokk", focus: "Klokke-drill · 90% treff", assigned: "Selvplanlagt", status: "planlagt", statusText: "PLANLAGT", goal: "Putting har størst comeback-potensial i SG." },
];

const EMPTY_SLOTS = [
  { d: 1, h: 14 },
  { d: 3, h: 12 },
  { d: 3, h: 15 },
];

const UKE_DAYS = [
  { lbl: "MAN", dnum: 19, today: true, weekend: false },
  { lbl: "TIR", dnum: 20, today: false, weekend: false },
  { lbl: "ONS", dnum: 21, today: false, weekend: false },
  { lbl: "TOR", dnum: 22, today: false, weekend: false },
  { lbl: "FRE", dnum: 23, today: false, weekend: false },
  { lbl: "LØR", dnum: 24, today: false, weekend: true },
  { lbl: "SØN", dnum: 25, today: false, weekend: true },
];

const UKE_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

/* ─── Måned-grid data (mai 2026) ───────────────────────────────────── */

type MonthEvt = { dots: DisciplineKey[]; summary: string; today?: boolean; tour?: string };

const APR_EVTS: Record<number, MonthEvt> = {
  28: { dots: ["tek", "fys"], summary: "120 min" },
  29: { dots: ["slag"], summary: "60 min" },
  30: { dots: [], summary: "—" },
};

const MAY_EVTS: Record<number, MonthEvt> = {
  1: { dots: ["fys", "tek"], summary: "110 min" },
  2: { dots: ["spill"], summary: "4 t · Bossum" },
  3: { dots: [], summary: "—" },
  4: { dots: ["tek", "slag"], summary: "150 min" },
  5: { dots: ["fys"], summary: "30 min" },
  6: { dots: ["slag", "tek"], summary: "120 min" },
  7: { dots: ["tek"], summary: "90 min" },
  8: { dots: ["fys", "slag"], summary: "90 min" },
  9: { dots: ["spill"], summary: "4 t" },
  10: { dots: [], summary: "—" },
  11: { dots: ["tek", "slag"], summary: "150 min" },
  12: { dots: ["fys", "slag"], summary: "90 min" },
  13: { dots: ["slag", "tek"], summary: "180 min" },
  14: { dots: ["tek"], summary: "90 min" },
  15: { dots: ["fys", "tek"], summary: "110 min" },
  16: { dots: ["spill"], summary: "4 t · runde" },
  17: { dots: [], summary: "—" },
  18: { dots: ["fys"], summary: "30 min" },
  19: { dots: ["slag", "tek", "turn"], summary: "165 min", today: true },
  20: { dots: ["fys"], summary: "30 min" },
  21: { dots: ["slag", "turn", "tek"], summary: "180 min" },
  22: { dots: [], summary: "—" },
  23: { dots: ["tek", "fys"], summary: "110 min" },
  24: { dots: ["spill"], summary: "Bossum R1", tour: "BOSSUM" },
  25: { dots: ["spill"], summary: "Bossum R2", tour: "BOSSUM" },
  26: { dots: ["fys"], summary: "30 min" },
  27: { dots: ["tek", "slag"], summary: "150 min" },
  28: { dots: ["fys"], summary: "40 min" },
  29: { dots: ["slag", "tek"], summary: "120 min" },
  30: { dots: ["spill"], summary: "4 t" },
  31: { dots: [], summary: "—" },
};

const DOT_COLOR: Record<DisciplineKey, string> = {
  fys: "var(--fys)",
  tek: "var(--tek)",
  slag: "var(--slag)",
  spill: "var(--spill)",
  turn: "#C8B72A",
};

/* ─── Dag-tidslinje ────────────────────────────────────────────────── */

type DagEvt = {
  k: DisciplineKey;
  t: string;
  meta: string;
  empty?: boolean;
  primary?: boolean;
};
const DAG_EVTS: Record<number, DagEvt> = {
  9: { k: "slag", t: "Pitch 50—100m, lav", meta: "09:00 — 10:00 · 184 reps · FULLFØRT" },
  11: { k: "fys", t: "Beinbøy + core (valgfri)", meta: "11:00 — 11:30 · egen-økt", empty: true },
  14: { k: "tek", t: "Iron-progresjon CS70 → CS80", meta: "14:00 — 15:30 · 240 reps · AV ANDERS", primary: true },
  16: { k: "turn", t: "Mental visualisering", meta: "16:00 — 16:15 · pre-Sørlands" },
};

/* ─── Type for view modes ──────────────────────────────────────────── */

type Mode = "status" | "plan";
type Zoom = "ar" | "md" | "uke" | "dag" | "okt";

type Router = ReturnType<typeof useRouter>;

/* ─── Main client component ────────────────────────────────────────── */

export function WorkbenchClient() {
  const router = useRouter();
  const toaster = useToast();
  const [mode, setMode] = useState<Mode>("status");
  const [zoom, setZoom] = useState<Zoom>("uke");
  const [modal, setModal] = useState<ModalName>(null);
  const [discKey, setDiscKey] = useState<DisciplineKey>("tek");
  const [nyEktPrefill, setNyEktPrefill] = useState<NyEktPrefill | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRect, setNotifRect] = useState<DOMRect | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const openNyEkt = useCallback((prefilled?: NyEktPrefill) => {
    setNyEktPrefill(prefilled);
    setModal("ny-okt");
  }, []);
  const openMessagesWithAnders = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  // event popover
  const [eventPopEv, setEventPopEv] = useState<UkeEvent | null>(null);
  const [eventPopPos, setEventPopPos] = useState<
    { left: number; top: number } | null
  >(null);

  // slot popover
  const [slotOpen, setSlotOpen] = useState(false);
  const [slotLabel, setSlotLabel] = useState("");
  const [slotPos, setSlotPos] = useState<
    { left: number; top: number } | null
  >(null);

  const showToast = useCallback(
    (text: string) => {
      toaster.success(text);
    },
    [toaster],
  );

  const openModal = (n: ModalName) => setModal(n);
  const closeModal = () => setModal(null);

  const submitModal = (msg: string) => {
    closeModal();
    showToast(msg);
  };

  const openDiscModal = (k: DisciplineKey) => {
    setDiscKey(k);
    setModal("disc");
  };

  const zoomBread = useMemo(() => {
    switch (zoom) {
      case "ar":
        return "Sesong 2026";
      case "md":
        return "Mai 2026";
      case "uke":
        return "Uke 21 · 19—25 mai";
      case "dag":
        return "Mandag 19. mai";
      case "okt":
        return "Iron-progresjon CS70→CS80";
    }
  }, [zoom]);

  const onEventClick = (e: React.MouseEvent, ev: UkeEvent) => {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const popW = 320;
    const popH = 480;
    let left = r.right + 8;
    let top = r.top;
    if (left + popW > window.innerWidth - 12) left = r.left - popW - 8;
    if (left < 12) {
      left = Math.max(12, r.left);
      top = r.bottom + 6;
    }
    if (top + popH > window.innerHeight - 12) {
      top = Math.max(12, window.innerHeight - popH - 12);
    }
    setEventPopEv(ev);
    setEventPopPos({ left, top });
  };

  const onEmptySlotClick = (e: React.MouseEvent, label: string) => {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const popW = 280;
    const popH = 240;
    let left = r.right + 8;
    let top = r.top;
    if (left + popW > window.innerWidth - 12) left = r.left - popW - 8;
    if (left < 12) {
      left = Math.max(12, r.left);
      top = r.bottom + 6;
    }
    if (top + popH > window.innerHeight - 12) {
      top = window.innerHeight - popH - 12;
    }
    setSlotLabel(label);
    setSlotPos({ left, top });
    setSlotOpen(true);
  };

  const monthCells = useMemo(() => {
    type Cell = {
      key: string;
      day: number;
      month: "apr" | "mai" | "jun";
      dim?: boolean;
    };
    const cells: Cell[] = [
      { key: "apr-28", day: 28, month: "apr", dim: true },
      { key: "apr-29", day: 29, month: "apr", dim: true },
      { key: "apr-30", day: 30, month: "apr", dim: true },
      ...Array.from({ length: 31 }, (_, i) => ({
        key: `mai-${i + 1}`,
        day: i + 1,
        month: "mai" as const,
      })),
      { key: "jun-1", day: 1, month: "jun", dim: true },
    ];
    return cells;
  }, []);

  return (
    <div
      className="wb-root"
      data-mode={mode}
      data-zoom={zoom}
      onClick={() => {
        setEventPopEv(null);
        setEventPopPos(null);
        if (slotOpen) {
          setSlotOpen(false);
          setSlotPos(null);
        }
        if (notifOpen) setNotifOpen(false);
      }}
    >
      <SvgSprite />

      <div className="app">
        {/* ===== SIDEBAR ===== */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="name">AK GOLF</div>
            <div className="meta">PLAYERHQ · PRO</div>
          </div>
          <div className="sidebar-profile">
            <div className="avatar">MR</div>
            <div>
              <div className="nm">Markus R.P.</div>
              <div className="hcp">HCP +3,5 · A1</div>
            </div>
          </div>
          <div className="nav-group">
            <div className="nav-group-label">Hjem</div>
            <button className="nav-item" onClick={() => router.push("/portal")}>
              <Icon id="ic-home" />
              Hjem
            </button>
            <button
              className="nav-item"
              onClick={() => router.push("/portal/varsler")}
            >
              <Icon id="ic-bell" />
              Varsler<span className="badge-count">3</span>
            </button>
          </div>
          <div className="nav-group">
            <div className="nav-group-label">Workbench</div>
            <button className="nav-item active">
              <Icon id="ic-clipboard" />
              Min workbench
            </button>
            <button
              className="nav-item"
              onClick={() => router.push("/portal/kalender")}
            >
              <Icon id="ic-cal" />
              Kalender
            </button>
            <button
              className="nav-item"
              onClick={() => router.push("/portal/mal")}
            >
              <Icon id="ic-target" />
              Mål
            </button>
          </div>
          <div className="nav-group">
            <div className="nav-group-label">Innsikt</div>
            <button
              className="nav-item"
              onClick={() => router.push("/portal/statistikk")}
            >
              <Icon id="ic-bar" />
              Statistikk
            </button>
            <button
              className="nav-item"
              onClick={() => router.push("/portal/coach")}
            >
              <Icon id="ic-user" />
              Coach
            </button>
          </div>
        </aside>

        {/* ===== MAIN ===== */}
        <main className="main">
          <header className="topbar">
            <button
              type="button"
              className="search"
              onClick={() => window.dispatchEvent(new CustomEvent("cmd-palette:open"))}
              aria-label="Åpne globalt søk (Cmd+K)"
            >
              <Icon id="ic-search" />
              <input
                placeholder="Søk drill, plan eller mål…"
                readOnly
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent("cmd-palette:open"));
                }}
              />
              <span className="kbd">⌘K</span>
            </button>
            <div className="breadcrumb" style={{ marginLeft: 0 }}>
              Workbench &nbsp;/&nbsp;{" "}
              <span className="current">
                {mode === "plan" ? "Plan" : "Status"}
              </span>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <button
                aria-label="Meldinger"
                onClick={(e) => {
                  e.stopPropagation();
                  setDrawerOpen(true);
                }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: 0,
                  background: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--fg)",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <Icon id="ic-msg" width={18} height={18} />
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 9,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    border: "1.5px solid #fff",
                  }}
                />
              </button>
              <button
                ref={bellRef}
                aria-label="Varsler"
                onClick={(e) => {
                  e.stopPropagation();
                  if (bellRef.current) {
                    setNotifRect(bellRef.current.getBoundingClientRect());
                  }
                  setNotifOpen((p) => !p);
                }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: 0,
                  background: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--fg)",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <Icon id="ic-bell" width={18} height={18} />
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 9,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--danger)",
                    border: "1.5px solid #fff",
                  }}
                />
              </button>
            </div>
          </header>

          {/* ===== MODE BAR ===== */}
          <div className="mode-bar">
            <div className="mode-bar-top">
              <div>
                <h1>
                  God morgen, <em>Markus</em>
                </h1>
                <div className="greeting-meta">
                  MANDAG 19. MAI · UKE 21 · 21 DAGER TIL SØRLANDSÅPENT
                </div>
              </div>
              <div className="mode-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => openModal("ask-coach")}
                >
                  <Icon id="ic-msg" />
                  Be om økt fra coach
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openNyEkt()}
                >
                  <Icon id="ic-plus" strokeWidth={2} />
                  Ny økt
                </button>
              </div>
            </div>
            <div className="mode-tabs">
              <button
                className={`mode-tab${mode === "status" ? " active" : ""}`}
                onClick={() => setMode("status")}
              >
                <Icon id="ic-eye" />
                <span className="mt-stack">
                  <span>Status</span>
                  <span className="mt-sub">Hvor er jeg?</span>
                </span>
              </button>
              <button
                className={`mode-tab${mode === "plan" ? " active" : ""}`}
                onClick={() => setMode("plan")}
              >
                <Icon id="ic-hammer" />
                <span className="mt-stack">
                  <span>Plan</span>
                  <span className="mt-sub">Hva skal jeg gjøre?</span>
                </span>
              </button>
            </div>
          </div>

          <div className="page">
            <StatusView
              openModal={openModal}
              router={router}
              openNyEkt={openNyEkt}
            />

            <div className="view-plan">
              {/* Zoom bar */}
              <div className="zoom-bar">
                <span className="zoom-label">Zoom</span>
                <div className="zoom-tabs">
                  {(
                    [
                      ["ar", "År", "Sesong"],
                      ["md", "Måned", "Mai"],
                      ["uke", "Uke", "U21"],
                      ["dag", "Dag", "Man"],
                      ["okt", "Økt", "14:00"],
                    ] as const
                  ).map(([k, lbl, sub]) => (
                    <button
                      key={k}
                      className={`zoom-tab${zoom === k ? " active" : ""}`}
                      onClick={() => setZoom(k)}
                    >
                      {lbl}
                      <span className="zt-sub">{sub}</span>
                    </button>
                  ))}
                </div>
                <div className="zoom-bread">
                  Viser <strong>{zoomBread}</strong>
                </div>
                <div className="zoom-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => openModal("ai-foresla")}
                  >
                    <Icon id="ic-sparkles" />
                    AI-foreslå
                  </button>
                  <button
                    className="btn btn-forest btn-sm"
                    onClick={() => openNyEkt()}
                  >
                    <Icon id="ic-plus" strokeWidth={2} />
                    Ny økt
                  </button>
                </div>
              </div>

              <div className="plan-layout">
                <div className="plan-main">
                  <ArView
                    router={router}
                    setZoom={setZoom}
                    openModal={openModal}
                  />
                  <MdView
                    cells={monthCells}
                    onCellClick={() => setZoom("dag")}
                  />
                  <UkeView
                    onEventClick={onEventClick}
                    onEmptySlotClick={onEmptySlotClick}
                    onWeekNav={(dir) =>
                      showToast(
                        dir === "today"
                          ? "Tilbake til uke 21"
                          : dir === "prev"
                            ? "Uke 20"
                            : "Uke 22",
                      )
                    }
                  />
                  <DagView
                    onEmptySlotClick={onEmptySlotClick}
                    onNewClick={() => openNyEkt()}
                    openMessagesWithAnders={openMessagesWithAnders}
                    onEventClick={() => openModal("edit-session")}
                  />
                  <OktView
                    openModal={openModal}
                    router={router}
                  />
                </div>

                <PlanRail
                  router={router}
                  showToast={showToast}
                  openMessagesWithAnders={openMessagesWithAnders}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ===== STICKY FOOTER ===== */}
      <footer className="sticky-footer">
        <div className="ft-status">
          <div className="ft-pyramide">
            <span className="ft-pyr-label">Pyramide denne uka</span>
            {(
              [
                ["fys", "FYS", 20, "var(--fys)"],
                ["tek", "TEK", 32, "var(--tek)"],
                ["slag", "SLAG", 28, "var(--slag)"],
                ["spill", "SPILL", 15, "var(--spill)"],
                ["turn", "TURN", 5, "#C8B72A"],
              ] as const
            ).map(([k, lbl, pct, bg]) => (
              <div
                key={k}
                className="ft-pyr-bar clickable"
                onClick={() => openDiscModal(k as DisciplineKey)}
              >
                <span className="nm">{lbl}</span>
                <div className="mini">
                  <div style={{ width: `${pct}%`, background: bg }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ft-plan ft-summary">
          <strong>4 PLANLAGT</strong> · <strong>1 FULLFØRT</strong> ·{" "}
          <strong>195 MIN</strong> · <strong>67% PYRAMIDE-MÅL</strong>
        </div>
        <div className="ft-actions">
          <button
            className="btn btn-outline btn-sm ft-status"
            onClick={() => setMode("plan")}
          >
            Gå til Plan →
          </button>
          <button
            className="btn btn-outline btn-sm ft-plan"
            onClick={() => openModal("plan-adjust")}
          >
            Be om plan-justering
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => openModal("log-session")}
          >
            <Icon id="ic-plus" strokeWidth={2} />
            Logg ny økt
          </button>
        </div>
      </footer>

      {/* ===== Modaler ===== */}
      <AskCoachModal
        open={modal === "ask-coach"}
        onClose={closeModal}
        onSubmit={submitModal}
      />
      <PlanAdjustModal
        open={modal === "plan-adjust"}
        onClose={closeModal}
        onSubmit={submitModal}
      />
      <NewGoalModal
        open={modal === "new-goal"}
        onClose={closeModal}
        onSubmit={submitModal}
      />
      <EditSessionModal
        open={modal === "edit-session"}
        onClose={closeModal}
        onSubmit={submitModal}
      />
      <DisciplineModal
        open={modal === "disc"}
        onClose={closeModal}
        disciplineKey={discKey}
        onPlanAdjust={() => setModal("plan-adjust")}
      />
      <LogSessionModal
        open={modal === "log-session"}
        onClose={closeModal}
        onSubmit={submitModal}
      />
      <TrackManImportModal
        open={modal === "tm-import"}
        onClose={closeModal}
        onSubmit={submitModal}
      />
      <NyEktModal
        open={modal === "ny-okt"}
        onClose={closeModal}
        onSubmit={submitModal}
        prefilled={nyEktPrefill}
      />
      <AiForeslaUkeModal
        open={modal === "ai-foresla"}
        onClose={closeModal}
        onSubmit={submitModal}
      />

      <MessagesDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <NotificationsPopover
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        anchorRect={notifRect}
        onToast={showToast}
      />
      <EventPreviewPopover
        ev={eventPopEv}
        position={eventPopPos}
        onClose={() => {
          setEventPopEv(null);
          setEventPopPos(null);
        }}
        onEdit={() => {
          setEventPopEv(null);
          setEventPopPos(null);
          openModal("edit-session");
        }}
        onLog={() => {
          setEventPopEv(null);
          setEventPopPos(null);
          openModal("log-session");
        }}
        onOpenFull={() => {
          setEventPopEv(null);
          setEventPopPos(null);
          setMode("plan");
          setZoom("okt");
        }}
      />
      <EmptySlotPopover
        open={slotOpen}
        label={slotLabel}
        position={slotPos}
        onClose={() => {
          setSlotOpen(false);
          setSlotPos(null);
        }}
        onToast={showToast}
        onAskCoach={() => openModal("ask-coach")}
      />

      {/* Toast håndteres nå av global ToastProvider. */}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/*                      STATUS VIEW                                      */
/* ───────────────────────────────────────────────────────────────────── */

function StatusView({
  openModal,
  router,
  openNyEkt,
}: {
  openModal: (n: ModalName) => void;
  router: Router;
  openNyEkt: (prefilled?: NyEktPrefill) => void;
}) {
  return (
    <div className="view-status">
      {/* 1. Hero */}
      <section className="status-hero">
        <div className="status-hero-main">
          <span className="label-mono">Status · uke 21 · 19. mai 2026</span>
          <h2>
            Du er <em>på plan</em> — approach er fortsatt gapet.
          </h2>
          <div className="status-stats-row">
            <div className="stat">
              <div className="lbl">HCP</div>
              <div className="val">+3,5</div>
              <div className="delta dn">↓ 0,4 / 90d</div>
            </div>
            <div className="stat">
              <div className="lbl">Kategori</div>
              <div className="val">A1</div>
              <div className="delta flat">Stabil</div>
            </div>
            <div className="stat">
              <div className="lbl">SG total</div>
              <div className="val">+0,21</div>
              <div className="delta up">↑ +0,08</div>
            </div>
            <div className="stat">
              <div className="lbl">Streak</div>
              <div className="val">11d</div>
              <div className="delta up">av 14</div>
            </div>
          </div>
        </div>

        <div
          className="next-target"
          style={{ cursor: "pointer" }}
          onClick={() =>
            router.push("/portal/tren/turneringer/sorlandsapent-2026")
          }
        >
          <div className="nt-head">
            <div>
              <span className="label-mono">Neste hovedmål</span>
              <h3>Sørlandsåpent</h3>
            </div>
            <div className="nt-countdown">
              <div className="days">21</div>
              <div className="lab">DAGER</div>
            </div>
          </div>
          <div className="nt-prob">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="7" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="7"
                strokeDasharray="76.4 201"
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
              <text
                x="40"
                y="46"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="18"
                fontWeight="600"
                fill="var(--fg)"
              >
                38%
              </text>
            </svg>
            <div className="copy">
              <strong>Top 10-sannsynlighet</strong>
              Basert på SG og siste 12 runder
            </div>
          </div>
          <div className="nt-italic">
            <em className="italic-accent">Approach +0,4 SG</em> løfter
            sannsynligheten til 50%.
          </div>
        </div>
      </section>

      {/* 2. Mål */}
      <section>
        <div className="section-h" style={{ marginBottom: 16 }}>
          <div>
            <h2>Målsetninger</h2>
            <div className="sub">3 AKTIVE · 1 RESULTAT · 1 PROSESS · 1 SESONG</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => router.push("/portal/mal")}
            >
              Se alle →
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => openModal("new-goal")}
            >
              <Icon id="ic-plus" strokeWidth={2} />
              Nytt mål
            </button>
          </div>
        </div>
        <div className="goals">
          <div
            className="goal-card"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/portal/mal/goal/top-10-nm-slag")}
          >
            <div className="row-flex">
              <span className="type-label">Resultatmål</span>
              <span className="pill pill-turn" style={{ marginLeft: "auto" }}>
                PRIO 1
              </span>
            </div>
            <h3>Top 10 NM Slag</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <svg width="76" height="76" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="7" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="7"
                  strokeDasharray="76.4 201"
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
                <text
                  x="40"
                  y="46"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                  fontSize="16"
                  fontWeight="600"
                  fill="var(--fg)"
                >
                  38%
                </text>
              </svg>
              <div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  50 dager
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--success)",
                    marginTop: 6,
                  }}
                >
                  ↑ +6% denne uka
                </div>
              </div>
            </div>
            <div className="italic-note">
              <em className="italic-accent">Approach +0,4 SG</em> løfter
              sannsynligheten til 50%.
            </div>
          </div>

          <div
            className="goal-card"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/portal/mal/goal/snitt-under-72")}
          >
            <div className="row-flex">
              <span className="type-label">Prosessmål</span>
              <span className="pill pill-slag" style={{ marginLeft: "auto" }}>
                UKENTLIG
              </span>
            </div>
            <h3>Snitt under 72 på Srixon</h3>
            <svg
              viewBox="0 0 280 76"
              preserveAspectRatio="none"
              style={{ width: "100%", height: 76 }}
            >
              <line
                x1="0"
                y1="32"
                x2="280"
                y2="32"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x="278"
                y="29"
                textAnchor="end"
                fontFamily="JetBrains Mono"
                fontSize="9"
                fill="var(--muted)"
              >
                72
              </text>
              <polyline
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="6,20 28,26 50,16 72,38 94,24 116,42 138,34 160,26 182,28 204,22 226,36 248,26 270,22"
              />
              <polyline
                fill="rgba(209,248,67,0.15)"
                stroke="none"
                points="6,20 28,26 50,16 72,38 94,24 116,42 138,34 160,26 182,28 204,22 226,36 248,26 270,22 270,74 6,74"
              />
              <g fill="var(--primary)">
                <circle cx="6" cy="20" r="2" />
                <circle cx="50" cy="16" r="2" />
                <circle cx="94" cy="24" r="2" />
                <circle cx="160" cy="26" r="2" />
                <circle cx="204" cy="22" r="2" />
                <circle cx="270" cy="22" r="2" />
              </g>
            </svg>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                className="mono"
                style={{ fontSize: 18, fontWeight: 700, color: "var(--success)" }}
              >
                71,4
              </span>
              <span
                className="mono"
                style={{ fontSize: 10.5, color: "var(--muted)" }}
              >
                5 AV 7 UNDER MÅL
              </span>
            </div>
            <div className="italic-note">
              Forbedring på 1,2 slag siste 8 uker.
            </div>
          </div>

          <div
            className="goal-card"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/portal/mal/goal/hcp-under-2")}
          >
            <div className="row-flex">
              <span className="type-label">Sesongmål</span>
              <span className="pill pill-fys" style={{ marginLeft: "auto" }}>
                2026
              </span>
            </div>
            <h3>HCP under +2,0</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 12,
                  borderRadius: 999,
                  background:
                    "linear-gradient(to right,rgba(163,45,45,0.22) 0%,rgba(163,45,45,0.22) 30%,rgba(184,133,42,0.28) 30%,rgba(184,133,42,0.28) 65%,rgba(44,125,82,0.28) 65%,rgba(44,125,82,0.28) 100%)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: "60%",
                    background: "var(--accent)",
                    borderRadius: 999,
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.6)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    bottom: -4,
                    left: "calc(60% - 1.5px)",
                    width: 3,
                    background: "var(--fg)",
                    borderRadius: 2,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--muted)" }}
                >
                  +3,5
                </span>
                <span className="mono" style={{ fontSize: 18, fontWeight: 700 }}>
                  +2,9
                </span>
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--muted)" }}
                >
                  +2,0
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  className="mono"
                  style={{ fontSize: 10.5, color: "var(--muted)" }}
                >
                  82 DAGER IGJEN
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--success)",
                    fontWeight: 600,
                  }}
                >
                  60% AV VEIEN
                </span>
              </div>
            </div>
            <div className="italic-note">
              Fra +3,5 til +2,0 = 1,5 slag forbedring.
            </div>
          </div>
        </div>
      </section>

      <StatusSGSection router={router} openNyEkt={openNyEkt} />
      <StatusTrainingSection />
      <StatusTrackManSection openModal={openModal} router={router} />
    </div>
  );
}

/* SG-analyse + DataGolf */
function StatusSGSection({
  router,
  openNyEkt,
}: {
  router: Router;
  openNyEkt: (prefilled?: NyEktPrefill) => void;
}) {
  return (
    <section>
      <div className="section-h" style={{ marginBottom: 16 }}>
        <div>
          <h2>SG-analyse</h2>
          <div className="sub">SISTE 90 DAGER · KATEGORI A1 · 247 SPILLERE</div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => router.push("/portal/mal/sg-hub")}
        >
          Full analyse →
        </button>
      </div>
      <div className="sg-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="title">SG-trend per disipplin</div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  marginTop: 3,
                  letterSpacing: "0.06em",
                }}
              >
                PUTTING LØFTER TOTALEN · APPROACH DRAR NED
              </div>
            </div>
          </div>
          <svg
            viewBox="0 0 380 160"
            preserveAspectRatio="none"
            style={{ width: "100%", height: 160 }}
          >
            <line x1="32" y1="20" x2="380" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 4" />
            <line x1="32" y1="60" x2="380" y2="60" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 4" />
            <line x1="32" y1="90" x2="380" y2="90" stroke="var(--border-soft)" strokeWidth="1" />
            <line x1="32" y1="130" x2="380" y2="130" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 4" />
            <text x="28" y="24" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--muted)">+1,0</text>
            <text x="28" y="64" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--muted)">+0,5</text>
            <text x="28" y="94" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--muted)">0,0</text>
            <text x="28" y="134" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--muted)">−0,5</text>
            <polyline fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="38,82 80,78 122,76 164,72 206,72 248,68 290,66 332,64 374,62" />
            <polyline fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="38,64 80,68 122,72 164,78 206,86 248,94 290,108 332,116 374,124" />
            <polyline fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="38,78 80,74 122,72 164,68 206,66 248,62 290,58 332,56 374,54" />
            <polyline fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points="38,108 80,104 122,98 164,90 206,80 248,72 290,60 332,46 374,34" />
            <text x="60" y="155" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="var(--muted)">MAR</text>
            <text x="200" y="155" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="var(--muted)">APR</text>
            <text x="340" y="155" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="var(--muted)">MAI</text>
          </svg>
          <div className="legend">
            <div className="legend-item">
              <span className="sw" style={{ background: "var(--primary)" }} />
              Off-tee +0,12
            </div>
            <div className="legend-item">
              <span className="sw" style={{ background: "var(--danger)" }} />
              Approach −0,42
            </div>
            <div className="legend-item">
              <span className="sw" style={{ background: "var(--success)" }} />
              A-green +0,15
            </div>
            <div className="legend-item">
              <span className="sw" style={{ background: "var(--accent)" }} />
              Putting +0,38
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="title">Slag-prioritering</div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  marginTop: 3,
                  letterSpacing: "0.06em",
                }}
              >
                FOR SØRLANDSÅPENT · 21 DAGER
              </div>
            </div>
          </div>
          {(
            [
              ["01", "Approach 100—150m", "6 hull i dette området på Bossum", "+0,42 SG potensial", "slag", "Approach 100—150m blokk"],
              ["02", "Putting 3—6m", "SG ned 0,4 siste 30 dager", "+0,38 SG potensial", "slag", "Putting 3—6m"],
              ["03", "Driver-presisjon", "Smale fairways · treff under snitt", "+0,22 SG potensial", "tek", "Driver grunntrening"],
            ] as const
          ).map(([num, ttl, meta, pot, kind, drill]) => (
            <div
              className="prio-row"
              key={num}
              style={{ cursor: "pointer" }}
              onClick={() =>
                openNyEkt({
                  discipline: kind as DisciplineKey,
                  drill,
                  title: drill,
                })
              }
            >
              <div className="prio-num">{num}</div>
              <div style={{ flex: 1 }}>
                <div className="prio-title">{ttl}</div>
                <div className="prio-meta">{meta}</div>
                <span className="prio-pot">{pot}</span>
              </div>
              <button
                className="btn btn-outline btn-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  openNyEkt({
                    discipline: kind as DisciplineKey,
                    drill,
                    title: drill,
                  });
                }}
              >
                Bruk
              </button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="title">vs. DataGolf</div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  marginTop: 3,
                  letterSpacing: "0.06em",
                }}
              >
                KATEGORI A1 SNITT
              </div>
            </div>
          </div>
          {(
            [
              ["Off-tee", "var(--warning)", 6, "right", "warn", "−0,12"],
              ["Approach", "var(--danger)", 21, "right", "neg", "−0,42"],
              ["A-green", "var(--accent)", 8, "left", "pos", "+0,15"],
              ["Putting", "var(--warning)", 14, "right", "warn", "−0,28"],
              ["Strategy", "var(--accent)", 4, "left", "pos", "+0,08"],
            ] as const
          ).map(([lbl, bg, w, side, vcls, val]) => (
            <div className="dg-row" key={lbl}>
              <span className="label">{lbl}</span>
              <div className="dg-bar">
                <div className="center" />
                <div
                  className="fill"
                  style={{
                    background: bg,
                    ...(side === "right"
                      ? { right: "50%" }
                      : { left: "50%" }),
                    width: `${w}%`,
                  }}
                />
              </div>
              <span className={`val ${vcls}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Trening pyramide + ACWR */
function StatusTrainingSection() {
  return (
    <section>
      <div className="section-h" style={{ marginBottom: 16 }}>
        <div>
          <h2>Treningsanalyse</h2>
          <div className="sub">PYRAMIDE-BALANSE · BELASTNING SISTE 4 UKER</div>
        </div>
      </div>
      <div className="training-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="title">Pyramide-balanse</div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  marginTop: 3,
                  letterSpacing: "0.06em",
                }}
              >
                FAKTISK vs MÅLSETTING · UKE 21
              </div>
            </div>
          </div>
          <div className="pyramide-bal">
            {(
              [
                ["FYS", 20, 20, "var(--fys)"],
                ["TEK", 32, 30, "var(--tek)"],
                ["SLAG", 28, 30, "var(--slag)"],
                ["SPILL", 15, 15, "var(--spill)"],
                ["TURN", 5, 5, "#C8B72A"],
              ] as const
            ).map(([lbl, actual, target, bg]) => (
              <div className="pb-row clickable" key={lbl}>
                <span className="label">{lbl}</span>
                <div className="bar-wrap">
                  <div
                    className="actual"
                    style={{ width: `${actual}%`, background: bg }}
                  />
                  <div className="target" style={{ left: `${target}%` }} />
                </div>
                <span className="val">
                  {actual} % <span className="target-val">/ {target}</span>
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 13.5,
              color: "var(--fg)",
              lineHeight: 1.5,
              marginTop: 18,
              paddingTop: 14,
              borderTop: "1px solid var(--border-soft)",
            }}
          >
            Solid balanse.{" "}
            <em className="italic-accent">Tek litt høyt, slag litt lavt</em>{" "}
            — bytt én tek-økt mot slag denne uka.
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="title">Belastning siste 28 dager</div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  marginTop: 3,
                  letterSpacing: "0.06em",
                }}
              >
                MINUTTER/DAG · SNITT 156 · TOTAL 4 360 MIN
              </div>
            </div>
            <div className="row-flex">
              <span
                className="mono"
                style={{ fontSize: 10.5, color: "var(--muted)" }}
              >
                CHRONIC
              </span>
              <span className="mono" style={{ fontSize: 14, fontWeight: 700 }}>
                1,08
              </span>
            </div>
          </div>
          <svg
            viewBox="0 0 560 180"
            preserveAspectRatio="none"
            style={{ width: "100%", height: 200 }}
          >
            <line x1="32" y1="20" x2="560" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 4" />
            <line x1="32" y1="80" x2="560" y2="80" stroke="var(--border-soft)" strokeWidth="1" />
            <line x1="32" y1="140" x2="560" y2="140" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 4" />
            <text x="28" y="24" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--muted)">240</text>
            <text x="28" y="84" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--muted)">120</text>
            <text x="28" y="144" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--muted)">0</text>
            <g>
              <rect x="42" y="74" width="14" height="66" fill="var(--tek)" rx="2" />
              <rect x="60" y="98" width="14" height="42" fill="var(--slag)" rx="2" />
              <rect x="78" y="120" width="14" height="20" fill="var(--fys)" rx="2" />
              <rect x="96" y="56" width="14" height="84" fill="var(--tek)" rx="2" />
              <rect x="114" y="84" width="14" height="56" fill="var(--slag)" rx="2" />
              <rect x="132" y="135" width="14" height="5" fill="var(--border)" rx="2" />
              <rect x="150" y="48" width="14" height="92" fill="var(--spill)" rx="2" />
              <rect x="172" y="80" width="14" height="60" fill="var(--tek)" rx="2" />
              <rect x="190" y="110" width="14" height="30" fill="var(--fys)" rx="2" />
              <rect x="208" y="60" width="14" height="80" fill="var(--slag)" rx="2" />
              <rect x="226" y="78" width="14" height="62" fill="var(--tek)" rx="2" />
              <rect x="244" y="135" width="14" height="5" fill="var(--border)" rx="2" />
              <rect x="262" y="92" width="14" height="48" fill="var(--slag)" rx="2" />
              <rect x="280" y="40" width="14" height="100" fill="var(--spill)" rx="2" />
              <rect x="302" y="70" width="14" height="70" fill="var(--tek)" rx="2" />
              <rect x="320" y="92" width="14" height="48" fill="var(--slag)" rx="2" />
              <rect x="338" y="115" width="14" height="25" fill="var(--fys)" rx="2" />
              <rect x="356" y="50" width="14" height="90" fill="var(--tek)" rx="2" />
              <rect x="374" y="86" width="14" height="54" fill="var(--slag)" rx="2" />
              <rect x="392" y="135" width="14" height="5" fill="var(--border)" rx="2" />
              <rect x="410" y="46" width="14" height="94" fill="var(--spill)" rx="2" />
              <rect x="432" y="64" width="14" height="76" fill="var(--accent)" rx="2" />
              <rect x="450" y="100" width="14" height="40" fill="var(--accent)" rx="2" />
              <rect x="468" y="74" width="14" height="66" fill="var(--accent)" rx="2" />
              <rect x="486" y="135" width="14" height="5" fill="var(--border)" rx="2" opacity="0.4" />
              <rect x="504" y="135" width="14" height="5" fill="var(--border)" rx="2" opacity="0.4" />
              <rect x="522" y="135" width="14" height="5" fill="var(--border)" rx="2" opacity="0.4" />
              <rect x="540" y="135" width="14" height="5" fill="var(--border)" rx="2" opacity="0.4" />
            </g>
            <line x1="166" y1="20" x2="166" y2="140" stroke="var(--border-soft)" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="296" y1="20" x2="296" y2="140" stroke="var(--border-soft)" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="426" y1="20" x2="426" y2="140" stroke="var(--border-soft)" strokeWidth="1" strokeDasharray="2 3" />
            <text x="100" y="160" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--muted)" letterSpacing="1">UKE 18</text>
            <text x="230" y="160" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--muted)" letterSpacing="1">UKE 19</text>
            <text x="360" y="160" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--muted)" letterSpacing="1">UKE 20</text>
            <text x="490" y="160" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--fg)" fontWeight="600" letterSpacing="1">UKE 21</text>
            <text x="556" y="78" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--primary)">SNITT</text>
          </svg>
          <div
            className="legend"
            style={{
              borderTop: "1px solid var(--border-soft)",
              paddingTop: 12,
              marginTop: 8,
            }}
          >
            {(
              [
                ["FYS", "var(--fys)"],
                ["TEK", "var(--tek)"],
                ["SLAG", "var(--slag)"],
                ["SPILL", "var(--spill)"],
                ["Denne uka", "var(--accent)"],
              ] as const
            ).map(([lbl, bg]) => (
              <div className="legend-item" key={lbl}>
                <span className="sw" style={{ background: bg }} />
                {lbl}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* TrackMan-økter siste 5 */
function StatusTrackManSection({
  openModal,
  router,
}: {
  openModal: (n: ModalName) => void;
  router: Router;
}) {
  return (
    <section>
      <div className="section-h" style={{ marginBottom: 16 }}>
        <div>
          <h2>Siste TrackMan-økter</h2>
          <div className="sub">5 ØKTER · IMPORTERT FRA TRACKMAN PRO</div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => openModal("tm-import")}
        >
          <Icon id="ic-import" />
          Importer ny
        </button>
      </div>
      <div className="tm-strip">
        {(
          [
            ["17. MAI", "Driver-økt", ["Club-speed", "112 mph"], ["Smash", "1,48"], "tm-2026-05-17"],
            ["15. MAI", "Iron 7", ["Carry", "158 m"], ["Spinn", "6 820 rpm"], "tm-2026-05-15"],
            ["13. MAI", "Pitch 50—100m", ["Landing", "±3,2 m"], ["184 reps", ""], "tm-2026-05-13"],
            ["12. MAI", "Putting blokk", ["0—3m", "87%"], ["3—6m", "52%"], "tm-2026-05-12"],
            ["10. MAI", "Iron-progresjon", ["CS", "74 → 76 mph"], ["240 reps", ""], "tm-2026-05-10"],
          ] as const
        ).map(([date, ttype, m1, m2, id]) => (
          <div
            className="tm-card"
            key={`${date}-${ttype}`}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/portal/mal/trackman/${id}`)}
          >
            <div className="date">{date}</div>
            <div className="ttype">{ttype}</div>
            <div className="metric">
              <span>{m1[0]}</span> {m1[1]}
            </div>
            <div className="metric">
              <span>{m2[0]}</span> {m2[1]}
            </div>
            <a className="open">Åpne →</a>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/*                       PLAN VIEW — ÅR                                  */
/* ───────────────────────────────────────────────────────────────────── */

function ArView({
  router,
  setZoom,
  openModal,
}: {
  router: Router;
  setZoom: (z: Zoom) => void;
  openModal: (n: ModalName) => void;
}) {
  return (
    <div className="z-view z-ar">
      <div className="card ar-card">
        <div className="card-head">
          <div>
            <div className="title">Årsplan 2026</div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--muted)",
                marginTop: 3,
                letterSpacing: "0.06em",
              }}
            >
              6 PERIODER · 5 TURNERINGER · 2 HOVEDMÅL
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => openModal("plan-adjust")}
          >
            Juster periodisering →
          </button>
        </div>
        <div className="months">
          {["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"].map(
            (m) => (
              <span key={m}>{m}</span>
            ),
          )}
        </div>
        <div className="gantt-track">
          <div className="gantt-block" style={{ left: "0%", width: "24%", background: "#C8D5C8" }}>
            GRUNNTRENING
          </div>
          <div className="gantt-block" style={{ left: "16.67%", width: "16.67%", background: "#6FA686", color: "#fff" }}>
            OPPBYGGING
          </div>
          <div className="gantt-block active" style={{ left: "25%", width: "16.67%", background: "var(--primary)" }}>
            SPESIALISERING
          </div>
          <div className="gantt-block" style={{ left: "41.67%", width: "16.67%", background: "var(--accent)", color: "var(--fg)" }}>
            KONKURRANSE
          </div>
          <div className="gantt-block" style={{ left: "66.67%", width: "16.67%", background: "#A8B89B" }}>
            OVERGANG
          </div>
          <div className="gantt-block" style={{ left: "83.33%", width: "16.67%", background: "#E5E3DD", color: "var(--muted)" }}>
            HVILE
          </div>

          <div className="flag-mark star" style={{ left: "44.4%" }}>
            <svg fill="currentColor">
              <use href="#ic-star" />
            </svg>
          </div>
          <div className="flag-mark red" style={{ left: "48.3%" }}>
            <svg fill="currentColor">
              <use href="#ic-flag" />
            </svg>
          </div>
          <div className="flag-mark star" style={{ left: "52.1%" }}>
            <svg fill="currentColor">
              <use href="#ic-star" />
            </svg>
          </div>
          <div className="flag-mark red" style={{ left: "55.9%" }}>
            <svg fill="currentColor">
              <use href="#ic-flag" />
            </svg>
          </div>
          <div className="flag-mark red" style={{ left: "59.7%" }}>
            <svg fill="currentColor">
              <use href="#ic-flag" />
            </svg>
          </div>

          <div
            className="today-pin"
            style={{ left: "38.4%", cursor: "pointer" }}
            onClick={() => setZoom("dag")}
          >
            <span className="pin-label">I DAG</span>
          </div>
        </div>

        <div className="ar-month-load">
          {(
            [
              ["JAN", 30, false],
              ["FEB", 40, false],
              ["MAR", 55, false],
              ["APR", 65, false],
              ["MAI", 85, true],
              ["JUN", 95, false],
              ["JUL", 100, false],
              ["AUG", 80, false],
              ["SEP", 50, false],
              ["OKT", 40, false],
              ["NOV", 20, false],
              ["DES", 15, false],
            ] as const
          ).map(([lbl, h, active]) => (
            <div
              key={lbl}
              className={`ar-mcol${active ? " active" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => setZoom("md")}
            >
              <div className="bar" style={{ height: `${h}%` }} />
              <div className="lbl">{lbl}</div>
            </div>
          ))}
        </div>
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--muted)",
            textAlign: "center",
            marginTop: 8,
            letterSpacing: "0.10em",
          }}
        >
          PLANLAGT BELASTNING · MIN/MND
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <div>
            <div className="title">Turneringer · sesong 2026</div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--muted)",
                marginTop: 3,
                letterSpacing: "0.06em",
              }}
            >
              ★ HOVEDMÅL · ▽ STØTTE-TURNERING
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => router.push("/portal/tren/turneringer")}
          >
            Legg til
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 12,
          }}
        >
          {(
            [
              ["10. JUN · 21 DAGER", "★ Sørlandsåpent", "HOVEDMÅL · TOP 10", true, "sorlandsapent-2026"],
              ["24. JUN · 35 DAGER", "Bossum Open", "FORM-TEST", false, "bossum-open-2026"],
              ["8. JUL · 49 DAGER", "★ NM Slag", "HOVEDMÅL", true, "nm-slag-2026"],
              ["22. JUL · 63 DAGER", "Trondheim Open", "STØTTE", false, "trondheim-open-2026"],
              ["5. AUG · 77 DAGER", "GFGK Mesterskap", "KLUBB", false, "gfgk-mesterskap-2026"],
            ] as const
          ).map(([date, name, sub, highlight, slug]) => (
            <div
              key={name}
              style={{
                border: highlight
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border)",
                background: highlight ? "rgba(209,248,67,0.10)" : undefined,
                borderRadius: 10,
                padding: 12,
                cursor: "pointer",
              }}
              onClick={() => router.push(`/portal/tren/turneringer/${slug}`)}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.08em",
                }}
              >
                {date}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {name}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: highlight ? "var(--success)" : "var(--muted)",
                  marginTop: 4,
                }}
              >
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/*                       PLAN VIEW — MÅNED                               */
/* ───────────────────────────────────────────────────────────────────── */

type MonthCell = {
  key: string;
  day: number;
  month: "apr" | "mai" | "jun";
  dim?: boolean;
};

function MdView({
  cells,
  onCellClick,
}: {
  cells: MonthCell[];
  onCellClick: (day: number, month: "apr" | "mai" | "jun") => void;
}) {
  return (
    <div className="z-view z-md">
      <div className="card month-card">
        <div className="card-head">
          <div>
            <div className="title">Mai 2026</div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--muted)",
                marginTop: 3,
                letterSpacing: "0.06em",
              }}
            >
              5 UKER · 22 ØKTER · 2 250 MIN PLANLAGT
            </div>
          </div>
          <div className="row-flex">
            <button className="btn btn-outline btn-xs">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 12, height: 12 }}
              >
                <use href="#ic-chev-l" />
              </svg>
              Apr
            </button>
            <button className="btn btn-outline btn-xs">
              Jun
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 12, height: 12 }}
              >
                <use href="#ic-chev-r" />
              </svg>
            </button>
          </div>
        </div>
        <div className="month-header">
          {["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="month-grid">
          {cells.map((c) => {
            const ev =
              c.month === "mai"
                ? MAY_EVTS[c.day]
                : c.month === "apr"
                ? APR_EVTS[c.day]
                : undefined;
            const classes = ["day-cell"];
            if (c.dim) classes.push("dim");
            if (ev?.today) classes.push("today");
            if (ev?.tour) classes.push("has-tour");
            return (
              <div
                key={c.key}
                className={classes.join(" ")}
                style={{ cursor: "pointer" }}
                onClick={() => onCellClick(c.day, c.month)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="dnum">{c.day}</span>
                  {ev?.tour && <span className="tour-label">{ev.tour}</span>}
                </div>
                <div className="dots">
                  {ev?.dots.map((d, i) => (
                    <span
                      key={`${c.key}-${d}-${i}`}
                      className="dot"
                      style={{ background: DOT_COLOR[d] }}
                    />
                  ))}
                </div>
                {ev?.summary && <div className="summary">{ev.summary}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/*                       PLAN VIEW — UKE                                 */
/* ───────────────────────────────────────────────────────────────────── */

function UkeView({
  onEventClick,
  onEmptySlotClick,
  onWeekNav,
}: {
  onEventClick: (e: React.MouseEvent, ev: UkeEvent) => void;
  onEmptySlotClick: (e: React.MouseEvent, label: string) => void;
  onWeekNav: (dir: "prev" | "today" | "next") => void;
}) {
  return (
    <div className="z-view z-uke">
      <div className="card uke-card">
        <div className="uke-head">
          <div>
            <div className="title">Uke 21 · 19—25 mai 2026</div>
            <div
              className="mono"
              style={{
                fontSize: 10.5,
                color: "var(--muted)",
                marginTop: 3,
                letterSpacing: "0.06em",
              }}
            >
              5 ØKTER · 195 MIN · 67% PYRAMIDE-MÅL
            </div>
          </div>
          <div className="row-flex">
            <button
              className="btn btn-outline btn-xs"
              onClick={() => onWeekNav("prev")}
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 12, height: 12 }}
              >
                <use href="#ic-chev-l" />
              </svg>
            </button>
            <button
              className="btn btn-outline btn-xs"
              onClick={() => onWeekNav("today")}
            >
              I dag
            </button>
            <button
              className="btn btn-outline btn-xs"
              onClick={() => onWeekNav("next")}
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 12, height: 12 }}
              >
                <use href="#ic-chev-r" />
              </svg>
            </button>
          </div>
        </div>
        <div className="uke-grid">
          <div className="corner" />
          {UKE_DAYS.map((d) => {
            const cls = ["day-head"];
            if (d.weekend) cls.push("weekend");
            if (d.today) cls.push("today");
            return (
              <div key={d.lbl} className={cls.join(" ")}>
                {d.lbl}
                <span className="dnum">{d.dnum}</span>
              </div>
            );
          })}
          {UKE_HOURS.map((h) => (
            <React.Fragment key={h}>
              <div className="time-label">{String(h).padStart(2, "0")}:00</div>
              {UKE_DAYS.map((d, di) => {
                const cellCls = ["cell"];
                if (d.weekend) cellCls.push("weekend");
                if (d.today) cellCls.push("today");
                const ev = UKE_EVENTS.find((e) => e.d === di && e.h === h);
                const empty = EMPTY_SLOTS.find(
                  (s) => s.d === di && s.h === h,
                );
                return (
                  <div key={`${d.lbl}-${h}`} className={cellCls.join(" ")}>
                    {ev && (
                      <div
                        className={`event ${ev.k}`}
                        data-event-id={ev.id}
                        style={{
                          top: 2,
                          height: (ev.dur / 60) * 42 - 2,
                          cursor: "pointer",
                        }}
                        onClick={(e) => onEventClick(e, ev)}
                      >
                        <div className="ev-title">{ev.t}</div>
                        <div className="ev-time">{ev.time}</div>
                      </div>
                    )}
                    {!ev && empty && (
                      <div
                        className="event-empty"
                        onClick={(e) =>
                          onEmptySlotClick(
                            e,
                            `${d.lbl} ${d.dnum}. MAI · ${String(h).padStart(2, "0")}:00`,
                          )
                        }
                      >
                        Selvplanlegg
                        <br />
                        eller be om økt
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/*                       PLAN VIEW — DAG                                 */
/* ───────────────────────────────────────────────────────────────────── */

function DagView({
  onEmptySlotClick,
  onNewClick,
  openMessagesWithAnders,
  onEventClick,
}: {
  onEmptySlotClick: (e: React.MouseEvent, label: string) => void;
  onNewClick: () => void;
  openMessagesWithAnders: () => void;
  onEventClick: (k: DisciplineKey, t: string) => void;
}) {
  const hours = Array.from({ length: 11 }, (_, i) => 8 + i);
  return (
    <div className="z-view z-dag">
      <div className="dag-grid">
        <div className="card dag-timeline-card">
          <div className="card-head">
            <div>
              <div className="title">Mandag 19. mai</div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  marginTop: 3,
                  letterSpacing: "0.06em",
                }}
              >
                3 ØKTER · 165 MIN · 1 FULLFØRT
              </div>
            </div>
            <button
              className="btn btn-outline btn-xs"
              onClick={onNewClick}
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 12, height: 12 }}
              >
                <use href="#ic-plus" />
              </svg>
              Ny
            </button>
          </div>
          <div className="dag-tline">
            {hours.map((h) => {
              const ev = DAG_EVTS[h];
              return (
                <React.Fragment key={h}>
                  <div className="dt-hour">{String(h).padStart(2, "0")}:00</div>
                  {ev ? (
                    ev.empty ? (
                      <div className="dt-slot">
                        <div
                          className="dt-empty"
                          onClick={(e) =>
                            onEmptySlotClick(e, "MAN 19. MAI · 11:00")
                          }
                        >
                          {ev.t} — {ev.meta}
                        </div>
                      </div>
                    ) : (
                      <div className="dt-slot">
                        <div
                          className={`dt-event ${ev.k}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => onEventClick(ev.k, ev.t)}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "baseline",
                              gap: 8,
                            }}
                          >
                            <div className="ev-title">{ev.t}</div>
                            {ev.primary && (
                              <span
                                className="mono"
                                style={{
                                  fontSize: 10,
                                  color: "var(--primary)",
                                  fontWeight: 700,
                                  letterSpacing: "0.08em",
                                }}
                              >
                                NESTE
                              </span>
                            )}
                          </div>
                          <div className="ev-row">
                            <span className={`pill pill-${ev.k}`}>
                              {ev.k.toUpperCase()}
                            </span>
                            <span className="ev-meta">{ev.meta}</span>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="dt-slot" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="dag-side">
          <div className="dag-stat-row">
            <div className="dag-stat">
              <div className="lbl">Planlagt</div>
              <div className="val">165</div>
              <div className="sub">MIN</div>
            </div>
            <div className="dag-stat">
              <div className="lbl">Fullført</div>
              <div className="val">60</div>
              <div className="sub">MIN · 36%</div>
            </div>
            <div className="dag-stat">
              <div className="lbl">Disipliner</div>
              <div className="val">3</div>
              <div className="sub">SLAG · TEK · TURN</div>
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <div className="title">Fokus i dag</div>
            </div>
            <div className="goal-list">
              <div className="goal-row">
                <span className="goal-bullet" />
                <span className="txt">
                  Approach <strong>100—150m</strong> — slag-prio 1
                </span>
              </div>
              <div className="goal-row">
                <span className="goal-bullet" />
                <span className="txt">
                  Iron CS mot <strong>76 mph</strong>
                </span>
              </div>
              <div className="goal-row">
                <span className="goal-bullet" />
                <span className="txt">15 min mental forberedelse</span>
              </div>
            </div>
          </div>
          <div
            className="card"
            style={{ cursor: "pointer" }}
            onClick={openMessagesWithAnders}
          >
            <div className="card-head">
              <div className="title">Notat fra Anders</div>
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                }}
              >
                2 T SIDEN
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              &quot;Hold focus på lav-spinn på CS80-iron-økten. Vi tar en titt sammen torsdag.&quot;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/*                       PLAN VIEW — ØKT                                 */
/* ───────────────────────────────────────────────────────────────────── */

function OktView({
  openModal,
  router,
}: {
  openModal: (n: ModalName) => void;
  router: Router;
}) {
  const sessionId = "iron-cs70-cs80-2026-05-19";
  return (
    <div className="z-view z-okt">
      <div className="card okt-card">
        <div className="okt-head">
          <div>
            <span className="label-mono">Økt-detalj · av Anders K.</span>
            <h2>
              Iron-progresjon <em>CS70 → CS80</em>
            </h2>
            <div className="okt-head-meta">
              <span className="pill">TEK</span>
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.06em",
                }}
              >
                90 MIN · 240 REPS · 3 DRILLS
              </span>
            </div>
          </div>
          <div className="schedule">
            <div className="when">MAN 19. MAI</div>
            <div className="when" style={{ fontSize: 20, marginTop: 4 }}>
              14:00 — 15:30
            </div>
            <div className="where">BAY 4 · GFGK INDOOR</div>
          </div>
        </div>

        <div className="okt-body">
          <div>
            <div className="okt-section">
              <h4>Drills · 90 min total</h4>
              {(
                [
                  ["Iron 7 · CS-progresjon 70→76", "120 reps · 4 sett × 30 · CS-mål +2 mph per sett", "76", "MPH MÅL"],
                  ["Iron 7 · lav-spinn dispersjon", "80 reps · spinn-mål under 6 500 rpm · landingssone ±4m", "±4", "METER"],
                  ["CS80 push-test · siste 40 reps", "40 reps · smash-faktor over 1,42 på minst 30 av 40", "1,42", "SMASH"],
                ] as const
              ).map(([ttl, params, num, lbl]) => (
                <div className="drill-block" key={ttl}>
                  <svg
                    className="grip"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <use href="#ic-grip" />
                  </svg>
                  <div className="body">
                    <div className="ttl">{ttl}</div>
                    <div className="params">{params}</div>
                  </div>
                  <div className="target-num">
                    {num}
                    <span className="lbl">{lbl}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="okt-section">
              <h4>Mål for økten</h4>
              <div className="goal-list">
                <div className="goal-row">
                  <span className="goal-bullet" />
                  <span className="txt">
                    Snitt-CS opp fra <strong>74</strong> til{" "}
                    <strong>76 mph</strong> på siste sett
                  </span>
                </div>
                <div className="goal-row">
                  <span className="goal-bullet" />
                  <span className="txt">
                    Smash over <strong>1,42</strong> på 75% av reps
                  </span>
                </div>
                <div className="goal-row">
                  <span className="goal-bullet" />
                  <span className="txt">
                    Lav-spinn dispersjon under <strong>±4 m</strong>
                  </span>
                </div>
                <div className="goal-row">
                  <span className="goal-bullet" />
                  <span className="txt">Coach-review torsdag kveld</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="okt-section">
              <h4>Utstyr</h4>
              <div className="equip-tags">
                <span className="equip-tag checked">Iron 7 · Srixon ZX5</span>
                <span className="equip-tag checked">TrackMan 4</span>
                <span className="equip-tag checked">Pro V1x</span>
                <span className="equip-tag">Alignment-stick</span>
                <span className="equip-tag">Lav-spinn ball</span>
              </div>
            </div>

            <div className="okt-section">
              <h4>Kobling til mål</h4>
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 10,
                  padding: 14,
                  cursor: "pointer",
                }}
                onClick={() => router.push("/portal/mal/goal/top-10-nm-slag")}
              >
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Bidrar til
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 14,
                    fontWeight: 600,
                    marginTop: 6,
                  }}
                >
                  Top 10 NM Slag
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: 12.5,
                    color: "var(--muted)",
                    marginTop: 6,
                    lineHeight: 1.45,
                  }}
                >
                  Approach 100—150m er prio 1. CS80-progresjon gir kontroll i
                  dette området.
                </div>
              </div>
            </div>

            <div className="okt-section">
              <h4>Klar?</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  className="btn btn-primary"
                  style={{ justifyContent: "center" }}
                  onClick={() =>
                    router.push(`/portal/live/${sessionId}/brief`)
                  }
                >
                  Start økt
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ justifyContent: "center" }}
                  onClick={() => openModal("edit-session")}
                >
                  Endre detaljer
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ justifyContent: "center" }}
                  onClick={() => openModal("plan-adjust")}
                >
                  Be Anders om endring
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/*                       PLAN RAIL                                       */
/* ───────────────────────────────────────────────────────────────────── */

function PlanRail({
  router,
  showToast,
  openMessagesWithAnders,
}: {
  router: Router;
  showToast: (t: string) => void;
  openMessagesWithAnders: () => void;
}) {
  return (
    <aside className="plan-rail">
      <div className="rail-card ai-card">
        <div className="head">
          <div className="ttl" style={{ color: "var(--primary)" }}>
            Anbefalt for deg
          </div>
          <span className="count">3 FORSLAG</span>
        </div>
        {(
          [
            ["ic-target", "Pitch fra rough", "Coach foreslår · 45 min", "pitch-fra-rough"],
            ["ic-up", "Beinbøy intervall", "Ikke trent FYS på 9 dager", "beinboy-intervall"],
            ["ic-down", "Putting 3—6m", "SG ned 0,4 siste 30d", "putt-3-6"],
          ] as const
        ).map(([icon, ttl, meta, drillId]) => (
          <div
            className="rail-row"
            key={ttl}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/portal/tren/ovelser/${drillId}`)}
          >
            <div className="rail-icon">
              <Icon id={icon} />
            </div>
            <div className="body">
              <div className="ttl">{ttl}</div>
              <div className="meta">{meta}</div>
            </div>
            <button
              className="btn btn-xs btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                showToast(`${ttl} lagt til i ukeplan`);
              }}
            >
              Bruk
            </button>
          </div>
        ))}
      </div>

      <div className="rail-card coach-card">
        <div className="head">
          <div className="ttl">Fra Anders</div>
          <span className="count">2 NYE</span>
        </div>
        <div
          className="rail-row"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/portal/tren/ovelser/iron-cs70-cs80")}
        >
          <div className="rail-icon">
            <Icon id="ic-clipboard" />
          </div>
          <div className="body">
            <div className="ttl">Iron CS70→CS80</div>
            <div className="meta">TILDELT · MAN 14:00</div>
          </div>
        </div>
        <div
          className="rail-row"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/portal/tren/ovelser/driver-grunn")}
        >
          <div className="rail-icon">
            <Icon id="ic-clipboard" />
          </div>
          <div className="body">
            <div className="ttl">Driver grunntrening</div>
            <div className="meta">TILDELT · FRE 11:00</div>
          </div>
        </div>
        <div
          className="rail-row"
          style={{ cursor: "pointer" }}
          onClick={openMessagesWithAnders}
        >
          <div className="rail-icon">
            <Icon id="ic-msg" />
          </div>
          <div className="body">
            <div
              className="ttl"
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 13,
              }}
            >
              &quot;Hold trykket inn mot Sørlandsåpent.&quot;
            </div>
          </div>
        </div>
      </div>

      <div className="rail-card">
        <div className="head">
          <div className="ttl">Mine drills</div>
          <span className="count">24 STK</span>
        </div>
        {(
          [
            ["Pitch 50—100m, lav", "slag", "60 MIN", "pitch-50-100"],
            ["Putting 0—3m blokk", "slag", "30 MIN", "putt-0-3"],
            ["Beinbøy + core", "fys", "30 MIN", "bein-core"],
            ["Bunker-eskalering", "slag", "45 MIN", "bunker-esk"],
          ] as const
        ).map(([ttl, kind, mins, drillId]) => (
          <div
            className="drill-mini"
            key={ttl}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/portal/tren/ovelser/${drillId}`)}
          >
            <svg
              className="grip"
              width="12"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <use href="#ic-grip" />
            </svg>
            <div className="body">
              <div className="ttl">{ttl}</div>
              <div className="meta-row">
                <span className={`pill pill-${kind}`}>{kind.toUpperCase()}</span>
                <span className="mins">{mins}</span>
              </div>
            </div>
          </div>
        ))}
        <button
          className="btn btn-outline btn-xs"
          style={{
            width: "100%",
            justifyContent: "center",
            marginTop: 8,
          }}
          onClick={() => router.push("/portal/tren/ovelser")}
        >
          Se alle drills
        </button>
      </div>
    </aside>
  );
}
