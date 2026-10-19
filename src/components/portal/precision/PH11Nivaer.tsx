import Link from "next/link";
import { workbenchUrl, type WbVisning } from "@/lib/workbench/visning-url";
import type { PlanReferanse } from "@/lib/workbench/plan-kontekst";

/** Nivåvelgeren i spillerens Workbench (§SPILLERENS WORKBENCH FÅR NIVÅENE, 14.10.2026). */
export const PH11_NIVAER: readonly { id: WbVisning; navn: string }[] = [
  { id: "aar", navn: "År" }, { id: "periode", navn: "Periode" }, { id: "maned", navn: "Måned" }, { id: "uke", navn: "Uke" }, { id: "mal", navn: "Målsetninger" },
];

export function PH11Nivaer({ playerId, aktiv, referanse }: { playerId: string; aktiv: WbVisning; referanse: PlanReferanse }) {
  return <nav className="phn-valg" aria-label="Nivå">
    {PH11_NIVAER.map((n) => <Link key={n.id} href={workbenchUrl(playerId, n.id, {}, "player", referanse)} aria-current={n.id === aktiv ? "page" : undefined}>{n.navn}</Link>)}
  </nav>;
}
