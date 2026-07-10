/**
 * v2-forhåndsvisning — AgencyOS Økter (ukas treningsøkter, retning C). Egen
 * top-level route-group (v2preview) som IKKE arver AdminShell — kun root-layout
 * — så V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/okter-flaten 1:1: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme TrainingPlanSession-spørring
 * for inneværende uke. Mapper til AdminOkterData (ærlige tomrom, ingen
 * fabrikerte tall). Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateByArea } from "@/lib/pyramide";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminOkterV2,
  type AdminOkterData,
  type OkterOkt,
  type OkterDag,
  type StatusKat,
} from "@/components/admin/v2/AdminOkterV2";
import type { AkseKey } from "@/lib/v2/tokens";
import type { SessionStatus, PyramidArea } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const NORSK_UKEDAG_LANG = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
];

// Klarspråk-status per SessionStatus (aldri sperre-språk).
const STATUS_LABEL: Record<SessionStatus, string> = {
  PLANNED: "Planlagt",
  ACTIVE: "Aktiv",
  PAUSED: "Pauset",
  COMPLETED: "Gjennomført",
  ABANDONED: "Avbrutt",
  SKIPPED: "Hoppet over",
  CANCELLED: "Kansellert",
};

// Rekkefølge for pyramiden: øverst = topp (TURN) → bunn (FYS).
const PYR_TOPP_NED: PyramidArea[] = ["TURN", "SPILL", "SLAG", "TEK", "FYS"];

/** Mandag 00:00 → søndag 23:59 for en gitt dato (norsk ukestart). */
function ukeRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const dag = start.getDay();
  const diff = dag === 0 ? -6 : 1 - dag;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** ISO-ukenummer (1–53). */
function isoWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}
function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

/** Utleder filterkategori uten å fabrikere status. */
function katOf(status: SessionStatus, erForfalt: boolean): StatusKat {
  if (status === "ACTIVE") return "Live";
  if (erForfalt) return "Forfalt";
  if (status === "COMPLETED") return "Gjennomført";
  if (status === "CANCELLED" || status === "SKIPPED" || status === "ABANDONED")
    return "Kansellert";
  return "Planlagt"; // PLANNED (fremtidig) + PAUSED
}

export default async function V2AdminOkterPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const now = new Date();
  const { start, end } = ukeRange(now);
  const ukenr = isoWeek(now);

  const sessions = await prisma.trainingPlanSession.findMany({
    where: { scheduledAt: { gte: start, lte: end } },
    orderBy: { scheduledAt: "asc" },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  // ── KPI-tall (identisk avledning som den ekte skjermen) ─────────
  const total = sessions.length;
  const gjennomfort = sessions.filter((s) => s.status === "COMPLETED").length;
  const planlagt = sessions.filter((s) => s.status === "PLANNED").length;
  const kansellert = sessions.filter(
    (s) => s.status === "CANCELLED" || s.status === "SKIPPED",
  ).length;
  const forfalt = sessions.filter(
    (s) => s.status === "PLANNED" && new Date(s.scheduledAt) < now,
  ).length;
  const liveNa = sessions.filter((s) => s.status === "ACTIVE").length;

  // ── Snitt-pyramide for uka (timer per akse, øverst = topp) ──────
  const agg = aggregateByArea(
    sessions.map((s) => ({
      pyramidArea: s.pyramidArea,
      durationMin: s.durationMin,
    })),
  );
  const pyramide = PYR_TOPP_NED.map((a) => ({
    akse: a as AkseKey,
    timer: Math.round((agg[a] / 60) * 10) / 10,
  })).filter((p) => p.timer > 0);

  // ── Grupper økter per ukedag (mandag→søndag) ───────────────────
  const perDag = new Map<number, OkterOkt[]>();
  for (const s of sessions) {
    const tidStart = new Date(s.scheduledAt);
    const wd = tidStart.getDay();
    const erForfalt = s.status === "PLANNED" && tidStart < now;
    const naa = s.status === "ACTIVE";
    const okt: OkterOkt = {
      id: s.id,
      tittel: s.title,
      akse: s.pyramidArea as AkseKey,
      spillerNavn: s.plan.user.name ?? "Ukjent spiller",
      planNavn: s.plan.name,
      planId: s.plan.id,
      tid: formatTid(tidStart),
      durationMin: s.durationMin,
      erForfalt,
      naa,
      statusLabel: erForfalt ? "Forfalt" : STATUS_LABEL[s.status],
      kat: katOf(s.status, erForfalt),
    };
    if (!perDag.has(wd)) perDag.set(wd, []);
    perDag.get(wd)!.push(okt);
  }

  const dager: OkterDag[] = [1, 2, 3, 4, 5, 6, 0]
    .filter((wd) => (perDag.get(wd)?.length ?? 0) > 0)
    .map((wd) => ({
      wd,
      label: NORSK_UKEDAG_LANG[wd],
      okter: perDag.get(wd)!,
    }));

  const data: AdminOkterData = {
    ukenr,
    periodeLabel: `${formatDato(start)} – ${formatDato(end)}`,
    kpi: { total, gjennomfort, planlagt, forfalt, kansellert, liveNa },
    pyramide,
    dager,
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminOkterV2 data={data} />
    </V2Shell>
  );
}
