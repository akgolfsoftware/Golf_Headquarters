/**
 * /booking/[slug] — v2-port 16. juli 2026. Datalogikk gjenbrukt 1:1 fra
 * (mlegacy)/booking/[slug]/page.tsx: pause-redirect (nå rollestyrt via
 * kanBrukeInnebygdBooking), tjeneste-
 * oppslag, getAvailableSlots + coach-filtrering (Markus-tjenester skal ikke
 * vise Anders' tider), default «i morgen» og 14-dagers datovelger. Dag- og
 * datotekster formateres her (server, nb-NO — samme som før); presentasjonen
 * bor i BK02VelgTid (Precision Athletics, BK-02).
 */
import { fraNaivVeggklokke } from "@/lib/google-calendar-tid";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";
import { getAvailableSlots } from "@/lib/booking/availability";
import { BK02VelgTid, type BK02Dag } from "@/components/booking/precision/BK02VelgTid";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dato?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.serviceType.findUnique({ where: { slug } });
  if (!service) return { title: "Booking · AK Golf" };
  return {
    title: `Book ${service.name} · AK Golf`,
    description: service.description ?? undefined,
  };
}

function formaterPris(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function ServiceBookingPage({ params, searchParams }: Props) {
  // Pauset for publikum — landing (/booking) viser Acuity-lenken.
  if (!(await kanBrukeInnebygdBooking())) redirect("/booking");

  const { slug } = await params;
  const { dato } = await searchParams;

  const service = await prisma.serviceType.findUnique({ where: { slug } });
  if (!service || !service.active) notFound();

  // «I dag» er Oslo-dato, ikke serverens (UTC) dato — ellers feil mellom 00 og 02 norsk tid.
  const osloIdagIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
  const osloIdag = new Date(`${osloIdagIso}T00:00:00.000Z`);
  const valgtDato = dato ? new Date(dato) : new Date(osloIdag);
  valgtDato.setUTCHours(0, 0, 0, 0);
  // Default til i morgen hvis ingen dato valgt
  if (!dato) {
    valgtDato.setUTCDate(valgtDato.getUTCDate() + 1);
  }

  const alleSlots = await getAvailableSlots(service.id, valgtDato);
  // Filtrer på service sin coach — Markus-tjenester skal ikke vise Anders' tider.
  const slots = service.coachUserId
    ? alleSlots.filter((s) => s.coachId === service.coachUserId)
    : alleSlots;

  // 14 dager fremover som dato-velger
  const idag = osloIdag;
  const dager: BK02Dag[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(idag);
    d.setUTCDate(d.getUTCDate() + i);
    const iso = toDateInput(d);
    return {
      iso,
      dagsnavn: d.toLocaleDateString("nb-NO", { weekday: "short", timeZone: "UTC" }),
      datotekst: d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "UTC" }),
      valgt: iso === toDateInput(valgtDato),
    };
  });

  const valgtDatoTekst = valgtDato.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  return (
    <BK02VelgTid
      tjeneste={{
        slug,
        name: service.name,
        description: service.description,
        prisTekst: formaterPris(service.priceOre),
        durationMin: service.durationMin,
      }}
      dager={dager}
      valgtDatoTekst={valgtDatoTekst}
      slots={slots.map((s) => ({
        start: fraNaivVeggklokke(s.start),
        end: fraNaivVeggklokke(s.end),
        coachId: s.coachId,
        coachName: s.coachName,
      }))}
    />
  );
}
