import { notFound } from 'next/navigation';
import { requirePortalUser } from '@/lib/auth/requirePortalUser';
import { hentTnWorkbenchKontekst, kanRedigereTnGruppeplan } from '@/lib/domain/tn-workbench';
import { hentOrgGruppeOppgaver } from '@/lib/domain/org-gruppeoppgaver';
import { TnShell, TnSidehode, TnTomtilstand } from '@/components/team-norway/tn-shell';
import { OrgGruppeOppgaver } from '@/components/team-norway/OrgGruppeOppgaver';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const bruker = await requirePortalUser({ allow: ['ADMIN', 'COACH'], kreverTilgang: 'INGEN' });
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();
  const res = await hentOrgGruppeOppgaver({ groupId: kontekst.gruppeId });
  const kanRedigere = await kanRedigereTnGruppeplan(bruker, kontekst);
  return <TnShell aktiv="belastning" brukerNavn={bruker.name ?? 'Trener'} rolle="Trener" groupId={kontekst.gruppeId} visTrenerflater kanAdministrere={kontekst.kanAdministrere}>
    <TnSidehode overlinje="Fra Team Norway" tittel="Gruppebelastning" ingress="Publiserte gruppeoppgaver følger gruppens tid og samlingsprogram. Individuelle planer utenfor gruppetiden endres med spillerens godkjenning." />
    {res.ok ? <OrgGruppeOppgaver data={res.data} visning="belastning" kanRedigere={kanRedigere} /> : <TnTomtilstand tittel="Kunne ikke hente oppgavene" tekst={res.error} />}
  </TnShell>;
}
