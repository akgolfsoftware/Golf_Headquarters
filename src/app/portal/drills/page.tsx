// PH13DrillListe — nytt design (pakke 4, godkjent av Anders 14.10.2026). Data og handlinger er beholdt.
/**
 * PH-13 Øvelsesbank. Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjerm «bank».
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH13DrillBank.tsx.
 * Øvelsene kommer fra ExerciseDefinition med samme tilgangsfilter som før. Tom bank gir tom tilstand,
 * aldri eksempeløvelser. Caddie-forslaget kommer fra spillerens svakeste Strokes Gained-kategori.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { beregnSgGap } from "@/lib/workbench/sg-gap";
import { SG_FOKUS_LABEL, type SgKategori } from "@/lib/workbench/fokus";
import { hentOvelser } from "@/lib/portal-drills/ovelser-data";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH13DrillBank, type PH13Caddie } from "@/components/portal/precision/PH13DrillBank";

export const dynamic = "force-dynamic";
export const metadata = { title: "Øvelsesbank · PlayerHQ" };

/** Treningsområdene som trener hver SG-kategori (navnene fra ovelser-visning). */
const SG_OMRAADER: Record<SgKategori, RegExp> = {
  OTT: /^Utslag/,
  APP: /^Innspill/,
  ARG: /^(Chip|Pitch|Lob|Bunker|Nærspill)/,
  PUTT: /^Putt/,
};

export default async function DrillsPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [ovelser, gap, uleste] = await Promise.all([
    hentOvelser(user.id),
    beregnSgGap(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  let caddie: PH13Caddie | null = null;
  if (gap) {
    const kandidat = ovelser.find((o) => o.akse !== "fys" && o.omraade && SG_OMRAADER[gap.kategori].test(o.omraade));
    if (kandidat) caddie = { ovelseId: kandidat.id, omraade: SG_FOKUS_LABEL[gap.kategori], sg: gap.sg };
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH13DrillBank ovelser={ovelser} caddie={caddie} />
    </PlayerHQSkall>
  );
}
