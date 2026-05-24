"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { FRA_EPOST, resendKlient } from "@/lib/email";
import { nonEmpty, email } from "@/lib/validation/schemas";

const InviterCoachSchema = z.object({
  email: email,
  name: nonEmpty(200),
});

export type InviterCoachResult =
  | { ok: true; userId: string; epostSendt: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function krevAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

/**
 * Oppretter en ny User med role=COACH og placeholder authId.
 * Coachen får ekte authId første gang hen logger inn via Supabase.
 * Sender invitasjons-epost via Resend hvis konfigurert — feiler ikke
 * hvis Resend mangler.
 */
export async function inviterCoach(
  emailInput: string,
  name: string,
): Promise<InviterCoachResult> {
  const zodResult = InviterCoachSchema.safeParse({ email: emailInput, name });
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
    aktor = await krevAdmin();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "forbidden",
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

  const placeholderAuthId = `pending:${crypto.randomUUID()}`;
  const ny = await prisma.user.create({
    data: {
      authId: placeholderAuthId,
      email: epost,
      name: navn,
      role: "COACH",
    },
    select: { id: true, email: true, name: true },
  });

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
  <p><a href="https://akgolf.no/auth/login" style="display:inline-block;padding:12px 24px;background:#005840;color:#D1F843;text-decoration:none;border-radius:6px;font-weight:600;">Logg inn</a></p>
</body></html>`,
      });
      epostSendt = true;
    } catch (err) {
      console.error("[inviterCoach] Resend-feil", err);
    }
  }

  await audit({
    actorId: aktor.id,
    action: "user.invited",
    target: `User:${ny.id}`,
    metadata: { role: "COACH", email: ny.email, epostSendt },
  });

  revalidatePath("/admin/team");

  return { ok: true, userId: ny.id, epostSendt };
}
