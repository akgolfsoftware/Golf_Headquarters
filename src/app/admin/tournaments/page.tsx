/**
 * CoachHQ · Turneringer
 *
 * Migrert til endelig design (wireframe/design-files-v2/final/10-turneringer.html).
 * Liste-view med KPI-strip, filter-row, tabell med stars (viktighet), dato-pill,
 * lokasjon, påmeldte-count og status-pill. Italic Instrument Serif i hero.
 */
import Link from "next/link";
import {
  Trophy,
  Search,
  ChevronDown,
  MapPin,
  Star,
  List,
  CalendarDays,
  ArrowDownAZ,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TournamentForm } from "./tournament-form";

type TournamentRow = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  format: string;
  course: { name: string } | null;
  _count: { results: number };
};

const FORMAT_LABEL: Record<string, string> = {
  STROKE: "Stroke play",
  MATCH: "Match play",
  STABLEFORD: "Stableford",
  OTHER: "Annet",
};

function importanceForFormat(format: string): number {
  // Brukes som visuell viktighet (1–5 stjerner). Når vi får et reelt felt
  // for dette i schema kan vi bytte ut denne — inntil da bruker vi formatet.
  if (format === "STROKE") return 4;
  if (format === "MATCH") return 3;
  if (format === "STABLEFORD") return 3;
  return 2;
}

function formatDateRange(start: Date, end: Date | null): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const startStr = start.toLocaleDateString("nb-NO", opts);
  if (!end) return startStr;
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) return startStr;
  const endStr = end.toLocaleDateString("nb-NO", opts);
  return `${start.getDate()}.–${endStr}`;
}

export default async function Turneringer() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [tournaments, courses] = await Promise.all([
    prisma.tournament.findMany({
      include: {
        course: { select: { name: true } },
        _count: { select: { results: true } },
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.courseDefinition.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const idag = new Date();
  const kommende = tournaments
    .filter((t) => t.startDate >= idag)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const tidligere = tournaments.filter((t) => t.startDate < idag);
  const totalPaameldte = tournaments.reduce(
    (sum, t) => sum + t._count.results,
    0,
  );
  const nesteTurnering = kommende[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · /admin/tournaments"
        titleLead={`${kommende.length}`}
        titleItalic="kommende"
        titleTrail={`turneringer · ${totalPaameldte} påmeldte`}
        sub={`${tournaments.length} totalt · ${tidligere.length} ferdige · neste 90 dager: ${kommende.filter((t) => (t.startDate.getTime() - idag.getTime()) / 86400000 < 90).length}`}
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex gap-0.5 rounded-md border border-border bg-card p-1">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-foreground px-4 py-2 text-xs font-medium text-background">
                <List size={13} strokeWidth={1.75} />
                Liste
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-xs font-medium text-muted-foreground">
                <CalendarDays size={13} strokeWidth={1.75} />
                Kalender
              </span>
            </div>
            <TournamentForm courses={courses} triggerLabel="+ Ny turnering" />
          </div>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#274d41] bg-gradient-to-br from-[#0F2A22] to-[#163027] p-4 text-[#F5F4EE]">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#D1F843]/70">
            Kommende
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold leading-none">
            {kommende.length}
          </div>
          <div className="mt-2 font-mono text-[11px] text-[#F5F4EE]/70">
            neste 90 dager
          </div>
        </div>
        <KpiCard
          label="Påmeldte totalt"
          value={totalPaameldte.toString()}
          sub={`snitt ${
            tournaments.length > 0
              ? Math.round(totalPaameldte / tournaments.length)
              : 0
          } / turnering`}
        />
        <KpiCard
          label="Neste turnering"
          value={nesteTurnering?.name ?? "—"}
          sub={
            nesteTurnering
              ? formatDateRange(
                  nesteTurnering.startDate,
                  nesteTurnering.endDate,
                )
              : "Ingen kommende"
          }
          small
        />
        <KpiCard
          label="Ferdige turneringer"
          value={tidligere.length.toString()}
          sub="med resultater"
        />
      </div>

      {/* Filter-row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm sm:flex-initial">
          <Search size={14} strokeWidth={1.75} className="text-muted-foreground" />
          <input
            placeholder="Søk turnering eller arrangør"
            className="flex-1 border-none bg-transparent outline-none"
            aria-label="Søk i turneringer"
          />
        </div>
        <Chip>
          Viktighet <ChevronDown size={11} strokeWidth={1.75} />
        </Chip>
        <Chip>
          Format <ChevronDown size={11} strokeWidth={1.75} />
        </Chip>
        <Chip>
          Region <ChevronDown size={11} strokeWidth={1.75} />
        </Chip>
        <div className="ml-auto">
          <Chip>
            <ArrowDownAZ size={11} strokeWidth={1.75} /> Sortér: Dato
          </Chip>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <EmptyState
          icon={Trophy}
          titleItalic="Ingen turneringer"
          titleTrail="registrert"
          sub="Legg til konkurranser dine spillere skal delta i — fra klubbturneringer til NM. Periodisering-agenten bruker datoene for å sikte plan-peaks mot turnering."
        />
      ) : (
        <div className="space-y-8">
          {kommende.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Kommende{" "}
                <span className="font-normal text-muted-foreground">
                  ({kommende.length})
                </span>
              </h2>
              <TurneringTabell tournaments={kommende} />
            </section>
          )}

          {tidligere.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Tidligere{" "}
                <span className="font-normal text-muted-foreground">
                  ({tidligere.length})
                </span>
              </h2>
              <TurneringTabell tournaments={tidligere.slice(0, 20)} past />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function TurneringTabell({
  tournaments,
  past = false,
}: {
  tournaments: TournamentRow[];
  past?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Tabell-header (skjult på mobil) */}
      <div
        className="hidden border-b border-border bg-muted/40 px-6 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:grid"
        style={{
          gridTemplateColumns:
            "130px 1fr 200px 100px 110px 110px 80px",
          gap: "16px",
        }}
      >
        <div>Dato</div>
        <div>Navn</div>
        <div>Lokasjon</div>
        <div>Påmeldte</div>
        <div>Viktighet</div>
        <div>Status</div>
        <div />
      </div>

      <ul>
        {tournaments.map((t) => (
          <li key={t.id} className="border-b border-border/60 last:border-0">
            <Link
              href={`/admin/tournaments/${t.id}`}
              className="grid grid-cols-1 items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-muted/30 sm:grid-cols-[130px_1fr_200px_100px_110px_110px_80px]"
            >
              <span className="font-mono text-xs font-medium text-foreground tabular-nums">
                {formatDateRange(t.startDate, t.endDate)}
              </span>
              <div>
                <div className="font-medium text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">
                  {FORMAT_LABEL[t.format] ?? t.format}
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin size={11} strokeWidth={1.75} />
                {t.course?.name ?? "Bane ikke valgt"}
              </div>
              <div className="font-mono text-xs tabular-nums text-foreground">
                {t._count.results}{" "}
                <span className="text-muted-foreground">
                  {t._count.results === 1 ? "deltaker" : "deltakere"}
                </span>
              </div>
              <Stars n={importanceForFormat(t.format)} />
              <span
                className={`inline-flex w-fit items-center rounded-sm px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${
                  past
                    ? "bg-secondary text-muted-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {past ? "Ferdig" : "Åpen"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                Detaljer →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  const total = 5;
  return (
    <div className="inline-flex gap-0.5" aria-label={`Viktighet ${n} av ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={11}
          strokeWidth={1.75}
          aria-hidden="true"
          className={i < n ? "fill-foreground text-foreground" : "text-border"}
        />
      ))}
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
  small = false,
}: {
  label: string;
  value: string;
  sub: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono font-semibold leading-tight text-foreground tabular-nums ${
          small ? "text-lg" : "text-3xl"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[11px] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}
