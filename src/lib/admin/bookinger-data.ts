/**
 * Data-loader for AgencyOS booking-oversikt (/admin/bookinger).
 * Henter ekte Prisma-data og mapper til BookingerViewProps.
 *
 * Pixel-port av [historisk fasit, fjernet 2026-07-03] agencyos/components-agency-bookings.html.
 * Credit-cellen utledes fra booking.subscription (monthlyCredits = nevner,
 * creditsRemaining = teller). Coach fra booking.coach-relasjonen. Type-pille
 * klassifiseres best-effort fra serviceType.name. Ingen oppdiktede tall — der
 * data mangler vises "Pay"/"Inkl."/"Tildel coach" i stedet.
 */

import { prisma } from "@/lib/prisma";
import type {
  BookingRow,
  BookingStat,
  BookingerViewProps,
  CoachOption,
  PlayerOption,
  ServiceTypeOption,
  StatusKey,
  TypeKind,
} from "@/components/admin/bookinger/bookinger-view";

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "Øyvind Rohjan" → "Øyvind R." (tabell-tett visning). */
function shortName(name: string | null | undefined): string {
  if (!name) return "Gjest";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const rest = parts
    .slice(1)
    .map((p) => `${p[0].toUpperCase()}.`)
    .join("");
  return `${parts[0]} ${rest}`;
}

function coachShort(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/** Best-effort klassifisering av tjeneste til type-pille (ikon + tone). */
function typeFromService(name: string | null | undefined): { kind: TypeKind; label: string } {
  const t = (name ?? "").toLowerCase();
  if (/(trackman|track man|radar|launch)/.test(t)) return { kind: "tm", label: "TrackMan" };
  if (/(gruppe|junior|klasse|fellestrening|fellestime)/.test(t)) return { kind: "gruppe", label: "Gruppe" };
  if (/(bane|spill|hull|runde|9-hull|18-hull|on-course)/.test(t)) return { kind: "bane", label: "Bane / Spill" };
  if (/(test|screening|kartlegging|måling|maling)/.test(t)) return { kind: "tm", label: "Test" };
  return { kind: "coach", label: "Coaching" };
}

const DAGER = ["SØN", "MAN", "TIR", "ONS", "TOR", "FRE", "LØR"];
const MND = [
  "jan", "feb", "mar", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "des",
];

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / 604_800_000);
}

export async function loadBookinger(): Promise<BookingerViewProps> {
  const now = new Date();
  const nowMs = now.getTime();

  // Vindu: 14 dager bak → 21 dager frem (uke-fokusert tabell + pagination).
  const fra = new Date(now);
  fra.setDate(fra.getDate() - 14);
  fra.setHours(0, 0, 0, 0);
  const til = new Date(now);
  til.setDate(til.getDate() + 21);
  til.setHours(23, 59, 59, 999);

  const [dbBookinger, coachRows, playerRows, serviceRows] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: fra, lt: til } },
      orderBy: { startAt: "asc" },
      include: {
        user: { select: { id: true, name: true } },
        coach: { select: { id: true, name: true } },
        serviceType: { select: { name: true, durationMin: true } },
        location: { select: { name: true } },
        facility: { select: { name: true } },
        subscription: { select: { monthlyCredits: true, creditsRemaining: true } },
      },
    }),
    // Coacher for filter-dropdown.
    prisma.user.findMany({
      where: { role: { in: ["COACH", "ADMIN"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    // Spillere for ny-booking autocomplete (med credit-saldo).
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: {
        id: true,
        name: true,
        homeClub: true,
        subscription: { select: { tier: true, monthlyCredits: true, creditsRemaining: true } },
      },
      orderBy: { name: "asc" },
      take: 200,
    }),
    // Tjenestetyper for ny-booking type/varighet-dropdown.
    prisma.serviceType.findMany({
      where: { active: true },
      select: { id: true, name: true, durationMin: true, priceOre: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const rows: BookingRow[] = dbBookinger.map((b) => {
    const startMs = b.startAt.getTime();
    const endMs = b.endAt.getTime();
    const durMin = Math.max(1, Math.round((endMs - startMs) / 60_000));
    const { kind, label } = typeFromService(b.serviceType?.name);

    let status: StatusKey;
    if (b.status === "CANCELLED") status = "avbestilt";
    else if (b.status === "COMPLETED" || endMs <= nowMs) status = "fullf";
    else if (startMs <= nowMs && endMs > nowMs) status = "pagaar";
    else if (b.status === "CONFIRMED") status = "bekreftet";
    else status = "uten"; // PENDING → avventer/uten coach

    // Credit-celle: nevner = pakke-størrelse, teller = saldo.
    // Tre varianter: credit (subscription), inkl. (gruppe/priceOre 0), pay.
    let credit: BookingRow["credit"];
    if (b.subscription && b.subscription.monthlyCredits > 0) {
      const total = b.subscription.monthlyCredits;
      const remaining = Math.max(0, b.subscription.creditsRemaining);
      const tone: BookingRow["credit"]["tone"] =
        remaining === 0 ? "danger" : remaining === 1 ? "warn" : "ok";
      credit = { mode: "credit", remaining, total, tone };
    } else if (kind === "gruppe") {
      credit = { mode: "inkl", tone: "ok" };
    } else {
      credit = { mode: "pay", tone: "danger" };
    }

    const sted = [b.location?.name, b.facility?.name].filter(Boolean).join(" · ") || "—";
    const ws = startOfWeek(b.startAt);

    return {
      id: b.id,
      startMs,
      dayKey: `${b.startAt.getFullYear()}-${b.startAt.getMonth()}-${b.startAt.getDate()}`,
      dayLabel: `${DAGER[b.startAt.getDay()]} ${b.startAt.getDate()} ${MND[b.startAt.getMonth()].toUpperCase()}`,
      isToday: b.startAt.toDateString() === now.toDateString(),
      weekStartMs: ws.getTime(),
      weekNo: isoWeek(b.startAt),
      dow: DAGER[b.startAt.getDay()],
      dateShort: `${b.startAt.getDate()}/${b.startAt.getMonth() + 1}`,
      time: hhmm(b.startAt),
      durMin,
      playerName: shortName(b.user?.name ?? b.guestName),
      playerInitials: initials(b.user?.name ?? b.guestName),
      playerSub: [(b.user?.name ? clubFromHomeClub(playerRows, b.user.id) : null), label.toUpperCase()]
        .filter(Boolean)
        .join(" · "),
      coachName: b.coach ? coachShort(b.coach.name) : null,
      coachInitials: b.coach ? initials(b.coach.name) : null,
      coachId: b.coach?.id ?? null,
      type: { kind, label },
      credit,
      location: sted,
      status,
    };
  });

  // Stats for tittel-rad: i dag · pågår · uten coach (inneværende uke-vindu).
  const idagStart = new Date(now);
  idagStart.setHours(0, 0, 0, 0);
  const idagSlutt = new Date(idagStart);
  idagSlutt.setDate(idagSlutt.getDate() + 1);

  const iDag = rows.filter(
    (r) => r.startMs >= idagStart.getTime() && r.startMs < idagSlutt.getTime(),
  ).length;
  const paagaar = rows.filter((r) => r.status === "pagaar").length;
  const utenCoach = rows.filter((r) => r.coachId == null && r.status !== "avbestilt" && r.status !== "fullf").length;

  const denneUkeStart = startOfWeek(now).getTime();
  const denneUkeNo = isoWeek(now);

  const stats: BookingStat[] = [
    { label: "i dag", value: iDag },
    { label: "pågår", value: paagaar },
    { label: "uten coach", value: utenCoach },
  ];

  const coachOptions: CoachOption[] = coachRows.map((c) => ({
    id: c.id,
    name: coachShort(c.name),
    initials: initials(c.name),
  }));

  const playerOptions: PlayerOption[] = playerRows.map((p) => {
    const sub = p.subscription;
    const hasCredits = sub && sub.monthlyCredits > 0;
    return {
      id: p.id,
      name: shortName(p.name),
      initials: initials(p.name),
      sub: [p.homeClub, sub?.tier && sub.tier !== "GRATIS" ? sub.tier : null]
        .filter(Boolean)
        .join(" · ")
        .toUpperCase(),
      creditsRemaining: hasCredits ? sub!.creditsRemaining : null,
      creditsTotal: hasCredits ? sub!.monthlyCredits : null,
    };
  });

  const serviceOptions: ServiceTypeOption[] = serviceRows.map((s) => ({
    id: s.id,
    name: s.name,
    durationMin: s.durationMin,
    priceOre: s.priceOre,
  }));

  return {
    rows,
    stats,
    coachOptions,
    playerOptions,
    serviceOptions,
    nowMs,
    currentWeekNo: denneUkeNo,
    currentWeekStartMs: denneUkeStart,
  };
}

/** Slå opp homeClub fra player-listen (kun for bookinger med kjent userId). */
function clubFromHomeClub(
  players: { id: string; homeClub: string | null }[],
  userId: string,
): string | null {
  return players.find((p) => p.id === userId)?.homeClub ?? null;
}
