"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { audit } from "@/lib/audit";
import { nonEmpty } from "@/lib/validation/schemas";
import { prisma } from "@/lib/prisma";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { emailLayout, detailRow, escapeHtml } from "@/lib/email/templates/shared";

const SupportTicketSchema = z.object({
  kategori: z.string().min(1, "Kategori er påkrevd"),
  emne: nonEmpty(200),
  beskrivelse: nonEmpty(2000),
  tillatInnsyn: z.boolean(),
});

type Input = {
  kategori: string;
  emne: string;
  beskrivelse: string;
  tillatInnsyn: boolean;
};

async function sendSupportEpost(input: Input & { ticket: string; navn: string; epost: string }) {
  const klient = resendKlient();
  const html = emailLayout({
    preheader: `Support #${input.ticket}: ${input.emne}`,
    heading: `Ny support-henvendelse — #${input.ticket}`,
    body: [
      detailRow("Fra", `${escapeHtml(input.navn)} (${escapeHtml(input.epost)})`),
      detailRow("Kategori", escapeHtml(input.kategori)),
      detailRow("Emne", escapeHtml(input.emne)),
      detailRow("Tillater innsyn", input.tillatInnsyn ? "Ja" : "Nei"),
      `<p style="margin:16px 0 8px;font-weight:600;">Beskrivelse</p>`,
      `<p style="white-space:pre-wrap;margin:0;">${escapeHtml(input.beskrivelse)}</p>`,
    ].join("\n"),
  });

  await klient.emails.send({
    from: FRA_EPOST,
    to: "post@akgolf.no",
    replyTo: input.epost,
    subject: `[Support #${input.ticket}] ${input.emne}`,
    html,
  });
}

export async function submitSupportTicket(input: Input): Promise<void> {
  SupportTicketSchema.parse(input);
  const user = await requireConsentingUser();

  const rad = await prisma.appFeedback.create({
    data: {
      userId: user.id,
      type: "SUPPORT",
      tekst: `${input.emne}\n\n${input.beskrivelse}`,
      side: "portal/meg/help/kontakt",
    },
  });
  const ticket = rad.id;

  await audit({
    actorId: user.id,
    action: "support.ticket_submitted",
    target: ticket,
    metadata: {
      kategori: input.kategori,
      emne: input.emne.slice(0, 200),
      tillatInnsyn: input.tillatInnsyn,
    },
  });

  // Best-effort varsling — ticketen er allerede lagret ekte i AppFeedback,
  // så en Resend-feil skal aldri blokkere kvitteringen til brukeren.
  try {
    await sendSupportEpost({
      ...input,
      ticket,
      navn: user.name ?? "Ukjent",
      epost: user.email ?? "",
    });
  } catch (err) {
    console.error(
      "[support] e-postutsending feilet:",
      err instanceof Error ? err.message : String(err),
    );
  }

  redirect(`/portal/meg/help/kontakt?ticket=${ticket}`);
}
