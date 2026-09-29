import { AdminIngenTilgang } from "@/app/team-wang/_components/wang-admin-logginn/admin-ui";
import { WangSide } from "@/components/wang/trener/wang-ui";

/**
 * Administrasjon er bare for Sportssjef. krevWangSportssjef() gir notFound()
 * for Trener, og da vises 403 fra WANG-24. Siden sier ikke hva som ligger bak.
 */
export default function WangAdminIngenTilgang() {
  return (
    <WangSide>
      <AdminIngenTilgang />
    </WangSide>
  );
}
