/** Prøvefil for AG-A02 Spilleranalyse samlet = Spiller 360 › Stats. Syntetiske data. */
import { S360, laster, feil } from "./_s360";
import { hodeTom, stats, tester } from "./_s360-data";

export const sti = "/admin/spillere/u1";
const s = (del: string) => <S360 fane="stats" faneData={{ fane: "stats", data: stats }} statsDel={del} />;
export const tilstander = {
  data: s("sg"),
  snittscore: s("snitt"),
  tester: s("test"),
  testfane: <S360 fane="test" faneData={{ fane: "test", data: tester }} />,
  tom: <S360 tilstand="tom" hode={hodeTom} fane="stats" faneData={{ fane: "stats", data: stats }} />,
  laster,
  feil,
};
