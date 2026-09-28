import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-27 Golfstatistikk. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/konkurranse/statistikk */
export default async function WangKonkurranseStatistikkSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-27" />;
}
