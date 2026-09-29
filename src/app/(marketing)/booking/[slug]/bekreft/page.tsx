/**
 * /booking/[slug]/bekreft — v2-port 16. juli 2026. Datalogikk gjenbrukt 1:1
 * fra (mlegacy)/booking/[slug]/bekreft/page.tsx: param-validering (notFound),
 * tjeneste-/coach-oppslag, innlogget-bruker-prefill og Europe/Oslo-formatert
 * dato/klokkeslett. Server-action (createBookingCheckout i ./actions) er
 * flyttet 1:1 uendret. Presentasjon + skjema bor i BK02Bekreft
 * (Precision Athletics, BK-02).
 */
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { BK02Bekreft } from "@/components/booking/precision/BK02Bekreft";
import { krTekst, tidTekst } from "@/components/booking/precision/format";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string; coach?: string }>;
};

export default async function BekreftPage({ params, searchParams }: Props) {
  // Pauset for publikum: sperren må også stå her — siden kan nås med
  // direktelenke utenom landing/tjenesteside.
  if (!(await kanBrukeInnebygdBooking())) redirect("/booking");

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

  // Oslo-tid, ikke serverens (Vercel kjører UTC).
  const datoIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(startAt);

  return (
    <BK02Bekreft
      slug={slug}
      start={start}
      coachId={coach}
      tjenesteNavn={service.name}
      tidTekst={tidTekst(startAt.toISOString())}
      datoIso={datoIso}
      durationMin={service.durationMin}
      coachNavn={coachUser ? (coachUser.name ?? "—") : null}
      prisTekst={krTekst(service.priceOre)}
      priceOre={service.priceOre}
      innloggetEpost={innloggedBruker?.email ?? null}
      innloggetNavn={innloggedBruker?.name ?? null}
    />
  );
}
