"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Filterbar for Analyse → Trening (2026-07-27).
 *
 * To rader, i den rekkefølgen spilleren tenker:
 *   1. NÅR — År · Periode · Måned · Uke · Dag  (alltid synlig)
 *   2. HVA — kilde, akse, miljø, belastning    (åpnes ved behov)
 *
 * Rad 2 er skjult bak «Flere filtre» fordi de fleste besøk bare vil se
 * «hvordan ligger jeg an denne måneden». Antall aktive filtre står på knappen,
 * så det aldri er skjult at et filter er på.
 */

import { useState } from "react";
import { Icon, FilterChips, PillTabs } from "@/components/v2";
import { PERIODE_VALG, PERIODE_LABEL, type PeriodeValg } from "@/lib/portal-analyse/periode-vindu";
import { MILJO_GRUPPER, MILJO_GRUPPE_LABEL, type MiljoGruppe } from "@/lib/taxonomy";
import type { TreningsKilde } from "@/lib/portal-analyse/trenings-historikk";

export type AnalyseFiltre = {
  periode: PeriodeValg;
  kilde: TreningsKilde | "ALLE";
  akser: string[];
  miljoGrupper: MiljoGruppe[];
  csNivaaer: string[];
};

export const TOMME_FILTRE: AnalyseFiltre = {
  periode: "maned",
  kilde: "ALLE",
  akser: [],
  miljoGrupper: [],
  csNivaaer: [],
};

const KILDER: { id: TreningsKilde | "ALLE"; l: string }[] = [
  { id: "ALLE", l: "Alt" },
  { id: "GOLF", l: "Golf" },
  { id: "FYS", l: "Fysisk" },
];

const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export function AnalyseFilterBar({
  filtre,
  onEndre,
  vinduLabel,
  fallbackVarsel,
  csNivaaer = [],
}: {
  filtre: AnalyseFiltre;
  onEndre: (neste: AnalyseFiltre) => void;
  /** Hva vinduet dekker, i klartekst: «Uke 31», «August 2026» … */
  vinduLabel: string;
  /** Satt når «Periode» ble valgt uten aktiv periode i årsplanen. */
  fallbackVarsel?: boolean;
  /** CS-nivåer som faktisk finnes i dataene — tomme lister vises ikke. */
  csNivaaer?: string[];
}) {
  const [apen, setApen] = useState(false);

  const antallAktive =
    (filtre.kilde !== "ALLE" ? 1 : 0) +
    filtre.akser.length +
    filtre.miljoGrupper.length +
    filtre.csNivaaer.length;

  const veksle = <K extends keyof AnalyseFiltre>(
    key: K,
    liste: string[],
    verdi: string,
  ) => {
    const neste = liste.includes(verdi)
      ? liste.filter((x) => x !== verdi)
      : [...liste, verdi];
    onEndre({ ...filtre, [key]: neste } as AnalyseFiltre);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* NÅR */}
      <PillTabs
        tabs={PERIODE_VALG.map((v) => ({ id: v, l: PERIODE_LABEL[v] }))}
        value={filtre.periode}
        onChange={(id) => onEndre({ ...filtre, periode: id as PeriodeValg })}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: TL.font.mono,
            fontSize: 11,
            color: TL.mute,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {vinduLabel}
        </span>
        {fallbackVarsel && (
          <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute }}>
            Ingen periode i årsplanen — viser måneden
          </span>
        )}
        <button
          type="button"
          onClick={() => setApen(!apen)}
          className="v2-press v2-focus"
          style={{
            appearance: "none",
            cursor: "pointer",
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            height: 28,
            padding: "0 11px",
            borderRadius: 9999,
            background: antallAktive > 0 ? TL.fill : TL.dim,
            border: `1px solid ${antallAktive > 0 ? "transparent" : TL.hair}`,
            color: antallAktive > 0 ? TL.onFill : TL.mute,
            fontFamily: TL.font.sans,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Icon name={apen ? "chevron-up" : "sliders-horizontal"} size={12} />
          {antallAktive > 0 ? `${antallAktive} filtre` : "Flere filtre"}
        </button>
        {antallAktive > 0 && (
          <button
            type="button"
            onClick={() => onEndre({ ...TOMME_FILTRE, periode: filtre.periode })}
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              background: "transparent",
              border: 0,
              padding: 0,
              color: TL.mute,
              fontFamily: TL.font.mono,
              fontSize: 10.5,
            }}
          >
            Nullstill
          </button>
        )}
      </div>

      {/* HVA */}
      {apen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: 12,
            borderRadius: 12,
            background: TL.dock,
            border: `1px solid ${TL.hair}`,
          }}
        >
          <Gruppe label="Type trening">
            <PillTabs
              tabs={KILDER}
              value={filtre.kilde}
              onChange={(id) =>
                onEndre({ ...filtre, kilde: id as TreningsKilde | "ALLE" })
              }
            />
          </Gruppe>

          <Gruppe label="Område i pyramiden">
            <FilterChips
              items={AKSER}
              active={filtre.akser}
              axis
              onToggle={(x) => veksle("akser", filtre.akser, x)}
            />
          </Gruppe>

          <Gruppe label="Hvor">
            <FilterChips
              items={MILJO_GRUPPER.map((g) => MILJO_GRUPPE_LABEL[g])}
              active={filtre.miljoGrupper.map((g) => MILJO_GRUPPE_LABEL[g])}
              onToggle={(label) => {
                const gruppe = MILJO_GRUPPER.find(
                  (g) => MILJO_GRUPPE_LABEL[g] === label,
                );
                if (gruppe) veksle("miljoGrupper", filtre.miljoGrupper, gruppe);
              }}
            />
          </Gruppe>

          {csNivaaer.length > 0 && (
            <Gruppe label="Belastning">
              <FilterChips
                items={csNivaaer}
                active={filtre.csNivaaer}
                onToggle={(x) => veksle("csNivaaer", filtre.csNivaaer, x)}
              />
            </Gruppe>
          )}
        </div>
      )}
    </div>
  );
}

function Gruppe({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: TL.font.mono,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
