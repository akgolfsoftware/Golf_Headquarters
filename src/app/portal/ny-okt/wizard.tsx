"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { ExerciseDefinition, PyramidArea } from "@/generated/prisma/client";
import { createAdHocSession } from "./actions";

const PYR_OMRADER: { value: PyramidArea; label: string }[] = [
  { value: "FYS", label: "Fysisk" },
  { value: "TEK", label: "Teknisk" },
  { value: "SLAG", label: "Slag" },
  { value: "SPILL", label: "Spill" },
  { value: "TURN", label: "Turnering" },
];

const TOTAL_STEPS = 5;

export function NyOktWizard({
  exercises,
}: {
  exercises: ExerciseDefinition[];
}) {
  const [step, setStep] = useState(1);
  const today = new Date().toISOString().split("T")[0];
  const [scheduledAt, setScheduledAt] = useState(today);
  const [tid, setTid] = useState("16:00");
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>("SLAG");
  const [title, setTitle] = useState("");
  const [rationale, setRationale] = useState("");
  const [durationMin, setDurationMin] = useState(60);
  const [valgteIds, setValgteIds] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtrerteExercises = useMemo(
    () => exercises.filter((e) => e.pyramidArea === pyramidArea),
    [exercises, pyramidArea]
  );

  function toggleDrill(id: string) {
    setValgteIds((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]
    );
  }

  function neste() {
    setError(null);
    if (step === 1 && !title.trim()) {
      setError("Gi økten en tittel.");
      return;
    }
    if (step === 3 && valgteIds.length === 0) {
      setError("Velg minst én drill.");
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
    const datoMedTid = `${scheduledAt}T${tid}:00`;
    startTransition(async () => {
      try {
        await createAdHocSession({
          title: title.trim(),
          pyramidArea,
          scheduledAt: datoMedTid,
          durationMin,
          rationale: rationale.trim() || undefined,
          exerciseIds: valgteIds,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kunne ikke lagre.";
        if (msg === "upgrade-required") {
          setError("Krever Pro-abonnement. Oppgrader for å lage egne økter.");
        } else if (msg === "no-drills") {
          setError("Velg minst én drill.");
        } else {
          setError(msg);
        }
      }
    });
  }

  return (
    <div className="space-y-6">
      <Steg n={step} total={TOTAL_STEPS} />

      {step === 1 && (
        <Bolk
          tittel="Hva slags økt?"
          ingress="Velg pyramide-område og gi økten en tittel."
        >
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Pyramide-område
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {PYR_OMRADER.map((o) => {
                const aktiv = o.value === pyramidArea;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      setPyramidArea(o.value);
                      setValgteIds([]);
                    }}
                    className={`rounded-md border px-3 py-3 text-sm transition-colors ${
                      aktiv
                        ? "border-primary bg-primary/5 font-semibold text-primary"
                        : "border-input bg-card hover:border-border"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Felt label="Tittel">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="f.eks. Pitch 50–100 m"
              className={inputCss}
            />
          </Felt>
        </Bolk>
      )}

      {step === 2 && (
        <Bolk tittel="Begrunnelse" ingress="Hvorfor denne økten? Valgfritt.">
          <Felt label="Notat (valgfritt)">
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value.slice(0, 280))}
              rows={3}
              placeholder="f.eks. Forberede pitch til turnering neste uke."
              className={inputCss}
            />
            <span className="mt-1 block text-right font-mono text-[10px] text-muted-foreground">
              {rationale.length} / 280
            </span>
          </Felt>
        </Bolk>
      )}

      {step === 3 && (
        <Bolk
          tittel={`Velg drills (${pyramidArea})`}
          ingress={`${valgteIds.length} valgt. Klikk for å legge til/fjerne.`}
        >
          {filtrerteExercises.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Ingen drills tilgjengelig for {pyramidArea} ennå.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filtrerteExercises.map((e) => {
                const aktiv = valgteIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleDrill(e.id)}
                    className={`rounded-md border p-3 text-left transition-colors ${
                      aktiv
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card hover:border-border"
                    }`}
                  >
                    <div className="font-medium text-foreground">{e.name}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {e.lPhase} · {e.defaultRepsSets ?? "—"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Bolk>
      )}

      {step === 4 && (
        <Bolk tittel="Detaljer" ingress="Varighet og dato/tid.">
          <Felt label="Varighet (minutter)">
            <input
              type="number"
              step={5}
              min={15}
              max={240}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className={inputCss}
            />
          </Felt>
          <div className="grid grid-cols-2 gap-3">
            <Felt label="Dato">
              <input
                type="date"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
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
        </Bolk>
      )}

      {step === 5 && (
        <Bolk tittel="Bekreft" ingress="Sjekk at alt stemmer før du lagrer.">
          <dl className="space-y-3 rounded-lg border border-border bg-card p-5 text-sm">
            <Rad label="Tittel">{title || "—"}</Rad>
            <Rad label="Område">
              {PYR_OMRADER.find((p) => p.value === pyramidArea)?.label}
            </Rad>
            <Rad label="Dato">
              {new Date(`${scheduledAt}T${tid}:00`).toLocaleString("nb-NO", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Rad>
            <Rad label="Varighet">{durationMin} min</Rad>
            <Rad label="Drills">{valgteIds.length} valgt</Rad>
            {rationale && <Rad label="Notat">{rationale}</Rad>}
          </dl>
        </Bolk>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={tilbake}
            disabled={pending}
            className="rounded-md border border-input bg-card px-5 py-3 text-sm font-medium text-foreground hover:border-border disabled:opacity-60"
          >
            Tilbake
          </button>
        )}
        <Link
          href="/portal/tren"
          className="rounded-md border border-input bg-card px-5 py-3 text-sm font-medium text-muted-foreground hover:border-border"
        >
          Avbryt
        </Link>
        <button
          type="button"
          onClick={neste}
          disabled={pending}
          className="ml-auto rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending
            ? "Lagrer…"
            : step === TOTAL_STEPS
            ? "Lagre økt"
            : "Neste →"}
        </button>
      </div>
    </div>
  );
}

const inputCss =
  "w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Steg({ n, total }: { n: number; total: number }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      <span>
        Steg {n} av {total}
      </span>
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, i) => i + 1).map((m) => (
          <span
            key={m}
            className={`h-2 w-2 rounded-full ${
              m < n ? "bg-primary" : m === n ? "bg-accent ring-4 ring-accent/30" : "bg-border"
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

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Rad({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
