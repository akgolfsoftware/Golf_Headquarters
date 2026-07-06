"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { WB } from "./theme";

export type WorkbenchHubTab = "tek" | "seson" | "maler" | "std" | "gantt" | "uke" | "okt";

const HUB_TABS: { key: WorkbenchHubTab; label: string; sepBefore?: boolean }[] = [
  { key: "tek", label: "Teknisk plan" },
  { key: "seson", label: "Sesongmål" },
  { key: "maler", label: "Maler" },
  { key: "std", label: "Standardøkter" },
  { key: "gantt", label: "Gantt (År)", sepBefore: true },
  { key: "uke", label: "Uke" },
  { key: "okt", label: "Økt" },
];

const HUB_TABS_COMPACT: Record<WorkbenchHubTab, string> = {
  tek: "Tek",
  seson: "Mål",
  maler: "Mal",
  std: "Std",
  gantt: "Gantt",
  uke: "Uke",
  okt: "Økt",
};

type HubTabRailProps = {
  tab: WorkbenchHubTab;
  onTab: (tab: WorkbenchHubTab) => void;
  /** Korte etiketter på smal mobil — alle 7 faner synlige uten å scrolle bort navigasjon. */
  compact?: boolean;
};

export function HubTabRail({ tab, onTab, compact = false }: HubTabRailProps): ReactElement {
  const railRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (compact) return;
    activeRef.current?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [tab, compact]);

  // Samme visuelle språk som VisningsVelger (.ak-visv i golfdata.css):
  // flate tekst-tabs med aktiv understrek — ikke pille-tabs.
  return (
    <div
      ref={railRef}
      role="tablist"
      aria-label="Workbench-faner"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "0 10px",
        height: 44,
        borderBottom: `1px solid ${WB.hairline}`,
        flexShrink: 0,
        overflowX: "auto",
      }}
      className="wb-scroll"
    >
      {HUB_TABS.map((t) => {
        const active = tab === t.key;
        return (
          <span key={t.key} style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            {t.sepBefore ? (
              <span
                style={{
                  width: 1,
                  height: 20,
                  background: WB.hairline,
                  margin: "0 6px",
                  flexShrink: 0,
                }}
              />
            ) : null}
            <button
              ref={active ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTab(t.key)}
              className={`ak-visv__tab${active ? " ak-visv__tab--aktiv" : ""}`}
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {compact ? HUB_TABS_COMPACT[t.key] : t.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}

/** Kartlegger hub-fane til zoom-nivå der det gjelder. */
export function hubTabToZoom(tab: WorkbenchHubTab): "arsplan" | "uke" | "dag" | null {
  if (tab === "gantt") return "arsplan";
  if (tab === "uke") return "uke";
  if (tab === "okt") return "dag";
  return null;
}

export function zoomToHubTab(level: string): WorkbenchHubTab {
  if (level === "arsplan" || level === "ar" || level === "maned") return "gantt";
  if (level === "uke") return "uke";
  if (level === "dag") return "okt";
  return "uke";
}

export function isPlanningHubTab(tab: WorkbenchHubTab): boolean {
  return tab === "tek" || tab === "seson" || tab === "maler" || tab === "std";
}