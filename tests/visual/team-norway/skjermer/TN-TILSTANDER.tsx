/** Prøvefil for tom, laster og feil i Team Norway (utkast 2, «Tilstander»). Syntetiske data. */
import { TnFeilkort, TnLasterSkjerm, TnProvIgjen, TnSkallSkjelett, TnTomtilstand, type TnLasterForm } from "@/components/team-norway/tn-tilstand";
import { TnFlate } from "@/components/team-norway/tn-flate";

export const sti = "/team-norway";

const FORMER: TnLasterForm[] = ["hjem", "liste", "iup", "kort", "tabell", "plan"];

export const tilstander = {
  ...Object.fromEntries(FORMER.map((form) => [`laster-${form}`, <TnSkallSkjelett key={form}><TnLasterSkjerm form={form} tekst="Henter tallene …" /></TnSkallSkjelett>])),
  tom: (
    <TnSkallSkjelett>
      <TnTomtilstand tittel="Ingen tester ennå" tekst="Jørn Johnsen har ikke tatt noen tester ennå. Første fellestesting står i Samlinger." />
      <TnFlate>
        <TnTomtilstand innfelt tittel="Ingen dokumenter" tekst="Last opp sesongplan, uttakskriterier og reiseinfo, så finner spillerne alt på ett sted." />
      </TnFlate>
    </TnSkallSkjelett>
  ),
  feil: <TnSkallSkjelett><TnFeilkort tittel="Testene kunne ikke hentes" handling={<TnProvIgjen onClick={() => {}} />} /></TnSkallSkjelett>,
};
