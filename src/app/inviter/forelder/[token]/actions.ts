"use server";

// Aksepter forelder-invitasjon. Oppretter Supabase-bruker via service-role,
// Prisma User med role=PARENT, og ParentRelation mellom forelder og barn.

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { claimPendingAccountByEmail } from "@/lib/auth/claim-pending-account";
import { resendKlient, FRA_EPOST } from "@/lib/email";

type AksepterResult = { ok: false; error: string } | { ok: true; redirect: string };

function relasjonsTekst(r: string): string {
  if (r === "FATHER") return "Far";
  if (r === "MOTHER") return "Mor";
  return "Verge";
}

export async function aksepterInvitasjon(formData: FormData): Promise<AksepterResult> {
  const token = String(formData.get("token") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!token || !firstName || !lastName) {
    return { ok: false, error: "Fyll inn navn." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Passord må være minst 8 tegn." };
  }

  const invitation = await prisma.parentInvitation.findUnique({
    where: { token },
    include: { player: { select: { id: true, name: true } } },
  });

  if (!invitation) return { ok: false, error: "Ugyldig invitasjon." };
  if (invitation.acceptedAt) return { ok: false, error: "Invitasjonen er allerede brukt." };
  if (invitation.expiresAt < new Date()) {
    return { ok: false, error: "Invitasjonen er utløpt." };
  }

  const email = invitation.email.toLowerCase();
  const navn = `${firstName} ${lastName}`.trim();

  // 1) Opprett Supabase Auth-bruker (eller hent eksisterende).
  const admin = supabaseAdmin();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName,
      lastName,
      role: "PARENT",
      tier: "GRATIS",
    },
  });

  let authId = created?.user?.id;
  if (createErr || !authId) {
    // Hvis brukeren finnes fra før — finn ID-en.
    const lower = email;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users.find((u) => u.email?.toLowerCase() === lower);
    if (!existing) {
      return {
        ok: false,
        error: createErr?.message ?? "Kunne ikke opprette bruker.",
      };
    }
    authId = existing.id;
  }

  // 2) Opprett / oppdater Prisma User med role=PARENT.
  // Først: hvis guardian-consent-flyten allerede laget en ventende rad for denne
  // e-posten, koble den verifiserte authId-en til SAMME rad (Supabase har nettopp
  // bekreftet eierskap via email_confirm). Da finner upsert under raden på authId
  // og slipper å kollidere på unik e-post.
  await claimPendingAccountByEmail(authId, email);
  const parentUser = await prisma.user.upsert({
    where: { authId },
    update: { name: navn, phone: phone || null, role: "PARENT" },
    create: {
      authId,
      email,
      name: navn,
      phone: phone || null,
      role: "PARENT",
    },
  });

  // 3) Opprett ParentRelation barn↔forelder hvis ikke finnes.
  await prisma.parentRelation.upsert({
    where: {
      parentId_childId: { parentId: parentUser.id, childId: invitation.playerId },
    },
    update: { approved: true },
    create: {
      parentId: parentUser.id,
      childId: invitation.playerId,
      relationship: relasjonsTekst(invitation.relation),
      approved: true,
    },
  });

  // 4) Marker invitasjon som godtatt.
  await prisma.parentInvitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date(), acceptedById: parentUser.id },
  });

  // 5) Velkomst-epost (best effort).
  try {
    const klient = resendKlient();
    await klient.emails.send({
      from: FRA_EPOST,
      to: email,
      subject: "Velkommen til AK Golf Foreldreportal",
      html: `<p>Hei ${firstName},</p>
<p>Du er nå koblet til ${invitation.player.name} sin treningsprofil.</p>
<p>Logg inn på <a href="https://akgolf.no/auth/login">akgolf.no</a> for å se ukerapport, fakturaer og varsler.</p>`,
    });
  } catch (err) {
    console.error("[aksepterInvitasjon] velkomstepost feilet", err);
  }

  redirect("/forelder");
}
