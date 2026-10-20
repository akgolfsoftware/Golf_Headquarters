import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { stripeKlient } from "@/lib/stripe";
import { cancellationDeadlineFromUtcWallClock } from "./policy";
import { datoTekst, klokkeTekst } from "@/lib/email/booking-bekreftelse";
import type { BK03Detaljer } from "@/components/marketing/precision/BK03Kvittering";

const Id = z.string().trim().min(1).max(128);
const SessionId = z.string().regex(/^cs_[A-Za-z0-9_]{8,250}$/);
const Charge = z.object({ refunded: z.boolean(), amount_refunded: z.number().int().nonnegative() });
const StripeReceipt = z.object({
  id: SessionId, mode: z.literal("payment"), currency: z.string(), amount_total: z.number().int().nonnegative(),
  metadata: z.object({ bookingId: z.string() }),
  payment_status: z.enum(["paid", "unpaid", "no_payment_required"]),
  payment_intent: z.union([z.string(), z.object({ latest_charge: z.union([z.string(), Charge, z.null()]).optional() }), z.null()]).optional(),
});
type Receipt = z.infer<typeof StripeReceipt>;

export type BookingReceiptResult = {
  state: "data" | "pending" | "cancelled" | "completed" | "denied" | "tom" | "feil";
  details: BK03Detaljer | null;
  loggedIn: boolean;
  bookingsHref?: string;
};

/** Bare lesing. Ingen bekreftelse, betaling, checkout-gjenforsøk eller sending. */
export async function hentBookingKvittering(bookingId: unknown, sessionId: unknown): Promise<BookingReceiptResult> {
  const parsed = Id.safeParse(bookingId);
  if (!parsed.success) return { state: "denied", details: null, loggedIn: false };
  const user = await getCurrentUser();
  const hidden = (state: "denied" | "tom" | "feil"): BookingReceiptResult => ({ state, details: null, loggedIn: Boolean(user) });
  try {
    // Før adgang: kun identitet, eier og betalingsanker, ingen kontakt- eller navnefelt.
    const anchor = await prisma.booking.findUnique({ where: { id: parsed.data }, select: {
      id: true, userId: true, stripeCheckoutSessionId: true, priceOre: true,
    } });
    if (!anchor) return hidden("tom");
    const owner = user?.id === anchor.userId;
    const parent = !owner && user?.role === "PARENT" && anchor.userId != null
      ? await prisma.parentRelation.findFirst({ where: { parentId: user.id, childId: anchor.userId, approved: true, child: { deletedAt: null } }, select: { id: true } })
      : null;
    const supplied = SessionId.safeParse(sessionId);
    const bearer = supplied.success && supplied.data === anchor.stripeCheckoutSessionId;
    if (!owner && !parent && !bearer) return hidden("denied");

    let stripe: Receipt | null = null;
    if (anchor.stripeCheckoutSessionId) {
      try {
        const raw = await stripeKlient().checkout.sessions.retrieve(anchor.stripeCheckoutSessionId, { expand: ["payment_intent.latest_charge"] });
        const checked = StripeReceipt.safeParse(raw);
        if (checked.success && checked.data.id === anchor.stripeCheckoutSessionId && checked.data.metadata.bookingId === anchor.id
          && checked.data.currency.toLowerCase() === "nok" && checked.data.amount_total === anchor.priceOre) stripe = checked.data;
      } catch { /* Eier kan lese registrert booking; betalingsstatus blir ukjent. */ }
    }
    if (!owner && !parent && !stripe) return hidden("denied");

    const where: Prisma.BookingWhereInput = owner && user ? { id: anchor.id, userId: user.id, user: { deletedAt: null } }
      : parent && user ? { id: anchor.id, userId: anchor.userId, user: { deletedAt: null, parentRelations: { some: { parentId: user.id, approved: true } } } }
      : { id: anchor.id, stripeCheckoutSessionId: stripe!.id, priceOre: stripe!.amount_total };
    // Relasjon/eierskap kontrolleres på nytt i samme spørring som de private feltene.
    const booking = await prisma.booking.findFirst({ where, select: {
      id: true, status: true, startAt: true, endAt: true, priceOre: true, subscriptionId: true,
      stripeCheckoutSessionId: true, guestEmail: true,
      serviceType: { select: { name: true } }, location: { select: { name: true } },
      coach: { select: { name: true } }, user: { select: { email: true } },
    } });
    if (!booking) return hidden("denied");
    const charge = stripe?.payment_intent && typeof stripe.payment_intent === "object" ? stripe.payment_intent.latest_charge : null;
    const refunded = charge && typeof charge === "object" ? charge : null;
    const betaling = refunded?.refunded ? "Refundert" : refunded && refunded.amount_refunded > 0 ? "Delvis refundert"
      : stripe?.payment_status === "paid" ? "Betaling bekreftet av Stripe"
      : stripe?.payment_status === "unpaid" ? "Betaling ikke bekreftet"
      : booking.subscriptionId ? "Trukket fra coachingabonnement"
      : booking.priceOre === 0 ? "Ingen betaling kreves" : "Betalingsstatus er ikke tilgjengelig";
    const price = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", minimumFractionDigits: booking.priceOre % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(booking.priceOre / 100);
    const tilIcs = (d: Date) => d.toISOString().replace(/[-:]/g, "").slice(0, 15);
    const frist = cancellationDeadlineFromUtcWallClock(booking.startAt);
    const details: BK03Detaljer = {
      ref: `#${booking.id.slice(-8)}`, tjeneste: `${booking.serviceType.name} ${Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60000)} min`,
      tid: `${datoTekst(booking.startAt)} · ${klokkeTekst(booking.startAt)}–${klokkeTekst(booking.endAt)}`,
      sted: booking.location.name, coach: booking.coach?.name ?? null, betalt: price, betaling,
      betaltVedStripe: Boolean(booking.stripeCheckoutSessionId), epost: booking.guestEmail ?? booking.user?.email ?? null,
      fristTekst: booking.status === "CONFIRMED" ? `Gratis avbestilling til ${datoTekst(frist)} kl. ${klokkeTekst(frist)} (24 timer før).` : null,
      ics: { start: tilIcs(booking.startAt), slutt: tilIcs(booking.endAt), tittel: `${booking.serviceType.name} · AK Golf`, sted: booking.location.name, fil: `ak-golf-${booking.id.slice(-8)}` },
    };
    return { state: booking.status === "CONFIRMED" ? "data" : booking.status === "COMPLETED" ? "completed" : booking.status === "CANCELLED" ? "cancelled" : "pending",
      details, loggedIn: Boolean(user), bookingsHref: parent ? `/forelder/bookinger/${encodeURIComponent(booking.id)}` : "/portal/meg/bookinger" };
  } catch { return hidden("feil"); }
}
