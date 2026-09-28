import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-11 Turneringsdetalj. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/konkurranse/turnering/[turneringId] */
export default async function WangKonkurranseTurneringTurneringidSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-11" />;
}
