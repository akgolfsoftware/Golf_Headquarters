// Write-tools for Caddie MCP — krever Anders' godkjenning.
// IKKE faktisk skriving til DB her. Alle tools returnerer `needsApproval: true`
// med et preview-objekt som frontend kan vise og deretter ev. utføre.

import { tool, type Tool } from "ai";
import type { Prisma } from "@/generated/prisma/client";
import { medAkProfilHandling } from "@/lib/deling/ak-profil-handling";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  toolError,
  type DraftBookingProposal,
  type DraftInvoiceReminderProposal,
  type DraftMessageProposal,
  type DraftPlanAdjustmentProposal,
  type DraftPlayerNoteProposal,
} from "../types";

type DraftDb = Pick<Prisma.TransactionClient, "user" | "payment" | "serviceType" | "location">;
function draftDefinitions(db: DraftDb) {
  return {
  draftPlayerMessage: tool({
    description:
      "Foreslå en e-postmelding til en spiller. Sender IKKE — krever Anders' godkjenning før utsendelse.",
    inputSchema: z.object({
      playerId: z.string(),
      subject: z.string().min(1).max(200),
      body: z.string().min(1).max(5000),
    }),
    execute: async ({
      playerId,
      subject,
      body,
    }): Promise<DraftMessageProposal | ReturnType<typeof toolError>> => {
      try {
        const player = await db.user.findUnique({
          where: { id: playerId },
          select: { id: true, name: true },
        });
        if (!player) {
          return toolError(
            `Spiller med id=${playerId} finnes ikke`,
            "Fant ingen spiller med denne IDen.",
          );
        }
        return {
          type: "DRAFT_MESSAGE",
          needsApproval: true,
          playerId,
          subject,
          body,
          previewText: `Send "${subject}" til ${player.name}?`,
        };
      } catch {
        return toolError(
          "draftPlayerMessage feilet",
          "Kunne ikke forberede meldingsforslag.",
        );
      }
    },
  }),

  draftBookingProposal: tool({
    description:
      "Foreslå en ny booking for en spiller. Oppretter IKKE bookingen — krever godkjenning.",
    inputSchema: z.object({
      playerId: z.string(),
      startAt: z.string().describe("ISO 8601-tidspunkt (UTC)"),
      serviceTypeSlug: z.string().describe("Slug for ServiceType (f.eks. 'performance-60')"),
      locationId: z.string(),
      notes: z.string().optional(),
    }),
    execute: async ({
      playerId,
      startAt,
      serviceTypeSlug,
      locationId,
      notes,
    }): Promise<DraftBookingProposal | ReturnType<typeof toolError>> => {
      try {
        const [player, service, location] = await Promise.all([
          db.user.findUnique({
            where: { id: playerId },
            select: { id: true, name: true },
          }),
          db.serviceType.findUnique({
            where: { slug: serviceTypeSlug },
            select: { id: true, name: true, durationMin: true, priceOre: true },
          }),
          db.location.findUnique({
            where: { id: locationId },
            select: { id: true, name: true },
          }),
        ]);

        if (!player) {
          return toolError(
            `Spiller med id=${playerId} finnes ikke`,
            "Fant ingen spiller med denne IDen.",
          );
        }
        if (!service) {
          return toolError(
            `ServiceType med slug=${serviceTypeSlug} finnes ikke`,
            "Fant ingen tjeneste med denne slug-en.",
          );
        }
        if (!location) {
          return toolError(
            `Lokasjon med id=${locationId} finnes ikke`,
            "Fant ingen lokasjon med denne IDen.",
          );
        }

        const start = new Date(startAt);
        const previewText =
          `Opprett booking: ${service.name} for ${player.name} ` +
          `${start.toLocaleString("no-NO")} på ${location.name}?`;

        return {
          type: "DRAFT_BOOKING",
          needsApproval: true,
          playerId,
          startAt,
          serviceTypeSlug,
          locationId,
          notes,
          previewText,
        };
      } catch {
        return toolError(
          "draftBookingProposal feilet",
          "Kunne ikke forberede bookingforslag.",
        );
      }
    },
  }),

  draftInvoiceReminder: tool({
    description:
      "Foreslå en purremelding for en utestående faktura. Sender IKKE — krever godkjenning.",
    inputSchema: z.object({
      invoiceId: z.string().describe("Payment.id (vår interne ID, ikke Stripe-ID)"),
    }),
    execute: async ({
      invoiceId,
    }): Promise<DraftInvoiceReminderProposal | ReturnType<typeof toolError>> => {
      try {
        const invoice = await db.payment.findUnique({
          where: { id: invoiceId },
          select: {
            id: true,
            amountOre: true,
            currency: true,
            status: true,
            type: true,
            description: true,
            createdAt: true,
            user: { select: { id: true, name: true, email: true } },
          },
        });
        if (!invoice) {
          return toolError(
            `Faktura med id=${invoiceId} finnes ikke`,
            "Fant ingen faktura med denne IDen.",
          );
        }
        const navn = invoice.user?.name ?? "kunde";
        const beloep = (invoice.amountOre / 100).toFixed(2);
        const subject = `Påminnelse: utestående faktura (${beloep} ${invoice.currency.toUpperCase()})`;
        const body =
          `Hei ${navn},\n\n` +
          `Vi vil minne om at faktura på ${beloep} ${invoice.currency.toUpperCase()} ` +
          `fortsatt står som ubetalt.\n\n` +
          (invoice.description ? `Gjelder: ${invoice.description}\n\n` : "") +
          `Vennligst gjør opp ved første anledning. Ta kontakt om du har spørsmål.\n\n` +
          `Med vennlig hilsen\nAK Golf Academy`;

        return {
          type: "DRAFT_INVOICE_REMINDER",
          needsApproval: true,
          invoiceId,
          subject,
          body,
          previewText: `Send purring til ${navn} for ${beloep} ${invoice.currency.toUpperCase()}?`,
        };
      } catch {
        return toolError(
          "draftInvoiceReminder feilet",
          "Kunne ikke forberede purreforslag.",
        );
      }
    },
  }),

  draftPlayerNote: tool({
    description:
      "Foreslå et coach-notat på en spiller. Lagrer IKKE — krever godkjenning før det persisteres.",
    inputSchema: z.object({
      playerId: z.string(),
      note: z.string().min(1).max(5000),
    }),
    execute: async ({
      playerId,
      note,
    }): Promise<DraftPlayerNoteProposal | ReturnType<typeof toolError>> => {
      try {
        const player = await db.user.findUnique({
          where: { id: playerId },
          select: { id: true, name: true },
        });
        if (!player) {
          return toolError(
            `Spiller med id=${playerId} finnes ikke`,
            "Fant ingen spiller med denne IDen.",
          );
        }
        const preview = note.length > 80 ? `${note.slice(0, 80)}…` : note;
        return {
          type: "DRAFT_PLAYER_NOTE",
          needsApproval: true,
          playerId,
          note,
          previewText: `Lagre notat på ${player.name}: "${preview}"?`,
        };
      } catch {
        return toolError(
          "draftPlayerNote feilet",
          "Kunne ikke forberede notat-forslag.",
        );
      }
    },
  }),

  draftPlanAdjustment: tool({
    description:
      "Foreslå en justering av en spillers treningsplan. Utfører IKKE endringen — krever godkjenning.",
    inputSchema: z.object({
      playerId: z.string(),
      change: z.string().min(1).max(2000).describe("Beskrivelse av foreslått endring"),
      reason: z.string().max(1000).optional(),
    }),
    execute: async ({
      playerId,
      change,
      reason,
    }): Promise<DraftPlanAdjustmentProposal | ReturnType<typeof toolError>> => {
      try {
        const player = await db.user.findUnique({
          where: { id: playerId },
          select: { id: true, name: true },
        });
        if (!player) {
          return toolError(
            `Spiller med id=${playerId} finnes ikke`,
            "Fant ingen spiller med denne IDen.",
          );
        }
        const preview = change.length > 100 ? `${change.slice(0, 100)}…` : change;
        return {
          type: "DRAFT_PLAN_ADJUSTMENT",
          needsApproval: true,
          playerId,
          change,
          reason,
          previewText: `Foreslår plan-endring for ${player.name}: "${preview}"`,
        };
      } catch {
        return toolError(
          "draftPlanAdjustment feilet",
          "Kunne ikke forberede plan-justering.",
        );
      }
    },
  }),
} as const;

}

/** Alle eksekverbare eksportveier har samme port; rå definisjoner er private. */
type SecuredDraftTools = Record<keyof ReturnType<typeof draftDefinitions>, Tool>;
export function buildWriteTools(viewer: { id: string; role: string }): SecuredDraftTools {
  const definitions = draftDefinitions(prisma);
  return Object.fromEntries(Object.entries(definitions).map(([name, definition]) => [name, {
    ...definition,
    execute: async (input: Record<string, unknown>, options: Parameters<NonNullable<typeof definition.execute>>[1]) => {
      const denied = () => toolError("Ressursen er ikke tilgjengelig", "Fant ingen tilgjengelig ressurs.");
      if (!viewer.id || !["ADMIN", "COACH"].includes(viewer.role)) return denied();
      if (!(definition.inputSchema instanceof z.ZodType)) return denied();
      const parsed = definition.inputSchema.safeParse(input);
      if (!parsed.success) return denied();
      const args = z.record(z.string(), z.unknown()).safeParse(parsed.data);
      if (!args.success) return denied();
      const playerId = args.data.playerId;
      const execute = (db: DraftDb) => {
        const selected = draftDefinitions(db)[name as keyof typeof definitions];
        const run = selected.execute as (args: Record<string, unknown>, opts: typeof options) => Promise<unknown>;
        return run(args.data, options);
      };
      try {
        if (["draftPlayerMessage", "draftPlayerNote", "draftPlanAdjustment"].includes(name)) {
          return await medAkProfilHandling(viewer, playerId, tx => execute(tx));
        }
        // Booking/faktura beholder egne eksisterende administrative regler.
        // Coachingprofildeling brukes ikke som hjemmel for disse formålene.
        if (name === "draftBookingProposal") {
          if (typeof playerId !== "string" || !await harCoachTilgangTilSpiller(viewer, playerId)) return denied();
          return await execute(prisma);
        }
        if (name === "draftInvoiceReminder" && viewer.role === "ADMIN") return await execute(prisma);
        return denied();
      } catch { return denied(); }
    },
  }])) as SecuredDraftTools; // Nøklene kommer kun fra den lukkede definisjonen.
}

/** Kun form/navnelister uten bruker; execute avviser alltid. */
export const WRITE_TOOLS = buildWriteTools({ id: "", role: "ADMIN" });
