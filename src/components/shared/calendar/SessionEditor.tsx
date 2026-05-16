"use client";

// SessionEditor — full modal for å redigere én treningsøkt med flere drills.
// Pyramide-velger styrer om GolfDrillEditor eller FysDrillEditor brukes for
// hver drill. Sidebar viser periode-constraints, planlagt vs faktisk volum
// og eventuelle regelbrudd. Footer: Avbryt, Lagre som mal, Lagre.

import { useState, useMemo } from "react";
import {
  X,
  Plus,
  Save,
  Library,
  GripVertical,
  Trash2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PYRAMIDE, PRAKSISTYPER, M_MILJO } from "@/lib/portal/training/ak-taxonomy";
import { getPeriodeConstraints, type PeriodeConstraints } from "@/lib/portal/training/periode-constraints";
import type {
  PyramidArea,
  PracticeType,
  MMiljo,
  PeriodeType,
} from "@/generated/prisma/client";
import { GolfDrillEditor, type GolfDrillData } from "./GolfDrillEditor";
import { FysDrillEditor, type FysDrillData } from "./FysDrillEditor";
import { PyramideBar } from "./PyramideBar";

// ---------------------------------------------------------------------------
// Typer — discriminated union på pyramide
// ---------------------------------------------------------------------------

type SessionDrill =
  | ({ id: string; pyramide: Exclude<PyramidArea, "FYS"> } & GolfDrillData)
  | ({ id: string; pyramide: "FYS" } & FysDrillData);

export type SessionEditorData = {
  title: string;
  pyramide: PyramidArea;
  durationMinutes: number;
  miljo: MMiljo;
  practiceType: PracticeType;
  drillLoggInterval: number;
  notes: string;
  drills: SessionDrill[];
};

type Props = {
  apen: boolean;
  onLukk: () => void;
  initial: SessionEditorData;
  aktivPeriode?: PeriodeType;
  /** Faktisk volum i uka (minutter), for jamføring mot perioden. */
  ukeVolumMin?: number;
  onLagre: (data: SessionEditorData) => void | Promise<void>;
  onLagreSomMal?: (data: SessionEditorData) => void | Promise<void>;
  onApneBibliotek?: () => void;
};

const VARIGHET_VALG = [30, 45, 60, 75, 90, 105, 120, 150, 180, 240];
const LOGG_INTERVALL_VALG = [1, 5, 10, 15];

// ---------------------------------------------------------------------------
// Hjelpe: opprett tom drill basert på pyramide
// ---------------------------------------------------------------------------

function nyDrill(pyramide: PyramidArea, sortOrder: number): SessionDrill {
  const id = `tmp-${Date.now()}-${sortOrder}`;
  if (pyramide === "FYS") {
    return {
      id,
      pyramide: "FYS",
      name: "",
      durationMinutes: 15,
      fysTreningstype: "STYRKE",
      fysMuskelgruppe: [],
      fysOvelse: null,
      fysSett: null,
      fysReps: null,
      fysVektKg: null,
      fysVektProsent: null,
      fysTempo: null,
      fysPauseSek: null,
      fysVarighetMin: null,
      fysIntensitetsSone: null,
      fysDistanseM: null,
      fysAktivitet: null,
      fysBevegelighetType: null,
      fysHoldSek: null,
    };
  }
  return {
    id,
    pyramide: pyramide as Exclude<PyramidArea, "FYS">,
    name: "",
    description: "",
    durationMinutes: 15,
    repetitions: null,
    omraade: null,
    lFase: null,
    csNivaa: null,
    miljo: null,
    prPress: null,
    pPosisjoner: [],
    componentFocus: null,
    lifeKode: null,
    slowMotionMode: false,
  };
}

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------

export function SessionEditor({
  apen,
  onLukk,
  initial,
  aktivPeriode,
  ukeVolumMin,
  onLagre,
  onLagreSomMal,
  onApneBibliotek,
}: Props) {
  const [data, setData] = useState<SessionEditorData>(initial);
  const [valgtDrillId, setValgtDrillId] = useState<string | null>(
    initial.drills[0]?.id ?? null,
  );
  const [lagrer, setLagrer] = useState(false);

  const constraints: PeriodeConstraints | null = useMemo(
    () => (aktivPeriode ? getPeriodeConstraints(aktivPeriode) : null),
    [aktivPeriode],
  );

  const fordeling = useMemo(() => {
    const acc: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
    for (const d of data.drills) {
      acc[d.pyramide] += d.durationMinutes;
    }
    return acc;
  }, [data.drills]);

  const totalDrillMin = useMemo(
    () => data.drills.reduce((s, d) => s + d.durationMinutes, 0),
    [data.drills],
  );

  const regelBrudd = useMemo(() => {
    if (!constraints) return [];
    const brudd: string[] = [];
    if (totalDrillMin > 0) {
      (Object.keys(PYRAMIDE) as PyramidArea[]).forEach((p) => {
        const pst = Math.round((fordeling[p] / totalDrillMin) * 100);
        if (pst > constraints.maxPyramide[p]) {
          brudd.push(`${p}: ${pst}% (maks ${constraints.maxPyramide[p]}%)`);
        }
      });
    }
    if (ukeVolumMin !== undefined && ukeVolumMin > constraints.volumPerUke.maxMin) {
      brudd.push(
        `Uke-volum ${ukeVolumMin} min > maks ${constraints.volumPerUke.maxMin} min`,
      );
    }
    return brudd;
  }, [constraints, fordeling, totalDrillMin, ukeVolumMin]);

  if (!apen) return null;

  const valgtDrill = data.drills.find((d) => d.id === valgtDrillId) ?? null;

  const settDrill = (id: string, ny: SessionDrill) => {
    setData((d) => ({
      ...d,
      drills: d.drills.map((x) => (x.id === id ? ny : x)),
    }));
  };

  const leggTilDrill = () => {
    const ny = nyDrill(data.pyramide, data.drills.length);
    setData((d) => ({ ...d, drills: [...d.drills, ny] }));
    setValgtDrillId(ny.id);
  };

  const slettDrill = (id: string) => {
    setData((d) => ({ ...d, drills: d.drills.filter((x) => x.id !== id) }));
    if (valgtDrillId === id) setValgtDrillId(null);
  };

  const flyttDrill = (id: string, retning: -1 | 1) => {
    setData((d) => {
      const idx = d.drills.findIndex((x) => x.id === id);
      if (idx < 0) return d;
      const ny = idx + retning;
      if (ny < 0 || ny >= d.drills.length) return d;
      const arr = [...d.drills];
      const [item] = arr.splice(idx, 1);
      if (item) arr.splice(ny, 0, item);
      return { ...d, drills: arr };
    });
  };

  const handleLagre = async () => {
    setLagrer(true);
    try {
      await onLagre(data);
    } finally {
      setLagrer(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-foreground/40 p-4">
      <div className="relative flex h-full max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex flex-1 items-center gap-4">
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
              placeholder="Øktnavn"
              className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={onLukk}
            className="ml-4 rounded-md p-2 text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Pyramide + meta */}
        <div className="grid gap-4 border-b border-border px-6 py-4 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Pyramide:</span>
            {(Object.keys(PYRAMIDE) as PyramidArea[]).map((p) => {
              const info = PYRAMIDE[p as keyof typeof PYRAMIDE];
              const aktiv = data.pyramide === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setData((d) => ({ ...d, pyramide: p }))}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                    aktiv
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-secondary",
                  )}
                  title={info.label}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.8} />
              <span>Varighet</span>
              <select
                value={data.durationMinutes}
                onChange={(e) =>
                  setData((d) => ({ ...d, durationMinutes: Number(e.target.value) }))
                }
                className="rounded-md border border-input bg-background px-4 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {VARIGHET_VALG.map((v) => (
                  <option key={v} value={v}>
                    {v} min
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Logg hver</span>
              <select
                value={data.drillLoggInterval}
                onChange={(e) =>
                  setData((d) => ({ ...d, drillLoggInterval: Number(e.target.value) }))
                }
                className="rounded-md border border-input bg-background px-4 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {LOGG_INTERVALL_VALG.map((v) => (
                  <option key={v} value={v}>
                    {v}.
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Miljø + praksistype */}
        <div className="flex flex-wrap items-center gap-4 border-b border-border px-6 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Miljø</span>
            <div className="flex flex-wrap gap-2">
              {M_MILJO.map((m) => {
                const aktiv = data.miljo === m.kode;
                return (
                  <button
                    key={m.kode}
                    type="button"
                    onClick={() =>
                      setData((d) => ({ ...d, miljo: m.kode as MMiljo }))
                    }
                    className={cn(
                      "rounded-full border px-2 py-2 font-mono text-xs",
                      aktiv
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                    title={m.label}
                  >
                    {m.kode}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Praksistype</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRAKSISTYPER) as PracticeType[]).map((t) => {
                const aktiv = data.practiceType === t;
                const info = PRAKSISTYPER[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setData((d) => ({ ...d, practiceType: t }))}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-medium",
                      aktiv
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                    title={info.beskrivelse}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body: drill-liste + drill-editor + sidebar */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[260px_1fr_240px]">
          {/* Drill-liste venstre */}
          <aside className="flex flex-col overflow-y-auto border-r border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Driller ({data.drills.length})
              </span>
              <button
                type="button"
                onClick={leggTilDrill}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
                Drill
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {data.drills.map((d, i) => {
                const aktiv = valgtDrillId === d.id;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setValgtDrillId(d.id)}
                      className={cn(
                        "group flex w-full items-start gap-2 rounded-md border p-2 text-left transition-colors",
                        aktiv
                          ? "border-primary bg-card"
                          : "border-border bg-card hover:bg-secondary/50",
                      )}
                    >
                      <span className="mt-1 flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            flyttDrill(d.id, -1);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Flytt opp"
                        >
                          <GripVertical className="h-3 w-3" strokeWidth={1.8} />
                        </button>
                      </span>
                      <span className="flex-1">
                        <span className="line-clamp-1 text-xs font-medium">
                          {i + 1}. {d.name || "(uten navn)"}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="font-mono">{d.pyramide}</span>
                          <span className="font-mono tabular-nums">
                            {d.durationMinutes}m
                          </span>
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          slettDrill(d.id);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Slett drill"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                      </button>
                    </button>
                  </li>
                );
              })}
            </ul>
            {onApneBibliotek && (
              <button
                type="button"
                onClick={onApneBibliotek}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs hover:bg-secondary"
              >
                <Library className="h-3.5 w-3.5" strokeWidth={1.8} />
                Drill-bibliotek
              </button>
            )}
          </aside>

          {/* Drill-editor midt */}
          <section className="overflow-y-auto px-6 py-4">
            {!valgtDrill ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Velg en drill — eller legg til en ny.
              </div>
            ) : valgtDrill.pyramide === "FYS" ? (
              (() => {
                const { id: _id, pyramide: _p, ...fysVerdier } = valgtDrill;
                void _id;
                void _p;
                return (
                  <FysDrillEditor
                    value={fysVerdier}
                    onChange={(v) =>
                      settDrill(valgtDrill.id, {
                        ...v,
                        id: valgtDrill.id,
                        pyramide: "FYS",
                      })
                    }
                  />
                );
              })()
            ) : (
              (() => {
                const { id: _id, pyramide: _p, ...golfVerdier } = valgtDrill;
                void _id;
                void _p;
                const pyr = valgtDrill.pyramide;
                return (
                  <GolfDrillEditor
                    value={{ ...golfVerdier, pyramide: pyr }}
                    onChange={(v) =>
                      settDrill(valgtDrill.id, {
                        ...v,
                        id: valgtDrill.id,
                        pyramide: pyr,
                      })
                    }
                  />
                );
              })()
            )}

            {/* Øktnotat under drill */}
            <label className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
              <span className="text-xs font-medium text-muted-foreground">
                Øktnotat
              </span>
              <textarea
                value={data.notes}
                onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
                rows={3}
                className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Hva er målet med økta? Spesielle hensyn?"
              />
            </label>
          </section>

          {/* Sidebar høyre */}
          <aside className="flex flex-col gap-4 overflow-y-auto border-l border-border bg-muted/20 p-4 text-xs">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Pyramide-fordeling
              </div>
              <PyramideBar fordeling={fordeling} visTall />
              <div className="mt-2 flex justify-between font-mono tabular-nums text-muted-foreground">
                <span>{totalDrillMin} min planlagt</span>
                <span>av {data.durationMinutes} min</span>
              </div>
            </div>

            {aktivPeriode && constraints && (
              <div className="rounded-md border border-border bg-card p-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Periode · {aktivPeriode}
                </div>
                <ul className="flex flex-col gap-1 text-muted-foreground">
                  <li>
                    Volum/uke:{" "}
                    <span className="font-mono tabular-nums text-foreground">
                      {constraints.volumPerUke.minMin}–{constraints.volumPerUke.maxMin} min
                    </span>
                  </li>
                  {ukeVolumMin !== undefined && (
                    <li>
                      Denne uka:{" "}
                      <span
                        className={cn(
                          "font-mono tabular-nums",
                          ukeVolumMin > constraints.volumPerUke.maxMin
                            ? "text-destructive"
                            : "text-foreground",
                        )}
                      >
                        {ukeVolumMin} min
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {regelBrudd.length > 0 && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" strokeWidth={1.8} />
                  Regelbrudd
                </div>
                <ul className="flex flex-col gap-1 text-destructive">
                  {regelBrudd.map((b, i) => (
                    <li key={i} className="text-[11px]">
                      · {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={onLukk}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Avbryt
          </button>
          {onLagreSomMal && (
            <button
              type="button"
              onClick={() => onLagreSomMal(data)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Library className="h-4 w-4" strokeWidth={1.8} />
              Lagre som mal
            </button>
          )}
          <button
            type="button"
            onClick={handleLagre}
            disabled={lagrer}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <Save className="h-4 w-4" strokeWidth={1.8} />
            {lagrer ? "Lagrer..." : "Lagre"}
          </button>
        </div>
      </div>
    </div>
  );
}
