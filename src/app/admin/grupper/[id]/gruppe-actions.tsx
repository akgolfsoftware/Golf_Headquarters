"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserMinus } from "lucide-react";

import { LeggTilMedlemModal, type Kandidat } from "./legg-til-medlem-modal";
import { fjernGruppemedlem } from "./actions";

export function StartOktButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/admin/bookinger/ny")}
      className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
    >
      Start økt
    </button>
  );
}

export function LeggTilSpillerButton({
  groupId,
  kandidater,
}: {
  groupId: string;
  kandidater: Kandidat[];
}) {
  const [aapen, setAapen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setAapen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Legg til spiller
      </button>
      {aapen && (
        <LeggTilMedlemModal
          groupId={groupId}
          kandidater={kandidater}
          onClose={() => setAapen(false)}
        />
      )}
    </>
  );
}

export function FjernMedlemButton({
  groupId,
  userId,
  navn,
}: {
  groupId: string;
  userId: string;
  navn: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function fjern(e: React.MouseEvent) {
    // Ligger inni en Link — stopp navigasjon til spiller-profilen.
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Fjern ${navn} fra gruppen?`)) return;
    startTransition(async () => {
      const res = await fjernGruppemedlem(groupId, userId);
      if (!res.ok) {
        toast.error(res.feil);
        return;
      }
      toast.success(`${navn} er fjernet fra gruppen.`);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={fjern}
      disabled={pending}
      aria-label={`Fjern ${navn} fra gruppen`}
      className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <UserMinus className="h-3.5 w-3.5" strokeWidth={1.75} />
    </button>
  );
}

export function SeAlleTimePlanButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Gruppe-kalender kommer snart")}
      className="font-mono text-[11px] font-semibold text-primary hover:underline"
    >
      Se alle →
    </button>
  );
}

export function DetaljerButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Samling-detalj kommer snart")}
      className="rounded-md border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary"
    >
      Detaljer
    </button>
  );
}

export function AapneButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Samling-detalj kommer snart")}
      className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-primary"
    >
      Åpne →
    </button>
  );
}
