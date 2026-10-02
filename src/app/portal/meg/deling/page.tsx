import { notFound } from "next/navigation";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentEgenTrenerdeling } from "@/lib/deling/navngitt";
import { NavngittDeling } from "@/components/portal/precision/navngitt-deling";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trenerdeling · PlayerHQ" };
const Valg = z.object({ barn: z.string().min(1).max(120).optional() }).strict();

export default async function TrenerdelingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const bruker = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"], kreverTilgang: "INGEN" });
  const p = Valg.safeParse(await searchParams);
  if (!p.success) notFound();
  // Leseren kontrollerer eierskap/godkjent foreldrerelasjon uavhengig av sidens rolleport.
  const oversikt = await hentEgenTrenerdeling({ spillerId: p.data.barn ?? bruker.id });
  if (!oversikt) notFound();
  return <NavngittDeling initial={oversikt} />;
}
