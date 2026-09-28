import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-26 Timeplanføring. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/admin/timeplan */
export default async function WangAdminTimeplanSide() {
  await krevWangSportssjef();
  return <WangIkkeBygget skjermId="WANG-26" />;
}
