import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-10 Turneringer. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/konkurranse */
export default async function WangKonkurranseSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-10" />;
}
