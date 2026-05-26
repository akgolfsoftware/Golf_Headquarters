"use client";

/**
 * Workbench Plan A — root shell.
 * Komponerer chrome + canvas + drawer + modaler.
 */

import "./workbench.css";
import { WBP_CanvasPeriode } from "./canvas-periode";
import {
  WBP_AIBar,
  WBP_Sidebar,
  WBP_Toast,
  WBP_Topbar,
  WBP_WizardBanner,
  WBP_Zoombar,
} from "./chrome";
import { WBP_ModalFacilities } from "./modal-facilities";
import {
  WBP_ModalCamp,
  WBP_ModalFreq,
  WBP_ModalPeriod,
  WBP_ModalTestPicker,
} from "./modal-stubs";
import { PlanProvider, usePlanContext } from "./plan-context";
import { WBP_SessionDetail } from "./session-detail";

function ZoomPlaceholder({ label }: { label: string }) {
  return (
    <div className="canvas-placeholder">
      <p className="cp-eyebrow">Zoom · {label}</p>
      <h2 className="cp-title">
        {label}-visning <em>kommer i Sprint 2</em>
      </h2>
      <p className="cp-sub">
        Bytt til <strong>Periode</strong> for å se den fungerende
        pyramide-baner-visningen.
      </p>
    </div>
  );
}

function CanvasRouter() {
  const { zoom } = usePlanContext();
  if (zoom === "ar") return <ZoomPlaceholder label="År" />;
  if (zoom === "maned") return <ZoomPlaceholder label="Måned" />;
  if (zoom === "uke") return <ZoomPlaceholder label="Uke" />;
  if (zoom === "dag") return <ZoomPlaceholder label="Dag" />;
  return <WBP_CanvasPeriode />;
}

function WorkbenchInner() {
  const { modal, wizardOpen } = usePlanContext();
  return (
    <div className="wbp">
      <div
        className="app"
        style={{
          gridTemplateRows: wizardOpen
            ? "var(--topbar-h) 36px var(--zoombar-h) var(--aibar-h) 1fr"
            : "var(--topbar-h) var(--zoombar-h) var(--aibar-h) 1fr",
        }}
      >
        <WBP_Topbar />
        {wizardOpen && <WBP_WizardBanner />}
        <WBP_Zoombar />
        <WBP_AIBar />
        <div className="body">
          <WBP_Sidebar />
          <CanvasRouter />
        </div>
      </div>

      {modal === "facilities" && <WBP_ModalFacilities />}
      {modal === "period" && <WBP_ModalPeriod />}
      {modal === "camp" && <WBP_ModalCamp />}
      {modal === "freq" && <WBP_ModalFreq />}
      {modal === "testpicker" && <WBP_ModalTestPicker />}

      <WBP_SessionDetail />
      <WBP_Toast />
    </div>
  );
}

export function WorkbenchPlanA() {
  return (
    <PlanProvider>
      <WorkbenchInner />
    </PlanProvider>
  );
}
