import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Lokasjoner
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Anlegg</em> & lokasjoner
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Parent-lokasjoner med tilhørende fasiliteter.
          </p>
        </div>
        <LocationForm triggerLabel="+ Ny lokasjon" />
      </header>

      {locations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen lokasjoner registrert ennå.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {locations.map((l) => (
            <article
              key={l.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {l.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{l.address}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                      l.active
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
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

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <span>{l.facilities.length} fasiliteter</span>
                <span>·</span>
                <span>{l._count.bookings} bookinger</span>
                <span className="ml-auto">
                  <FacilityForm
                    locationId={l.id}
                    triggerLabel="+ Fasilitet"
                  />
                </span>
              </div>

              {l.facilities.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {l.facilities.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-2">
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
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
