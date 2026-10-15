/**
 * PH-24 Meg i nytt design (designbrevet 13.10.2026): én oversikt med bilde, navn, fire ruter
 * og resten i fire grupper (Deg · Coaching · Familie og deling · Konto).
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, skjermen «PH-24 Meg»).
 * Stil: src/styles/playerhq-ny-meg.css. Ingen "use client": oversikten er bare lenker og ett skjema (Logg ut).
 *
 * Avvik:
 *   - Kategori (A–K) vises som «—»: kategorien er ikke lagret på spilleren ennå.
 *   - HCP-ruten viser HCP fra profilen uten dato: appen lagrer ikke når HCP sist ble hentet fra NGF.
 *   - Fasilitet-ruten viser hvor mange anlegg og utstyr spilleren har krysset av (av 14), ikke dekning av
 *     de 19 treningsområdene: svarene fra fasilitetsspørsmålene lagres ikke, så dekningen kan ikke regnes.
 *   - Deling-ruten teller organisasjoner spilleren deler med (Team Norway, WANG). Navngitte trenere
 *     og forelder telles ikke med her; de står på Deling-skjermen.
 *   - Målsetninger lenker til Workbench uten «2 på vei»: antall vises når målsetningene er i Workbench.
 *   - Talentradar, Talent «Min plan», roadmap, ukesdigest og «Utenfor banen» vises ikke (utgått).
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-24.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, CalendarDays, ChevronRight, CircleHelp, CreditCard, HeartPulse, LogOut, Settings, Share2, Target, User, Users, Wrench } from "lucide-react";
import { logout } from "@/app/portal/meg/actions";
import { PH24MegFeil } from "./PH24MegTilstand";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";

export type PH24Props = {
  tilstand: "data" | "feil";
  navn: string;
  /** Hjemmeklubb og coach, ferdig satt sammen («Fredrikstad GK · coach Anders Kristiansen»), eller null. */
  undertekst: string | null;
  /** Gruppa spilleren er i (f.eks. «WANG Toppidrett»), eller null. */
  gruppe: string | null;
  kategori: string | null;
  hcp: string | null;
  /** Coaching-pakken med klipp, eller null uten pakke. */
  pakke: { navn: string; igjen: number; totalt: number } | null;
  /** «Full» eller «Gratis» og en kort forklaring. */
  niva: { navn: "Full" | "Gratis"; tekst: string };
  /** Antall organisasjoner spilleren deler med, eller null når det ikke kunne hentes. */
  deling: number | null;
  fasiliteter: { valgte: number; totalt: number; steder: number };
  utstyr: number;
  helse: string;
  coach: { navn: string; program: string } | null;
  nesteBooking: string | null;
  foreldre: { navn: string | null; antall: number };
  venner: number;
  utfordringer: number;
  hrefs: {
    profil: string; fasiliteter: string; utstyr: string; helse: string; coach: string; bookinger: string; mal: string;
    foreldre: string; deling: string; venner: string; abo: string; innstillinger: string; hjelp: string;
  };
};

export function initialer(navn: string): string {
  const d = navn.trim().split(/\s+/).filter(Boolean);
  if (d.length === 0) return "—";
  return ((d[0]?.[0] ?? "") + (d.length > 1 ? d[d.length - 1]?.[0] ?? "" : "")).toUpperCase();
}

const Pil = () => <ChevronRight size={20} aria-hidden />;

function Rad({ href, ikon, tittel, kilde, hoyre }: { href: string; ikon: ReactNode; tittel: string; kilde: string; hoyre?: ReactNode }) {
  return <Link href={href}>
    {ikon}
    <span><b>{tittel}</b><span className="phn-kilde">{kilde}</span></span>
    {hoyre ?? <Pil />}
  </Link>;
}
const Boks = ({ children }: { children: ReactNode }) => <span className="ikonboks" aria-hidden>{children}</span>;

export function PH24Meg(p: PH24Props) {
  if (p.tilstand === "feil") return <PH24MegFeil tittel="Profilen kunne ikke hentes" />;
  const h = p.hrefs;
  const flertall = (n: number, en: string, fler: string) => `${n} ${n === 1 ? en : fler}`;

  return <div className="phn phn-meg"><div className="side">
    <div className="topp"><div><div className="phn-dato">Meg</div><h1 className="phn-tittel">Meg</h1></div></div>

    <div className="hub-grid">
      <div>
        <div className="meg-topp">
          {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
          <img src="/images/playerhq/spill-bane.jpg" alt="" width={1600} height={1067} />
          <div className="mt">
            <span className="avatar stor" aria-hidden>{initialer(p.navn)}</span>
            <div>
              <b className="navn">{p.navn}</b>
              <div className="rad">
                <span className="kat">Kategori {p.kategori ?? "—"}</span>
                {p.gruppe && <span className="phn-pille noy"><i />{p.gruppe}</span>}
              </div>
              {p.undertekst && <p className="phn-kilde" style={{ marginTop: 8 }}>{p.undertekst}</p>}
            </div>
          </div>
        </div>

        <div className="ruter">
          <Link className="rute" href={h.profil}><span className="e">HCP</span><b className="t">{p.hcp ?? "—"}</b><span className="s">Fra profilen din</span></Link>
          {p.pakke
            ? <Link className="rute" href={h.abo}><span className="e">{p.pakke.navn}</span><b className="t">{p.pakke.igjen}<small>klipp</small></b><span className="s">igjen av {p.pakke.totalt} denne perioden</span></Link>
            : <Link className="rute" href={h.abo}><span className="e">Abonnement</span><b className="t">{p.niva.navn}</b><span className="s">{p.niva.tekst}</span></Link>}
          <Link className="rute" href={h.deling}><span className="e">Deling</span><b className="t">{p.deling ?? "—"}</b><span className="s">{p.deling === 1 ? "organisasjon ser profilen din" : "organisasjoner ser profilen din"}</span></Link>
          <Link className="rute fylt" href={h.fasiliteter}><span className="e">Fasiliteter</span><b className="t">{p.fasiliteter.valgte}<small>av {p.fasiliteter.totalt}</small></b><span className="s">anlegg og utstyr</span></Link>
        </div>

        <section className="phn-seksjon" aria-labelledby="meg-deg">
          <div className="phn-sek-topp"><h2 id="meg-deg">Deg</h2></div>
          <div className="liste">
            <Rad href={h.profil} ikon={<Boks><User size={18} /></Boks>} tittel="Profil" kilde="Personalia, HCP, klubb og turneringsresultater" />
            <Rad href={h.fasiliteter} ikon={<Boks><Building2 size={18} /></Boks>} tittel="Fasiliteter" kilde={`Hvor du kan trene · ${flertall(p.fasiliteter.steder, "sted", "steder")} registrert`} />
            <Rad href={h.utstyr} ikon={<Boks><Wrench size={18} /></Boks>} tittel="Utstyr" kilde={p.utstyr > 0 ? `${flertall(p.utstyr, "post", "poster")} i bagen` : "Bagen er ikke registrert"} />
            <Rad href={h.helse} ikon={<Boks><HeartPulse size={18} /></Boks>} tittel="Helse og fravær" kilde={p.helse} />
          </div>
        </section>

        <section className="phn-seksjon" aria-labelledby="meg-coaching">
          <div className="phn-sek-topp"><h2 id="meg-coaching">Coaching</h2></div>
          <div className="liste">
            {p.coach
              ? <Rad href={h.coach} ikon={<span className="avatar" aria-hidden>{initialer(p.coach.navn)}</span>} tittel={`Min coach: ${p.coach.navn}`} kilde={p.coach.program} />
              : <Rad href={h.coach} ikon={<Boks><User size={18} /></Boks>} tittel="Min coach" kilde="Ingen coach ennå. Book en time for å komme i gang." />}
            <Rad href={h.bookinger} ikon={<Boks><CalendarDays size={18} /></Boks>} tittel="Bookinger" kilde={p.nesteBooking ? `Neste: ${p.nesteBooking}` : "Ingen kommende bookinger"} />
            <Rad href={h.mal} ikon={<Boks><Target size={18} /></Boks>} tittel="Målsetninger" kilde="Ligger i Plan › Workbench" hoyre={<span className="hoyre">Plan<Pil /></span>} />
          </div>
        </section>
      </div>

      <div>
        <section className="phn-seksjon" aria-labelledby="meg-familie">
          <div className="phn-sek-topp"><h2 id="meg-familie">Familie og deling</h2></div>
          <div className="liste">
            <Rad href={h.foreldre}
              ikon={p.foreldre.navn ? <span className="avatar lys" aria-hidden>{initialer(p.foreldre.navn)}</span> : <Boks><Users size={18} /></Boks>}
              tittel="Foreldre"
              kilde={p.foreldre.antall === 0 ? "Ingen forelder er koblet til" : p.foreldre.antall === 1 && p.foreldre.navn ? `${p.foreldre.navn} er koblet til profilen din` : `${p.foreldre.antall} foreldre er koblet til`} />
            <Rad href={h.deling} ikon={<Boks><Share2 size={18} /></Boks>} tittel="Deling" kilde="Hvem ser profilen din, og del med trener" />
            <Rad href={h.venner} ikon={<Boks><Users size={18} /></Boks>} tittel="Venner og utfordringer" kilde={`${flertall(p.venner, "venn", "venner")} · ${flertall(p.utfordringer, "utfordring", "utfordringer")} pågår`} />
          </div>
        </section>

        <section className="phn-seksjon" aria-labelledby="meg-konto">
          <div className="phn-sek-topp"><h2 id="meg-konto">Konto</h2></div>
          <div className="liste">
            <Rad href={h.abo} ikon={<Boks><CreditCard size={18} /></Boks>} tittel="Abonnement" kilde={`${p.niva.navn} · ${p.niva.tekst}`} />
            <Rad href={h.innstillinger} ikon={<Boks><Settings size={18} /></Boks>} tittel="Innstillinger og samtykker" kilde="Varsler, kalender, samtykker og sikkerhet" />
            <Rad href={h.hjelp} ikon={<Boks><CircleHelp size={18} /></Boks>} tittel="Hjelp og tilbakemelding" kilde="Spørsmål og svar, skriv til oss" />
          </div>
          <form action={logout}>
            <button type="submit" className="phn-knapp sek"><LogOut size={18} aria-hidden />Logg ut</button>
          </form>
        </section>
      </div>
    </div>
  </div></div>;
}
