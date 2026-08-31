/**
 * Typer for agent-detalj (/admin/agents/[agentId]).
 *
 * Visningen selv er Train-lock AO-04 Run-detalj
 * (`@/components/admin/v2/agenticos/AdminAgenticosRunDetalj`, T12 visuell).
 * Den gamle Paper-porten (`data-paper-slug="agencyos-agent-detalj"`,
 * fasit `designsystem/paper/fase2/agencyos/agencyos-agent-detalj.html`) er
 * fjernet 29.08.2026 — Paper er historikk, aldri bygg-fasit
 * (CLAUDE.md invariant 2), og komponenten hadde null importører igjen.
 * Typene her lever videre fordi AdminAgenticosRunDetalj + siden bygger
 * `AgentDetaljData` fra Prisma-data og sender den rett inn i AO-04.
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
