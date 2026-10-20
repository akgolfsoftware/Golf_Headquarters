/**
 * AgencyOS — turneringsplan for én spiller (/admin/spillere/[id]/turneringsplan).
 * Samme planlegger som spilleren ser i PlayerHQ, med WAGR-anslag. Coachen endrer direkte;
 * spilleren får beskjed og kan angre. Tilgang: egen coach eller admin (medSpillerTilgang).
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { medSpillerTilgang } from "@/lib/profil-kobling/tilgang";
import { byggPlanvisning } from "@/lib/turneringsplan/data";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Turneringsplanlegger } from "@/components/turneringsplan/Turneringsplanlegger";

export const dynamic = "force-dynamic";
export const metadata = { title: "Turneringsplan · AgencyOS" };

export default async function TurneringsplanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;
  const svar = await medSpillerTilgang(user, id, {}, (k) => byggPlanvisning(k.db, id));
  if (!svar?.data) notFound();
  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <Turneringsplanlegger visning={svar.data} rolle={svar.relasjon === "SELV" ? "spiller" : "coach"} />
    </AgencyOSSkall>
  );
}
