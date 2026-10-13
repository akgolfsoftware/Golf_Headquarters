'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { merkPostLestAction } from '@/app/team-norway/tn-post-actions';
import { publiserWangGruppepost } from '@/app/team-wang/coach/meldinger-actions';
import styles from './wang-arbeidsflate.module.css';
export type WangGruppePost = { id: string; forfatter: string; tekst: string; tidspunkt: string; endret: boolean; lest: number; mottakere: number; vedlegg: { id: string; navn: string }[] };
export function WangGruppeMeldinger({ innlegg, gruppeNavn, kanPublisere = true }: { innlegg: WangGruppePost[]; gruppeNavn: string; kanPublisere?: boolean }) {
  const [melding, setMelding] = useState('');
  const [tekst, setTekst] = useState('');
  const [pending, start] = useTransition();
  const router = useRouter();
  const liste = useRef<HTMLElement>(null);
  const lest = useRef(new Set<string>());
  useEffect(() => {
    if (kanPublisere || !liste.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.postId;
        if (!entry.isIntersecting || !id || lest.current.has(id)) continue;
        lest.current.add(id);
        void merkPostLestAction(id).catch(() => { lest.current.delete(id); });
      }
    }, { threshold: .6 });
    liste.current.querySelectorAll('[data-post-id]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [innlegg, kanPublisere]);
  return <section ref={liste} className={styles.seksjon}><h2>Gruppens innboks</h2><p>Beskjeder og dokumenter til {gruppeNavn}. Mottakeren er hele gruppen.</p>
    {kanPublisere && <form onSubmit={e => { e.preventDefault(); if (pending) return; setMelding(''); start(async () => { try { const res = await publiserWangGruppepost({ tekst }); setMelding(res.ok ? 'Innlegget er publisert til gruppen.' : res.feil); if (res.ok) { setTekst(''); router.refresh(); } } catch { setMelding('Kunne ikke publisere beskjeden. Teksten er bevart; prøv igjen.'); } }); }} style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
      <label className={styles.felt}>Ny beskjed<textarea value={tekst} onChange={e => setTekst(e.target.value)} required minLength={3} maxLength={2000} rows={4} style={{ font: 'inherit', color: 'inherit', background: 'var(--surface-card)', border: '1px solid var(--border-control)', borderRadius: 8, padding: 12, width: '100%' }} /></label>
      <button type="submit" className={styles.handling} disabled={pending || tekst.trim().length < 3} style={{ justifySelf: 'start' }}>{pending ? 'Publiserer …' : 'Publiser beskjed'}</button>{melding && <p role="status">{melding}</p>}
    </form>}
    {!innlegg.length && <p className={styles.tom}>Ingen innlegg eller dokumenter i gruppen ennå.</p>}
    {innlegg.map(p => <article data-post-id={p.id} key={p.id} style={{ paddingBlock: 20, borderTop: '1px solid var(--wang-grey-line)' }}><header><strong>{p.forfatter}</strong><p className={styles.meta}>{new Date(p.tidspunkt).toLocaleString('nb-NO', { timeZone: 'Europe/Oslo', dateStyle: 'medium', timeStyle: 'short' })}{p.endret ? ' · Endret' : ''}</p></header><p style={{ whiteSpace: 'pre-wrap' }}>{p.tekst}</p>{p.vedlegg.map(v => <a key={v.id} className={styles.sekundar} href={`/api/team-norway/vedlegg/${encodeURIComponent(v.id)}`}>{v.navn}</a>)}<p className={styles.meta}><span className={styles.tall}>{p.lest} av {p.mottakere}</span> spillere har lest</p></article>)}
  </section>;
}
