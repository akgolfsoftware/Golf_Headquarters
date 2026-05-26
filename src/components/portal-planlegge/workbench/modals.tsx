"use client";

/**
 * Periode, Camp, Frekvens, Test-velger modaler.
 * Sprint 5: Camp + Periode persisteres til Prisma.
 */

import { useState, useTransition } from "react";
import {
  createPeriod,
  createTrainingCamp,
} from "@/app/portal/planlegge/workbench/actions";
import { WBPIc } from "./icon";
import { usePlanContext } from "./plan-context";
import type { Axis } from "./types";

// ============================================================================
// PERIODE
// ============================================================================

const PERIOD_TYPES = [
  { id: "forberedelse", label: "Forberedelse", desc: "FYS + TEK base" },
  { id: "bygging", label: "Bygging", desc: "Volum + spesifikk styrke" },
  { id: "spesialisering", label: "Spesialisering", desc: "Disiplin-fokus" },
  { id: "konkurranse", label: "Konkurranse", desc: "Toppform + taper" },
  { id: "restitusjon", label: "Restitusjon", desc: "Aktiv hvile" },
];

export function WBP_ModalPeriod() {
  const { setModal, showToast } = usePlanContext();
  const [name, setName] = useState("Bygging mot turnering");
  const [type, setType] = useState("bygging");
  const [weeks, setWeeks] = useState(6);
  const [pending, startTransition] = useTransition();

  function save() {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("type", type);
    fd.set("weeks", String(weeks));
    startTransition(async () => {
      try {
        await createPeriod(fd);
        setModal(null);
        showToast(`Periode «${name}» opprettet · ${weeks} uker`);
      } catch (err) {
        showToast(
          err instanceof Error
            ? `Kunne ikke opprette: ${err.message}`
            : "Kunne ikke opprette periode",
        );
      }
    });
  }

  return (
    <>
      <div
        className="wbp-modal-backdrop"
        onClick={() => setModal(null)}
        aria-hidden
      />
      <div className="wbp-modal" role="dialog" aria-labelledby="period-title">
        <header className="wbp-modal-head">
          <div>
            <p className="wbp-modal-eyebrow">Steg 2 av 5 · Veiviser</p>
            <h2 id="period-title" className="wbp-modal-title">
              Ny periode
            </h2>
            <p className="wbp-modal-sub">
              Definér navn, type og varighet for en treningsperiode.
            </p>
          </div>
          <button
            type="button"
            className="wbp-modal-close"
            onClick={() => setModal(null)}
            aria-label="Lukk"
          >
            <WBPIc id="ic-x" size={14} />
          </button>
        </header>

        <div className="wbp-modal-body">
          <label className="wbp-field">
            <span className="wbp-field-label">Navn</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="wbp-input"
            />
          </label>

          <label className="wbp-field">
            <span className="wbp-field-label">Type</span>
            <div className="wbp-radio-grid">
              {PERIOD_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  className={`wbp-radio ${type === pt.id ? "wbp-radio-on" : ""}`}
                  onClick={() => setType(pt.id)}
                  aria-pressed={type === pt.id}
                >
                  <div className="wbp-radio-label">{pt.label}</div>
                  <div className="wbp-radio-desc">{pt.desc}</div>
                </button>
              ))}
            </div>
          </label>

          <label className="wbp-field">
            <span className="wbp-field-label">
              Varighet:{" "}
              <strong>
                {weeks} {weeks === 1 ? "uke" : "uker"}
              </strong>
            </span>
            <input
              type="range"
              min="2"
              max="12"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className="wbp-range"
            />
            <div className="wbp-range-labels">
              <span>2 uker</span>
              <span>12 uker</span>
            </div>
          </label>
        </div>

        <footer className="wbp-modal-foot">
          <span className="wbp-modal-meta">Forsetter til Steg 3 etter lagring</span>
          <div className="wbp-modal-actions">
            <button
              type="button"
              className="wbp-btn-ghost"
              onClick={() => setModal(null)}
            >
              Avbryt
            </button>
            <button
              type="button"
              className="wbp-btn-primary"
              onClick={save}
              disabled={!name.trim() || pending}
            >
              {pending ? "Lagrer…" : "Opprett periode"}
              <WBPIc id="ic-arrow-right" size={12} />
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}

// ============================================================================
// CAMP
// ============================================================================

const CAMP_PARTNERS = [
  { id: "wang", label: "WANG Toppidrett", desc: "Idrettsskole" },
  { id: "team", label: "Team Norge", desc: "Forbund" },
  { id: "klubb", label: "Klubbsamling", desc: "GFGK / lokalt" },
  { id: "privat", label: "Privat samling", desc: "Egen organisering" },
];

export function WBP_ModalCamp() {
  const { setModal, showToast } = usePlanContext();
  const [name, setName] = useState("Sommer-camp");
  const [partner, setPartner] = useState("wang");
  const [start, setStart] = useState("2026-06-13");
  const [end, setEnd] = useState("2026-06-16");
  const [pending, startTransition] = useTransition();

  function save() {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("partner", partner);
    fd.set("startDate", start);
    fd.set("endDate", end);
    startTransition(async () => {
      try {
        await createTrainingCamp(fd);
        setModal(null);
        showToast(`Samling «${name}» lagret`);
      } catch (err) {
        showToast(
          err instanceof Error
            ? `Kunne ikke lagre: ${err.message}`
            : "Kunne ikke lagre samling",
        );
      }
    });
  }

  return (
    <>
      <div
        className="wbp-modal-backdrop"
        onClick={() => setModal(null)}
        aria-hidden
      />
      <div className="wbp-modal" role="dialog">
        <header className="wbp-modal-head">
          <div>
            <p className="wbp-modal-eyebrow">Treningssamling</p>
            <h2 className="wbp-modal-title">Ny samling</h2>
            <p className="wbp-modal-sub">
              Registrér samling med samarbeidspart og dato.
            </p>
          </div>
          <button
            type="button"
            className="wbp-modal-close"
            onClick={() => setModal(null)}
            aria-label="Lukk"
          >
            <WBPIc id="ic-x" size={14} />
          </button>
        </header>

        <div className="wbp-modal-body">
          <label className="wbp-field">
            <span className="wbp-field-label">Samarbeidspart</span>
            <div className="wbp-radio-grid">
              {CAMP_PARTNERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`wbp-radio ${partner === p.id ? "wbp-radio-on" : ""}`}
                  onClick={() => setPartner(p.id)}
                  aria-pressed={partner === p.id}
                >
                  <div className="wbp-radio-label">{p.label}</div>
                  <div className="wbp-radio-desc">{p.desc}</div>
                </button>
              ))}
            </div>
          </label>

          <label className="wbp-field">
            <span className="wbp-field-label">Navn</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="wbp-input"
            />
          </label>

          <div className="wbp-field-row">
            <label className="wbp-field">
              <span className="wbp-field-label">Start</span>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="wbp-input"
              />
            </label>
            <label className="wbp-field">
              <span className="wbp-field-label">Slutt</span>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="wbp-input"
              />
            </label>
          </div>
        </div>

        <footer className="wbp-modal-foot">
          <span className="wbp-modal-meta">
            {Math.ceil(
              (new Date(end).getTime() - new Date(start).getTime()) /
                86_400_000,
            ) + 1}{" "}
            dager
          </span>
          <div className="wbp-modal-actions">
            <button
              type="button"
              className="wbp-btn-ghost"
              onClick={() => setModal(null)}
            >
              Avbryt
            </button>
            <button
              type="button"
              className="wbp-btn-primary"
              onClick={save}
              disabled={pending}
            >
              {pending ? "Lagrer…" : "Lagre samling"}
              <WBPIc id="ic-arrow-right" size={12} />
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}

// ============================================================================
// FREQ
// ============================================================================

const AXIS_DEFAULTS: Record<Axis, number> = {
  fys: 3,
  tek: 5,
  slag: 5,
  spill: 3,
  turn: 1,
};

export function WBP_ModalFreq() {
  const { setModal, showToast } = usePlanContext();
  const [freq, setFreq] = useState(AXIS_DEFAULTS);

  function adjust(axis: Axis, delta: number) {
    setFreq({ ...freq, [axis]: Math.max(0, Math.min(10, freq[axis] + delta)) });
  }

  const total = Object.values(freq).reduce((a, b) => a + b, 0);

  function save() {
    setModal(null);
    showToast(`Ukentlig frekvens lagret · ${total} økter/uke`);
  }

  return (
    <>
      <div
        className="wbp-modal-backdrop"
        onClick={() => setModal(null)}
        aria-hidden
      />
      <div className="wbp-modal" role="dialog">
        <header className="wbp-modal-head">
          <div>
            <p className="wbp-modal-eyebrow">Steg 5 av 5 · Veiviser</p>
            <h2 className="wbp-modal-title">Ukentlig frekvens</h2>
            <p className="wbp-modal-sub">
              Antall økter per akse per uke. Caddie genererer planen basert på
              dette.
            </p>
          </div>
          <button
            type="button"
            className="wbp-modal-close"
            onClick={() => setModal(null)}
            aria-label="Lukk"
          >
            <WBPIc id="ic-x" size={14} />
          </button>
        </header>

        <div className="wbp-modal-body">
          <div className="wbp-freq-list">
            {(["fys", "tek", "slag", "spill", "turn"] as Axis[]).map((ax) => (
              <div key={ax} className="wbp-freq-row">
                <div className="wbp-freq-axis">
                  <span className={`lane-dot lane-dot-${ax}`} />
                  <span className="wbp-freq-label">{ax.toUpperCase()}</span>
                </div>
                <div className="wbp-freq-stepper">
                  <button
                    type="button"
                    className="wbp-stepper-btn"
                    onClick={() => adjust(ax, -1)}
                    aria-label={`Færre ${ax.toUpperCase()}`}
                  >
                    −
                  </button>
                  <div className="wbp-stepper-value">
                    {freq[ax]}
                    <span className="wbp-stepper-unit">økter/uke</span>
                  </div>
                  <button
                    type="button"
                    className="wbp-stepper-btn"
                    onClick={() => adjust(ax, 1)}
                    aria-label={`Flere ${ax.toUpperCase()}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="wbp-modal-foot">
          <span className="wbp-modal-meta">
            <strong>{total}</strong> økter per uke totalt
          </span>
          <div className="wbp-modal-actions">
            <button
              type="button"
              className="wbp-btn-ghost"
              onClick={() => setModal(null)}
            >
              Avbryt
            </button>
            <button type="button" className="wbp-btn-primary" onClick={save}>
              Generér periode
              <WBPIc id="ic-arrow-right" size={12} />
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}

// ============================================================================
// TEST PICKER
// ============================================================================

const TESTS = [
  { id: "cmj", label: "CMJ (Counter Movement Jump)", axis: "fys" as Axis, dur: 15 },
  { id: "sprint", label: "Sprint 30m", axis: "fys" as Axis, dur: 20 },
  { id: "squat", label: "Smith machine squat 5RM", axis: "fys" as Axis, dur: 30 },
  { id: "y-balance", label: "Y-balance", axis: "fys" as Axis, dur: 15 },
  { id: "putt-konsistens", label: "Putt-konsistens 3m", axis: "slag" as Axis, dur: 30 },
  { id: "wedge-spinn", label: "Wedge-spinn 50m", axis: "slag" as Axis, dur: 45 },
  { id: "5-iron-carry", label: "5-iron carry", axis: "tek" as Axis, dur: 30 },
  { id: "driver-distance", label: "Driver-distanse", axis: "tek" as Axis, dur: 30 },
];

export function WBP_ModalTestPicker() {
  const { setModal, showToast } = usePlanContext();
  const [selected, setSelected] = useState<string | null>("cmj");
  const [slot, setSlot] = useState({ week: 21, day: 1 });

  function add() {
    const t = TESTS.find((x) => x.id === selected);
    if (!t) return;
    setModal(null);
    showToast(`Test «${t.label}» plassert i uke ${slot.week}, dag ${slot.day + 1}`);
  }

  return (
    <>
      <div
        className="wbp-modal-backdrop"
        onClick={() => setModal(null)}
        aria-hidden
      />
      <div className="wbp-modal wbp-modal-wide" role="dialog">
        <header className="wbp-modal-head">
          <div>
            <p className="wbp-modal-eyebrow">Test-katalog</p>
            <h2 className="wbp-modal-title">Velg test</h2>
            <p className="wbp-modal-sub">
              {TESTS.length} tester tilgjengelig. Velg én + plasser i en uke.
            </p>
          </div>
          <button
            type="button"
            className="wbp-modal-close"
            onClick={() => setModal(null)}
            aria-label="Lukk"
          >
            <WBPIc id="ic-x" size={14} />
          </button>
        </header>

        <div className="wbp-modal-body">
          <div className="wbp-test-grid">
            {TESTS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`wbp-test-card ${selected === t.id ? "wbp-test-card-on" : ""}`}
                onClick={() => setSelected(t.id)}
                aria-pressed={selected === t.id}
              >
                <div className="wbp-test-axis">
                  <span className={`lane-dot lane-dot-${t.axis}`} />
                  <span className="pill-mono">{t.axis.toUpperCase()}</span>
                </div>
                <div className="wbp-test-label">{t.label}</div>
                <div className="wbp-test-meta">{t.dur} min</div>
              </button>
            ))}
          </div>

          <div className="wbp-slot-picker">
            <span className="wbp-field-label">Plasser i</span>
            <select
              value={slot.week}
              onChange={(e) =>
                setSlot({ ...slot, week: Number(e.target.value) })
              }
              className="wbp-input"
            >
              {[19, 20, 21, 22, 23, 24].map((w) => (
                <option key={w} value={w}>
                  Uke {w}
                </option>
              ))}
            </select>
            <select
              value={slot.day}
              onChange={(e) =>
                setSlot({ ...slot, day: Number(e.target.value) })
              }
              className="wbp-input"
            >
              {["Man", "Tirs", "Ons", "Tors", "Fre", "Lør", "Søn"].map(
                (d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <footer className="wbp-modal-foot">
          <span className="wbp-modal-meta">
            {selected
              ? `«${TESTS.find((t) => t.id === selected)?.label}» — uke ${slot.week}`
              : "Velg en test"}
          </span>
          <div className="wbp-modal-actions">
            <button
              type="button"
              className="wbp-btn-ghost"
              onClick={() => setModal(null)}
            >
              Avbryt
            </button>
            <button
              type="button"
              className="wbp-btn-primary"
              onClick={add}
              disabled={!selected}
            >
              Legg til test
              <WBPIc id="ic-arrow-right" size={12} />
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
