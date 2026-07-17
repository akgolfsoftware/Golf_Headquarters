/**
 * PlayerHQ · Talent · Min plan (/portal/talent/min-plan) — v2.
 * v2-port 17. juli 2026 (Team D5): `TalentMinPlanV2` erstatter athletic-
 * skjermen, ruten flyttet ut av (legacy). Feature-gate (FEATURES.TALENT) og
 * «ikke i programmet»-sjekken fra den slettede (legacy)-layouten håndheves
 * nå her i siden. Auth, Prisma-query mot TalentTracking og milepæl-parsingen
 * er uendret — kun presentasjonslaget er nytt.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  TalentMinPlanV2,
  type TalentMinPlanData,
} from "@/components/portal/v2/TalentMinPlanV2";
import {
  TALENT_AKSE_KEYS,
  TALENT_AKSE_LABELS,
  TalentIkkeIProgrammet,
} from "@/components/portal/v2/TalentFellesV2";

type Milepael = {
  tittel: string;
  dato?: string;
  beskrivelse?: string;
  fullfort?: boolean;
};

function parseMilepaeler(json: unknown): Milepael[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null)
    .map((m) => ({
      tittel: typeof m.tittel === "string" ? m.tittel : "",
      dato: typeof m.dato === "string" ? m.dato : undefined,
      beskrivelse: typeof m.beskrivelse === "string" ? m.beskrivelse : undefined,
      fullfort: typeof m.fullfort === "boolean" ? m.fullfort : false,
    }))
    .filter((m) => m.tittel.length > 0);
}

function formatDato(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });
}

export default async function MinPlanPage() {
  if (!FEATURES.TALENT) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const tracking = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
  });

  if (!tracking) {
    return (
      <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/talent">Talent</TilbakeLenke>
        <TalentIkkeIProgrammet />
      </V2Shell>
    );
  }

  const milepaelerRaa = parseMilepaeler(tracking.milepaeler);
  const nesteMalRaa = milepaelerRaa.find((m) => !m.fullfort);

  const iProgrammetSiden = tracking.inkludertFra.toLocaleDateString("nb-NO", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });

  const data: TalentMinPlanData = {
    niva: tracking.niva,
    status: [
      { label: "Nivå", value: tracking.niva },
      { label: "Klubb", value: tracking.klubb ?? "Ikke registrert" },
      { label: "Region", value: tracking.region ?? "Ikke registrert" },
      { label: "I programmet", value: iProgrammetSiden },
    ],
    akser: TALENT_AKSE_KEYS.map((k) => ({
      label: TALENT_AKSE_LABELS[k],
      verdi: tracking[k],
    })),
    nesteMal: nesteMalRaa
      ? {
          tittel: nesteMalRaa.tittel,
          beskrivelse: nesteMalRaa.beskrivelse ?? null,
          fristTekst: formatDato(nesteMalRaa.dato),
        }
      : null,
    milepaeler: milepaelerRaa.map((m) => ({
      tittel: m.tittel,
      datoTekst: formatDato(m.dato),
      beskrivelse: m.beskrivelse ?? null,
      fullfort: m.fullfort ?? false,
    })),
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/talent">Talent</TilbakeLenke>
      <TalentMinPlanV2 data={data} />
    </V2Shell>
  );
}
