import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerAksefordeling, hentTnSpillerIup, hentTnSpillerLisens, hentTnSpillerProfil, hentTnSpillerstatuser, hentTnSpillerTester, hentTnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { hentTnIupDelt, hentTnIupLaast } from "@/lib/domain/tn-iup-oversikt";
import { hentSpillerpostTidslinje } from "@/lib/domain/tn-post";
import { osloDag } from "./felles";
import { TnIupLaastVisning } from "./tn-iup-laast-visning";
import { TnSpillerprofilVisning } from "./tn-spillerprofil-visning";

export async function TnSpillerprofilSkjerm({ spillerId }: { spillerId: string }) {
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  const aar = osloDag(new Date()).aar;
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) {
    // Spiller i gruppa uten deling: låst IUP med navn og WAGR-plass. Alle andre: 404.
    const laast = await hentTnIupLaast(bruker, spillerId);
    if (!laast) notFound();
    return <TnIupLaastVisning brukerNavn={bruker.name} kontekst={laast.kontekst} navn={laast.navn} wagr={laast.wagr} aar={aar} />;
  }
  const { kontekst } = tilgang;

  const [profil, tester, lisens, statuser, iup, akser, delt, poster] = await Promise.all([
    hentTnSpillerProfil(bruker, spillerId, aar),
    hentTnSpillerTester(bruker, spillerId),
    kontekst.kanAdministrere ? hentTnSpillerLisens(bruker, spillerId) : Promise.resolve(null),
    hentTnSpillerstatuser(bruker, kontekst, aar),
    hentTnSpillerIup(bruker, spillerId),
    hentTnSpillerAksefordeling(bruker, spillerId),
    hentTnIupDelt(bruker, spillerId),
    hentSpillerpostTidslinje(spillerId, bruker.id),
  ]);
  if (!profil) notFound();
  return (
    <TnSpillerprofilVisning
      brukerNavn={bruker.name}
      kontekst={kontekst}
      spillerId={spillerId}
      aar={aar}
      naa={new Date()}
      profil={profil}
      tester={tester}
      lisens={lisens}
      reg={statuser.get(spillerId) ?? null}
      iup={iup}
      akser={akser}
      delt={delt}
      poster={poster?.map((p) => ({ id: p.id, tekst: p.tekst, authorNavn: p.authorNavn, createdAt: p.createdAt, kvittering: p.kvittering ? { totalt: p.kvittering.totalt, apnet: p.kvittering.apnet } : null })) ?? null}
    />
  );
}
