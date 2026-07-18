/**
 * Data-loader for PlayerHQ · Tren · Turnering — detalj
 * (/portal/tren/turneringer/[id]).
 *
 * Henter ekte Prisma-data for én turnering + spillerens egen påmelding og
 * resultathistorikk. Porten av
 * [historisk fasit, fjernet 2026-07-03] playerhq/components-turnering-detalj.html — men
 * mobile-first og uten fabrikerte tall.
 *
 * Ærlig data-prinsipp (verifisert mot prod-DB):
 *  - `status`, `tour`, `location`, `course`, `winnerName`, `officialUrl` er
 *    ofte null. De rendres kun når de finnes.
 *  - `Tournament.notes` inneholder for synk-importerte rader en JSON-blob
 *    (externalId/tour/krets/categories) — IKKE brukernotater. Den leses derfor
 *    bevisst ALDRI som fritekst (jf. CLAUDE.md: JSON-blobs valideres, eller
 *    ignoreres). Spillerens egne notater ligger på TournamentEntry.notes.
 *  - Det finnes ingen felt for tee, forventet HCP-effekt eller starttid i
 *    schemaet → de tilhørende design-flisene utelates (aldri falske verdier).
 *  - Historikk = spillerens egne TournamentResult-rader. Tom liste = card
 *    utelates.
 */

import { prisma } from "@/lib/prisma";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import type { TournamentEntryStatus } from "@/generated/prisma/client";

/**
 * Norsk kalenderdag (YYYY-MM-DD, Europe/Oslo) for relevans-vinduet under.
 * ISO-strengene sorterer leksikalsk, så «i dag ∈ [start, slutt]» blir en
 * enkel streng-sammenligning uten DST-feller (jf. gotcha: Vercel kjører UTC).
 */
const OSLO_DAG_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const MND_LANG = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

const MND_KORT = [
  "jan",
  "feb",
  "mar",
  "apr",
  "mai",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "des",
];

/** "15. august 2026" */
function dateLong(d: Date): string {
  return `${d.getDate()}. ${MND_LANG[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Kompakt dato-rekkevidde for banner, uten år når det er åpenbart fra
 * konteksten. "15. AUG" eller "23.–25. AUG" (samme måned) eller
 * "30. MAI – 1. JUN" (kryss av måned).
 */
function dateRangeCompact(start: Date, end: Date | null): string {
  const s = `${start.getDate()}. ${MND_KORT[start.getMonth()].toUpperCase()}`;
  if (!end || end.toDateString() === start.toDateString()) return s;
  if (end.getMonth() === start.getMonth()) {
    return `${start.getDate()}.–${end.getDate()}. ${MND_KORT[start.getMonth()].toUpperCase()}`;
  }
  const e = `${end.getDate()}. ${MND_KORT[end.getMonth()].toUpperCase()}`;
  return `${s} – ${e}`;
}

/** Lang dato-rekkevidde for header-meta. */
function dateRangeLong(start: Date, end: Date | null): string {
  if (!end || end.toDateString() === start.toDateString()) return dateLong(start);
  return `${dateLong(start)} – ${dateLong(end)}`;
}

/** Avledet turneringsstatus — kun når Tournament.status faktisk er satt. */
export type TurneringStatus = {
  label: string;
  tone: "upcoming" | "live" | "done" | "cancelled";
} | null;

function tournamentStatus(status: string | null): TurneringStatus {
  switch (status) {
    case "UPCOMING":
      return { label: "Kommende", tone: "upcoming" };
    case "IN_PROGRESS":
      return { label: "Pågår", tone: "live" };
    case "COMPLETED":
      return { label: "Fullført", tone: "done" };
    case "CANCELLED":
      return { label: "Avlyst", tone: "cancelled" };
    default:
      return null;
  }
}

/** Spillerens påmeldingsstatus → norsk label + tone for badge. */
export type EntryState = {
  label: string;
  tone: "ok" | "neutral" | "warn" | "urgent";
  /** Aktiv = spilleren er meldt på / bekreftet (gir Avmeld-CTA). */
  active: boolean;
};

function entryState(status: TournamentEntryStatus): EntryState {
  switch (status) {
    case "CONFIRMED":
      return { label: "Påmeldt", tone: "ok", active: true };
    case "PLANNED":
      return { label: "Planlagt", tone: "neutral", active: true };
    case "COMPLETED":
      return { label: "Gjennomført", tone: "neutral", active: false };
    case "WITHDRAWN":
      return { label: "Avmeldt", tone: "urgent", active: false };
    case "DNF":
      return { label: "Brøt", tone: "warn", active: false };
    default:
      return { label: status, tone: "neutral", active: false };
  }
}

export type HistoricResult = {
  id: string;
  /** Årstall fra turneringens startdato. */
  year: number;
  /** Plassering hvis registrert. */
  position: number | null;
  /** Score (slag eller +/- relativt) hvis registrert. */
  score: number | null;
};

export type TurneringDetalj = {
  id: string;
  name: string;
  /** Lang dato-rekkevidde for header-meta, f.eks "15. august 2026". */
  dateLong: string;
  /** Kompakt for banner, f.eks "15. AUG". */
  dateCompact: string;
  /** Banenavn (course.name → location → null). */
  venue: string | null;
  /** Format-label hvis ikke default-STROKE, ellers null. */
  format: string | null;
  tour: string | null;
  status: TurneringStatus;
  officialUrl: string | null;
  /** Spillerens påmelding (null = ikke påmeldt). */
  entry: {
    state: EntryState;
    /** Klasse/kategori hvis satt (TournamentEntry.category). */
    category: string | null;
    /** Spillerens egne notater (TournamentEntry.notes — fritekst, trygt). */
    notes: string | null;
    /** Påmeldt-dato. */
    registeredLong: string;
  } | null;
  /** Spillerens tidligere resultater (tom = card utelates). */
  history: HistoricResult[];
  /**
   * Turneringens dato-vindu er nå/aktivt (i dag ∈ [start, slutt] eller
   * status IN_PROGRESS) → «Start turneringsrunde» kan tilbys en påmeldt spiller.
   */
  erRelevantNa: boolean;
  /**
   * Bane for en ny turneringsrunde: turneringens egen bane, ellers spillerens
   * sist spilte bane. null = ingen ærlig bane → «start»-CTA vises ikke
   * (spilleren loggfører i stedet en runde manuelt og velger bane der).
   */
  rundeBaneId: string | null;
  /**
   * Spillerens turneringsrunde for denne påmeldingen, hvis den finnes.
   * Defensiv lesing: kolonnen rounds."tournamentEntryId" finnes kanskje ikke i
   * preview-DB → tolkes som «ingen runde» (null), aldri en feil.
   */
  liveRunde: {
    id: string;
    /** Har ført scorekort (HoleScore-rader) — ellers «pågår / ikke ført ennå». */
    fort: boolean;
    /** Brutto totalscore så langt (0 før scorekortet er ført). */
    score: number;
    /** Antall førte hull. */
    hullAntall: number;
  } | null;
};

/**
 * Laster detalj-data for én turnering for én spiller. Returnerer null hvis
 * turneringen ikke finnes (kalleren håndterer notFound/EmptyState).
 */
export async function loadTurneringDetalj(
  userId: string,
  tournamentId: string,
): Promise<TurneringDetalj | null> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      location: true,
      courseId: true,
      format: true,
      tour: true,
      status: true,
      officialUrl: true,
      course: { select: { name: true } },
      entries: {
        where: { userId },
        take: 1,
        select: {
          id: true,
          entryStatus: true,
          category: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!tournament) return null;

  // Historikk: spillerens egne resultater. I praksis tomt i dag (0 rader),
  // men strukturen er ekte og fylles automatisk når resultater registreres.
  const results = await prisma.tournamentResult.findMany({
    where: { userId, tournamentId },
    select: {
      id: true,
      position: true,
      score: true,
      tournament: { select: { startDate: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const entryRow = tournament.entries[0] ?? null;

  // Relevans-vindu: IN_PROGRESS, eller i dag ∈ [startDate, endDate] (norsk
  // kalenderdag). Uten endDate teller kun selve startdagen.
  const iDag = OSLO_DAG_FMT.format(new Date());
  const startDag = OSLO_DAG_FMT.format(tournament.startDate);
  const sluttDag = tournament.endDate
    ? OSLO_DAG_FMT.format(tournament.endDate)
    : startDag;
  const erRelevantNa =
    tournament.status === "IN_PROGRESS" || (iDag >= startDag && iDag <= sluttDag);

  // Bane for en ny turneringsrunde: turneringens egen bane → sist spilte.
  const rundeBaneId =
    tournament.courseId ?? (entryRow ? await sisteSpilteBaneId(userId) : null);

  // Eksisterende turneringsrunde for påmeldingen — defensiv (kolonnen finnes
  // kanskje ikke i preview-DB; da tolkes det som ingen runde).
  let liveRunde: TurneringDetalj["liveRunde"] = null;
  if (entryRow) {
    try {
      const runde = await prisma.round.findFirst({
        where: { tournamentEntryId: entryRow.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, score: true, _count: { select: { holeScores: true } } },
      });
      if (runde) {
        liveRunde = {
          id: runde.id,
          fort: runde._count.holeScores > 0,
          score: runde.score,
          hullAntall: runde._count.holeScores,
        };
      }
    } catch {
      liveRunde = null;
    }
  }

  return {
    id: tournament.id,
    name: tournament.name,
    dateLong: dateRangeLong(tournament.startDate, tournament.endDate),
    dateCompact: dateRangeCompact(tournament.startDate, tournament.endDate),
    venue: tournament.course?.name ?? tournament.location ?? null,
    // STROKE er default → vis kun avvikende format som meta-chip.
    format:
      tournament.format && tournament.format !== "STROKE"
        ? tournament.format
        : null,
    tour: tournament.tour,
    status: tournamentStatus(tournament.status),
    officialUrl: tournament.officialUrl,
    entry: entryRow
      ? {
          state: entryState(entryRow.entryStatus),
          category: entryRow.category,
          notes: entryRow.notes,
          registeredLong: dateLong(entryRow.createdAt),
        }
      : null,
    history: results.map((r) => ({
      id: r.id,
      year: r.tournament.startDate.getFullYear(),
      position: r.position,
      score: r.score,
    })),
    erRelevantNa,
    rundeBaneId,
    liveRunde,
  };
}
