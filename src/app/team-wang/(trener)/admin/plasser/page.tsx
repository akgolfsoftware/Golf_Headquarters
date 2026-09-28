import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-32 Plasser. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/admin/plasser */
export default async function WangAdminPlasserSide() {
  await krevWangSportssjef();
  return <WangIkkeBygget skjermId="WANG-32" />;
}
