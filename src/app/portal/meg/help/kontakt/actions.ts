"use server";

/**
 * «Skriv til oss» (pakke 15): ett skjema for spørsmål, feil, forslag og ros. Erstatter Kontakt
 * (submitSupportTicket) og Tilbakemelding (submitFeedback). Meldingen lagres alltid på kontoen
 * (AppFeedback) og sendes til post@akgolf.no med svar-til spillerens e-post.
 * «Send anonymt» og «Tillat at support ser profilen min» er fjernet (beslutninger.md §PRØVEUKE …,
 * 16.10.2026): bryteren lovet anonymitet som ikke fantes, og avkrysningen ble ikke brukt.
 */

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { emailLayout, detailRow, escapeHtml } from "@/lib/email/templates/shared";
import { logError } from "@/lib/error-tracking";
import { SKRIV_TYPE_NAVN, saksnummer } from "@/lib/portal-hjelp/saksnummer";

const SkrivSchema = z.object({
  type: z.enum(["sporsmal", "bug", "forslag", "ros"]),
  emne: z.string().trim().min(1, "Skriv et emne").max(200),
  tekst: z.string().trim().min(1, "Beskriv det").max(1000),
  fornoyd: z.number().int().min(0).max(10).nullable(),
  side: z.string().trim().max(200).nullable(),
});

export type SkrivTilOssInput = z.input<typeof SkrivSchema>;
export type SkrivTilOssSvar = { ok: false; feil: string };

export async function sendSkrivTilOss(input: SkrivTilOssInput): Promise<SkrivTilOssSvar> {
  const p = SkrivSchema.safeParse(input);
  if (!p.success) return { ok: false, feil: p.error.issues[0]?.message ?? "Sjekk feltene." };
  const user = await requireConsentingUser();
  const d = p.data;

  const tekst = [d.emne, "", d.tekst, d.fornoyd != null ? `\nFornøyd med PlayerHQ: ${d.fornoyd} av 10` : ""].join("\n").trim();
  const rad = await prisma.appFeedback.create({
    data: { userId: user.id, type: d.type, tekst, side: d.side ?? "portal/meg/help/kontakt" },
    select: { id: true },
  });

  await audit({
    actorId: user.id,
    action: "skriv-til-oss.sendt",
    target: rad.id,
    metadata: { type: d.type, tekstLengde: d.tekst.length, fornoyd: d.fornoyd },
  });

  // Best-effort varsling: meldingen er alt lagret, så en Resend-feil stopper ikke kvitteringen.
  try {
    const nr = saksnummer(rad.id);
    await resendKlient().emails.send({
      from: FRA_EPOST,
      to: "post@akgolf.no",
      replyTo: user.email ?? undefined,
      subject: `[${nr}] ${SKRIV_TYPE_NAVN[d.type]}: ${d.emne}`,
      html: emailLayout({
        preheader: `${nr}: ${d.emne}`,
        heading: `${SKRIV_TYPE_NAVN[d.type]} fra PlayerHQ — ${nr}`,
        body: [
          detailRow("Fra", `${user.name ?? "—"} (${user.email ?? "—"})`),
          detailRow("Type", SKRIV_TYPE_NAVN[d.type]),
          detailRow("Emne", d.emne),
          d.side ? detailRow("Side", d.side) : "",
          d.fornoyd != null ? detailRow("Fornøyd", `${d.fornoyd} av 10`) : "",
          `<p style="white-space:pre-wrap;margin:16px 0 0;">${escapeHtml(d.tekst)}</p>`,
        ].join("\n"),
      }),
    });
  } catch (error) {
    await logError({ context: "skriv-til-oss.epost", error, meta: { userId: user.id, id: rad.id }, severity: "warn" });
  }

  redirect(`/portal/meg/help/kontakt?sendt=${encodeURIComponent(rad.id)}`);
}

const VurderSchema = z.object({ slug: z.string().trim().min(1).max(120), nyttig: z.boolean() });

/** «Var dette nyttig?» under en hjelpeartikkel. Lagres som AppFeedback av typen «artikkel». */
export async function vurderArtikkel(input: { slug: string; nyttig: boolean }): Promise<{ ok: boolean }> {
  const p = VurderSchema.safeParse(input);
  if (!p.success) return { ok: false };
  const user = await requireConsentingUser();
  await prisma.appFeedback.create({
    data: { userId: user.id, type: "artikkel", tekst: `${p.data.slug}: ${p.data.nyttig ? "nyttig" : "ikke nyttig"}`, side: `portal/meg/help/artikkel/${p.data.slug}` },
  });
  return { ok: true };
}
