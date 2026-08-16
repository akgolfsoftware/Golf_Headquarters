/**
 * PlayerHQ · Coach-tilbakemelding etter økt (Paper W3, konsolidert flate).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-coach-tilbakemelding.html
 *
 * Erstatter på sikt notat/video/oppsummering-spredningen (manifest-w3
 * §Konsolidering) — video er en modul i flaten. Eksisterende ruter står
 * urørt; redirect-konsolideringen er en egen C4-beslutning.
 */

import { redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erCoachetSpiller } from "@/lib/auth/coached";
import { getCoachTilbakemeldingData } from "@/lib/portal-okt/coach-tilbakemelding-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { CoachTilbakemeldingV2 } from "@/components/portal/v2/CoachTilbakemeldingV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tilbakemelding · PlayerHQ" };

export default async function CoachTilbakemeldingPage({
  params,
}: {
  params: Promise<{ oktId: string }>;
}) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  // I0 (LÅST regel): selvbetjent spiller har ingen coachrelasjon — coach-hubben
  // viser oppsalgs-flaten, så dyplenker hit sendes dit (aldri blindgate).
  if (user.role === "PLAYER" && !(await erCoachetSpiller(user.id))) {
    redirect("/portal/coach");
  }

  const { oktId } = await params;
  const data = await getCoachTilbakemeldingData({ id: user.id, role: user.role }, oktId);

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="meg"
      nav={PLAYERHQ_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <CoachTilbakemeldingV2 data={data} />
    </V2Shell>
  );
}
