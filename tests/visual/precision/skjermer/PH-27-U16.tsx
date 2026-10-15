/** Prøvefil for PH-27 Deling under 16 i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH27Deling, type PH27Data } from "@/components/portal/precision/PH27Deling";
import { PH24MegFeil, PH24MegLaster } from "@/components/portal/precision/PH24MegTilstand";

export const sti = "/portal/meg/innstillinger/personvern/deling";

const data: PH27Data = {
  organisasjoner: [{ gruppeId: "w", navn: "WANG Ung Fredrikstad", testerOgResultater: false, komplettProfil: false }],
  coach: { navn: "Anders Kristiansen", program: "AK Golf Junior Academy" },
  navngitte: [], foreldre: 1, krevesForesatt: true,
  venter: { dagerIgjen: 4, frist: "9. oktober", opprettet: "2. oktober" },
};
const godkjent: PH27Data = { ...data, venter: null, organisasjoner: [{ gruppeId: "w", navn: "WANG Ung Fredrikstad", testerOgResultater: true, komplettProfil: false }] };
const sett = async () => ({ ok: true as const });
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH27Deling data={data} settSamtykke={sett} /></Skall>,
  "forelder-godkjent": <Skall><PH27Deling data={godkjent} settSamtykke={sett} /></Skall>,
  laster: <Skall><PH24MegLaster /></Skall>,
  feil: <Skall><PH24MegFeil tittel="Delingen kunne ikke hentes" /></Skall>,
};
