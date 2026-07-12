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

import { coachedPlayerWhere } from "@/lib/auth/coached";
import { notFound } from "next/navigation";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadSpillerDetaljOversikt } from "@/lib/admin-spiller/spiller-detalj-data";
import { loadSpillerDashboardEkstra } from "@/lib/admin-spiller/spiller-dashboard-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  type AdminSpillerProfilV2Data,
  type SpillerProfilHendelse,
} from "@/components/admin/v2/AdminSpillerProfilV2";
import {
  SpillerDashboardV2,
  type SpillerDashboardV2Data,
  type DashRadItem,
} from "@/components/admin/v2/SpillerDashboardV2";
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

  // I0: direkte-URL til en selvbetjent spiller gir notFound (porten).
  const player = await prisma.user.findFirst({
    where: { AND: [coachedPlayerWhere(), { id }] },
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

  const [oversikt, ekstra, rounds, tests, aktivPlan, pendingAction, entries, ukeOkter] =
    await Promise.all([
      loadSpillerDetaljOversikt(player.id),
      loadSpillerDashboardEkstra(player.id),
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

  // ── Spiller-dashboard (100 %): fanene ut over Oversikt ─────
  // Fasit: ui_kits/agencyos/spiller-dashboard.jsx (Claude Design). Kun ekte
  // data — tomme lister gir ærlige tomtilstander i komponenten.
  const kr = (ore: number) => `${Math.round(ore / 100).toLocaleString("nb-NO")} kr`;
  const dagerTil = (d: Date) => Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86_400_000));
  const LPHASE_NAVN: Record<string, string> = { GRUNN: "GRUNN", SPESIAL: "SPES", TURNERING: "TURN" };
  const PLANSTATUS_NAVN: Record<string, string> = { DRAFT: "Utkast", ACTIVE: "Aktiv", COMPLETED: "Fullført", ARCHIVED: "Arkivert" };

  const heroBadges: SpillerDashboardV2Data["heroBadges"] = [];
  if (flagg) heroBadges.push({ label: flagg.chip, tone: flagg.tone === "down" ? "down" : "warn" });
  if (ekstra.samtykke.paakrevd)
    heroBadges.push(
      ekstra.samtykke.gittAt
        ? { label: "Samtykke gitt", tone: "lime" }
        : { label: "Samtykke mangler", tone: "warn" },
    );
  const aktivSkade = ekstra.leaves.find((l) => l.isInjury && !l.returnedAt && (!l.endAt || l.endAt >= now));
  if (aktivSkade) heroBadges.push({ label: "Skadet · rehab", tone: "down" });

  const dash: SpillerDashboardV2Data = {
    profil: data,
    heroBadges,
    heroMeta: [eyebrow, meta].filter(Boolean).join(" · "),
    kpi: [
      { label: "HCP", verdi: fmtHcp(player.hcp), hjelp: "hcp" },
      {
        label: "SG-trend",
        verdi: oversikt.kpi.sgTrendLabel,
        tone: oversikt.kpi.sgTrend != null ? (oversikt.kpi.sgTrend >= 0 ? "lime" : "down") : undefined,
        hjelp: "sgTotal",
      },
      { label: "Etterlevelse", verdi: planTotal > 0 ? `${planPct} %` : "—" },
      { label: "WAGR", verdi: ekstra.wagr ? String(ekstra.wagr.rank) : "—", hjelp: "wagr" },
      {
        label: "Neste turnering",
        verdi: nesteTurnering ? `${dagerTil(nesteTurnering.date)} dg` : "—",
        tone: nesteTurnering && dagerTil(nesteTurnering.date) <= 21 ? "warn" : undefined,
      },
      {
        label: "Timer igjen",
        verdi: ekstra.abonnement && ekstra.abonnement.monthlyCredits > 0
          ? `${ekstra.abonnement.creditsRemaining}/${ekstra.abonnement.monthlyCredits}`
          : "—",
      },
      { label: "Økter uke", verdi: `${oversikt.kpi.okter.value}` },
    ],
    wbHref: wb,
    analyseHref: `/admin/spillere/${player.id}/analyse`,

    utvikling: {
      fysTester: ekstra.fysTester.map((t) => ({
        venstre: datoKort(t.takenAt),
        tittel: t.navn,
        hoyre: fmtTestScore(t.score),
      })),
      maal: ekstra.maal.map((m) => ({
        venstre: m.category === "PROCESS" ? "Prosess" : "Resultat",
        tittel: m.title,
        sub: [
          m.targetValue != null ? `mål ${fmtTestScore(m.targetValue)}` : null,
          m.targetDate ? `frist ${datoKort(m.targetDate)}` : null,
        ].filter(Boolean).join(" · ") || undefined,
      })),
      trackman: ekstra.trackman.map((s) => ({
        venstre: datoKort(s.recordedAt),
        tittel: `${s.shotCount} slag`,
        sub: s.environment ?? undefined,
      })),
      fremgangHref: `/admin/spillere/${player.id}/fremgang`,
      testerHref: `/admin/spillere/${player.id}/tester`,
    },

    plan: {
      sesong: ekstra.sesong
        ? {
            tittel: ekstra.sesong.name ?? `Sesong ${ekstra.sesong.year}`,
            perioder: ekstra.sesong.perioder.map((per) => ({
              navn: LPHASE_NAVN[per.lPhase] ?? per.lPhase,
              datoer: `${datoKort(per.startDate)} – ${datoKort(per.endDate)}${
                per.weeklyVolMin != null && per.weeklyVolMax != null
                  ? ` · ${Math.round(per.weeklyVolMin / 60)}–${Math.round(per.weeklyVolMax / 60)} t/uke`
                  : ""
              }`,
              fokus: per.focus ?? "",
              aktiv: per.startDate <= now && per.endDate >= now,
            })),
          }
        : null,
      teknisk: ekstra.teknisk
        ? [
            { k: "Plan", v: ekstra.teknisk.navn },
            { k: "Status", v: PLANSTATUS_NAVN[ekstra.teknisk.status] ?? ekstra.teknisk.status },
            {
              k: "Periode",
              v: `${datoKort(ekstra.teknisk.startDato)}${ekstra.teknisk.sluttDato ? ` – ${datoKort(ekstra.teknisk.sluttDato)}` : " →"}`,
            },
          ]
        : null,
      fysisk: ekstra.fysisk
        ? [
            { k: "Plan", v: ekstra.fysisk.navn },
            { k: "Status", v: PLANSTATUS_NAVN[ekstra.fysisk.status] ?? ekstra.fysisk.status },
            { k: "Start", v: datoKort(ekstra.fysisk.startDato) },
          ]
        : null,
      planHref: `/admin/spillere/${player.id}/plan`,
    },

    helse: {
      sparklines: (() => {
        if (!ekstra.helse.length) return [];
        const ut: SpillerDashboardV2Data["helse"]["sparklines"] = [];
        const sovn = ekstra.helse.filter((h) => h.sleepHours != null).map((h) => h.sleepHours as number);
        const puls = ekstra.helse.filter((h) => h.restingHr != null).map((h) => h.restingHr as number);
        const hrv = ekstra.helse.filter((h) => h.hrv != null).map((h) => h.hrv as number);
        if (sovn.length >= 2)
          ut.push({ label: "Søvn", naa: `${sovn[sovn.length - 1].toFixed(1).replace(".", ",")} t`, serie: sovn });
        if (puls.length >= 2)
          ut.push({ label: "Hvilepuls", naa: `${puls[puls.length - 1]} bpm`, serie: puls.map((v) => -v) });
        if (hrv.length >= 2)
          ut.push({ label: "HRV", naa: `${hrv[hrv.length - 1]} ms`, serie: hrv });
        return ut;
      })(),
      skader: ekstra.leaves.map((l) => ({
        tittel: l.description ?? (l.isInjury ? "Skade" : `Permisjon (${l.reason})`),
        sub: `${datoKort(l.startAt)}${l.endAt ? ` – ${datoKort(l.endAt)}` : " → pågår"}${l.returnedAt ? ` · tilbake ${datoKort(l.returnedAt)}` : ""}`,
        aktiv: !l.returnedAt && (!l.endAt || l.endAt >= now),
      })),
    },

    turnering: {
      kommende: entries
        .map((e) => ({
          name: e.tournament?.name ?? e.manualName,
          date: e.tournament?.startDate ?? e.manualDate,
        }))
        .filter((e): e is { name: string; date: Date } => Boolean(e.name && e.date && e.date >= now))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5)
        .map((e) => ({
          venstre: `${dagerTil(e.date)} dg`,
          tittel: e.name,
          sub: datoKort(e.date),
          hoyre: "PÅMELDT",
          hoyreTone: "lime" as const,
        })),
      resultater: ekstra.turneringsResultater.map((r) => ({
        venstre: r.position != null ? `${r.position}.` : "—",
        tittel: r.navn,
        sub: r.dato ? datoKort(r.dato) : undefined,
        hoyre: r.score != null ? String(r.score) : undefined,
      })),
      wagr: ekstra.wagr
        ? {
            rank: String(ekstra.wagr.rank),
            endring:
              ekstra.wagr.moveDelta != null
                ? ekstra.wagr.moveDelta > 0
                  ? `▲ ${ekstra.wagr.moveDelta} siden forrige uke`
                  : ekstra.wagr.moveDelta < 0
                    ? `▼ ${Math.abs(ekstra.wagr.moveDelta)} siden forrige uke`
                    : "uendret"
                : null,
            ptsAvg: ekstra.wagr.ptsAvg.toFixed(2).replace(".", ","),
          }
        : null,
    },

    logg: {
      varsler: ekstra.varsler.map((v) => ({
        venstre: naarLabel(v.createdAt, now),
        tittel: v.title,
        sub: v.body ?? undefined,
      })),
      notater: ekstra.notater.map((n) => ({
        tittel: n.title ?? (n.tags[0] ?? "Notat"),
        tekst: n.content,
        dato: datoKort(n.createdAt),
      })),
      videoer: ekstra.videoer.map((v) => ({
        venstre: datoKort(v.createdAt),
        tittel: v.title,
        sub: v.kilde === "coach" ? "Coaching-video" : "Spiller-opplasting",
      })),
      dokumenter: ekstra.dokumenter.map((d) => ({
        venstre: datoKort(d.createdAt),
        tittel: d.title,
        sub: d.kind,
      })),
      caddie:
        ekstra.caddie.antall > 0
          ? {
              tekst: ekstra.caddie.sisteTittel ?? "Samtale uten tittel",
              sub: `${ekstra.caddie.sisteAt ? naarLabel(ekstra.caddie.sisteAt, now) : ""} · ${ekstra.caddie.antall} samtaler totalt`,
            }
          : null,
    },

    admin: {
      personalia: [
        { k: "Født", v: player.dateOfBirth ? `${datoKort(player.dateOfBirth)} ${player.dateOfBirth.getFullYear()}${alderAar != null ? ` · ${alderAar} år` : ""}` : "—" },
        { k: "Medlem", v: `Siden ${player.createdAt.getFullYear()}` },
        { k: "Gruppe", v: player.groupMemberships.map((m) => m.group.name).join(", ") || "—" },
        { k: "Ambisjon", v: player.ambition ?? "—" },
      ],
      foresatte: ekstra.foresatte.map((f) => ({
        venstre: f.relasjon,
        tittel: f.navn,
        sub: [f.epost, f.telefon].filter(Boolean).join(" · ") || undefined,
        hoyre: f.approved ? "Godkjent" : "Venter",
        hoyreTone: f.approved ? ("lime" as const) : ("warn" as const),
      })),
      samtykke: {
        vis: ekstra.samtykke.paakrevd,
        tekst: ekstra.samtykke.gittAt
          ? `Foreldresamtykke gitt · ${datoKort(ekstra.samtykke.gittAt)} ${ekstra.samtykke.gittAt.getFullYear()}`
          : "Foreldresamtykke mangler — datainnsamling er sperret",
        ok: Boolean(ekstra.samtykke.gittAt),
      },
      okonomi: [
        { k: "Nivå", v: ekstra.abonnement?.tier ?? "—" },
        { k: "Status", v: ekstra.abonnement?.status ?? "—" },
        ...(ekstra.abonnement && ekstra.abonnement.monthlyCredits > 0
          ? [{ k: "Timer", v: `${ekstra.abonnement.creditsRemaining} av ${ekstra.abonnement.monthlyCredits} igjen denne perioden` }]
          : []),
        ...(ekstra.abonnement?.currentPeriodEnd
          ? [{ k: "Fornyes", v: datoKort(ekstra.abonnement.currentPeriodEnd) }]
          : []),
      ],
      betalinger: ekstra.betalinger.map((b) => ({
        venstre: datoKort(b.createdAt),
        tittel: b.type,
        hoyre: kr(b.amountOre),
        hoyreTone: b.status === "SUCCEEDED" ? undefined : ("warn" as const),
        sub: b.status !== "SUCCEEDED" ? b.status : undefined,
      })),
      bookinger: [
        ...ekstra.bookingerKommende.map((b) => ({
          venstre: datoKort(b.startAt),
          tittel: b.tjeneste,
          sub: `${hhmm(b.startAt)}–${hhmm(b.endAt)} · ${b.sted}`,
          hoyre: b.status,
          hoyreTone: "lime" as const,
        })),
        ...ekstra.bookingerSiste.map((b) => ({
          venstre: datoKort(b.startAt),
          tittel: b.tjeneste,
          hoyre: b.status,
          hoyreTone: "mut" as const,
        })),
      ] satisfies DashRadItem[],
      utstyr: ekstra.utstyr
        ? ([
            { k: "Driver", v: ekstra.utstyr.driver ?? "—" },
            { k: "Jern", v: ekstra.utstyr.irons ?? "—" },
            { k: "Wedger", v: ekstra.utstyr.wedges ?? "—" },
            { k: "Putter", v: ekstra.utstyr.putter ?? "—" },
            { k: "Ball", v: ekstra.utstyr.ball ?? "—" },
          ])
        : null,
      redigerHref: `/admin/spillere/${player.id}/rediger`,
    },
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <SpillerDashboardV2 data={dash} />
    </V2Shell>
  );
}
