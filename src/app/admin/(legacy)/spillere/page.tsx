/**
 * AgencyOS — Alle spillere (/admin/spillere).
 *
 * Port av fasit `agencyos-app/screens-stable.jsx` → PlayersScreen (mørkt tema,
 * desktop 1280). Server component: henter ekte Prisma-data (User m/ grupper,
 * HCP, SG-serie, bookinger for siste/neste økt, plan-økter for «bak skjema»)
 * og mapper til ferdig formaterte rader for klient-tabellen.
 *
 * Status-heuristikk (enkel, kun fra ekte data):
 *   - «N økter bak» (alert): planlagte plan-økter denne uka som er passert
 *     uten å være gjennomført.
 *   - «N dg inaktiv» (warn): ≥5 dager siden siste aktivitet (innlogging
 *     eller booking). Uten aktivitetsdata: «Inaktiv».
 *   - Ellers «På plan» (ok). Felter uten kilde viser «—» — aldri liksom-tall.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { SpillereTabell, type SpillerRad } from "./spillere-tabell";

export const dynamic = "force-dynamic";

const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const DOW = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtHcp(v: number | null): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

function fmtSgDelta(v: number): string {
  const abs = Math.abs(v).toFixed(2).replace(".", ",");
  return v < 0 ? `−${abs}` : `+${abs}`;
}

function hhmm(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

/** «I dag 09:00» / «I går» / «2 dg siden» / «23. mai» / «—». */
function sisteLabel(d: Date | null, now: Date): string {
  if (!d) return "—";
  if (d.toDateString() === now.toDateString()) return `I dag ${hhmm(d)}`;
  const iGaar = new Date(now);
  iGaar.setDate(iGaar.getDate() - 1);
  if (d.toDateString() === iGaar.toDateString()) return "I går";
  const dg = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (dg < 7) return `${dg} dg siden`;
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}

/** «I dag 11:00» / «Tor 10:00» / «12. jun 10:00» / «Ingen». */
function nesteLabel(d: Date | null, now: Date): string {
  if (!d) return "Ingen";
  if (d.toDateString() === now.toDateString()) return `I dag ${hhmm(d)}`;
  if (d.getTime() - now.getTime() < 7 * 86_400_000) return `${DOW[d.getDay()]} ${hhmm(d)}`;
  return `${d.getDate()}. ${MND[d.getMonth()]} ${hhmm(d)}`;
}

function bucketOf(groupNames: string[]): { bucket: SpillerRad["bucket"]; label: string } {
  for (const n of groupNames) {
    const l = n.toLowerCase();
    if (l.includes("wang")) return { bucket: "WANG", label: "WANG" };
    if (l.includes("gfgk")) return { bucket: "GFGK", label: "GFGK" };
    if (l.includes("junior")) return { bucket: "Junior", label: "Junior" };
  }
  return { bucket: null, label: groupNames[0] ?? "—" };
}

function statusAv(
  behind: number,
  sisteAktivitet: Date | null,
  now: Date,
): { status: SpillerRad["status"]; lbl: string } {
  if (behind >= 1) {
    return { status: "alert", lbl: `${behind} ${behind === 1 ? "økt" : "økter"} bak` };
  }
  if (!sisteAktivitet) return { status: "warn", lbl: "Inaktiv" };
  const dg = Math.floor((now.getTime() - sisteAktivitet.getTime()) / 86_400_000);
  if (dg >= 5) return { status: "alert", lbl: `${dg} dg inaktiv` };
  return { status: "ok", lbl: "På plan" };
}

export default async function SpillerePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const now = new Date();
  const ukeStart = new Date(now);
  ukeStart.setHours(0, 0, 0, 0);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));

  const [players, nesteBookinger, sisteBookinger] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER", deletedAt: null },
      select: {
        id: true,
        name: true,
        hcp: true,
        lastLoginAt: true,
        groupMemberships: {
          select: { group: { select: { name: true } } },
          orderBy: { joinedAt: "asc" },
        },
        // SG-serie: foretrekk BrukerSgInput, fall tilbake på Round (som loadStallen).
        sgInputs: {
          where: { sgTotal: { not: null } },
          select: { sgTotal: true },
          orderBy: { dato: "desc" },
          take: 6,
        },
        rounds: {
          where: { sgTotal: { not: null } },
          select: { sgTotal: true },
          orderBy: { playedAt: "desc" },
          take: 6,
        },
        // Plan-økter denne uka som er passert — grunnlag for «N økter bak».
        trainingPlans: {
          select: {
            sessions: {
              where: { scheduledAt: { gte: ukeStart, lt: now } },
              select: { status: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
      take: 400,
    }),
    prisma.booking.groupBy({
      by: ["userId"],
      where: {
        userId: { not: null },
        startAt: { gte: now },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      _min: { startAt: true },
    }),
    prisma.booking.groupBy({
      by: ["userId"],
      where: {
        userId: { not: null },
        startAt: { lt: now },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      _max: { startAt: true },
    }),
  ]);

  const nesteAv = new Map<string, Date>();
  for (const b of nesteBookinger) {
    if (b.userId && b._min.startAt) nesteAv.set(b.userId, b._min.startAt);
  }
  const sisteAv = new Map<string, Date>();
  for (const b of sisteBookinger) {
    if (b.userId && b._max.startAt) sisteAv.set(b.userId, b._max.startAt);
  }

  const interne = players.map((p) => {
    const groupNames = p.groupMemberships.map((m) => m.group.name);
    const { bucket, label } = bucketOf(groupNames);

    // SG-serie eldst → nyest; delta = nyeste − eldste.
    const serieKilde =
      p.sgInputs.length >= 2
        ? p.sgInputs.map((s) => s.sgTotal as number)
        : p.rounds.map((r) => r.sgTotal as number);
    const sg = [...serieKilde].reverse();
    const sgDelta = sg.length >= 2 ? sg[sg.length - 1] - sg[0] : null;

    // Siste aktivitet = nyeste av innlogging og siste booking.
    const sisteBooking = sisteAv.get(p.id) ?? null;
    const kandidater = [p.lastLoginAt, sisteBooking].filter((d): d is Date => d != null);
    const sisteAktivitet =
      kandidater.length > 0
        ? kandidater.reduce((a, b) => (a.getTime() > b.getTime() ? a : b))
        : null;

    const behind = p.trainingPlans
      .flatMap((tp) => tp.sessions)
      .filter((s) => s.status === "PLANNED").length;
    const { status, lbl } = statusAv(behind, sisteAktivitet, now);

    const nesteAt = nesteAv.get(p.id) ?? null;

    return {
      rad: {
        id: p.id,
        name: p.name,
        initials: initialsOf(p.name),
        groupLabel: label,
        bucket,
        hcp: fmtHcp(p.hcp),
        sg,
        sgVal: sgDelta != null ? fmtSgDelta(sgDelta) : "—",
        sgDir: (sgDelta != null ? (sgDelta < 0 ? "down" : "up") : null) as SpillerRad["sgDir"],
        last: sisteLabel(sisteAktivitet, now),
        status,
        statusLbl: lbl,
        next: nesteLabel(nesteAt, now),
      } satisfies SpillerRad,
      nesteAt,
    };
  });

  // «Sortert på hastighet»: de som trenger deg øverst, deretter nærmeste økt.
  const rang: Record<SpillerRad["status"], number> = { alert: 0, warn: 1, ok: 2 };
  interne.sort(
    (a, b) =>
      rang[a.rad.status] - rang[b.rad.status] ||
      (a.nesteAt?.getTime() ?? Infinity) - (b.nesteAt?.getTime() ?? Infinity) ||
      a.rad.name.localeCompare(b.rad.name, "nb"),
  );

  const rows = interne.map((i) => i.rad);
  const trengerDeg = rows.filter((r) => r.status !== "ok").length;

  return <SpillereTabell rows={rows} trengerDeg={trengerDeg} />;
}
