/**
 * Data-loader for Spiller 360 — arbeidsvisningen (Ø13, MASTERPLAN STEG 1B).
 *
 * Fasit: `S3-01 Agency Spiller 360 Mac.dc.html` (+ S3-01L lys) · `S3-02 Agency
 * Spiller 360 iPad.dc.html` · `AG-08 Spiller-ark.dc.html`. Master-detalj:
 * smal spillerliste (rail) + ett 360-panel (i dag, SG siste 12 uker, ukeplan,
 * tester, video, notat) — til forskjell fra Oversikt-bentoen (S3-03, Ø12) som
 * er kolonnelayout uten spillerliste ved siden av.
 *
 * TruthLayer: hvert felt er koblet til en ekte spørring, egne fra dem
 * `lastSpillerOversikt`/fremgang-uttrekket i page.tsx allerede gjør. Der
 * fasiten viser noe uten 1:1-felt i datamodellen, er kortet bevisst forenklet
 * (se merknader per felt) — aldri fylt med oppdiktede verdier.
 *
 * Ikke bygget fra fasiten (bevisst forenklet):
 * - AG-08s uke-rad (M–S med per-dags treningstype-prikk) krever en dag-for-
 *   dag-kobling mot pyramideområde som ikke finnes som egen spørring ennå —
 *   gjenbruker i stedet samme uke-pyramide-prosent som Oversikt-bentoen (S3-03).
 * - Video-kortet har ingen tittel- eller P-posisjon-felt i `PlayerSwingVideo`
 *   (kun `drillId`) — viser dato og status, ikke en oppdiktet tittel.
 * - Tester viser kun FULLFØRTE `TestResult` (siste 3) — planlagte tester
 *   (`TestAssignment`) er ikke koblet inn her.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import type { SgCategory, PlayerProgram } from "@/generated/prisma/client";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short" });
const OSLO_TZ = "Europe/Oslo";
const KL = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: OSLO_TZ });

function initials(name: string | null | undefined): string {
  if (!name) return "—";
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

export type ArbeidsvisningRailSpiller = {
  id: string;
  navn: string;
  initials: string;
  avatarUrl: string | null;
  hcpLabel: string;
  subLabel: string;
};

export type ArbeidsvisningSgOmrade = { kode: SgCategory; label: string; siste: number | null };

export type ArbeidsvisningData = {
  rail: ArbeidsvisningRailSpiller[];
  aktivId: string;
  navn: string;
  initials: string;
  avatarUrl: string | null;
  hcpLabel: string;
  gruppeLabel: string | null;
  sgSnittLabel: string | null;
  iDag: { tittel: string; klokke: string; omrade: string; sted: string | null }[];
  ukePst: number | null;
  sgOmrader: ArbeidsvisningSgOmrade[];
  tester: { id: string; navn: string; datoLabel: string }[];
  videoer: { id: string; datoLabel: string; statusLabel: string }[];
  notat: { tekst: string; coachNavn: string; datoLabel: string } | null;
};

const OMRADE_NAVN: Record<SgCategory, string> = {
  OTT: "Utslag",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putt",
};

const VIDEO_STATUS_LABEL: Record<string, string> = {
  PROCESSING: "Behandles",
  READY: "Klar",
  FAILED: "Feilet",
};

export async function lastSpillerArbeidsvisning(
  coach: { id: string; role: string },
  playerId: string,
): Promise<ArbeidsvisningData | null> {
  const now = new Date();
  const idagIso = new Intl.DateTimeFormat("sv-SE", { timeZone: OSLO_TZ }).format(now);
  const idagStart = new Date(`${idagIso}T00:00:00`);
  const idagSlutt = new Date(idagStart.getTime() + 24 * 60 * 60 * 1000);
  const dag = idagStart.getDay() || 7;
  const ukeStart = new Date(idagStart);
  ukeStart.setDate(idagStart.getDate() - dag + 1);
  const ukeSlutt = new Date(ukeStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const tolvUkerSiden = new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000);

  const railWhere = {
    role: "PLAYER" as const,
    deletedAt: null,
    enrollmentsAsPlayer: {
      some: {
        endedAt: null,
        NOT: { program: "PLATFORM_ONLY" as PlayerProgram },
        ...(coach.role === "ADMIN" ? {} : { coachId: coach.id }),
      },
    },
  };

  const [player, gruppeMedlemskap, railSpillere, ukeOkter, dagensOkter, sgRunder, testResultater, videoer, sisteNotat] = await Promise.all([
    prisma.user.findFirst({
      where: { AND: [coachScopedPlayerWhere(coach), { id: playerId }] },
      select: { id: true, name: true, avatarUrl: true, hcp: true, role: true },
    }),
    prisma.groupMember.findFirst({
      where: { userId: playerId, ...aktivtSpillerMedlemskapWhere() },
      orderBy: { joinedAt: "desc" },
      select: { group: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: railWhere,
      select: { id: true, name: true, avatarUrl: true, hcp: true, homeClub: true },
      orderBy: { name: "asc" },
      take: 60,
    }),
    prisma.trainingSessionV2.findMany({
      where: { studentId: playerId, startTime: { gte: ukeStart, lt: ukeSlutt }, status: { not: "CANCELLED" } },
      select: { status: true },
    }),
    prisma.trainingSessionV2.findMany({
      where: { studentId: playerId, startTime: { gte: idagStart, lt: idagSlutt }, status: { not: "CANCELLED" } },
      select: { title: true, startTime: true, practiceType: true, location: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.round.findMany({
      where: { userId: playerId, sgTotal: { not: null }, playedAt: { gte: tolvUkerSiden } },
      select: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
      orderBy: { playedAt: "desc" },
      take: 12,
    }),
    prisma.testResult.findMany({
      where: { userId: playerId },
      select: { id: true, takenAt: true, test: { select: { name: true } } },
      orderBy: { takenAt: "desc" },
      take: 3,
    }),
    prisma.playerSwingVideo.findMany({
      where: { userId: playerId },
      select: { id: true, createdAt: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.coachNote.findFirst({
      where: { playerId },
      orderBy: { updatedAt: "desc" },
      select: { content: true, updatedAt: true, coach: { select: { name: true } } },
    }),
  ]);

  if (!player || player.role !== "PLAYER") return null;

  const PRACTICE_TO_PYRAMID: Record<string, "TEK" | "SLAG" | "TURN" | "SPILL"> = {
    BLOKK: "TEK",
    RANDOM: "SLAG",
    KONKURRANSE: "TURN",
    SPILL_TEST: "SPILL",
  };
  const ukeGjennomfort = ukeOkter.filter((s) => s.status === "COMPLETED").length;
  const ukePst = ukeOkter.length > 0 ? Math.round((ukeGjennomfort / ukeOkter.length) * 100) : null;

  const sgSnitt =
    sgRunder.length > 0
      ? Math.round((sgRunder.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / sgRunder.length) * 100) / 100
      : null;

  const SG_FELT: Record<SgCategory, "sgOtt" | "sgApp" | "sgArg" | "sgPutt"> = {
    OTT: "sgOtt",
    APP: "sgApp",
    ARG: "sgArg",
    PUTT: "sgPutt",
  };
  const sgOmrader: ArbeidsvisningSgOmrade[] = (["OTT", "APP", "ARG", "PUTT"] as SgCategory[]).map((kode) => {
    const felt = SG_FELT[kode];
    const verdier = sgRunder.map((r) => r[felt]).filter((v): v is number => v != null);
    const siste = verdier.length > 0 ? Math.round((verdier.reduce((a, b) => a + b, 0) / verdier.length) * 100) / 100 : null;
    return { kode, label: OMRADE_NAVN[kode], siste };
  });

  return {
    rail: railSpillere.map((r) => ({
      id: r.id,
      navn: r.name,
      initials: initials(r.name),
      avatarUrl: r.avatarUrl,
      hcpLabel: fmtHcp(r.hcp),
      subLabel: r.homeClub ?? "—",
    })),
    aktivId: player.id,
    navn: player.name,
    initials: initials(player.name),
    avatarUrl: player.avatarUrl,
    hcpLabel: fmtHcp(player.hcp),
    gruppeLabel: gruppeMedlemskap?.group.name ?? null,
    sgSnittLabel: sgSnitt != null ? `${sgSnitt > 0 ? "+" : ""}${sgSnitt.toFixed(2).replace(".", ",")}` : null,
    iDag: dagensOkter.map((s) => ({
      tittel: s.title,
      klokke: KL.format(s.startTime),
      omrade: PRACTICE_TO_PYRAMID[s.practiceType] ?? "TEK",
      sted: s.location,
    })),
    ukePst,
    sgOmrader,
    tester: testResultater.map((t) => ({ id: t.id, navn: t.test.name, datoLabel: NB_DATE.format(t.takenAt) })),
    videoer: videoer.map((v) => ({
      id: v.id,
      datoLabel: NB_DATE.format(v.createdAt),
      statusLabel: VIDEO_STATUS_LABEL[v.status] ?? v.status,
    })),
    notat: sisteNotat
      ? { tekst: sisteNotat.content, coachNavn: sisteNotat.coach.name, datoLabel: NB_DATE.format(sisteNotat.updatedAt) }
      : null,
  };
}
