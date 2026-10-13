import type { ReactNode } from 'react';
import { IupSamtale } from '@/app/team-wang/coach/iup/[elevId]/iup-samtale';
import { WangAppSkall } from '@/components/wang/WangAppSkall';
import { TnShell } from '@/components/team-norway/tn-shell';
import { TnSkjermhode, TnFlate, TnFlatehode, TnDatoRad, TnStatusmerke, TnFilterknapper, TnMangler } from '@/components/team-norway/tn-flate';
import { TnTabell, TnPanelrad } from '@/components/team-norway/tn-skjerm';
import { TN } from '@/lib/v2/team-norway';
import TnError from '@/app/team-norway/error';
import '@/styles/wang-tokens.css';
import '@/styles/wang-app.css';
import '@/styles/team-norway-tokens.css';
const props = {
  elevId: 'syntetisk-spiller', elevNavn: 'Test Spiller',
  avsluttende: { id: 'syntetisk-periode', navn: 'Grunnperiode', startIso: '2026-09-01', sluttIso: '2026-10-12', fokus: 'Kvalitet i egen trening' },
  neste: { id: 'syntetisk-neste', navn: 'Spesialperiode', startIso: '2026-10-13', sluttIso: '2026-11-30', fokus: 'Treningskvalitet og vurdering' },
  evalueringer: [{ id: 'syntetisk-fokus', akse: 'TEK' as const, tittel: 'P4.0 · arbeidsoppgave og kvalitet i balltreff', egentidMinUke: 60, maalemetode: 'Treff av ti', status: 'PAA_VEI' as const, egenvurdering: 3, trenervurdering: 4, kommentar: null }],
  nyeStart: [{ akse: 'SLAG' as const, tittel: 'Putting: startlinje', egentidMinUke: 60, maalemetode: 'Treff av ti' }],
  maalinger: [{ id: 'syntetisk-resultat', navn: 'Startlinje', akse: 'SLAG' as const, verdi: '7 OK av 10', datoIso: '2026-10-12' }],
};
function Wang({ read = false, tom = false }: { read?: boolean; tom?: boolean }) {
 const content = <IupSamtale {...props} kanRedigere={!read} tilbakeHref={read ? '/portal' : '/team-wang/coach?omraade=elever'} {...(tom ? { avsluttende: null, neste: null, evalueringer: [], nyeStart: [], maalinger: [] } : {})} />;
 return <div className="pa-root wang-tp wang-app" data-org="wang">{read ? content : <WangAppSkall rolle="Trener" brukerNavn="Test Trener" aktivtOmraade="elever">{content}</WangAppSkall>}</div>;
}
function Norway({ children, player = false }: { children: ReactNode; player?: boolean }) {
 return <div className="pa-root tn-app" data-org="team-norway"><TnShell aktiv="workbench" brukerNavn={player ? 'Test Spiller' : 'Test Trener'} rolle={player ? 'Spiller' : 'Trener'} groupId="syntetisk-gruppe" visTrenerflater={!player} kanAdministrere={!player}>{children}</TnShell></div>;
}
function Tn({ tom = false, player = false }: { tom?: boolean; player?: boolean }) {
 return <Norway player={player}><TnSkjermhode rute="/team-norway/workbench" tittel="Gruppeplan og oppfølging" ingress="Gruppens publiserte trening og individuelle oppgaver hører sammen. Personlige endringer følger spillerens godkjenning." /><TnFilterknapper etikett="Planhorisont" valg={['År','Periode','Måned','Uke','Dag'].map(label => ({ label, href: `?visning=${label}`, aktiv: label === 'Uke' }))} /><TnFlate><TnFlatehode tittel="Publiserte gruppeøkter" merknad="Syntetisk prøve · 13. oktober 2026" />{tom ? <TnMangler>Ingen publiserte økter i denne uken. Lagrede utkast vises når treneren har publisert dem.</TnMangler> : <><TnDatoRad dato="13. okt. 08:00" tittel="P4.0 · kvalitet i balltreff og egen registrering" tekst="Gruppetrening · 60 min planlagt" hoyre={<TnStatusmerke farge={TN.status.greenText}>Gjennomført</TnStatusmerke>} /><TnDatoRad dato="14. okt. 08:00" tittel="Putting: startlinje" tekst="Gruppens tidspunkt · 45 min planlagt" hoyre={<TnStatusmerke farge={TN.navy900}>Publisert</TnStatusmerke>} /></>}</TnFlate><TnTabell caption="Testresultater · syntetisk datagrunnlag" kolonner={[{ key: 'spiller', label: 'Spiller' }, { key: 'test', label: 'Protokoll' }, { key: 'resultat', label: 'Registrert resultat', tall: true }, { key: 'dato', label: 'Dato' }]} rader={tom ? [] : [{ spiller: 'Test Spiller', test: 'Startlinje', resultat: '7 OK av 10', dato: '12.10.2026' }]} /><TnPanelrad paneler={[{ hode: 'Registrert kilde', tittel: 'Målinger før vurdering', tekst: 'Testprotokoll og registrert dato følger resultatet. Ulike måleenheter summeres ikke til én totalscore.', kilde: 'Syntetisk prøve · ingen reelle spillerdata' }]} /></Norway>;
}
export const tilstander = { wang_iup: <Wang />, wang_iup_tom: <Wang tom />, wang_iup_leser: <Wang read />, tn_plan: <Tn />, tn_tom: <Tn tom />, tn_spiller: <Tn player />, tn_feil: <div className="pa-root tn-app" data-org="team-norway"><TnError error={Error('Syntetisk feil')} reset={() => {}} /></div> };
export const natt: string[] = [];
