/**
 * CoachHQ · Turneringer — planlegger-oversikt
 *
 * Tour-pills (Olyo/Srixon/Østlandstour/Garmin), krets, periode, søk.
 * Default: kommende turneringer sortert stigende på dato.
 * Hver rad har "Meld på"-knapp som åpner TournamentEnrollModal.
 */

import Link from "next/link";
import { Trophy, Search, MapPin, Star, CalendarDays, List, ArrowDownAZ, Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { EksportTrigger } from "@/components/shared/eksport-trigger";
import { TournamentForm } from "./tournament-form";
import { TournamentEnrollModal } from "@/components/coachhq/tournament-enroll-modal";

type TourKey = "olyo" | "srixon" | "ostlandstour" | "garmin";
const TOUR_LABEL: Record<string, string> = {
  olyo: "Olyo Juniortour",
  srixon: "Srixon Tour",
  ostlandstour: "Titleist Østlandstour",
  garmin: "Garmin Norges Cup",
};
const TOUR_TONE: Record<string, string> = {
  olyo: "bg-accent/30 text-foreground",
  srixon: "bg-primary/15 text-primary",
  ostlandstour: "bg-secondary text-foreground",
  garmin: "bg-muted text-muted-foreground",
};
const TOUR_LETTER: Record<string, string> = {
  olyo: "O",
  srixon: "S",
  ostlandstour: "Ø",
  garmin: "G",
};

type Periode = "30" | "90" | "2026" | "tidligere" | "alle";

type Search = {
  tour?: string;
  krets?: string;
  periode?: string;
  q?: string;
};

type Meta = {
  tour?: string;
  krets?: string;
  categories?: unknown;
  externalId?: string;
};

function parseMeta(notes: string | null): Meta | null {
  if (!notes) return null;
  try {
    const m = JSON.parse(notes);
    if (m && typeof m === "object") return m as Meta;
  } catch {
    // ignore
  }
  return null;
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

export default async function Turneringer({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = await searchParams;
  const valgtTour = (sp.tour ?? "").toLowerCase();
  const valgtKrets = (sp.krets ?? "").toLowerCase();
  const valgtPeriode = (sp.periode ?? "30") as Periode;
  const sok = (sp.q ?? "").trim().toLowerCase();

  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  const periodeFra: Date | null = (() => {
    if (valgtPeriode === "tidligere" || valgtPeriode === "alle") return null;
    return idag;
  })();
  const periodeTil: Date | null = (() => {
    if (valgtPeriode === "30") {
      const d = new Date(idag);
      d.setDate(d.getDate() + 30);
      return d;
    }
    if (valgtPeriode === "90") {
      const d = new Date(idag);
      d.setDate(d.getDate() + 90);
      return d;
    }
    if (valgtPeriode === "2026") {
      return new Date(2027, 0, 1);
    }
    if (valgtPeriode === "tidligere") return idag;
    return null;
  })();

  const [allTournaments, courses, players, allEntries] = await Promise.all([
    prisma.tournament.findMany({
      include: {
        course: { select: { name: true } },
        _count: { select: { results: true, entries: true } },
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.courseDefinition.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { role: "PLAYER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, hcp: true, tier: true },
    }),
    prisma.tournamentEntry.findMany({
      where: { tournamentId: { not: null } },
      select: {
        id: true,
        tournamentId: true,
        userId: true,
        priority: true,
        user: { select: { name: true, hcp: true, tier: true } },
      },
    }),
  ]);

  // Bygg entry-mapper per turnering
  const entryMap = new Map<
    string,
    Array<{
      entryId: string;
      userId: string;
      name: string;
      hcp: number | null;
      tier: string;
      priority: string;
    }>
  >();
  for (const e of allEntries) {
    if (!e.tournamentId) continue;
    const liste = entryMap.get(e.tournamentId) ?? [];
    liste.push({
      entryId: e.id,
      userId: e.userId,
      name: e.user.name ?? "(uten navn)",
      hcp: e.user.hcp,
      tier: e.user.tier,
      priority: e.priority,
    });
    entryMap.set(e.tournamentId, liste);
  }

  // Tilgjengelige kretser (fra olyo-data)
  const tilgjengeligeKretser = new Set<string>();
  for (const t of allTournaments) {
    const m = parseMeta(t.notes);
    if (m?.krets && typeof m.krets === "string") {
      tilgjengeligeKretser.add(m.krets);
    }
  }

  // Filter-logikk
  const filtered = allTournaments.filter((t) => {
    const meta = parseMeta(t.notes);
    const tour = meta?.tour?.toLowerCase() ?? "";

    if (valgtTour && tour !== valgtTour) return false;
    if (valgtKrets && (meta?.krets?.toLowerCase() ?? "") !== valgtKrets) return false;

    if (periodeFra && t.startDate < periodeFra) return false;
    if (periodeTil && t.startDate >= periodeTil) return false;

    if (sok && !t.name.toLowerCase().includes(sok)) return false;

    return true;
  });

  const totalPaameldte = allTournaments.reduce(
    (sum, t) => sum + t._count.entries,
    0,
  );
  const kommendeAlle = allTournaments.filter((t) => t.startDate >= idag);
  const nesteTurnering = kommendeAlle[0];

  const playerData = players.map((p) => ({
    id: p.id,
    name: p.name ?? "(uten navn)",
    hcp: p.hcp,
    tier: p.tier,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · /admin/tournaments"
        titleLead={`${kommendeAlle.length}`}
        titleItalic="kommende"
        titleTrail={`turneringer · ${totalPaameldte} påmeldte`}
        sub={`${allTournaments.length} totalt · ${filtered.length} treff på valgt filter · neste: ${nesteTurnering?.name ?? "—"}`}
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
            <Link
              href="/admin/tournaments/ny"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              + Ny turnering
            </Link>
            <TournamentForm courses={courses} triggerLabel="Hurtigopprett" />
            <EksportTrigger
              kind="tournaments"
              turneringer={allTournaments.map((t) => ({
                id: t.id,
                name: t.name,
              }))}
            />
          </div>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Kommende totalt" value={kommendeAlle.length.toString()} sub="kommende turneringer" />
        <KpiCard label="Påmeldte totalt" value={totalPaameldte.toString()} sub="aktive påmeldinger" />
        <KpiCard
          label="Neste turnering"
          value={nesteTurnering?.name ?? "—"}
          sub={
            nesteTurnering
              ? formatDateRange(nesteTurnering.startDate, nesteTurnering.endDate)
              : "Ingen kommende"
          }
          small
        />
        <KpiCard label="Treff på filter" value={filtered.length.toString()} sub={`av ${allTournaments.length}`} />
      </div>

      {/* Filter-row (med GET-form for å bevare server-rendering) */}
      <form className="space-y-3" method="GET">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm sm:flex-initial">
            <Search size={14} strokeWidth={1.75} className="text-muted-foreground" />
            <input
              name="q"
              defaultValue={sok}
              placeholder="Søk turnering"
              className="flex-1 border-none bg-transparent outline-none"
              aria-label="Søk i turneringer"
            />
          </div>

          {/* Periode-pills */}
          <PeriodePills aktiv={valgtPeriode} />

          {/* Krets-select (kun hvis olyo har data) */}
          {tilgjengeligeKretser.size > 0 && (
            <select
              name="krets"
              defaultValue={valgtKrets}
              className="h-9 rounded-md border border-border bg-card px-3 text-xs"
              aria-label="Filter krets"
            >
              <option value="">Alle kretser</option>
              {Array.from(tilgjengeligeKretser)
                .sort()
                .map((k) => (
                  <option key={k} value={k.toLowerCase()}>
                    {k}
                  </option>
                ))}
            </select>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <ArrowDownAZ size={12} strokeWidth={1.75} /> Bruk filter
            </button>
          </div>
        </div>

        {/* Tour-pills */}
        <div className="flex flex-wrap items-center gap-2">
          <TourPill href={byggHref(sp, { tour: "" })} aktiv={!valgtTour}>
            Alle
          </TourPill>
          {(["olyo", "srixon", "ostlandstour", "garmin"] as TourKey[]).map((tour) => (
            <TourPill key={tour} href={byggHref(sp, { tour })} aktiv={valgtTour === tour}>
              {TOUR_LABEL[tour]}
            </TourPill>
          ))}
        </div>
      </form>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          titleItalic="Ingen turneringer"
          titleTrail="matcher filter"
          sub="Justér periode/tour eller fjern filter. Default-visning er kommende 30 dager."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div
            className="hidden border-b border-border bg-muted/40 px-6 py-4 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:grid"
            style={{
              gridTemplateColumns: "44px 110px 1fr 180px 110px 110px 140px",
              gap: "16px",
            }}
          >
            <div />
            <div>Dato</div>
            <div>Turnering</div>
            <div>Krets / Bane</div>
            <div>Påmeldte</div>
            <div>Viktighet</div>
            <div className="text-right">Handling</div>
          </div>
          <ul>
            {filtered.map((t) => {
              const meta = parseMeta(t.notes);
              const tour = meta?.tour?.toLowerCase();
              const krets = meta?.krets;
              const entries = entryMap.get(t.id) ?? [];
              const past = t.startDate < idag;
              return (
                <li key={t.id} className="border-b border-border/60 last:border-0">
                  <div
                    className="grid grid-cols-1 items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-muted/30 sm:grid-cols-[44px_110px_1fr_180px_110px_110px_140px]"
                  >
                    <TourBadge tour={tour} />
                    <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                      {formatDateRange(t.startDate, t.endDate)}
                    </span>
                    <Link
                      href={`/admin/tournaments/${t.id}`}
                      className="block min-w-0"
                    >
                      <div className="truncate font-medium text-foreground hover:text-primary">
                        {t.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tour ? TOUR_LABEL[tour] ?? tour : t.format}
                      </div>
                    </Link>
                    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      {krets ? (
                        <>
                          <MapPin size={11} strokeWidth={1.75} /> {krets}
                        </>
                      ) : t.course?.name ? (
                        <>
                          <MapPin size={11} strokeWidth={1.75} /> {t.course.name}
                        </>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-foreground">
                      <Users size={11} strokeWidth={1.75} className="text-muted-foreground" />
                      {entries.length}
                      <span className="text-muted-foreground">
                        {entries.length === 1 ? "påm." : "påm."}
                      </span>
                    </div>
                    <Stars n={tour === "olyo" || tour === "garmin" ? 4 : 3} />
                    <div className="flex items-center justify-end gap-2">
                      {past ? (
                        <Link
                          href={`/admin/tournaments/${t.id}`}
                          className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
                        >
                          Resultater →
                        </Link>
                      ) : (
                        <TournamentEnrollModal
                          tournamentId={t.id}
                          tournamentName={t.name}
                          tournamentDate={formatDateRange(t.startDate, t.endDate)}
                          players={playerData}
                          existing={entries}
                        />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function byggHref(sp: Search, override: Partial<Search>): string {
  const merged = { ...sp, ...override };
  const params = new URLSearchParams();
  if (merged.tour) params.set("tour", merged.tour);
  if (merged.krets) params.set("krets", merged.krets);
  if (merged.periode) params.set("periode", merged.periode);
  if (merged.q) params.set("q", merged.q);
  const qs = params.toString();
  return qs ? `/admin/tournaments?${qs}` : "/admin/tournaments";
}

function PeriodePills({ aktiv }: { aktiv: Periode }) {
  const valg: { key: Periode; label: string }[] = [
    { key: "30", label: "Neste 30 d" },
    { key: "90", label: "Neste 90 d" },
    { key: "2026", label: "Hele 2026" },
    { key: "tidligere", label: "Tidligere" },
    { key: "alle", label: "Alle" },
  ];
  return (
    <div className="inline-flex gap-0.5 rounded-md border border-border bg-card p-1">
      {valg.map((v) => (
        <label
          key={v.key}
          className={`inline-flex cursor-pointer items-center rounded-sm px-3 py-1.5 text-xs font-medium ${
            aktiv === v.key
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <input
            type="radio"
            name="periode"
            value={v.key}
            defaultChecked={aktiv === v.key}
            className="sr-only"
          />
          {v.label}
        </label>
      ))}
    </div>
  );
}

function TourPill({
  href,
  aktiv,
  children,
}: {
  href: string;
  aktiv: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
        aktiv
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

function TourBadge({ tour }: { tour: string | undefined }) {
  if (!tour) {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-md bg-secondary font-mono text-[11px] font-semibold text-muted-foreground">
        ·
      </span>
    );
  }
  const tone = TOUR_TONE[tour] ?? "bg-secondary text-foreground";
  return (
    <span
      title={TOUR_LABEL[tour] ?? tour}
      className={`grid h-8 w-8 place-items-center rounded-md font-mono text-[11px] font-semibold ${tone}`}
    >
      {TOUR_LETTER[tour] ?? "?"}
    </span>
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
