import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { TnHandlingLenke } from "@/components/team-norway/tn-handlinger";
import { TnShell, tnRolleNavn } from "@/components/team-norway/tn-shell";
import { TnFeilkort, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/**
 * Ikke funnet i Team Norway. Teksten er nøytral, fordi siden også vises for
 * adresser uten spiller (rangliste, workbench). At en spiller ikke har delt,
 * sies bare på spillersidene selv. Er brukeren innlogget med Team Norway-tilgang,
 * står den ekte sidemenyen rundt kortet, så hen kan gå videre; ellers skjelettet.
 */
export default async function TeamNorwayIkkeFunnet() {
  const kort = (
    <TnFeilkort
      tittel="Siden finnes ikke"
      tekst="Adressen kan være skrevet feil, eller siden er flyttet."
      handling={<TnHandlingLenke href="/team-norway" variant="sekundar">Til oversikten</TnHandlingLenke>}
    />
  );

  const bruker = await getCurrentUserRaw().catch(() => null);
  const kontekst = bruker ? await hentTnArbeidskontekst(bruker).catch(() => null) : null;
  if (!bruker || !kontekst) return <TnSkallSkjelett>{kort}</TnSkallSkjelett>;

  const visDataGolf = !kontekst.erSpiller && (await innloggetKanSeDataGolf());
  return (
    <TnShell aktiv="oversikt" brukerNavn={bruker.name ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere} visDataGolf={visDataGolf}>
      {kort}
    </TnShell>
  );
}
