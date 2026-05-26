// Direkte booking-snarveier for forsiden.
// Server-komponent: henter 3 valgte tjenester + neste ledige tid fra DB.

import Link from "next/link";
import { ArrowUpRight, Clock, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/booking/availability";

type Shortcut = {
  slug: string;
  eyebrow: string;
  featured?: boolean;
};

const SHORTCUTS: readonly Shortcut[] = [
  { slug: "markus-flex-20", eyebrow: "For nybegynnere" },
  { slug: "anders-performance", eyebrow: "Standardvalg", featured: true },
  { slug: "anders-performance-pro", eyebrow: "For ambisiøse" },
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
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

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
  return `${ukedag.replace(".", "")} ${datoNum} · ${klokke}`;
}

export async function BookingShortcuts() {
  const data = await hentData();

  if (data.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" strokeWidth={2} />
          Book direkte
        </div>
        <h2 className="mt-6 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
          Velg en time —{" "}
          <em className="font-display font-normal italic text-primary">
            få ledig allerede denne uka
          </em>
        </h2>
        <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground md:text-[18px]">
          Hopp rett til kalenderen. Velg tid, betal og du er booket. Ingen
          abonnement, ingen binding.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {data.map((item) => (
          <ShortcutCard key={item.shortcut.slug} item={item} />
        ))}
      </div>
    </section>
  );
}

function ShortcutCard({ item }: { item: ServiceMedNesteLedig }) {
  const featured = item.shortcut.featured;
  return (
    <Link
      href={`/booking/${item.shortcut.slug}`}
      className={`group relative flex flex-col rounded-2xl border p-8 transition-all hover:-translate-y-0.5 ${
        featured
          ? "border-primary bg-card shadow-sm"
          : "border-border bg-card hover:border-foreground/20"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
          Mest populær
        </span>
      )}
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {item.shortcut.eyebrow}
      </span>
      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {item.navn}
      </h3>
      <p className="mt-2 font-mono text-[12px] tabular-nums text-muted-foreground">
        Med {item.coachNavn}
      </p>
      {item.beskrivelse && (
        <p className="mt-4 flex-1 text-[15px] leading-[1.6] text-muted-foreground">
          {item.beskrivelse}
        </p>
      )}

      <div className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
        <Clock className="h-3 w-3" strokeWidth={2} />
        {item.varighetMin} min
      </div>

      {item.nesteLedig && (
        <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-4 py-1 font-mono text-[11px] tabular-nums text-secondary-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Neste ledig: {formaterNesteLedig(item.nesteLedig.dato)}
        </div>
      )}
      {!item.nesteLedig && (
        <div className="mt-2 font-mono text-[11px] text-muted-foreground">
          Få ledige tider
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <span className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
          {formaterPris(item.prisOre)}
        </span>
        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-primary group-hover:gap-2">
          Book
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
    </Link>
  );
}
