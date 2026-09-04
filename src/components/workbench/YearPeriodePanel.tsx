"use client";

/**
 * Periodebånd + valgt-periode-panel — WB-06 Arsplan 3 skall.dc.html.
 *
 * Ren leseflate (C1, jf. WorkbenchLeseflate.tsx sin egen kontrakt: "Måned og
 * år er leseflater — ingen redigering der"). Fasitens "Ny periode"-knapp og
 * klikk-for-å-endre-start/slutt er derfor IKKE bygget her — periodene
 * redigeres i dag via spillerens egen årsplan-canvas (WorkbenchAarsplan.tsx,
 * samme PeriodBlock-data). Denne komponenten leser periodene, skriver aldri.
 *
 * Ingen farge per periode (fasitens endringsnotat: "ingen farge per
 * periode") — aktiv periode skiller seg kun med fylt flate/sterkere kant.
 */

import { TL } from "@/lib/v2/train-lock";
import { LPHASE_LABEL, PYRAMIDE_REKKEFOLGE, PYRAMIDE_LABEL } from "@/lib/labels/taxonomy";
import type { LPhase } from "@/generated/prisma/client";
import { UI, formatHours } from "@/lib/domain/workbench/labels";
import type { YearPeriodBand } from "@/lib/domain/workbench/types";

function datoKort(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

function datoLang(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
}

/** Kort variant for det smale periodebåndet — LPHASE_LABEL uten "-periode"-suffikset. */
const BAAND_ETIKETT: Record<LPhase, string> = {
  GRUNN: "Grunn",
  SPESIAL: "Spesialisering",
  TURNERING: "Turnering",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};

function ukerIPeriode(startIso: string, endIso: string): number {
  const [sy, sm, sd] = startIso.split("-").map(Number);
  const [ey, em, ed] = endIso.split("-").map(Number);
  const start = Date.UTC(sy, sm - 1, sd);
  const end = Date.UTC(ey, em - 1, ed);
  return Math.max(1, Math.round((end - start) / (7 * 86_400_000)));
}

/** Periodebåndet øverst — hairline-segmenter, ett per periode.
 * Mobil (`fastBredde`): proporsjonal `flex-grow` klemte den minste perioden
 * ned mot 0 på 390px når nabo-pillene traff sin minstebredde samtidig —
 * bytter derfor til en horisontalt scrollbar rad med fast bredde per pille. */
export function YearPeriodeBaand({
  periods,
  valgtId,
  onVelg,
  fastBredde = false,
}: {
  periods: YearPeriodBand[];
  valgtId: string | null;
  onVelg: (id: string) => void;
  fastBredde?: boolean;
}) {
  if (periods.length === 0) return null;
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          {UI.periodsTitle}
        </span>
        <span style={{ fontSize: 11, color: TL.mute }}>{UI.periodsHint}</span>
      </div>
      <div style={{ display: "flex", gap: 3, height: 34, overflowX: "auto" }}>
        {periods.map((p) => {
          const valgt = p.id === valgtId;
          const aktiv = p.aktiv;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onVelg(p.id)}
              className="v2-press v2-focus"
              style={
                fastBredde
                  ? {
                      appearance: "none",
                      cursor: "pointer",
                      flex: "0 0 auto",
                      width: 116,
                      borderRadius: 7,
                      border: "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      padding: "0 11px",
                      background: aktiv ? TL.elev : "transparent",
                      boxShadow: valgt ? `inset 0 0 0 1px ${TL.text}` : `inset 0 0 0 1px ${TL.hair}`,
                    }
                  : {
                      appearance: "none",
                      cursor: "pointer",
                      flex: `${Math.max(p.widthPct, 4)} 0 0`,
                      minWidth: 56,
                      borderRadius: 7,
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 11px",
                      justifyContent: "space-between",
                      background: aktiv ? TL.elev : "transparent",
                      boxShadow: valgt ? `inset 0 0 0 1px ${TL.text}` : `inset 0 0 0 1px ${TL.hair}`,
                    }
              }
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: aktiv ? TL.text : TL.mute,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: fastBredde ? "100%" : undefined,
                }}
              >
                {BAAND_ETIKETT[p.type]}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: TL.mute,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                  marginLeft: fastBredde ? 0 : 6,
                  marginTop: fastBredde ? 2 : 0,
                }}
              >
                {datoKort(p.startDate)}–{datoKort(p.endDate)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 360 px høyrepanel — valgt periodes navn, balanse og turneringer. */
export function YearPeriodePanel({
  periods,
  valgtId,
}: {
  periods: YearPeriodBand[];
  valgtId: string | null;
}) {
  const valgt = periods.find((p) => p.id === valgtId) ?? null;
  if (!valgt) return null;

  const sumTimer = Object.values(valgt.balanseTimer).reduce((s, t) => s + t, 0);
  const maksTimer = Math.max(1, ...Object.values(valgt.balanseTimer));

  return (
    <div
      style={{
        width: 360,
        flexShrink: 0,
        borderLeft: `1px solid ${TL.hair}`,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          {UI.selectedPeriodTitle}
        </div>
        <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {LPHASE_LABEL[valgt.type]}
        </div>
        <div style={{ marginTop: 3, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {datoLang(valgt.startDate)}–{datoLang(valgt.endDate)} ·{" "}
          {UI.periodWeeks(ukerIPeriode(valgt.startDate, valgt.endDate))} · {formatHours(sumTimer * 60)} t
        </div>
        {valgt.focus && <div style={{ marginTop: 6, fontSize: 13, color: TL.text }}>{valgt.focus}</div>}
      </div>

      <div style={{ background: TL.elev, borderRadius: 16, padding: "14px 16px" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          {UI.periodBalanceTitle}
        </div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
          {PYRAMIDE_REKKEFOLGE.map((omraade) => {
            const timer = valgt.balanseTimer[omraade];
            const pct = Math.round((timer / maksTimer) * 100);
            return (
              <div key={omraade} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 46,
                    fontSize: 10,
                    fontWeight: 600,
                    color: timer > 0 ? TL.text : TL.mute,
                  }}
                >
                  {PYRAMIDE_LABEL[omraade]}
                </span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: TL.dim }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: 8,
                      borderRadius: 4,
                      background: timer > 0 ? TL.text : TL.dim,
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 40,
                    textAlign: "right",
                    fontSize: 11,
                    color: timer > 0 ? TL.text : TL.mute,
                    fontWeight: timer > 0 ? 600 : 400,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatHours(timer * 60)} t
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          {UI.periodTournamentsTitle}
        </div>
        <div style={{ marginTop: 4 }}>
          {valgt.turneringer.length === 0 ? (
            <div style={{ padding: "9px 0", fontSize: 13, color: TL.mute }}>{UI.noPeriodTournaments}</div>
          ) : (
            valgt.turneringer.map((t, i) => (
              <div
                key={`${t.navn}-${t.dato}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "9px 0",
                  borderTop: `1px solid ${TL.hair}`,
                  borderBottom: i === valgt.turneringer.length - 1 ? `1px solid ${TL.hair}` : undefined,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t.navn}</span>
                <span style={{ fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  {datoKort(t.dato)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
