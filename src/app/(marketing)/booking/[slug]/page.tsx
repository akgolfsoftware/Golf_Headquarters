/**
 * /booking/[slug] — v2-port 16. juli 2026. Datalogikk gjenbrukt 1:1 fra
 * (mlegacy)/booking/[slug]/page.tsx: BOOKING_ACTIVE-redirect, tjeneste-
 * oppslag, getAvailableSlots + coach-filtrering (Markus-tjenester skal ikke
 * vise Anders' tider), default «i morgen» og 14-dagers datovelger. Dag- og
 * datotekster formateres her (server, nb-NO — samme som før); presentasjonen
 * bor i MarkedBookingTjenesteV2 (v2, MRamme).
 */
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/booking/availability";
import {
  MarkedBookingTjenesteV2,
  type TjenesteDag,
} from "@/components/marketing/v2/MarkedBookingTjenesteV2";

const BOOKING_ACTIVE = process.env.BOOKING_ACTIVE === "true";

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
  if (!BOOKING_ACTIVE) redirect("/booking");

  const { slug } = await params;
  const { dato } = await searchParams;

  const service = await prisma.serviceType.findUnique({ where: { slug } });
  if (!service || !service.active) notFound();

  const valgtDato = dato ? new Date(dato) : new Date();
  valgtDato.setHours(0, 0, 0, 0);
  // Default til i morgen hvis ingen dato valgt
  if (!dato) {
    valgtDato.setDate(valgtDato.getDate() + 1);
  }

  const alleSlots = await getAvailableSlots(service.id, valgtDato);
  // Filtrer på service sin coach — Markus-tjenester skal ikke vise Anders' tider.
  const slots = service.coachUserId
    ? alleSlots.filter((s) => s.coachId === service.coachUserId)
    : alleSlots;

  // 14 dager fremover som dato-velger
  const idag = new Date();
  idag.setHours(0, 0, 0, 0);
  const dager: TjenesteDag[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(idag);
    d.setDate(d.getDate() + i);
    const iso = toDateInput(d);
    return {
      iso,
      dagsnavn: d.toLocaleDateString("nb-NO", { weekday: "short" }),
      datotekst: d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }),
      valgt: iso === toDateInput(valgtDato),
    };
  });

  const valgtDatoTekst = valgtDato.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <MarkedBookingTjenesteV2
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
        start: s.start.toISOString(),
        end: s.end.toISOString(),
        coachId: s.coachId,
        coachName: s.coachName,
      }))}
    />
  );
}
