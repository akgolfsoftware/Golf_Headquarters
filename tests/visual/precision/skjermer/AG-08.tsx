/** Prøvefil for AG-08 Spiller 360 (landing = Plan-fanen). Syntetiske data. */
import { S360, laster, feil } from "./_s360";
import { hodeTom, planTom, rail, samtaler, tp } from "./_s360-data";

export const sti = "/admin/spillere/u1";
export const tilstander = {
  data: <S360 />,
  arbeidsvisning: <S360 rail={rail} />,
  tp: <S360 fane="tp" faneData={{ fane: "tp", data: tp }} />,
  samtaler: <S360 fane="samtaler" faneData={{ fane: "samtaler", data: samtaler }} />,
  tom: <S360 tilstand="tom" hode={hodeTom} faneData={{ fane: "plan", data: planTom }} />,
  laster,
  feil,
};
