/* AK Golf HQ — MARKEDSSIDE: Junior (/junior).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §forside (skallvariant 1) — hero, kort-rutenett, linjeliste og avslutning.
   Skallet er PkShell (variant «side»). Ingen inline-stiler, ingen egne farger.
   COPY: uendret fra forrige versjon. */

import Link from "next/link";
import { PkShell } from "./paper/PkShell";

type Gruppe = { gruppe: string; alder: string; krav: string; frekvens: string; sesong: string };

const GRUPPER: Gruppe[] = [
  {
    gruppe: "U10",
    alder: "Under 10 år",
    krav: "Ingen krav, nybegynnere hjertelig velkomne",
    frekvens: "1 gang per uke",
    sesong: "Mai–september (utendørs)",
  },
  {
    gruppe: "U14",
    alder: "Under 14 år",
    krav: "Grunnleggende golferfaring, eget sett med køller",
    frekvens: "2 ganger per uke",
    sesong: "Helårs, innendørs Mulligan om vinteren",
  },
  {
    gruppe: "U18",
    alder: "Under 18 år",
    krav: "Handicap under 36, minimum 1 sesong med erfaring",
    frekvens: "2–3 ganger per uke",
    sesong: "Helårs med periodisert treningsplan",
  },
  {
    gruppe: "Talent",
    alder: "14–18 år · elitesatsing",
    krav: "Handicap under 10 og anbefaling fra coach",
    frekvens: "3–5 ganger per uke + turneringer",
    sesong: "Helårs med WANG Toppidrett Fredrikstad",
  },
];

const SESONGPLAN: { periode: string; fokus: string; sted: string }[] = [
  { periode: "Januar–april", fokus: "Innendørs teknikk og fysikk", sted: "Mulligan Fredrikstad / Sarpsborg" },
  { periode: "Mai–juni", fokus: "Overgang utendørs, nærspill", sted: "GFGK (Torsnesveien)" },
  { periode: "Juli–august", fokus: "Turneringer og runde-spilling", sted: "Baner i regionen" },
  { periode: "September–oktober", fokus: "Avslutning sesong, evaluering", sted: "GFGK (Torsnesveien)" },
  { periode: "November–desember", fokus: "Styrke, kondisjon, individuelle mål", sted: "Mulligan Fredrikstad / Sarpsborg" },
];

const PAMELDING: { l: string; v: string }[] = [
  { l: "Sesongstart", v: "1. mai (utendørs)" },
  { l: "Vinterstudio", v: "1. november (innendørs)" },
  { l: "Påmeldingsfrist", v: "Løpende, plass til det er fullt" },
];

const EPOST_PAMELDING =
  "mailto:post@akgolf.no?subject=Junior-p%C3%A5melding&body=Hei!%0A%0ANavn%20p%C3%A5%20junior%3A%20%0AAlder%3A%20%0AE-post%20foresatte%3A%20%0ATelefon%3A%20%0A%0AHilsen";

export function MarkedJuniorV2() {
  return (
    <PkShell variant="side" aktiv="/junior" dataSlug="marketing-junior">
      <div className="pk-sek">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Junior · AK Golf Academy</span>
          <h1 className="pk-hero">Golf for unge talenter.</h1>
          <p className="pk-ing">
            Vi tror på systematisk utvikling fra tidlig alder. AK Golf Academy tilbyr strukturert
            juniortrening tilpasset hvert utviklingstrinn, fra de aller yngste til elitesatsing med
            WANG Toppidrett Fredrikstad.
          </p>
          <div className="pk-knapperad">
            <a className="pk-btn pk-btn-ink" href="#pamelding">
              Meld på junior
            </a>
            <Link className="pk-btn" href="/kontakt">
              Spør oss
            </Link>
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Aldersgrupper</span>
          <h2 className="pk-sekt">Fire veier inn i programmet.</h2>
          <p className="pk-ing">
            Alle grupper trener etter AK Golf-pyramiden og følges opp gjennom PlayerHQ slik at
            foreldre alltid har oversikt over progresjon.
          </p>
          <div className="pk-rutenett">
            {GRUPPER.map((g) => (
              <div className="pk-mkort" key={g.gruppe}>
                <span className="pk-eyebrow">{g.alder}</span>
                <h3 className="pk-und">{g.gruppe}</h3>
                <div className="pk-fakta-liste">
                  <div className="pk-linje">
                    <span>Krav</span>
                    <span className="pk-v">{g.krav}</span>
                  </div>
                  <div className="pk-linje">
                    <span>Treningsfrekvens</span>
                    <span className="pk-v">{g.frekvens}</span>
                  </div>
                  <div className="pk-linje">
                    <span>Sesong</span>
                    <span className="pk-v">{g.sesong}</span>
                  </div>
                </div>
                <a className="pk-btn pk-btn-sm pk-knapp-topp" href="#pamelding">
                  Meld på til {g.gruppe}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Sesongplan</span>
          <h2 className="pk-sekt">Hele året.</h2>
          <div className="pk-fakta-liste">
            {SESONGPLAN.map((s) => (
              <div className="pk-linje" key={s.periode}>
                <span className="num">{s.periode}</span>
                <span>{s.fokus}</span>
                <span className="pk-v">{s.sted}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett" id="pamelding">
        <div className="pk-wrap pk-todelt">
          <div>
            <span className="pk-eyebrow">Påmelding</span>
            <h2 className="pk-sekt">Klar for å starte?</h2>
            <p className="pk-ing">
              Send oss en e-post med navn på junior, alder og kontaktinfo, så tar vi kontakt innen 1
              virkedag. Vi finner riktig gruppe basert på alder og erfaring.
            </p>
            <div className="pk-fakta-liste">
              {PAMELDING.map((r) => (
                <div className="pk-linje" key={r.l}>
                  <span>{r.l}</span>
                  <span className="pk-v">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pk-kort pk-kort-tint pk-kort-pad">
            <span className="pk-eyebrow">Svar innen 1 virkedag</span>
            <h3 className="pk-und">Meld interesse på e-post.</h3>
            <p className="pk-notis">
              Send oss en e-post med navn på junior, alder og kontaktinfo, så tar vi kontakt innen 1
              virkedag.
            </p>
            <a className="pk-btn pk-btn-ink pk-knapp-topp" href={EPOST_PAMELDING}>
              Send e-post til post@akgolf.no
            </a>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
