import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

export default async function AvailabilityAdmin() {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const slots = await prisma.coachAvailability.findMany({
    where: coach.role === "ADMIN" ? {} : { coachId: coach.id },
    include: {
      coach: { select: { name: true } },
    },
    orderBy: [{ coachId: "asc" }, { weekday: "asc" }, { startTime: "asc" }],
  });

  // Grupper per coach
  const grupper = new Map<string, typeof slots>();
  for (const s of slots) {
    const navn = s.coach.name;
    grupper.set(navn, [...(grupper.get(navn) ?? []), s]);
  }

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Tilgjengelighet
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Coach</em>-tilgjengelighet
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ukentlige tidsvinduer for når coachen er bookbar.
        </p>
      </header>

      {slots.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen tidsvinduer registrert. Legg til via Prisma Studio inntil edit-UI er bygget.
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grupper.entries()).map(([navn, items]) => (
            <section key={navn}>
              <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
                {navn}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
                {DAGER.map((dag, i) => {
                  const slotter = items.filter((s) => s.weekday === i);
                  return (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {dag}
                      </div>
                      {slotter.length === 0 ? (
                        <p className="mt-2 text-xs text-muted-foreground">—</p>
                      ) : (
                        <ul className="mt-2 space-y-1">
                          {slotter.map((s) => (
                            <li
                              key={s.id}
                              className="font-mono text-xs tabular-nums text-foreground"
                            >
                              {s.startTime}–{s.endTime}
                              {!s.active && (
                                <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                                  (inaktiv)
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
