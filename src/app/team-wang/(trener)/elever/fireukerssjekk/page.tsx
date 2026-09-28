import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-45 Fireukerssjekk. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/elever/fireukerssjekk */
export default async function WangEleverFireukerssjekkSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-45" />;
}
