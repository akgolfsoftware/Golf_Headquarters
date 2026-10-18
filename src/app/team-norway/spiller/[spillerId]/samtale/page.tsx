import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requirePortalUser } from '@/lib/auth/requirePortalUser';
import { medTnSpillerData } from '@/lib/domain/tn-arbeidsflate';
import { hentTnWorkbenchKontekst } from '@/lib/domain/tn-workbench';
import { hentTnEvalueringGrunnlag } from '@/lib/domain/tn-evaluering';
import { TnShell, TnSidehode, TnSeksjon, TnSpillerFaner } from '@/components/team-norway/tn-shell';
import { TrenerforslagSkjema } from '@/components/workbench/Trenerforslag';
import { TnKort } from '@/components/team-norway/core';
import { TN } from '@/lib/v2/team-norway';
export const dynamic = 'force-dynamic';

/** Uses the same named-profile guard, measurements and approval action as TN evaluation/workbench. */
export default async function Page({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ allow: ['ADMIN', 'COACH'], kreverTilgang: 'INGEN' });
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();
  const spiller = kontekst.spillere.find(s => s.id === spillerId);
  if (!spiller) notFound();
  const grunnlag = await medTnSpillerData(bruker, spillerId, () => hentTnEvalueringGrunnlag(spillerId));
  if (!grunnlag) notFound();
  return <TnShell aktiv="spillere" brukerNavn={bruker.name ?? 'Trener'} rolle="Trener" groupId={kontekst.gruppeId} visTrenerflater kanAdministrere={kontekst.kanAdministrere}>
    <TnSpillerFaner spillerId={spillerId} spillerNavn={spiller.navn} aktiv="samtale" kanAdministrere />
    <TnSidehode overlinje="Fra Team Norway" tittel={`Utviklingssamtale · ${spiller.navn}`} ingress="Gå gjennom målinger, vurder neste tiltak og send avtalen til spilleren. Forslaget endrer ikke spillerens plan før godkjenning." />
    <TnSeksjon tittel="Grunnlag for samtalen">
      {grunnlag.tester.length ? grunnlag.tester.map(t => <TnKort key={t.id}><strong>{t.name}</strong><p style={{ margin: '8px 0 0' }}>{t.latestDate} · <span style={{ fontFamily: TN.font.mono }}>{t.latest}</span></p></TnKort>) : <p>Ingen registrerte testresultater i delt grunnlag.</p>}
      {grunnlag.aktivPlan && <p>{grunnlag.aktivPlan.navn} · <span style={{ fontFamily: TN.font.mono }}>{grunnlag.aktivPlan.antallFullfort} av {grunnlag.aktivPlan.antallOppgaver}</span> oppgaver fullført</p>}
      {grunnlag.nesteTiltak && <Link href={`/team-norway/spiller/${spillerId}/teknisk-plan/${grunnlag.nesteTiltak.planId}`}>Åpne neste tekniske tiltak: {grunnlag.nesteTiltak.tittel}</Link>}
    </TnSeksjon>
    <TnSeksjon tittel="Avtalt tiltak og oppfølging" forklaring="Velg dato for tiltaket og begrunn hva dere har avtalt. Avsender og avtalen bevares i forslaget, og spilleren kan godkjenne eller avvise i PlayerHQ.">
      <TrenerforslagSkjema organisasjon="TEAM_NORWAY" spillerId={spillerId} />
    </TnSeksjon>
  </TnShell>;
}
