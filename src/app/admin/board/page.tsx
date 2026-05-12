/**
 * CoachHQ · Coaching board (Økter-design)
 *
 * Migrert til endelig design (wireframe/design-files-v2/final/05-okter.html).
 * Board-konseptet beholdes (auto-klassifisering av spillere etter aktivitet),
 * men presentert med Økter-designets KPI-strip, filter-row, legend og
 * card-kolonner med pyramide-stripe + status-pill. Italic Instrument Serif.
 */
import Link from "next/link";
import {
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type Status = "Ny" | "Aktiv" | "Fokus" | "Pause";

type Spiller = {
  id: string;
  name: string;
  hcp: number | null;
  tier: string;
  trainingPlans: { isActive: boolean }[];
  rounds: { playedAt: Date }[];
  lastLoginAt: Date | null;
};

function bestemStatus(player: Spiller): Status {
  const idag = new Date();
  const sistInne = player.lastLoginAt
    ? (idag.getTime() - player.lastLoginAt.getTime()) / 86400000
    : Infinity;
  const harAktivPlan = player.trainingPlans.some((p) => p.isActive);
  const sisteRunde = player.rounds[0]?.playedAt;
  const dagerSidenRunde = sisteRunde
    ? (idag.getTime() - sisteRunde.getTime()) / 86400000
    : Infinity;

  if (sistInne > 30) return "Pause";
  if (!harAktivPlan) return "Ny";
  if (dagerSidenRunde < 7) return "Fokus";
  return "Aktiv";
}

const KOLONNER: Status[] = ["Ny", "Aktiv", "Fokus", "Pause"];

// Pyramide-fargene fra Økter-designet — brukes som status-stripe per spiller-card.
const STATUS_STRIPE: Record<Status, string> = {
  Ny: "bg-[#16A34A]", // FYS-grønn
  Aktiv: "bg-primary", // TEK-grønn (mørk)
  Fokus: "bg-accent", // SLAG-lime
  Pause: "bg-muted-foreground", // TURN-grå
};

const STATUS_PILL: Record<Status, string> = {
  Ny: "bg-[#16A34A]/15 text-[#0f7536]",
  Aktiv: "bg-primary/12 text-primary",
  Fokus: "bg-accent/40 text-accent-foreground",
  Pause: "bg-secondary text-muted-foreground",
};

const STATUS_BESKRIVELSE: Record<Status, string> = {
  Ny: "Ingen aktiv treningsplan",
  Aktiv: "Aktiv plan, ingen nylig runde",
  Fokus: "Aktiv plan + runde siste 7 dager",
  Pause: "Ingen pålogging på 30+ dager",
};

export default async function CoachingBoard() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const players = await prisma.user.findMany({
    where: { role: "PLAYER" },
    include: {
      trainingPlans: { select: { isActive: true } },
      rounds: {
        select: { playedAt: true },
        orderBy: { playedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  const grupper: Record<Status, Spiller[]> = {
    Ny: [],
    Aktiv: [],
    Fokus: [],
    Pause: [],
  };
  for (const p of players) grupper[bestemStatus(p)].push(p);

  // Beregn ukenummer for "denne uka"
  const idag = new Date();
  const onsdag = new Date(idag);
  const start = new Date(idag);
  start.setDate(idag.getDate() - ((idag.getDay() + 6) % 7));
  const slutt = new Date(start);
  slutt.setDate(start.getDate() + 6);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · /admin/board"
        titleLead={`${players.length}`}
        titleItalic="spillere"
        titleTrail="i porteføljen"
        sub="Auto-klassifisering basert på siste aktivitet og aktive planer. Klikk på en spiller for å se profilen."
        actions={
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              aria-label="Forrige uke"
              className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={14} strokeWidth={1.75} />
            </button>
            <span className="font-display text-sm font-semibold">
              {start.toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "short",
              })}{" "}
              –{" "}
              {slutt.toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "short",
              })}
            </span>
            <button
              type="button"
              aria-label="Neste uke"
              className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <ChevronRight size={14} strokeWidth={1.75} />
            </button>
          </div>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#274d41] bg-gradient-to-br from-[#0F2A22] to-[#163027] p-4 text-[#F5F4EE]">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#D1F843]/70">
            Spillere totalt
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold leading-none">
            {players.length}
          </div>
          <div className="mt-2 font-mono text-[11px] text-[#F5F4EE]/70">
            i aktiv portefølje
          </div>
        </div>
        <KpiCard
          label="I fokus"
          value={grupper.Fokus.length.toString()}
          sub="aktiv plan + runde siste 7d"
        />
        <KpiCard
          label="Nye spillere"
          value={grupper.Ny.length.toString()}
          sub="trenger plan"
        />
        <KpiCard
          label="På pause"
          value={grupper.Pause.length.toString()}
          sub="30+ dager uten aktivitet"
          warn={grupper.Pause.length > 0}
        />
      </div>

      {/* Filter-row med legend */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm sm:flex-initial">
          <Search size={14} strokeWidth={1.75} className="text-muted-foreground" />
          <input
            placeholder="Søk spiller eller HCP"
            className="flex-1 border-none bg-transparent outline-none"
            aria-label="Søk i spillere"
          />
        </div>
        <Chip>
          HCP <ChevronDown size={11} strokeWidth={1.75} />
        </Chip>
        <Chip>
          Tier <ChevronDown size={11} strokeWidth={1.75} />
        </Chip>
        <div className="ml-auto flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
          {KOLONNER.map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-sm ${STATUS_STRIPE[k]}`}
              />
              {k}
            </span>
          ))}
        </div>
      </div>

      {players.length === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Ingen spillere"
          titleTrail="enda"
          sub="Boardet fylles ut når spillere er registrert i systemet."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {KOLONNER.map((status) => (
            <section
              key={status}
              aria-label={`${status}-spillere`}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card/40 p-4"
            >
              <header className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-display text-base font-semibold tracking-tight">
                    {status}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${STATUS_PILL[status]}`}
                  >
                    {grupper[status].length}
                  </span>
                </div>
              </header>
              <p className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                {STATUS_BESKRIVELSE[status]}
              </p>

              {grupper[status].length === 0 ? (
                <div className="grid place-items-center rounded-md border border-dashed border-border bg-card/40 px-4 py-8 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Tom
                </div>
              ) : (
                <ul className="space-y-2">
                  {grupper[status].map((p) => (
                    <li
                      key={p.id}
                      className="overflow-hidden rounded-md border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
                    >
                      <Link
                        href={`/admin/elever/${p.id}`}
                        className="flex"
                        aria-label={`Åpne profil for ${p.name}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`w-1.5 flex-shrink-0 ${STATUS_STRIPE[status]}`}
                        />
                        <div className="flex-1 p-3">
                          <div className="font-medium text-foreground">
                            {p.name}
                          </div>
                          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                            {p.hcp != null && (
                              <span>
                                HCP{" "}
                                {p.hcp.toFixed(1).replace(".", ",")}
                              </span>
                            )}
                            {p.hcp != null && <span>·</span>}
                            <span>{p.tier}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  warn = false,
}: {
  label: string;
  value: string;
  sub: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-3xl font-semibold leading-none tabular-nums ${warn ? "text-destructive" : "text-foreground"}`}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[11px] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}
