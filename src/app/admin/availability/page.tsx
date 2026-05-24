import { CalendarClock, Plane, AlertCircle, Save } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { CoachFilter } from "@/components/admin/coach-filter";
import { SlotForm } from "./slot-form";

const DAGER = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
];

type SearchParams = Promise<{ coach?: string }>;

export default async function AvailabilityAdmin({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { coach: coachParam } = await searchParams;
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // ADMIN: filter via ?coach=<id>. COACH: alltid kun egne slots.
  const valgtCoachId =
    coach.role === "COACH"
      ? coach.id
      : coachParam && coachParam !== "alle"
        ? coachParam
        : null;

  const slots = await prisma.coachAvailability.findMany({
    where: valgtCoachId ? { coachId: valgtCoachId } : {},
    include: { coach: { select: { name: true } } },
    orderBy: [{ coachId: "asc" }, { weekday: "asc" }, { startTime: "asc" }],
  });

  // Hent coach-liste for filter-dropdown
  const coachListe =
    coach.role === "ADMIN"
      ? await prisma.user.findMany({
          where: { role: { in: ["COACH", "ADMIN"] } },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : [];

  const grupper = new Map<string, typeof slots>();
  for (const s of slots) {
    const navn = s.coach.name;
    grupper.set(navn, [...(grupper.get(navn) ?? []), s]);
  }

  const minSlots = slots.filter((s) => s.coachId === coach.id);
  const aktiveMin = minSlots.filter((s) => s.active).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Tilgjengelighet"
        titleLead="Når er du"
        titleItalic="bookbar"
        sub={
          minSlots.length > 0
            ? `${aktiveMin} aktive tidsvinduer i uka · spillere kan booke innenfor disse.`
            : "Ukentlige tidsvinduer for når spillere kan booke deg."
        }
        actions={<SlotForm triggerLabel="+ Legg til tidsvindu" />}
      />

      {coach.role === "ADMIN" && coachListe.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <CoachFilter
            coaches={coachListe.map((c) => ({ id: c.id, navn: c.name }))}
          />
        </div>
      )}

      {slots.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          titleItalic="Ingen"
          titleTrail="tidsvinduer ennå"
          sub="Legg til ukentlige tidsvinduer — for eksempel «Tirsdag 16:00–20:00» — så kan spillere booke seg inn der."
        />
      ) : (
        <>
          {minSlots.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                Min uke
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
                {DAGER.map((dag, i) => {
                  const slotter = minSlots.filter((s) => s.weekday === i);
                  return (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          {dag}
                        </span>
                        <SlotForm defaultWeekday={i} triggerLabel="+" />
                      </div>
                      {slotter.length === 0 ? (
                        <p className="mt-4 text-xs text-muted-foreground">—</p>
                      ) : (
                        <ul className="mt-4 space-y-2">
                          {slotter.map((s) => (
                            <li
                              key={s.id}
                              className="flex items-center justify-between gap-2 text-xs"
                            >
                              <span
                                className={`font-mono tabular-nums ${
                                  s.active
                                    ? "text-foreground"
                                    : "text-muted-foreground line-through"
                                }`}
                              >
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

          {/* Exception-rader (visuell mock) */}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Unntak og avbrudd
            </h2>
            <div className="space-y-2">
              <ExceptionRow icon={Plane} title="Ferie" sub="12.–19. juli" tone="muted" />
              <ExceptionRow icon={AlertCircle} title="Bortre uke" sub="3.–7. september · Kurs i Stockholm" tone="warn" />
            </div>
          </section>

          {/* Sticky save-bar */}
          <div className="sticky bottom-4 z-10 mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#B8852A]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {aktiveMin} aktive tidsvinduer · {minSlots.length - aktiveMin} inaktive
              </span>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-[#003A2A]"
            >
              <Save size={14} />
              Lagre endringer
            </button>
          </div>

          {coach.role === "ADMIN" && grupper.size > 1 && (
            <section className="space-y-4">
              <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                Andre coacher
                <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Admin-view
                </span>
              </h2>
              <div className="space-y-4">
                {Array.from(grupper.entries())
                  .filter(([, items]) => items[0].coachId !== coach.id)
                  .map(([navn, items]) => (
                    <div
                      key={navn}
                      className="rounded-lg border border-border bg-card p-6"
                    >
                      <div className="font-display text-base font-semibold text-foreground">
                        {navn}
                      </div>
                      <ul className="mt-4 space-y-2 text-sm">
                        {items.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center gap-4 font-mono tabular-nums text-muted-foreground"
                          >
                            <span className="text-foreground">
                              {DAGER[s.weekday]}
                            </span>
                            <span>
                              {s.startTime}–{s.endTime}
                            </span>
                            {!s.active && (
                              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                                Inaktiv
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ExceptionRow({
  icon: Icon,
  title,
  sub,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
  tone: "muted" | "warn";
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-3 ${
        tone === "warn" ? "border-[#B8852A]/30 bg-[#FFFBF5]" : "border-border bg-card"
      }`}
    >
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
          tone === "warn" ? "bg-[#B8852A]/20 text-[#B8852A]" : "bg-secondary text-muted-foreground"
        }`}
      >
        <Icon size={16} />
      </span>
      <div className="flex-1">
        <div className="font-display text-sm font-semibold text-foreground">{title}</div>
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      </div>
      <button
        type="button"
        className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        Endre
      </button>
    </div>
  );
}
