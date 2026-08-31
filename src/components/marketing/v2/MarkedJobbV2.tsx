/* AK Golf HQ — MARKEDSSIDE: Jobb hos oss (/jobb).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §forside (skallvariant 1) — hero, kort-rutenett og sentrert avslutning.
   Skallet er PkShell (variant «side»). Ingen inline-stiler, ingen egne farger.
   COPY: uendret fra forrige versjon. */

import { PkShell } from "./kit/PkShell";

type Stilling = { tittel: string; sted: string; type: string; beskrivelse: string };

const STILLINGER: Stilling[] = [
  {
    tittel: "Golfcoach (deltid)",
    sted: "Fredrikstad",
    type: "50–80 %",
    beskrivelse:
      "Vi ser etter en engasjert coach med erfaring fra juniorutvikling og/eller voksne amatørspillere. Du vil jobbe tett med Anders Kristiansen, bruke PlayerHQ til å følge opp spillere og bidra til å bygge AK Golf Academy videre.",
  },
  {
    tittel: "Junior-trener (sesong)",
    sted: "Fredrikstad",
    type: "Mai–september",
    beskrivelse:
      "Sesongjobb for deg som brenner for å utvikle unge golfspillere. Du vil lede treningsgrupper for U10–U18, samarbeide med foreldrene og rapportere progresjon gjennom sesongen. PGA-utdanning er en fordel, men ikke et krav.",
  },
];

const VERDIER: { t: string; d: string }[] = [
  {
    t: "Data-drevet coaching",
    d: "Vi bruker Trackman, PlayerHQ og Strokes Gained-analyse i alle coachingsesjoner. Du lærer å lese og bruke data som en proff.",
  },
  {
    t: "Tett samarbeid",
    d: "Teamet er lite, så du jobber direkte med Academy-ledelsen og har reell innflytelse på metoder og opplegg.",
  },
  {
    t: "Faglig utvikling",
    d: "Vi støtter videreutdanning, kursing og konferanse-deltakelse. Din faglige vekst er en del av teamets vekst.",
  },
];

export function MarkedJobbV2() {
  return (
    <PkShell variant="side" dataSlug="marketing-jobb">
      <div className="pk-sek">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Karriere</span>
          <h1 className="pk-hero">Bli en del av teamet.</h1>
          <p className="pk-ing">
            Vi er et lite team med store ambisjoner. Hos oss jobber du med de beste verktøyene, tett
            på spillerne, og med rom til å vokse som coach og fagperson.
          </p>

          <div className="pk-rutenett">
            {VERDIER.map((v) => (
              <div className="pk-mkort" key={v.t}>
                <h3 className="pk-und">{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Aktive stillinger</span>
          <h2 className="pk-sekt">Vi søker deg.</h2>
          <div className="pk-rutenett">
            {STILLINGER.map((s) => (
              <div className="pk-mkort" key={s.tittel}>
                <span className="pk-eyebrow">
                  {s.sted} · {s.type}
                </span>
                <h3 className="pk-und">{s.tittel}</h3>
                <p>{s.beskrivelse}</p>
                <a
                  className="pk-btn pk-btn-sm pk-knapp-topp"
                  href={`mailto:post@akgolf.no?subject=${encodeURIComponent(`Søknad: ${s.tittel}`)}`}
                >
                  Søk stilling
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <span className="pk-eyebrow">Spontansøknad</span>
          <h2 className="pk-sekt">Finner du ikke din drømmestilling?</h2>
          <p className="pk-ing">
            Send oss en spontansøknad. Fortell hvem du er, hva du brenner for og hva du kan bidra
            med. Vi leser alle henvendelser og svarer innen 3 virkedager.
          </p>
          <div className="pk-knapperad pk-knapperad-midt">
            <a className="pk-btn pk-btn-ink" href="mailto:post@akgolf.no?subject=Spontansøknad">
              Send spontansøknad
            </a>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
