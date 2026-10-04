// PH21TbOkt — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * PlayerHQ · Coach-tilbakemelding etter økt (Paper W3, konsolidert flate).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-coach-tilbakemelding.html
 *
 * Erstatter på sikt notat/video/oppsummering-spredningen (manifest-w3
 * §Konsolidering) — video er en modul i flaten. Eksisterende ruter står
 * urørt; redirect-konsolideringen er en egen C4-beslutning.
 *
 * Avvik:
 *   - Flaten er montert i PlayerHQSkall. Innholdet er fortsatt CoachTilbakemeldingV2. Ikke målt i appen.
 */

import { redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erCoachetSpiller } from "@/lib/auth/coached";
import { getCoachTilbakemeldingData } from "@/lib/portal-okt/coach-tilbakemelding-data";
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
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <CoachTilbakemeldingV2 data={data} />
    </div>
    </PlayerHQSkall>
  );
}
