"use client";

/* Ny FYS-plan-knapp — v2. Planer opprettes i Workbench; knappen forklarer
   det (toast) og navigerer dit. */

import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { Knapp } from "@/components/v2";

export function NyPlanKnapp({ variant }: { variant: "header" | "empty-state" }) {
  const router = useRouter();
  const toast = useToast();

  function handleKlikk() {
    toast.info("Opprett ny FYS-plan direkte i Workbench");
    router.push("/portal/planlegge");
  }

  return (
    <Knapp icon="plus" onClick={handleKlikk}>
      {variant === "header" ? "Ny plan" : "Lag din første plan"}
    </Knapp>
  );
}
