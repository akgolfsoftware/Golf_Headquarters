import { permanentRedirect } from "next/navigation";

/**
 * Pensjonert 2026-08-29 (rad 5 i §5T-tabellen, godkjent av Anders 27.08).
 *
 * Dette var det ene av to inngangspunkt til NØYAKTIG samme skjerm
 * (`AdminTildelTestV2`) — det andre er `/admin/tester/tildel/[spillerId]`,
 * som fortsatt lever og er lenket fra spiller-testfanen.
 *
 * Avvik fra beslutningsraden, bevisst: raden sier «pensjoner → WB TEST-blokker».
 * Testblokker i Workbench er ikke bygget (T4→T6 leverte dem ikke), så en
 * redirect dit ville vært en blindvei. Adressen peker derfor på den kanoniske
 * tvillingen i stedet — duplikatet forsvinner, funksjonen består. Når
 * TEST-blokkene finnes i Workbench, flyttes begge dit.
 */
export default async function TildelTestRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  permanentRedirect(`/admin/tester/tildel/${id}`);
}
