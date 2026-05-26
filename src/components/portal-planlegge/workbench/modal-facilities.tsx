"use client";

/**
 * Modal: Fasiliteter — toggle hvilke fasiliteter spilleren har tilgang til.
 * Brukes av Caddie til å tilpasse drill-forslag.
 * Sprint 5: persisterer til Prisma via saveFacilities.
 */

import { useTransition } from "react";
import { saveFacilities } from "@/app/portal/planlegge/workbench/actions";
import { WBPIc } from "./icon";
import { usePlanContext } from "./plan-context";
import type { WBP_Facilities } from "./types";

const FACILITIES: Array<{
  key: keyof WBP_Facilities;
  label: string;
  desc: string;
  icon: string;
}> = [
  { key: "range", label: "Driving range", desc: "Ute · matter eller gress", icon: "ic-target" },
  { key: "putting", label: "Putting-green", desc: "Korte og lange putter", icon: "ic-flag" },
  { key: "shortgame", label: "Short-game-område", desc: "Chip + pitch + bunker", icon: "ic-leaf" },
  { key: "trackman", label: "TrackMan", desc: "Innendørs eller utendørs simulator", icon: "ic-beaker" },
  { key: "course9", label: "9-hulls bane", desc: "Lokal kortbane", icon: "ic-flag" },
  { key: "course18", label: "18-hulls bane", desc: "Hovedbane (GFGK)", icon: "ic-flag" },
  { key: "gym", label: "Gym / styrkerom", desc: "Vekt + cardio", icon: "ic-flame" },
  { key: "yoga", label: "Yoga / mobilitet", desc: "Mobilitet + restitusjon", icon: "ic-leaf" },
  { key: "pool", label: "Basseng", desc: "Restitusjon + lavbelastning", icon: "ic-anchor" },
  { key: "video", label: "Video-analyse", desc: "Swing-opptak + analyse", icon: "ic-video" },
];

export function WBP_ModalFacilities() {
  const { facilities, setFacilities, setModal, showToast } = usePlanContext();
  const [pending, startTransition] = useTransition();

  function toggle(key: keyof WBP_Facilities) {
    setFacilities({ ...facilities, [key]: !facilities[key] });
  }

  const yes = Object.values(facilities).filter(Boolean).length;

  function handleSave() {
    startTransition(async () => {
      await saveFacilities(facilities);
      setModal(null);
      showToast(`Fasiliteter lagret — ${yes} av ${FACILITIES.length} aktive`);
    });
  }

  return (
    <>
      <div className="wbp-modal-backdrop" onClick={() => setModal(null)} aria-hidden />
      <div className="wbp-modal" role="dialog" aria-labelledby="fac-title">
        <header className="wbp-modal-head">
          <div>
            <p className="wbp-modal-eyebrow">Steg 1 av 5 · Veiviser</p>
            <h2 id="fac-title" className="wbp-modal-title">
              Hvilke fasiliteter har du tilgang til?
            </h2>
            <p className="wbp-modal-sub">
              Caddie tilpasser drill-forslag basert på hva du faktisk har tilgang til.
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
          <div className="fac-grid">
            {FACILITIES.map((f) => {
              const on = facilities[f.key];
              return (
                <button
                  key={f.key}
                  type="button"
                  className={"fac-tile" + (on ? " fac-tile-on" : "")}
                  onClick={() => toggle(f.key)}
                  aria-pressed={on}
                >
                  <span className="fac-icon">
                    <WBPIc id={f.icon} size={20} />
                  </span>
                  <div className="fac-text">
                    <div className="fac-label">{f.label}</div>
                    <div className="fac-desc">{f.desc}</div>
                  </div>
                  <span className={"fac-check" + (on ? " on" : "")} aria-hidden>
                    {on && <WBPIc id="ic-check" size={12} stroke={2.5} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="wbp-modal-foot">
          <span className="wbp-modal-meta">
            <strong>{yes}</strong> av {FACILITIES.length} fasiliteter aktive
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
              onClick={handleSave}
              disabled={pending}
            >
              {pending ? "Lagrer…" : "Lagre"}
              <WBPIc id="ic-arrow-right" size={12} />
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
