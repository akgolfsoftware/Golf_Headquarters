/**
 * PlayerHQ · Talent · Sammenligning (/portal/talent/sammenligning) — v2.
 * v2-port 17. juli 2026 (Team D5): `TalentSammenligningV2` erstatter
 * athletic-skjermen, ruten flyttet ut av (legacy) (actions.ts fulgte med
 * uendret). Feature-gate og «ikke i programmet»-sjekken fra den slettede
 * (legacy)-layouten håndheves nå her. Auth, URL-param-kontrakten
 * (?q / ?spiller / ?periode), anonymiserings-lesingen, kandidat-/motspiller-
 * queries og SG-snittberegningen er uendret — kun presentasjonslaget er nytt.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  TalentSammenligningV2,
  type TalentSammenligningData,
  type SammenligningPeriode,
} from "@/components/portal/v2/TalentSammenligningV2";
import {
  TALENT_AKSE_KEYS,
  TALENT_AKSE_LABELS,
  TalentIkkeIProgrammet,
} from "@/components/portal/v2/TalentFellesV2";

type SearchParams = Promise<{ q?: string; spiller?: string; periode?: string }>;

function lesAnonymiser(prefs: unknown): boolean {
  if (!prefs || typeof prefs !== "object" || Array.isArray(prefs)) return false;
  const talent = (prefs as Record<string, unknown>).talent;
  if (!talent || typeof talent !== "object" || Array.isArray(talent)) return false;
  const v = (talent as Record<string, unknown>).anonymiserSammenligning;
  return v === true;
}

function snitt(
  runder: {
    sgTotal: number | null;
    sgApp: number | null;
    sgArg: number | null;
    sgPutt: number | null;
  }[],
  felt: "sgTotal" | "sgApp" | "sgArg" | "sgPutt",
): number | null {
  const vals = runder.map((r) => r[felt]).filter((v): v is number => v !== null);
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

export default async function SammenligningPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!FEATURES.TALENT) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const { q, spiller, periode } = await searchParams;

  const mineData = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
    include: { user: { select: { name: true, preferences: true } } },
  });

  if (!mineData) {
    return (
      <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/talent">Talent</TilbakeLenke>
        <TalentIkkeIProgrammet />
      </V2Shell>
    );
  }

  const minAnonymisert = lesAnonymiser(mineData.user.preferences);
  const mittNavn = minAnonymisert ? "Spiller" : (mineData.user.name ?? "Deg");

  // Hent alle andre på samme nivå, valgfritt filtrert på søketekst
  const kandidater = await prisma.talentTracking.findMany({
    where: {
      niva: mineData.niva,
      NOT: { userId: user.id },
      ...(q && q.trim().length > 0
        ? {
            user: {
              name: { contains: q.trim(), mode: "insensitive" },
            },
          }
        : {}),
    },
    include: { user: { select: { id: true, name: true, preferences: true } } },
    take: 50,
    orderBy: { user: { name: "asc" } },
  });

  // Valgt motspiller
  const valgt = spiller
    ? kandidater.find((k) => k.user.id === spiller) ??
      (await prisma.talentTracking.findFirst({
        where: { user: { id: spiller }, niva: mineData.niva },
        include: { user: { select: { id: true, name: true, preferences: true } } },
      }))
    : null;

  const annenAnonymisert = valgt ? lesAnonymiser(valgt.user.preferences) : false;
  const annenNavn = !valgt
    ? null
    : annenAnonymisert
      ? "Spiller"
      : (valgt.user.name ?? "Ukjent");

  // Periode-filter for SG delta
  const periodeValgt: SammenligningPeriode =
    periode === "90d" ? "90d" : periode === "1ar" ? "1ar" : "30d";
  const dager = periodeValgt === "1ar" ? 365 : periodeValgt === "90d" ? 90 : 30;
  const periodeStart = new Date();
  periodeStart.setDate(periodeStart.getDate() - dager);

  // SG siste runder i perioden vs runder før perioden
  const [nyeRunder, gamleRunder] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: periodeStart } },
      orderBy: { playedAt: "desc" },
      take: 5,
      select: { sgTotal: true, sgApp: true, sgArg: true, sgPutt: true, playedAt: true },
    }),
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { lt: periodeStart } },
      orderBy: { playedAt: "desc" },
      take: 5,
      select: { sgTotal: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
  ]);

  const data: TalentSammenligningData = {
    niva: mineData.niva,
    mittNavn,
    minKlubb: mineData.klubb ?? null,
    minAnonymisert,
    q: q ?? "",
    spillerId: valgt?.user.id ?? "",
    periode: periodeValgt,
    kandidater: kandidater.map((k) => ({
      id: k.user.id,
      navn: lesAnonymiser(k.user.preferences) ? "Spiller" : (k.user.name ?? "Ukjent"),
      klubb: k.klubb ?? null,
    })),
    valgt: valgt ? { navn: annenNavn ?? "Ukjent", klubb: valgt.klubb ?? null } : null,
    akser: TALENT_AKSE_KEYS.map((k) => ({
      key: k,
      label: TALENT_AKSE_LABELS[k],
      min: mineData[k],
      andre: valgt ? valgt[k] : null,
    })),
    // Ordboken: APP = innspill, ARG = nærspill.
    sgDeltas: [
      { label: "SG totalt", naa: snitt(nyeRunder, "sgTotal"), foer: snitt(gamleRunder, "sgTotal") },
      { label: "SG innspill", naa: snitt(nyeRunder, "sgApp"), foer: snitt(gamleRunder, "sgApp") },
      { label: "SG nærspill", naa: snitt(nyeRunder, "sgArg"), foer: snitt(gamleRunder, "sgArg") },
      { label: "SG putting", naa: snitt(nyeRunder, "sgPutt"), foer: snitt(gamleRunder, "sgPutt") },
    ],
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/talent">Talent</TilbakeLenke>
      <TalentSammenligningV2 data={data} />
    </V2Shell>
  );
}
