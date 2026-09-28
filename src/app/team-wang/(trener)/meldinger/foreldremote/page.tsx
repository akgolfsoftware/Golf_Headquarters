import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-15 Foreldremøte. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/meldinger/foreldremote */
export default async function WangMeldingerForeldremoteSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-15" />;
}
