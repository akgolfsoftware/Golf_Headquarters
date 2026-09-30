/**
 * PH-21 Innboks · Tilbakemelding (/portal/coach/tilbakemelding) i Precision Athletics.
 * Én rad per økt med skrevet coach-tilbakemelding; åpner detaljsiden.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erCoachetSpiller } from "@/lib/auth/coached";
import { getTilbakemeldingerListe } from "@/lib/portal-okt/coach-tilbakemelding-data";
import { innboksKontekst } from "@/lib/portal-okt/innboks-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Ramme, PH21Tilbakemeldinger } from "@/components/portal/precision/PH21Innboks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tilbakemeldinger · PlayerHQ" };

export default async function TilbakemeldingerListePage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PLAYER" && !(await erCoachetSpiller(user.id))) redirect("/portal/coach");
  const [ctx, liste] = await Promise.all([innboksKontekst(user.id), getTilbakemeldingerListe(user.id)]);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ctx.uleste}>
      <PH21Ramme aktiv="fb" coachNavn={ctx.coachNavn}>
        <PH21Tilbakemeldinger liste={liste} />
      </PH21Ramme>
    </PlayerHQSkall>
  );
}
