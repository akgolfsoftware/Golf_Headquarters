"use client";

/**
 * Workbench Plan A — chrome: Topbar, Zoombar, AIBar, Sidebar.
 * Port av workbench-plan/plan-chrome.jsx.
 */

import { Fragment } from "react";
import { WBPIc } from "./icon";
import { usePlanContext } from "./plan-context";
import {
  SAMLINGER,
  WBP_PLANS,
  WBP_TOURNAMENTS,
  WBP_TREE,
  type Zoom,
} from "./types";

// ============================================================================
// TOPBAR
// ============================================================================

export function WBP_Topbar() {
  const { setModal } = usePlanContext();
  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="logo">AK</div>
        <div className="ttl">
          WORKBENCH
          <span className="sub">PLANLEGGING · PRO</span>
        </div>
      </div>
      <div className="crumbs">
        <span className="crumb">Sesong 2026</span>
        <span className="sep">›</span>
        <span className="crumb">Plan A</span>
        <span className="sep">›</span>
        <span className="crumb">Periode 3 · Bygging</span>
        <span className="sep">›</span>
        <span className="crumb active live">Uke 21 · Tirs 23/5</span>
      </div>
      <div className="topbar-right">
        <div className="role-toggle">
          <span className="r on">Spiller</span>
          <span className="r">Coach</span>
        </div>
        <div className="player-picker">
          <div className="av">MR</div>
          <div className="nm">
            Markus R.P.<span className="meta">A1 · HCP −2,1</span>
          </div>
          <WBPIc id="ic-chevdown" size={12} />
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setModal("facilities")}
          title="Fasilitet-oversikt"
        >
          <WBPIc id="ic-pin" />
        </button>
        <button type="button" className="icon-btn" title="Historikk">
          <WBPIc id="ic-history" />
        </button>
        <button type="button" className="icon-btn" title="Innstillinger">
          <WBPIc id="ic-settings" />
        </button>
        <button type="button" className="icon-btn" title="Varsler">
          <WBPIc id="ic-bell" />
          <span className="dot" />
        </button>
        <button type="button" className="share-btn">
          <WBPIc id="ic-share" size={13} />
          Del plan
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// ZOOMBAR
// ============================================================================

const ZOOM_TABS: { id: Zoom; label: string; kbd: string }[] = [
  { id: "ar", label: "År", kbd: "Y" },
  { id: "periode", label: "Periode", kbd: "P" },
  { id: "maned", label: "Måned", kbd: "M" },
  { id: "uke", label: "Uke", kbd: "U" },
  { id: "dag", label: "Dag", kbd: "D" },
];

const SLIDER_PCT: Record<Zoom, number> = {
  ar: 5,
  periode: 35,
  maned: 55,
  uke: 75,
  dag: 95,
};

export function WBP_Zoombar() {
  const { zoom, setZoom } = usePlanContext();
  const pct = SLIDER_PCT[zoom];
  return (
    <div className="zoombar">
      <div className="zb-left">
        <span className="plan-pill">
          <span className="dot" />
          Plan A · Aktiv
        </span>
        <span className="save-state">
          <span className="dot" />
          Lagret 2 s siden
        </span>
      </div>
      <div className="zoom-tabs">
        {ZOOM_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={"zt" + (t.id === zoom ? " on" : "")}
            onClick={() => setZoom(t.id)}
          >
            {t.label}
            <span className="kbd">{t.kbd}</span>
          </button>
        ))}
      </div>
      <div className="zb-right">
        <div className="zoom-slider">
          <span className="lbl">År</span>
          <div className="track">
            <div className="fill" style={{ width: `${pct}%` }} />
            <div className="thumb" style={{ left: `${pct}%` }} />
          </div>
          <span className="lbl">Dag</span>
        </div>
        <span className="zoom-kbd">
          <span className="kbd-chip">⌘</span>
          <span className="kbd-chip">+</span>{" "}/{" "}
          <span className="kbd-chip">⌘</span>
          <span className="kbd-chip">−</span>
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// AI COMMAND BAR
// ============================================================================

export function WBP_AIBar() {
  const { setModal, showToast } = usePlanContext();
  const chips = [
    {
      ic: "ic-sparkles",
      label: "Generér uke 24",
      onClick: () => setModal("freq"),
    },
    {
      ic: "ic-shuffle",
      label: "Balansér Periode 3",
      onClick: () => showToast("Caddie balanserer pyramide-vekting..."),
    },
    {
      ic: "ic-trending",
      label: "Foreslå taper-uke 22",
      onClick: () => showToast("Caddie foreslår taper-uke..."),
    },
  ];
  return (
    <div className="aibar">
      <div className="ai-leftpad">
        <span className="dot" />
        Caddie
      </div>
      <div className="ai-input-wrap">
        <div className="ai-input">
          <WBPIc id="ic-sparkles" />
          <span className="ph">
            <span className="typed">
              Flytt mandag&apos;s SLAG til onsdag og legg til en lett FYS
            </span>
            <span className="caret" />
          </span>
          <span className="kbd-chip">⌘K</span>
        </div>
        <div className="ai-suggestions">
          <span className="lbl">Forslag</span>
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              className="ai-chip"
              onClick={c.onClick}
            >
              <WBPIc id={c.ic} size={11} />
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="ai-cta"
        onClick={() => setModal("freq")}
      >
        <WBPIc id="ic-sparkles" size={13} />
        Generér periode
      </button>
    </div>
  );
}

// ============================================================================
// SIDEBAR
// ============================================================================

export function WBP_Sidebar() {
  const { setModal, facilities } = usePlanContext();
  const facYes = Object.values(facilities).filter(Boolean).length;
  const facTotal = Object.keys(facilities).length;

  return (
    <aside className="sidebar">
      {/* Sesong-tre */}
      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Sesong-tre</span>
          <button
            type="button"
            className="add"
            onClick={() => setModal("period")}
            title="Ny periode"
          >
            <WBPIc id="ic-plus" size={12} />
          </button>
        </div>
        <div className="tree">
          <div className="tree-row lvl-1">
            <span className="chev">
              <WBPIc id="ic-chevdown" size={11} />
            </span>
            <span />
            <span>Sesong 2026</span>
            <span className="badge-right">5 PER</span>
          </div>
          {WBP_TREE.periods.map((p) => (
            <Fragment key={p.id}>
              <div
                className={
                  "tree-row lvl-2 period" + (p.active ? " active" : "")
                }
                onClick={() => p.active && setModal("freq")}
              >
                <span className="chev">
                  {p.active ? (
                    <WBPIc id="ic-chevdown" size={11} />
                  ) : (
                    <WBPIc id="ic-chevright" size={11} />
                  )}
                </span>
                <span className={`marker marker-${p.status}`} />
                <span>
                  P{p.id} · {p.name}
                </span>
                <span className="badge-right">
                  {p.weeks.replace("uke ", "")}
                </span>
              </div>
              {p.active &&
                p.subweeks &&
                p.subweeks.map((w) => (
                  <div
                    key={w.id}
                    className={
                      "tree-row lvl-3" + (w.state === "now" ? " active" : "")
                    }
                  >
                    <span />
                    <span className={`marker marker-${w.state}`} />
                    <span>{w.label}</span>
                    <span className="badge-right">U{w.id}</span>
                  </div>
                ))}
            </Fragment>
          ))}
        </div>
        <button
          type="button"
          className="sb-cta"
          onClick={() => setModal("period")}
        >
          <WBPIc id="ic-plus" size={12} />
          Ny periode
        </button>
      </div>

      {/* Planer A/B */}
      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Planer · A/B</span>
          <button type="button" className="add">
            <WBPIc id="ic-plus" size={12} />
          </button>
        </div>
        {WBP_PLANS.map((p) => (
          <div
            key={p.id}
            className={
              "plan-row" +
              (p.active ? " active" : "") +
              (p.draft ? " draft" : "")
            }
          >
            <span className="ic">{p.id}</span>
            <div>
              <div className="nm">{p.name.split(" · ")[1] ?? p.name}</div>
              <span className="meta">{p.meta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Turneringer */}
      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Turneringer · 2026</span>
          <button type="button" className="add">
            <WBPIc id="ic-plus" size={12} />
          </button>
        </div>
        <div className="tree">
          {WBP_TOURNAMENTS.map((t) => (
            <div key={t.id} className="tree-row lvl-2 tournament">
              <span className="chev" />
              <span className={`marker marker-${t.tier}`} />
              <span>{t.name}</span>
              <span className="badge-right">{t.days}d</span>
            </div>
          ))}
        </div>
      </div>

      {/* Samlinger */}
      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Samlinger</span>
          <button
            type="button"
            className="add"
            onClick={() => setModal("camp")}
            title="Ny samling"
          >
            <WBPIc id="ic-plus" size={12} />
          </button>
        </div>
        <div className="tree">
          {SAMLINGER.map((s) => (
            <div key={s.id} className="tree-row lvl-2">
              <span className="chev" />
              <span
                className="marker"
                style={{ background: s.color, borderRadius: "50%" }}
              />
              <span>{s.name}</span>
              <span className="badge-right">{s.date}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="sb-cta"
          onClick={() => setModal("camp")}
        >
          <WBPIc id="ic-plus" size={12} />
          Ny samling
        </button>
      </div>

      {/* Fasiliteter */}
      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Fasiliteter</span>
          <button
            type="button"
            className="add"
            onClick={() => setModal("facilities")}
            title="Rediger"
          >
            <WBPIc id="ic-settings" size={12} />
          </button>
        </div>
        <div
          className="plan-row"
          onClick={() => setModal("facilities")}
          style={{ cursor: "pointer" }}
        >
          <span
            className="ic"
            style={{
              background:
                facYes >= 8 ? "var(--brand-primary)" : "var(--warning)",
            }}
          >
            <WBPIc id="ic-pin" size={10} />
          </span>
          <div>
            <div className="nm">
              {facYes} av {facTotal} tilgjengelig
            </div>
            <span className="meta">Caddie tilpasser drills</span>
          </div>
        </div>
      </div>

      {/* Pyramide-akser-legende */}
      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Pyramide-akser</span>
        </div>
        <div className="legend-grid">
          <span className="l-item">
            <span className="sw" style={{ background: "var(--turn)" }} />
            TURN
          </span>
          <span className="l-item">
            <span
              className="sw"
              style={{ background: "var(--brand-accent)" }}
            />
            SPILL
          </span>
          <span className="l-item">
            <span className="sw" style={{ background: "var(--slag)" }} />
            SLAG
          </span>
          <span className="l-item">
            <span className="sw" style={{ background: "var(--tek)" }} />
            TEK
          </span>
          <span className="l-item">
            <span className="sw" style={{ background: "var(--fys)" }} />
            FYS
          </span>
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// WIZARD BANNER (vises øverst inntil bruker dismisser)
// ============================================================================

export function WBP_WizardBanner() {
  const { setWizardOpen, setModal } = usePlanContext();
  return (
    <div className="wizard-banner">
      <span className="wb-pill">VEIVISER</span>
      <span className="wb-text">
        Du er midt i Periode 3 (Bygging mot turnering). Caddie kan generere
        gjenværende uker basert på ditt skjema.
      </span>
      <button
        type="button"
        className="wb-cta"
        onClick={() => setModal("freq")}
      >
        Start veiviser
      </button>
      <button
        type="button"
        className="wb-close"
        onClick={() => setWizardOpen(false)}
        aria-label="Lukk veiviser"
      >
        <WBPIc id="ic-x" size={12} />
      </button>
    </div>
  );
}

// ============================================================================
// TOAST
// ============================================================================

export function WBP_Toast() {
  const { toast } = usePlanContext();
  if (!toast) return null;
  return <div className="wbp-toast">{toast.text}</div>;
}
