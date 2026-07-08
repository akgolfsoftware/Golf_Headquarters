"use client";

/**
 * Hero-toolbar for spiller-plan-detalj (coach-context).
 * Kobler "Dupliser" og "Publiser endring" til server-actionene i plan-actions.ts.
 *
 * "Rediger" rendres her som en lenke til Drills-fanen (der drills faktisk
 * legges til / endres på denne flaten). Se rapport — full inline-redigering av
 * enkelt-drills mangler datakobling på denne skjermen (drill-lista er fortsatt
 * demo-data, ikke plan.positions[].tasks).
 */

import { Button } from "@/components/athletic/golfdata";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Copy } from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";
import { publiserTekniskPlan, dupliserTekniskPlan } from "./plan-actions";

interface PlanToolbarProps {
  planId: string;
  /** Lenke til Drills-fanen — der drills legges til. */
  drillsHref: string;
  /** Om planen allerede er publisert (ACTIVE). Skjuler ikke knappen, men endrer tekst. */
  isPublished: boolean;
}

export function PlanToolbar({ planId, drillsHref, isPublished }: PlanToolbarProps) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [duplicating, setDuplicating] = useState(false);

  function handlePublish() {
    startTransition(async () => {
      try {
        await publiserTekniskPlan(planId);
        toast.success("Planen er publisert.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kunne ikke publisere.");
      }
    });
  }

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      // dupliserTekniskPlan redirecter ved suksess — koden under kjøres bare ved feil.
      await dupliserTekniskPlan(planId);
    } catch (err) {
      // next/navigation redirect kaster en spesiell feil vi ikke skal vise som toast.
      if (err instanceof Error && err.message === "NEXT_REDIRECT") return;
      const digest = (err as { digest?: string } | null)?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) return;
      toast.error(err instanceof Error ? err.message : "Kunne ikke duplisere.");
      setDuplicating(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={drillsHref}>
        <Button variant="ghost" size="sm">
          <Edit className="h-3.5 w-3.5" /> Rediger
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDuplicate}
        disabled={duplicating}
      >
        <Copy className="h-3.5 w-3.5" /> {duplicating ? "Dupliserer…" : "Dupliser"}
      </Button>
      <Button variant="signal" size="sm" onClick={handlePublish} disabled={pending}>
        {pending ? "Publiserer…" : isPublished ? "Publisert" : "Publiser"}
      </Button>
    </div>
  );
}
