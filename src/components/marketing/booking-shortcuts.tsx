// Booking direkte på forsiden (design-fasit: ui_kits/marketing, 03 Booking).
// Server-komponent: henter 3 valgte tjenester + neste ledige tid fra DB.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/booking/availability";
import { PulseDot } from "@/components/athletic/pulse-dot";

type Shortcut = {
  slug: string;
  /** Eyebrow-prefiks før varighet, f.eks. "Drop-in" → "Drop-in · 20 min" */
  eyebrowPrefiks: string;
  /** Eyebrow-suffiks etter varighet, f.eks. " · SG-analyse" */
  eyebrowSuffiks?: string;
  featured?: boolean;
};

const SHORTCUTS: readonly Shortcut[] = [
  { slug: "markus-flex-20", eyebrowPrefiks: "Drop-in" },
  { slug: "anders-performance", eyebrowPrefiks: "1:1", featured: true },
  {
    slug: "anders-performance-pro",
    eyebrowPrefiks: "1:1",
    eyebrowSuffiks: " · SG-analyse",
  },
];

const SOEK_DAGER_FREMOVER = 14;

type ServiceMedNesteLedig = {
  shortcut: Shortcut;
  navn: string;
  beskrivelse: string | null;
  prisOre: number;
  varighetMin: number;
  coachNavn: string;
  nesteLedig: { dato: Date; coachNavn: string } | null;
};

async function hentNesteLedig(
  serviceId: string,
  coachUserId: string | null,
): Promise<{ dato: Date; coachNavn: string } | null> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < SOEK_DAGER_FREMOVER; i++) {
    const dag = new Date(start);
    dag.setDate(start.getDate() + i);
    const slots = await getAvailableSlots(serviceId, dag);
    // Hvis tjenesten tilhører en spesifikk coach — filtrer på den. Tjenesten
    // "Flex — Markus" skal ikke vise Anders' ledige tider.
    const relevante = coachUserId
      ? slots.filter((s) => s.coachId === coachUserId)
      : slots;
    if (relevante.length > 0) {
      return { dato: relevante[0].start, coachNavn: relevante[0].coachName };
    }
  }
  return null;
}

async function hentData(): Promise<ServiceMedNesteLedig[]> {
  const slugs = SHORTCUTS.map((s) => s.slug);
  const services = await prisma.serviceType.findMany({
    where: { slug: { in: slugs }, active: true },
    include: { coach: { select: { id: true, name: true } } },
  });

  // Hent neste ledige parallelt — filtrert på tjenestens eier-coach
  const nesteLedigeListe = await Promise.all(
    services.map((s) => hentNesteLedig(s.id, s.coach?.id ?? null)),
  );
  const nesteLedigeMap = new Map(
    services.map((s, i) => [s.slug, nesteLedigeListe[i]]),
  );

  // Behold rekkefølgen fra SHORTCUTS (DB returnerer i ukjent rekkefølge)
  return SHORTCUTS.map((shortcut) => {
    const service = services.find((s) => s.slug === shortcut.slug);
    if (!service) return null;
    return {
      shortcut,
      navn: service.name,
      beskrivelse: service.description,
      prisOre: service.priceOre,
      varighetMin: service.durationMin,
      coachNavn: service.coach?.name ?? "AK Golf",
      nesteLedig: nesteLedigeMap.get(service.slug) ?? null,
    };
  }).filter((x): x is ServiceMedNesteLedig => x !== null);
}

function formaterPris(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

/** Fasit-format: "tor 29. mai, 14:00" */
function formaterNesteLedig(dato: Date): string {
  const ukedag = dato.toLocaleDateString("nb-NO", { weekday: "short" });
  const datoNum = dato.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
  const klokke = dato.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${ukedag.replace(".", "")} ${datoNum}, ${klokke}`;
}

export async function BookingShortcuts() {
  const data = await hentData();

  if (data.length === 0) return null;

  return (
    <section id="booking" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Booking · Tilgjengelige coacher
        </span>
        <h2 className="mt-4 max-w-[22ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
          Reserver tid{" "}
          <em className="font-display font-normal italic text-primary">nå</em>.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.map((item) => (
            <BkCard key={item.shortcut.slug} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BkCard({ item }: { item: ServiceMedNesteLedig }) {
  const featured = item.shortcut.featured ?? false;
  const eyebrow = `${item.shortcut.eyebrowPrefiks} · ${item.varighetMin} min${item.shortcut.eyebrowSuffiks ?? ""}`;

  return (
    <div
      className={`relative flex flex-col gap-3 rounded-[20px] border p-7 transition ${
        featured
          ? "border-primary bg-gradient-to-b from-card to-primary/[0.04] shadow-[0_8px_24px_rgba(10,31,23,0.10)]"
          : "border-border bg-card hover:border-primary hover:shadow-[0_4px_14px_rgba(10,31,23,0.08)]"
      }`}
    >
      {featured && (
        <span className="absolute -top-2.5 left-6 whitespace-nowrap rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)]">
          Mest populær
        </span>
      )}

      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {eyebrow}
      </span>

      <h3 className="font-display text-2xl font-bold leading-[1.1] tracking-[-0.015em]">
        {item.navn}
      </h3>

      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
        {item.coachNavn}
      </span>

      <div className="mt-1 font-mono text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
        {formaterPris(item.prisOre)}
        <small className="ml-1 text-[13px] font-normal text-muted-foreground">
          kr
        </small>
      </div>

      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
        <PulseDot size="sm" />
        {item.nesteLedig
          ? `Neste ledig · ${formaterNesteLedig(item.nesteLedig.dato)}`
          : "Få ledige tider — se kalenderen"}
      </span>

      <Link
        href={`/booking/${item.shortcut.slug}`}
        className={`mt-2 inline-flex h-11 items-center justify-center gap-1.5 font-display text-sm font-semibold tracking-[-0.005em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          featured
            ? "rounded-full bg-accent text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] hover:brightness-105"
            : "rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        Book tid
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
      </Link>
    </div>
  );
}
