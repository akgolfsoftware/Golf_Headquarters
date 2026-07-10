"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createPlan } from "./actions";

export type QuickPlanSpiller = {
  id: string;
  name: string;
  hcp: number | null;
};

function isoIDag(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoOm(uker: number): string {
  const d = new Date();
  d.setDate(d.getDate() + uker * 7);
  return d.toISOString().slice(0, 10);
}

/**
 * Hurtigplan — minimal opprett-plan (spiller + navn + periode) som tom plan.
 * Skiller seg fra plan-wizarden (/admin/plans/new) som lager hele økt-skjelettet.
 * Bruker `createPlan`-action. Lander på plan-detalj der coach legger til økter.
 */
export function QuickPlanModal({ spillere }: { spillere: QuickPlanSpiller[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [spillerId, setSpillerId] = useState("");
  const [navn, setNavn] = useState("");
  const [startDato, setStartDato] = useState(isoIDag());
  const [sluttDato, setSluttDato] = useState(isoOm(8));
  const [sok, setSok] = useState("");

  const filtrerte = useMemo(() => {
    const q = sok.trim().toLowerCase();
    const liste = q
      ? spillere.filter((s) => s.name.toLowerCase().includes(q))
      : spillere;
    return liste.slice(0, 50);
  }, [spillere, sok]);

  function lukk() {
    setOpen(false);
    setFeil(null);
  }

  function opprett(e: React.FormEvent) {
    e.preventDefault();
    if (!spillerId) {
      setFeil("Velg en spiller.");
      return;
    }
    if (navn.trim().length < 2) {
      setFeil("Skriv et plan-navn (minst 2 tegn).");
      return;
    }
    if (sluttDato && sluttDato < startDato) {
      setFeil("Sluttdato må være etter startdato.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      try {
        const planId = await createPlan({
          userId: spillerId,
          name: navn.trim(),
          startDate: startDato,
          endDate: sluttDato || undefined,
        });
        router.push(`/admin/plans/${planId}`);
      } catch {
        setFeil("Kunne ikke opprette planen. Prøv igjen.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <Plus size={14} strokeWidth={1.75} />
        Hurtigplan
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={lukk}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Hurtigplan
                </div>
                <h3 className="mt-1 font-display text-xl leading-tight tracking-tight">
                  Opprett{" "}
                  <span className="font-display italic text-primary">
                    tom plan
                  </span>
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lag en tom plan nå og legg til økter etterpå. Bruk
                  plan-byggeren for periodisert økt-skjelett.
                </p>
              </div>
              <button
                type="button"
                onClick={lukk}
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Lukk"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={opprett} className="space-y-4">
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Spiller
                </label>
                <input
                  type="search"
                  value={sok}
                  onChange={(e) => setSok(e.target.value)}
                  placeholder="Søk på navn…"
                  className={inputCls}
                />
                <div className="max-h-44 overflow-y-auto rounded-md border border-border bg-background">
                  {filtrerte.length === 0 ? (
                    <p className="px-4 py-4 text-center text-sm text-muted-foreground">
                      Ingen spillere matcher søket.
                    </p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {filtrerte.map((s) => {
                        const valgt = s.id === spillerId;
                        return (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => setSpillerId(s.id)}
                              className={`flex w-full items-center justify-between gap-4 px-4 py-2 text-left text-sm transition-colors ${
                                valgt
                                  ? "bg-primary/10 text-foreground"
                                  : "hover:bg-secondary"
                              }`}
                            >
                              <span className="truncate font-medium text-foreground">
                                {s.name}
                              </span>
                              <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                                HCP {s.hcp ?? "–"}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Plan-navn
                </label>
                <input
                  type="text"
                  value={navn}
                  onChange={(e) => setNavn(e.target.value)}
                  placeholder="F.eks. Vinterbase 2026"
                  maxLength={120}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Startdato
                  </label>
                  <input
                    type="date"
                    value={startDato}
                    onChange={(e) => setStartDato(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Sluttdato (valgfri)
                  </label>
                  <input
                    type="date"
                    value={sluttDato}
                    onChange={(e) => setSluttDato(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {feil && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
                >
                  {feil}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={lukk}
                  disabled={pending}
                  className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.8} />
                  {pending ? "Oppretter…" : "Opprett plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30";
