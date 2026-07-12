/**
 * PlayerHQ Talent-hub — v2. Datahenting 1:1 fra legacy-skjermen
 * (TalentTracking + Goal + Round + TrainingPlanSessionLog); beregninger
 * (streak, percentil, ring-verdier) gjøres her og sendes som rene props.
 * Nivåstigen er pre-beta demo-innhold (ærlig merket i skjermen).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { computeStreak, aktivStreak } from "@/lib/streak";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TalentV2, type TalentData } from "@/components/portal/v2/TalentV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

function nivaLabel(niva: string): string {
  const map: Record<string, string> = {
    U10: "U10 · Begynner",
    U12: "U12 · Junior",
    U14: "U14 · Junior",
    U16: "U16 · Toppjunior",
    U18: "U18 · Nasjonalt",
    Senior: "Senior · Elite",
  };
  return map[niva] ?? niva;
}

// Reisen (øverst = høyest, jf. NivaStige)
const REISE_TRINN = ["Tour", "Internasjonal", "Nasjonal", "Regional", "Klubb"];
const REISE_FOR_NIVA: Record<string, string> = {
  U10: "Klubb",
  U12: "Klubb",
  U14: "Regional",
  U16: "Nasjonal",
  U18: "Internasjonal",
  Senior: "Tour",
};

// Nivåstige — pre-beta demo-innhold (merket i skjermen)
const STIGE_TRINN = ["B", "C", "D", "E"];
const STIGE_BESKRIVELSER: Record<string, string> = {
  B: "68–70 · Tour",
  C: "70–72 · Nasjonal",
  D: "72–74 · Toppjunior",
  E: "74–77 · Regional",
};

export default async function TalentPage() {
  const user = await requirePortalUser();

  const [tracking, goals, roundsRaw, sessionLogs] = await Promise.all([
    prisma.talentTracking.findUnique({
      where: { userId: user.id },
      select: {
        niva: true,
        fysisk: true,
        teknikk: true,
        taktikk: true,
        mental: true,
        motivasjon: true,
      },
    }),
    prisma.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { id: true, title: true, targetValue: true, payload: true },
      orderBy: { createdAt: "asc" },
      take: 3,
    }),
    prisma.round.findMany({
      where: { userId: user.id },
      select: { sgTotal: true },
      orderBy: { playedAt: "desc" },
      take: 20,
    }),
    prisma.trainingPlanSessionLog.findMany({
      where: { session: { plan: { userId: user.id } } },
      select: { startedAt: true },
      orderBy: { startedAt: "desc" },
      take: 100,
    }),
  ]);

  const streakDates = sessionLogs.map((l) => new Date(l.startedAt));
  const streak14 = computeStreak(streakDates, 14);
  const aktiveDager = aktivStreak(streak14);

  const sgValues = roundsRaw
    .map((r) => r.sgTotal)
    .filter((v): v is number => v != null);
  const sgAvg =
    sgValues.length > 0 ? sgValues.reduce((s, v) => s + v, 0) / sgValues.length : null;
  // Grov lineær mapping (-3 = 10., 0 = 50., +2 = 88. percentil) — pre-beta.
  const sgPercentil =
    sgAvg != null ? Math.round(Math.min(98, Math.max(2, 50 + sgAvg * 19))) : null;

  function axisRing(val: number | null | undefined, label: string) {
    const v = val ?? 0;
    const pct = Math.round((v / 10) * 100);
    const level = v < 3 ? 1 : v < 6 ? 2 : v < 8 ? 3 : 4;
    return { label, pct, level };
  }

  type GoalPayload = { currentValue?: number; targetValue?: number };
  const maal = goals.map((g) => {
    const p = g.payload as GoalPayload | null;
    const current = p?.currentValue ?? 0;
    const target = g.targetValue ?? p?.targetValue ?? null;
    const pct =
      target != null && target !== 0
        ? Math.round(Math.min(100, (current / target) * 100))
        : 0;
    return { id: g.id, title: g.title, pct, current, target };
  });

  const niva = tracking?.niva ?? "—";

  const data: TalentData = {
    navn: user.name ?? "",
    niva,
    nivaLabel: nivaLabel(niva),
    reiseTrinn: REISE_TRINN,
    reiseNaa: REISE_FOR_NIVA[niva] ?? "Nasjonal",
    ringer: [
      axisRing(tracking?.teknikk, "Teknikk"),
      axisRing(tracking?.fysisk, "Fysisk"),
      axisRing(tracking?.motivasjon, "Motivasjon"),
    ],
    maal,
    streak14,
    aktiveDager,
    sgPercentil,
    stigeTrinn: STIGE_TRINN,
    stigeNaa: "D",
    stigeBeskrivelser: STIGE_BESKRIVELSER,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg">Meg</TilbakeLenke>
      <TalentV2 data={data} />
    </V2Shell>
  );
}
