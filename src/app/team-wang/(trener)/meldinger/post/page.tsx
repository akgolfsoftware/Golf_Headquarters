import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-14 Post til elev. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/meldinger/post */
export default async function WangMeldingerPostSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-14" />;
}
