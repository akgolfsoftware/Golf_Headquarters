import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { SlotForm } from "./slot-form";

const DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

export default async function AvailabilityAdmin() {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const slots = await prisma.coachAvailability.findMany({
    where: coach.role === "ADMIN" ? {} : { coachId: coach.id },
    include: { coach: { select: { name: true } } },
    orderBy: [{ coachId: "asc" }, { weekday: "asc" }, { startTime: "asc" }],
  });

  const grupper = new Map<string, typeof slots>();
  for (const s of slots) {
    const navn = s.coach.name;
    grupper.set(navn, [...(grupper.get(navn) ?? []), s]);
  }

  const minSlots = slots.filter((s) => s.coachId === coach.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Tilgjengelighet
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Coach</em>-tilgjengelighet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ukentlige tidsvinduer for når du er bookbar.
          </p>
        </div>
        <SlotForm triggerLabel="+ Legg til tidsvindu" />
      </header>

      {slots.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen tidsvinduer registrert ennå.
        </div>
      )}

      {minSlots.length > 0 && (
        <section>
          <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
            Min uke
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
            {DAGER.map((dag, i) => {
              const slotter = minSlots.filter((s) => s.weekday === i);
              return (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {dag}
                    </span>
                    <SlotForm defaultWeekday={i} triggerLabel="+" />
                  </div>
                  {slotter.length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">—</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {slotter.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between gap-1 text-xs"
                        >
                          <span className={`font-mono tabular-nums ${s.active ? "text-foreground" : "text-muted-foreground line-through"}`}>
                            {s.startTime}–{s.endTime}
                          </span>
                          <SlotForm
                            initial={{
                              id: s.id,
                              weekday: s.weekday,
                              startTime: s.startTime,
                              endTime: s.endTime,
                              active: s.active,
                            }}
                            triggerLabel="Endre"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {coach.role === "ADMIN" && grupper.size > 1 && (
        <section>
          <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
            Andre coacher (admin-view)
          </h3>
          <div className="space-y-4">
            {Array.from(grupper.entries())
              .filter(([, items]) => items[0].coachId !== coach.id)
              .map(([navn, items]) => (
                <div key={navn} className="rounded-lg border border-border bg-card p-4">
                  <div className="font-medium text-foreground">{navn}</div>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {items.map((s) => (
                      <li key={s.id} className="font-mono tabular-nums">
                        {DAGER[s.weekday]} {s.startTime}–{s.endTime}
                        {!s.active && " (inaktiv)"}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
