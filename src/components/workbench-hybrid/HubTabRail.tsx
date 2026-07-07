"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { FONT, WB } from "./theme";

export type WorkbenchHubTab = "tek" | "seson" | "maler" | "std" | "gantt" | "uke" | "dag" | "okt";

const HUB_TABS: { key: WorkbenchHubTab; label: string; sepBefore?: boolean }[] = [
  { key: "tek", label: "Teknisk plan" },
  { key: "seson", label: "Sesongmål" },
  { key: "maler", label: "Maler" },
  { key: "std", label: "Standardøkter" },
  { key: "gantt", label: "Gantt (År)", sepBefore: true },
  { key: "uke", label: "Uke" },
  { key: "dag", label: "Dag" },
  { key: "okt", label: "Økt" },
];

const HUB_TABS_COMPACT: Record<WorkbenchHubTab, string> = {
  tek: "Tek",
  seson: "Mål",
  maler: "Mal",
  std: "Std",
  gantt: "Gantt",
  uke: "Uke",
  dag: "Dag",
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

  return (
    <div
      ref={railRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "0 14px",
        height: 44,
        borderBottom: `1px solid ${WB.panelBorder}`,
        flexShrink: 0,
        overflowX: "auto",
      }}
      className="wb-scroll"
    >
      {HUB_TABS.map((t) => {
        const active = tab === t.key;
        return (
          <span key={t.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {t.sepBefore ? (
              <span
                style={{
                  width: 1,
                  height: 20,
                  background: WB.panelBorder,
                  margin: "0 6px",
                  flexShrink: 0,
                }}
              />
            ) : null}
            <button
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => onTab(t.key)}
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: 999,
                border: "none",
                background: active ? WB.lime : "transparent",
                color: active ? WB.limeDark : WB.muted,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
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
  if (tab === "dag") return "dag";
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