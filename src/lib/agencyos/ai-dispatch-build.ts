/**
 * Ren AI-dispatch-bygg (ingen server-only, testbar).
 * loadAiDispatch i ai-dispatch-data.ts henter tall og kaller byggAiDispatch.
 */

export type AiDispatchTil =
  | "hq-godkjenning"
  | "caddie"
  | "agent-team"
  | "agenter"
  | "workbench"
  | "meg"
  | "innboks";

export type AiDispatchRad = {
  id: string;
  til: AiDispatchTil;
  tilLabel: string;
  oppgave: string;
  ferdigNar: string;
  href: string;
  prioritet: "hoy" | "normal";
};

export type AiDispatchData = {
  enTingNa: { tekst: string; href: string } | null;
  rader: AiDispatchRad[];
  tellinger: {
    planActions: number;
    caddieDrafts: number;
    sessionRequests: number;
    agentRunsRunning: number;
    agentRunsFailed: number;
    innboksNye: number;
    fokusSpillere: number;
  };
};

export type AiDispatchInput = {
  isAdmin: boolean;
  planActions: number;
  caddieDrafts: number;
  sessionRequests: number;
  agentRunsRunning: number;
  agentRunsFailed?: number;
  innboksNye?: number;
  fokusSpillere?: number;
};

const TIL_LABEL: Record<AiDispatchTil, string> = {
  "hq-godkjenning": "Godkjenninger",
  caddie: "Caddie",
  "agent-team": "Agent-team",
  agenter: "AI-agenter",
  workbench: "Workbench",
  meg: "Meg",
  innboks: "Innboks",
};

function pl(n: number, en: string, flere: string): string {
  return `${n} ${n === 1 ? en : flere}`;
}

/**
 * Ren bygg — ingen DB. Prioritet: haster-kø først, deretter alltid-rader. Maks 4.
 */
export function byggAiDispatch(input: AiDispatchInput): AiDispatchData {
  const {
    isAdmin,
    planActions,
    caddieDrafts,
    sessionRequests,
    agentRunsRunning,
    agentRunsFailed = 0,
    innboksNye = 0,
    fokusSpillere = 0,
  } = input;

  const rader: AiDispatchRad[] = [];

  if (planActions > 0) {
    rader.push({
      id: "plan-actions",
      til: "hq-godkjenning",
      tilLabel: TIL_LABEL["hq-godkjenning"],
      oppgave: `Behandle ${pl(planActions, "AI-planforslag", "AI-planforslag")} i køen`,
      ferdigNar: "Kø tom eller utsatt med vilje",
      href: "/admin/godkjenninger",
      prioritet: "hoy",
    });
  }

  if (caddieDrafts > 0) {
    rader.push({
      id: "caddie-drafts",
      til: "caddie",
      tilLabel: TIL_LABEL.caddie,
      oppgave: `Gjennomgå ${pl(caddieDrafts, "Caddie-utkast", "Caddie-utkast")}`,
      ferdigNar: "Godkjent eller avvist i Caddie / godkjenninger",
      href: "/admin/caddie",
      prioritet: "hoy",
    });
  }

  if (sessionRequests > 0) {
    rader.push({
      id: "session-requests",
      til: "workbench",
      tilLabel: TIL_LABEL.workbench,
      oppgave: `Svar på ${pl(sessionRequests, "øktforespørsel", "øktforespørsler")}`,
      ferdigNar: "Godtatt eller avslått",
      href: "/admin/godkjenninger",
      prioritet: "hoy",
    });
  }

  if (innboksNye > 0) {
    rader.push({
      id: "innboks-nye",
      til: "innboks",
      tilLabel: TIL_LABEL.innboks,
      oppgave: `Les ${pl(innboksNye, "ny e-post", "nye e-poster")} (post@)`,
      ferdigNar: "Innboks gjennomgått eller utkast laget",
      href: "/admin/innboks-epost",
      prioritet: "hoy",
    });
  }

  if (agentRunsFailed > 0) {
    rader.push({
      id: "agent-team-failed",
      til: "agent-team",
      tilLabel: TIL_LABEL["agent-team"],
      oppgave: `Sjekk ${pl(agentRunsFailed, "feilet team-kjøring", "feilede team-kjøringer")} (siste 24 t)`,
      ferdigNar: "Du forstår feilen eller starter på nytt",
      href: "/admin/agent-team",
      prioritet: "hoy",
    });
  }

  if (agentRunsRunning > 0) {
    rader.push({
      id: "agent-team-running",
      til: "agent-team",
      tilLabel: TIL_LABEL["agent-team"],
      oppgave: `Følg ${pl(agentRunsRunning, "agent-team-kjøring", "agent-team-kjøringer")}`,
      ferdigNar: "Kjøring ferdig — les resultatet",
      href: "/admin/agent-team",
      prioritet: "normal",
    });
  }

  if (fokusSpillere > 0 && rader.length < 4) {
    rader.push({
      id: "fokus-spillere",
      til: "workbench",
      tilLabel: "Fokus",
      oppgave: `${pl(fokusSpillere, "spiller trenger", "spillere trenger")} deg — åpne fokuslisten`,
      ferdigNar: "Neste handling valgt per spiller",
      href: "/admin/agencyos",
      prioritet: "normal",
    });
  }

  if (rader.length < 4) {
    rader.push({
      id: "agent-team-start",
      til: "agent-team",
      tilLabel: TIL_LABEL["agent-team"],
      oppgave: "Kjør research → utkast → review på én stor oppgave",
      ferdigNar: "Team-run ferdig og du har lest leveransen",
      href: "/admin/agent-team",
      prioritet: "normal",
    });
  }

  if (rader.length < 4 && isAdmin) {
    rader.push({
      id: "agenter-status",
      til: "agenter",
      tilLabel: TIL_LABEL.agenter,
      oppgave: "Sjekk bakgrunns-agenter og manuell kjøring",
      ferdigNar: "Du vet at natt/morgen-jobbene er friske",
      href: "/admin/agents",
      prioritet: "normal",
    });
  }

  if (rader.length < 4) {
    rader.push({
      id: "workbench-plan",
      til: "workbench",
      tilLabel: TIL_LABEL.workbench,
      oppgave: "Planlegg neste uke i Workbench",
      ferdigNar: "Ukeplan publisert eller lagret som utkast",
      href: "/admin/planlegge",
      prioritet: "normal",
    });
  }

  const top = rader.slice(0, 4);

  const enTingNa =
    planActions > 0
      ? { tekst: `Tøm godkjenningskøen (${planActions})`, href: "/admin/godkjenninger" }
      : caddieDrafts > 0
        ? { tekst: `Gå gjennom Caddie-utkast (${caddieDrafts})`, href: "/admin/caddie" }
        : sessionRequests > 0
          ? { tekst: `Svar på øktforespørsler (${sessionRequests})`, href: "/admin/godkjenninger" }
          : innboksNye > 0
            ? { tekst: `Les nye e-poster (${innboksNye})`, href: "/admin/innboks-epost" }
            : agentRunsFailed > 0
              ? { tekst: `Sjekk feilet agent-team (${agentRunsFailed})`, href: "/admin/agent-team" }
              : fokusSpillere > 0
                ? {
                    tekst: `Hjelp ${pl(fokusSpillere, "spiller som trenger deg", "spillere som trenger deg")}`,
                    href: "/admin/agencyos",
                  }
                : {
                    tekst: "Ingen kø — planlegg eller start agent-team",
                    href: "/admin/planlegge",
                  };

  return {
    enTingNa,
    rader: top,
    tellinger: {
      planActions,
      caddieDrafts,
      sessionRequests,
      agentRunsRunning,
      agentRunsFailed,
      innboksNye,
      fokusSpillere,
    },
  };
}
