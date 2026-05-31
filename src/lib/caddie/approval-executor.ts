// Approval-executor for Caddie write-tools.
// Tar et godkjent tool-forslag og utfører faktisk handling — eller logger
// intent som Notification for MVP når faktisk integrasjon ikke er på plass.
//
// Designet som ren server-side helper. Auth gjøres i route-laget,
// ikke her. Alle feil kastes som vanlige Error med norsk melding.

import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
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

const invoiceReminderSchema = z.object({
  invoiceId: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
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
        booking = await prisma.booking.create({
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
      } catch (e) {
        // P2002: unique constraint — coachen er allerede booket på dette tidspunktet
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          throw new Error("Denne timen er allerede booket for denne coachen. Velg et annet tidspunkt.");
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
        select: { id: true, userId: true },
      });
      if (!invoice) throw new Error(`Faktura med id=${input.invoiceId} finnes ikke`);
      if (!invoice.userId) {
        throw new Error(`Faktura ${input.invoiceId} mangler bruker-kobling`);
      }

      const notification = await prisma.notification.create({
        data: {
          userId: invoice.userId,
          type: "INVOICE_REMINDER",
          title: input.subject,
          body: input.body,
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
      // i CoachHQ-fase. adminUserId persisteres via CaddieMessage-audit.
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

    default:
      throw new Error(`Ukjent tool: ${toolName}`);
  }
}
