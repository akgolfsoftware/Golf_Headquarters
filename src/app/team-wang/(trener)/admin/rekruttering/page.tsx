import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-31 Rekruttering. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/admin/rekruttering */
export default async function WangAdminRekrutteringSide() {
  await krevWangSportssjef();
  return <WangIkkeBygget skjermId="WANG-31" />;
}
