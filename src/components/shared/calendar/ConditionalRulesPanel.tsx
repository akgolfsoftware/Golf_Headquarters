"use client";

// ConditionalRulesPanel — viser 6 regeltyper med toggles og parametere.
//
// Reglene styrer hvordan session-generator skal oppføre seg, f.eks. "redusér
// volum hvis spiller har fått skadevurdering". Hver type har sitt eget mini-
// skjema for parametere.

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type RegelType =
  | "VOLUM_REDUKSJON_VED_SKADE"
  | "PRIORITER_TURNERINGSFORBEREDELSE"
  | "AUTO_HVILEDAG"
  | "MAX_OKTER_PER_DAG"
  | "MIN_HVILE_MELLOM_OKTER"
  | "TVUNGEN_AREA_FORDELING";

export type ConditionalRule = {
  id: string;
  type: RegelType;
  navn: string;
  parametere: Record<string, unknown>;
  aktiv: boolean;
  prioritet: number;
};

type Props = {
  regler: ConditionalRule[];
  onChange: (regler: ConditionalRule[]) => void;
};

const REGEL_INFO: Record<RegelType, { navn: string; beskrivelse: string }> = {
  VOLUM_REDUKSJON_VED_SKADE: {
    navn: "Volum-reduksjon ved skade",
    beskrivelse: "Reduser ukentlig volum med X% når spiller har aktiv skade-flagg",
  },
  PRIORITER_TURNERINGSFORBEREDELSE: {
    navn: "Prioriter turneringsforberedelse",
    beskrivelse: "I 14 dager før turnering: skift fokus mot TURN/SPILL",
  },
  AUTO_HVILEDAG: {
    navn: "Auto hviledag",
    beskrivelse: "Sett inn hviledag dersom siste 3 dager > X min",
  },
  MAX_OKTER_PER_DAG: {
    navn: "Maks økter per dag",
    beskrivelse: "Tillat aldri flere økter enn maks-grense på samme dag",
  },
  MIN_HVILE_MELLOM_OKTER: {
    navn: "Minimum hvile mellom økter",
    beskrivelse: "Krev minst X min hvile mellom to økter på samme dag",
  },
  TVUNGEN_AREA_FORDELING: {
    navn: "Tvungen fordeling per uke",
    beskrivelse: "Garanter at hvert område får minst sin minimumsprosent",
  },
};

function nyId(): string {
  return `regel-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultParametere(type: RegelType): Record<string, unknown> {
  switch (type) {
    case "VOLUM_REDUKSJON_VED_SKADE":
      return { reduksjonProsent: 30 };
    case "PRIORITER_TURNERINGSFORBEREDELSE":
      return { dagerFor: 14, turnProsent: 40 };
    case "AUTO_HVILEDAG":
      return { etterMin: 240, intervallDager: 3 };
    case "MAX_OKTER_PER_DAG":
      return { maks: 2 };
    case "MIN_HVILE_MELLOM_OKTER":
      return { minutter: 120 };
    case "TVUNGEN_AREA_FORDELING":
      return { strict: true };
  }
}

export function ConditionalRulesPanel({ regler, onChange }: Props) {
  const [aapenId, setAapenId] = useState<string | null>(null);
  const [draftType, setDraftType] = useState<RegelType>("AUTO_HVILEDAG");

  function leggTil() {
    const ny: ConditionalRule = {
      id: nyId(),
      type: draftType,
      navn: REGEL_INFO[draftType].navn,
      parametere: defaultParametere(draftType),
      aktiv: true,
      prioritet: regler.length,
    };
    onChange([...regler, ny]);
    setAapenId(ny.id);
  }

  function oppdater(id: string, patch: Partial<ConditionalRule>) {
    onChange(regler.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function slett(id: string) {
    onChange(regler.filter((r) => r.id !== id));
  }

  return (
    <section className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Betingede regler</h3>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {regler.filter((r) => r.aktiv).length}/{regler.length} aktive
        </span>
      </header>

      <div className="flex flex-col gap-2">
        {regler.map((r) => {
          const info = REGEL_INFO[r.type];
          const aapen = aapenId === r.id;
          return (
            <div
              key={r.id}
              className={cn(
                "flex flex-col gap-1 rounded-md border border-border bg-secondary/20 p-2",
                !r.aktiv && "opacity-60",
              )}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={r.aktiv}
                  onChange={(e) => oppdater(r.id, { aktiv: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <button
                  type="button"
                  onClick={() => setAapenId((c) => (c === r.id ? null : r.id))}
                  className="flex flex-1 items-center justify-between text-left text-xs"
                >
                  <span className="font-medium text-foreground">{info.navn}</span>
                  {aapen ? (
                    <ChevronUp size={14} strokeWidth={1.5} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={14} strokeWidth={1.5} className="text-muted-foreground" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => slett(r.id)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Slett regel"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
              {aapen && (
                <div className="flex flex-col gap-2 border-t border-border pt-2 text-xs">
                  <p className="text-muted-foreground">{info.beskrivelse}</p>
                  <ParameterRedigerer
                    type={r.type}
                    parametere={r.parametere}
                    onChange={(p) => oppdater(r.id, { parametere: p })}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-muted-foreground">Prioritet</label>
                    <input
                      type="number"
                      min={0}
                      value={r.prioritet}
                      onChange={(e) =>
                        oppdater(r.id, { prioritet: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="h-8 w-20 rounded-md border border-input bg-card px-2 font-mono text-xs tabular-nums focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer className="flex items-center gap-2">
        <select
          value={draftType}
          onChange={(e) => setDraftType(e.target.value as RegelType)}
          className="h-9 flex-1 rounded-md border border-input bg-card px-2 text-xs focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          {(Object.keys(REGEL_INFO) as RegelType[]).map((t) => (
            <option key={t} value={t}>
              {REGEL_INFO[t].navn}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={leggTil}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={14} strokeWidth={1.5} />
          Legg til
        </button>
      </footer>
    </section>
  );
}

function ParameterRedigerer({
  type,
  parametere,
  onChange,
}: {
  type: RegelType;
  parametere: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
}) {
  function tall(navn: string, label: string, min = 0, max = 1000) {
    const v = Number(parametere[navn]) || 0;
    return (
      <div className="flex items-center gap-2">
        <label className="w-40 text-muted-foreground">{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          value={v}
          onChange={(e) =>
            onChange({ ...parametere, [navn]: Math.max(min, Math.min(max, Number(e.target.value) || 0)) })
          }
          className="h-8 w-24 rounded-md border border-input bg-card px-2 font-mono tabular-nums focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
      </div>
    );
  }
  function bool(navn: string, label: string) {
    const v = Boolean(parametere[navn]);
    return (
      <label className="flex items-center gap-2 text-muted-foreground">
        <input
          type="checkbox"
          checked={v}
          onChange={(e) => onChange({ ...parametere, [navn]: e.target.checked })}
          className="h-4 w-4 rounded border-input"
        />
        {label}
      </label>
    );
  }

  switch (type) {
    case "VOLUM_REDUKSJON_VED_SKADE":
      return <div className="flex flex-col gap-1">{tall("reduksjonProsent", "Reduksjon (%)", 0, 100)}</div>;
    case "PRIORITER_TURNERINGSFORBEREDELSE":
      return (
        <div className="flex flex-col gap-1">
          {tall("dagerFor", "Antall dager før")}
          {tall("turnProsent", "Mål-% for TURN/SPILL", 0, 100)}
        </div>
      );
    case "AUTO_HVILEDAG":
      return (
        <div className="flex flex-col gap-1">
          {tall("etterMin", "Etter minutter")}
          {tall("intervallDager", "Intervall (dager)", 1, 14)}
        </div>
      );
    case "MAX_OKTER_PER_DAG":
      return <div className="flex flex-col gap-1">{tall("maks", "Maks per dag", 1, 6)}</div>;
    case "MIN_HVILE_MELLOM_OKTER":
      return <div className="flex flex-col gap-1">{tall("minutter", "Minimum minutter")}</div>;
    case "TVUNGEN_AREA_FORDELING":
      return <div className="flex flex-col gap-1">{bool("strict", "Streng håndheving")}</div>;
  }
}
