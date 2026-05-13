import Link from "next/link";
import { Building2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FacilityQuickAdd } from "./facility-quick-add";
import { MultiFacilityWeek } from "./multi-facility-week";

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay(); // 0=søn, 1=man
  const diff = (day + 6) % 7; // antall dager tilbake til mandag
  copy.setDate(copy.getDate() - diff);
  return copy;
}

const DAGER = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];

type SearchParams = Promise<{ uke?: string }>;

export default async function FacilitiesAdmin({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN", "GUEST"] });
  const kanBooke = user.role !== "GUEST";
  const params = searchParams ? await searchParams : {};

  // Beregn uke-vindu (mandag-start)
  const referansedag = params.uke ? new Date(params.uke) : new Date();
  if (isNaN(referansedag.getTime())) referansedag.setTime(Date.now());
  const ukeStart = startOfWeek(referansedag);
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeStart.getDate() + 7);

  const [facilities, spillere, serviceTypes, locations, ukebookings] = await Promise.all([
    prisma.facility.findMany({
      include: {
        location: { select: { id: true, name: true, active: true } },
      },
      orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
    }),
    kanBooke
      ? prisma.user.findMany({
          where: { role: "PLAYER" },
          select: { id: true, name: true, email: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([] as { id: string; name: string; email: string }[]),
    kanBooke
      ? prisma.serviceType.findMany({
          where: { active: true },
          select: { id: true, name: true, durationMin: true },
          orderBy: { durationMin: "asc" },
        })
      : Promise.resolve(
          [] as { id: string; name: string; durationMin: number }[],
        ),
    kanBooke
      ? prisma.location.findMany({
          where: { active: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([] as { id: string; name: string }[]),
    prisma.booking.findMany({
      where: {
        startAt: { gte: ukeStart, lt: ukeSlutt },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        facilityId: true,
        locationId: true,
        user: { select: { id: true, name: true } },
        serviceType: { select: { name: true } },
      },
      orderBy: { startAt: "asc" },
    }),
  ]);

  const facilityOptions = facilities.map((f) => ({
    id: f.id,
    name: f.name,
    locationId: f.location.id,
  }));

  // Bruker mandag-ukestart fra Promise.all + bygger dag-liste for uke-strip-tellingen
  const dager: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ukeStart);
    d.setDate(ukeStart.getDate() + i);
    dager.push(d);
  }
  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  const lokasjonIds = Array.from(new Set(facilities.map((f) => f.location.id)));

  // Telle bookinger per (lokasjonId, dato-index 0-6) for uke-strip på kort
  const tellingPerLokasjon = new Map<string, number[]>();
  for (const locId of lokasjonIds) {
    tellingPerLokasjon.set(locId, [0, 0, 0, 0, 0, 0, 0]);
  }
  for (const b of ukebookings) {
    const dagIdx = dager.findIndex(
      (d) =>
        d.getFullYear() === b.startAt.getFullYear() &&
        d.getMonth() === b.startAt.getMonth() &&
        d.getDate() === b.startAt.getDate(),
    );
    if (dagIdx === -1) continue;
    const arr = tellingPerLokasjon.get(b.locationId);
    if (arr) arr[dagIdx]++;
  }

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
        <div className="space-y-10">
          {Array.from(grupper.entries()).map(([locId, items]) => {
            const ukeTelling =
              tellingPerLokasjon.get(locId) ?? [0, 0, 0, 0, 0, 0, 0];
            const ukeSum = ukeTelling.reduce((a, b) => a + b, 0);
            const locName = items[0].location.name;
            const locFacilities = items
              .filter((f) => f.active)
              .map((f) => ({
                id: f.id,
                name: f.name,
                locationId: f.location.id,
                capacity: f.capacity,
              }));
            const locBookings = ukebookings
              .filter((b) => b.locationId === locId)
              .map((b) => ({
                id: b.id,
                startAt: b.startAt.toISOString(),
                endAt: b.endAt.toISOString(),
                status: b.status,
                facilityId: b.facilityId,
                user: b.user,
                serviceType: b.serviceType,
              }));
            return (
              <section key={locId} className="space-y-6">
                {locFacilities.length > 0 && (
                  <MultiFacilityWeek
                    locationName={locName}
                    facilities={locFacilities}
                    bookings={locBookings}
                    ukeStartIso={ukeStart.toISOString()}
                    spillere={spillere}
                    serviceTypes={serviceTypes}
                    locations={locations}
                    facilityOptions={facilityOptions}
                    kanBooke={kanBooke}
                  />
                )}
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      <Link
                        href={`/admin/locations`}
                        className="hover:text-primary"
                      >
                        {items[0].location.name}
                      </Link>
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {ukeSum} bookinger neste 7 dager
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {items.length}{" "}
                    {items.length === 1 ? "fasilitet" : "fasiliteter"}
                  </span>
                </div>

                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((f) => (
                    <li key={f.id} className="relative">
                      {kanBooke && f.active && (
                        <div className="absolute right-4 top-4 z-10">
                          <FacilityQuickAdd
                            facility={{
                              id: f.id,
                              name: f.name,
                              locationId: f.location.id,
                            }}
                            spillere={spillere}
                            serviceTypes={serviceTypes}
                            locations={locations}
                            facilities={facilityOptions}
                          />
                        </div>
                      )}
                      <Link
                        href={`/admin/facilities/${f.id}`}
                        className="block rounded-lg border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-sm"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1.5 inline-block h-2 w-2 rounded-full ${
                                f.active
                                  ? "bg-primary"
                                  : "bg-muted-foreground/40"
                              }`}
                            />
                            <span className="font-display text-sm font-semibold text-foreground">
                              {f.name}
                            </span>
                          </div>
                          {!f.active && (
                            <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                              Inaktiv
                            </span>
                          )}
                        </div>

                        {/* Uke-strip */}
                        <UkeStrip
                          dager={dager}
                          telling={ukeTelling}
                          idag={idag}
                        />

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                            Kapasitet:{" "}
                            <span className="text-foreground">{f.capacity}</span>
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                            Se kalender →
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UkeStrip({
  dager,
  telling,
  idag,
}: {
  dager: Date[];
  telling: number[];
  idag: Date;
}) {
  return (
    <div className="mt-5 grid grid-cols-7 gap-1">
      {dager.map((d, i) => {
        const count = telling[i] ?? 0;
        const erIdag =
          d.getFullYear() === idag.getFullYear() &&
          d.getMonth() === idag.getMonth() &&
          d.getDate() === idag.getDate();
        const ukedag = (d.getDay() + 6) % 7; // 0 = mandag
        // Heat-level: 0 = grå, 1-2 = lys grønn, 3-4 = mid, 5+ = mørk
        const heat =
          count === 0
            ? "bg-secondary"
            : count <= 2
              ? "bg-primary/20"
              : count <= 4
                ? "bg-primary/50"
                : "bg-primary/80";
        const tekstFarge = count >= 3 ? "text-primary-foreground" : "text-foreground";
        return (
          <div
            key={i}
            title={`${DAGER[ukedag]} ${d.getDate()}.${d.getMonth() + 1}: ${count} bookinger`}
            className={`flex flex-col items-center rounded-md py-1.5 text-center ${heat} ${
              erIdag ? "ring-1 ring-primary" : ""
            }`}
          >
            <span
              className={`font-mono text-[9px] uppercase tracking-wider ${
                count >= 3 ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            >
              {DAGER[ukedag]}
            </span>
            <span
              className={`font-mono text-[11px] font-semibold tabular-nums ${tekstFarge}`}
            >
              {count > 0 ? count : "·"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
