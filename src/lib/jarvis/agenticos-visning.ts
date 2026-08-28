/**
 * Ren mapping Agentic OS-status → innsamler-rader Maskinrommet allerede tegner.
 */
import type { AgenticosBroStatus, InnsamlerStatus } from "@/lib/jarvis/types";

export function byggAgenticosInnsamlere(status: AgenticosBroStatus): InnsamlerStatus[] {
  const koTekst =
    status.ulosteGodkjenninger > 0
      ? `${status.ulosteGodkjenninger} uløste i /admin/godkjenninger`
      : "køen er tom";

  const siste = status.sisteAgentKjoring;
  const agentFeilet = siste?.status === "ERROR" || status.feiledeSisteDognet > 0;

  return [
    {
      id: "agenticos-ko",
      navn: "Agentic OS · godkjenninger",
      helse: "OK",
      sistKjort: siste?.createdAt ?? null,
      feilmelding: koTekst,
      frekvens: "live fra godkjenningskøen",
    },
    {
      id: "agenticos-agenter",
      navn: "Agentic OS · agenter",
      helse: !siste ? "UKJENT" : agentFeilet ? "FEILET" : "OK",
      sistKjort: siste?.createdAt ?? null,
      feilmelding: siste?.error
        ? `${siste.agentName}: ${siste.error}`
        : status.feiledeSisteDognet > 0
          ? `${status.feiledeSisteDognet} feilet siste døgn`
          : siste
            ? siste.agentName
            : null,
      frekvens: "AgentRun",
    },
  ];
}
