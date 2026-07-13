/**
 * AgencyOS Gruppe-timeplan — v2. Ekte data fra prisma.groupSchedule (ingen
 * fabrikering). Server actions (opprettGruppeTrening/dupliserGruppeTime)
 * bevart 1:1 fra legacy via ../actions.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { GruppeTimeplanV2, type GruppeTimeplanV2Data } from "@/components/admin/v2/GruppeTimeplanV2";
import { opprettGruppeTrening, dupliserGruppeTime } from "../actions";

export const dynamic = "force-dynamic";

export default async function GruppeTimeplanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ focus?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;
  const { focus } = await searchParams;

  const gruppe = await prisma.group.findUnique({
    where: { id },
    select: { id: true, name: true, schedules: { orderBy: { startAt: "asc" } } },
  });

  if (!gruppe) notFound();
  const groupId = gruppe.id;

  const naa = new Date();
  const faste = gruppe.schedules.filter((s) => s.recurring && s.recurring !== "NONE");
  const kommende = gruppe.schedules.filter((s) => (!s.recurring || s.recurring === "NONE") && s.endAt >= naa);
  const tidligere = gruppe.schedules.filter((s) => (!s.recurring || s.recurring === "NONE") && s.endAt < naa);

  const toRad = (s: (typeof gruppe.schedules)[number]) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    startAt: s.startAt.toISOString(),
    endAt: s.endAt.toISOString(),
    location: s.location,
    recurring: s.recurring,
    maxParticipants: s.maxParticipants,
  });

  const data: GruppeTimeplanV2Data = {
    groupId: gruppe.id,
    navn: gruppe.name,
    totaltAntall: gruppe.schedules.length,
    faste: faste.map(toRad),
    kommende: kommende.map(toRad),
    tidligere: tidligere.map(toRad),
    focusId: focus ?? null,
  };

  async function opprettAction(formData: FormData): Promise<{ ok: true } | { ok: false; feil: string }> {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const dato = formData.get("dato") as string;
    const tid = formData.get("tid") as string;
    const varighetMin = parseInt(formData.get("varighetMin") as string);
    const location = formData.get("location") as string | null;
    const recurring = formData.get("recurring") as string;
    const maxParticipants = formData.get("maxParticipants") ? parseInt(formData.get("maxParticipants") as string) : null;

    const startAt = new Date(`${dato}T${tid}`);
    const endAt = new Date(startAt.getTime() + varighetMin * 60000);

    // Resultatet returneres til klienten så feil (ugyldig dato/tid, DB) vises ved skjemaet.
    return opprettGruppeTrening(groupId, {
      title,
      description: description || undefined,
      startAt,
      endAt,
      location: location || undefined,
      recurring,
      maxParticipants: maxParticipants || undefined,
    });
  }

  async function dupliserAction(scheduleId: string, newStart: string) {
    "use server";
    await dupliserGruppeTime(groupId, scheduleId, newStart);
  }

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <GruppeTimeplanV2 data={data} onOpprett={opprettAction} onDupliser={dupliserAction} />
    </V2Shell>
  );
}
