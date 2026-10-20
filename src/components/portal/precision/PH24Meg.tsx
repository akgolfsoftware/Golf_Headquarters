/**
 * PH-24 Meg i designløftet 20.10.2026: avatar og navn, tre nøkkeltall (Kategori, HCP, Nivå) og lenkene i tre grupper
 * (Spiller · Coach og deling · Konto). Fasit: Claude Design-canvaset «PlayerHQ nøkkelskjermer»
 * (https://claude.ai/artifact/XdsbBEHwJhdrD4YJMMpdK1), «6 Meg · mobil 390» og «PC 1280».
 * Stil: src/styles/playerhq-ny-meg.css (§Designløft Meg). Ingen "use client": oversikten er bare lenker og ett skjema (Logg ut).
 *
 * Avvik (20.10):
 *   - Min coach, Foreldre og Målsetninger står i gruppa «Coach og deling» (tegningen har bare Deling, Bookinger og Utfordringer):
 *     funksjonene beholdes. «Sikkerhet» er slått sammen med «Innstillinger og samtykker», som i dag.
 *   - Fasiliteter viser «N av 10» (anlegg og utstyr), ikke «14 av 19 områder»: dekningen av de 19 områdene kan ikke regnes.
 *   - Nivåtallet viser prøveuke og trekkdato bare når appen kjenner dem; ellers står forklaringen fra abonnementet.
 *
 * Eldre avvik:
 *   - Kategori (A–K) vises som «—»: kategorien er ikke lagret på spilleren ennå.
 *   - HCP-ruten viser HCP fra profilen uten dato: appen lagrer ikke når HCP sist ble hentet fra NGF.
 *   - Fasilitet-ruten viser hvor mange anlegg og utstyr spilleren har krysset av (av 10), ikke dekning av
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
import { initialer } from "@/lib/portal/initialer";
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
  utfordringer: number;
  hrefs: {
    profil: string; fasiliteter: string; utstyr: string; helse: string; coach: string; bookinger: string; mal: string;
    foreldre: string; deling: string; utfordringer: string; abo: string; innstillinger: string; hjelp: string;
  };
};

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

  return <div className="phn phn-meg phn-meg2"><div className="side">
    <header className="m2-hode">
      <span className="avatar stor" aria-hidden>{initialer(p.navn)}</span>
      <div>
        <h1 className="phn-tittel">{p.navn}</h1>
        <p className="phn-forklar">{p.undertekst ?? "Meg"}{p.gruppe ? ` · ${p.gruppe}` : ""}</p>
      </div>
      <dl className="m2-tall">
        <div><dt>Kategori</dt><dd><b>{p.kategori ?? "—"}</b><small>AK A–K</small></dd></div>
        <div><dt>HCP</dt><dd><b>{p.hcp ?? "—"}</b><small>Fra profilen</small></dd></div>
        <div><dt>Nivå</dt><dd><b>{p.niva.navn}</b><small>{p.pakke ? `${p.pakke.igjen} klipp igjen av ${p.pakke.totalt}` : p.niva.tekst}</small></dd></div>
      </dl>
    </header>

    <div className="m2-kol">
      <div>
        <section className="m2-gruppe" aria-labelledby="meg-spiller">
          <h2 id="meg-spiller">Spiller</h2>
          <div className="liste">
            <Rad href={h.profil} ikon={<Boks><User size={18} /></Boks>} tittel="Profil" kilde="Personalia, HCP, klubb og turneringsresultater" />
            <Rad href={h.fasiliteter} ikon={<Boks><Building2 size={18} /></Boks>} tittel="Fasiliteter" kilde={`Hvor du kan trene · ${flertall(p.fasiliteter.steder, "sted", "steder")} registrert`} hoyre={<span className="hoyre">{p.fasiliteter.valgte} av {p.fasiliteter.totalt}<Pil /></span>} />
            <Rad href={h.utstyr} ikon={<Boks><Wrench size={18} /></Boks>} tittel="Utstyr" kilde={p.utstyr > 0 ? `${flertall(p.utstyr, "post", "poster")} i bagen` : "Bagen er ikke registrert"} />
            <Rad href={h.helse} ikon={<Boks><HeartPulse size={18} /></Boks>} tittel="Helse og fravær" kilde={p.helse} />
          </div>
        </section>
      </div>

      <div>
        <section className="m2-gruppe" aria-labelledby="meg-coach">
          <h2 id="meg-coach">Coach og deling</h2>
          <div className="liste">
            {p.coach
              ? <Rad href={h.coach} ikon={<span className="avatar" aria-hidden>{initialer(p.coach.navn)}</span>} tittel={`Min coach: ${p.coach.navn}`} kilde={p.coach.program} />
              : <Rad href={h.coach} ikon={<Boks><User size={18} /></Boks>} tittel="Min coach" kilde="Ingen coach ennå. Book en time for å komme i gang." />}
            <Rad href={h.deling} ikon={<Boks><Share2 size={18} /></Boks>} tittel="Deling" kilde="Hvem ser testene og planen" hoyre={p.deling != null ? <span className="hoyre">{p.deling} {p.deling === 1 ? "har" : "har"} tilgang<Pil /></span> : undefined} />
            <Rad href={h.bookinger} ikon={<Boks><CalendarDays size={18} /></Boks>} tittel="Bookinger" kilde="Timer med coach" hoyre={<span className="hoyre">{p.nesteBooking ? `Neste: ${p.nesteBooking}` : "Ingen kommende"}<Pil /></span>} />
            <Rad href={h.utfordringer} ikon={<Boks><Users size={18} /></Boks>} tittel="Utfordringer" kilde="Med gruppa" hoyre={<span className="hoyre">{p.utfordringer} pågår<Pil /></span>} />
            <Rad href={h.foreldre}
              ikon={p.foreldre.navn ? <span className="avatar lys" aria-hidden>{initialer(p.foreldre.navn)}</span> : <Boks><Users size={18} /></Boks>}
              tittel="Foreldre"
              kilde={p.foreldre.antall === 0 ? "Ingen forelder er koblet til" : p.foreldre.antall === 1 && p.foreldre.navn ? `${p.foreldre.navn} er koblet til profilen din` : `${p.foreldre.antall} foreldre er koblet til`} />
            <Rad href={h.mal} ikon={<Boks><Target size={18} /></Boks>} tittel="Målsetninger" kilde="Ligger i Plan › Workbench" hoyre={<span className="hoyre">Plan<Pil /></span>} />
          </div>
        </section>

        <section className="m2-gruppe" aria-labelledby="meg-konto">
          <h2 id="meg-konto">Konto</h2>
          <div className="liste">
            <Rad href={h.abo} ikon={<Boks><CreditCard size={18} /></Boks>} tittel="Abonnement" kilde={`${p.niva.navn} · ${p.niva.tekst}`} />
            <Rad href={h.innstillinger} ikon={<Boks><Settings size={18} /></Boks>} tittel="Innstillinger og samtykker" kilde="Varsler, kalender, samtykker og sikkerhet" />
            <Rad href={h.hjelp} ikon={<Boks><CircleHelp size={18} /></Boks>} tittel="Hjelp og kontakt" kilde="Artikler og skriv til oss" />
          </div>
          <form action={logout}>
            <button type="submit" className="phn-knapp sek"><LogOut size={18} aria-hidden />Logg ut</button>
          </form>
        </section>
      </div>
    </div>
  </div></div>;
}
