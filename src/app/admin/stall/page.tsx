/**
 * /admin/stall — AgencyOS Stall (hybrid terminal design)
 *
 * Spiller-roster-tabell (venstre) + 360°-panel (høyre).
 * Ekte Prisma-data: bruker, SG-serie, siste aktivitet, pyramide-score.
 * Basert på port av "AgencyOS Stall (hybrid).dc.html".
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import { erOktGjennomfort } from "@/lib/workbench/compliance";
import { StallClient, type StallSpiller } from "./stall-client";

export const dynamic = "force-dynamic";

const MND = [
  "jan", "feb", "mar", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "des",
];

/** Pyramide-aksene i uendret visningsrekkefølge (matcher tidligere array). */
const PYR_ORDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

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

function fmtSg(v: number | null): string {
  if (v == null) return "—";
  const abs = Math.abs(v).toFixed(2).replace(".", ",");
  return v < 0 ? `−${abs}` : `+${abs}`;
}

function sisteLabel(d: Date | null, now: Date): string {
  if (!d) return "—";
  if (d.toDateString() === now.toDateString()) return "i dag";
  const iGaar = new Date(now);
  iGaar.setDate(iGaar.getDate() - 1);
  if (d.toDateString() === iGaar.toDateString()) return "i går";
  const dg = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (dg < 7) return `${dg} dg`;
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}

function toneOf(
  behind: number,
  sisteAktivitet: Date | null,
  now: Date,
): StallSpiller["tone"] {
  if (behind >= 1) return "down";
  if (!sisteAktivitet) return "warn";
  const dg = Math.floor((now.getTime() - sisteAktivitet.getTime()) / 86_400_000);
  if (dg >= 7) return "down";
  if (dg >= 3) return "warn";
  return "up";
}

function groupLabel(groupNames: string[]): string {
  if (groupNames.length === 0) return "—";
  const first = groupNames[0];
  // Kortform: WANG → «WANG», GFGK → «GFGK», junior → «Junior»
  for (const n of groupNames) {
    const l = n.toLowerCase();
    if (l.includes("wang")) return "WANG";
    if (l.includes("gfgk")) return "GFGK";
  }
  return first.length > 12 ? first.slice(0, 12) + "…" : first;
}

export default async function StallPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const now = new Date();
  const ukeStart = new Date(now);
  ukeStart.setHours(0, 0, 0, 0);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));

  const [players, sisteBookinger] = await Promise.all([
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
        sgInputs: {
          where: { sgTotal: { not: null } },
          select: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
          orderBy: { dato: "desc" },
          take: 6,
        },
        rounds: {
          where: { sgTotal: { not: null } },
          select: { sgTotal: true },
          orderBy: { playedAt: "desc" },
          take: 6,
        },
        trainingPlans: {
          select: {
            sessions: {
              where: { scheduledAt: { gte: ukeStart, lt: now } },
              select: { status: true, pyramidArea: true, durationMin: true },
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
        startAt: { lt: now },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      _max: { startAt: true },
    }),
  ]);

  const sisteAv = new Map<string, Date>();
  for (const b of sisteBookinger) {
    if (b.userId && b._max.startAt) sisteAv.set(b.userId, b._max.startAt);
  }

  const spillere: StallSpiller[] = players.map((p) => {
    const groupNames = p.groupMemberships.map((m) => m.group.name);
    const gl = groupLabel(groupNames);

    // SG: bruk sgInputs fremfor rounds
    const sgSerie =
      p.sgInputs.length >= 1
        ? p.sgInputs.map((s) => s.sgTotal as number)
        : p.rounds.map((r) => r.sgTotal as number);

    const sgVal = sgSerie.length > 0 ? sgSerie[0] : null;

    // Pyramide-balanse denne uka — ekte treningsvolum (minutter) per akse,
    // IKKE avledet fra SG (SG er prestasjon, pyramide er treningsfordeling —
    // to forskjellige akser som tidligere ble feilaktig blandet sammen).
    const ukeSessions = p.trainingPlans.flatMap((tp) => tp.sessions);
    const minByAxis = new Map<PyramidArea, number>();
    let totalPlannedMin = 0;
    let totalDoneMin = 0;
    for (const s of ukeSessions) {
      const dur = s.durationMin ?? 0;
      minByAxis.set(s.pyramidArea, (minByAxis.get(s.pyramidArea) ?? 0) + dur);
      totalPlannedMin += dur;
      if (erOktGjennomfort(s.status)) totalDoneMin += dur;
    }
    const pyr = PYR_ORDER.map((axis) => ({
      label: axis,
      pct: totalPlannedMin > 0 ? Math.round(((minByAxis.get(axis) ?? 0) / totalPlannedMin) * 100) : 0,
    }));

    const sisteBooking = sisteAv.get(p.id) ?? null;
    const kandidater = [p.lastLoginAt, sisteBooking].filter((d): d is Date => d != null);
    const sisteAktivitet =
      kandidater.length > 0
        ? kandidater.reduce((a, b) => (a.getTime() > b.getTime() ? a : b))
        : null;

    const behind = ukeSessions.filter((s) => s.status === "PLANNED").length;

    const tone = toneOf(behind, sisteAktivitet, now);

    return {
      id: p.id,
      name: p.name,
      initials: initialsOf(p.name),
      group: gl,
      hcp: fmtHcp(p.hcp),
      sg: fmtSg(sgVal),
      sgDir: sgVal != null ? (sgVal < 0 ? "down" : "up") : null,
      last: sisteLabel(sisteAktivitet, now),
      tone,
      pyr,
      adh: totalPlannedMin > 0 ? `${Math.round((totalDoneMin / totalPlannedMin) * 100)} %` : "—",
    };
  });

  return <StallClient spillere={spillere} />;
}
