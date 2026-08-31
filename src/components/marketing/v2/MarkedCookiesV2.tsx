/* AK Golf HQ — MARKEDSSIDE: Cookies (/cookies).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §prosa (skallvariant 3). Skallet er PkShell (variant «side»), typografien
   er .pk-prosa. Ingen inline-stiler, ingen egne farger.

   JURIDISK TEKST: uendret fra forrige versjon (som i sin tur var kopiert
   100 % fra (mlegacy)/cookies/page.tsx) — kun chrome og typografi er byttet. */

import { PkShell } from "./kit/PkShell";

const SIST_OPPDATERT = "12. mai 2026";

export function MarkedCookiesV2() {
  return (
    <PkShell variant="side" dataSlug="marketing-cookies">
      <div className="pk-sek">
        <div className="pk-wrap pk-wrap-smal">
          <span className="pk-eyebrow">Sist oppdatert {SIST_OPPDATERT}</span>
          <h1 className="pk-hero pk-hero-prosa">Cookies og sporing</h1>
          <div className="pk-prosa">
            <p>
              Slik bruker vi cookies, og hvordan du styrer innstillingene dine.
            </p>

            <h2>Hva er cookies?</h2>
            <p>
              Cookies er små tekstfiler som lagres i nettleseren din når du besøker AK Golf. De
              brukes til å huske preferanser, holde deg innlogget, og forstå hvordan nettstedet
              brukes.
            </p>

            <h2>Kategorier vi bruker</h2>
            <p>
              <strong>1. Strengt nødvendige.</strong> Kreves for at tjenesten skal fungere:
              pålogging, sesjonshåndtering og sikkerhet. Disse kan ikke slås av.
            </p>
            <p>
              <strong>2. Analyse.</strong> Vi bruker Plausible Analytics, en personvernvennlig
              løsning som ikke lagrer personopplysninger og ikke krever samtykke etter norske
              regler. Vi måler aggregert trafikk for å forbedre opplevelsen.
            </p>
            <p>
              <strong>3. Markedsføring.</strong> Vi bruker ikke markedsføringscookies eller
              tredjeparts-piksler i dag. Skulle dette endre seg, ber vi om eksplisitt samtykke.
            </p>
            <p>
              <strong>4. Preferanser.</strong> Brukes til å huske valg du har gjort: språk, tema
              (lyst/mørkt) og hvilke paneler du har åpne i PlayerHQ.
            </p>

            <h2>Slik styrer du innstillingene</h2>
            <p>
              Du kan blokkere eller slette cookies via nettleserens innstillinger. Vær oppmerksom
              på at strengt nødvendige cookies må være aktive for at innlogging skal fungere.
            </p>

            <h2>Kontakt</h2>
            <p>
              Spørsmål om cookies eller personvern kan rettes til{" "}
              <a href="mailto:personvern@akgolf.no">personvern@akgolf.no</a>.
            </p>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
