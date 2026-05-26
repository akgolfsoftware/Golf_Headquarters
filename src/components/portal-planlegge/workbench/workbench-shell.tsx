"use client";

/**
 * Workbench Plan A — root shell (Sprint 2).
 * Komponerer chrome + canvas-router + inspector + drawer + modaler.
 */

import "./workbench.css";
import "./workbench-extra.css";
import { WBP_CanvasPeriode } from "./canvas-periode";
import {
  WBP_AIBar,
  WBP_Sidebar,
  WBP_Toast,
  WBP_Topbar,
  WBP_WizardBanner,
  WBP_Zoombar,
} from "./chrome";
import { WBP_Inspector } from "./inspector";
import { WBP_ModalFacilities } from "./modal-facilities";
import {
  WBP_ModalCamp,
  WBP_ModalFreq,
  WBP_ModalPeriod,
  WBP_ModalTestPicker,
} from "./modals";
import { PlanProvider, usePlanContext } from "./plan-context";
import { WBP_SessionDetail } from "./session-detail";
import {
  WBP_CanvasDay,
  WBP_CanvasMonth,
  WBP_CanvasWeek,
  WBP_CanvasYear,
} from "./zoom-views";

function CanvasRouter() {
  const { zoom } = usePlanContext();
  if (zoom === "ar") return <WBP_CanvasYear />;
  if (zoom === "maned") return <WBP_CanvasMonth />;
  if (zoom === "uke") return <WBP_CanvasWeek />;
  if (zoom === "dag") return <WBP_CanvasDay />;
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
          <WBP_Inspector />
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

import type { WBP_Facilities, WBP_Session } from "./types";

export function WorkbenchPlanA({
  initialSessions,
  initialFacilities,
}: {
  initialSessions?: WBP_Session[];
  initialFacilities?: WBP_Facilities;
} = {}) {
  return (
    <PlanProvider
      initialSessions={initialSessions}
      initialFacilities={initialFacilities}
    >
      <WorkbenchInner />
    </PlanProvider>
  );
}
