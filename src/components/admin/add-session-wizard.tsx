"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Search } from "lucide-react";
import { AgentStrip } from "@/components/coachhq/agent-strip";
import type {
  ExerciseDefinition,
  LPhase,
  PressureLevel,
  PyramidArea,
  SessionEnvironment,
  SkillArea,
} from "@/generated/prisma/client";
import { NumberSpinner } from "@/components/shared/number-spinner";
import {
  ENVIRONMENT_LABEL,
  ENVIRONMENT_REKKEFOLGE,
  LPHASE_BESKRIVELSE,
  LPHASE_LABEL,
  LPHASE_REKKEFOLGE,
  PYRAMIDE_LABEL,
  PYRAMIDE_REKKEFOLGE,
  SKILL_AREA_LABEL,
  SKILL_AREA_REKKEFOLGE,
} from "@/lib/labels/taxonomy";
import { PR_PRESS } from "@/lib/taxonomy";
import { PyramideFordeling } from "@/components/portal/pyramide-fordeling";
import {
  leggTilOkt,
  oppdaterOkt,
  opprettExerciseDefinition,
  type LeggTilOktInput,
  type DrillInput,
} from "@/app/admin/(legacy)/plans/[planId]/actions";
import { createAdHocSession } from "@/app/portal/(legacy)/ny-okt/actions";

type DrillValg = {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  csTarget: number;
  notes: string;
};

type Props = {
  /** Plan-modus: ny økt på en eksisterende plan. */
  planId?: string;
  /** Ad-hoc-modus (PlayerHQ): bruker createAdHocSession. */
  adHoc?: boolean;
  /** Alle tilgjengelige drills — wizardet filtrerer på pyramidArea+lPhase. */
  exercises: ExerciseDefinition[];
  /** Default-dato (lokal yyyy-mm-dd). */
  defaultDate?: string;
  /** Default-tid (HH:mm). */
  defaultTime?: string;
  /** Ved suksess — typisk lukk modal eller redirect. */
  onSuccess?: () => void;
  /** Avbryt (modal-mode). */
  onCancel?: () => void;
};

const TOTAL_STEPS = 9;

const PRESSURE_LABEL: Record<PressureLevel, string> = {
  PR1: "Ingen press",
  PR2: "Lav press",
  PR3: "Moderat press",
  PR4: "Hoy press",
  PR5: "Maks press",
};

const PRESSURE_ORDER: PressureLevel[] = ["PR1", "PR2", "PR3", "PR4", "PR5"];

const PYR_TIL_SKILL_HINT: Record<PyramidArea, SkillArea | null> = {
  FYS: null,
  TEK: "TILNAERMING",
  SLAG: "TEE_TOTAL",
  SPILL: "SPILL",
  TURN: "SPILL",
};

export function AddSessionWizard({
  planId,
  adHoc,
  exercises: exercisesInit,
  defaultDate,
  defaultTime = "16:00",
  onSuccess,
  onCancel,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const today = defaultDate ?? new Date().toISOString().split("T")[0];

  // Steg 1
  const [dato, setDato] = useState(today);
  const [tid, setTid] = useState(defaultTime);
  const [varighet, setVarighet] = useState(60);

  // Steg 2
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>("SLAG");

  // Steg 3
  const [skillArea, setSkillArea] = useState<SkillArea>("TEE_TOTAL");

  // Steg 4
  const [environment, setEnvironment] = useState<SessionEnvironment>("RANGE");

  // Steg 5
  const [lPhase, setLPhase] = useState<LPhase>("GRUNN");

  // Steg 6 — pressnivå
  const [pressureLevel, setPressureLevel] = useState<PressureLevel>("PR1");

  // Steg 7 — drill-utvalg
  const [exercises, setExercises] = useState<ExerciseDefinition[]>(exercisesInit);
  const [valgteDrills, setValgteDrills] = useState<DrillValg[]>([]);
  const [search, setSearch] = useState("");
  const [opprettDrillAapen, setOpprettDrillAapen] = useState(false);

  const filtrerte = useMemo(() => {
    const term = search.trim().toLowerCase();
    return exercises.filter((e) => {
      if (e.pyramidArea !== pyramidArea) return false;
      if (e.lPhase !== null && e.lPhase !== lPhase) return false;
      if (term && !e.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [exercises, pyramidArea, lPhase, search]);

  // Når pyramide endres, foreslå skillArea + nullstill drills.
  useEffect(() => {
    const hint = PYR_TIL_SKILL_HINT[pyramidArea];
    startTransition(() => {
      if (hint) setSkillArea(hint);
      setValgteDrills([]);
    });
  }, [pyramidArea]);

  function toggleDrill(ex: ExerciseDefinition) {
    setValgteDrills((curr) => {
      const finnes = curr.find((d) => d.exerciseId === ex.id);
      if (finnes) return curr.filter((d) => d.exerciseId !== ex.id);
      return [
        ...curr,
        {
          exerciseId: ex.id,
          name: ex.name,
          sets: 3,
          reps: 10,
          csTarget: ex.csMin ?? 70,
          notes: "",
        },
      ];
    });
  }

  function oppdaterDrill(idx: number, patch: Partial<DrillValg>) {
    setValgteDrills((curr) =>
      curr.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    );
  }

  function neste() {
    setError(null);
    if (step === 7 && valgteDrills.length === 0) {
      setError("Velg minst én drill (eller opprett en ny).");
      return;
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
    else lagre();
  }

  function tilbake() {
    setError(null);
    if (step > 1) setStep(step - 1);
  }

  function lagre() {
    setError(null);
    const scheduledIso = `${dato}T${tid}:00`;

    const tittel = `${PYRAMIDE_LABEL[pyramidArea]} · ${SKILL_AREA_LABEL[skillArea]}`;

    const drills: DrillInput[] = valgteDrills.map((d) => ({
      exerciseId: d.exerciseId,
      sets: d.sets,
      reps: d.reps,
      csTarget: d.csTarget,
      notes: d.notes.trim() || undefined,
    }));

    startTransition(async () => {
      try {
        if (adHoc) {
          await createAdHocSession({
            title: tittel,
            pyramidArea,
            scheduledAt: scheduledIso,
            durationMin: varighet,
            skillArea,
            environment,
            lPhase,
            drills,
          });
        } else if (planId) {
          const input: LeggTilOktInput = {
            planId,
            scheduledAt: scheduledIso,
            durationMin: varighet,
            title: tittel,
            pyramidArea,
            skillArea,
            environment,
            lPhase,
            drills,
          };
          await leggTilOkt(input);
          onSuccess?.();
          router.refresh();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kunne ikke lagre.";
        if (msg === "upgrade-required") {
          setError("Krever Pro-abonnement.");
        } else {
          setError(msg);
        }
      }
    });
  }

  async function leggTilNyDrill(nyNavn: string, beskrivelse: string) {
    setError(null);
    try {
      const ny = await opprettExerciseDefinition({
        name: nyNavn,
        description: beskrivelse || undefined,
        pyramidArea,
        lPhase,
      });
      setExercises((curr) => [...curr, ny]);
      setOpprettDrillAapen(false);
      // Auto-velg den nye
      toggleDrill(ny);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke opprette drill.");
    }
  }

  return (
    <div className="space-y-6">
      <StegIndikator n={step} total={TOTAL_STEPS} />

      <AgentStrip label="Økt-agent">
        {step === 1 && "Velg dato, varighet og miljø. Jeg foreslår tid basert på kalenderen din."}
        {step === 2 && "Sett en kort, beskrivende tittel. Jeg lager forslag hvis du står fast."}
        {step === 3 && "Velg L-fase. Standard for ad hoc-økt er PRAKSIS."}
        {step === 4 && "Hvilket ferdighetsområde har hovedfokus? Det styrer drill-forslagene."}
        {step === 5 && "Fordel pyramide-vekt mellom prosess, struktur og prestasjon. Må summe til 100 %."}
        {step === 6 && "Velg pressnivå (P0–P4). Høyere press = mer konkurranse-realisme."}
        {step === 7 && "Plukk drills som matcher fokus og press. Jeg foreslår basert på valg."}
        {step === 8 && "Justér sets, reps og CS-mål per drill. Realistisk for nivået ditt."}
        {step === 9 && "Sjekk og bekreft. Økta legges i kalenderen din."}
      </AgentStrip>

      {step === 1 && (
        <Bolk
          tittel="Når og hvor lenge?"
          ingress="Velg dato, klokkeslett og varighet."
        >
          <div className="grid grid-cols-2 gap-4">
            <Felt label="Dato">
              <input
                type="date"
                value={dato}
                onChange={(e) => setDato(e.target.value)}
                className={inputCss}
              />
            </Felt>
            <Felt label="Tid">
              <input
                type="time"
                value={tid}
                onChange={(e) => setTid(e.target.value)}
                className={inputCss}
              />
            </Felt>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Varighet
            </span>
            <NumberSpinner
              value={varighet}
              onChange={setVarighet}
              min={15}
              max={240}
              step={5}
              label="min"
            />
          </div>
        </Bolk>
      )}

      {step === 2 && (
        <Bolk tittel="Hvilket pyramide-lag?" ingress="Hva er hovedfokus?">
          <KortRad>
            {PYRAMIDE_REKKEFOLGE.map((p) => (
              <Kort
                key={p}
                aktiv={p === pyramidArea}
                onClick={() => setPyramidArea(p)}
                title={p}
                sub={PYRAMIDE_LABEL[p]}
              />
            ))}
          </KortRad>
        </Bolk>
      )}

      {step === 3 && (
        <Bolk
          tittel="Område"
          ingress="Hvilken Strokes-Gained-kategori jobber økten med?"
        >
          <KortRad>
            {SKILL_AREA_REKKEFOLGE.map((s) => (
              <Kort
                key={s}
                aktiv={s === skillArea}
                onClick={() => setSkillArea(s)}
                title={SKILL_AREA_LABEL[s]}
                sub={s.replace(/_/g, " ")}
              />
            ))}
          </KortRad>
        </Bolk>
      )}

      {step === 4 && (
        <Bolk tittel="Miljø" ingress="Hvor foregår økten?">
          <KortRad>
            {ENVIRONMENT_REKKEFOLGE.map((e) => (
              <Kort
                key={e}
                aktiv={e === environment}
                onClick={() => setEnvironment(e)}
                title={ENVIRONMENT_LABEL[e]}
                sub={e}
              />
            ))}
          </KortRad>
        </Bolk>
      )}

      {step === 5 && (
        <Bolk
          tittel="Læringsfase"
          ingress="Periodiseringsfase — grunnperiode, spesialisering eller turneringsforberedelse."
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {LPHASE_REKKEFOLGE.map((l) => {
              const aktiv = l === lPhase;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLPhase(l)}
                  className={`rounded-md border p-4 text-left transition-colors ${
                    aktiv
                      ? "border-primary bg-primary/5"
                      : "border-input bg-card hover:border-border"
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {l}
                  </div>
                  <div className="mt-1 font-display text-base font-semibold">
                    {LPHASE_LABEL[l]}
                  </div>
                  <div className="mt-2 text-[12px] leading-[1.4] text-muted-foreground">
                    {LPHASE_BESKRIVELSE[l]}
                  </div>
                </button>
              );
            })}
          </div>
        </Bolk>
      )}

      {step === 6 && (
        <Bolk
          tittel="Pressniva"
          ingress="Hvor mye press skal okten ha?"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {PRESSURE_ORDER.map((p) => {
              const aktiv = p === pressureLevel;
              const info = PR_PRESS.find((pr) => pr.kode === p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPressureLevel(p)}
                  className={`rounded-md border p-4 text-left transition-colors ${
                    aktiv
                      ? "border-primary bg-primary/5"
                      : "border-input bg-card hover:border-border"
                  }`}
                >
                  <div className={`font-display text-base ${aktiv ? "font-semibold text-primary" : "text-foreground"}`}>
                    {PRESSURE_LABEL[p]}
                  </div>
                  {info && (
                    <div className="mt-1 text-[11px] leading-[1.3] text-muted-foreground">
                      {info.beskrivelse}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Bolk>
      )}

      {step === 7 && (
        <Bolk
          tittel="Velg drills"
          ingress={`${valgteDrills.length} valgt · filtrert på ${PYRAMIDE_LABEL[pyramidArea]} · ${LPHASE_LABEL[lPhase]}`}
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} aria-hidden />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk drill…"
                aria-label="Søk drill"
                className={`${inputCss} pl-10`}
              />
            </div>
            <button
              type="button"
              onClick={() => setOpprettDrillAapen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-4 text-sm font-medium hover:border-border active:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Ny drill
            </button>
          </div>

          {opprettDrillAapen && (
            <NyDrillSkjema
              pyramidArea={pyramidArea}
              lPhase={lPhase}
              onLagre={leggTilNyDrill}
              onAvbryt={() => setOpprettDrillAapen(false)}
            />
          )}

          {filtrerte.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Ingen drills matcher kombinasjonen. Opprett en ny.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filtrerte.map((e) => {
                const aktiv = valgteDrills.some((d) => d.exerciseId === e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleDrill(e)}
                    className={`rounded-md border p-4 text-left transition-colors ${
                      aktiv
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card hover:border-border"
                    }`}
                  >
                    <div className="font-medium text-foreground">{e.name}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {e.lPhase ? LPHASE_LABEL[e.lPhase] : "Alle faser"}
                      {e.defaultRepsSets ? ` · ${e.defaultRepsSets}` : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Bolk>
      )}

      {step === 8 && (
        <Bolk
          tittel="Reps per drill"
          ingress="Juster sett, repetisjoner og CS-maal per drill."
        >
          {valgteDrills.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen drills valgt.</p>
          ) : (
            <div className="space-y-4">
              {valgteDrills.map((d, idx) => (
                <div
                  key={d.exerciseId}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="mb-4 font-display text-base font-semibold">
                    {d.name}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Sett
                      </span>
                      <NumberSpinner
                        value={d.sets}
                        onChange={(v) => oppdaterDrill(idx, { sets: v })}
                        min={1}
                        max={10}
                        step={1}
                        label="sett"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Reps
                      </span>
                      <NumberSpinner
                        value={d.reps}
                        onChange={(v) => oppdaterDrill(idx, { reps: v })}
                        min={1}
                        max={50}
                        step={1}
                        label="reps"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        CS-mål
                      </span>
                      <NumberSpinner
                        value={d.csTarget}
                        onChange={(v) => oppdaterDrill(idx, { csTarget: v })}
                        min={0}
                        max={100}
                        step={5}
                        label="%"
                      />
                    </div>
                  </div>
                  <label className="mt-4 block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Notat (valgfritt)
                    </span>
                    <input
                      type="text"
                      value={d.notes}
                      onChange={(e) => oppdaterDrill(idx, { notes: e.target.value })}
                      placeholder="f.eks. fra 50m til 100m"
                      className={inputCss}
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </Bolk>
      )}

      {step === 9 && (
        <Bolk tittel="Bekreft" ingress="Sjekk at alt stemmer for du lagrer.">
          <dl className="space-y-4 rounded-lg border border-border bg-card p-6 text-sm">
            <Rad label="Dato og tid">
              {new Date(`${dato}T${tid}:00`).toLocaleString("nb-NO", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Rad>
            <Rad label="Varighet">{varighet} min</Rad>
            <Rad label="Pyramide">{PYRAMIDE_LABEL[pyramidArea]}</Rad>
            <Rad label="Omraade">{SKILL_AREA_LABEL[skillArea]}</Rad>
            <Rad label="Miljo">{ENVIRONMENT_LABEL[environment]}</Rad>
            <Rad label="Laeringsfase">{LPHASE_LABEL[lPhase]}</Rad>
            <Rad label="Pressniva">{PRESSURE_LABEL[pressureLevel]}</Rad>
            <Rad label="Drills">{valgteDrills.length} valgt</Rad>
          </dl>

          {valgteDrills.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <PyramideFordeling
                drills={valgteDrills.map((d) => {
                  const ex = exercises.find((e) => e.id === d.exerciseId);
                  return { pyramidArea: ex?.pyramidArea ?? pyramidArea, durationMin: null };
                })}
              />
            </div>
          )}
        </Bolk>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex gap-4">
        {step > 1 && (
          <button
            type="button"
            onClick={tilbake}
            disabled={pending}
            className="rounded-md border border-input bg-card px-6 py-4 text-sm font-medium text-foreground hover:border-border active:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            Tilbake
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-input bg-card px-6 py-4 text-sm font-medium text-muted-foreground hover:border-border active:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Avbryt
          </button>
        )}
        <button
          type="button"
          onClick={neste}
          disabled={pending}
          className="ml-auto rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {pending
            ? "Lagrer…"
            : step === TOTAL_STEPS
              ? "Lagre økt"
              : "Neste"}
        </button>
      </div>
    </div>
  );
}

/* ============== Modal-wrapper ============== */

export function AddSessionModal({
  planId,
  exercises,
  triggerLabel = "Legg til økt",
}: {
  planId: string;
  exercises: ExerciseDefinition[];
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-modal="true"
        className="w-full max-w-2xl rounded-2xl border border-border bg-background p-0 shadow-xl backdrop:bg-foreground/40"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-xl font-semibold">
            <em className="font-normal text-primary md:italic">Ny</em> økt
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Lukk"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary active:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
          {open && (
            <AddSessionWizard
              planId={planId}
              exercises={exercises}
              onSuccess={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          )}
        </div>
      </dialog>
    </>
  );
}

// Re-eksport av oppdaterOkt for symmetri (brukt av eksisterende EditSessionModal).
export { oppdaterOkt };

/* ============== Interne bygge-blokker ============== */

const inputCss =
  "w-full rounded-md border border-input bg-card px-4 py-4 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30";

function StegIndikator({ n, total }: { n: number; total: number }) {
  return (
    <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      <span>
        Steg {n} av {total}
      </span>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => i + 1).map((m) => (
          <span
            key={m}
            className={`h-2 w-2 rounded-full ${
              m < n
                ? "bg-primary"
                : m === n
                  ? "bg-accent ring-4 ring-accent/30"
                  : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Bolk({
  tittel,
  ingress,
  children,
}: {
  tittel: string;
  ingress: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">{tittel}</em>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{ingress}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Felt({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Rad({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}

function KortRad({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{children}</div>
  );
}

function Kort({
  aktiv,
  onClick,
  title,
  sub,
}: {
  aktiv: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-4 py-4 text-center transition-colors ${
        aktiv
          ? "border-primary bg-primary/5"
          : "border-input bg-card hover:border-border"
      }`}
    >
      <div
        className={`font-display text-base ${aktiv ? "font-semibold text-primary" : "text-foreground"}`}
      >
        {title}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {sub}
      </div>
    </button>
  );
}

function NyDrillSkjema({
  pyramidArea,
  lPhase,
  onLagre,
  onAvbryt,
}: {
  pyramidArea: PyramidArea;
  lPhase: LPhase;
  onLagre: (navn: string, beskrivelse: string) => void;
  onAvbryt: () => void;
}) {
  const [navn, setNavn] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");

  return (
    <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-4">
      <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Opprett drill — {PYRAMIDE_LABEL[pyramidArea]} · {LPHASE_LABEL[lPhase]}
      </div>
      <div className="space-y-4">
        <input
          type="text"
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
          placeholder="Drill-navn (f.eks. Wedge-stiger 50/75/100m)"
          aria-label="Drill-navn"
          className={inputCss}
          autoFocus
        />
        <input
          type="text"
          value={beskrivelse}
          onChange={(e) => setBeskrivelse(e.target.value)}
          placeholder="Kort beskrivelse (valgfritt)"
          aria-label="Drill-beskrivelse"
          className={inputCss}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAvbryt}
            className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium hover:border-border active:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={() => navn.trim() && onLagre(navn.trim(), beskrivelse.trim())}
            disabled={!navn.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
          >
            Opprett
          </button>
        </div>
      </div>
    </div>
  );
}
