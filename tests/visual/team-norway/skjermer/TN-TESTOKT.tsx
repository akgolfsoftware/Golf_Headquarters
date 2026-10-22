/** Prøvefil for testøkta uten testdag (utkast 3, «Start test» og «Ferdig med løpet»). Syntetiske data. */
import { TnTestoktFerdigVisning, TnTestoktStartVisning } from "@/components/team-norway/skjermer/tn-testokt-visning";
import type { TnArbeidskontekst, TnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { testoktUtvalg } from "@/lib/portal-tester/tn-testokt";

export const sti = "/team-norway/spiller/b/testokt";

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const tilgang: TnSpillerTilgang = { kontekst, spillerId: "b", spillerNavn: "Jørn Johnsen" };
const utvalg = testoktUtvalg(new Map([["wedge-variation", 1], ["8-ball-variation", 1], ["driver-basic", 1], ["inspill-basic", 2]]), () => true);

export const tilstander = {
  start: <TnTestoktStartVisning brukerNavn="Eva Lie" spillerId="b" tilgang={tilgang} utvalg={utvalg} />,
  "start-feil": <TnTestoktStartVisning brukerNavn="Eva Lie" spillerId="b" tilgang={tilgang} utvalg={utvalg} feil="Velg minst én test treneren kan føre." />,
  ferdig: (
    <TnTestoktFerdigVisning brukerNavn="Eva Lie" spillerId="b" tilgang={tilgang} tester={[
      { navn: "Wedge Variation", status: "COMPLETED", resultat: "5,1 %", href: "/team-norway/spiller/b/tester/a" },
      { navn: "8-ball variation", status: "COMPLETED", resultat: "21 p", href: "/team-norway/spiller/b/tester/b" },
      { navn: "Wedge Gate", status: "IN_PROGRESS", resultat: null, href: "/team-norway/spiller/b/testokt?t=x&steg=2" },
      { navn: "Driver Gate", status: "IKKE_STARTET", resultat: null, href: "/team-norway/spiller/b/testokt?t=x&steg=3" },
    ]} />
  ),
};
