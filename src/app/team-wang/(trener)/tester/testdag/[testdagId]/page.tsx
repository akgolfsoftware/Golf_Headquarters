import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-08 Testdag. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/tester/testdag/[testdagId] */
export default async function WangTesterTestdagTestdagidSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-08" />;
}
