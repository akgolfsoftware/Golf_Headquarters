/**
 * B4 (Bølge 3) — betalings-purring: trapp på utestående betalinger.
 *   ≥3 dager  → purring 1 (auto-e-post)
 *   ≥10 dager → purring 2 (auto-e-post)
 *   ≥17 dager → kø-sak PAYMENT_FOLLOWUP i A1 — MENNESKE tar over.
 * Maks 2 automatiske utsendelser per betaling (Del 3-e-postregelen:
 * purring er eneste tillatte auto-utsendelse, deretter menneske).
 *
 * Vern:
 * - AKTIVERINGSDATO: betalinger opprettet før 2026-07-13 røres ALDRI —
 *   Payment-tabellen bærer en historisk import (mai 2026, 282 FAILED-rader
 *   uten bruker-kobling og med duplikater) som ikke skal purres.
 * - Kun betalinger med koblet bruker (userId) og beløp > 0.
 * - Mindreårig spiller: e-posten går til godkjent foresatt — ALDRI til
 *   barnet. Uten foresatt med e-post → rett i kø-sak (menneske).
 * - E-postmal: EmailTemplate-slug «betalings-purring» ({{name}}, {{amount}},
 *   {{description}}, {{purringNr}}); opprettes med standardtekst ved første
 *   kjøring hvis den mangler (redigerbar i admin).
 *
 * Sporing: metadata.purringer på Payment ([{nivaa, sentAt}]) +
 * metadata.purreEskalert når kø-saken er opprettet — idempotent trapp.
 */

import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { isMinor } from "@/lib/auth/minor";

const B4_AKTIV_FRA = new Date("2026-07-13T00:00:00+02:00");
const PURRING_1_DAGER = 3;
const PURRING_2_DAGER = 10;
const ESKALER_DAGER = 17;
const MAL_SLUG = "betalings-purring";

const purringerSchema = z
  .array(z.object({ nivaa: z.number(), sentAt: z.string() }))
  .catch([]);

const STANDARD_MAL = {
  subject: "Påminnelse: utestående betaling hos AK Golf ({{amount}})",
  body:
    "Hei {{name}},\n\n" +
    "Vi vil minne om en utestående betaling på **{{amount}}**.\n\n" +
    "Gjelder: {{description}}\n\n" +
    "Har du allerede betalt, kan du se bort fra denne meldingen. " +
    "Ta gjerne kontakt om noe er uklart eller du trenger en betalingsavtale.\n\n" +
    "Med vennlig hilsen\nAK Golf Academy",
};

function tilHtml(body: string): string {
  const avsnitt = body.split(/\n\n+/).map((p) => {
    let html = p.trim();
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\n/g, "<br />");
    return `<p>${html}</p>`;
  });
  return `<!doctype html>
<html lang="nb">
<head><meta charset="UTF-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 580px; margin: 32px auto; padding: 0 16px; color: #0A1F17; line-height: 1.6;">
${avsnitt.join("\n")}
<hr style="margin-top: 32px; border: none; border-top: 1px solid #E5E3DD;" />
<p style="margin-top: 16px; color: #5E5C57; font-size: 12px;">AK Golf Academy · Bossumveien 6, 1605 Fredrikstad</p>
</body>
</html>`;
}

function substituer(tekst: string, vars: Record<string, string>): string {
  return tekst.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

async function hentEllerOpprettMal() {
  const eksisterende = await prisma.emailTemplate.findUnique({
    where: { slug: MAL_SLUG },
  });
  if (eksisterende) return eksisterende;
  return prisma.emailTemplate.create({
    data: {
      slug: MAL_SLUG,
      name: "Betalings-purring (auto, B4)",
      subject: STANDARD_MAL.subject,
      body: STANDARD_MAL.body,
    },
  });
}

export async function runBetalingsPurring(opts?: {
  /** Test-modus: hopp over Resend-utsendelse (alt annet kjører som normalt). */
  dryRunEpost?: boolean;
  /** KUN for tester: overstyr aktiveringsdatoen (import-vernet). */
  aktivFraOverride?: Date;
}): Promise<{
  kandidater: number;
  purring1: number;
  purring2: number;
  eskalert: number;
  hoppet: number;
  feilet: number;
}> {
  const now = new Date();

  const kandidater = await prisma.payment.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      userId: { not: null },
      amountOre: { gt: 0 },
      createdAt: {
        gte: opts?.aktivFraOverride ?? B4_AKTIV_FRA,
        lte: new Date(now.getTime() - PURRING_1_DAGER * 86_400_000),
      },
    },
    select: {
      id: true,
      amountOre: true,
      currency: true,
      description: true,
      createdAt: true,
      metadata: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          dateOfBirth: true,
          parentRelations: {
            where: { approved: true },
            select: { parent: { select: { name: true, email: true } } },
            take: 1,
          },
        },
      },
    },
    take: 100,
  });

  let purring1 = 0;
  let purring2 = 0;
  let eskalert = 0;
  let hoppet = 0;
  let feilet = 0;

  for (const betaling of kandidater) {
    try {
      const bruker = betaling.user;
      if (!bruker) {
        hoppet++;
        continue;
      }
      const meta =
        betaling.metadata && typeof betaling.metadata === "object" && !Array.isArray(betaling.metadata)
          ? (betaling.metadata as Record<string, unknown>)
          : {};
      const purringer = purringerSchema.parse(meta.purringer);
      const dager = Math.floor((now.getTime() - betaling.createdAt.getTime()) / 86_400_000);
      const beloep = `${(betaling.amountOre / 100).toLocaleString("nb-NO")} kr`;

      // Mottaker: mindreårig → godkjent foresatt, aldri barnet.
      const foresatt = bruker.parentRelations[0]?.parent;
      const mindreaarig = isMinor(bruker.dateOfBirth);
      const mottakerEpost = mindreaarig ? (foresatt?.email ?? null) : bruker.email;
      const mottakerNavn = mindreaarig ? (foresatt?.name ?? null) : bruker.name;

      // Trinn 3 — eskaler til menneske (også når mindreårig mangler foresatt-epost).
      const skalEskalere =
        (dager >= ESKALER_DAGER && purringer.length >= 2) || (mottakerEpost == null);
      if (skalEskalere) {
        if (meta.purreEskalert === true) {
          hoppet++;
          continue;
        }
        await prisma.planAction.create({
          data: {
            userId: bruker.id,
            agentName: "betalings-purring",
            actionType: "PAYMENT_FOLLOWUP",
            status: "PENDING",
            suggestion: {
              tittel: `Utestående betaling: ${beloep} (${dager} dager)`,
              forklaring:
                `${bruker.name ?? "Spilleren"} har en utestående betaling på ${beloep}` +
                (betaling.description ? ` (${betaling.description})` : "") +
                `. ${purringer.length} automatiske purringer er sendt — nå må et menneske ta kontakt. ` +
                `Godkjenn når saken er fulgt opp manuelt.`,
              paymentId: betaling.id,
            },
          },
        });
        await prisma.payment.update({
          where: { id: betaling.id },
          data: { metadata: { ...meta, purringer, purreEskalert: true } as Prisma.InputJsonValue },
        });
        eskalert++;
        continue;
      }

      // Trinn 1/2 — automatisk purre-e-post.
      const nesteNivaa =
        purringer.length === 0 && dager >= PURRING_1_DAGER
          ? 1
          : purringer.length === 1 && dager >= PURRING_2_DAGER
            ? 2
            : null;
      if (nesteNivaa == null) {
        hoppet++;
        continue;
      }

      const mal = await hentEllerOpprettMal();
      const vars = {
        name: mottakerNavn ?? "der",
        amount: beloep,
        description: betaling.description ?? "coaching hos AK Golf",
        purringNr: String(nesteNivaa),
      };
      if (!opts?.dryRunEpost) {
        await resendKlient().emails.send({
          from: FRA_EPOST,
          to: mottakerEpost,
          subject: substituer(mal.subject, vars),
          html: tilHtml(substituer(mal.body, vars)),
        });
      }
      await prisma.payment.update({
        where: { id: betaling.id },
        data: {
          metadata: {
            ...meta,
            purringer: [...purringer, { nivaa: nesteNivaa, sentAt: now.toISOString() }],
          } as Prisma.InputJsonValue,
        },
      });
      if (nesteNivaa === 1) purring1++;
      else purring2++;
    } catch {
      feilet++;
    }
  }

  return { kandidater: kandidater.length, purring1, purring2, eskalert, hoppet, feilet };
}
