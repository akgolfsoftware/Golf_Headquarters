/** Prøvefil for «Se hva Team Norway ser» og lenken på Del med trener (Team Norway-spiller). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { NavngittDeling } from "@/components/portal/precision/navngitt-deling";
import { TnInnsynLenke } from "@/components/portal/precision/TnInnsynLenke";
import { TnInnsynSpiller } from "@/components/portal/precision/TnInnsynSpiller";

export const sti = "/portal/meg/deling/team-norway";

const tn = [{ id: "tn", navn: "Team Norway Golf" }];
const deling = {
  spiller: { id: "s", name: "Syntetisk spiller" }, foresattVisning: false, kanGi: true,
  grupper: [{ id: "tn", navn: "Team Norway Golf", domene: "golfforbundet.no" }], nesteSide: null, invitasjoner: [],
} as unknown as React.ComponentProps<typeof NavngittDeling>["initial"];
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const data = { grupper: tn, navn: "Syntetisk spiller med et langt etternavn", klubb: "Klubb 2", fodselsaar: 2009, wagrPlass: 1240, trenere: ["trener.en@golfforbundet.no"] };

export const tilstander = {
  delt: <Skall><TnInnsynSpiller data={data} /></Skall>,
  "ikke-delt": <Skall><TnInnsynSpiller data={{ ...data, klubb: null, fodselsaar: null, wagrPlass: null, trenere: [] }} /></Skall>,
  lenke: <Skall><NavngittDeling initial={deling} skra ekstra={<TnInnsynLenke tnGrupper={tn} />} /></Skall>,
};
