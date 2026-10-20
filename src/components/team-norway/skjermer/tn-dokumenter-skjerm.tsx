import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { hentGruppeDokumenter, hentViewerRolleIGruppe } from "@/lib/domain/tn-post";
import { TN_DOKUMENT_KATEGORIER } from "@/lib/domain/tn-post-regler";
import { MAX_FILE_SIZES, STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { hentSkjermbruker } from "./felles";
import { TnDokumenterVisning } from "./tn-gruppe-visning";

/**
 * TN-14 Dokumenter. Gruppens filer samlet på ett sted.
 * Visningen (retning «Skrå», tavle D2) ligger i tn-gruppe-visning.tsx.
 * Fasit: docs/design-system/utkast-tn/gruppe.html, skjermene Dokumenter og Last opp (pakke 6).
 *
 * Avvik:
 *   - Vedlegg i innlegg har ingen kategori. De vises under Alle, merket «Fra innlegg».
 *   - Filtypene er de lagringen godtar: PDF, XLSX, JPG, PNG og WEBP, maks 50 MB.
 *     DOCX godtas ikke.
 *   - Trenere ser i tillegg hvor mange i gruppen som har åpnet filen.
 *   - Den som lastet opp og trenere kan slette et dokument (Anders 27.09.2026).
 */

export async function TnDokumenterSkjerm({ groupId, sokeparametre }: { groupId: string; sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const [gruppe, rolle] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId }, select: { name: true } }),
    hentViewerRolleIGruppe(groupId, bruker.id),
  ]);
  if (!gruppe || !rolle) notFound();
  const dokumenter = await hentGruppeDokumenter(groupId, bruker.id);
  if (!dokumenter) notFound();

  const erTrener = rolle === "TRENER";
  const harTrenertilgang = erTrener || bruker.role === "ADMIN";
  const kategoriParam = Array.isArray(sokeparametre.kategori) ? sokeparametre.kategori[0] : sokeparametre.kategori;
  const kategori = TN_DOKUMENT_KATEGORIER.find((k) => k.toLowerCase() === kategoriParam) ?? null;
  const maksMb = Math.round(MAX_FILE_SIZES[STORAGE_BUCKETS.TN_POST_VEDLEGG] / (1024 * 1024));

  return (
    <TnDokumenterVisning
      brukerNavn={bruker.name ?? "Ukjent"}
      brukerId={bruker.id}
      rolleEtikett={erTrener ? "Trener" : rolle === "SPILLER" ? "Spiller" : "Foresatt"}
      groupId={groupId}
      harTrenertilgang={harTrenertilgang}
      erTrener={erTrener}
      gruppeNavn={gruppe.name}
      dokumenter={dokumenter}
      kategori={kategori}
      kategorier={[...TN_DOKUMENT_KATEGORIER]}
      maksMb={maksMb}
    />
  );
}
