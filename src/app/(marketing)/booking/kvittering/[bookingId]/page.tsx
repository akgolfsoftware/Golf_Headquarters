/**
 * /booking/kvittering/[bookingId] — v2-port 16. juli 2026. Datalogikk
 * gjenbrukt 1:1 fra (mlegacy)/booking/kvittering/[bookingId]/page.tsx:
 * booking-oppslag (m/ tjeneste + lokasjon), CONFIRMED-sjekken, gjest→signup-
 * broen med prefilt e-post og Europe/Oslo-formatering. Stripe success_url
 * peker fortsatt hit (samme adresse). Presentasjon + PENDING-polling bor i
 * MarkedBookingKvitteringV2 (v2, MRamme) — pending-refresh.tsx er flyttet
 * inn dit.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { MarkedBookingKvitteringV2 } from "@/components/marketing/v2/MarkedBookingKvitteringV2";

export const metadata: Metadata = {
  title: "Bekreftet · AK Golf",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ bookingId: string }>;
};

export default async function Kvittering({ params }: Props) {
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: true,
      location: true,
    },
  });

  if (!booking) notFound();

  // Innlogget → «Mine bestillinger». Gjest → onboarding-bro til gratis konto
  // med e-post prefilt fra bookingen. (Gjør siden per-request-dynamisk — OK.)
  const user = await getCurrentUser();
  const signupHref = booking.guestEmail
    ? `/auth/signup?epost=${encodeURIComponent(booking.guestEmail)}`
    : "/auth/signup";

  const dato = booking.startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });
  const tid = booking.startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
  const prisTekst = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(booking.priceOre / 100);

  return (
    <MarkedBookingKvitteringV2
      bekreftet={booking.status === "CONFIRMED"}
      guestEmail={booking.guestEmail}
      innlogget={Boolean(user)}
      signupHref={signupHref}
      detaljer={{
        bestillingRef: `#${booking.id.slice(-8)}`,
        tjeneste: booking.serviceType.name,
        dato,
        klokkeslett: `${tid} (${booking.serviceType.durationMin} min)`,
        sted: booking.location.name,
        prisTekst,
      }}
    />
  );
}
