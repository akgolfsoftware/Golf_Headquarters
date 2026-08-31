/* AK Golf HQ — MARKEDSSIDE: Personvernerklæring (/personvern).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §prosa (skallvariant 3). Skallet er PkShell (variant «side»), typografien
   er .pk-prosa. Ingen inline-stiler, ingen egne farger.

   JURIDISK TEKST: uendret fra forrige versjon — kun chrome og typografi
   er byttet. Ingen omskriving av juridisk innhold. */

import { PkShell } from "./kit/PkShell";

const SIST_OPPDATERT = "2. august 2026";

export function MarkedPersonvernV2() {
  return (
    <PkShell variant="side" dataSlug="marketing-personvern">
      <div className="pk-sek">
        <div className="pk-wrap pk-wrap-smal">
          <span className="pk-eyebrow">Sist oppdatert {SIST_OPPDATERT}</span>
          <h1 className="pk-hero pk-hero-prosa">Personvernerklæring</h1>

          <div className="pk-kort pk-kort-tint pk-kort-pad">
            <p className="pk-notis">
              <strong>Utkast.</strong> Endelig versjon godkjennes med advokat før Q3 2026. Innholdet
              under beskriver hvordan vi behandler personopplysninger i dagens drift.
            </p>
          </div>

          <div className="pk-prosa">
            <h2>1. Behandlingsansvarlig</h2>
            <p>
              AK Golf Group AS, org.nr. 927&nbsp;248&nbsp;581, Bossumveien 6, 1605 Fredrikstad, er
              behandlingsansvarlig for personopplysninger som registreres i AK Golf-tjenesten.
            </p>
            <p>
              Kontakt: <a href="mailto:personvern@akgolf.no">personvern@akgolf.no</a>
            </p>

            <h2>2. Hva vi samler inn</h2>
            <ul>
              <li><strong>Kontaktopplysninger:</strong> navn, e-post, telefon, hjemmeklubb.</li>
              <li><strong>Spillerprofil:</strong> handicap, alder, antall års spilling, ambisjon.</li>
              <li><strong>Trenings- og spilldata:</strong> runder, tester, drills, Trackman-import, AI-chat-historikk.</li>
              <li><strong>Helse-relatert data (frivillig):</strong> hvilepuls, søvn, kun hvis du selv registrerer.</li>
              <li><strong>Tekniske data:</strong> IP-adresse, nettleser, pålogging-tidspunkt, feillogger.</li>
              <li><strong>Betalingsdata:</strong> håndteres av Stripe. Vi lagrer kun ID og status, ikke kortinformasjon.</li>
            </ul>

            <h2>3. Formål og rettslig grunnlag</h2>
            <ul>
              <li><strong>Levere tjenesten</strong> (avtale, GDPR art. 6 nr. 1 b)</li>
              <li><strong>Booking, fakturering, kontakt</strong> (avtale)</li>
              <li><strong>Produktforbedring og analyse</strong> (berettiget interesse, art. 6 nr. 1 f): alltid med anonymisering når mulig</li>
              <li><strong>Markedsføring til eksisterende kunder</strong> (berettiget interesse, kan reservere deg fra i innstillinger)</li>
              <li><strong>Etterleve regnskaps- og bokføringsplikt</strong> (rettslig forpliktelse)</li>
            </ul>

            <h2>4. Databehandlere vi bruker</h2>
            <p>
              Vi deler nødvendige opplysninger med følgende underleverandører, og inngår
              databehandleravtale (DPA) med hver av dem:
            </p>
            <ul>
              <li><strong>Supabase</strong> (London, Storbritannia): database, autentisering, fillagring</li>
              <li><strong>Vercel</strong> (London, Storbritannia): hosting og deploy</li>
              <li><strong>Stripe</strong>: betalingsbehandling</li>
              <li><strong>Resend</strong>: utsendelse av transaksjons-e-post</li>
              <li><strong>Anthropic</strong>: AI-coach (Claude). Anthropic lagrer ikke prompts ut over kort retensjonsperiode for misbrukskontroll</li>
              <li><strong>Deepgram</strong>: tale-til-tekst av coaching-opptak</li>
              <li><strong>Google</strong>: kalendersynkronisering (kun ved aktivert integrasjon)</li>
            </ul>

            <h2>5. Lagringstid</h2>
            <ul>
              <li><strong>Aktive konto-data:</strong> så lenge kontoen er aktiv</li>
              <li><strong>Sletting av konto:</strong> ved forespørsel om sletting deaktiveres kontoen umiddelbart, med 30 dagers angrefrist. Deretter anonymiseres kontoen: personopplysninger (navn, e-post, telefon, bilde, fødselsdato) og all fritekst du selv har skrevet fjernes, mens avidentifisert treningshistorikk kan beholdes for akademiets utviklingsarbeid</li>
              <li><strong>Regnskapsdata (fakturaer, betalinger):</strong> 5 år iht. bokføringsloven</li>
              <li><strong>Coaching-opptak (lyd):</strong> lydfilen slettes automatisk etter 90 dager</li>
              <li><strong>AI-chat-historikk:</strong> du kan be om sletting når som helst, og den slettes uansett ved konto-sletting</li>
            </ul>

            <h2>6. Dine rettigheter</h2>
            <p>Du har rett til:</p>
            <ul>
              <li>Innsyn i hvilke opplysninger vi har om deg</li>
              <li>Retting av feil eller ufullstendige opplysninger</li>
              <li>Sletting («retten til å bli glemt»), gjelder ikke data vi er lovpålagt å beholde</li>
              <li>Begrensning av behandling</li>
              <li>Dataportabilitet: utlevering i maskinlesbart format</li>
              <li>Innsigelse mot behandling basert på berettiget interesse</li>
              <li>
                Klage til Datatilsynet (
                <a href="https://www.datatilsynet.no" target="_blank" rel="noopener">
                  datatilsynet.no
                </a>
                )
              </li>
            </ul>
            <p>
              Send forespørsel til <a href="mailto:personvern@akgolf.no">personvern@akgolf.no</a>. Vi
              svarer innen 30 dager.
            </p>

            <h2>7. Mindreårige</h2>
            <p>
              For brukere under 16 år må forelder eller foresatt opprette og forvalte kontoen. Vi
              behandler ikke data om mindreårige uten gyldig samtykke fra foresatt.
            </p>

            <h2>8. Cookies og analytics</h2>
            <p>
              Vi bruker minimalt med cookies, kun det som er nødvendig for innlogging og sikkerhet.
              For analytics bruker vi <strong>Plausible</strong>, som er cookie-fri og GDPR-vennlig.
            </p>
            <p>
              Vi bruker ikke Google Analytics, Facebook Pixel eller tilsvarende tredjepart-tracking
              på marketing-sidene.
            </p>

            <h2>9. Endringer</h2>
            <p>
              Vi kan oppdatere denne erklæringen. Vesentlige endringer varsles på e-post til
              registrerte brukere. Datoen for siste oppdatering står øverst på siden.
            </p>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
