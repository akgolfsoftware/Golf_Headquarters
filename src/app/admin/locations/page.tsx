import { MapPin } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LocationForm, FacilityForm } from "./location-form";

export default async function LocationsAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const locations = await prisma.location.findMany({
    include: {
      facilities: { orderBy: { name: "asc" } },
      _count: { select: { bookings: true } },
    },
    orderBy: { name: "asc" },
  });

  const totaltFacilities = locations.reduce((sum, l) => sum + l.facilities.length, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Lokasjoner"
        titleLead="Anlegg"
        titleItalic="& lokasjoner"
        sub={`${locations.length} lokasjoner · ${totaltFacilities} fasiliteter. Parent-anlegg med tilhørende bookbare rom.`}
        actions={<LocationForm triggerLabel="+ Ny lokasjon" />}
      />

      {locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          titleItalic="Ingen lokasjoner"
          titleTrail="registrert"
          sub="Lokasjon = parent (GFGK, Mulligan). Fasilitet = bookbar barn (Studio 1, Range). Klikk «+ Ny lokasjon»."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {locations.map((l) => (
            <article
              key={l.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-base font-semibold text-primary-foreground">
                    {l.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {l.name}
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                      <MapPin size={11} strokeWidth={1.5} />
                      {l.address}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                      l.active
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {l.active ? "Aktiv" : "Inaktiv"}
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

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4">
                <Stat label="Fasiliteter" value={String(l.facilities.length)} />
                <Stat label="Bookinger" value={String(l._count.bookings)} />
              </div>

              {l.facilities.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Fasiliteter
                    </div>
                    <FacilityForm locationId={l.id} triggerLabel="+ Fasilitet" />
                  </div>
                  <ul className="space-y-2 text-sm">
                    {l.facilities.map((f) => (
                      <li
                        key={f.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
                      >
                        <span>
                          <span className="font-medium">{f.name}</span>
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                            kap. {f.capacity}
                            {!f.active && " · inaktiv"}
                          </span>
                        </span>
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
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {l.facilities.length === 0 && (
                <div className="mt-4 flex items-center justify-between gap-2 rounded-md border border-dashed border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                  <span>Ingen fasiliteter ennå</span>
                  <FacilityForm locationId={l.id} triggerLabel="+ Fasilitet" />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-[18px] font-semibold leading-none tabular-nums">
        {value}
      </div>
    </div>
  );
}
