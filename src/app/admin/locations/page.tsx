import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function LocationsAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const locations = await prisma.location.findMany({
    include: {
      facilities: { where: { active: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Lokasjoner
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Anlegg</em> & lokasjoner
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Parent-lokasjoner med tilhørende fasiliteter.
        </p>
      </header>

      {locations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen lokasjoner registrert. Legg til via Prisma Studio.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {locations.map((l) => (
            <article
              key={l.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {l.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{l.address}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                    l.active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {l.active ? "Aktiv" : "Inaktiv"}
                </span>
              </div>

              <div className="mt-4 flex gap-4 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <span>{l.facilities.length} fasiliteter</span>
                <span>·</span>
                <span>{l._count.bookings} bookinger</span>
              </div>

              {l.facilities.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {l.facilities.map((f) => (
                    <li key={f.id} className="flex justify-between">
                      <span>{f.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        kapasitet {f.capacity}
                      </span>
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
