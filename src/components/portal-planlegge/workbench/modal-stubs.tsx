"use client";

/**
 * Stub-modaler for Sprint 1 — Periode/Camp/Frekvens/Test-velger.
 * Sprint 2 erstatter disse med full implementering.
 */

import { WBPIc } from "./icon";
import { usePlanContext } from "./plan-context";

type StubProps = {
  eyebrow: string;
  title: string;
  body: string;
};

function StubModal({ eyebrow, title, body }: StubProps) {
  const { setModal } = usePlanContext();
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
            <p className="wbp-modal-eyebrow">{eyebrow}</p>
            <h2 className="wbp-modal-title">{title}</h2>
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
          <p className="wbp-modal-stub-body">{body}</p>
        </div>
        <footer className="wbp-modal-foot">
          <span className="wbp-modal-meta">Kommer i Sprint 2</span>
          <div className="wbp-modal-actions">
            <button
              type="button"
              className="wbp-btn-primary"
              onClick={() => setModal(null)}
            >
              OK
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}

export function WBP_ModalPeriod() {
  return (
    <StubModal
      eyebrow="Steg 2 av 5 · Veiviser"
      title="Ny periode"
      body="Definér navn, varighet, pyramide-vekting og fokus-mål for en ny treningsperiode. Full periode-wizard kommer i Sprint 2."
    />
  );
}

export function WBP_ModalCamp() {
  return (
    <StubModal
      eyebrow="Treningssamling"
      title="Ny samling"
      body="Registrér samling med samarbeidspartner (WANG Toppidrett / Team Norge / klubbsamling), deltakere, dato og lokasjon. Full samling-modal kommer i Sprint 2."
    />
  );
}

export function WBP_ModalFreq() {
  return (
    <StubModal
      eyebrow="Steg 5 av 5 · Veiviser"
      title="Ukentlig frekvens"
      body="Sett timer per akse og intensitet for hver uke i perioden. Caddie kan generere balanserte uker automatisk. Full frekvens-modal kommer i Sprint 2."
    />
  );
}

export function WBP_ModalTestPicker() {
  return (
    <StubModal
      eyebrow="Test-katalog"
      title="Velg test"
      body="Velg fra katalogen (CMJ, Sprint, Putting-konsistens, Wedge-spinn, m.fl.) og plasser i en uke. Full test-velger med slot-picker kommer i Sprint 2."
    />
  );
}
