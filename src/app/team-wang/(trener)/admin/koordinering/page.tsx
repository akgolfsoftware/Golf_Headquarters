import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-33 Koordinering mellom skoler. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/admin/koordinering */
export default async function WangAdminKoordineringSide() {
  await krevWangSportssjef();
  return <WangIkkeBygget skjermId="WANG-33" />;
}
