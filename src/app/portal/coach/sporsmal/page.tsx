// PH21Sporsmalsliste — Precision Athletics. Data og handlinger er beholdt.
// Spiller ser PH-21-innboksen på Spørsmål-fanen. Coach og admin ser oversikten
// over spillerspørsmål (egne spillere + åpen kø), slik ruten var før PR #1158.
import { redirect } from "next/navigation";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TilbakeLenke } from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { sporsmalListeFilter } from "@/lib/portal-okt/coach-sporsmal-tilgang";
import { prisma } from "@/lib/prisma";
import { getPH21Data } from "@/lib/portal-coach/ph21-queries";
import { PH21Innboks } from "@/components/portal/precision/PH21Innboks";
import { CoachQAV2, type CoachSporsmal } from "@/components/portal/v2/CoachQAV2";

export const dynamic = "force-dynamic";

type PortalBruker = Awaited<ReturnType<typeof requirePortalUser>>;

function formatDatoTid(d: Date): string {
  return d.toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
}

async function hentCoachSporsmal(user: PortalBruker): Promise<CoachSporsmal[]> {
  const egneSpillere =
    user.role === "ADMIN"
      ? []
      : await prisma.user.findMany({
          where: coachScopedPlayerWhere(user),
          select: { id: true },
        });
  const questions = await prisma.question.findMany({
    where: sporsmalListeFilter({
      viewerId: user.id,
      viewerRole: user.role,
      coachedPlayerIds: egneSpillere.map((spiller) => spiller.id),
    }),
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const askerNavn = new Map<string, string>();
  const askerIds = [...new Set(questions.map((q) => q.askerUserId))];
  if (askerIds.length > 0) {
    const askere = await prisma.user.findMany({
      where: { id: { in: askerIds } },
      select: { id: true, name: true },
    });
    for (const a of askere) askerNavn.set(a.id, a.name);
  }

  return questions.map((q) => ({
    id: q.id,
    navn: askerNavn.get(q.askerUserId) ?? "Ukjent spiller",
    tittel: q.title,
    besvart: q.status === "ANSWERED",
    tid: formatDatoTid(q.createdAt),
  }));
}

export default async function CoachSporsmalPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  if (user.role === "COACH" || user.role === "ADMIN") {
    const sporsmal = await hentCoachSporsmal(user);
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
        <div className="pa-side">
          <TilbakeLenke href="/portal/coach">Coach</TilbakeLenke>
          <CoachQAV2 data={{ sporsmal }} />
        </div>
      </PlayerHQSkall>
    );
  }

  const data = await getPH21Data(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <PH21Innboks data={data} initialTab="q" />
      </div>
    </PlayerHQSkall>
  );
}
