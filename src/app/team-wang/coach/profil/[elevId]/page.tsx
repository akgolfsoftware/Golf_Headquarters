import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { medWangElevData } from "@/app/team-wang/_data/wang-tilgang";
import { byggKomplettProfil } from "@/lib/profil-kobling/komplett";
import { WangUnderside } from "@/components/wang/WangUnderside";
import { wangHref } from "@/components/wang/wang-felles";
import { WangElevTopp } from "@/components/wang/WangElevTopp";
import { WangElevprofil } from "@/components/wang/WangElevprofil";
import { byggProfilVisning, type ProfilVisning } from "@/lib/profil-kobling/visning";

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
    const v = byggProfilVisning({ relasjon: kanSeGolfId ? "ORG_TRENER" : "SELV", ...profil });
    const erTrener = bruker.role === "COACH" || bruker.role === "ADMIN";
    const enc = encodeURIComponent(elevId);
    const golfId = v.identitet.find((f) => f.etikett === "Golf-ID")?.verdi;
    return (
      <>
        <WangElevTopp
          tilbake={{ href: wangHref("elever", "elev", elevId), tekst: "Elever" }}
          navn={profil.navn}
          undertekst={golfId ? `WANG Golf · Golf-ID ${golfId}` : "WANG Golf"}
          tall={toppTall(v)}
          handlinger={erTrener ? [
            { tekst: "Åpne IUP-samtale", href: `/team-wang/coach/iup/${enc}`, primar: true },
            // Trenerforslaget vises bare for COACH på IUP-siden.
            ...(bruker.role === "COACH" ? [{ tekst: "Foreslå endring", href: `/team-wang/coach/iup/${enc}#forslag` }] : []),
          ] : []}
        />
        <WangElevprofil
          v={v}
          sg={[
            { navn: "Utslag", verdi: profil.runder.sgOtt },
            { navn: "Innspill", verdi: profil.runder.sgApp },
            { navn: "Nærspill", verdi: profil.runder.sgArg },
            { navn: "Putting", verdi: profil.runder.sgPutt },
          ]}
          lenker={{
            turneringer: `/team-wang/coach/turneringer/${enc}`,
            tester: erTrener ? wangHref("tester") : undefined,
            iup: erTrener ? `/team-wang/coach/iup/${enc}` : undefined,
          }}
        />
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

/**
 * De fire tallene i toppfeltet: født, turneringsstarter, beste plass i år og SG totalt. Regnes av den ferdige
 * visningen, så tallene er de samme som i listene under. Mangler et tall, står «—».
 */
function toppTall(v: ProfilVisning): { verdi: string; tekst: string }[] {
  const iAar = Number(new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/Oslo" }).format(new Date()));
  const plasser = (v.resultater.aar.find((a) => a.aar === iAar)?.rader ?? [])
    .map((r) => Number.parseInt(r.plass.replace(/^T/, ""), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  const starter = v.resultater.aar.reduce((sum, a) => sum + a.rader.length, 0);
  return [
    { verdi: v.identitet.find((f) => f.etikett === "Født")?.verdi ?? "—", tekst: "født" },
    { verdi: String(starter), tekst: "turneringsstarter" },
    { verdi: plasser.length ? `${Math.min(...plasser)}.` : "—", tekst: "beste plass i år" },
    { verdi: v.runder.tall.find((t) => t.etikett === "SG totalt")?.verdi ?? "—", tekst: "SG totalt" },
  ];
}
