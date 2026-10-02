import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { TrenerdelingAksept } from "@/components/portal/precision/trenerdeling-aksept";
export const dynamic = "force-dynamic";
export const metadata = { title: "Godta trenerdeling · AK Golf HQ", referrer: "no-referrer" as const, robots: { index: false, follow: false } };
/** Offentlig inngang uten spillerdata. Aksept krever ny, bekreftet trenerkontroll. */
export default async function TrenerdelingAkseptPage() {
  const bruker = await getCurrentUserRaw();
  return <TrenerdelingAksept innlogget={Boolean(bruker)} erTrener={bruker?.role === "COACH" || bruker?.role === "ADMIN"} />;
}
