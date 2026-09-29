/** Prøvefil for AG-08-IUP-AK Spiller 360 › IUP for AK-spiller uten WANG/Team Norway. Syntetiske data. */
import { S360, laster, feil } from "./_s360";
import { hodeTom, iupAk, iupTom } from "./_s360-data";

export const sti = "/admin/spillere/u1";
export const tilstander = {
  data: <S360 fane="iup" faneData={{ fane: "iup", data: iupAk }} />,
  tom: <S360 tilstand="tom" hode={hodeTom} fane="iup" faneData={{ fane: "iup", data: { ...iupTom, ak: true } }} />,
  laster,
  feil,
};
