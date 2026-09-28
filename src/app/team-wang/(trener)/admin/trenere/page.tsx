import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-19 Trenere og roller. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/admin/trenere */
export default async function WangAdminTrenereSide() {
  await krevWangSportssjef();
  return <WangIkkeBygget skjermId="WANG-19" />;
}
