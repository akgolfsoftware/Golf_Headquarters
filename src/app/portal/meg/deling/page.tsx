import { notFound } from "next/navigation";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentEgenTrenerdeling } from "@/lib/deling/navngitt";
import { NavngittDeling } from "@/components/portal/precision/navngitt-deling";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";

export const dynamic = "force-dynamic";
export const metadata = { title: "Del med trener · PlayerHQ" };
const Valg = z.object({ barn: z.string().min(1).max(120).optional() }).strict();

export default async function TrenerdelingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const bruker = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"], kreverTilgang: "INGEN" });
  const p = Valg.safeParse(await searchParams);
  if (!p.success) notFound();
  // Leseren kontrollerer eierskap/godkjent foreldrerelasjon uavhengig av sidens rolleport.
  const oversikt = await hentEgenTrenerdeling({ spillerId: p.data.barn ?? bruker.id });
  if (!oversikt) notFound();
  const medSkall = bruker.role === "PLAYER" && !oversikt.foresattVisning;
  const side = <NavngittDeling initial={oversikt} erTrener={bruker.role === "COACH" || bruker.role === "ADMIN"} skra={medSkall} />;
  // Spilleren får PlayerHQ-skallet; foresatt (?barn=) og trener ser siden uten spillerens meny.
  return medSkall
    ? <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{side}</PlayerHQSkall>
    : side;
}
