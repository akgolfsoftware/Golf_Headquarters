import { useState } from 'react';
import { WangArbeidsflate } from '@/components/wang/WangArbeidsflate';
import { WangAppSkall } from '@/components/wang/WangAppSkall';
import { OrgGruppeOppgaver } from '@/components/team-norway/OrgGruppeOppgaver';
import { TnShell, TnSidehode } from '@/components/team-norway/tn-shell';
import type { WangLiveData } from '@/app/team-wang/_data/hent-wang-gruppe';
import type { GruppeKalenderData } from '@/lib/gruppe-kalender/types';
import type { OrgGruppeOppgaverData } from '@/lib/domain/org-gruppeoppgaver-kontrakt';
import '@/styles/wang-tokens.css';
import '@/styles/wang-app.css';
import '@/styles/team-norway-tokens.css';
const idag = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo' }).format(new Date());
const live: WangLiveData = { gruppeId: 'syntetisk-wang', gruppeNavn: 'WANG · syntetisk gruppe', antallElever: 2, elever: [{ id: 'syntetisk-spiller', navn: 'Test Spiller', rolle: 'PLAYER' }], perioder: [], hendelser: [], fasteOkter: [], skoleDager: [], fokusomraader: [], oppdatertIso: idag };
const kalender: GruppeKalenderData = { gruppeId: live.gruppeId, gruppeNavn: live.gruppeNavn, faste: [{ id: 'syntetisk-tid', weekday: (new Date(`${idag}T12:00:00Z`).getUTCDay() + 6) % 7, startTime: '08:00', endTime: '10:00', title: 'Gruppetrening · mål, oppgave og oppfølging' }], perioder: [{ id: 'syntetisk-periode', name: 'Grunnperiode', startDate: `${idag.slice(0,4)}-01-01`, endDate: `${Number(idag.slice(0,4)) + 1}-01-01`, tone: null, note: 'Kvalitet i trening og egenplanlegging', kompetansemal: [{ id: 'syntetisk-maal', classYear: 'VG1', curriculumCode: 'TP', goalNumber: 1, text: 'Planlegg, gjennomfør og vurder egen trening.' }] }], samlinger: [], skoleHendelser: [], turneringer: [] };
const oppgaver: OrgGruppeOppgaverData = { groupId: live.gruppeId, groupName: live.gruppeNavn, oppgaver: [{ id: 'syntetisk-okt', playerId: 'syntetisk-spiller', spillerNavn: 'Test Spiller', gruppeOkt: 'Morgentrening', date: idag, startMinute: 480, durationMinutes: 60, title: 'P4.0 · arbeidsoppgave og kvalitet i balltreff', pyramid: 'TEK', status: 'COMPLETED', actualMinutes: 45, loggedReps: 30, updatedAt: `${idag}T10:00:00Z` }, { id: 'syntetisk-okt-2', playerId: 'syntetisk-spiller-2', spillerNavn: 'Test Spiller To', gruppeOkt: 'Morgentrening', date: idag, startMinute: 480, durationMinutes: 60, title: 'Putting: startlinje', pyramid: 'SLAG', status: 'PUBLISHED', actualMinutes: null, loggedReps: null, updatedAt: `${idag}T10:00:00Z` }] };
function Wang({ fane = 'dag', tom = false }: { fane?: string; tom?: boolean }) {
  const [aktiv, setAktiv] = useState(fane);
  return <div className="pa-root wang-tp wang-app" data-org="wang"><WangAppSkall rolle="Trener" brukerNavn="Test Trener" aktivtOmraade="trening"><WangArbeidsflate omraade="trening" fane={aktiv} live={live} kalender={tom ? { ...kalender, faste: [], perioder: [] } : kalender} elever={live.elever} campus="Fredrikstad" kanPublisere={false} onNaviger={(_, f) => setAktiv(f ?? 'dag')} gruppeOppgaver={oppgaver} /></WangAppSkall></div>;
}
function Tn({ tom = false }: { tom?: boolean }) { return <div className="pa-root tn-app" data-org="team-norway"><TnShell aktiv="belastning" brukerNavn="Test Trener" rolle="Trener" groupId="syntetisk-tn" visTrenerflater kanAdministrere={false}><TnSidehode overlinje="Syntetisk prøve" tittel="Gruppebelastning" ingress="Registrert trening fra gruppens egne oppgaver." /><OrgGruppeOppgaver data={tom ? { ...oppgaver, oppgaver: [] } : oppgaver} visning="belastning" kanRedigere={false} /></TnShell></div>; }
export const tilstander = { wang: <Wang />, wang_uke: <Wang fane="uke" />, wang_tom: <Wang tom />, tn: <Tn />, tn_tom: <Tn tom /> };
export const natt: string[] = [];
