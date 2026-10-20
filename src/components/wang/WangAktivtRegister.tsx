import Link from 'next/link';
export const WANG_AKTIVE_INNGANGER = [
  { id: 'WG-01', navn: 'I dag', href: '/team-wang/coach?omraade=idag' },
  { id: 'WG-02', navn: 'Spilleroversikt', href: '/team-wang/coach?omraade=elever' },
  { id: 'WG-03', navn: 'Delt spillerprofil', href: '/team-wang/coach?omraade=elever' },
  { id: 'WG-04', navn: 'Gruppeplan', href: '/team-wang/coach?omraade=trening&fane=dag' },
  { id: 'WG-06', navn: 'Tester og resultater', href: '/team-wang/coach/tester' },
  { id: 'WG-07', navn: 'Konkurranse', href: '/team-wang/coach?omraade=konkurranse' },
  { id: 'WG-08', navn: 'Gruppeinnboks', href: '/team-wang/coach?omraade=meldinger' },
  { id: 'WG-09', navn: 'Forslag til spiller', href: '/team-wang/coach?omraade=meldinger' },
  { id: 'WG-10', navn: 'Administrasjon', href: '/team-wang/coach?omraade=admin', admin: true },
  { id: 'WG-11', navn: 'Deling og tillatt innsyn', href: '/team-wang/coach?omraade=elever' },
  { id: 'WG-12', navn: 'Skole og kompetansemål', href: '/team-wang/coach?omraade=trening&fane=skole' },
  { id: 'WG-14', navn: 'Samlinger og program', href: '/team-wang/coach?omraade=trening&fane=samlinger' },
  { id: 'WG-15', navn: 'Individuelle gruppeoppgaver', href: '/team-wang/coach?omraade=trening&fane=oppgaver' },
  { id: 'WG-16', navn: 'Registrert gruppebelastning', href: '/team-wang/coach?omraade=trening&fane=belastning' },
  { id: 'WG-17', navn: 'Utviklingssamtale', href: '/team-wang/coach?omraade=elever' },
  { id: 'WG-WB', navn: 'Skrivebeskyttet individuell plan', href: '/team-wang/coach?omraade=elever' },
  { id: 'WG-TP-01', navn: 'Teknisk plan', href: '/team-wang/coach?omraade=elever' },
  { id: 'WG-04-OKT', navn: 'Gruppeøkt og individuelle oppgaver', href: '/team-wang/coach?omraade=trening&fane=dag' },
] as const;
export function WangAktivtRegister({ sportssjef }: { sportssjef: boolean }) {
  return <section><h1>WANG · aktive innganger</h1><p>Inngangene følger samme arbeidsflate. Spillerprofil, individuell plan og samtale åpnes etter at en spiller er valgt og tilgangen er kontrollert.</p><ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>{WANG_AKTIVE_INNGANGER.filter(r => !('admin' in r) || sportssjef).map(r => <li key={r.id}><Link className="wg-btn wg-btn-secondary" href={r.href}>{r.navn}</Link><small style={{ marginLeft: 12 }}>{r.id}</small></li>)}</ul></section>;
}
