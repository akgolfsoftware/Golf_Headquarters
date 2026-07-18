/**
 * M2 — mobil-Workbench (oppgavedrevet kø, retning A, godkjent 2026-07-17).
 *
 * Coachens Workbench-jobber som HASTER, samlet som kø av handlinger for
 * 390-flaten: godkjenne AI-forslag (PlanAction) og svare på øktforespørsler
 * (SessionRequest). Gjenbruker de SAMME kildene og server-actionene som
 * desktop-godkjenningskøen (AdminGodkjenningerV2) — ingen ny datamodell, ingen
 * fabrikerte tall. Full ukeplanlegging (dra-og-slipp, mål-spor) henvises til
 * desktop-Workbench per flate-skille-regelen.
 *
 * I0: KUN coachede spillere er synlige (coachScopedPlayerWhere).
 */

import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";

/** Én sak i køen. `kind` styrer hvilke handlinger raden viser. */
export type OppgaveKind = "godkjenn" | "foresporsel";

export type WorkbenchOppgave = {
  id: string;
  kind: OppgaveKind;
  /** PlanAction-id eller SessionRequest-id — sendes til server-actionen. */
  refId: string;
  spillerNavn: string;
  tittel: string;
  /** Klarspråk-beskrivelse av hva coachen skal ta stilling til. */
  beskrivelse: string;
  /** «12 min» / «3 t» siden saken kom. */
  alder: string;
};

export type WorkbenchOppgaverData = {
  oppgaver: WorkbenchOppgave[];
};

function alderSiden(dato: Date, now: Date): string {
  const min = Math.max(0, Math.round((now.getTime() - dato.getTime()) / 60000));
  if (min < 60) return `${min} min`;
  const timer = Math.round(min / 60);
  if (timer < 24) return `${timer} t`;
  return `${Math.round(timer / 24)} d`;
}

const TID_LABEL: Record<string, string> = {
  morgen: "morgen",
  formiddag: "formiddag",
  ettermiddag: "ettermiddag",
  kveld: "kveld",
};

export async function loadWorkbenchOppgaver(coach: {
  id: string;
  role: string;
}): Promise<WorkbenchOppgaverData> {
  const now = new Date();

  // Coachens scope — brukes til å filtrere begge kildene defensivt.
  const scopede = await prisma.user.findMany({
    where: coachScopedPlayerWhere({ id: coach.id, role: coach.role }),
    select: { id: true },
    take: 500,
  });
  const iScope = new Set(scopede.map((s) => s.id));

  const [actions, requests] = await Promise.all([
    prisma.planAction.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        actionType: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
      },
      take: 50,
    }),
    prisma.sessionRequest.findMany({
      where: { status: "PENDING", OR: [{ coachId: coach.id }, { coachId: null }] },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        userId: true,
        reason: true,
        preferredDate: true,
        preferredTime: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      take: 50,
    }),
  ]);

  const oppgaver: WorkbenchOppgave[] = [];

  for (const a of actions) {
    if (!iScope.has(a.user.id)) continue;
    oppgaver.push({
      id: `pa-${a.id}`,
      kind: "godkjenn",
      refId: a.id,
      spillerNavn: a.user.name ?? "Spiller",
      tittel: "Godkjenn forslag",
      beskrivelse: handlingstypeLabel(a.actionType),
      alder: alderSiden(a.createdAt, now),
    });
  }

  for (const r of requests) {
    if (!iScope.has(r.userId)) continue;
    const naar = r.preferredDate
      ? new Intl.DateTimeFormat("nb-NO", {
          weekday: "long",
          day: "numeric",
          month: "short",
          timeZone: "Europe/Oslo",
        }).format(r.preferredDate)
      : null;
    const tid = r.preferredTime ? TID_LABEL[r.preferredTime] ?? r.preferredTime : null;
    const onske = [naar, tid].filter(Boolean).join(" · ");
    const grunn = r.reason.trim();
    oppgaver.push({
      id: `sr-${r.id}`,
      kind: "foresporsel",
      refId: r.id,
      spillerNavn: r.user.name ?? "Spiller",
      tittel: "Øktforespørsel",
      beskrivelse:
        (grunn || "Ønsker en økt") + (onske ? ` — ønsker ${onske}` : ""),
      alder: alderSiden(r.createdAt, now),
    });
  }

  return { oppgaver };
}
