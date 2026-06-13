"use client";

/**
 * CreatePlanSheet — skuff for å opprette ny TrainingPlan fra Workbench.
 *
 * Kaller createTrainingPlan() server action. Lukker seg selv ved suksess.
 * Viser inline feilmelding ved feil — krasjer ikke.
 */

import { useRef, useState, useTransition } from "react";
import { PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { createTrainingPlan } from "@/app/portal/planlegge/workbench/actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreatePlanSheet({ open, onOpenChange }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createTrainingPlan(fd);
      if (!result.ok) {
        setError(result.error ?? "Noe gikk galt");
        return;
      }
      formRef.current?.reset();
      onOpenChange(false);
    });
  }

  // Foreslå startdato = i dag (lokal)
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="lg">
        <SheetHeader>
          <div className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-muted-foreground">
            Ny treningsplan
          </div>
          <SheetTitle className="mt-2 font-display text-lg font-bold tracking-[-0.01em]">
            Opprett plan
          </SheetTitle>
        </SheetHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex flex-col gap-6 p-6">
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                Navn
              </span>
              <Input name="name" placeholder="Høstsesong 2026" required maxLength={120} />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                Startdato
              </span>
              <Input
                name="startDate"
                type="date"
                defaultValue={todayIso}
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                Sluttdato (valgfri)
              </span>
              <Input name="endDate" type="date" />
            </label>

            {error && (
              <p className="rounded-lg bg-destructive/10 p-4 font-mono text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="mt-auto flex gap-4 border-t border-border px-6 py-4">
            <button
              type="button"
              className="flex-1 rounded-full border border-border bg-transparent px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition-opacity disabled:opacity-50"
            >
              <PlusCircle size={14} strokeWidth={1.5} />
              {isPending ? "Oppretter…" : "Opprett plan"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
