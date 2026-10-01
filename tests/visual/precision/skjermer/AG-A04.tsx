/** Prøvefil for AG-A04 Plan mot faktisk = Spiller 360 › Stats › Trening. Syntetiske data. */
import { S360, laster, feil } from "./_s360";
import { hodeTom, stats } from "./_s360-data";

export const sti = "/admin/spillere/u1";
export const tilstander = {
  data: <S360 fane="stats" faneData={{ fane: "stats", data: stats }} statsDel="tren" />,
  tom: <S360 fane="stats" hode={hodeTom} faneData={{ fane: "stats", data: { ...stats, trening: { ...stats.trening, planMotFaktisk: [], analyse: null, volumOmrader: [], volumUker: [], volumTotal: 0, korrelasjon: [] }, trackman: { koller: [], okter: [] } } }} statsDel="tren" />,
  laster,
  feil,
};
