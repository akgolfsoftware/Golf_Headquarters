/**
 * PlayerHQ · Talent · Roadmap (/portal/talent/roadmap) — v2.
 * v2-port 17. juli 2026 (Team D5): `TalentRoadmapV2` erstatter athletic-
 * skjermen, ruten flyttet ut av (legacy). Feature-gate og «ikke i
 * programmet»-sjekken fra den slettede (legacy)-layouten håndheves nå her.
 * Auth, Prisma-queries (SeasonPlan.periodBlocks + tournamentEntries +
 * TalentTracking.milepaeler), L-fase-navnene og de ekte tellingene er
 * uendret — kun presentasjonslaget er nytt. Pre-beta-stripen beholdt.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import type { LPhase } from "@/generated/prisma/client";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  TalentRoadmapV2,
  type TalentRoadmapData,
} from "@/components/portal/v2/TalentRoadmapV2";
import { TalentIkkeIProgrammet } from "@/components/portal/v2/TalentFellesV2";

export const dynamic = "force-dynamic";

type Milepael = {
  tittel: string;
  dato: string;
  beskrivelse?: string;
  oppnadd?: boolean;
};

function parseMilepaeler(json: unknown): Milepael[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (m): m is Milepael =>
      typeof m === "object" &&
      m !== null &&
      typeof (m as Milepael).tittel === "string",
  );
}

const LPHASE_NAVN: Record<LPhase, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialisering",
  TURNERING: "Turneringsperiode",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};

const MND_KORT = [
  "jan", "feb", "mar", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "des",
];

function periodeTekst(start: Date, end: Date): string {
  const a = MND_KORT[start.getMonth()];
  const b = MND_KORT[end.getMonth()];
  return a === b ? a : `${a} – ${b}`;
}

function datoTekst(d: Date): string {
  return `${d.getDate()}. ${MND_KORT[d.getMonth()]}`;
}

export default async function RoadmapPage() {
  if (!FEATURES.TALENT) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const ar = new Date().getFullYear();

  const [tracking, sesongplan] = await Promise.all([
    prisma.talentTracking.findUnique({
      where: { userId: user.id },
      select: { niva: true, milepaeler: true },
    }),
    prisma.seasonPlan.findFirst({
      where: { userId: user.id, year: ar },
      include: {
        periodBlocks: { orderBy: { startDate: "asc" } },
        tournamentEntries: {
          where: { entryStatus: { not: "WITHDRAWN" } },
          include: { tournament: { select: { name: true, startDate: true } } },
        },
      },
    }),
  ]);

  if (!tracking) {
    return (
      <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/talent">Talent</TilbakeLenke>
        <TalentIkkeIProgrammet />
      </V2Shell>
    );
  }

  const milepaeler = parseMilepaeler(tracking.milepaeler);

  const faser = (sesongplan?.periodBlocks ?? []).map((b) => ({
    id: b.id,
    navn: LPHASE_NAVN[b.lPhase],
    periode: periodeTekst(b.startDate, b.endDate),
    fokus: b.focus ?? null,
  }));

  const turneringer = (sesongplan?.tournamentEntries ?? [])
    .map((e) => {
      const navn = e.tournament?.name ?? e.manualName ?? null;
      const dato = e.tournament?.startDate ?? e.manualDate ?? null;
      return navn ? { id: e.id, navn, dato } : null;
    })
    .filter((t): t is { id: string; navn: string; dato: Date | null } => t !== null)
    .sort((a, b) => (a.dato?.getTime() ?? 0) - (b.dato?.getTime() ?? 0));

  const data: TalentRoadmapData = {
    niva: tracking.niva,
    ar,
    faser,
    turneringer: turneringer.map((t) => ({
      id: t.id,
      navn: t.navn,
      datoTekst: t.dato ? datoTekst(t.dato) : null,
    })),
    milepaeler: milepaeler.map((m) => ({
      tittel: m.tittel,
      datoTekst: m.dato ?? null,
      beskrivelse: m.beskrivelse ?? null,
      oppnadd: m.oppnadd ?? false,
    })),
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/talent">Talent</TilbakeLenke>
      <TalentRoadmapV2 data={data} />
    </V2Shell>
  );
}
