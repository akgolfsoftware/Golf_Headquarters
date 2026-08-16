"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { assertCapability } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { gruppemedlemRolleSchema, type GruppemedlemRolle } from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { pushGruppeTime } from "@/lib/google-calendar-kilder";
import { FRA_EPOST, resendKlient } from "@/lib/email";
import { email as epostSchema } from "@/lib/validation/schemas";
import { logError } from "@/lib/error-tracking";

type ActionResult = { ok: true } | { ok: false; feil: string };

async function krevCoach() {
  try {
    const user = await requireCoachActionUser();
    // G6: alle actions her endrer grupper/medlemmer → MANAGE_GROUPS
    // (i COACH-defaulten; kan trekkes per trener via REVOKE).
    await assertCapability(user, Capability.MANAGE_GROUPS);
    return user;
  } catch {
    return null;
  }
}

/**
 * Eierskapsporten for gruppe-actions: en COACH har redigeringstilgang når hun
 * er hovedtrener (Group.coachId) ELLER selv er aktivt COACH-medlem i gruppen
 * (GroupMember.role "COACH", endedAt null — plan G5). ASSISTANT-medlemskap gir
 * IKKE redigering, kun innsyn via scoping-grenen i coached.ts. ADMIN kan endre
 * alle. Alle actions i denne fila tar en groupId fra klienten — uten porten
 * kunne en coach endre en annen coachs gruppe ved å bytte id-en.
 */
async function eierGruppen(
  coach: { id: string; role: string },
  groupId: string,
): Promise<boolean> {
  const treff = await prisma.group.findFirst({
    where: {
      id: groupId,
      ...(coach.role === "COACH"
        ? {
            OR: [
              { coachId: coach.id },
              { members: { some: { userId: coach.id, role: "COACH", endedAt: null } } },
            ],
          }
        : {}),
    },
    select: { id: true },
  });
  return treff != null;
}

/**
 * Legger en eksisterende bruker inn i en treningsgruppe.
 * Rolle (plan G5): PLAYER (default, uendret spiller-flyt), ASSISTANT
 * (hjelpetrener) eller COACH (trener). Trenerrollene krever at målbrukeren
 * selv har User.role COACH eller ADMIN — og porten `eierGruppen` over sikrer
 * at kun gruppeeier, aktivt COACH-medlem eller ADMIN gjør innmeldingen.
 * Dedup mot @@unique([groupId, userId]): fanges som P2002 → vennlig feil.
 */
export async function leggTilGruppemedlem(
  groupId: string,
  userId: string,
  rolle: GruppemedlemRolle = "PLAYER",
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  // Aldri stol på klient-verdien: role skrives rett i GroupMember.role og
  // styrer både innsyn (coached.ts) og redigering (eierGruppen). Zod ved
  // grensen (invariant 6).
  const rolleParse = gruppemedlemRolleSchema.safeParse(rolle);
  if (!rolleParse.success) return { ok: false, feil: "Ugyldig rolle." };
  const valgtRolle = rolleParse.data;

  if (!(await eierGruppen(coach, groupId))) return { ok: false, feil: "Fant ikke gruppen." };

  if (valgtRolle === "PLAYER") {
    // Coach-scoping. Dette er IKKE bare en lesetilgangs-sjekk: gruppemedlemskap
    // er selv en av tingene som gjør en spiller «coachet» av deg
    // (coached.ts). Uten porten kunne en coach legge en annen coachs spiller inn
    // i egen gruppe og dermed skaffe seg full tilgang til spilleren — hele
    // scopingen omgått i ett kall.
    const spiller = await prisma.user.findFirst({
      where: { AND: [coachScopedPlayerWhere(coach), { id: userId }] },
      select: { id: true, role: true, deletedAt: true },
    });
    if (!spiller || spiller.deletedAt) return { ok: false, feil: "Fant ikke spilleren." };
    if (spiller.role !== "PLAYER") return { ok: false, feil: "Bare spillere kan legges til i en gruppe." };
  } else {
    // Trenerroller (COACH/ASSISTANT): målbrukeren må selv være trener i
    // systemet — en spiller kan aldri gis trenerinnsyn i andre spillere via
    // et gruppemedlemskap. Ærlig feil fremfor stille nedgradering.
    const trener = await prisma.user.findFirst({
      where: { id: userId, role: { in: ["COACH", "ADMIN"] } },
      select: { id: true, deletedAt: true },
    });
    if (!trener || trener.deletedAt) {
      return { ok: false, feil: "Bare brukere med trenerrolle (COACH eller ADMIN) kan legges til som trener." };
    }
  }

  const hvem = valgtRolle === "PLAYER" ? "Spilleren" : "Treneren";

  // Soft-end-modellen (plan G1, gjelder alle roller): raden per
  // (groupId, userId) er unik og gjenbrukes — re-innmelding nuller endedAt og
  // stempler nytt joinedAt.
  const eksisterende = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { id: true, endedAt: true },
  });
  if (eksisterende && eksisterende.endedAt === null) {
    return { ok: false, feil: `${hvem} er allerede medlem av gruppen.` };
  }
  if (eksisterende) {
    // Reaktivering: rollen følger valget i DETTE kallet — beholdes når den er
    // lik, oppdateres når innmeldingen nå gjelder en annen rolle (G5).
    await prisma.groupMember.update({
      where: { id: eksisterende.id },
      data: { endedAt: null, joinedAt: new Date(), role: valgtRolle },
    });
  } else {
    try {
      await prisma.groupMember.create({
        data: { groupId, userId, role: valgtRolle },
      });
    } catch (e) {
      // P2002: unique constraint — kappløp med et parallelt kall.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { ok: false, feil: `${hvem} er allerede medlem av gruppen.` };
      }
      throw e;
    }
  }

  await audit({
    actorId: coach.id,
    action: "group_member.added",
    target: `Group:${groupId}/User:${userId}`,
    metadata: { role: valgtRolle },
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  return { ok: true };
}

const InviterSpillereSchema = z.object({
  groupId: z.string().min(1),
  epostliste: z
    .array(z.string())
    .min(1, "Oppgi minst én e-postadresse.")
    .max(50, "Maks 50 e-postadresser per invitasjon."),
});

export type InviterSpillereResultat =
  | {
      ok: true;
      /** Eksisterende spillere lagt til (eller reaktivert) i gruppen. */
      lagtTil: string[];
      /** Nye pending-profiler opprettet + invitasjons-e-post forsøkt sendt. */
      invitert: string[];
      /** E-poster som ikke gikk gjennom, med årsak per rad. */
      feilet: { epost: string; feil: string }[];
    }
  | { ok: false; feil: string };

/**
 * Batch-gruppeinvitasjon på e-post (plan T3).
 *
 * Per e-post: finnes brukeren allerede → gjenbruk HELE porten i
 * leggTilGruppemedlem (coach-scoping + soft-end-reaktivering + audit) — en
 * annen coachs spiller gir «Fant ikke spilleren», bevisst: e-postinvitasjon
 * skal ikke omgå coach-scopingen. Finnes ingen bruker → opprett pending-User
 * (mønsteret fra admin «Ny spiller»/inviter coach: placeholder-authId som
 * claimPendingAccountByEmail kobler til ekte Supabase-konto ved første
 * innlogging) med profilType TALENT / profilKilde TALENTHQ (gratis låst
 * testprofil), meld inn i gruppen og send invitasjons-e-post via Resend.
 */
export async function inviterSpillereTilGruppe(
  groupId: string,
  epostliste: string[],
): Promise<InviterSpillereResultat> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  const parsed = InviterSpillereSchema.safeParse({ groupId, epostliste });
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldig input." };
  }

  // Eierskap + gruppenavn (til e-posten) i samme spørring — samme port som
  // eierGruppen(): COACH når kun egne grupper, ADMIN alle.
  const gruppe = await prisma.group.findFirst({
    where: {
      id: parsed.data.groupId,
      ...(coach.role === "COACH" ? { coachId: coach.id } : {}),
    },
    select: { id: true, name: true },
  });
  if (!gruppe) return { ok: false, feil: "Fant ikke gruppen." };

  // Normaliser + dedup — samme e-post to ganger i lista skal ikke gi to rader.
  const eposter = [...new Set(epostliste.map((e) => e.trim().toLowerCase()).filter(Boolean))];

  const lagtTil: string[] = [];
  const invitert: string[] = [];
  const feilet: { epost: string; feil: string }[] = [];

  for (const epost of eposter) {
    if (!epostSchema.safeParse(epost).success) {
      feilet.push({ epost, feil: "Ugyldig e-postadresse." });
      continue;
    }

    const eksisterende = await prisma.user.findFirst({
      where: { email: { equals: epost, mode: "insensitive" } },
      select: { id: true },
    });

    if (eksisterende) {
      const res = await leggTilGruppemedlem(gruppe.id, eksisterende.id);
      if (res.ok) lagtTil.push(epost);
      else feilet.push({ epost, feil: res.feil });
      continue;
    }

    try {
      const ny = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            authId: `pending-${crypto.randomUUID()}`,
            email: epost,
            name: epost,
            role: "PLAYER",
            profilType: "TALENT",
            profilKilde: "TALENTHQ",
          },
          select: { id: true, email: true },
        });
        await tx.groupMember.create({ data: { groupId: gruppe.id, userId: u.id } });
        return u;
      });

      // Invitasjons-e-post via Resend hvis konfigurert — feiler aldri hardt
      // (mønster fra inviterCoach). ?epost= prefiller registreringsskjemaet.
      if (process.env.RESEND_API_KEY) {
        try {
          const klient = resendKlient();
          await klient.emails.send({
            from: FRA_EPOST,
            to: ny.email,
            subject: `Du er invitert til ${gruppe.name} i AK Golf HQ`,
            html: `<!doctype html>
<html lang="nb"><body style="font-family: system-ui, sans-serif; max-width: 580px; margin: 32px auto; color: #0A1F17;">
  <h1 style="font-size: 24px; font-weight: 600;">Hei —</h1>
  <p>${coach.name} har invitert deg til gruppen «${gruppe.name}» i AK Golf HQ.</p>
  <p>Opprett en gratis testprofil — testbatteri, stats og SG-registrering — med denne e-postadressen (${ny.email}):</p>
  <p><a href="https://akgolf.no/auth/signup?kilde=talenthq&epost=${encodeURIComponent(ny.email)}" style="display:inline-block;padding:12px 24px;background:#141413;color:#FAF9F5;text-decoration:none;border-radius:6px;font-weight:600;">Opprett profil</a></p>
</body></html>`,
          });
        } catch (error) {
          await logError({
            context: "admin.grupper.inviterSpillere.epost",
            error,
            severity: "warn",
          });
        }
      }

      await audit({
        actorId: coach.id,
        action: "group_member.invited",
        target: `Group:${gruppe.id}/User:${ny.id}`,
        metadata: { epost, profilType: "TALENT" },
      });

      invitert.push(epost);
    } catch (e) {
      // P2002: kappløp på unik e-post (parallell invitasjon/registrering).
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        feilet.push({ epost, feil: "E-posten er allerede i bruk." });
      } else {
        await logError({ context: "admin.grupper.inviterSpillere", error: e, severity: "error" });
        feilet.push({ epost, feil: "Kunne ikke invitere. Prøv igjen." });
      }
    }
  }

  revalidatePath(`/admin/grupper/${gruppe.id}`);
  return { ok: true, lagtTil, invitert, feilet };
}

/**
 * Fjerner en spiller fra en gruppe. Idempotent: ukjent medlemskap → vennlig feil.
 */
export async function fjernGruppemedlem(
  groupId: string,
  userId: string,
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };
  if (!(await eierGruppen(coach, groupId))) return { ok: false, feil: "Fant ikke gruppen." };

  // Soft-end (plan G1): raden beholdes for historikk, endedAt markerer
  // utmeldingen. Alle «medlem nå»-spørringer filtrerer på endedAt: null.
  const medlem = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { id: true, endedAt: true },
  });
  if (!medlem || medlem.endedAt !== null) {
    return { ok: false, feil: "Spilleren er ikke medlem av gruppen." };
  }
  await prisma.groupMember.update({
    where: { id: medlem.id },
    data: { endedAt: new Date() },
  });

  await audit({
    actorId: coach.id,
    action: "group_member.removed",
    target: `Group:${groupId}/User:${userId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  return { ok: true };
}

/**
 * Opprett gruppe trening på tidspunkt.
 * Støtter antall deltagere (maxParticipants), dato, tid, varighet.
 * recurring = "NONE" for engang.
 */
export async function opprettGruppeTrening(
  groupId: string,
  data: {
    title: string;
    description?: string;
    startAt: Date | string;
    endAt: Date | string;
    location?: string;
    recurring?: string;
    maxParticipants?: number;
  },
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  if (!(await eierGruppen(coach, groupId))) return { ok: false, feil: "Fant ikke gruppen." };

  const startAt = data.startAt instanceof Date ? data.startAt : new Date(data.startAt);
  const endAt = data.endAt instanceof Date ? data.endAt : new Date(data.endAt);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { ok: false, feil: "Ugyldig dato/tid." };
  }

  let opprettetId: string;
  try {
    const opprettet = await prisma.groupSchedule.create({
      data: {
        groupId,
        title: data.title,
        description: data.description || null,
        startAt,
        endAt,
        location: data.location || null,
        recurring: data.recurring || "NONE",
        maxParticipants: data.maxParticipants || null,
      },
    });
    opprettetId = opprettet.id;
  } catch (_e) {
    return { ok: false, feil: "Kunne ikke opprette gruppe trening." };
  }

  // Steg 3: gruppetimer skal også synes i Google-kalenderen.
  await pushGruppeTime(opprettetId);

  await audit({
    actorId: coach.id,
    action: "group_schedule.created",
    target: `Group:${groupId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  revalidatePath(`/admin/grupper/${groupId}/timeplan`);
  return { ok: true };
}

/**
 * Dupliser gruppe time.
 * Kopier alle felter, sett ny startAt (dato, tid). Varighet beholdes.
 * Inkluder antall deltagere.
 */
export async function dupliserGruppeTime(
  groupId: string,
  originalId: string,
  newStartAt: Date | string,
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };
  if (!(await eierGruppen(coach, groupId))) return { ok: false, feil: "Fant ikke gruppen." };

  // Originalen må tilhøre SAMME gruppe — ellers kunne en time kopieres ut av
  // en annen coachs gruppe og inn i sin egen.
  const original = await prisma.groupSchedule.findFirst({
    where: { id: originalId, groupId },
    select: { title: true, description: true, startAt: true, endAt: true, location: true, recurring: true, maxParticipants: true },
  });
  if (!original) return { ok: false, feil: "Fant ikke original tid." };

  const startAt = newStartAt instanceof Date ? newStartAt : new Date(newStartAt);
  if (Number.isNaN(startAt.getTime())) {
    return { ok: false, feil: "Ugyldig ny tidspunkt." };
  }

  const duration = original.endAt.getTime() - original.startAt.getTime();
  const endAt = new Date(startAt.getTime() + duration);

  let duplikatId: string;
  try {
    const duplikat = await prisma.groupSchedule.create({
      data: {
        groupId,
        title: original.title,
        description: original.description,
        startAt,
        endAt,
        location: original.location,
        recurring: original.recurring,
        maxParticipants: original.maxParticipants,
      },
    });
    duplikatId = duplikat.id;
  } catch (_e) {
    return { ok: false, feil: "Kunne ikke duplisere." };
  }

  await pushGruppeTime(duplikatId);

  await audit({
    actorId: coach.id,
    action: "group_schedule.duplicated",
    target: `Group:${groupId}/Schedule:${originalId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  revalidatePath(`/admin/grupper/${groupId}/timeplan`);
  return { ok: true };
}
