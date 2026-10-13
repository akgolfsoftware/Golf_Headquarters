import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { formaterLagretTestResultat } from "@/lib/portal-tester/resultat-visning";
import { requirePortalUser } from '@/lib/auth/requirePortalUser';
import { medWangElevData } from '@/app/team-wang/_data/wang-tilgang';
import { wangRolleFor } from '@/app/team-wang/_data/wang-rolle';
import { WangAppSkall } from '@/components/wang/WangAppSkall';
import { mondayOf, addDays, monthStartOf, lastDayOfMonth } from '@/lib/domain/workbench/operations';
import styles from '@/components/wang/wang-arbeidsflate.module.css';
export const dynamic = 'force-dynamic';
const STATUS: Record<string, string> = { SCHEDULED: 'Planlagt', PUBLISHED: 'Publisert', IN_PROGRESS: 'Pågår', COMPLETED: 'Gjennomført', CANCELLED: 'Avlyst', SKIPPED: 'Hoppet over' };
function tid(min: number) { return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`; }
export default async function Page({ params, searchParams }: { params: Promise<{ elevId: string }>; searchParams: Promise<{ fane?: string; visning?: string; dato?: string }> }) {
  const { elevId } = await params;
  const sp = await searchParams;
  const bruker = await requirePortalUser({ allow: ['ADMIN','COACH'], kreverTilgang: 'INGEN' });
  const fane = sp.fane === 'teknisk-plan' || sp.fane === 'stats' ? sp.fane : 'plan';
  const visning = ['ar','periode','maned','uke','dag'].includes(sp.visning ?? '') ? sp.visning! : 'uke';
  const idag = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo' }).format(new Date());
  const dato = z.iso.date().safeParse(sp.dato).success ? sp.dato! : idag;
  const aar = dato.slice(0, 4);
  const start = visning === 'ar' || visning === 'periode' ? `${aar}-01-01` : visning === 'maned' ? monthStartOf(dato) : visning === 'uke' ? mondayOf(dato) : dato;
  const slutt = visning === 'ar' || visning === 'periode' ? `${aar}-12-31` : visning === 'maned' ? lastDayOfMonth(start) : visning === 'uke' ? addDays(start, 6) : dato;
  const fra = new Date(`${start}T00:00:00Z`); const til = new Date(`${addDays(slutt, 1)}T00:00:00Z`);
  const data = await medWangElevData(bruker, elevId, async tx => {
    const elev = await tx.user.findUnique({ where: { id: elevId }, select: { id: true, name: true } });
    if (!elev) return null;
    const [okter, antall, perioder, planer] = await Promise.all([
      tx.workbenchSession.findMany({ where: { playerId: elevId, date: { gte: fra, lt: til }, status: { in: ['SCHEDULED','PUBLISHED','IN_PROGRESS','COMPLETED','CANCELLED','SKIPPED'] } }, orderBy: [{ date: 'asc' }, { startMinute: 'asc' }], take: 200, select: { id: true, date: true, startMinute: true, durationMinutes: true, title: true, pyramid: true, status: true, actualMinutes: true, groupId: true, drills: { orderBy: { sortOrder: 'asc' }, select: { id: true, title: true, durationMinutes: true } } } }),
      tx.workbenchSession.count({ where: { playerId: elevId, date: { gte: fra, lt: til }, status: { in: ['SCHEDULED','PUBLISHED','IN_PROGRESS','COMPLETED','CANCELLED','SKIPPED'] } } }),
      tx.periodBlock.findMany({ where: { seasonPlan: { userId: elevId, year: Number(aar) } }, orderBy: { startDate: 'asc' }, select: { id: true, startDate: true, endDate: true, focus: true } }),
      tx.technicalPlan.findMany({ where: { userId: elevId }, orderBy: { createdAt: 'desc' }, select: { id: true, navn: true, status: true, positions: { orderBy: { sortOrder: 'asc' }, select: { id: true, pNummer: true, navn: true, tasks: { orderBy: { sortOrder: 'asc' }, select: { id: true, tittel: true, status: true, repsGjortDry: true, repsGjortLav: true, repsGjortFull: true, repsMaalDry: true, repsMaalLav: true, repsMaalFull: true } } } } } }),
    ]);
    const [trening, tester, runder] = fane === 'stats' ? await Promise.all([
      tx.workbenchSession.aggregate({ where: { playerId: elevId, date: { gte: fra, lt: til }, status: { in: ['SCHEDULED','PUBLISHED','IN_PROGRESS','COMPLETED','SKIPPED'] } }, _sum: { durationMinutes: true, actualMinutes: true }, _count: { id: true, actualMinutes: true } }),
      tx.testResult.findMany({ where: { userId: elevId, takenAt: { gte: fra, lt: til } }, orderBy: { takenAt: 'desc' }, take: 50, select: { id: true, testId: true, score: true, details: true, takenAt: true, test: { select: { name: true, protocol: true } } } }),
      tx.round.findMany({ where: { userId: elevId, playedAt: { gte: fra, lt: til }, playStatus: 'COMPLETED' }, orderBy: { playedAt: 'desc' }, take: 50, select: { id: true, playedAt: true, score: true } }),
    ]) : [null, [], []] as const;
    return { elev, okter, antall, perioder, planer, trening, tester, runder };
  });
  if (!data) notFound();
  const href = (f: string, v = visning) => `/team-wang/coach/spiller/${encodeURIComponent(elevId)}?fane=${f}&visning=${v}&dato=${dato}`;
  return <WangAppSkall rolle={wangRolleFor(bruker)} brukerNavn={bruker.name ?? undefined} aktivtOmraade="elever"><div className={styles.arbeidsflate}>
    <header className={styles.hode}><h1>{data.elev.name ?? 'Spiller'}</h1><p className={styles.meta}>WANG · Delt spillerinnsyn</p><p>Planen og den tekniske planen er skrivebeskyttet. Individuelle endringer sendes som forslag.</p></header>
    <nav className={styles.faner} aria-label="Spillerinnhold"><Link className={styles.sekundar} aria-current={fane === 'plan' ? 'page' : undefined} href={href('plan')}>Plan</Link><Link className={styles.sekundar} aria-current={fane === 'teknisk-plan' ? 'page' : undefined} href={href('teknisk-plan')}>Teknisk plan</Link><Link className={styles.sekundar} aria-current={fane === 'stats' ? 'page' : undefined} href={href('stats')}>Stats</Link><Link className={styles.sekundar} href={`/team-wang/coach/iup/${elevId}`}>IUP og utviklingssamtale</Link><Link className={styles.sekundar} href={`/team-wang/coach/turneringer/${elevId}`}>Konkurranse</Link></nav>
    {fane === 'plan' && <><nav className={styles.faner} aria-label="Planvisning">{[['ar','År'],['periode','Periode'],['maned','Måned'],['uke','Uke'],['dag','Dag']].map(([v,n]) => <Link aria-current={visning === v ? 'page' : undefined} className={styles.sekundar} key={v} href={href('plan',v)}>{n}</Link>)}</nav><form method="get" className={styles.verktøy}><input type="hidden" name="fane" value="plan" /><input type="hidden" name="visning" value={visning} /><label className={styles.felt}>Dato<input type="date" name="dato" defaultValue={dato} /></label><button className={styles.sekundar} type="submit">Vis plan</button></form>
      {visning === 'periode' ? <section className={styles.seksjon}><h2>Perioder i {aar}</h2>{data.perioder.length ? data.perioder.map(p => <div className={styles.rad} key={p.id}><div><strong>{p.focus ?? 'Periode'}</strong><p className={styles.tall}>{p.startDate.toISOString().slice(0,10)} – {p.endDate.toISOString().slice(0,10)}</p></div><Link className={styles.sekundar} href={`/team-wang/coach/spiller/${elevId}?fane=plan&visning=uke&dato=${p.startDate.toISOString().slice(0,10)}`}>Åpne uken</Link></div>) : <p>Ingen individuelle perioder registrert.</p>}</section> : <section className={styles.seksjon}><h2>{start} – {slutt}</h2>{!data.okter.length && <p className={styles.tom}>Ingen publiserte økter i dette utvalget.</p>}{data.okter.map(o => <details key={o.id} className={styles.periode}><summary><strong>{o.title}</strong> · <span className={styles.tall}>{o.date.toISOString().slice(0,10)} {tid(o.startMinute)}</span> · {STATUS[o.status] ?? o.status}</summary><p>{o.pyramid} · {o.groupId ? 'Fra gruppeplan' : 'Individuell plan'}</p><p>Planlagt {o.durationMinutes} min · Registrert {o.actualMinutes === null ? '—' : `${o.actualMinutes} min`}</p><ul>{o.drills.map(d => <li key={d.id}>{d.title} · {d.durationMinutes} min</li>)}</ul></details>)}{data.antall > data.okter.length && <p>Flere økter finnes. Velg måned, uke eller dag for hele utvalget.</p>}</section>}</>}
    {fane === 'stats' && <section className={styles.seksjon}><h2>Stats · {start} – {slutt}</h2><p>Lagrede treningsøkter, tester og fullførte runder for denne perioden. Manglende registrering vises som —.</p><dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 16 }}><div><dt>Planlagt trening</dt><dd className={styles.tall}>{data.trening?._sum.durationMinutes === null || !data.trening ? '—' : `${data.trening._sum.durationMinutes} min`}</dd></div><div><dt>Registrert trening</dt><dd className={styles.tall}>{data.trening?._sum.actualMinutes === null || !data.trening ? '—' : `${data.trening._sum.actualMinutes} min`}</dd></div><div><dt>Økter med tidsregistrering</dt><dd className={styles.tall}>{data.trening ? `${data.trening._count.actualMinutes} av ${data.trening._count.id}` : '—'}</dd></div></dl><h3>Tester</h3>{data.tester.length ? data.tester.map(t => <div className={styles.rad} key={t.id}><div><strong>{t.test.name}</strong><p className={styles.tall}>{formaterLagretTestResultat({ testId: t.testId, score: t.score, details: t.details, protocol: t.test.protocol })}</p><p>{t.takenAt.toLocaleDateString('nb-NO', { timeZone: 'Europe/Oslo' })}</p></div></div>) : <p className={styles.tom}>Ingen testresultater i perioden.</p>}<h3>Fullførte runder</h3>{data.runder.length ? data.runder.map(rad => <div className={styles.rad} key={rad.id}><strong>{rad.playedAt.toLocaleDateString('nb-NO', { timeZone: 'Europe/Oslo' })}</strong><span className={styles.tall}>{rad.score} brutto slag</span></div>) : <p className={styles.tom}>Ingen fullførte runder i perioden.</p>}<p className={styles.meta}>Inntil 50 nyeste tester og runder i perioden. Treningstallene gjelder alle øktene i utvalget.</p></section>}
    {fane === 'teknisk-plan'  && <section className={styles.seksjon}><h2>Teknisk plan</h2>{!data.planer.length && <p className={styles.tom}>Ingen teknisk plan er opprettet.</p>}{data.planer.map(p => <div key={p.id}><h3>{p.navn} · {p.status === 'ACTIVE' ? 'Aktiv' : p.status === 'DRAFT' ? 'Utkast' : 'Arkivert'}</h3>{p.positions.map(pos => <div key={pos.id}><h3>{pos.pNummer} · {pos.navn}</h3>{pos.tasks.map(t => <div className={styles.rad} key={t.id}><div><strong>{t.tittel}</strong><p className={styles.tall}>{t.repsGjortDry + t.repsGjortLav + t.repsGjortFull} av {t.repsMaalDry + t.repsMaalLav + t.repsMaalFull} repetisjoner</p></div></div>)}</div>)}</div>)}</section>}
  </div></WangAppSkall>;
}
