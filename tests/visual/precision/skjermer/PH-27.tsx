/** Prøvefil for PH-27 Deling i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH27Deling, type PH27Data } from "@/components/portal/precision/PH27Deling";
import { PH24MegFeil, PH24MegLaster } from "@/components/portal/precision/PH24MegTilstand";

export const sti = "/portal/meg/innstillinger/personvern/deling";

const data: PH27Data = {
  organisasjoner: [
    { gruppeId: "w", navn: "WANG Toppidrett Fredrikstad", testerOgResultater: true, komplettProfil: true },
    { gruppeId: "t", navn: "Team Norway Golf", testerOgResultater: true, komplettProfil: false },
  ],
  coach: { navn: "Anders Kristiansen", program: "AK Golf Academy" },
  navngitte: [
    { id: "n1", epost: "kari.nordvik@wang.no", gruppeNavn: "WANG Toppidrett Fredrikstad", status: "AKTIV", dato: "18. august" },
    { id: "n2", epost: "eva.lund.med.et.langt.navn@wang.no", gruppeNavn: "WANG Toppidrett Fredrikstad", status: "VENTER", dato: "9. oktober" },
  ],
  foreldre: 1, krevesForesatt: false, venter: null,
};
const tom: PH27Data = { organisasjoner: [], coach: null, navngitte: [], foreldre: 0, krevesForesatt: false, venter: null };
const sett = async () => ({ ok: true as const });
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH27Deling data={data} settSamtykke={sett} /></Skall>,
  tom: <Skall><PH27Deling data={tom} settSamtykke={sett} /></Skall>,
  laster: <Skall><PH24MegLaster /></Skall>,
  feil: <Skall><PH24MegFeil tittel="Delingen kunne ikke hentes" /></Skall>,
};
