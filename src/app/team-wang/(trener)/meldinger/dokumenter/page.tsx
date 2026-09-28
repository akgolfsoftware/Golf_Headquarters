import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-21 Dokumenter. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/meldinger/dokumenter */
export default async function WangMeldingerDokumenterSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-21" />;
}
