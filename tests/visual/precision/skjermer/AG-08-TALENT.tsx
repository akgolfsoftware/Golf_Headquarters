/** Prøvefil for AG-08-TALENT Spiller 360 › Talent (bare coach). Syntetiske data. */
import { S360, laster, feil } from "./_s360";
import { hodeTom, talent, talentTom } from "./_s360-data";

export const sti = "/admin/spillere/u1";
export const tilstander = {
  data: <S360 fane="talent" faneData={{ fane: "talent", data: talent }} />,
  tom: <S360 tilstand="tom" hode={hodeTom} fane="talent" faneData={{ fane: "talent", data: talentTom }} />,
  laster,
  feil,
};
