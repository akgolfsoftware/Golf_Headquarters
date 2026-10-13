import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requirePortalUser } from '@/lib/auth/requirePortalUser';
import { hentTnWorkbenchKontekst } from '@/lib/domain/tn-workbench';
import { TnShell, TnSidehode, TnSeksjon } from '@/components/team-norway/tn-shell';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const bruker = await requirePortalUser({ allow: ['ADMIN','COACH'], kreverTilgang: 'INGEN' });
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();
  return <TnShell aktiv="oppsett" brukerNavn={bruker.name ?? 'Trener'} rolle="Trener" groupId={kontekst.gruppeId} visTrenerflater kanAdministrere={kontekst.kanAdministrere}>
    <TnSidehode overlinje="Team Norway" tittel="Organisasjonsoppsett" ingress="Team Norway eier gruppeplanen, gruppetiden og samlingene. Individuelle planendringer følger spillerens godkjenning." />
    <TnSeksjon tittel="Personlig innsyn delt med deg" forklaring="Bare aktive, navngitte delinger vises. Trekking stanser også tidligere innsyn. Helse og meldinger behandles etter egne delingsvalg.">
      {kontekst.spillere.length ? <ul>{kontekst.spillere.map(s => <li key={s.id}><Link href={`/team-norway/spiller/${s.id}/oversikt`}>{s.navn} · Åpne delt profil</Link></li>)}</ul> : <p>Ingen aktive personlige delinger tilgjengelig.</p>}
    </TnSeksjon>
    <TnSeksjon tittel="Gruppe og testsamtykke"><p>{kontekst.gruppeNavn}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}><Link href="/team-norway/workbench">Gruppeplan</Link><Link href="/team-norway/wang-resultater">WANG-testdeling</Link>{kontekst.kanAdministrere && <Link href="/team-norway/tilgang">Trenere og tilgang</Link>}<Link href={`/team-norway/${kontekst.gruppeId}/dokumenter`}>Gruppedokumenter</Link></div></TnSeksjon>
  </TnShell>;
}
