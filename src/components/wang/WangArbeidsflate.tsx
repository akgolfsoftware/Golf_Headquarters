'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import type { WangLiveData } from '@/app/team-wang/_data/hent-wang-gruppe';
import type { GruppeKalenderData } from '@/lib/gruppe-kalender/types';
import { byggDagblokker, byggManedsdager, finnDagsdetaljer } from '@/lib/gruppe-kalender/bygg-visninger';
import type { WangOmraade } from './WangAppSkall';
import type { WangKobletElev } from './WangKobledeVisninger';
import { WangGruppeMeldinger, type WangGruppePost } from './WangGruppeMeldinger';
import { OrgGruppeOppgaver } from '@/components/team-norway/OrgGruppeOppgaver';
import { MonthPlan } from '@/components/workbench/MonthPlan';
import { SamlingsprogramKontroll } from '@/components/workbench/SamlingsprogramKontroll';
import { TrenerforslagSkjema } from '@/components/workbench/Trenerforslag';
import type { OrgGruppeOppgaverData } from '@/lib/domain/org-gruppeoppgaver-kontrakt';
import styles from './wang-arbeidsflate.module.css';

const VISNINGER = ['ar', 'periode', 'maned', 'uke', 'dag', 'samlinger', 'skole', 'oppgaver', 'belastning'] as const;
type Visning = typeof VISNINGER[number];
const NAVN: Record<Visning, string> = { ar: 'År', periode: 'Periode', maned: 'Måned', uke: 'Uke', dag: 'Dag', samlinger: 'Samlinger', skole: 'Skole', oppgaver: 'Individuelle oppgaver', belastning: 'Belastning' };
const DAGER = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
function iso(dato: Date) { return dato.toISOString().slice(0, 10); }
function fraIso(dato: string) { return new Date(`${dato.slice(0, 10)}T12:00:00Z`); }
function datoTekst(dato: string) { return fraIso(dato).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }
function idagIso() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo' }).format(new Date()); }
function flyttDato(dato: string, dager: number) { const d = fraIso(dato); d.setUTCDate(d.getUTCDate() + dager); return iso(d); }
function visningFra(fane?: string): Visning { return VISNINGER.includes(fane as Visning) ? fane as Visning : 'dag'; }
const TITLER: Record<WangOmraade, string> = { idag: 'I dag', trening: 'Gruppeplan', tester: 'Tester', konkurranse: 'Konkurranse', meldinger: 'Samarbeid', elever: 'Spillere', admin: 'Administrasjon', system: 'Skjermoversikt' };

function Seksjon({ tittel, barn }: { tittel: string; barn: ReactNode }) {
  return <section className={styles.seksjon}><h2>{tittel}</h2>{barn}</section>;
}
function Tom({ children }: { children: ReactNode }) { return <p className={styles.tom}>{children}</p>; }
function Handlingslenke({ href, children }: { href: string; children: ReactNode }) { return <Link className={styles.handling} href={href}>{children}</Link>; }

/** Auth-gated roster and calendar; the page validates the matching group before passing data. */
export function WangArbeidsflate({ omraade, fane, live, kalender, elever, campus, kanPublisere, onNaviger, gruppeOppgaver, oppgaveFeil, innlegg = [], meldingsTilgang = false }: {
  omraade: WangOmraade; fane?: string; live: WangLiveData; kalender: GruppeKalenderData; elever: WangKobletElev[]; campus: string; kanPublisere: boolean;
  gruppeOppgaver?: OrgGruppeOppgaverData | null; oppgaveFeil?: string; innlegg?: WangGruppePost[]; meldingsTilgang?: boolean;
  onNaviger: (omraade: WangOmraade, fane?: string) => void;
}) {
  const [forslagSpiller, setForslagSpiller] = useState('');
  const [dato, setDato] = useState(idagIso);
  const valgtVisning = visningFra(fane);
  const [periodeId, setPeriodeId] = useState(kalender.perioder.find(p => dato >= p.startDate.slice(0, 10) && dato < p.endDate.slice(0, 10))?.id ?? kalender.perioder[0]?.id ?? '');
  const valgtPeriode = kalender.perioder.find(p => p.id === periodeId);
  const gruppeSti = `/admin/grupper/${encodeURIComponent(live.gruppeId)}`;

  function dagsinnhold(dag: string) {
    const ukedag = (fraIso(dag).getUTCDay() + 6) % 7;
    const publiserte = gruppeOppgaver?.gruppeOkter?.filter(o => o.date === dag) ?? [];
    const trening = byggDagblokker(kalender.faste, ukedag);
    const detaljer = finnDagsdetaljer(kalender, dag, null);
    // Coach sees all class years; the shared day helper intentionally filters to one class.
    const skole = kalender.skoleHendelser.filter(h => h.date.slice(0, 10) === dag);
    return <>
      {detaljer.periode && <p className={styles.meta}>{detaljer.periode.name}{detaljer.periode.note ? ` · ${detaljer.periode.note}` : ''}</p>}
      {publiserte.map(o => <details className={styles.periode} key={o.id}><summary><strong>{o.title}</strong> · <span className={styles.tall}>{String(Math.floor(o.startMinute/60)).padStart(2,'0')}:{String(o.startMinute%60).padStart(2,'0')} · {o.durationMinutes} min</span></summary><p>Publisert gruppeøkt · Fra WANG</p><ul>{o.drills.map(d => <li key={d.id}>{d.title} · {d.durationMinutes} min</li>)}</ul><button type="button" className={styles.sekundar} onClick={() => onNaviger('trening','oppgaver')}>Åpne individuelle oppgaver</button></details>)}
      {trening.map(t => <div className={styles.rad} key={t.id}><CalendarDays aria-hidden size={20} /><div><strong>{t.tittel}</strong><p><span className={styles.tall}>{t.tid}</span> · Fra WANG</p></div><Link className={styles.sekundar} href={`${gruppeSti}/workbench?dato=${dag}`}>Åpne økt</Link></div>)}
      {detaljer.samlinger.map(s => <div className={styles.rad} key={s.id}><div><strong>{s.title}</strong><p>{s.location ?? 'Sted ikke oppgitt'} · Fra WANG</p></div><Link className={styles.sekundar} href={`${gruppeSti}/timeplan`}>Program</Link></div>)}
      {skole.map(h => <div className={styles.rad} key={h.id}><div><strong>{h.title}</strong><p>{h.classYear ?? 'Alle trinn'}{h.note ? ` · ${h.note}` : ''}</p></div></div>)}
      {detaljer.turneringer.map(t => <div className={styles.rad} key={t.id}><div><strong>{t.navn}</strong><p>{t.location ?? t.serie}</p></div>{t.slug && <Link className={styles.sekundar} href={`/turneringer/${t.slug}`}>Åpne</Link>}</div>)}
      {!publiserte.length && !trening.length && !detaljer.samlinger.length && !skole.length && !detaljer.turneringer.length && <Tom>Ingen registrerte økter eller hendelser denne dagen.</Tom>}
    </>;
  }

  function kalenderinnhold() {
    const d = fraIso(dato);
    const aar = d.getUTCFullYear();
    const maaned = d.getUTCMonth() + 1;
    const mandag = flyttDato(dato, -((d.getUTCDay() + 6) % 7));
    return <>
      <div className={styles.faner} aria-label="Planvisning">{VISNINGER.map(v => <button type="button" key={v} aria-pressed={valgtVisning === v} onClick={() => onNaviger('trening', v)}>{NAVN[v]}</button>)}</div>
      <div className={styles.verktøy}>
        <div className={styles.datovalg}><button type="button" aria-label="Forrige" onClick={() => { const ny = fraIso(dato); if (valgtVisning === 'ar') ny.setUTCFullYear(aar - 1); else if (valgtVisning === 'maned') ny.setUTCMonth(maaned - 2, 1); else ny.setUTCDate(ny.getUTCDate() - (valgtVisning === 'uke' ? 7 : 1)); setDato(iso(ny)); }}><ArrowLeft size={18} /></button><label>Dato<input aria-label="Velg dato" type="date" value={dato} onChange={e => e.target.value && setDato(e.target.value)} /></label><button type="button" aria-label="Neste" onClick={() => { const ny = fraIso(dato); if (valgtVisning === 'ar') ny.setUTCFullYear(aar + 1); else if (valgtVisning === 'maned') ny.setUTCMonth(maaned, 1); else ny.setUTCDate(ny.getUTCDate() + (valgtVisning === 'uke' ? 7 : 1)); setDato(iso(ny)); }}><ArrowRight size={18} /></button></div>
        {kanPublisere && <Handlingslenke href={`${gruppeSti}/workbench`}>Rediger gruppeplan</Handlingslenke>}
      </div>
      {valgtVisning === 'ar' && <Seksjon tittel={`Årsplan ${aar}`} barn={<>{kalender.perioder.filter(p => p.startDate.slice(0, 4) <= String(aar) && p.endDate.slice(0, 4) >= String(aar)).map(p => <button type="button" className={styles.periode} key={p.id} onClick={() => { setPeriodeId(p.id); onNaviger('trening', 'periode'); }}><strong>{p.name}</strong><span className={styles.meta}>{datoTekst(p.startDate)} – {datoTekst(flyttDato(p.endDate, -1))}</span>{p.note && <span>{p.note}</span>}</button>)}{!kalender.perioder.length && <Tom>Ingen perioder er lagt inn. Gruppeplanen viser lagrede perioder når de er publisert.</Tom>}</>} />}
      {valgtVisning === 'periode' && <Seksjon tittel="Periodens fokus" barn={<><label className={styles.felt}>Periode<select value={periodeId} onChange={e => setPeriodeId(e.target.value)}>{!kalender.perioder.length && <option value="">Ingen registrerte perioder</option>}{kalender.perioder.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{valgtPeriode ? <><h3>{valgtPeriode.name}</h3><p>{valgtPeriode.note ?? 'Ingen felles beskrivelse er lagt inn.'}</p><p className={styles.tall}>{datoTekst(valgtPeriode.startDate)} – {datoTekst(flyttDato(valgtPeriode.endDate, -1))}</p><h3>Kompetansemål</h3>{valgtPeriode.kompetansemal.length ? <ul>{valgtPeriode.kompetansemal.map(m => <li key={m.id}>{m.classYear} · {m.text}</li>)}</ul> : <Tom>Ingen kompetansemål er knyttet til perioden.</Tom>}<button className={styles.sekundar} type="button" onClick={() => { setDato(valgtPeriode.startDate.slice(0, 10)); onNaviger('trening', 'uke'); }}>Se periodens første uke</button></> : <Tom>Ingen periode er valgt.</Tom>}</>} />}
      {valgtVisning === 'maned' && <MonthPlan owner={{ kind: 'group', groupId: live.gruppeId }} year={aar} month={maaned} />}
      {valgtVisning === 'maned' && <Seksjon tittel={d.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric', timeZone: 'UTC' })} barn={<div className={styles.maned}>{byggManedsdager(kalender.faste, aar, maaned, kalender.samlinger, kalender.skoleHendelser, null, kalender.turneringer).map(dag => <button type="button" key={dag.date} className={styles.manedsdag} onClick={() => { setDato(`${aar}-${String(maaned).padStart(2, '0')}-${String(dag.date).padStart(2, '0')}`); onNaviger('trening', 'dag'); }}><strong className={styles.tall}>{dag.date}</strong>{dag.okter?.slice(0, 2).map(o => <span key={o.id}>{o.tittel}</span>)}{(dag.okter?.length ?? 0) > 2 && <span>+{dag.okter!.length - 2} hendelser</span>}</button>)}</div>} />}
      {valgtVisning === 'uke' && <div className={styles.uke}>{DAGER.map((navn, i) => <Seksjon key={navn} tittel={`${navn} ${datoTekst(flyttDato(mandag, i))}`} barn={dagsinnhold(flyttDato(mandag, i))} />)}</div>}
      {valgtVisning === 'dag' && <Seksjon tittel={datoTekst(dato)} barn={dagsinnhold(dato)} />}
      {valgtVisning === 'samlinger' && <Seksjon tittel="Samlinger og program" barn={<>{kalender.samlinger.map(s => <div className={styles.rad} key={s.id}><div><strong>{s.title}</strong><p>{datoTekst(s.startAt)} – {datoTekst(s.endAt)} · {s.location ?? 'Sted ikke oppgitt'}</p></div><Link className={styles.sekundar} href={`${gruppeSti}/timeplan`}>Åpne program</Link></div>)}{!kalender.samlinger.length && <Tom>Ingen samlinger er registrert for gruppen.</Tom>}{kalender.samlinger.map(s => <div key={`${s.id}-program`}><h3>{s.title} · Program og reise</h3><p>{live.hendelser.find(h => h.id === s.id)?.beskrivelse ?? 'Program og reiseinformasjon er ikke lagt inn.'}</p></div>)}{kanPublisere && <SamlingsprogramKontroll organisasjon="WANG" planHref={`${gruppeSti}/workbench`} samlinger={kalender.samlinger.filter(s => s.endAt.slice(0,10) >= idagIso()).map(s => ({ id: s.id, tittel: s.title, fra: s.startAt, til: s.endAt, sted: s.location }))} />}</>} />}
      {valgtVisning === 'skole' && <Seksjon tittel="Skole og prøveplan" barn={<>{kalender.skoleHendelser.map(h => <div className={styles.rad} key={h.id}><div><strong>{h.title}</strong><p>{datoTekst(h.date)} · {h.classYear ?? 'Alle trinn'}{h.note ? ` · ${h.note}` : ''}</p></div></div>)}{!kalender.skoleHendelser.length && <Tom>Ingen skolehendelser er lagt inn. Oppmøte føres i skolens system.</Tom>}{kanPublisere && <Link className={styles.sekundar} href={`${gruppeSti}/arsplan/skoledata`}>Rediger skolehendelser</Link>}</>} />}
      {(valgtVisning === 'oppgaver' || valgtVisning === 'belastning') && <Seksjon tittel={NAVN[valgtVisning]} barn={gruppeOppgaver ? <OrgGruppeOppgaver data={gruppeOppgaver} visning={valgtVisning} kanRedigere={kanPublisere} /> : <Tom>{oppgaveFeil ?? 'Kunne ikke hente gruppeoppgavene.'}</Tom>} />}
      <p className={styles.meta}>Gruppetid og samlinger eies av WANG. Individuelle oppgaver følger gruppetiden. Endringer i spillerens egen plan sendes som forslag.</p>
    </>;
  }

  return <div className={styles.arbeidsflate} data-org="wang" data-screen-family={`WG-${omraade}`}>
    <header className={styles.hode}><p className={styles.meta}>{live.gruppeNavn} · {campus}</p><h1>{TITLER[omraade]}</h1><p>{datoTekst(dato)} · Fra WANG</p></header>
    {omraade === 'idag' && <><Seksjon tittel="Dagens gruppeøkt" barn={dagsinnhold(dato)} /><div className={styles.snarveier}><Handlingslenke href="/team-wang/coach?omraade=trening&fane=uke">Åpne gruppeuken</Handlingslenke><Link className={styles.sekundar} href="/team-wang/coach/tester">Testresultater</Link></div><Seksjon tittel="Spillere og oppfølging" barn={<><p><span className={styles.tall}>{elever.length}</span> spillere i gruppen. Oppfølging vurderes fra delt IUP og faktiske testresultater.</p><Link className={styles.sekundar} href="/team-wang/coach?omraade=elever">Åpne spilleroversikt</Link></>} /></>}
    {omraade === 'trening' && kalenderinnhold()}
    {omraade === 'elever' && <Seksjon tittel="Spilleroversikt" barn={<>{elever.map(e => <div className={styles.rad} key={e.id}><div><strong>{e.navn}</strong><p>{e.trinn ?? "Trinn ikke registrert"}</p><p>{e.kanSeProfil === false ? 'Personlig innsyn er ikke delt med deg' : 'Personlig innsyn delt med deg'} · {e.delerTester ? 'Tester delt' : 'Testdeling ikke aktiv'}</p></div>{e.kanSeProfil !== false && <div className={styles.snarveier}><Link className={styles.sekundar} href={`/team-wang/coach/spiller/${e.id}`}>Profil og plan</Link><Link className={styles.sekundar} href={`/team-wang/coach/turneringer/${e.id}`}>Konkurranse</Link></div>}</div>)}{!elever.length && <Tom>Ingen aktive spillere i gruppen.</Tom>}<p className={styles.meta}>Personlig innsyn åpnes bare når spilleren har delt med deg. Gruppemedlemskap gir ikke tilgang til hele profilen.</p></>} />}
    {omraade === 'tester' && <Seksjon tittel="Tester og resultater" barn={<><p>Se registrerte tester for spillere med gyldig testdeling. Under 16 år kreves også forelderens samtykke. Trekking fjerner også eldre resultater.</p><Handlingslenke href="/team-wang/coach/tester">Åpne testresultater</Handlingslenke><p className={styles.meta}>Testresultatene viser protokoll, resultat og dato. Leveringsgrad krever en faktisk tildeling eller testdag.</p></>} />}
    {omraade === 'konkurranse' && <><Seksjon tittel="Turneringsplan" barn={<>{kalender.turneringer.map(t => <div className={styles.rad} key={t.id}><div><strong>{t.navn}</strong><p>{datoTekst(t.startDate)} · {t.location ?? t.serie}</p></div>{t.slug && <Link className={styles.sekundar} href={`/turneringer/${t.slug}`}>Åpne</Link>}</div>)}{!kalender.turneringer.length && <Tom>Ingen turneringer registrert i kalenderen.</Tom>}</>} /><Seksjon tittel="Spillerens resultater" barn={<>{elever.map(e => <Link className={styles.periode} href={`/team-wang/coach/turneringer/${e.id}`} key={e.id}>{e.navn}</Link>)}</>} /></>}
    {omraade === 'meldinger' && (meldingsTilgang ? <WangGruppeMeldinger innlegg={innlegg} gruppeNavn={live.gruppeNavn} /> : <Seksjon tittel="Gruppens innboks" barn={<p>Du har ikke aktiv tilgang til gruppens innboks. Gruppetilgangen må være registrert før du kan lese eller publisere.</p>} />)}
    {omraade === 'meldinger' && <Seksjon tittel="Samarbeid og utviklingssamtale" barn={<><p>Velg en spiller for delt IUP, samtale, tiltak og neste oppfølging.</p>{elever.filter(e => e.kanSeProfil !== false).map(e => <Link className={styles.periode} href={`/team-wang/coach/iup/${e.id}`} key={e.id}>{e.navn} · Åpne IUP</Link>)}{!elever.length && <Tom>Ingen aktive spillere i gruppen.</Tom>}<label className={styles.felt}>Forslag utenfor gruppetid<select value={forslagSpiller} onChange={e => setForslagSpiller(e.target.value)}><option value="">Velg spiller</option>{elever.map(e => <option key={e.id} value={e.id} disabled={e.kanSeProfil === false}>{e.navn}{e.kanSeProfil === false ? " · Innsyn mangler" : ""}</option>)}</select></label>{forslagSpiller && <TrenerforslagSkjema organisasjon="WANG" spillerId={forslagSpiller} />}
      <p className={styles.meta}>Gruppedokumenter og felles program samles med gruppen. Oppmøte håndteres av skolen.</p><Link className={styles.sekundar} href={gruppeSti}>Åpne gruppen</Link></>} />}
    {omraade === 'admin' && <Seksjon tittel="Gruppe, roller og skole" barn={<div className={styles.snarveier}><Handlingslenke href={gruppeSti}>Administrer gruppen</Handlingslenke><Link className={styles.sekundar} href={`${gruppeSti}/timeplan`}>Gruppetider og samlinger</Link><Link className={styles.sekundar} href={`${gruppeSti}/arsplan/skoledata`}>Skolehendelser</Link><Link className={styles.sekundar} href="/team-wang/coach/tester">Testdeling og resultater</Link></div>} />}
  </div>;
}
