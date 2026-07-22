// Approval-executor for Caddie write-tools.
// Tar et godkjent tool-forslag og utfører faktisk handling — eller logger
// intent som Notification for MVP når faktisk integrasjon ikke er på plass.
//
// Designet som ren server-side helper. Auth gjøres i route-laget,
// ikke her. Alle feil kastes som vanlige Error med norsk melding.

import { z } from "zod";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { prisma } from "@/lib/prisma";

// ---------- Input-skjemaer ----------

const messageSchema = z.object({
  playerId: z.string().min(1),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
});

const bookingSchema = z.object({
  playerId: z.string().min(1),
  startAt: z.string().min(1),
  serviceTypeSlug: z.string().min(1),
  locationId: z.string().min(1),
  notes: z.string().optional(),
});

// subject/body er valgfrie: chat-UI-et sender kun tool-callens input
// ({ invoiceId }), mens forslags-previewen bærer ferdig tekst. Mangler de,
// regenereres teksten fra fakturaens NÅ-tilstand ved utførelse.
const invoiceReminderSchema = z.object({
  invoiceId: z.string().min(1),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
});

const playerNoteSchema = z.object({
  playerId: z.string().min(1),
  note: z.string().min(1).max(5000),
});

const planAdjustmentSchema = z.object({
  playerId: z.string().min(1),
  change: z.string().min(1).max(2000),
  reason: z.string().max(1000).optional(),
});

// Proaktiv Caddie (Fase 3): oppfølging av inaktiv spiller.
const reengageSchema = z.object({
  spillerId: z.string().min(1),
  spillerName: z.string().optional(),
  dagerInaktiv: z.number().optional(),
  foreslattMelding: z.string().min(1).max(5000),
});

// ---------- Resultat-type ----------

export type ExecutorResult = {
  status: string;
  details?: Record<string, unknown>;
  /** Kort norsk tekst som vises tilbake i UI etter utførelse. */
  summary: string;
};

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown, toolName: string): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      `Ugyldig input for ${toolName}: ${parsed.error.issues
        .map((i) => i.message)
        .join(", ")}`,
    );
  }
  return parsed.data;
}

// ---------- Hovedfunksjon ----------

export async function executeApprovedTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  adminUserId: string,
): Promise<ExecutorResult> {
  switch (toolName) {
    case "draftPlayerMessage": {
      const input = parseOrThrow(messageSchema, toolInput, toolName);
      const notification = await prisma.notification.create({
        data: {
          userId: input.playerId,
          type: "MESSAGE",
          title: input.subject,
          body: input.body,
        },
      });
      return {
        status: "queued",
        details: { notificationId: notification.id, recipientId: input.playerId },
        summary: `Notifikasjon lagret · id: ${notification.id}`,
      };
    }

    case "draftBookingProposal": {
      const input = parseOrThrow(bookingSchema, toolInput, toolName);
      const [service, location, player] = await Promise.all([
        prisma.serviceType.findUnique({
          where: { slug: input.serviceTypeSlug },
          select: { id: true, durationMin: true, priceOre: true, name: true, coachUserId: true },
        }),
        prisma.location.findUnique({
          where: { id: input.locationId },
          select: { id: true, name: true },
        }),
        prisma.user.findUnique({
          where: { id: input.playerId },
          select: { id: true, name: true },
        }),
      ]);
      if (!service) throw new Error(`Tjeneste '${input.serviceTypeSlug}' finnes ikke`);
      if (!location) throw new Error(`Lokasjon med id=${input.locationId} finnes ikke`);
      if (!player) throw new Error(`Spiller med id=${input.playerId} finnes ikke`);

      const start = new Date(input.startAt);
      if (Number.isNaN(start.getTime())) {
        throw new Error(`Ugyldig startAt: ${input.startAt}`);
      }
      const end = new Date(start.getTime() + service.durationMin * 60_000);

      let booking: { id: string; status: string };
      try {
        // Kollisjonsvern (A-pakken): sjekk + opprettelse i samme transaksjon.
        booking = await prisma.$transaction(async (tx) => {
          await sjekkKollisjon(tx, {
            coachId: service.coachUserId ?? null,
            startAt: start,
            endAt: end,
          });
          return tx.booking.create({
            data: {
              userId: input.playerId,
              serviceTypeId: service.id,
              locationId: location.id,
              startAt: start,
              endAt: end,
              status: "PENDING",
              notes: input.notes ?? null,
              priceOre: service.priceOre,
              coachId: service.coachUserId ?? null,
            },
            select: { id: true, status: true },
          });
        });
      } catch (e) {
        if (erKollisjonsfeil(e)) {
          throw new Error(kollisjonsmelding(e));
        }
        throw e;
      }

      // Send notifikasjon til spilleren om at en booking er foreslått
      await prisma.notification.create({
        data: {
          userId: input.playerId,
          type: "BOOKING",
          title: `Ny booking foreslått: ${service.name}`,
          body: `Anders har foreslått en booking ${start.toLocaleString("no-NO")} på ${location.name}.`,
          link: `/playerhq/bookinger/${booking.id}`,
        },
      });

      return {
        status: "booking-created",
        details: { bookingId: booking.id, status: booking.status },
        summary: `Booking opprettet (PENDING) · id: ${booking.id}`,
      };
    }

    case "draftInvoiceReminder": {
      const input = parseOrThrow(invoiceReminderSchema, toolInput, toolName);
      const invoice = await prisma.payment.findUnique({
        where: { id: input.invoiceId },
        select: {
          id: true,
          userId: true,
          status: true,
          amountOre: true,
          currency: true,
          description: true,
          user: { select: { name: true } },
        },
      });
      if (!invoice) throw new Error(`Faktura med id=${input.invoiceId} finnes ikke`);
      if (!invoice.userId) {
        throw new Error(`Faktura ${input.invoiceId} mangler bruker-kobling`);
      }

      // Re-validering mot nå-tilstand: er fakturaen gjort opp siden forslaget
      // ble laget, skal det ikke purres.
      if (invoice.status === "SUCCEEDED" || invoice.status === "REFUNDED") {
        return {
          status: "skipped",
          details: { invoiceId: invoice.id, invoiceStatus: invoice.status },
          summary: "Fakturaen er allerede gjort opp — ingen purring sendt.",
        };
      }

      // Regenerer purretekst fra nå-tilstand hvis forslaget ikke bar den med.
      const navn = invoice.user?.name ?? "kunde";
      const beloep = (invoice.amountOre / 100).toFixed(2);
      const valuta = invoice.currency.toUpperCase();
      const subject =
        input.subject ?? `Påminnelse: utestående faktura (${beloep} ${valuta})`;
      const body =
        input.body ??
        `Hei ${navn},\n\n` +
          `Vi vil minne om at faktura på ${beloep} ${valuta} fortsatt står som ubetalt.\n\n` +
          (invoice.description ? `Gjelder: ${invoice.description}\n\n` : "") +
          `Vennligst gjør opp ved første anledning. Ta kontakt om du har spørsmål.\n\n` +
          `Med vennlig hilsen\nAK Golf Academy`;

      const notification = await prisma.notification.create({
        data: {
          userId: invoice.userId,
          type: "INVOICE_REMINDER",
          title: subject,
          body,
          link: `/playerhq/fakturaer/${invoice.id}`,
        },
      });

      return {
        status: "reminder-scheduled",
        details: { notificationId: notification.id, invoiceId: invoice.id },
        summary: `Påminnelse planlagt · id: ${notification.id}`,
      };
    }

    case "draftPlayerNote": {
      const input = parseOrThrow(playerNoteSchema, toolInput, toolName);
      const player = await prisma.user.findUnique({
        where: { id: input.playerId },
        select: { id: true },
      });
      if (!player) throw new Error(`Spiller med id=${input.playerId} finnes ikke`);

      // MVP: Lagre som Notification med type=NOTE — egen Note-modell kommer
      // i senere fase. Body inneholder selve notatet, audit gjøres via
      // adminUserId i CaddieMessage-loggen i route-laget.
      const notification = await prisma.notification.create({
        data: {
          userId: input.playerId,
          type: "NOTE",
          title: `Coach-notat fra admin`,
          body: input.note,
        },
      });

      return {
        status: "note-saved",
        details: { notificationId: notification.id, adminUserId },
        summary: `Notat lagret · id: ${notification.id}`,
      };
    }

    case "draftPlanAdjustment": {
      const input = parseOrThrow(planAdjustmentSchema, toolInput, toolName);
      const player = await prisma.user.findUnique({
        where: { id: input.playerId },
        select: { id: true },
      });
      if (!player) throw new Error(`Spiller med id=${input.playerId} finnes ikke`);

      // MVP: Logg intent som Notification — faktisk plan-redigering kommer
      // i AgencyOS-fase. adminUserId persisteres via CaddieMessage-audit.
      const notification = await prisma.notification.create({
        data: {
          userId: input.playerId,
          type: "PLAN_ADJUSTMENT_PENDING",
          title: `Plan-justering foreslått`,
          body: input.reason
            ? `${input.change}\n\nBegrunnelse: ${input.reason}`
            : input.change,
        },
      });

      return {
        status: "adjustment-queued",
        details: { notificationId: notification.id, adminUserId },
        summary: `Plan-justering lagret som intent · id: ${notification.id}`,
      };
    }

    case "reengageInactivePlayer": {
      const input = parseOrThrow(reengageSchema, toolInput, toolName);
      // Re-validering mot nå-tilstand: spilleren må fortsatt finnes og ikke
      // være slettet.
      const player = await prisma.user.findUnique({
        where: { id: input.spillerId },
        select: { id: true, deletedAt: true },
      });
      if (!player) throw new Error(`Spiller med id=${input.spillerId} finnes ikke`);
      if (player.deletedAt) {
        return {
          status: "skipped",
          details: { playerId: player.id },
          summary: "Spilleren er slettet — ingen oppfølging sendt.",
        };
      }

      // Samme mønster som draftPlayerMessage: in-app-melding, ikke e-post.
      const notification = await prisma.notification.create({
        data: {
          userId: input.spillerId,
          type: "MESSAGE",
          title: "Hilsen fra coachen din",
          body: input.foreslattMelding,
        },
      });

      return {
        status: "queued",
        details: { notificationId: notification.id, recipientId: input.spillerId },
        summary: `Oppfølging sendt til spilleren · id: ${notification.id}`,
      };
    }

    default:
      throw new Error(`Ukjent tool: ${toolName}`);
  }
}
