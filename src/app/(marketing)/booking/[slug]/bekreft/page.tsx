/**
 * /booking/[slug]/bekreft — v2-port 16. juli 2026. Datalogikk gjenbrukt 1:1
 * fra (mlegacy)/booking/[slug]/bekreft/page.tsx: param-validering (notFound),
 * tjeneste-/coach-oppslag, innlogget-bruker-prefill og Europe/Oslo-formatert
 * dato/klokkeslett. Server-action (createBookingCheckout i ./actions) er
 * flyttet 1:1 uendret. Presentasjon + skjema bor i MarkedBookingBekreftV2
 * (v2, MRamme).
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { MarkedBookingBekreftV2 } from "@/components/marketing/v2/MarkedBookingBekreftV2";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string; coach?: string }>;
};

export default async function BekreftPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { start, coach } = await searchParams;

  if (!start || !coach) notFound();

  const service = await prisma.serviceType.findUnique({ where: { slug } });
  if (!service) notFound();

  const startAt = new Date(start);
  if (isNaN(startAt.getTime())) notFound();

  const coachUser = await prisma.user.findUnique({
    where: { id: coach },
    select: { id: true, name: true },
  });

  const innloggedBruker = await getCurrentUser();

  const dato = startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });
  const klokkeslett = startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
  const prisTekst = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(service.priceOre / 100);

  return (
    <MarkedBookingBekreftV2
      slug={slug}
      start={start}
      coachId={coach}
      tjenesteNavn={service.name}
      datoTekst={dato}
      klokkeslettTekst={klokkeslett}
      durationMin={service.durationMin}
      coachNavn={coachUser ? (coachUser.name ?? "—") : null}
      prisTekst={prisTekst}
      priceOre={service.priceOre}
      innloggetEpost={innloggedBruker?.email ?? null}
      innloggetNavn={innloggedBruker?.name ?? null}
    />
  );
}
