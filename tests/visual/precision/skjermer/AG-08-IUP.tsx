/** Prøvefil for AG-08-IUP Spiller 360 › IUP (WANG/Team Norway-spiller). Syntetiske data. */
import { S360, laster, feil } from "./_s360";
import { hode, hodeTom, iup, iupTom } from "./_s360-data";

export const sti = "/admin/spillere/u1";
const wang = { ...hode, tilhorighet: "WANG · TEAM NORWAY" };
export const tilstander = {
  data: <S360 fane="iup" hode={wang} faneData={{ fane: "iup", data: iup }} />,
  tom: <S360 tilstand="tom" hode={hodeTom} fane="iup" faneData={{ fane: "iup", data: iupTom }} />,
  laster,
  feil,
};
