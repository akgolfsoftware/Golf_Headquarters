import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { medWangElevData } from "@/app/team-wang/_data/wang-tilgang";
import { byggKomplettProfil } from "@/lib/profil-kobling/komplett";
import { WangUnderside } from "@/components/wang/WangUnderside";
import { WangTilbake, WangTopp, wangHref } from "@/components/wang/wang-felles";
import { KomplettProfilWang } from "@/components/profil/KomplettProfilWang";
import { byggProfilVisning } from "@/lib/profil-kobling/visning";

/**
 * Komplett profil for én WANG-elev: offisielle resultater, tester og IUP. Samme data som AgencyOS og
 * Team Norway, uten kopi. Tilgang som resten av elevsidene (`medWangElevData`): treneren trenger aktuell
 * navngitt deling, og lesingen skjer under delingslåsen. Golf-ID bare for trenere.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Elevprofil — WANG Toppidrett",
  robots: { index: false, follow: false },
};

export default async function WangElevProfilPage({ params }: { params: Promise<{ elevId: string }> }) {
  const { elevId } = await params;

  const bruker = await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH", "PLAYER", "PARENT"],
    redirectTo: `/team-wang/logg-inn?next=${encodeURIComponent(`/team-wang/coach/profil/${encodeURIComponent(elevId)}`)}`,
    kreverTilgang: "INGEN",
  });

  const visning = await medWangElevData(bruker, elevId, async (tx) => {
    const kanSeGolfId = (bruker.role === "COACH" || bruker.role === "ADMIN") && bruker.id !== elevId;
    const profil = await byggKomplettProfil(tx, elevId, { kanSeGolfId });
    return (
      <>
        <WangTilbake href={wangHref("elever", "elev", elevId)} tekst={profil.navn} />
        <WangTopp dato={profil.navn} tittel="Elevprofil" />
        <KomplettProfilWang v={byggProfilVisning({ relasjon: kanSeGolfId ? "ORG_TRENER" : "SELV", ...profil })} />
      </>
    );
  });
  if (visning === null) notFound();
  return (
    <WangUnderside bruker={bruker} omraade="elever">
      {visning}
    </WangUnderside>
  );
}
