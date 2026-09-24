"use client";

/**
 * DrillListEditor — delt drill-liste + «legg til»-skjema (PX-2).
 *
 * Fasit: designsystem/train-lock/A-03b Ny drill tom.dc.html
 * Fasit: designsystem/train-lock/A-03c Ny drill fylt.dc.html
 * Fasit: designsystem/train-lock/A-02 Mac Okt Naerspill.dc.html (Øvelser-listen)
 * Avvik:
 *   - I valgt Workbench 20.09 følger felt lys flate og radius 2 fra workbench-selected.css.
 *   - Øvelseshandlingene brytes til ny linje i detaljpanelet på 340 px; eldre mørke referanser er historiske.
 *   - Lagring/fjerning og panelbredde er prøvd innlogget lokalt; ingen egen kalibrert riggrad for denne tilstanden.
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
import type { Belastning, Motorikk, Press, PyramidArea, TrainingArea } from "@/lib/domain/workbench/types";
import {
  DIMENSJON_LABEL,
  MOTORIKK_LABEL,
  PRESS_LABEL,
  type OmraadeKode,
} from "@/lib/domain/ak-formel-v2";
import {
  dimensjonerFor,
  relevansFor,
} from "@/lib/domain/omrade-relevans";

function toOmraadeKode(area: TrainingArea): OmraadeKode {
  if (area === "TEE") return "TEE_TOTAL";
  return area as OmraadeKode;
}

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
  akFormel: {
    pyramid: PyramidArea;
    area: TrainingArea;
    motorikk?: Motorikk;
    belastning?: Belastning;
    press?: Press;
    label: string;
  };
  description?: string;
  techniqueFocus?: string;
};

export type LeggTilDrillVerdier = {
  title: string;
  durationMinutes: number;
  pyramid: PyramidArea;
  area: TrainingArea;
  description?: string;
  motorikk?: Motorikk;
  belastning?: Belastning;
  press?: Press;
  techniqueFocus?: string;
  mengde?: string;
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
  const [motorikk, setMotorikk] = useState<Motorikk>("LAV_HAST");
  const [dimensjon, setDimensjon] = useState<string>("");
  const [belastning, setBelastning] = useState<Belastning>("TRENINGSOMRADE");
  const [press, setPress] = useState<Press>("ALENE");
  const [mengde, setMengde] = useState("");

  const omraadeKode = toOmraadeKode(omrade);
  const relevans = relevansFor(omraadeKode);
  const tilgjengeligeDimensjoner = dimensjonerFor(omraadeKode);

  function nullstill() {
    setVisSkjema(false);
    setTittel("");
    setBeskrivelse("");
    setDimensjon("");
    setMengde("");
  }

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
                className="wb-drill-row"
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
                  {d.akFormel?.label ? (
                    <span
                      style={{
                        display: "block",
                        fontFamily: TL.font.sans,
                        fontSize: 11,
                        color: TL.mute,
                        marginTop: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.akFormel.label}
                      {d.techniqueFocus ? ` · ${d.techniqueFocus}` : ""}
                    </span>
                  ) : null}
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
                <div className="wb-drill-actions" style={{ display: "flex", gap: 2, flex: "none" }}>
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
          {relevans.motorikk && (
            <Felt label="Motorikk (læringssteg)">
              <div style={{ display: "flex", gap: 6 }}>
                {(["UTEN_BALL", "LAV_HAST", "AUTO"] as const).map((m) => {
                  const on = motorikk === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      className="v2-press v2-focus"
                      aria-pressed={on}
                      onClick={() => setMotorikk(m)}
                      style={{
                        appearance: "none",
                        height: 32,
                        borderRadius: 9999,
                        border: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0 12px",
                        fontFamily: TL.font.sans,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: on ? TL.fill : "transparent",
                        color: on ? TL.onFill : TL.mute,
                        boxShadow: on ? "none" : `inset 0 0 0 1px ${TL.hair}`,
                      }}
                    >
                      {MOTORIKK_LABEL[m]}
                    </button>
                  );
                })}
              </div>
            </Felt>
          )}

          {relevans.dimensjon && tilgjengeligeDimensjoner.length > 0 && (
            <Felt label="Teknisk fokus (dimensjon)">
              <Select value={dimensjon} onChange={(e) => setDimensjon(e.target.value)}>
                <option value="">Ingen valgt</option>
                {tilgjengeligeDimensjoner.map((d) => (
                  <option key={d} value={d}>
                    {DIMENSJON_LABEL[d]}
                  </option>
                ))}
              </Select>
            </Felt>
          )}

          {(relevans.belastning || relevans.press) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {relevans.belastning && (
                <Felt label="Belastning (miljø)">
                  <Select value={belastning} onChange={(e) => setBelastning(e.target.value as Belastning)}>
                    {(["INNENDORS", "TRENINGSOMRADE", "BANE", "KONKURRANSE"] as const).map((b) => (
                      <option key={b} value={b}>
                        {b === "INNENDORS" ? "Innendørs" : b === "TRENINGSOMRADE" ? "Treningsområde" : b === "BANE" ? "Bane" : "Konkurranse"}
                      </option>
                    ))}
                  </Select>
                </Felt>
              )}
              {relevans.press && (
                <Felt label="Press">
                  <Select value={press} onChange={(e) => setPress(e.target.value as Press)}>
                    {(["ALENE", "OBSERVERT", "KONKURRANSE", "TURNERING"] as const).map((pr) => (
                      <option key={pr} value={pr}>
                        {PRESS_LABEL[pr]}
                      </option>
                    ))}
                  </Select>
                </Felt>
              )}
            </div>
          )}

          <Felt label="Mengde">
            <Input
              value={mengde}
              onChange={(e) => setMengde(e.target.value)}
              placeholder={
                omraadeKode.startsWith("PUTT")
                  ? "F.eks. 20 putter"
                  : omraadeKode === "BANE"
                  ? "F.eks. 9 hull"
                  : omraadeKode === "STYRKE"
                  ? "F.eks. 4 serier × 6 reps"
                  : omraadeKode === "KONDISJON" || omraadeKode === "BEVEGELIGHET"
                  ? "F.eks. 20 min"
                  : "F.eks. 30 slag"
              }
            />
          </Felt>

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
              onClick={nullstill}
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
                      motorikk: relevans.motorikk ? motorikk : undefined,
                      belastning: relevans.belastning ? belastning : undefined,
                      press: relevans.press ? press : undefined,
                      techniqueFocus: relevans.dimensjon && dimensjon ? dimensjon : undefined,
                      mengde: mengde.trim() || undefined,
                    });
                    nullstill();
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
