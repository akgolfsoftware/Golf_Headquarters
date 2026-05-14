/**
 * CoachHQ — Anlegg (samle-side).
 *
 * Tabs:
 *  - oversikt  : KPI-strip + kart-stub + lokasjons-kort med fasilitet-grid
 *  - lokasjoner: Lokasjons-CRUD (eksisterende side)
 *  - fasiliteter: Fasilitets-oversikt (eksisterende side)
 *  - tilgjengelighet: Coach-tilgjengelighet (eksisterende side)
 *
 * Oversikten er bygd fra src/app/lokasjoner-demo/page.tsx, men kobles til
 * Prisma-data (location + facility + bookings).
 */

import { MapPin, Search } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { TabStrip } from "@/components/admin/tab-strip";
import LocationsPage from "@/app/admin/locations/page";
import FacilitiesPage from "@/app/admin/facilities/page";
import AvailabilityPage from "@/app/admin/availability/page";
import { LocationForm } from "@/app/admin/locations/location-form";

type TabKey = "oversikt" | "lokasjoner" | "fasiliteter" | "tilgjengelighet";

const TABS = [
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
    rawTab === "tilgjengelighet"
      ? rawTab
      : "oversikt";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Planlegge"
        titleLead="Anlegg og"
        titleItalic="tilgjengelighet"
        sub="Lokasjoner, fasiliteter og trener-tilgjengelighet samlet."
        actions={<LocationForm triggerLabel="+ Ny lokasjon" />}
      />
      <TabStrip basePath="/admin/anlegg" tabs={TABS} active={tab} />
      <div>
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

  const totalFacilities = locations.reduce(
    (s, l) => s + l.facilities.length,
    0,
  );
  const totalBookings = locations.reduce((s, l) => s + l._count.bookings, 0);
  const aktive = locations.filter((l) => l.active).length;
  const beleggSnitt =
    totalFacilities > 0
      ? Math.min(
          100,
          Math.round((totalBookings / Math.max(1, totalFacilities)) * 4),
        )
      : 0;

  // Pin-posisjoner — deterministisk basert på navn (stub før Mapbox)
  const pins = locations.map((l, i) => ({
    id: l.id,
    badge: l.name.charAt(0).toUpperCase(),
    x: 16 + ((i * 17) % 70),
    y: 22 + ((i * 23) % 60),
  }));

  return (
    <div className="space-y-6">
      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi
          label="Aktive lokasjoner"
          value={String(aktive)}
          sub={`${aktive} av ${locations.length} synlige`}
        />
        <Kpi
          label="Totale fasiliteter"
          value={String(totalFacilities)}
          sub={`Over ${locations.length} lokasjon${locations.length === 1 ? "" : "er"}`}
        />
        <Kpi
          label="Snitt-belegg 30 dgr"
          value={`${beleggSnitt} %`}
          sub={`${totalBookings} bookinger totalt`}
        />
      </div>

      {/* Filter-chips */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <label className="flex h-10 min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Søk lokasjon eller adresse"
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <Chip>Indoor</Chip>
        <Chip>Hybrid</Chip>
        <Chip>Bane</Chip>
        <Chip>Range</Chip>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          Sortert: navn ↑
        </span>
      </div>

      {/* Kart + kort */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <MapStub pins={pins} />
        <div className="flex max-h-[640px] flex-col gap-4 overflow-y-auto pr-1">
          {locations.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Ingen lokasjoner registrert ennå.
            </div>
          )}
          {locations.map((l) => (
            <LocationCard
              key={l.id}
              name={l.name}
              address={l.address}
              type={deriveType(l.name)}
              active={l.active}
              facilities={l.facilities.map((f) => f.name)}
              bookingsMonth={l._count.bookings}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[28px] font-medium leading-none tabular-nums text-foreground">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-[12px] text-muted-foreground hover:bg-secondary">
      {children}
    </span>
  );
}

function MapStub({
  pins,
}: {
  pins: { id: string; badge: string; x: number; y: number }[];
}) {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-border bg-gradient-to-br from-primary/5 to-accent/10">
      {/* Grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,88,64,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,88,64,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Region-labels */}
      <span className="absolute left-[6%] top-[22%] font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        Fredrikstad
      </span>
      <span className="absolute left-[55%] top-[14%] font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        Drøbak
      </span>
      <span className="absolute left-[18%] top-[78%] font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        Borge
      </span>

      {pins.map((p, i) => (
        <div
          key={p.id}
          className="absolute -translate-x-1/2"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <div
            className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold ${
              i === 0
                ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30"
                : "bg-card text-foreground ring-1 ring-border"
            }`}
          >
            {p.badge}
          </div>
        </div>
      ))}

      <div className="absolute right-3 top-3 rounded-md bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground">
        Kart-stub · Mapbox kommer
      </div>
    </div>
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
    <article className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary">
      <div className="mb-4 flex items-start gap-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
          {name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-semibold leading-tight">
            {name}
          </div>
          <div className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <MapPin size={11} strokeWidth={1.75} />
            {address}
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_PILL[type]}`}
        >
          {TYPE_LABEL[type]}
        </span>
      </div>

      {facilities.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {facilities.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-sm bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground"
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
      <div className="mt-1 font-mono text-sm font-semibold leading-none tabular-nums">
        {value}
      </div>
    </div>
  );
}
