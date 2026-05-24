"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { audit } from "@/lib/audit";
import { nonEmpty } from "@/lib/validation/schemas";

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

export async function submitSupportTicket(input: Input): Promise<void> {
  SupportTicketSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  // Generer et enkelt ticket-id basert på timestamp.
  const ticket = `PHQ-${Math.floor(Date.now() / 1000) % 100000}`;

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

  // I produksjon: send til support-systemet (e-post / API) her.

  redirect(`/portal/meg/help/kontakt?ticket=${ticket}`);
}
