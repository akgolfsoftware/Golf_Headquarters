/** Prøvefil for PH-RD-06 Registrer runde og PH-RD-06H Rediger hull for hull. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHRD06Etterregistrering, PHRD06Laster, PHRD06Rediger } from "@/components/portal/precision/PHRD06";

export const sti = "/portal/analysere";
export const natt = ["data-natt", "hull-natt"];

const baner = [{ id: "b1", name: "Fredrikstad Golfklubb med et langt banenavn som må brytes" }, { id: "b2", name: "Borregaard GK" }];
const siste = [{ dato: "20.09", bane: "Fredrikstad GK", slag: 76 }, { dato: "13.09", bane: "Borregaard GK", slag: 79 }];
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const pars = [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4];
const initial = pars.map((par, i) => ({ nr: i + 1, par, strokes: par + (i % 3 === 0 ? 1 : 0), putts: 2, fairway: par > 3 ? true : null, gir: false }));

export const tilstander = {
  data: <S><PHRD06Etterregistrering baner={baner} siste={siste} /></S>,
  "data-natt": <S><PHRD06Etterregistrering baner={baner} siste={siste} /></S>,
  tom: <S><PHRD06Etterregistrering baner={[]} siste={[]} /></S>,
  "tom-ingen-runder": <S><PHRD06Etterregistrering baner={baner} siste={[]} /></S>,
  laster: <S><PHRD06Laster /></S>,
  feil: <S><PHRD06Etterregistrering baner={baner} siste={siste} startFeil /></S>,
  hull: <S><PHRD06Rediger roundId="r1" bane="Fredrikstad GK" datoTekst="20. september 2026" coursePar={72} initial={initial} /></S>,
  "hull-natt": <S><PHRD06Rediger roundId="r1" bane="Fredrikstad GK" datoTekst="20. september 2026" coursePar={72} initial={initial} /></S>,
  "hull-tom": <S><PHRD06Rediger roundId="r1" bane="Fredrikstad GK" datoTekst="20. september 2026" coursePar={72} initial={[]} /></S>,
  "hull-feil": <S><PHRD06Rediger roundId="r1" bane="Fredrikstad GK" datoTekst="20. september 2026" coursePar={72} initial={initial} startFeil="Kunne ikke lagre. Prøv igjen." /></S>,
};
