/**
 * CoachHQ — Lokasjoner
 * Design migrert fra wireframe/design-files-v2/final/07-lokasjoner.html.
 *
 * Foundation-fasen viser kun lokasjon-kortene (kart-panelet er v2-feature).
 * Kortene har anlegg-info, fasiliteter, belegg-bar.
 */

import { MapPin, Search } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { LocationForm, FacilityForm } from "./location-form";

type FacilityType = "indoor" | "bane" | "range" | "hybrid";

// Deriverer "type" fra navn/adresse i fravær av eget kategori-felt i schema.
function deriveType(name: string): FacilityType {
  const n = name.toLowerCase();
  if (n.includes("mulligan") || n.includes("indoor") || n.includes("simulator")) {
    return "indoor";
  }
  if (n.includes("range")) return "range";
  if (n.includes("gk") || n.includes("golfklubb")) return "hybrid";
  return "bane";
}

const TYPE_LABEL: Record<FacilityType, string> = {
  indoor: "Indoor",
  bane: "Bane",
  range: "Range",
  hybrid: "Hybrid",
};

// Type-pills: kategori-koding for 4 fasilitets-typer. Mappet til semantic tokens.
const TYPE_STYLE: Record<FacilityType, string> = {
  indoor: "bg-secondary text-muted-foreground",
  bane: "bg-primary/15 text-primary",
  range: "bg-accent/30 text-accent-foreground",
  hybrid: "bg-primary/10 text-primary",
};

export default async function LocationsAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const locations = await prisma.location.findMany({
    include: {
      facilities: { orderBy: { name: "asc" } },
      _count: { select: { bookings: true } },
    },
    orderBy: { name: "asc" },
  });

  const totaltFacilities = locations.reduce(
    (sum, l) => sum + l.facilities.length,
    0,
  );
  const totalBookings = locations.reduce(
    (sum, l) => sum + l._count.bookings,
    0,
  );
  const aktive = locations.filter((l) => l.active).length;

  // Belegg-snitt — vi har ikke timer-koblet kapasitet i schema, så vi bruker
  // booking-andel per fasilitet som proxy. Skala 0–100 %.
  const beleggSnitt =
    totaltFacilities > 0
      ? Math.min(
          100,
          Math.round((totalBookings / Math.max(1, totaltFacilities)) * 4),
        )
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/locations"
        titleLead={String(locations.length)}
        titleItalic="lokasjoner"
        titleTrail={`· ${totaltFacilities} fasiliteter`}
        sub="Parent-anlegg med tilhørende bookbare rom. Lokasjon = parent (GFGK, Mulligan). Fasilitet = bookbar barn (Studio 1, Range)."
        actions={<LocationForm triggerLabel="+ Ny lokasjon" />}
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <KpiAccent
          label="Aktive lokasjoner"
          value={String(aktive)}
          sub={
            aktive === locations.length
              ? "Alle synlige i booking"
              : `${locations.length - aktive} inaktive`
          }
        />
        <Kpi
          label="Fasiliteter totalt"
          value={String(totaltFacilities)}
          sub={`Over ${locations.length} lokasjon${locations.length === 1 ? "" : "er"}`}
        />
        <Kpi
          label="Bookinger totalt"
          value={String(totalBookings)}
          unit=""
          sub={`Snitt-belegg ${beleggSnitt} %`}
        />
      </div>

      {/* Filter */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[260px] items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            placeholder="Søk lokasjon eller adresse"
            className="flex-1 bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
          />
        </label>
        <FilterChip label="Type" />
        <FilterChip label="Region" />
      </form>

      {/* Body */}
      {locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          titleItalic="Ingen lokasjoner"
          titleTrail="ennå"
          sub="Legg til ditt første anlegg — fra simulatorhall til 18-hulls bane. Når lokasjonen er lagt til, kan du opprette fasiliteter og koble dem til tjenester."
          cta={<LocationForm triggerLabel="+ Legg til lokasjon" />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {locations.map((l) => {
            const type = deriveType(l.name);
            // Belegg per lokasjon — booking-andel × konstant for visning.
            const belegg = Math.min(
              100,
              Math.round((l._count.bookings / Math.max(1, l.facilities.length || 1)) * 4),
            );
            return (
              <article
                key={l.id}
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-semibold leading-snug text-foreground">
                      {l.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {l.address}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-sm px-1.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] ${TYPE_STYLE[type]}`}
                    >
                      {TYPE_LABEL[type]}
                    </span>
                    <LocationForm
                      initial={{
                        id: l.id,
                        name: l.name,
                        address: l.address,
                        active: l.active,
                      }}
                      triggerLabel="Endre"
                    />
                  </div>
                </div>

                <div className="flex gap-6 font-mono text-[11px] text-muted-foreground">
                  <InfoStat
                    label="Status"
                    value={l.active ? "Aktiv" : "Inaktiv"}
                  />
                  <InfoStat
                    label="Fasiliteter"
                    value={String(l.facilities.length)}
                  />
                  <InfoStat
                    label="Bookinger"
                    value={String(l._count.bookings)}
                  />
                </div>

                {l.facilities.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 border-t border-border pt-4">
                    {l.facilities.map((f) => (
                      <span
                        key={f.id}
                        className="inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] text-foreground"
                      >
                        <MapPin size={11} strokeWidth={1.75} className="text-primary" />
                        {f.name}
                        <FacilityForm
                          locationId={l.id}
                          initial={{
                            id: f.id,
                            name: f.name,
                            capacity: f.capacity,
                            active: f.active,
                          }}
                          triggerLabel="Endre"
                        />
                      </span>
                    ))}
                    <FacilityForm locationId={l.id} triggerLabel="+ Fasilitet" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-border bg-background/40 px-4 py-2 text-[12px] text-muted-foreground">
                    <span>Ingen fasiliteter ennå</span>
                    <FacilityForm locationId={l.id} triggerLabel="+ Fasilitet" />
                  </div>
                )}

                {/* Belegg-bar */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${belegg}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] font-semibold tabular-nums text-foreground">
                    {belegg} %
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ----------------- Komponenter -----------------

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[13px] font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

function KpiAccent({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-foreground p-4 text-background dark:bg-card">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(209,248,67,0.70)]">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-[rgba(245,244,238,0.7)]">
          {sub}
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
        {value}
        {unit && (
          <span className="ml-1 text-[13px] font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] text-muted-foreground">
      {label}
    </span>
  );
}
