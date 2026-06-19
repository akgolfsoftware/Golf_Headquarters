"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

export function LeggTilSpillerButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Legg til spiller i gruppe kommer snart")}
      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-accent transition-opacity hover:opacity-90"
    >
      Legg til spiller
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
