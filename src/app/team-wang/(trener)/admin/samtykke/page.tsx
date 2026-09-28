import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-34 Samtykkeoversikt. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/admin/samtykke */
export default async function WangAdminSamtykkeSide() {
  await krevWangSportssjef();
  return <WangIkkeBygget skjermId="WANG-34" />;
}
