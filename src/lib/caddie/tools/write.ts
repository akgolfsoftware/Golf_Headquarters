// Write-tools for Caddie MCP — krever Anders' godkjenning.
// IKKE faktisk skriving til DB her. Alle tools returnerer `needsApproval: true`
// med et preview-objekt som frontend kan vise og deretter ev. utføre.

import { tool } from "ai";
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

export const WRITE_TOOLS = {
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
        const player = await prisma.user.findUnique({
          where: { id: playerId },
          select: { id: true, name: true, email: true },
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
          previewText: `Send "${subject}" til ${player.name} <${player.email}>?`,
        };
      } catch (err) {
        return toolError(
          `draftPlayerMessage feilet: ${err instanceof Error ? err.message : String(err)}`,
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
          prisma.user.findUnique({
            where: { id: playerId },
            select: { id: true, name: true },
          }),
          prisma.serviceType.findUnique({
            where: { slug: serviceTypeSlug },
            select: { id: true, name: true, durationMin: true, priceOre: true },
          }),
          prisma.location.findUnique({
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
      } catch (err) {
        return toolError(
          `draftBookingProposal feilet: ${err instanceof Error ? err.message : String(err)}`,
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
        const invoice = await prisma.payment.findUnique({
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
      } catch (err) {
        return toolError(
          `draftInvoiceReminder feilet: ${err instanceof Error ? err.message : String(err)}`,
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
        const player = await prisma.user.findUnique({
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
      } catch (err) {
        return toolError(
          `draftPlayerNote feilet: ${err instanceof Error ? err.message : String(err)}`,
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
        const player = await prisma.user.findUnique({
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
      } catch (err) {
        return toolError(
          `draftPlanAdjustment feilet: ${err instanceof Error ? err.message : String(err)}`,
          "Kunne ikke forberede plan-justering.",
        );
      }
    },
  }),
} as const;
