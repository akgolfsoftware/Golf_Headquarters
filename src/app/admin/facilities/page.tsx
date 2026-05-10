import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function FacilitiesAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const facilities = await prisma.facility.findMany({
    include: {
      location: { select: { id: true, name: true, active: true } },
    },
    orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
  });

  // Grupper per lokasjon
  const grupper = new Map<string, typeof facilities>();
  for (const f of facilities) {
    const eksisterende = grupper.get(f.location.id) ?? [];
    grupper.set(f.location.id, [...eksisterende, f]);
  }

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Fasiliteter
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Bookbare</em> fasiliteter
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Performance Studio, Putting Green, simulatorer, etc. — gruppert per lokasjon.
        </p>
      </header>

      {facilities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen fasiliteter registrert.
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grupper.entries()).map(([locId, items]) => (
            <section key={locId}>
              <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
                <Link
                  href={`/admin/locations`}
                  className="hover:text-primary"
                >
                  {items[0].location.name}
                </Link>
              </h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-foreground">{f.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                          f.active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {f.active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Kapasitet: {f.capacity}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
