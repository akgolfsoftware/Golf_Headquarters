import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ToppidrettKlient } from "./ToppidrettKlient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Toppidrett Presisjonsanalyse · PlayerHQ" };

export default async function ToppidrettPage() {
  const user = await requirePortalUser({ kreverTilgang: "FULL" });

  return <ToppidrettKlient user={user} />;
}
