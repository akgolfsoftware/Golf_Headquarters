/** Prøvefil for AG-08-PLAN Spiller 360 › Plan. Syntetiske data. */
import { S360, laster, feil } from "./_s360";
import { hodeTom, planTom } from "./_s360-data";

export const sti = "/admin/spillere/u1";
export const tilstander = {
  data: <S360 fane="plan" />,
  tom: <S360 tilstand="tom" hode={hodeTom} faneData={{ fane: "plan", data: planTom }} />,
  laster,
  feil,
};
