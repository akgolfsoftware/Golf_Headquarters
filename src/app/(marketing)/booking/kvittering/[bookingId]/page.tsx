/**
 * /booking/kvittering/[bookingId] — BK-03 i Precision Athletics. Stripe success_url
 * peker hit (samme adresse som før). Datalogikken er den samme som før: oppslag av
 * booking med tjeneste og sted, CONFIRMED-sjekken og gjest-til-konto-lenken. Nytt:
 * coach, e-post for kvittering, avbestillingsfrist (policy.ts) og kalenderfil.
 * Tider i basen er Oslo-veggklokke (se google-calendar-tid.ts), derfor formateres de
 * uten tidssone-konvertering.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { cancellationDeadline } from "@/lib/booking/policy";
import { fraNaivVeggklokke } from "@/lib/google-calendar-tid";
import { BK03Kvittering, type BK03Detaljer } from "@/components/marketing/precision/BK03Kvittering";

export const metadata: Metadata = {
  title: "Bekreftet · AK Golf",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ bookingId: string }>;
};

const nb = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleString("nb-NO", o);
const tilIcs = (naiv: Date) => fraNaivVeggklokke(naiv).replace(/[-:]/g, "");

export default async function Kvittering({ params }: Props) {
  const { bookingId } = await params;

  const booking = await prisma.booking
    .findUnique({
      where: { id: bookingId },
      include: { serviceType: true, location: true, coach: { select: { name: true } } },
    })
    .catch(() => "feil" as const);

  if (booking === "feil") {
    return <BK03Kvittering tilstand="feil" innlogget={false} signupHref="/auth/signup" detaljer={null} />;
  }
  if (!booking) {
    return <BK03Kvittering tilstand="tom" innlogget={false} signupHref="/auth/signup" detaljer={null} />;
  }

  // Innlogget → «Se bookingen i PlayerHQ». Gjest → bro til gratis konto med e-posten fylt ut.
  const user = await getCurrentUser();
  const signupHref = booking.guestEmail
    ? `/auth/signup?epost=${encodeURIComponent(booking.guestEmail)}`
    : "/auth/signup";

  const dato = nb(booking.startAt, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fra = nb(booking.startAt, { hour: "2-digit", minute: "2-digit" });
  const til = nb(booking.endAt, { hour: "2-digit", minute: "2-digit" });
  const betalt = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(booking.priceOre / 100);
  const frist = cancellationDeadline(booking.startAt);
  const bekreftet = booking.status === "CONFIRMED";

  const detaljer: BK03Detaljer = {
    ref: `#${booking.id.slice(-8)}`,
    tjeneste: `${booking.serviceType.name} ${booking.serviceType.durationMin} min`,
    tid: `${dato} · ${fra}–${til}`,
    sted: booking.location.name,
    coach: booking.coach?.name ?? null,
    betalt,
    betaltVedStripe: Boolean(booking.stripePaymentIntentId ?? booking.stripeCheckoutSessionId),
    epost: booking.guestEmail ?? user?.email ?? null,
    fristTekst: `GRATIS AVBESTILLING TIL ${nb(frist, { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).toUpperCase()} KL. ${nb(frist, { hour: "2-digit", minute: "2-digit" })} (24 TIMER FØR)`,
    ics: {
      start: tilIcs(booking.startAt),
      slutt: tilIcs(booking.endAt),
      tittel: `${booking.serviceType.name} · AK Golf`,
      sted: booking.location.name,
      fil: `ak-golf-${booking.id.slice(-8)}`,
    },
  };

  return (
    <BK03Kvittering
      tilstand={bekreftet ? "data" : "pending"}
      innlogget={Boolean(user)}
      signupHref={signupHref}
      detaljer={detaljer}
    />
  );
}
