/** Prøvefil for PH-RD-09 Rediger hull for hull (/portal/mal/runder/[id]/hull). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHRD09RedigerHull } from "@/components/portal/precision/PHRD09RedigerHull";
import { RunderFeil } from "@/components/portal/precision/PHRunderFelles";
import { RunderLaster } from "@/components/portal/precision/PHRunderLaster";

export const sti = "/portal/mal/runder/syn-1/hull";

const PAR = [4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 3, 4, 4, 5];
const SLAG = [4, 3, 6, 5, 4, 3, 5, 5, 4, 4, 2, 5, 5, 4, 4, 4, 5, 5];
const hull = PAR.map((par, i) => ({ nr: i + 1, par, strokes: SLAG[i], putts: i < 12 ? 2 : null, fairway: par === 3 ? null : i % 3 !== 0, gir: i < 12 ? i % 2 === 0 : null }));
const Vis = ({ initial }: { initial: typeof hull }) => (
  <PlayerHQSkall innboksHref="#" uleste={0}>
    <PHRD09RedigerHull roundId="syn-1" baneNavn="Fredrikstad GK" dato="4. oktober 2026" coursePar={72} initial={initial} />
  </PlayerHQSkall>
);

export const tilstander = {
  data: <Vis initial={hull} />,
  tom: <Vis initial={[]} />,
  laster: <PlayerHQSkall innboksHref="#" uleste={0}><RunderLaster tekst="Henter runden" /></PlayerHQSkall>,
  feil: <PlayerHQSkall innboksHref="#" uleste={0}><div className="phn"><RunderFeil tittel="Runden kunne ikke hentes" tekst="Runden er ikke endret. Prøv igjen om litt." href="/portal/mal/runder" /></div></PlayerHQSkall>,
};
