"use client";

/**
 * PlanContext — delt state for Workbench Plan A.
 * Holder zoom-nivå, aktivt-økt-fokus, modal-state, fasiliteter, wizard-banner.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type {
  ModalKey,
  WBP_Facilities,
  WBP_Session,
  Zoom,
} from "./types";
import { WBP_INITIAL_FAC } from "./types";

export type PlanContextValue = {
  modal: ModalKey;
  setModal: (m: ModalKey) => void;
  zoom: Zoom;
  setZoom: (z: Zoom) => void;
  activeSession: WBP_Session | null;
  setActiveSession: (s: WBP_Session | null) => void;
  facilities: WBP_Facilities;
  setFacilities: (f: WBP_Facilities) => void;
  wizardOpen: boolean;
  setWizardOpen: (b: boolean) => void;
  toast: { text: string } | null;
  showToast: (text: string) => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalKey>(null);
  const [zoom, setZoom] = useState<Zoom>("periode");
  const [activeSession, setActiveSession] = useState<WBP_Session | null>(null);
  const [facilities, setFacilities] = useState<WBP_Facilities>(WBP_INITIAL_FAC);
  const [wizardOpen, setWizardOpen] = useState(true);
  const [toast, setToast] = useState<{ text: string } | null>(null);

  const showToast = useCallback((text: string) => {
    setToast({ text });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Esc lukker modal/drawer
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveSession(null);
        setModal(null);
      }
      // ⌘+/− zoom
      if ((e.metaKey || e.ctrlKey) && e.key === "=") {
        e.preventDefault();
        setZoom((z) =>
          z === "ar"
            ? "periode"
            : z === "periode"
              ? "maned"
              : z === "maned"
                ? "uke"
                : z === "uke"
                  ? "dag"
                  : "dag",
        );
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault();
        setZoom((z) =>
          z === "dag"
            ? "uke"
            : z === "uke"
              ? "maned"
              : z === "maned"
                ? "periode"
                : z === "periode"
                  ? "ar"
                  : "ar",
        );
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <PlanContext.Provider
      value={{
        modal,
        setModal,
        zoom,
        setZoom,
        activeSession,
        setActiveSession,
        facilities,
        setFacilities,
        wizardOpen,
        setWizardOpen,
        toast,
        showToast,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlanContext(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlanContext må brukes inni <PlanProvider>");
  return ctx;
}
