"use client";

/* Ny FYS-plan-knapp — Paper-port W1. Planer opprettes i Workbench; knappen
   forklarer det (toast) og navigerer dit. Clay («Én ting nå»-monopolet) kun
   når den er skjermens eneste aksenthandling (tom tilstand uten dagens økt). */

import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { Knapp } from "@/components/v2";
import { T } from "@/lib/v2/tokens";

export function NyPlanKnapp({
  variant,
  primary = false,
}: {
  variant: "header" | "empty-state";
  primary?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();

  function handleKlikk() {
    toast.info("Opprett ny FYS-plan direkte i Workbench");
    router.push("/portal/planlegge");
  }

  return (
    <Knapp
      icon="plus"
      onClick={handleKlikk}
      style={
        primary
          ? { background: T.handling, color: T.onHandling, width: variant === "empty-state" ? "100%" : undefined, minHeight: 48 }
          : undefined
      }
    >
      {variant === "header" ? "Ny plan" : "Lag din første plan"}
    </Knapp>
  );
}
