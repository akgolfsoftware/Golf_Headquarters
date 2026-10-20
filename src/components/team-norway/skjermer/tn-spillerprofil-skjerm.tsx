import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerAksefordeling, hentTnSpillerIup, hentTnSpillerLisens, hentTnSpillerProfil, hentTnSpillerstatuser, hentTnSpillerTester, hentTnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { osloDag } from "./felles";
import { TnSpillerprofilVisning } from "./tn-spillerprofil-visning";

export async function TnSpillerprofilSkjerm({ spillerId }: { spillerId: string }) {
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) notFound();
  const { kontekst } = tilgang;
  const aar = osloDag(new Date()).aar;

  const [profil, tester, lisens, statuser, iup, akser] = await Promise.all([
    hentTnSpillerProfil(bruker, spillerId, aar),
    hentTnSpillerTester(bruker, spillerId),
    kontekst.kanAdministrere ? hentTnSpillerLisens(bruker, spillerId) : Promise.resolve(null),
    hentTnSpillerstatuser(bruker, kontekst, aar),
    hentTnSpillerIup(bruker, spillerId),
    hentTnSpillerAksefordeling(bruker, spillerId),
  ]);
  if (!profil) notFound();
  return <TnSpillerprofilVisning brukerNavn={bruker.name} kontekst={kontekst} spillerId={spillerId} aar={aar} naa={new Date()} profil={profil} tester={tester} lisens={lisens} reg={statuser.get(spillerId) ?? null} iup={iup} akser={akser} />;
}

