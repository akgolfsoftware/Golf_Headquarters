"use client";

/**
 * DrillListEditor — delt drill-liste + «legg til»-skjema.
 *
 * Brukes både i `SessionInspector` (drills lagres server-side per handling)
 * og `CreateSessionModal` (drills er et lokalt utkast til økten opprettes).
 * Komponenten selv er statsløs på drill-nivå — eier kaller inn listen og får
 * tilbake handlinger; ingen ny dnd-lib for reorder (anti-scope).
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Knapp } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { T } from "@/lib/v2/tokens";
import { AREA_LABEL, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { PyramidArea, TrainingArea } from "@/lib/domain/workbench/types";

const OMRADE_GRUPPER: { label: string; areas: TrainingArea[] }[] = [
  { label: "Full sving", areas: ["TEE", "INNSPILL_200", "INNSPILL_150", "INNSPILL_100", "INNSPILL_50"] },
  { label: "Nærspill", areas: ["CHIP", "PITCH", "LOB", "BUNKER"] },
  { label: "Putt", areas: ["PUTT_0_3", "PUTT_3_5", "PUTT_5_10", "PUTT_10_25", "PUTT_25_40", "PUTT_40_PLUSS"] },
  { label: "Fysisk", areas: ["STYRKE", "KONDISJON", "BEVEGELIGHET"] },
  { label: "Bane", areas: ["BANE"] },
];

const PYRAMIDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export type DrillListItem = {
  id: string;
  title: string;
  durationMinutes: number;
  akFormel: { pyramid: PyramidArea; area: TrainingArea; label: string };
};

export type LeggTilDrillVerdier = {
  title: string;
  durationMinutes: number;
  pyramid: PyramidArea;
  area: TrainingArea;
};

function drillErKomplett(d: DrillListItem): boolean {
  return d.title.trim() !== "" && d.durationMinutes > 0 && Boolean(d.akFormel?.label);
}

type Props = {
  drills: DrillListItem[];
  disabled?: boolean;
  /** Forhåndsvalgt pyramide i «legg til»-skjemaet, f.eks. øktens egen. */
  defaultPyramid?: PyramidArea;
  onLeggTil: (verdier: LeggTilDrillVerdier) => void;
  onFlytt: (drillId: string, retning: -1 | 1) => void;
  onFjern: (drillId: string) => void;
};

export function DrillListEditor({
  drills,
  disabled,
  defaultPyramid = "TEK",
  onLeggTil,
  onFlytt,
  onFjern,
}: Props) {
  const [visSkjema, setVisSkjema] = useState(false);
  const [tittel, setTittel] = useState("");
  const [pyramid, setPyramid] = useState<PyramidArea>(defaultPyramid);
  const [omrade, setOmrade] = useState<TrainingArea>("TEE");
  const [varighet, setVarighet] = useState(15);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {drills.length === 0 ? (
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>
          {UI.emptyDrills}
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
          {drills.map((d, i) => {
            const komplett = drillErKomplett(d);
            return (
              <li
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "7px 9px",
                  borderRadius: T.rTag,
                  border: `1px solid ${T.border}`,
                  background: T.panel2,
                  minWidth: 0,
                }}
              >
                <div style={{ display: "grid", gap: 2, minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontFamily: T.ui,
                      fontSize: 12.5,
                      color: T.fg,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.title || UI.drillTitlePlaceholder}
                  </span>
                  {komplett ? (
                    <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
                      {PYRAMID_LABEL[d.akFormel.pyramid]} · {AREA_LABEL[d.akFormel.area]} ·{" "}
                      {d.durationMinutes} min
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: T.mono,
                        fontSize: 10.5,
                        color: T.down,
                      }}
                    >
                      <Icon name="triangle-alert" size={11} />
                      {UI.incompleteDrill}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 2, flex: "none" }}>
                  <IkonKnapp
                    icon="arrow-up"
                    title={UI.moveDrillUp}
                    disabled={disabled || i === 0}
                    onClick={() => onFlytt(d.id, -1)}
                  />
                  <IkonKnapp
                    icon="arrow-down"
                    title={UI.moveDrillDown}
                    disabled={disabled || i === drills.length - 1}
                    onClick={() => onFlytt(d.id, 1)}
                  />
                  <IkonKnapp
                    icon="x"
                    title={UI.removeDrillLabel}
                    disabled={disabled}
                    onClick={() => onFjern(d.id)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {visSkjema ? (
        <div
          style={{
            display: "grid",
            gap: 8,
            padding: "9px 11px",
            borderRadius: T.rTag,
            border: `1px dashed ${T.border}`,
          }}
        >
          <Felt label={UI.drillTitle}>
            <Input
              value={tittel}
              onChange={(e) => setTittel(e.target.value)}
              placeholder={UI.drillTitlePlaceholder}
              autoFocus
            />
          </Felt>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Felt label={UI.drillPyramid}>
              <Select value={pyramid} onChange={(e) => setPyramid(e.target.value as PyramidArea)}>
                {PYRAMIDER.map((p) => (
                  <option key={p} value={p}>
                    {PYRAMID_LABEL[p]}
                  </option>
                ))}
              </Select>
            </Felt>
            <Felt label={UI.drillArea}>
              <Select value={omrade} onChange={(e) => setOmrade(e.target.value as TrainingArea)}>
                {OMRADE_GRUPPER.map((gruppe) => (
                  <optgroup key={gruppe.label} label={gruppe.label}>
                    {gruppe.areas.map((a) => (
                      <option key={a} value={a}>
                        {AREA_LABEL[a]}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Felt>
          </div>
          <Felt label={UI.drillDuration}>
            <Input
              type="number"
              min={1}
              max={600}
              value={varighet}
              onChange={(e) => setVarighet(Number(e.target.value))}
            />
          </Felt>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Knapp
              ghost
              onClick={() => {
                setVisSkjema(false);
                setTittel("");
              }}
            >
              {UI.cancel}
            </Knapp>
            <Knapp
              disabled={disabled || tittel.trim() === "" || !(varighet > 0)}
              onClick={() => {
                onLeggTil({
                  title: tittel.trim(),
                  durationMinutes: varighet,
                  pyramid,
                  area: omrade,
                });
                setVisSkjema(false);
                setTittel("");
              }}
            >
              {UI.save}
            </Knapp>
          </div>
        </div>
      ) : (
        <Knapp ghost icon="plus" disabled={disabled} onClick={() => setVisSkjema(true)}>
          {UI.addDrill}
        </Knapp>
      )}
    </div>
  );
}

function IkonKnapp({
  icon,
  title,
  disabled,
  onClick,
}: {
  icon: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: T.rTag,
        border: `1px solid ${T.border}`,
        background: "transparent",
        color: T.mut,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon name={icon} size={11} />
    </button>
  );
}

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 5, minWidth: 0 }}>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: T.mut,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
