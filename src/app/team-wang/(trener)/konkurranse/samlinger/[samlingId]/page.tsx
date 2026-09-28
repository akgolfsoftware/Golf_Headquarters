import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-09 Samlinger og uttak. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/konkurranse/samlinger/[samlingId] */
export default async function WangKonkurranseSamlingerSamlingidSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-09" />;
}
