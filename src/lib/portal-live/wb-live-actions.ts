"use server";

/**
 * Live-økt for WorkbenchSession lagrer det som skjer (krav 2, 09.10.2026):
 * reps og kommentar per øvelse (WorkbenchDrillLog), video per øvelse
 * (PlayerSwingVideo, liveSessionKind "workbench") og — når øvelsen er koblet
 * til en oppgave i teknisk plan — reps mot oppgaven én gang ved fullføring.
 *
 * Tilgang: eier eller coach med tilgang til spilleren (samme regel som
 * slagtelleren). Video: bare spilleren selv, og bare med foreldresamtykke.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { canAccessPlayer } from "@/lib/auth/own-or-coached";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { prisma } from "@/lib/prisma";
import { completeSession } from "@/lib/workbench/wb-actions";
import { rekalkulerMaalMatrise } from "@/lib/teknisk-plan/apply-reps";
import { hastighetForMotorikk, ovelseSnapshot } from "./wb-ovelse-logg";

type Resultat = { ok: true } | { ok: false; error: string };

const OvelseLoggSchema = z.object({
  drillId: z.string().min(1).max(100),
  reps: z.number().int().min(0).max(5000),
  // undefined = ikke rør kommentaren; tom tekst = fjern den.
  kommentar: z.string().max(1000).optional(),
}).strict();
const LoggListeSchema = z.array(OvelseLoggSchema).max(100);
const VideoSchema = z.object({
  drillId: z.string().min(1).max(100),
  videoUrl: z.string().url().max(2000),
  storagePath: z.string().min(1).max(500),
}).strict();

const PAAGAAENDE = "IN_PROGRESS";

async function hentOkt(sessionId: string) {
  return prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true, playerId: true, status: true, isTemplate: true, hiddenByPlayer: true, needsPlayerApproval: true,
      drills: { select: { id: true, title: true, akFormel: true, positionTaskId: true } },
    },
  });
}
type Okt = NonNullable<Awaited<ReturnType<typeof hentOkt>>>;

function kanLogges(okt: Okt): boolean {
  return okt.status === PAAGAAENDE && !okt.isTemplate && !okt.hiddenByPlayer && !okt.needsPlayerApproval;
}

function revalider(sessionId: string) {
  revalidatePath("/portal");
  revalidatePath(`/portal/live/${sessionId}`, "layout");
}

async function skrivLogger(tx: Prisma.TransactionClient, okt: Okt, loggetAv: string, logger: z.infer<typeof LoggListeSchema>) {
  for (const logg of logger) {
    const drill = okt.drills.find((d) => d.id === logg.drillId);
    if (!drill) throw new Error("Øvelsen hører ikke til økta.");
    const snap = ovelseSnapshot(drill.akFormel);
    const felles = {
      reps: logg.reps,
      loggedById: loggetAv,
      drillTittel: drill.title,
      motorikk: snap.motorikk,
      omraade: snap.omraade,
      sted: snap.sted,
      avstand: snap.avstand,
    };
    const kommentar = logg.kommentar === undefined ? undefined : logg.kommentar.trim() || null;
    await tx.workbenchDrillLog.upsert({
      where: { sessionId_drillId: { sessionId: okt.id, drillId: drill.id } },
      create: { sessionId: okt.id, drillId: drill.id, playerId: okt.playerId, ...felles, kommentar: kommentar ?? null },
      update: { ...felles, ...(kommentar !== undefined ? { kommentar } : {}) },
    });
  }
}

/** Lagrer reps (og eventuelt kommentar) for én øvelse. Skriver hele tallet, ikke et tillegg. */
export async function lagreWbOvelse(sessionId: string, input: unknown): Promise<Resultat> {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = OvelseLoggSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig registrering." };
  const okt = await hentOkt(sessionId);
  if (!okt || !(await canAccessPlayer(user, okt.playerId))) return { ok: false, error: "Ingen tilgang til økta." };
  if (!kanLogges(okt)) return { ok: false, error: "Økta er ikke i gang." };
  try {
    await prisma.$transaction((tx) => skrivLogger(tx, okt, user.id, [parsed.data]));
  } catch {
    return { ok: false, error: "Kunne ikke lagre øvelsen. Prøv igjen." };
  }
  revalider(sessionId);
  return { ok: true };
}

/**
 * Teller reps fra øvelser koblet til teknisk plan mot oppgaven. Unik nøkkel
 * (oppgave, økt, hastighet) gjør at et nytt forsøk aldri teller dobbelt:
 * finnes raden, rulles hele transaksjonen for den oppgaven tilbake.
 */
async function overforTilTekniskPlan(okt: Okt, loggetAv: string): Promise<void> {
  const koblet = okt.drills.filter((d) => d.positionTaskId);
  if (koblet.length === 0) return;
  const logger = await prisma.workbenchDrillLog.findMany({
    where: { sessionId: okt.id, drillId: { in: koblet.map((d) => d.id) } },
    select: { drillId: true, reps: true, motorikk: true },
  });
  for (const drill of koblet) {
    const logg = logger.find((l) => l.drillId === drill.id);
    const hastighet = hastighetForMotorikk(logg?.motorikk ?? null);
    if (!logg || logg.reps <= 0 || !hastighet || !drill.positionTaskId) continue;
    const taskId = drill.positionTaskId;
    // Oppgaven må tilhøre spilleren som eier økta.
    const eier = await prisma.positionTask.findFirst({
      where: { id: taskId, position: { plan: { userId: okt.playerId } } },
      select: { id: true },
    });
    if (!eier) continue;
    const belastning = ovelseSnapshot(drill.akFormel).belastning;
    const felt = hastighet === "DRY" ? "repsGjortDry" : hastighet === "LAV" ? "repsGjortLav" : "repsGjortFull";
    try {
      await prisma.$transaction([
        prisma.positionTaskLog.create({
          data: { taskId, loggedByUserId: loggetAv, reps: logg.reps, hastighet, belastning, workbenchSessionId: okt.id },
        }),
        prisma.positionTask.update({
          where: { id: taskId },
          data: { [felt]: { increment: logg.reps }, lastRepLoggedAt: new Date() },
        }),
      ]);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
    if (belastning) await rekalkulerMaalMatrise(taskId);
  }
}

/**
 * Lagrer sluttellingen, setter økta til fullført og teller reps mot teknisk
 * plan. Et nytt forsøk etter fullføring overskriver ikke sluttresultatet.
 */
export async function fullforWbLiveOkt(sessionId: string, logger: unknown): Promise<{ ok: true; href: string } | { ok: false; error: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = LoggListeSchema.safeParse(logger);
  if (!parsed.success || new Set(parsed.data.map((l) => l.drillId)).size !== parsed.data.length) {
    return { ok: false, error: "Ugyldig registrering." };
  }
  const okt = await hentOkt(sessionId);
  if (!okt || !(await canAccessPlayer(user, okt.playerId))) return { ok: false, error: "Ingen tilgang til økta." };
  if (okt.status !== "COMPLETED") {
    if (!kanLogges(okt)) return { ok: false, error: "Økta er ikke i gang." };
    try {
      await prisma.$transaction((tx) => skrivLogger(tx, okt, user.id, parsed.data));
    } catch {
      return { ok: false, error: "Kunne ikke lagre økta. Prøv igjen." };
    }
    const ferdig = await completeSession(sessionId);
    if (!ferdig.ok) return { ok: false, error: ferdig.error };
  }
  try {
    await overforTilTekniskPlan(okt, user.id);
  } catch {
    return { ok: false, error: "Økta er lagret, men repsene ble ikke ført i teknisk plan. Prøv igjen." };
  }
  revalider(sessionId);
  return { ok: true, href: `/portal/live/${sessionId}/summary` };
}

/** Kobler en opplastet video til én øvelse i økta. Bare spilleren selv. */
export async function lagreWbOvelseVideo(sessionId: string, input: unknown): Promise<Resultat> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  if (isAwaitingGuardianConsent(user)) return { ok: false, error: "Video krever samtykke fra forelder." };
  const parsed = VideoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig video." };
  if (!parsed.data.storagePath.startsWith(`${user.id}/`) || parsed.data.storagePath.includes("..")) {
    return { ok: false, error: "Ugyldig video." };
  }
  const okt = await hentOkt(sessionId);
  if (!okt || okt.playerId !== user.id) return { ok: false, error: "Ingen tilgang til økta." };
  if (!kanLogges(okt)) return { ok: false, error: "Økta er ikke i gang." };
  if (!okt.drills.some((d) => d.id === parsed.data.drillId)) return { ok: false, error: "Øvelsen hører ikke til økta." };
  await prisma.playerSwingVideo.create({
    data: {
      userId: user.id,
      videoUrl: parsed.data.videoUrl,
      storagePath: parsed.data.storagePath,
      liveSessionId: sessionId,
      liveSessionKind: "workbench",
      drillId: parsed.data.drillId,
      status: "PROCESSING",
      consentVerified: !user.requiresGuardianConsent || Boolean(user.guardianConsentGivenAt),
      analysis: { create: { status: "PENDING" } },
    },
  });
  revalider(sessionId);
  return { ok: true };
}
