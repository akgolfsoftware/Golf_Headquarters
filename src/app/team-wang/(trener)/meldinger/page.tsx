import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-13 Gruppeposter. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/meldinger */
export default async function WangMeldingerSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-13" />;
}
