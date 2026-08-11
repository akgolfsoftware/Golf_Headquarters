/**
 * Data for SpillerProfilPanel (Paper-fasit: designsystem/paper/fase1/
 * spillerprofil.html) — artefaktpanelet som åpnes fra /admin/spillere.
 *
 * ARVER datahenting: loadSpillerDetaljOversikt + loadSpillerDashboardEkstra
 * pluss de samme spørringene /admin/spillere/[id] allerede kjører (user,
 * aktiv plan, pending PlanAction, siste runder, siste tester). Ingen nye
 * spørringsmønstre er funnet opp — kun eksisterende gjenbrukt.
 *
 * Fasitens regel: hver seksjon navngir Prisma-modellen(e) den leser fra.
 * Finnes ingen data, vises ærlig tomtekst — aldri oppfunne felter.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { loadSpillerDetaljOversikt } from "@/lib/admin-spiller/spiller-detalj-data";
import { loadSpillerDashboardEkstra } from "@/lib/admin-spiller/spiller-dashboard-data";
import { formatSg } from "@/lib/sg";

export type ProfilLinje = { k: string; v: string; tone?: "pos" | "neg" };

export type ProfilSeksjon = {
  id: string;
  tittel: string;
  /** Prisma-modellnavn — fasitens `kilde:`-linje. */
  kilde: string;
  /** null = stub («ikke koblet ennå»); [] = koblet men tom. */
  linjer: ProfilLinje[] | null;
  aapen?: boolean;
  /** Ærlig tomtekst når koblet, men uten data. */
  tomTekst?: string;
};

export type SpillerProfilPanelData = {
  id: string;
  navn: string;
  initialer: string;
  /** «X år · HCP y · klubb» — kun av felter som finnes. */
  subLinje: string;
  kpi: {
    k: string;
    v: string;
    tone?: "pos" | "neg";
    w: string;
  }[];
  seksjoner: ProfilSeksjon[];
  fullSideHref: string;
  workbenchHref: string;
};

function fmtHcp(v: number | null): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

function alder(dob: Date | null, now: Date): number | null {
  if (!dob) return null;
  let a = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--;
  return a;
}

function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return "—";
  if (deler.length === 1) return deler[0].slice(0, 2).toUpperCase();
  return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
}

function dato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
}

/** De 12 seksjonene som IKKE er koblet i denne runden — ærlige stubber. */
const STUBBER: { id: string; tittel: string; kilde: string }[] = [
  { id: "trackman", tittel: "TrackMan", kilde: "TrackManSession · ClubMetricTrend · EquipmentBag" },
  { id: "turnering", tittel: "Turneringer", kilde: "Tournament · TournamentEntry · TournamentResult" },
  { id: "gjennomforing", tittel: "Gjennomføring", kilde: "TrainingLog · CoachingSession" },
  { id: "observasjon", tittel: "Observasjoner og fangst", kilde: "CoachNote · Signal" },
  { id: "helse", tittel: "Helse og belastning", kilde: "HealthEntry · Leave" },
  { id: "maal", tittel: "Mål og utmerkelser", kilde: "Goal · Achievement · DrillChallenge" },
  { id: "gameplan", tittel: "Gameplan", kilde: "GameplanHull · GameplanSone" },
  { id: "anlegg", tittel: "Anlegg og utstyr", kilde: "PlayerFacility · FacilityPrefs · EquipmentBag" },
  { id: "abonnement", tittel: "Abonnement og betaling", kilde: "Subscription · Payment · Booking" },
  { id: "foreldre", tittel: "Foreldre og samtykker", kilde: "ParentRelation · User.guardianConsentGivenAt" },
  { id: "talent", tittel: "Talent og rangering", kilde: "TalentTracking · WagrSnapshot" },
  { id: "ai", tittel: "AI-historikk", kilde: "CaddieConversation · CaddieDraft · AiMemory" },
];

/**
 * null når spilleren ikke finnes / er utenfor coach-scope (samme port som
 * /admin/spillere/[id]).
 */
export async function loadSpillerProfilPanel(
  user: { id: string; role: string },
  playerId: string,
): Promise<SpillerProfilPanelData | null> {
  const now = new Date();

  // Samme guard + select som /admin/spillere/[id]/page.tsx.
  const player = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(user), { id: playerId }] },
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
  if (!player || player.role !== "PLAYER") return null;

  const [oversikt, ekstra, rounds, tests, aktivPlan, pendingAction] = await Promise.all([
    loadSpillerDetaljOversikt(player.id),
    loadSpillerDashboardEkstra(player.id),
    // Speiler [id]-sidens runde-spørring (siste 4).
    prisma.round.findMany({
      where: { userId: player.id },
      orderBy: { playedAt: "desc" },
      take: 4,
      select: {
        playedAt: true,
        score: true,
        sgTotal: true,
        course: { select: { name: true } },
      },
    }),
    // Speiler [id]-sidens test-spørring (siste 4).
    prisma.testResult.findMany({
      where: { userId: player.id },
      orderBy: { takenAt: "desc" },
      take: 4,
      select: { takenAt: true, score: true, test: { select: { name: true } } },
    }),
    // Speiler [id]-sidens plan-spørring.
    prisma.trainingPlan.findFirst({
      where: { userId: player.id, isActive: true },
      orderBy: { updatedAt: "desc" },
      select: {
        name: true,
        startDate: true,
        endDate: true,
        sessions: { select: { status: true } },
      },
    }),
    // Speiler [id]-sidens PlanAction-spørring.
    prisma.planAction.findFirst({
      where: { userId: player.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { suggestion: true, createdAt: true },
    }),
  ]);

  const alderAar = alder(player.dateOfBirth, now);
  const gruppe = player.groupMemberships[0]?.group.name ?? null;
  const navn = player.name ?? "Spiller";

  // phead-sub: kun ekte felter. Kategori (A–K) finnes ikke i disse loaderne
  // og fabrikeres ikke.
  const subLinje = [
    alderAar != null ? `${alderAar} år` : null,
    `HCP ${fmtHcp(player.hcp)}`,
    gruppe,
  ]
    .filter(Boolean)
    .join(" · ");

  // ── KPI-rad (4) — alt fra eksisterende loadere ─────────────────────────
  const sisteBooking = ekstra.bookingerSiste[0] ?? null;
  const kpi: SpillerProfilPanelData["kpi"] = [
    {
      k: "sg-trend 30 d",
      v: oversikt.kpi.sgTrendLabel,
      tone:
        oversikt.kpi.sgTrend != null
          ? oversikt.kpi.sgTrend >= 0
            ? "pos"
            : "neg"
          : undefined,
      w: `${oversikt.kpi.sgRoundCount} runder`,
    },
    { k: "hcp", v: fmtHcp(player.hcp), w: "registrert på profilen" },
    {
      k: "siste booking",
      v: sisteBooking ? dato(sisteBooking.startAt) : "—",
      w: sisteBooking ? sisteBooking.tjeneste : "ingen registrert",
    },
    {
      k: "økter 30 d",
      v: String(oversikt.kpi.okter.value),
      w: `av ${oversikt.kpi.okter.plan} planlagte`,
    },
  ];

  // ── De 6 kjerneseksjonene ──────────────────────────────────────────────
  const identitet: ProfilLinje[] = [
    ...(alderAar != null ? [{ k: "Alder", v: `${alderAar} år` }] : []),
    { k: "HCP", v: fmtHcp(player.hcp) },
    ...(gruppe ? [{ k: "Gruppe", v: gruppe }] : []),
    ...(player.ambition ? [{ k: "Ambisjon", v: player.ambition }] : []),
    { k: "Medlem siden", v: String(player.createdAt.getFullYear()) },
    {
      k: "Sist innlogget",
      v: player.lastLoginAt ? dato(player.lastLoginAt) : "aldri",
      tone: player.lastLoginAt ? undefined : ("neg" as const),
    },
  ];

  const planLinjer: ProfilLinje[] = aktivPlan
    ? [
        { k: "Aktiv plan", v: aktivPlan.name },
        {
          k: "Periode",
          v: `${dato(aktivPlan.startDate)}–${aktivPlan.endDate ? dato(aktivPlan.endDate) : "åpen"}`,
        },
        {
          k: "Økter",
          v: `${aktivPlan.sessions.filter((s) => s.status === "COMPLETED").length} av ${aktivPlan.sessions.length}`,
        },
        ...(pendingAction
          ? [{ k: "Venter på deg", v: `Forslag ${dato(pendingAction.createdAt)}`, tone: "neg" as const }]
          : []),
      ]
    : [];

  const naaPeriode = ekstra.sesong?.perioder.find((p) => p.startDate <= now && p.endDate >= now) ?? null;
  const nestePeriode = ekstra.sesong?.perioder.find((p) => p.startDate > now) ?? null;
  const sesongLinjer: ProfilLinje[] = ekstra.sesong
    ? [
        { k: "Sesong", v: `${ekstra.sesong.year}${ekstra.sesong.name ? ` · ${ekstra.sesong.name}` : ""}` },
        ...(naaPeriode
          ? [
              { k: "Nå", v: naaPeriode.focus ?? naaPeriode.lPhase },
              { k: "Til", v: dato(naaPeriode.endDate) },
            ]
          : []),
        ...(nestePeriode
          ? [{ k: "Neste", v: `${nestePeriode.focus ?? nestePeriode.lPhase} · ${dato(nestePeriode.startDate)}` }]
          : []),
      ]
    : [];

  const tekniskLinjer: ProfilLinje[] = ekstra.teknisk
    ? [
        { k: "Aktiv plan", v: ekstra.teknisk.navn },
        { k: "Status", v: ekstra.teknisk.status.toLowerCase() },
        { k: "Startet", v: dato(ekstra.teknisk.startDato) },
      ]
    : [];

  const prestasjonLinjer: ProfilLinje[] = [
    {
      k: "SG-trend 30 d",
      v: oversikt.kpi.sgTrendLabel,
      tone: oversikt.kpi.sgTrend != null ? (oversikt.kpi.sgTrend >= 0 ? "pos" : "neg") : undefined,
    },
    { k: "Runder i vinduet", v: String(oversikt.kpi.sgRoundCount) },
    ...rounds.map(
      (r): ProfilLinje => ({
        k: `${dato(r.playedAt)} · ${r.course.name}`,
        v: `${r.score}${r.sgTotal != null ? ` · ${formatSg(r.sgTotal)} SG` : ""}`,
        tone: r.sgTotal != null ? (r.sgTotal >= 0 ? "pos" : "neg") : undefined,
      }),
    ),
  ];

  const testLinjer: ProfilLinje[] = [
    ...tests.map((t) => ({
      k: t.test.name,
      v: `${t.score.toFixed(1).replace(".", ",").replace(/,0$/, "")} · ${dato(t.takenAt)}`,
    })),
    ...ekstra.fysTester.slice(0, 3).map((t) => ({
      k: t.navn,
      v: `${t.score.toFixed(1).replace(".", ",").replace(/,0$/, "")} · ${dato(t.takenAt)}`,
    })),
  ];

  const seksjoner: ProfilSeksjon[] = [
    {
      id: "identitet",
      tittel: "Identitet og tilhørighet",
      kilde: "User · Group",
      linjer: identitet,
      aapen: true,
    },
    {
      id: "plan",
      tittel: "Plan",
      kilde: "TrainingPlan · TrainingPlanSession · PlanAction",
      linjer: planLinjer,
      aapen: true,
      tomTekst: "Ingen aktiv treningsplan. Planen bygges i Workbench.",
    },
    {
      id: "sesong",
      tittel: "Sesong og periode",
      kilde: "SeasonPlan · PeriodBlock",
      linjer: sesongLinjer,
      tomTekst: "Ingen sesongplan registrert ennå.",
    },
    {
      id: "teknisk",
      tittel: "Teknisk plan",
      kilde: "TechnicalPlan",
      linjer: tekniskLinjer,
      tomTekst: "Ingen teknisk plan registrert ennå.",
    },
    {
      id: "prestasjon",
      tittel: "Prestasjon og SG",
      kilde: "Round · SgInsight",
      linjer: rounds.length > 0 || oversikt.kpi.sgRoundCount > 0 ? prestasjonLinjer : [],
      aapen: true,
      tomTekst: "Ingen runder registrert ennå.",
    },
    {
      id: "tester",
      tittel: "Tester",
      kilde: "TestResult · TestDefinition",
      linjer: testLinjer,
      tomTekst: "Ingen testresultater registrert ennå.",
    },
    ...STUBBER.map((s) => ({ ...s, linjer: null })),
  ];

  return {
    id: player.id,
    navn,
    initialer: initialer(navn),
    subLinje,
    kpi,
    seksjoner,
    fullSideHref: `/admin/spillere/${player.id}`,
    workbenchHref: `/admin/spillere/${player.id}/workbench`,
  };
}
