/** DG-03 Proffprofil — Data Golf for coach. Bare coach og admin. */
import { notFound } from "next/navigation";
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { DG03Proff } from "@/components/admin/precision/AGDataGolf";
import { hentProff } from "@/lib/admin/datagolf/coach-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Proff · Data Golf · AgencyOS" };

export default async function DataGolfProffPage({ params }: { params: Promise<{ dgId: string }> }) {
  const { dgId } = await params;
  const user = await krevDataGolfBruker(`/admin/datagolf/proffer/${encodeURIComponent(dgId)}`);
  const id = Number(dgId);
  if (!Number.isInteger(id)) notFound();
  const p = await hentProff(id);
  if (!p) notFound();
  return <AgencyOSSkall navn={user.name ?? "Coach"}><DG03Proff tak={p.tak} sesonger={p.sesonger} /></AgencyOSSkall>;
}
