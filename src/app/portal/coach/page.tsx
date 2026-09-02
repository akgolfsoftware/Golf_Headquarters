import { TL } from "@/lib/v2/train-lock";
/**
 * v2-forhåndsvisning — PlayerHQ Coach-hub (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), CoachHubV2 rendrer innholds-stacken.
 *
 * Auth + dataloadere gjenbrukes 1:1 fra den ekte /portal/coach-siden:
 * getCoachProfile + getMessages + getUpcomingSessions + getCoachNotes.
 */

import Link from "next/link";
import { erCoachetSpiller } from "@/lib/auth/coached";
import { Kort, TomTilstand, Knapp, TilbakeLenke } from "@/components/v2";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getCoachProfile, getMessages, getUpcomingSessions, getCoachNotes } from "@/app/portal/(legacy)/coach/actions";
import { getTilbakemeldingerListe } from "@/lib/portal-okt/coach-tilbakemelding-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { CoachHubV2, type CoachHubData } from "@/components/portal/v2/CoachHubV2";

export const dynamic = "force-dynamic";

export default async function V2CoachPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  // I0 (LÅST regel): selvbetjent spiller (kun abonnement) har ingen
  // coachrelasjon — vis oppsalgs-flate i stedet for coach-hubben (aldri blindgate).
  if (!(await erCoachetSpiller(user.id))) {
    return (
      <V2Shell bredde="kolonne" aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/meg">Meg</TilbakeLenke>
        <Kort tint>
          <TomTilstand
            icon="users"
            title="Coach følger med her — når du er med i AK Golf Academy"
            sub="Med en coaching-pakke (Performance eller Performance Pro) eller plass i en AK-gruppe får du egen coach, ukeplaner laget for deg og direkte meldinger her."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <Link href="/portal/booking" style={{ textDecoration: "none" }}>
              <Knapp icon="calendar-check">Book en prøvetime</Knapp>
            </Link>
          </div>
        </Kort>
        <Kort>
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.6 }}>
            Du mister ingenting ved å vente. Alt du logger nå — økter, runder og tester — er der den dagen du får coach.
          </p>
        </Kort>
      </V2Shell>
    );
  }

  const coach = await getCoachProfile();

  const [messages, upcoming, notes, tilbakemeldinger] = await Promise.all([
    coach ? getMessages(coach.id) : Promise.resolve([]),
    getUpcomingSessions(),
    getCoachNotes(),
    getTilbakemeldingerListe(user.id),
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
    tilbakemeldingerCount: tilbakemeldinger.length,
  };

  return (
    <V2Shell bredde="kolonne" aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl ?? undefined}>
      <TilbakeLenke href="/portal/meg">Meg</TilbakeLenke>
      <CoachHubV2 data={data} />
    </V2Shell>
  );
}
