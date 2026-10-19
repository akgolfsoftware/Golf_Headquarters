/**
 * Typer for agent-detalj (/admin/agents/[agentId]). Siden bygger
 * `AgentDetaljData` fra Prisma og sender den til AG19AgentDetalj (nytt design,
 * 19.10.2026). Flyttet hit fra components/admin/v2/AdminAgentDetaljV2.
 */

export type AgentDetaljTilstand = "aktiv" | "feilet" | "manuell" | "ingen";
export type AgentDetaljStatusBadge = "aktiv" | "beta" | "planlagt";

export interface AgentDetaljSteg {
  rolle: string;
  tekst: string;
  ok: boolean;
}

export interface AgentDetaljKjoring {
  id: string;
  naar: string;
  varighetTekst: string;
  ok: boolean;
  outputTekst: string | null;
}

export interface AgentDetaljForslag {
  id: string;
  actionTypeLabel: string;
  statusLabel: string;
  tone: "warn" | "up" | "info";
  brukerNavn: string;
  playerId: string;
  naar: string;
  forklaring: string | null;
  pending: boolean;
}

export interface AgentDetaljValg {
  id: string;
  label: string;
}

export interface AgentDetaljData {
  agentId: string;
  navn: string;
  beskrivelse: string;
  trigger: string;
  statusBadge: AgentDetaljStatusBadge;
  tilstand: AgentDetaljTilstand;
  agentDetaljHref: string;
  godkjenningerHref: string;
  feilloggHref: string;
  kpi: {
    kjoringer30d: number;
    kjoringerSub: string;
    snittTidTekst: string;
    forslagLaget: number;
    forslagSub: string;
  };
  kjoringer: AgentDetaljKjoring[];
  kjoringerVindusTekst: string;
  sisteSteg: { naarTekst: string; steg: AgentDetaljSteg[] } | null;
  forslag: AgentDetaljForslag[];
  panel: {
    godkjentRateTekst: string;
    godkjentSub: string;
    eldsteIKoTekst: string;
    eldsteSub: string;
  };
  feil: { naarTekst: string; sidenTekst: string; melding: string | null } | null;
  manuell: {
    plans: AgentDetaljValg[];
    players: AgentDetaljValg[];
    tournaments: AgentDetaljValg[];
  } | null;
}
