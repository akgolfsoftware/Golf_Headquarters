import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-46 Forslag til elev. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/elever/forslag */
export default async function WangEleverForslagSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-46" />;
}
