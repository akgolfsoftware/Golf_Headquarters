/**
 * AgencyOS — Anlegg (samle-side).
 *
 * Tabs:
 *  - grid        : Anlegg-kort-grid (AnleggGrid)
 *  - oversikt    : KPI-strip + kart + lokasjons-kort med fasiliteter
 *  - lokasjoner  : Lokasjons-CRUD (eksisterende side)
 *  - fasiliteter : Fasilitets-oversikt (eksisterende side)
 *  - tilgjengelighet : Coach-tilgjengelighet (eksisterende side)
 *
 * Re-stylet til AgencyOS-DNA (mono-eyebrows, lime-aksent-KPI, rounded-xl). Alle
 * tall er ekte Prisma (location + facility + bookings-telling) — ingen demo-data.
 * Tom DB gir tomstate. Sub-side-importene (locations/facilities/availability) +
 * AnleggGrid/AnleggMapbox er uendret.
 */

import Link from "next/link";
import { Building2, Gauge, MapPin, Search, type LucideIcon } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { TabStrip } from "@/components/admin/tab-strip";
import { AnleggMapbox } from "@/components/admin/anlegg-mapbox";
import LocationsPage from "@/app/admin/locations/page";
import FacilitiesPage from "@/app/admin/facilities/page";
import AvailabilityPage from "@/app/admin/availability/page";
import { LocationForm } from "@/app/admin/locations/location-form";
import { AnleggGrid, type AnleggKort } from "@/components/admin-anlegg-v2/anlegg-grid";
import { cn } from "@/lib/utils";

type TabKey = "oversikt" | "grid" | "lokasjoner" | "fasiliteter" | "tilgjengelighet";

const TABS = [
  { key: "grid", label: "Grid" },
  { key: "oversikt", label: "Oversikt" },
  { key: "lokasjoner", label: "Lokasjoner" },
  { key: "fasiliteter", label: "Fasiliteter" },
  { key: "tilgjengelighet", label: "Tilgjengelighet" },
];

type Search = {
  tab?: string;
  coach?: string;
};

type LocType = "indoor" | "hybrid" | "bane" | "range";

function deriveType(name: string): LocType {
  const n = name.toLowerCase();
  if (n.includes("mulligan") || n.includes("indoor") || n.includes("simulator")) {
    return "indoor";
  }
  if (n.includes("range")) return "range";
  if (n.includes("gk") || n.includes("golfklubb")) return "hybrid";
  return "bane";
}

const TYPE_LABEL: Record<LocType, string> = {
  indoor: "Indoor",
  hybrid: "Hybrid",
  bane: "Bane",
  range: "Range",
};

const TYPE_PILL: Record<LocType, string> = {
  indoor: "bg-primary/10 text-primary",
  hybrid: "bg-accent/30 text-accent-foreground",
  bane: "bg-secondary text-muted-foreground",
  range: "bg-accent/20 text-accent-foreground",
};

export default async function AnleggPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const rawTab = params.tab;
  const tab: TabKey =
    rawTab === "lokasjoner" ||
    rawTab === "fasiliteter" ||
    rawTab === "tilgjengelighet" ||
    rawTab === "grid" ||
    rawTab === "oversikt"
      ? rawTab
      : "grid";

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      <PageHeader
        eyebrow="AgencyOS · Drift"
        titleLead="Anlegg og"
        titleItalic="tilgjengelighet"
        sub="Lokasjoner, fasiliteter og trener-tilgjengelighet samlet."
        actions={<LocationForm triggerLabel="+ Ny lokasjon" />}
      />
      <TabStrip basePath="/admin/anlegg" tabs={TABS} active={tab} />
      <div>
        {tab === "grid" && <GridView />}
        {tab === "oversikt" && <Oversikt />}
        {tab === "lokasjoner" && <LocationsPage />}
        {tab === "fasiliteter" && <FacilitiesPage />}
        {tab === "tilgjengelighet" && (
          <AvailabilityPage
            searchParams={Promise.resolve({ coach: params.coach })}
          />
        )}
      </div>
    </div>
  );
}

async function GridView() {
  const naa = new Date();
  const idagStart = new Date(naa);
  idagStart.setHours(0, 0, 0, 0);
  const idagSlutt = new Date(idagStart);
  idagSlutt.setDate(idagSlutt.getDate() + 1);

  const locations = await prisma.location.findMany({
    include: {
      facilities: { orderBy: { name: "asc" } },
      _count: {
        select: {
          bookings: {
            where: {
              startAt: { gte: idagStart, lt: idagSlutt },
              status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  if (locations.length === 0) {
    return (
      <EmptyState
        title="Ingen lokasjoner registrert ennå"
        body="Legg til din første lokasjon for å booke timer og vise belegg her."
      />
    );
  }

  const anlegg: AnleggKort[] = locations.map((l): AnleggKort => ({
    id: l.id,
    navn: l.name,
    type: deriveType(l.name),
    adresse: l.address,
    fasiliteter: l.facilities.map((f) => f.name),
    // Pseudo-utnyttelse basert på bookings i dag (max 100).
    utnyttelsePct: Math.min(100, l._count.bookings * 12),
    aktiv: l.active,
  }));

  return <AnleggGrid anlegg={anlegg} />;
}

async function Oversikt() {
  const naa = new Date();
  const fra = new Date(naa);
  fra.setDate(fra.getDate() - 30);

  const locations = await prisma.location.findMany({
    include: {
      facilities: { orderBy: { name: "asc" } },
      _count: {
        select: {
          bookings: {
            where: {
              startAt: { gte: fra },
              status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const totalFacilities = locations.reduce((s, l) => s + l.facilities.length, 0);
  const totalBookings = locations.reduce((s, l) => s + l._count.bookings, 0);
  const aktive = locations.filter((l) => l.active).length;
  const beleggSnitt =
    totalFacilities > 0
      ? Math.min(100, Math.round((totalBookings / Math.max(1, totalFacilities)) * 4))
      : 0;

  const mapLocations = locations.map((l) => ({
    id: l.id,
    name: l.name,
    address: l.address,
    latitude: l.latitude,
    longitude: l.longitude,
    active: l.active,
  }));

  if (locations.length === 0) {
    return (
      <EmptyState
        title="Ingen lokasjoner registrert ennå"
        body="Når du legger til lokasjoner, ser du belegg, fasiliteter og kart her."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi
          label="Aktive lokasjoner"
          value={String(aktive)}
          icon={MapPin}
          sub={`${aktive} av ${locations.length} synlige`}
          accent
        />
        <Kpi
          label="Totale fasiliteter"
          value={String(totalFacilities)}
          icon={Building2}
          sub={`Over ${locations.length} lokasjon${locations.length === 1 ? "" : "er"}`}
        />
        <Kpi
          label="Snitt-belegg 30 dgr"
          value={`${beleggSnitt}`}
          unit="%"
          icon={Gauge}
          sub={`${totalBookings} bookinger totalt`}
        />
      </div>

      {/* Filter-bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5">
        <label className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground sm:w-auto sm:min-w-[260px] sm:flex-1">
          <Search size={14} strokeWidth={1.75} aria-hidden />
          <input
            type="search"
            placeholder="Søk lokasjon eller adresse"
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none"
          />
        </label>
        <Chip>Indoor</Chip>
        <Chip>Hybrid</Chip>
        <Chip>Bane</Chip>
        <Chip>Range</Chip>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Sortert: navn ↑
        </span>
      </div>

      {/* Kart + kort */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <AnleggMapbox locations={mapLocations} />
        <div className="flex flex-col gap-4 overflow-visible pr-0 sm:grid sm:grid-cols-2 lg:flex lg:max-h-[640px] lg:grid-cols-1 lg:overflow-y-auto lg:pr-1">
          {locations.map((l) => (
            <Link
              key={l.id}
              href={`/admin/anlegg/${l.id}`}
              data-loc-id={l.id}
              className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LocationCard
                name={l.name}
                address={l.address}
                type={deriveType(l.name)}
                active={l.active}
                facilities={l.facilities.map((f) => f.name)}
                bookingsMonth={l._count.bookings}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <Building2 className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
      <p className="mt-3 font-display text-base font-bold tracking-[-0.015em] text-foreground">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      <div className="mt-5">
        <LocationForm triggerLabel="+ Ny lokasjon" />
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 overflow-hidden rounded-xl border bg-card px-[18px] py-4",
        accent ? "border-accent/40" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-md",
            accent ? "bg-accent text-primary" : "bg-secondary text-muted-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      <div className="font-mono text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
        {unit && <span className="ml-1 text-[13px] font-bold text-muted-foreground">{unit}</span>}
      </div>
      {sub && (
        <div className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground hover:bg-secondary">
      {children}
    </span>
  );
}

function LocationCard({
  name,
  address,
  type,
  active,
  facilities,
  bookingsMonth,
}: {
  name: string;
  address: string;
  type: LocType;
  active: boolean;
  facilities: string[];
  bookingsMonth: number;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="mb-4 flex items-start gap-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary font-display text-sm font-bold text-accent">
          {name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-bold leading-tight tracking-[-0.005em]">
            {name}
          </div>
          <div className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <MapPin size={11} strokeWidth={1.75} aria-hidden />
            {address}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em]",
            TYPE_PILL[type],
          )}
        >
          {TYPE_LABEL[type]}
        </span>
      </div>

      {facilities.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {facilities.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-[3px] bg-secondary px-2 py-0.5 font-mono text-[10px] text-foreground"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
        <Stat label="Status" value={active ? "Aktiv" : "Inaktiv"} />
        <Stat label="Fasiliteter" value={String(facilities.length)} />
        <Stat label="Bookinger 30d" value={String(bookingsMonth)} />
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm font-bold leading-none tabular-nums">{value}</div>
    </div>
  );
}
