import Link from "next/link";
import { Building2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function FacilitiesAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN", "GUEST"] });

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

  const aktive = facilities.filter((f) => f.active).length;
  const lokasjoner = grupper.size;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Fasiliteter"
        titleLead="Bookbare"
        titleItalic="fasiliteter"
        sub={`${facilities.length} fasiliteter på ${lokasjoner} lokasjoner — ${aktive} aktive. Studio, range, putting, simulatorer.`}
      />

      {facilities.length === 0 ? (
        <EmptyState
          icon={Building2}
          titleItalic="Ingen fasiliteter"
          titleTrail="registrert"
          sub="Fasiliteter opprettes via lokasjon-siden. Hver lokasjon kan ha flere bookbare rom."
          cta={
            <Link
              href="/admin/locations"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90"
            >
              Gå til lokasjoner
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {Array.from(grupper.entries()).map(([locId, items]) => (
            <section key={locId}>
              <div className="mb-4 flex items-end justify-between">
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  <Link
                    href={`/admin/locations`}
                    className="hover:text-primary"
                  >
                    {items[0].location.name}
                  </Link>
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {items.length} {items.length === 1 ? "fasilitet" : "fasiliteter"}
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-lg border border-border bg-card p-6"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 inline-block h-2 w-2 rounded-full ${
                            f.active ? "bg-primary" : "bg-muted-foreground/40"
                          }`}
                        />
                        <span className="font-display text-[14px] font-semibold text-foreground">
                          {f.name}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                          f.active
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {f.active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </div>
                    <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Kapasitet: <span className="text-foreground">{f.capacity}</span>
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
