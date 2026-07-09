/**
 * v2-forhåndsvisning — PlayerHQ Coach-hub (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), CoachHubV2 rendrer innholds-stacken.
 *
 * Auth + dataloadere gjenbrukes 1:1 fra den ekte /portal/coach-siden:
 * getCoachProfile + getMessages + getUpcomingSessions + getCoachNotes.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  getCoachProfile,
  getMessages,
  getUpcomingSessions,
  getCoachNotes,
} from "@/app/portal/(legacy)/coach/actions";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { CoachHubV2, type CoachHubData } from "@/components/portal/v2/CoachHubV2";

export const dynamic = "force-dynamic";

export default async function V2CoachPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const coach = await getCoachProfile();

  const [messages, upcoming, notes] = await Promise.all([
    coach ? getMessages(coach.id) : Promise.resolve([]),
    getUpcomingSessions(),
    getCoachNotes(),
  ]);

  const data: CoachHubData = {
    coach: coach ? { id: coach.id, name: coach.name, initials: coach.initials, avatarUrl: coach.avatarUrl } : null,
    meFornavn: user.name.split(" ")[0] ?? "Deg",
    fokus: notes.length > 0 ? { title: notes[0].title, content: notes[0].content } : null,
    meldinger: messages.map((m) => ({ id: m.id, role: m.role, body: m.body, ts: m.ts })),
    kommende: upcoming.map((s) => ({
      id: s.id,
      title: s.title,
      startAt: s.startAt,
      endAt: s.endAt,
      locationName: s.locationName,
      status: s.status,
    })),
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl ?? undefined}>
      <CoachHubV2 data={data} />
    </V2Shell>
  );
}
