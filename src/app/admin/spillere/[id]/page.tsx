/**
 * AgencyOS — Spillerprofil 360° (/admin/spillere/[id]), v2-design (retning C).
 *
 * Auth + datauthenting følger den forrige (legacy) siden 1:1: samme
 * requirePortalUser-guard (ADMIN/COACH), samme loadSpillerDetaljOversikt-loader
 * og samme Prisma-spørringer/utleding (coach-flagg, pyramide, aktiv plan,
 * meldinger). Spiller-id kommer fra ruten (params.id) — notFound() hvis
 * spilleren ikke finnes eller ikke er PLAYER.
 *
 * Server component.
 */

import { notFound } from "next/navigation";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadSpillerDetaljOversikt } from "@/lib/admin-spiller/spiller-detalj-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminSpillerProfilV2,
  type AdminSpillerProfilV2Data,
  type SpillerProfilHendelse,
} from "@/components/admin/v2/AdminSpillerProfilV2";
import type { AkseKey } from "@/lib/v2/tokens";

export const dynamic = "force-dynamic";

const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

// Akse-rekkefølge + norsk fullnavn for innsikts-teksten (fra den ekte skjermen).
const AXES: { key: AkseKey; pyrKey: string; label: string }[] = [
  { key: "TURN", pyrKey: "turn", label: "Turnering" },
  { key: "SPILL", pyrKey: "spill", label: "Spill" },
  { key: "SLAG", pyrKey: "slag", label: "Golfslag" },
  { key: "TEK", pyrKey: "tek", label: "Teknisk" },
  { key: "FYS", pyrKey: "fys", label: "Fysisk" },
];

const suggestionSchema = z
  .object({
    title: z.string().optional(),
    tittel: z.string().optional(),
    forklaring: z.string().optional(),
  })
  .nullable();

function fmtHcp(v: number | null): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

function fmtScore(score: number, par: number): string {
  const diff = score - par;
  const rel = diff === 0 ? "E" : diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
  return `${score} (${rel})`;
}

function fmtTestScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1).replace(".", ",");
}

function hhmm(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function datoKort(d: Date): string {
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}

function naarLabel(d: Date, now: Date): string {
  if (d.toDateString() === now.toDateString()) return `I dag ${hhmm(d)}`;
  const iGaar = new Date(now);
  iGaar.setDate(iGaar.getDate() - 1);
  if (d.toDateString() === iGaar.toDateString()) return `I går ${hhmm(d)}`;
  return datoKort(d);
}

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

function alder(dob: Date | null, now: Date): number | null {
  if (!dob) return null;
  let a = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--;
  return a;
}

function gruppeBucket(groupNames: string[]): string | null {
  for (const n of groupNames) {
    const l = n.toLowerCase();
    if (l.includes("wang")) return "WANG";
    if (l.includes("gfgk")) return "GFGK";
    if (l.includes("junior")) return "Junior";
  }
  return groupNames[0] ?? null;
}

export default async function SpillerProfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;
  const now = new Date();

  const player = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      hcp: true,
      ambition: true,
      createdAt: true,
      dateOfBirth: true,
      lastLoginAt: true,
      groupMemberships: {
        select: { group: { select: { name: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!player || player.role !== "PLAYER") notFound();

  const ukeStart = new Date(now);
  ukeStart.setHours(0, 0, 0, 0);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));

  const [oversikt, rounds, tests, aktivPlan, pendingAction, entries, ukeOkter] =
    await Promise.all([
      loadSpillerDetaljOversikt(player.id),
      prisma.round.findMany({
        where: { userId: player.id },
        orderBy: { playedAt: "desc" },
        take: 4,
        select: {
          id: true,
          playedAt: true,
          score: true,
          sgTotal: true,
          course: { select: { name: true, par: true } },
        },
      }),
      prisma.testResult.findMany({
        where: { userId: player.id },
        orderBy: { takenAt: "desc" },
        take: 4,
        select: { id: true, takenAt: true, score: true, test: { select: { name: true } } },
      }),
      prisma.trainingPlan.findFirst({
        where: { userId: player.id, isActive: true },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          sessions: { select: { status: true } },
        },
      }),
      prisma.planAction.findFirst({
        where: { userId: player.id, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        select: { suggestion: true, createdAt: true },
      }),
      prisma.tournamentEntry.findMany({
        where: { userId: player.id, entryStatus: { in: ["PLANNED", "CONFIRMED"] } },
        select: {
          manualName: true,
          manualDate: true,
          tournament: { select: { name: true, startDate: true } },
        },
        take: 20,
      }),
      prisma.trainingPlanSession.findMany({
        where: { plan: { userId: player.id }, scheduledAt: { gte: ukeStart, lt: now } },
        select: { status: true },
      }),
    ]);

  const wb = `/admin/spillere/${player.id}/workbench`;

  // ── Hero-tekster ──────────────────────────────────────────
  const bucket = gruppeBucket(player.groupMemberships.map((m) => m.group.name));
  const eyebrow = [
    bucket,
    player.ambition,
    player.hcp != null ? `HCP ${fmtHcp(player.hcp)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const nesteTurnering =
    entries
      .map((e) => ({
        name: e.tournament?.name ?? e.manualName,
        date: e.tournament?.startDate ?? e.manualDate,
      }))
      .filter((e): e is { name: string; date: Date } =>
        Boolean(e.name && e.date && e.date >= now),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null;

  const alderAar = alder(player.dateOfBirth, now);
  const meta = [
    alderAar != null ? `${alderAar} år` : null,
    `medlem siden ${player.createdAt.getFullYear()}`,
    nesteTurnering
      ? `${Math.max(0, Math.ceil((nesteTurnering.date.getTime() - now.getTime()) / 86_400_000))} dg til ${nesteTurnering.name}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // ── Coach-flagg (kun fra ekte data, ellers null) ──────────
  const planlagtPassert = ukeOkter.length;
  const bak = ukeOkter.filter((s) => s.status === "PLANNED").length;
  const gjennomfoert = ukeOkter.filter((s) => s.status === "COMPLETED").length;
  const inaktivDg = player.lastLoginAt
    ? Math.floor((now.getTime() - player.lastLoginAt.getTime()) / 86_400_000)
    : null;

  const flagg: AdminSpillerProfilV2Data["flagg"] =
    bak >= 1
      ? {
          chip: `${bak} ${bak === 1 ? "økt" : "økter"} bak`,
          tone: "down",
          tekst: `Har gjennomført ${gjennomfoert} av ${planlagtPassert} planlagte økter så langt denne uka — ${bak} ligger bak skjema. Vurder å justere planen i Workbench.`,
          ctaLabel: "Åpne i Workbench",
          ctaHref: wb,
        }
      : inaktivDg != null && inaktivDg >= 5
        ? {
            chip: `${inaktivDg} dg inaktiv`,
            tone: "warn",
            tekst: `Ingen registrert aktivitet på ${inaktivDg} dager — siste innlogging ${datoKort(player.lastLoginAt as Date)}. Vurder å ta kontakt.`,
            ctaLabel: "Send melding",
            ctaHref: "/admin/innboks",
          }
        : null;

  // ── Pyramide + verste akse ────────────────────────────────
  const pyramide = AXES.map((ax) => {
    const d = oversikt.pyramid.find((p) => p.axis === ax.pyrKey);
    return { akse: ax.key, label: ax.label, pct: d?.pct ?? 0, harData: Boolean(d) };
  });
  const harPyramide = oversikt.pyramid.length > 0;
  const verst =
    pyramide
      .filter((r) => r.harData && r.pct < 100)
      .sort((a, b) => a.pct - b.pct)[0] ?? null;

  // ── Siste runder & tester ─────────────────────────────────
  const hendelser: SpillerProfilHendelse[] = [
    ...rounds.map((r) => ({
      id: r.id,
      d: r.playedAt,
      ev: `Runde · ${r.course.name}`,
      res: fmtScore(r.score, r.course.par),
      sg: r.sgTotal,
    })),
    ...tests.map((t) => ({
      id: t.id,
      d: t.takenAt,
      ev: t.test.name,
      res: fmtTestScore(t.score),
      sg: null as number | null,
    })),
  ]
    .sort((a, b) => b.d.getTime() - a.d.getTime())
    .slice(0, 5)
    .map((h, i) => ({
      id: h.id,
      ord: i,
      dato: datoKort(h.d),
      hendelse: h.ev,
      resultat: h.res,
      sg: h.sg,
    }));

  // ── Aktiv plan ────────────────────────────────────────────
  const planTotal = aktivPlan?.sessions.length ?? 0;
  const planDone = aktivPlan?.sessions.filter((s) => s.status === "COMPLETED").length ?? 0;
  const planPct = planTotal > 0 ? Math.round((planDone / planTotal) * 100) : 0;
  const plan: AdminSpillerProfilV2Data["plan"] = aktivPlan
    ? {
        navn: aktivPlan.name,
        meta: `Uke ${isoWeek(aktivPlan.startDate)}${aktivPlan.endDate ? `–${isoWeek(aktivPlan.endDate)}` : ""} · ${planTotal} økter`,
        pct: planPct,
        href: "/admin/plans",
      }
    : null;

  // ── Meldinger: PENDING godkjenning → fallback siste comms ─
  const parsed = pendingAction ? suggestionSchema.safeParse(pendingAction.suggestion) : null;
  const sugg = parsed?.success ? parsed.data : null;
  const melding: AdminSpillerProfilV2Data["melding"] = pendingAction
    ? {
        when: naarLabel(pendingAction.createdAt, now),
        type: "Godkjenning",
        tekst: sugg?.forklaring ?? sugg?.tittel ?? sugg?.title ?? "Forslag venter på godkjenning.",
        href: "/admin/godkjenninger",
        pending: true,
      }
    : oversikt.comms[0]
      ? {
          when: oversikt.comms[0].when,
          type: oversikt.comms[0].type ?? "Melding",
          tekst: oversikt.comms[0].preview,
          href: "/admin/innboks",
          pending: false,
        }
      : null;

  const handlinger: AdminSpillerProfilV2Data["handlinger"] = [
    { label: "Ny økt", icon: "calendar-plus", href: wb },
    { label: "Ny treningsplan", icon: "list", href: wb },
    { label: "Send melding", icon: "message-circle", href: "/admin/innboks" },
    { label: "Book Pro-time", icon: "clock", href: "/admin/bookinger/ny" },
    { label: "Meld på turnering", icon: "trophy", href: "/admin/tournaments" },
  ];

  const data: AdminSpillerProfilV2Data = {
    id: player.id,
    navn: player.name,
    eyebrow,
    meta,
    analyseHref: `/admin/spillere/${player.id}/analyse`,
    meldingHref: "/admin/innboks",
    wbHref: wb,
    flagg,
    weekLabel: oversikt.weekLabel,
    pyramide: harPyramide
      ? pyramide.filter((r) => r.harData).map((r) => ({ akse: r.akse, pct: r.pct }))
      : [],
    verstLabel: verst?.label ?? null,
    verstBakPp: verst ? 100 - verst.pct : 0,
    hendelser,
    plan,
    handlinger,
    melding,
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminSpillerProfilV2 data={data} />
    </V2Shell>
  );
}
