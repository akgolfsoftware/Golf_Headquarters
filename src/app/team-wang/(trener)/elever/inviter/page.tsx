import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-20 Inviter elev. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/elever/inviter */
export default async function WangEleverInviterSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-20" />;
}
