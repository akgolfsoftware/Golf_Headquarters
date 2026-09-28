import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WG-04 Prøveplan. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/elever/proveplan */
export default async function WangEleverProveplanSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WG-04" />;
}
