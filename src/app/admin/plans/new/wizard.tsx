"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPlan } from "../actions";

type Spiller = { id: string; name: string; hcp: number | null };

export function PlanWizard({ spillere }: { spillere: Spiller[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(spillere[0]?.id ?? "");
  const [name, setName] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function neste() {
    setError(null);
    if (step === 1 && !userId) {
      setError("Velg spiller.");
      return;
    }
    if (step === 2 && !name.trim()) {
      setError("Skriv et plannavn.");
      return;
    }
    if (step < 4) setStep(step + 1);
    else lagre();
  }

  function tilbake() {
    if (step > 1) setStep(step - 1);
  }

  function lagre() {
    startTransition(async () => {
      try {
        const id = await createPlan({
          userId,
          name,
          startDate,
          endDate: endDate || undefined,
        });
        router.push(`/admin/plans/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  const valgtSpiller = spillere.find((s) => s.id === userId);

  return (
    <div className="space-y-6">
      <Steg n={step} total={4} />

      {step === 1 && (
        <Bolk tittel="Velg spiller" ingress="Hvem skal denne planen være for?">
          {spillere.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Ingen spillere registrert. Inviter en bruker først.
            </p>
          ) : (
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={input}
            >
              {spillere.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.hcp != null && ` · HCP ${s.hcp.toFixed(1).replace(".", ",")}`}
                </option>
              ))}
            </select>
          )}
        </Bolk>
      )}

      {step === 2 && (
        <Bolk
          tittel="Plannavn"
          ingress="Velg et beskrivende navn — f.eks. 'Sesong 2026 – grunntrening'."
        >
          <Felt label="Navn">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sesong 2026 – grunntrening"
              className={input}
            />
          </Felt>
        </Bolk>
      )}

      {step === 3 && (
        <Bolk
          tittel="Periode"
          ingress="Når skal planen starte og evt. avsluttes?"
        >
          <div className="grid grid-cols-2 gap-3">
            <Felt label="Start">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={input}
              />
            </Felt>
            <Felt label="Slutt (valgfritt)">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={input}
              />
            </Felt>
          </div>
        </Bolk>
      )}

      {step === 4 && (
        <Bolk tittel="Bekreft" ingress="Sjekk detaljene før du oppretter planen.">
          <dl className="space-y-2 rounded-lg border border-border bg-card p-5 text-sm">
            <Rad label="Spiller">{valgtSpiller?.name ?? "—"}</Rad>
            <Rad label="Plannavn">{name || "—"}</Rad>
            <Rad label="Start">
              {new Date(startDate).toLocaleDateString("nb-NO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Rad>
            <Rad label="Slutt">
              {endDate
                ? new Date(endDate).toLocaleDateString("nb-NO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "—"}
            </Rad>
          </dl>
          <p className="text-xs text-muted-foreground">
            Etter oppretting kan du legge til økter direkte på plan-detalj-siden,
            eller bruke en mal fra plan-bibliotek.
          </p>
        </Bolk>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
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
          href="/admin/plans"
          className="rounded-md border border-input bg-card px-5 py-3 text-sm font-medium text-muted-foreground hover:border-border"
        >
          Avbryt
        </Link>
        <button
          type="button"
          onClick={neste}
          disabled={pending || spillere.length === 0}
          className="ml-auto rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Lagrer…" : step === 4 ? "Opprett plan" : "Neste →"}
        </button>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

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
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">{tittel}</em>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{ingress}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
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
