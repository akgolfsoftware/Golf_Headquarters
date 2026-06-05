"use client";

// Workbench Unified — én vertikal flow med 7 seksjoner:
//   1. Sidebar (forest, AK Golf logo, Planlegger aktiv)
//   2. Hero (eyebrow + Inter Tight title + italic "workbench")
//   3. Årsplan-gantt (12 mnd, 6 perioder, turneringsflagg, I dag-pin)
//   4. 3-pane workbench (Profil A + Kalender B + Drills/Periodisering C)
//   5. Mål-tracker-rad (3 cards: ring + line chart + zone-bar)
//   6. Insight-strip (SG-trend + slag-prio + DataGolf)
//   7. Sticky footer (5 mini-bars + summary + 2 CTAs)
//
// Bevarer alle 13 modaler fra workbench-modaler.tsx + Cmd+K palette
// + toast via useToast() + sidebar-navigering.
//
// Hardkodet data for Øyvind R. · Uke 21 · Spesialisering-periode.

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import "./workbench-v2.css";
import "./workbench-unified.css";
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

/* ─── SVG sprite (Lucide-style ikoner, stroke 1.75) ────────────────── */

function SvgSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <symbol id="i-home" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </symbol>
        <symbol id="i-bell" viewBox="0 0 24 24">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </symbol>
        <symbol id="i-cal" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </symbol>
        <symbol id="i-clip" viewBox="0 0 24 24">
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </symbol>
        <symbol id="i-target" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </symbol>
        <symbol id="i-bar" viewBox="0 0 24 24">
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </symbol>
        <symbol id="i-user" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </symbol>
        <symbol id="i-cycle" viewBox="0 0 24 24">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
          <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
        </symbol>
        <symbol id="i-test" viewBox="0 0 24 24">
          <path d="M9 2v6.5L4 17a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-8.5V2" />
          <line x1="9" y1="2" x2="15" y2="2" />
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </symbol>
        <symbol id="i-plus" viewBox="0 0 24 24" strokeWidth={2}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </symbol>
        <symbol id="i-arrow-r" viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </symbol>
        <symbol id="i-msg" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24" strokeWidth={2.25}>
          <polyline points="20 6 9 17 4 12" />
        </symbol>
        <symbol id="i-sparkles" viewBox="0 0 24 24">
          <path d="M12 3l1.9 5.7L19.6 10.6 13.9 12.5 12 18.2 10.1 12.5 4.4 10.6 10.1 8.7Z" />
        </symbol>
        <symbol id="i-flag" viewBox="0 0 24 24">
          <path d="M4 22V4" />
          <path d="M4 4h11l-2 4 2 4H4" />
        </symbol>
        <symbol id="i-star" viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </symbol>
        <symbol id="i-import" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </symbol>
        <symbol id="i-trend-up" viewBox="0 0 24 24">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </symbol>
        <symbol id="i-trend-dn" viewBox="0 0 24 24">
          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
          <polyline points="16 17 22 17 22 11" />
        </symbol>
        <symbol id="i-chev-l" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </symbol>
        <symbol id="i-chev-r" viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </symbol>
        <symbol id="i-menu" viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </symbol>
        <symbol id="i-x" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
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
  className,
  style,
}: {
  id: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <use href={`#${id}`} />
  </svg>
);

/* ─── Uke-event data (Øyvind R. · Uke 21) ────────────────────────── */

const UKE_EVENTS: UkeEvent[] = [
  {
    id: "pitch-mon",
    d: 0,
    h: 9,
    dur: 60,
    k: "slag",
    t: "Pitch 50—100m, lav",
    time: "09:00 — 10:00",
    dayLabel: "Mandag 19. mai",
    reps: 184,
    drill: "Pitch 50—100m, lav trajectory",
    focus: "Landing-sone ±3m · spinn lav",
    assigned: "Selvplanlagt",
    status: "fullfort",
    statusText: "FULLFØRT",
    goal:
      "Approach 100—150m er <strong>prio 1</strong> — pitch er forberedelse for de korte iron-skuddene.",
  },
  {
    id: "iron-mon",
    d: 0,
    h: 14,
    dur: 90,
    k: "tek",
    t: "Iron CS70→CS80",
    time: "14:00 — 15:30",
    dayLabel: "Mandag 19. mai",
    reps: 240,
    drill: "Iron-progresjon CS70 → CS80",
    focus: "Snitt-CS opp fra 74 til <strong>76 mph</strong>",
    assigned: "Av Anders K.",
    status: "planlagt",
    statusText: "PLANLAGT · NESTE OPP",
    goal:
      "Bidrar til <strong>Top 10 NM Slag</strong> via approach-kontroll på 100—150m.",
  },
  {
    id: "bunker-wed",
    d: 2,
    h: 9,
    dur: 90,
    k: "slag",
    t: "Bunker-eskalering",
    time: "09:00 — 10:30",
    dayLabel: "Onsdag 21. mai",
    reps: 80,
    drill: "Bunker-eskalering",
    focus: "Greenside · escalating distances",
    assigned: "Selvplanlagt",
    status: "planlagt",
    statusText: "SELVPLANLAGT",
    goal: "Bossum har 4 bunker-omkransede greener.",
  },
  {
    id: "driver-fri",
    d: 4,
    h: 11,
    dur: 60,
    k: "tek",
    t: "Driver grunntrening",
    time: "11:00 — 12:00",
    dayLabel: "Fredag 23. mai",
    reps: 120,
    drill: "Driver grunntrening",
    focus: "CS 112 mph stable · smash 1,48",
    assigned: "Av Anders K.",
    status: "planlagt",
    statusText: "AV ANDERS",
    goal: "Bidrar til <strong>HCP +2,0</strong> via driving-distance.",
  },
  {
    id: "bossum-sat",
    d: 5,
    h: 9,
    dur: 240,
    k: "spill",
    t: "Bossum Open · R1",
    time: "09:00 — 13:00",
    dayLabel: "Lørdag 24. mai",
    reps: 18,
    drill: "Turnerings-runde",
    focus: "18 hull · runde 1 · tee 09:00",
    assigned: "Turnering",
    status: "turnering",
    statusText: "TURNERING",
    goal: "Form-test før Sørlandsåpent. Mål: under 73.",
  },
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

const UKE_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

/* ─── Main client component ────────────────────────────────────────── */

export function WorkbenchClient() {
  const router = useRouter();
  const toaster = useToast();

  const [modal, setModal] = useState<ModalName>(null);
  const [discKey, setDiscKey] = useState<DisciplineKey>("tek");
  const [nyEktPrefill, setNyEktPrefill] = useState<NyEktPrefill | undefined>(
    undefined,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRect, setNotifRect] = useState<DOMRect | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

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

  // drill-tab state (Pane C2)
  const [drillTab, setDrillTab] = useState<"alle" | "fav" | "coach">("alle");

  // wb-tab state (Dag / Uke / Måned / Sesong)
  const [wbTab, setWbTab] = useState<"dag" | "uke" | "md" | "sesong">("uke");

  // sidebar drawer state (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const showToast = useCallback(
    (text: string) => {
      toaster.success(text);
    },
    [toaster],
  );

  const openModal = useCallback((n: ModalName) => setModal(n), []);
  const closeModal = useCallback(() => setModal(null), []);

  const submitModal = useCallback(
    (msg: string) => {
      closeModal();
      showToast(msg);
    },
    [closeModal, showToast],
  );

  const openDiscModal = (k: DisciplineKey) => {
    setDiscKey(k);
    setModal("disc");
  };

  const openNyEkt = useCallback((prefilled?: NyEktPrefill) => {
    setNyEktPrefill(prefilled);
    setModal("ny-okt");
  }, []);

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

  // Hjelper for å rendere et event-blokk i kalenderen ved hour=h, day=d
  const eventForCell = useCallback((d: number, h: number) => {
    return UKE_EVENTS.find((ev) => ev.d === d && ev.h === h);
  }, []);

  const emptyHints = useMemo(
    () =>
      [
        { d: 1, h: 11, label: "Tirsdag 20. mai · 11:00", dur: 90 },
        { d: 3, h: 15, label: "Torsdag 22. mai · 15:00", dur: 90 },
      ] as const,
    [],
  );

  return (
    <div
      className="wb-root"
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

      <div className={`app${sidebarOpen ? " sidebar-open" : ""}`}>
        {/* Sidebar-backdrop (kun mobile, vises når drawer er åpen) */}
        <div
          className="sidebar-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            closeSidebar();
          }}
          aria-hidden={!sidebarOpen}
        />

        {/* ===== 1. SIDEBAR ===== */}
        <aside
          className="sidebar"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="sb-close"
            onClick={closeSidebar}
            aria-label="Lukk meny"
          >
            <Icon id="i-x" />
          </button>
          <div className="sb-brand">
            <SidebarBrand variant="player" role="PRO" />
          </div>

          <div className="sb-profile">
            <span className="av">ØR</span>
            <div>
              <div className="nm">Øyvind R.</div>
              <div className="pmeta">HCP +3,5 · A1</div>
            </div>
          </div>

          <div className="sb-group">
            <div className="sb-group-label">Hjem</div>
            <button className="sb-item" onClick={() => router.push("/portal")}>
              <Icon id="i-home" />
              Hjem
            </button>
            <button
              className="sb-item"
              onClick={() => router.push("/portal/varsler")}
            >
              <Icon id="i-bell" />
              Varsler<span className="sb-badge">3</span>
            </button>
          </div>

          <div className="sb-group">
            <div className="sb-group-label">Trening</div>
            <button className="sb-item active">
              <Icon id="i-clip" />
              Planlegger
            </button>
            <button
              className="sb-item"
              onClick={() => router.push("/portal/kalender")}
            >
              <Icon id="i-cal" />
              Kalender
            </button>
            <button
              className="sb-item"
              onClick={() => router.push("/portal/arsplan")}
            >
              <Icon id="i-cycle" />
              Årsplan
            </button>
            <button
              className="sb-item"
              onClick={() => router.push("/portal/tester")}
            >
              <Icon id="i-test" />
              Tester
            </button>
          </div>

          <div className="sb-group">
            <div className="sb-group-label">Innsikt</div>
            <button
              className="sb-item"
              onClick={() => router.push("/portal/statistikk")}
            >
              <Icon id="i-bar" />
              Statistikk
            </button>
            <button
              className="sb-item"
              onClick={() => router.push("/portal/mal")}
            >
              <Icon id="i-target" />
              Mål
            </button>
            <button
              className="sb-item"
              onClick={() => router.push("/portal/coach")}
            >
              <Icon id="i-user" />
              Coach
            </button>
          </div>
        </aside>

        {/* ===== MAIN ===== */}
        <main>
          {/* TOPBAR */}
          <header className="topbar">
            <button
              type="button"
              className="tb-menu"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(true);
              }}
              aria-label="Åpne meny"
            >
              <Icon id="i-menu" />
            </button>
            <button
              type="button"
              className="tb-search"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("cmd-palette:open"))
              }
              aria-label="Åpne globalt søk (Cmd+K)"
            >
              <Icon id="i-search" />
              <input
                placeholder="Søk drill, plan eller mål…"
                readOnly
                tabIndex={-1}
              />
              <span className="kbd">⌘K</span>
            </button>
            <div className="tb-crumb">
              Trening<span className="sep">/</span>Min planlegger
              <span className="sep">/</span>
              <span className="current">Uke 21</span>
            </div>
            <div className="tb-right">
              <button
                ref={bellRef}
                className="tb-iconbtn"
                aria-label="Varsler"
                onClick={(e) => {
                  e.stopPropagation();
                  if (bellRef.current) {
                    setNotifRect(bellRef.current.getBoundingClientRect());
                  }
                  setNotifOpen((p) => !p);
                }}
              >
                <Icon id="i-bell" />
                <span className="dot" />
              </button>
              <button
                className="tb-iconbtn"
                aria-label="Meldinger"
                onClick={(e) => {
                  e.stopPropagation();
                  setDrawerOpen(true);
                }}
              >
                <Icon id="i-msg" />
              </button>
            </div>
          </header>

          <div className="page">
            {/* ===== 2. HERO ===== */}
            <section className="hero">
              <div>
                <div className="eyebrow">
                  MIN WORKBENCH · UKE 21 · 19—25 MAI 2026
                </div>
                <h1>
                  Min <em>workbench</em> — bygg, juster, be om hjelp
                </h1>
              </div>
              <div className="hero-actions">
                <button className="btn lime" onClick={() => openNyEkt()}>
                  <Icon id="i-plus" />
                  Ny økt
                </button>
                <button
                  className="btn forest"
                  onClick={() => openModal("ask-coach")}
                >
                  <Icon id="i-msg" />
                  Be om økt fra coach
                </button>
                <button
                  className="btn outline"
                  onClick={() => openModal("ai-foresla")}
                >
                  <Icon id="i-sparkles" />
                  AI-foreslå uke
                </button>
                <button
                  className="btn outline"
                  onClick={() => openModal("log-session")}
                >
                  <Icon id="i-check" />
                  Logg gjennomført økt
                </button>
              </div>
            </section>

            {/* ===== 3. ÅRSPLAN GANTT ===== */}
            <section className="gantt">
              <div className="gantt-head">
                <h3>Sesong 2026 · min årsplan</h3>
                <div className="legend">
                  <span>
                    <i style={{ background: "var(--brand-primary)" }} />
                    Aktiv periode
                  </span>
                  <span>
                    <i style={{ background: "var(--brand-accent)" }} />
                    Hovedmål-turnering
                  </span>
                  <span>
                    <i style={{ background: "var(--danger)" }} />
                    Konkurranse
                  </span>
                  <span>
                    <i style={{ background: "var(--danger)" }} />I dag
                  </span>
                </div>
              </div>

              <div className="gantt-months">
                <span>JAN</span>
                <span>FEB</span>
                <span>MAR</span>
                <span>APR</span>
                <span>MAI</span>
                <span>JUN</span>
                <span>JUL</span>
                <span>AUG</span>
                <span>SEP</span>
                <span>OKT</span>
                <span>NOV</span>
                <span>DES</span>
              </div>

              <div className="gantt-trackwrap">
                <div className="gantt-track">
                  <div
                    className="gantt-block b1"
                    style={{ left: "0%", width: "25%" }}
                  >
                    GRUNNTRENING
                  </div>
                  <div
                    className="gantt-block b2"
                    style={{ left: "16.66%", width: "12.5%" }}
                  >
                    OPPBYGGING
                  </div>
                  <div
                    className="gantt-block b3"
                    style={{ left: "25%", width: "16.66%" }}
                  >
                    SPESIALISERING · AKTIV
                  </div>
                  <div
                    className="gantt-block b4"
                    style={{ left: "41.66%", width: "20.83%" }}
                  >
                    KONKURRANSE
                  </div>
                  <div
                    className="gantt-block b5"
                    style={{ left: "66.66%", width: "16.66%" }}
                  >
                    OVERGANG
                  </div>
                  <div
                    className="gantt-block b6"
                    style={{ left: "83.33%", width: "16.66%" }}
                  >
                    HVILE
                  </div>

                  <div
                    className="gantt-today"
                    style={{ left: "calc(33.33% + (18/31)*8.33%)" }}
                  />
                </div>

                <div className="gantt-flags">
                  <div
                    className="gantt-flag star"
                    style={{ left: "calc(41.66% + (9/30)*8.33%)" }}
                  >
                    <Icon id="i-star" />
                    <span className="lbl">10. JUN · SØRLANDSÅPENT</span>
                  </div>
                  <div
                    className="gantt-flag"
                    style={{ left: "calc(41.66% + (23/30)*8.33%)" }}
                  >
                    <Icon id="i-flag" />
                    <span className="lbl">24. JUN · BOSSUM</span>
                  </div>
                  <div
                    className="gantt-flag star"
                    style={{ left: "calc(50% + (7/31)*8.33%)" }}
                  >
                    <Icon id="i-star" />
                    <span className="lbl">8. JUL · NM SLAG</span>
                  </div>
                  <div
                    className="gantt-flag"
                    style={{ left: "calc(50% + (21/31)*8.33%)" }}
                  >
                    <Icon id="i-flag" />
                    <span className="lbl">22. JUL · TRONDHEIM</span>
                  </div>
                  <div
                    className="gantt-flag"
                    style={{ left: "calc(58.33% + (4/31)*8.33%)" }}
                  >
                    <Icon id="i-flag" />
                    <span className="lbl">5. AUG · GFGK MESTERSKAP</span>
                  </div>
                </div>
              </div>

              <div className="gantt-weeks">
                <div className="week-strip">
                  <button className="week-cell">U18</button>
                  <button className="week-cell">U19</button>
                  <button className="week-cell">U20</button>
                  <button className="week-cell active">U21</button>
                  <button className="week-cell">U22</button>
                </div>
              </div>
            </section>

            {/* ===== 4. WORKBENCH 3-PANE ===== */}
            <section>
              <div className="wb-tabs">
                <button
                  className={`wb-tab ${wbTab === "dag" ? "active" : ""}`}
                  onClick={() => setWbTab("dag")}
                >
                  DAG
                </button>
                <button
                  className={`wb-tab ${wbTab === "uke" ? "active" : ""}`}
                  onClick={() => setWbTab("uke")}
                >
                  UKE <span className="count">21</span>
                </button>
                <button
                  className={`wb-tab ${wbTab === "md" ? "active" : ""}`}
                  onClick={() => setWbTab("md")}
                >
                  MÅNED
                </button>
                <button
                  className={`wb-tab ${wbTab === "sesong" ? "active" : ""}`}
                  onClick={() => setWbTab("sesong")}
                >
                  SESONG
                </button>
              </div>

              <div className="wb-grid">
                {/* ===== PANE A ===== */}
                <div className="pane-a">
                  <div className="profile-hero">
                    <div className="av-big">ØR</div>
                    <div className="nm">Øyvind Rohjan</div>
                    <div className="pmeta">HCP +3,5 · A1 · GFGK</div>
                    <div className="status-pill">
                      <Icon id="i-check" />
                      På plan denne uka
                    </div>
                  </div>

                  <div className="pa-card">
                    <h4>Mine mål</h4>

                    <div className="goal-row">
                      <div className="top">
                        <span className="gname">HCP +3,0 innen sesong-slutt</span>
                        <span className="gval">60 %</span>
                      </div>
                      <div className="goal-bar">
                        <div style={{ width: "60%" }} />
                      </div>
                    </div>

                    <div className="goal-row">
                      <div className="top">
                        <span className="gname">Top 10 NM Slag</span>
                        <span className="gval">50 dager</span>
                      </div>
                      <div className="goal-bar">
                        <div
                          style={{
                            width: "35%",
                            background: "var(--brand-primary)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="goal-row">
                      <div className="top">
                        <span className="gname">Bryte 70 på Bossum</span>
                        <span className="gval">71 sist</span>
                      </div>
                      <div className="goal-bar">
                        <div
                          style={{ width: "80%", background: "var(--pyr-tek)" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pa-card">
                    <h4>Min streak</h4>
                    <div className="streak-grid">
                      {[
                        "on",
                        "on",
                        "on",
                        "",
                        "on",
                        "on",
                        "on",
                        "on",
                        "on",
                        "",
                        "on",
                        "on",
                        "",
                        "today",
                      ].map((c, i) => (
                        <span
                          key={i}
                          className={`streak-cell${c ? " " + c : ""}`}
                        />
                      ))}
                    </div>
                    <div className="streak-meta">
                      <strong>11 av 14</strong> dager · lengste 23 d
                    </div>
                  </div>

                  <div className="coach-card-dark">
                    <div className="row">
                      <span className="av">AK</span>
                      <div>
                        <div className="nm">Anders Kristiansen</div>
                        <div className="role">HEAD COACH</div>
                      </div>
                    </div>
                    <div className="actions">
                      <button
                        className="btn lime-outline sm"
                        onClick={() => setDrawerOpen(true)}
                      >
                        <Icon id="i-msg" />
                        Send melding
                      </button>
                      <button
                        className="btn lime sm"
                        onClick={() => openModal("ask-coach")}
                      >
                        <Icon id="i-plus" />
                        Be om økt
                      </button>
                    </div>
                  </div>
                </div>

                {/* ===== PANE B : Calendar ===== */}
                <div className="pane-b">
                  <div className="cal-head">
                    <h3>Uke 21 · 19—25 mai 2026</h3>
                    <div className="nav">
                      <button aria-label="Forrige uke">
                        <Icon id="i-chev-l" />
                      </button>
                      <span className="lbl">UKE 21</span>
                      <button aria-label="Neste uke">
                        <Icon id="i-chev-r" />
                      </button>
                    </div>
                  </div>

                  <div className="cal-grid">
                    {/* headers */}
                    <div className="cal-time-corner" />
                    {UKE_DAYS.map((day) => (
                      <div
                        key={day.dnum}
                        className={`cal-daycol-head${day.today ? " today" : ""}${day.weekend ? " weekend" : ""}`}
                      >
                        <span className="dow">
                          {day.lbl}
                          {day.today ? " · I DAG" : ""}
                        </span>
                        <span className="day">{day.dnum}</span>
                      </div>
                    ))}

                    {/* hour rows */}
                    {UKE_HOURS.map((h) => (
                      <React.Fragment key={h}>
                        <div className="cal-time">
                          {String(h).padStart(2, "0")}:00
                        </div>
                        {UKE_DAYS.map((day, di) => {
                          const ev = eventForCell(di, h);
                          const hint = emptyHints.find(
                            (x) => x.d === di && x.h === h,
                          );
                          const isCta =
                            day.lbl === "SØN" && h === 15;
                          return (
                            <div
                              key={`${di}-${h}`}
                              className={`cal-cell${day.today ? " today" : ""}${day.weekend ? " weekend" : ""}`}
                            >
                              {ev ? (
                                <div
                                  className={`cal-block ${ev.k}${ev.status === "fullfort" ? " done" : ""}${ev.status === "turnering" ? " tournament" : ""}`}
                                  style={{
                                    top: 4,
                                    height: (ev.dur / 60) * 40 - 4,
                                  }}
                                  onClick={(e) => onEventClick(e, ev)}
                                >
                                  <div className="title">{ev.t}</div>
                                  <div className="meta">
                                    <span className={`disc ${ev.k}`}>
                                      {ev.k.toUpperCase()}
                                    </span>
                                    {ev.status === "fullfort" ? (
                                      <span className="stbadge done">
                                        <Icon id="i-check" />
                                        FULLFØRT
                                      </span>
                                    ) : ev.status === "turnering" ? (
                                      <span className="mono" style={{ color: "var(--brand-accent)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em" }}>
                                        {ev.time.split(" — ")[0]}—{ev.time.split(" — ")[1]}
                                      </span>
                                    ) : ev.assigned === "Av Anders K." ? (
                                      <span className="stbadge coach">
                                        AV ANDERS
                                      </span>
                                    ) : (
                                      <span className="stbadge lime">
                                        SELVPLANLAGT
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : hint ? (
                                <div
                                  className="cal-empty-hint"
                                  style={{
                                    top: 4,
                                    height: (hint.dur / 60) * 40 - 4,
                                  }}
                                  onClick={(e) =>
                                    onEmptySlotClick(e, hint.label)
                                  }
                                >
                                  Selvplanlegg eller
                                  <br />
                                  be om økt
                                </div>
                              ) : isCta ? (
                                <div
                                  className="cal-cta"
                                  style={{ top: 4, height: 196 }}
                                  onClick={() => openModal("plan-adjust")}
                                >
                                  <span className="plus">
                                    <Icon id="i-plus" width={12} height={12} />
                                  </span>
                                  <span className="lbl">
                                    BE OM
                                    <br />
                                    PLAN-JUSTERING
                                  </span>
                                  <Icon
                                    id="i-arrow-r"
                                    width={13}
                                    height={13}
                                    strokeWidth={2}
                                    style={{ color: "var(--ink)" }}
                                  />
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* ===== PANE C : Drills + Periodization ===== */}
                <div className="pane-c">
                  {/* C1 — Anbefalt */}
                  <div className="rec-card">
                    <h4>Anbefalt for deg</h4>

                    <div className="rec-row">
                      <span className="ic">
                        <Icon id="i-target" />
                      </span>
                      <div className="body">
                        <div className="name">Pitch fra rough</div>
                        <div className="reason">COACH FORESLÅR</div>
                      </div>
                      <button
                        className="btn lime xs"
                        onClick={() =>
                          openNyEkt({
                            discipline: "slag",
                            drill: "Pitch fra rough",
                            title: "Pitch fra rough",
                          })
                        }
                      >
                        Bruk
                      </button>
                    </div>

                    <div className="rec-row">
                      <span className="ic">
                        <Icon id="i-target" />
                      </span>
                      <div className="body">
                        <div className="name">Beinbøy intervall</div>
                        <div className="reason">INGEN FYS PÅ 9 DAGER</div>
                      </div>
                      <button
                        className="btn lime xs"
                        onClick={() =>
                          openNyEkt({
                            discipline: "fys",
                            drill: "Beinbøy intervall",
                            title: "Beinbøy intervall",
                          })
                        }
                      >
                        Bruk
                      </button>
                    </div>

                    <div className="rec-row">
                      <span className="ic">
                        <Icon id="i-target" />
                      </span>
                      <div className="body">
                        <div className="name">Putting 3—6m</div>
                        <div className="reason">SG HAR SUNKET</div>
                      </div>
                      <button
                        className="btn lime xs"
                        onClick={() =>
                          openNyEkt({
                            discipline: "slag",
                            drill: "Putting 3—6m",
                            title: "Putting 3—6m",
                          })
                        }
                      >
                        Bruk
                      </button>
                    </div>
                  </div>

                  {/* C2 — Mine drills */}
                  <div className="drills-card">
                    <div className="head">
                      <h4>Mine drills</h4>
                      <span className="ct">14 tilgjengelige</span>
                    </div>
                    <div className="drill-tabs">
                      <button
                        className={`drill-tab${drillTab === "alle" ? " active" : ""}`}
                        onClick={() => setDrillTab("alle")}
                      >
                        Alle
                      </button>
                      <button
                        className={`drill-tab${drillTab === "fav" ? " active" : ""}`}
                        onClick={() => setDrillTab("fav")}
                      >
                        Favoritter
                      </button>
                      <button
                        className={`drill-tab${drillTab === "coach" ? " active" : ""}`}
                        onClick={() => setDrillTab("coach")}
                      >
                        Coach tildelt<span className="nbadge">5</span>
                      </button>
                    </div>

                    {[
                      {
                        nm: "Pitch 50—100m",
                        k: "slag" as DisciplineKey,
                        min: 60,
                        badge: "TILDELT",
                        badgeCls: "forest",
                      },
                      {
                        nm: "Putting 0—3m blokk",
                        k: "slag" as DisciplineKey,
                        min: 30,
                        badge: "FAVORITT",
                        badgeCls: "lime",
                      },
                      {
                        nm: "Beinbøy + core",
                        k: "fys" as DisciplineKey,
                        min: 30,
                        badge: null,
                        badgeCls: "",
                      },
                      {
                        nm: "Iron CS70→CS80",
                        k: "tek" as DisciplineKey,
                        min: 90,
                        badge: "TILDELT",
                        badgeCls: "forest",
                      },
                      {
                        nm: "Driver grunntrening",
                        k: "tek" as DisciplineKey,
                        min: 60,
                        badge: null,
                        badgeCls: "",
                      },
                      {
                        nm: "Bunker eskalering",
                        k: "slag" as DisciplineKey,
                        min: 45,
                        badge: null,
                        badgeCls: "",
                      },
                    ].map((d) => (
                      <div
                        key={d.nm}
                        className="drill-row"
                        onClick={() => openDiscModal(d.k)}
                        role="button"
                      >
                        <div className="body">
                          <div className="nm">{d.nm}</div>
                          <div className="meta">
                            <span className={`disc ${d.k}`}>
                              {d.k.toUpperCase()}
                            </span>
                            <span className="pip" />
                            <span>{d.min} min</span>
                          </div>
                        </div>
                        {d.badge ? (
                          <span className={`stbadge ${d.badgeCls}`}>
                            {d.badge}
                          </span>
                        ) : (
                          <span />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* C3 — Periodisering */}
                  <div className="period-card">
                    <h4>AKTIV PERIODE</h4>
                    <div className="pname">Spesialisering</div>
                    <div className="pmeta">
                      UKE 17—22 · 6 UKER · CS70 → CS80
                    </div>

                    <div className="pyr-mini">
                      <div className="pyr-mini-row turn">
                        <span className="nm">TURN</span>
                        <div className="bar">
                          <div style={{ width: "5%" }} />
                        </div>
                        <span className="pct">5%</span>
                      </div>
                      <div className="pyr-mini-row spill">
                        <span className="nm">SPILL</span>
                        <div className="bar">
                          <div style={{ width: "15%" }} />
                        </div>
                        <span className="pct">15%</span>
                      </div>
                      <div className="pyr-mini-row slag">
                        <span className="nm">SLAG</span>
                        <div className="bar">
                          <div style={{ width: "30%" }} />
                        </div>
                        <span className="pct">30%</span>
                      </div>
                      <div className="pyr-mini-row tek">
                        <span className="nm">TEK</span>
                        <div className="bar">
                          <div style={{ width: "30%" }} />
                        </div>
                        <span className="pct">30%</span>
                      </div>
                      <div className="pyr-mini-row fys">
                        <span className="nm">FYS</span>
                        <div className="bar">
                          <div style={{ width: "20%" }} />
                        </div>
                        <span className="pct">20%</span>
                      </div>
                    </div>

                    <div className="ring-block">
                      <svg className="ring-svg" viewBox="0 0 100 100">
                        <circle
                          className="ring-track"
                          cx="50"
                          cy="50"
                          r="40"
                        />
                        <circle
                          className="ring-prog"
                          cx="50"
                          cy="50"
                          r="40"
                          strokeDasharray="188.5 251.3"
                        />
                        <text x="50" y="50">
                          75%
                        </text>
                      </svg>
                      <div className="info">
                        <div className="k">FREMDRIFT</div>
                        <div className="lbl">mot CS80</div>
                      </div>
                    </div>

                    <div className="countdown">
                      <span className="nm">Sørlandsåpent</span>
                      <span className="days">21 DAGER</span>
                    </div>

                    <div className="coach-msg">
                      <div className="top">
                        <span className="av">AK</span>
                        <span className="meta">
                          ANDERS K. · FOR 2T SIDEN
                        </span>
                      </div>
                      <p className="quote">
                        &ldquo;Du har vært jevn denne uka, Øyvind. Hold trykket
                        inn mot Sørlandsåpent.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ===== 5. GOALS TRACKER ROW ===== */}
            <section>
              <div className="section-head">
                <h2>
                  Mine <em>mål</em> i sikte
                </h2>
                <span className="eyebrow">3 AKTIVE MÅL</span>
              </div>

              <div className="goals-row">
                {/* GOAL 1 */}
                <div className="goal-card">
                  <div className="gtype">RESULTATMÅL</div>
                  <h3>Top 10 NM Slag</h3>
                  <div className="ring-row">
                    <svg className="ring-big" viewBox="0 0 100 100">
                      <circle className="ring-track" cx="50" cy="50" r="42" />
                      <circle
                        className="ring-prog"
                        cx="50"
                        cy="50"
                        r="42"
                        strokeDasharray="100.3 263.9"
                      />
                      <text x="50" y="50">
                        38%
                      </text>
                    </svg>
                    <div>
                      <span className="days">50 DAGER</span>
                      <p className="quote" style={{ marginTop: 8 }}>
                        &ldquo;Forbedre approach +0,4 SG for 50% sannsynlighet.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* GOAL 2 */}
                <div className="goal-card">
                  <div className="gtype">PROSESSMÅL</div>
                  <h3>Snitt under 72 på Srixon</h3>
                  <svg
                    className="scoreline-svg"
                    viewBox="0 0 320 80"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="0"
                      y1="36"
                      x2="320"
                      y2="36"
                      stroke="#E5E3DD"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    <polyline
                      points="10,52 38,30 65,46 92,18 119,38 146,28 173,14 200,22 227,38 254,16 281,10 308,24"
                      fill="none"
                      stroke="#005840"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="308"
                      cy="24"
                      r="3.5"
                      fill="#D1F843"
                      stroke="#005840"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="78"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#9C9990"
                    >
                      68
                    </text>
                    <text
                      x="304"
                      y="78"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#9C9990"
                    >
                      79
                    </text>
                    <text
                      x="0"
                      y="36"
                      dy="-2"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#9C9990"
                      textAnchor="start"
                    >
                      72
                    </text>
                  </svg>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span className="chip">
                      <Icon id="i-trend-dn" />
                      71,4
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: 10.5,
                        color: "var(--ink-muted)",
                      }}
                    >
                      5/7 SISTE UNDER 72
                    </span>
                  </div>
                </div>

                {/* GOAL 3 */}
                <div className="goal-card">
                  <div className="gtype">RESULTATMÅL</div>
                  <h3>HCP under +2,0 innen sesongslutt</h3>
                  <div className="progress-zone">
                    <div className="fill" style={{ width: "60%" }} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span className="days">82 DAGER IGJEN</span>
                    <span
                      className="mono"
                      style={{
                        fontSize: 10.5,
                        color: "var(--ink-muted)",
                      }}
                    >
                      +3,5 → +2,0
                    </span>
                  </div>
                  <p className="quote">
                    &ldquo;1,5 forbedring i HCP — på sporet til halvveis 60%.&rdquo;
                  </p>
                </div>
              </div>

              <div className="add-goal-row">
                <button
                  className="btn outline sm"
                  onClick={() => openModal("new-goal")}
                >
                  <Icon
                    id="i-plus"
                    style={{ color: "var(--brand-primary)" }}
                  />
                  Nytt mål
                </button>
              </div>
            </section>

            {/* ===== 6. INSIGHT STRIP ===== */}
            <section>
              <div className="section-head">
                <h2>
                  Hva jeg må <em>jobbe med</em>
                </h2>
                <span className="eyebrow">
                  SISTE 90 DAGER · DATAGOLF SAMMENLIGNING
                </span>
              </div>

              <div className="insight-row">
                {/* COL 1 : SG trend */}
                <div className="ins-card">
                  <h3>SG-trend siste 90 dager</h3>
                  <div className="sub">STROKES GAINED · PER DISIPPLIN</div>

                  <svg
                    className="sg-svg"
                    viewBox="0 0 400 200"
                    preserveAspectRatio="none"
                  >
                    {/* y-axis grid */}
                    <line x1="32" y1="20" x2="400" y2="20" stroke="#EFEDE6" />
                    <line x1="32" y1="60" x2="400" y2="60" stroke="#EFEDE6" />
                    <line
                      x1="32"
                      y1="100"
                      x2="400"
                      y2="100"
                      stroke="#D8D5CB"
                    />
                    <line
                      x1="32"
                      y1="140"
                      x2="400"
                      y2="140"
                      stroke="#EFEDE6"
                    />
                    <line
                      x1="32"
                      y1="180"
                      x2="400"
                      y2="180"
                      stroke="#EFEDE6"
                    />
                    <text
                      x="0"
                      y="22"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#9C9990"
                    >
                      +1,5
                    </text>
                    <text
                      x="0"
                      y="62"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#9C9990"
                    >
                      +0,75
                    </text>
                    <text
                      x="0"
                      y="104"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#5E5C57"
                    >
                      0
                    </text>
                    <text
                      x="0"
                      y="144"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#9C9990"
                    >
                      -0,75
                    </text>
                    <text
                      x="0"
                      y="184"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#9C9990"
                    >
                      -1,5
                    </text>
                    <text
                      x="64"
                      y="195"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#9C9990"
                    >
                      MAR
                    </text>
                    <text
                      x="156"
                      y="195"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#9C9990"
                    >
                      APR
                    </text>
                    <text
                      x="248"
                      y="195"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#9C9990"
                    >
                      MAI
                    </text>

                    <polyline
                      points="40,98 80,92 120,90 160,85 200,82 240,80 280,78 320,76 360,76 400,74"
                      fill="none"
                      stroke="#005840"
                      strokeWidth="2"
                    />
                    <polyline
                      points="40,90 80,96 120,104 160,112 200,122 240,128 280,134 320,138 360,142 400,146"
                      fill="none"
                      stroke="#A32D2D"
                      strokeWidth="2"
                    />
                    <polyline
                      points="40,108 80,104 120,100 160,98 200,94 240,90 280,88 320,84 360,82 400,80"
                      fill="none"
                      stroke="#1A7D56"
                      strokeWidth="2"
                    />
                    <polyline
                      points="40,118 80,114 120,108 160,100 200,92 240,84 280,76 320,68 360,62 400,56"
                      fill="none"
                      stroke="#BFE933"
                      strokeWidth="3"
                    />
                    <circle
                      cx="400"
                      cy="56"
                      r="3.5"
                      fill="#D1F843"
                      stroke="#005840"
                      strokeWidth="1.5"
                    />
                  </svg>

                  <div className="sg-legend">
                    <span>
                      <i className="bg-primary" />
                      Off-the-tee
                    </span>
                    <span>
                      <i className="bg-destructive" />
                      Approach
                    </span>
                    <span>
                      <i style={{ background: "hsl(var(--success))" }} />
                      Around-green
                    </span>
                    <span>
                      <i style={{ background: "hsl(var(--accent))" }} />
                      Putting
                    </span>
                  </div>
                </div>

                {/* COL 2 : Slag-prio */}
                <div className="ins-card">
                  <h3>Slag-prioritering</h3>
                  <div className="sub">SØRLANDSÅPENT · OM 21 DAGER</div>

                  <div className="prio-list">
                    {[
                      {
                        n: "01",
                        nm: "Approach 100—150m",
                        sg: "+0,42 SG potensial",
                        rs: "Bossum har 6 hull i dette området",
                        k: "slag" as DisciplineKey,
                        drill: "Approach 100—150m",
                      },
                      {
                        n: "02",
                        nm: "Putting 3—6m",
                        sg: "+0,38 SG potensial",
                        rs: "SG har sunket 0,4 siste 30 dager",
                        k: "slag" as DisciplineKey,
                        drill: "Putting 3—6m",
                      },
                      {
                        n: "03",
                        nm: "Driver-presisjon",
                        sg: "+0,22 SG potensial",
                        rs: "Smale fairways på Bossum",
                        k: "tek" as DisciplineKey,
                        drill: "Driver-presisjon",
                      },
                    ].map((p) => (
                      <div key={p.n} className="prio-row">
                        <span className="num">{p.n}</span>
                        <div className="body">
                          <div className="nm">{p.nm}</div>
                          <span className="sgval">{p.sg}</span>
                          <div className="reason">{p.rs}</div>
                        </div>
                        <button
                          className="btn outline xs"
                          onClick={() =>
                            openNyEkt({
                              discipline: p.k,
                              drill: p.drill,
                              title: p.drill,
                            })
                          }
                        >
                          Opprett drill
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COL 3 : DataGolf */}
                <div className="ins-card">
                  <h3>Du vs DataGolf</h3>
                  <div className="sub">
                    KATEGORI A1 · GJ.SNITT FOR HCP +3 TIL +4
                  </div>

                  {[
                    {
                      nm: "OFF-THE-TEE",
                      delta: "-0,12",
                      cls: "mid" as const,
                      side: "right" as const,
                      pct: 8,
                    },
                    {
                      nm: "APPROACH",
                      delta: "-0,42",
                      cls: "down" as const,
                      side: "right" as const,
                      pct: 28,
                    },
                    {
                      nm: "AROUND-GREEN",
                      delta: "+0,15",
                      cls: "up" as const,
                      side: "left" as const,
                      pct: 10,
                    },
                    {
                      nm: "PUTTING",
                      delta: "-0,28",
                      cls: "mid" as const,
                      side: "right" as const,
                      pct: 18,
                    },
                    {
                      nm: "STRATEGY",
                      delta: "+0,08",
                      cls: "up" as const,
                      side: "left" as const,
                      pct: 6,
                    },
                  ].map((d) => (
                    <div key={d.nm} className="dg-row">
                      <div className="top">
                        <span className="nm">{d.nm}</span>
                        <span className={`delta ${d.cls}`}>{d.delta}</span>
                      </div>
                      <div className="dg-bar">
                        <span className="zero" />
                        <span
                          className={`fill ${d.cls}`}
                          style={
                            d.side === "right"
                              ? { right: "50%", width: `${d.pct}%` }
                              : { left: "50%", width: `${d.pct}%` }
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ===== 7. TRACKMAN STRIP ===== */}
            <section className="tm-strip">
              <div className="section-head">
                <h2>
                  Min <em>TrackMan</em> · siste økter
                </h2>
                <button
                  className="btn outline sm"
                  onClick={() => openModal("tm-import")}
                >
                  <Icon
                    id="i-import"
                    style={{ color: "var(--brand-primary)" }}
                  />
                  Importer ny økt
                </button>
              </div>

              <div className="tm-cards">
                {[
                  {
                    date: "12. MAI · ONS",
                    ttl: "Driver-økt",
                    metric: "112",
                    unit: "mph club-speed",
                    line: "0,22 14,18 28,20 42,14 56,12 70,8 84,10 100,6",
                    stroke: "hsl(var(--primary))",
                  },
                  {
                    date: "10. MAI · MAN",
                    ttl: "Iron 7",
                    metric: "1,48",
                    unit: "smash-faktor",
                    line: "0,16 14,20 28,14 42,18 56,12 70,16 84,10 100,12",
                    stroke: "hsl(var(--success))",
                  },
                  {
                    date: "6. MAI · TOR",
                    ttl: "Pitch 50—100m",
                    metric: "68",
                    unit: "m carry · spred 4m",
                    line: "0,20 14,16 28,18 42,12 56,14 70,10 84,12 100,8",
                    stroke: "hsl(var(--accent))",
                  },
                  {
                    date: "3. MAI · MAN",
                    ttl: "Driver-økt",
                    metric: "220",
                    unit: "m carry",
                    line: "0,18 14,14 28,16 42,10 56,12 70,8 84,6 100,4",
                    stroke: "hsl(var(--primary))",
                  },
                  {
                    date: "28. APR · SØN",
                    ttl: "Wedge-finkalibrering",
                    metric: "9 100",
                    unit: "rpm spin",
                    line: "0,14 14,18 28,12 42,16 56,10 70,14 84,8 100,12",
                    stroke: "hsl(var(--warning))",
                  },
                ].map((c, i) => (
                  <button
                    key={i}
                    className="tm-card"
                    onClick={() => router.push("/portal/statistikk")}
                  >
                    <span className="date">{c.date}</span>
                    <span className="ttl">{c.ttl}</span>
                    <svg
                      className="tm-mini-svg"
                      viewBox="0 0 100 32"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        points={c.line}
                        fill="none"
                        stroke={c.stroke}
                        strokeWidth="1.75"
                      />
                    </svg>
                    <span className="metric">
                      {c.metric} <span className="unit">{c.unit}</span>
                    </span>
                    <span className="open">
                      Åpne <Icon id="i-arrow-r" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* ===== 8. STICKY FOOTER ===== */}
          <footer className="sticky-foot">
            <div className="foot-left">
              <span className="lbl">Min pyramide denne uka</span>
              <div className="foot-pyr">
                <div className="foot-pyr-bar fys">
                  <div className="bar">
                    <div style={{ width: "20%" }} />
                  </div>
                  <span className="pct">FYS 20%</span>
                </div>
                <div className="foot-pyr-bar tek">
                  <div className="bar">
                    <div style={{ width: "32%" }} />
                  </div>
                  <span className="pct">TEK 32%</span>
                </div>
                <div className="foot-pyr-bar slag">
                  <div className="bar">
                    <div style={{ width: "28%" }} />
                  </div>
                  <span className="pct">SLAG 28%</span>
                </div>
                <div className="foot-pyr-bar spill">
                  <div className="bar">
                    <div style={{ width: "15%" }} />
                  </div>
                  <span className="pct">SPILL 15%</span>
                </div>
                <div className="foot-pyr-bar turn">
                  <div className="bar">
                    <div style={{ width: "5%" }} />
                  </div>
                  <span className="pct">TURN 5%</span>
                </div>
              </div>
            </div>
            <div className="foot-mid">
              <b>4</b> PLANLAGT<span className="pip" />
              <b>1</b> FULLFØRT<span className="pip" />
              <b>195</b> MIN<span className="pip" />
              <b>67%</b> PYRAMIDE
            </div>
            <div className="foot-right">
              <button
                className="btn outline"
                onClick={() => openModal("ai-foresla")}
              >
                <Icon
                  id="i-sparkles"
                  style={{ color: "var(--brand-primary)" }}
                />
                Be om økt-forslag
              </button>
              <button
                className="btn lime"
                onClick={() => openModal("log-session")}
              >
                <Icon id="i-plus" />
                Logg ny økt
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* ===== Modaler (bevart fra v2) ===== */}
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

      <MessagesDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
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
    </div>
  );
}
