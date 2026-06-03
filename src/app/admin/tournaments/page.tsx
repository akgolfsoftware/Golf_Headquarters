/**
 * AgencyOS Turneringer (/admin/tournaments) — v10-design.
 *
 * Rendrer <Turneringer> (v10-fasit fra agencyos-preview) med EKTE data fra Prisma.
 * Uke/Måned/År-visning, auto-populert «Denne helgen» + kommende, og
 * «Send fellesmelding»-modal per turnering. Tom-tilstand når data mangler —
 * aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser({ allow: ["COACH","ADMIN"] }).
 * AdminShell (layout) eier sidebar/topbar — denne siden rendrer kun innholdet.
 *
 * Port (3. juni): byttet fra gammel filter-tabell-visning til v10 <Turneringer>.
 * mapTurneringer oversetter Prisma-radene til TurneringerData-shapen.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  Turneringer,
  type Tournament,
  type TurneringerData,
} from "@/components/admin/turneringer/turneringer";

export const dynamic = "force-dynamic";

type Meta = { tour?: string };

const TOUR_LABEL: Record<string, string> = {
  olyo: "Olyo Juniortour",
  srixon: "Srixon Tour",
  ostlandstour: "Titleist Østlandstour",
  garmin: "Garmin Norges Cup",
};

function parseTour(notes: string | null): string | undefined {
  if (!notes) return undefined;
  try {
    const m = JSON.parse(notes) as Meta;
    if (m && typeof m === "object" && typeof m.tour === "string") return m.tour;
  } catch {
    // ignore
  }
  return undefined;
}

function formatDateRange(start: Date, end: Date | null): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  if (!end || start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("nb-NO", opts);
  }
  const endStr = end.toLocaleDateString("nb-NO", opts);
  return `${start.getDate()} – ${endStr}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Mandag i samme ISO-uke som `d` (lokal tid, 00:00). */
function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = (x.getDay() + 6) % 7; // 0 = mandag
  x.setDate(x.getDate() - day);
  return x;
}

type TournamentRow = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  notes: string | null;
  format: string;
  course: { name: string } | null;
};

type EntryRow = {
  tournamentId: string | null;
  user: { name: string | null };
};

/** Oversetter Prisma-rader → v10 TurneringerData. Tom-tilstander bevares ([]). */
function mapTurneringer(
  rows: TournamentRow[],
  entries: EntryRow[],
): TurneringerData {
  const participantsByTournament = new Map<
    string,
    { id: string; initials: string; name: string }[]
  >();
  for (const e of entries) {
    if (!e.tournamentId) continue;
    const name = e.user.name ?? "(uten navn)";
    const liste = participantsByTournament.get(e.tournamentId) ?? [];
    liste.push({
      id: `${e.tournamentId}-${liste.length}`,
      initials: initials(name),
      name,
    });
    participantsByTournament.set(e.tournamentId, liste);
  }

  const toTournament = (t: TournamentRow): Tournament => {
    const tour = parseTour(t.notes);
    return {
      id: t.id,
      name: t.name,
      venue: t.course?.name ?? t.format,
      dates: formatDateRange(t.startDate, t.endDate),
      startISO: t.startDate.toISOString().slice(0, 10),
      category: tour ? (TOUR_LABEL[tour] ?? tour).toUpperCase() : undefined,
      href: `/admin/tournaments/${t.id}`,
      participants: participantsByTournament.get(t.id) ?? [],
    };
  };

  const weekStart = startOfWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7); // mandag neste uke

  const thisWeekend: Tournament[] = [];
  const upcoming: Tournament[] = [];

  for (const t of rows) {
    if (t.startDate >= weekStart && t.startDate < weekEnd) {
      thisWeekend.push(toTournament(t));
    } else if (t.startDate >= weekEnd) {
      upcoming.push(toTournament(t));
    }
  }

  return {
    thisWeekend,
    upcoming,
    newHref: "/admin/tournaments/ny",
  };
}

export default async function AdminTurneringerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const weekStart = startOfWeek(new Date());

  const [rows, entries] = await Promise.all([
    prisma.tournament.findMany({
      where: { mergedIntoId: null, startDate: { gte: weekStart } },
      include: { course: { select: { name: true } } },
      orderBy: { startDate: "asc" },
    }),
    prisma.tournamentEntry.findMany({
      where: { tournamentId: { not: null } },
      select: {
        tournamentId: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  const data = mapTurneringer(rows, entries);

  return <Turneringer data={data} />;
}
