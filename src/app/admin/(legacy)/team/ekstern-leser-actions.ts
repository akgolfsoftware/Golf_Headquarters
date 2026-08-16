"use server";

/**
 * Admin-oppretting av ekstern leser (plan T8): en Team Norway-/WANG-ansvarlig
 * får GUEST-innlogging med lesetilgang til /innsyn. Mønster: inviterCoach
 * (./actions.ts) — pending-User med placeholder authId + invitasjons-e-post.
 *
 * Tilgangen bæres av to ting sammen:
 *  - GRANT-overrides for VIEW_SHARED_TEST_RESULTS/VIEW_SHARED_STATS (mandatet)
 *  - EksternLeserGruppe-rader (hvilke grupper)
 * Ingen av delene åpner spillerdata alene — spillerens DelingsSamtykke er
 * alltid tredje lås (håndheves i src/lib/auth/ekstern-leser-scope.ts).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminActionUser } from "@/lib/auth/action-guards";
import { Capability } from "@/lib/auth/cbac";
import { DELING_SCOPES, type DelingScope } from "@/lib/deling/samtykke-regler";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { FRA_EPOST, resendKlient } from "@/lib/email";
import { nonEmpty, email } from "@/lib/validation/schemas";
import { logError } from "@/lib/error-tracking";

const SCOPE_TIL_CAPABILITY: Record<DelingScope, Capability> = {
  TEST_RESULTATER: Capability.VIEW_SHARED_TEST_RESULTS,
  STATS: Capability.VIEW_SHARED_STATS,
};

const OpprettEksternLeserSchema = z.object({
  email: email,
  name: nonEmpty(200),
  groupIds: z.array(z.string().min(1)).min(1, "Velg minst én gruppe").max(20),
  scopes: z.array(z.enum(DELING_SCOPES)).min(1, "Velg minst ett innsyn").max(2),
});

export type OpprettEksternLeserResult =
  | { ok: true; userId: string; epostSendt: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** ADMIN-only: opprett ekstern leser med gruppetilganger og innsyns-scopes. */
export async function opprettEksternLeser(
  emailInput: string,
  name: string,
  groupIds: string[],
  scopes: string[],
): Promise<OpprettEksternLeserResult> {
  let aktor;
  try {
    aktor = await requireAdminActionUser();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "forbidden" };
  }

  const zodResult = OpprettEksternLeserSchema.safeParse({
    email: emailInput,
    name,
    groupIds,
    scopes,
  });
  if (!zodResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of zodResult.error.issues) {
      const field = issue.path[0];
      if (field) fieldErrors[String(field)] = issue.message;
    }
    return { ok: false, error: "Validering feilet", fieldErrors };
  }
  const input = zodResult.data;
  const epost = input.email.trim().toLowerCase();
  const navn = input.name.trim();

  const grupper = await prisma.group.findMany({
    where: { id: { in: input.groupIds } },
    select: { id: true, name: true },
  });
  if (grupper.length !== input.groupIds.length) {
    return { ok: false, error: "En eller flere grupper finnes ikke." };
  }

  const eksisterende = await prisma.user.findUnique({
    where: { email: epost },
    select: { id: true },
  });
  if (eksisterende) {
    return {
      ok: false,
      error: "E-posten er allerede i bruk.",
      fieldErrors: { email: "E-posten kan ikke brukes. Prøv en annen eller kontakt support." },
    };
  }

  const ny = await prisma.user.create({
    data: {
      authId: `pending-${crypto.randomUUID()}`,
      email: epost,
      name: navn,
      role: "GUEST",
    },
    select: { id: true, email: true, name: true },
  });

  const capabilities = [...new Set(input.scopes.map((s) => SCOPE_TIL_CAPABILITY[s]))];
  await prisma.userCapability.createMany({
    data: capabilities.map((cap) => ({
      userId: ny.id,
      capability: cap,
      mode: "GRANT",
      grantedById: aktor.id,
      note: "Ekstern leser (T8) — gitt ved opprettelse",
    })),
    skipDuplicates: true,
  });

  await prisma.eksternLeserGruppe.createMany({
    data: input.groupIds.map((groupId) => ({
      userId: ny.id,
      groupId,
      opprettetAvId: aktor.id,
    })),
    skipDuplicates: true,
  });

  let epostSendt = false;
  if (process.env.RESEND_API_KEY) {
    try {
      const klient = resendKlient();
      await klient.emails.send({
        from: FRA_EPOST,
        to: ny.email,
        subject: "Du har fått lesetilgang i AK Golf HQ",
        html: `<!doctype html>
<html lang="nb"><body style="font-family: system-ui, sans-serif; max-width: 580px; margin: 32px auto; color: #0A1F17;">
  <h1 style="font-size: 24px; font-weight: 600;">Hei ${ny.name} —</h1>
  <p>${aktor.name} har gitt deg lesetilgang i AK Golf HQ (${grupper.map((g) => g.name).join(", ")}).</p>
  <p>Du ser kun testresultater og statistikk for spillere som har samtykket til deling — ingen treningsplaner eller annet innhold.</p>
  <p>Logg inn med denne e-postadressen (${ny.email}) for å komme i gang:</p>
  <p><a href="https://akgolf.no/auth/login?next=/innsyn" style="display:inline-block;padding:12px 24px;background:#141413;color:#FAF9F5;text-decoration:none;border-radius:6px;font-weight:600;">Logg inn</a></p>
</body></html>`,
      });
      epostSendt = true;
    } catch (error) {
      await logError({
        context: "admin.team.opprettEksternLeser.epost",
        error,
        severity: "warn",
      });
    }
  }

  await audit({
    actorId: aktor.id,
    action: "ekstern_leser.opprettet",
    target: `User:${ny.id}`,
    metadata: {
      email: ny.email,
      groupIds: input.groupIds,
      scopes: input.scopes,
      epostSendt,
    },
  });

  revalidatePath("/admin/team/ekstern");
  return { ok: true, userId: ny.id, epostSendt };
}

export type TrekkEksternLeserResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * ADMIN-only: trekk hele lesetilgangen — revokedAt på alle aktive
 * EksternLeserGruppe-rader + fjern GRANT-overridene for de to view-capene.
 * Radene beholdes (historikk); brukeren kan gis tilgang på nytt senere.
 */
export async function trekkEksternLeser(
  userId: string,
): Promise<TrekkEksternLeserResult> {
  let aktor;
  try {
    aktor = await requireAdminActionUser();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "forbidden" };
  }

  const leser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });
  if (!leser || leser.role !== "GUEST") {
    return { ok: false, error: "Brukeren er ikke en ekstern leser." };
  }

  await prisma.eksternLeserGruppe.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await prisma.userCapability.deleteMany({
    where: {
      userId,
      capability: {
        in: [Capability.VIEW_SHARED_TEST_RESULTS, Capability.VIEW_SHARED_STATS],
      },
    },
  });

  await audit({
    actorId: aktor.id,
    action: "ekstern_leser.trukket",
    target: `User:${userId}`,
    metadata: { email: leser.email },
  });

  revalidatePath("/admin/team/ekstern");
  return { ok: true };
}
