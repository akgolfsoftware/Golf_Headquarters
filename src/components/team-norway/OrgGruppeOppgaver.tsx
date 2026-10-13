'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { OrgGruppeOppgaverData } from '@/lib/domain/org-gruppeoppgaver-kontrakt';
import { oppsummerOrgBelastning } from '@/lib/domain/org-gruppeoppgaver-kontrakt';
import { endreOrgGruppeOppgave } from '@/lib/domain/org-gruppeoppgaver';
import styles from './org-gruppeoppgaver.module.css';
const STATUS: Record<string, string> = { SCHEDULED: 'Planlagt', PUBLISHED: 'Publisert', IN_PROGRESS: 'Pågår', COMPLETED: 'Gjennomført' };
function tid(min: number) { return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`; }

export function OrgGruppeOppgaver({ data, visning = 'oppgaver', kanRedigere = false }: { data: OrgGruppeOppgaverData; visning?: 'oppgaver' | 'belastning'; kanRedigere?: boolean }) {
  const [spiller, setSpiller] = useState('alle');
  const [periode, setPeriode] = useState('alle');
  const [melding, setMelding] = useState('');
  const [venter, start] = useTransition();
  const router = useRouter();
  const spillere = [...new Map(data.oppgaver.map(o => [o.playerId, o.spillerNavn])).entries()];
  const maneder = [...new Set(data.oppgaver.map(o => o.date.slice(0, 7)))].sort();
  const oppgaver = data.oppgaver.filter(o => (spiller === 'alle' || o.playerId === spiller) && (periode === 'alle' || o.date.startsWith(periode)));
  const tall = oppsummerOrgBelastning(oppgaver);
  return <section className={styles.flate} data-sessionpreview>
    <div className={styles.filter}>
      <label>Spiller<select value={spiller} onChange={e => setSpiller(e.target.value)}><option value="alle">Hele gruppen</option>{spillere.map(([id, navn]) => <option key={id} value={id}>{navn}</option>)}</select></label>
      <label>Periode<select value={periode} onChange={e => setPeriode(e.target.value)}><option value="alle">Alle registrerte måneder</option>{maneder.map(m => <option key={m} value={m}>{m}</option>)}</select></label>
    </div>
    {visning === 'belastning' && <><dl className={styles.tallrad}><div><dt>Planlagte minutter</dt><dd>{tall.planlagtMinutter}</dd></div><div><dt>Registrerte minutter</dt><dd>{tall.faktiskMinutter ?? '—'}</dd></div><div><dt>Økter med registrert tid</dt><dd>{tall.medRegistrertTid} av {tall.antall}</dd></div></dl><p>Registrert tid kommer fra spillerens gruppeøkt. En fullført status uten tidsregistrering gir ukjent tid. Dette er treningsmengde; helse og beredskap inngår ikke.</p></>}
    {!oppgaver.length && <p className={styles.tom}>Ingen publiserte individuelle gruppeoppgaver i dette utvalget. Publiser gruppeøkten i gruppeplanen først.</p>}
    <div className={styles.liste}>{oppgaver.map(o => <article key={o.id} className={styles.rad}>
      <header><strong>{o.spillerNavn}</strong><span>{STATUS[o.status] ?? o.status}</span></header>
      <h3>{o.title}</h3>{o.maalsetning && <p>{o.maalsetning}</p>}<p>{o.gruppeOkt} · <span className={styles.tall}>{o.date} · {tid(o.startMinute)}–{tid(o.startMinute + o.durationMinutes)}</span></p>
      {visning === 'belastning' ? <p>Planlagt <span className={styles.tall}>{o.durationMinutes} min</span> · Registrert <span className={styles.tall}>{o.actualMinutes === null ? '—' : `${o.actualMinutes} min`}</span> · Repetisjoner <span className={styles.tall}>{o.loggedReps ?? '—'}</span></p> : <><p>{o.pyramid} · Individuell oppgave i gruppetiden</p>{kanRedigere && ['SCHEDULED', 'PUBLISHED'].includes(o.status) && o.actualMinutes === null && o.loggedReps === null && <details><summary>Tilpass oppgaven</summary><form action={form => { setMelding(''); start(async () => { try { const res = await endreOrgGruppeOppgave({ groupId: data.groupId, sessionId: o.id, expectedUpdatedAt: o.updatedAt, title: String(form.get('title') ?? ''), pyramid: String(form.get('pyramid') ?? ''), maalsetning: String(form.get('maalsetning') ?? '').trim() || null }); setMelding(res.ok ? 'Oppgaven er lagret i gruppetiden.' : res.error); if (res.ok) router.refresh(); } catch { setMelding('Kunne ikke lagre oppgaven. Innholdet er bevart; prøv igjen.'); } }); }}><label>Oppgave<input name="title" defaultValue={o.title} required maxLength={200} /></label><label>Mål for oppgaven<textarea name="maalsetning" defaultValue={o.maalsetning ?? ''} maxLength={500} rows={3} /></label><label>Akse<select name="pyramid" defaultValue={o.pyramid}>{['FYS','TEK','SLAG','SPILL','TURN'].map(a => <option key={a}>{a}</option>)}</select></label><p>Dato og tid følger gruppeøkten og kan ikke flyttes her.</p><button type="submit" disabled={venter}>{venter ? 'Lagrer …' : 'Lagre oppgave'}</button></form></details>}</>}
    </article>)}</div>
    {melding && <p role="status">{melding}</p>}
  </section>;
}
