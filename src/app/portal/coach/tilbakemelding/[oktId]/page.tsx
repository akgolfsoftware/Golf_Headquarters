// PH-21 Tilbakemelding — Precision Athletics, pakke 11 og 12 (utkast booking-meldinger.html, godkjent 16.10.2026).
/**
 * PlayerHQ · Coach-tilbakemelding etter økt (/portal/coach/tilbakemelding/[oktId]).
 * Data og handlinger er uendret: getCoachTilbakemeldingData, kvitterTilbakemelding og
 * sendTilbakemeldingSvar (actions.ts). Video er en modul i flaten, ikke egen rute.
 */

import { redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erCoachetSpiller } from "@/lib/auth/coached";
import { getCoachTilbakemeldingData } from "@/lib/portal-okt/coach-tilbakemelding-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Tilbakemelding } from "@/components/portal/precision/PH21Tilbakemelding";
import { getUnreadNotifications } from "@/app/portal/actions";

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
  const [data, uleste] = await Promise.all([
    getCoachTilbakemeldingData({ id: user.id, role: user.role }, oktId),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH21Tilbakemelding data={data} />
    </PlayerHQSkall>
  );
}
