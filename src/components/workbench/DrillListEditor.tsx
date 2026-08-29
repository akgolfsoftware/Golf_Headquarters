"use client";

/**
 * DrillListEditor — delt drill-liste + «legg til»-skjema (PX-2).
 *
 * Fasit: designsystem/train-lock/A-03b Ny drill tom.dc.html
 * Fasit: designsystem/train-lock/A-03c Ny drill fylt.dc.html
 * Fasit: designsystem/train-lock/A-02 Mac Okt Naerspill.dc.html (Øvelser-listen)
 *
 * Fasit-stil: rader 15/600 + meta 13 mute tabular med border-bottom hairline
 * (aldri kort-ramme), «+ Legg til» som 13/600 mute tekst. Skjemaet: caps-
 * etiketter 11/600/0.08em, felt 44 px #1C1C1E radius 12, pyramide som
 * pille-rad 32 px, «Lagre drill» hvit pille — disabled = dim (#2C2C2E/mute,
 * A-03b), ufullstendig drill = caps «Mangler» i mute (aldri rødt).
 *
 * Brukes i `SessionInspector` (drills lagres server-side per handling).
 * Statsløs på drill-nivå; ingen ny dnd-lib for reorder (anti-scope).
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";

import { AREA_LABEL, UI } from "@/lib/domain/workbench/labels";
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
  description?: string;
};

export type LeggTilDrillVerdier = {
  title: string;
  durationMinutes: number;
  pyramid: PyramidArea;
  area: TrainingArea;
  description?: string;
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
  const [beskrivelse, setBeskrivelse] = useState("");

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {drills.length === 0 ? (
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: 0 }}>
          {UI.emptyDrills}
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {drills.map((d, i) => {
            const komplett = drillErKomplett(d);
            return (
              <li
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "9px 0",
                  borderBottom: `1px solid ${TL.hair}`,
                  minWidth: 0,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: TL.font.sans,
                      fontSize: 15,
                      fontWeight: 600,
                      color: TL.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.title || UI.drillTitlePlaceholder}
                  </span>
                  {d.description ? (
                    <span
                      style={{
                        display: "block",
                        fontFamily: TL.font.sans,
                        fontSize: 11,
                        color: TL.mute,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.description}
                    </span>
                  ) : null}
                </div>
                {/* A-03b: ufullstendig = caps «Mangler» i mute — aldri rødt. */}
                {komplett ? (
                  <span
                    style={{
                      fontFamily: TL.font.sans,
                      fontSize: 13,
                      color: TL.mute,
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                    }}
                  >
                    {d.durationMinutes} min
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: TL.font.sans,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: TL.mute,
                      flexShrink: 0,
                    }}
                  >
                    {UI.drillMissingCaps}
                  </span>
                )}
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
        <div style={{ display: "grid", gap: 14 }}>
          <Felt label={UI.drillTitle}>
            <Input
              value={tittel}
              onChange={(e) => setTittel(e.target.value)}
              placeholder={UI.drillTitlePlaceholder}
              autoFocus
            />
          </Felt>
          {/* A-03b/A-03c: pyramide som pille-rad 32 px, aktiv = hvit pille. */}
          <Felt label={UI.drillPyramid}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PYRAMIDER.map((p) => {
                const on = pyramid === p;
                return (
                  <button
                    key={p}
                    type="button"
                    className="v2-press v2-focus"
                    aria-pressed={on}
                    onClick={() => setPyramid(p)}
                    style={{
                      appearance: "none",
                      height: 32,
                      borderRadius: 9999,
                      border: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0 14px",
                      fontFamily: TL.font.sans,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      background: on ? TL.fill : "transparent",
                      color: on ? TL.onFill : TL.mute,
                      boxShadow: on ? "none" : `inset 0 0 0 1px ${TL.hair}`,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </Felt>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
            <Felt label={UI.drillDuration}>
              <Input
                type="number"
                min={1}
                max={600}
                value={varighet}
                onChange={(e) => setVarighet(Number(e.target.value))}
              />
            </Felt>
          </div>
          <Felt label={UI.drillDescription}>
            <Textarea
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              placeholder={UI.drillDescriptionPlaceholder}
              rows={2}
            />
          </Felt>
          {/* A-03b: footer = Avbryt som ren tekst + «Lagre drill»-pille.
              Disabled = dim flate + mute tekst — aldri hvit. */}
          <div style={{ display: "flex", gap: 16, justifyContent: "flex-end", alignItems: "center" }}>
            <button
              type="button"
              className="v2-focus"
              onClick={() => {
                setVisSkjema(false);
                setTittel("");
                setBeskrivelse("");
              }}
              style={{
                appearance: "none",
                background: "transparent",
                border: "none",
                padding: 0,
                fontFamily: TL.font.sans,
                fontSize: 15,
                fontWeight: 600,
                color: TL.mute,
                cursor: "pointer",
              }}
            >
              {UI.cancel}
            </button>
            {(() => {
              const ugyldig = disabled || tittel.trim() === "" || !(varighet > 0);
              return (
                <button
                  type="button"
                  className="v2-press v2-focus"
                  disabled={ugyldig}
                  onClick={() => {
                    onLeggTil({
                      title: tittel.trim(),
                      durationMinutes: varighet,
                      pyramid,
                      area: omrade,
                      description: beskrivelse.trim() || undefined,
                    });
                    setVisSkjema(false);
                    setTittel("");
                    setBeskrivelse("");
                  }}
                  style={{
                    appearance: "none",
                    height: 44,
                    borderRadius: 9999,
                    border: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 26px",
                    fontFamily: TL.font.sans,
                    fontSize: 16,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    cursor: ugyldig ? "default" : "pointer",
                    background: ugyldig ? TL.dim : TL.fill,
                    color: ugyldig ? TL.mute : TL.onFill,
                  }}
                >
                  {UI.drillSave}
                </button>
              );
            })()}
          </div>
        </div>
      ) : (
        /* A-02: «+ Legg til» som 13/600 mute tekst. */
        <button
          type="button"
          className="v2-focus"
          disabled={disabled}
          onClick={() => setVisSkjema(true)}
          style={{
            appearance: "none",
            background: "transparent",
            border: "none",
            padding: 0,
            textAlign: "left",
            fontFamily: TL.font.sans,
            fontSize: 13,
            fontWeight: 600,
            color: TL.mute,
            cursor: "pointer",
          }}
        >
          {UI.addDrillShort}
        </button>
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
        borderRadius: TL.radius.row,
        border: `1px solid ${TL.hair}`,
        background: "transparent",
        color: TL.mute,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon name={icon} size={11} />
    </button>
  );
}

/* Fasit A-03b: caps-etikett 11/600/0.08em over feltet. */
function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
      <span
        style={{
          fontFamily: TL.font.sans,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
