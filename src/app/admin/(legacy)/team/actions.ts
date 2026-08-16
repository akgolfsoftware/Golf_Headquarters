"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { assertCapability } from "@/lib/auth/effective-capabilities";
import { Capability, ROLE_CAPABILITIES } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { FRA_EPOST, resendKlient } from "@/lib/email";
import { nonEmpty, email } from "@/lib/validation/schemas";
import { logError } from "@/lib/error-tracking";

const CAPABILITY_VERDIER = Object.values(Capability) as [
  Capability,
  ...Capability[],
];

const InviterCoachSchema = z.object({
  email: email,
  name: nonEmpty(200),
  // G6: valgfrie ekstra-tilganger utover COACH-defaulten, skrives som
  // GRANT-overrides ved opprettelse. Kun ADMIN kan sende disse.
  capabilities: z.array(z.enum(CAPABILITY_VERDIER)).max(50).optional(),
});

export type InviterCoachResult =
  | { ok: true; userId: string; epostSendt: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };


/**
 * Oppretter en ny User med role=COACH og placeholder authId.
 * Coachen får ekte authId første gang hen logger inn via Supabase.
 * Sender invitasjons-epost via Resend hvis konfigurert — feiler ikke
 * hvis Resend mangler.
 */
export async function inviterCoach(
  emailInput: string,
  name: string,
  capabilities?: Capability[],
): Promise<InviterCoachResult> {
  const zodResult = InviterCoachSchema.safeParse({
    email: emailInput,
    name,
    capabilities,
  });
  if (!zodResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const err of zodResult.error.issues) {
      const field = err.path[0];
      if (field) fieldErrors[String(field)] = err.message;
    }
    return { ok: false, error: "Validering feilet", fieldErrors };
  }

  let aktor;
  try {
    // G6: gates på INVITE_USERS (utenfor COACH-defaulten — i praksis ADMIN
    // pluss trenere med eksplisitt GRANT invite_users).
    aktor = await requireCoachActionUser();
    await assertCapability(aktor, Capability.INVITE_USERS);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "forbidden",
    };
  }

  // Kun ADMIN kan tildele ekstra-tilganger — en coach med INVITE_USERS skal
  // ikke kunne gi bort capabilities hen ikke selv styrer.
  const onskedeCapabilities = zodResult.data.capabilities ?? [];
  if (onskedeCapabilities.length > 0 && aktor.role !== "ADMIN") {
    return {
      ok: false,
      error: "Kun admin kan tildele ekstra tilganger ved invitasjon.",
    };
  }

  const navn = (name ?? "").trim();
  const epost = (emailInput ?? "").trim().toLowerCase();

  const eksisterende = await prisma.user.findUnique({
    where: { email: epost },
    select: { id: true, role: true },
  });
  if (eksisterende) {
    return {
      ok: false,
      error: "Registreringen kunne ikke fullføres. Kontakt support hvis problemet vedvarer.",
      fieldErrors: { email: "E-posten kan ikke brukes. Prøv en annen eller kontakt support." },
    };
  }

  const placeholderAuthId = `pending-${crypto.randomUUID()}`;
  const ny = await prisma.user.create({
    data: {
      authId: placeholderAuthId,
      email: epost,
      name: navn,
      role: "COACH",
    },
    select: { id: true, email: true, name: true },
  });

  // G6: skriv GRANT-overrides for valgte ekstra-tilganger. Caps som allerede
  // ligger i COACH-defaulten hoppes over — de er effektive uten override.
  const coachDefault = new Set<Capability>(ROLE_CAPABILITIES.COACH);
  const ekstra = [...new Set(onskedeCapabilities)].filter(
    (cap) => !coachDefault.has(cap),
  );
  if (ekstra.length > 0) {
    await prisma.userCapability.createMany({
      data: ekstra.map((cap) => ({
        userId: ny.id,
        capability: cap,
        mode: "GRANT",
        grantedById: aktor.id,
        note: "Gitt ved invitasjon",
      })),
      skipDuplicates: true,
    });
  }

  // Send invitasjons-epost via Resend hvis konfigurert.
  let epostSendt = false;
  if (process.env.RESEND_API_KEY) {
    try {
      const klient = resendKlient();
      await klient.emails.send({
        from: FRA_EPOST,
        to: ny.email,
        subject: "Du er invitert som coach i AK Golf HQ",
        html: `<!doctype html>
<html lang="nb"><body style="font-family: system-ui, sans-serif; max-width: 580px; margin: 32px auto; color: #0A1F17;">
  <h1 style="font-size: 24px; font-weight: 600;">Hei ${ny.name} —</h1>
  <p>${aktor.name} har invitert deg som coach i AK Golf HQ.</p>
  <p>Logg inn med denne e-postadressen (${ny.email}) for å komme i gang:</p>
  <p><a href="https://akgolf.no/auth/login" style="display:inline-block;padding:12px 24px;background:#141413;color:#FAF9F5;text-decoration:none;border-radius:6px;font-weight:600;">Logg inn</a></p>
</body></html>`,
      });
      epostSendt = true;
    } catch (error) {
      await logError({ context: "admin.team.inviterCoach.epost", error, severity: "warn" });
    }
  }

  await audit({
    actorId: aktor.id,
    action: "user.invited",
    target: `User:${ny.id}`,
    metadata: { role: "COACH", email: ny.email, epostSendt, ekstraTilganger: ekstra },
  });

  revalidatePath("/admin/team");

  return { ok: true, userId: ny.id, epostSendt };
}
