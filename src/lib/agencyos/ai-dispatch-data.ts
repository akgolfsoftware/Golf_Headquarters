/**
 * AI-dispatch for AgencyOS-cockpit — speiler AgenticOS multi-AI-mal.
 * Ren data: tellinger fra PlanAction, CaddieDraft, SessionRequest + lenker.
 * Maks 4 AI-rader. Én menneskelig «NÅ»-handling.
 *
 * Ingen fabrikkerte tall. Tom kø → ærlige tomtilstander i UI.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import type { UserRole } from "@/generated/prisma/client";

export type AiDispatchTil =
  | "hq-godkjenning"
  | "caddie"
  | "agent-team"
  | "agenter"
  | "workbench"
  | "meg";

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
  };
};

const TIL_LABEL: Record<AiDispatchTil, string> = {
  "hq-godkjenning": "Godkjenninger",
  caddie: "Caddie",
  "agent-team": "Agent-team",
  agenter: "AI-agenter",
  workbench: "Workbench",
  meg: "Meg",
};

function pl(n: number, en: string, flere: string): string {
  return `${n} ${n === 1 ? en : flere}`;
}

/**
 * Bygg AI-dispatch for innlogget coach/admin.
 * CaddieDraft eies av ADMIN — vises bare for ADMIN.
 */
export async function loadAiDispatch(viewer: {
  id: string;
  role: UserRole;
}): Promise<AiDispatchData> {
  const isAdmin = viewer.role === "ADMIN";
  const playerScope = coachScopedPlayerWhere(viewer);

  const planActionWhere = isAdmin
    ? { status: "PENDING" as const }
    : {
        status: "PENDING" as const,
        OR: [{ coachId: viewer.id }, { user: playerScope }],
      };

  const sessionWhere = isAdmin
    ? { status: "PENDING" as const }
    : {
        status: "PENDING" as const,
        OR: [{ coachId: viewer.id }, { user: playerScope }],
      };

  const [planActionCount, caddieDrafts, sessionRequests, agentRunsRunning] =
    await Promise.all([
      prisma.planAction.count({ where: planActionWhere }),
      isAdmin
        ? prisma.caddieDraft.count({
            where: { status: "PENDING", userId: viewer.id },
          })
        : Promise.resolve(0),
      prisma.sessionRequest.count({ where: sessionWhere }),
      prisma.kommandoAgentRun.count({
        where: { userId: viewer.id, status: "running" },
      }),
    ]);

  const rader: AiDispatchRad[] = [];

  if (planActionCount > 0) {
    rader.push({
      id: "plan-actions",
      til: "hq-godkjenning",
      tilLabel: TIL_LABEL["hq-godkjenning"],
      oppgave: `Behandle ${pl(planActionCount, "AI-planforslag", "AI-planforslag")} i køen`,
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
    planActionCount > 0
      ? {
          tekst: `Tøm godkjenningskøen (${planActionCount})`,
          href: "/admin/godkjenninger",
        }
      : caddieDrafts > 0
        ? {
            tekst: `Gå gjennom Caddie-utkast (${caddieDrafts})`,
            href: "/admin/caddie",
          }
        : sessionRequests > 0
          ? {
              tekst: `Svar på øktforespørsler (${sessionRequests})`,
              href: "/admin/godkjenninger",
            }
          : {
              tekst: "Ingen kø — planlegg eller start agent-team",
              href: "/admin/planlegge",
            };

  return {
    enTingNa,
    rader: top,
    tellinger: {
      planActions: planActionCount,
      caddieDrafts,
      sessionRequests,
      agentRunsRunning,
    },
  };
}
