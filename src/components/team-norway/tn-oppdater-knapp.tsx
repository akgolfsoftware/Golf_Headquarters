"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { tnKnappStil } from "./tn-knapp-stil";

/**
 * «Oppdater»-knapp for sider som viser siste registrerte tall (Live Watch). Henter siden på nytt på serveren;
 * ingen automatisk oppdatering (docs/planer/tn-designloft-plan-2026-10-22.md §4 punkt 3).
 * Hvit knapp på navy helteflate.
 */
export function TnOppdaterKnapp() {
  const router = useRouter();
  const [venter, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(() => router.refresh())}
      disabled={venter}
      aria-busy={venter}
      style={{ ...tnKnappStil("hvit"), opacity: venter ? 0.7 : 1 }}
    >
      {venter ? "Oppdaterer …" : "Oppdater"}
    </button>
  );
}
