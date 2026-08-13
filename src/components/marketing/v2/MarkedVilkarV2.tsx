/* AK Golf HQ — MARKEDSSIDE: Brukervilkår (/vilkar).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §prosa (skallvariant 3). Skallet er PkShell (variant «side»), typografien
   er .pk-prosa. Ingen inline-stiler, ingen egne farger.

   JURIDISK TEKST: uendret fra forrige versjon — kun chrome og typografi
   er byttet. Ingen omskriving av juridisk innhold. */

import { PkShell } from "./paper/PkShell";

const SIST_OPPDATERT = "12. mai 2026";

export function MarkedVilkarV2() {
  return (
    <PkShell variant="side" dataSlug="marketing-vilkar">
      <div className="pk-sek">
        <div className="pk-wrap pk-wrap-smal">
          <span className="pk-eyebrow">Sist oppdatert {SIST_OPPDATERT}</span>
          <h1 className="pk-hero pk-hero-prosa">Brukervilkår</h1>

          <div className="pk-kort pk-kort-tint pk-kort-pad">
            <p className="pk-notis">
              <strong>Utkast.</strong> Endelig versjon godkjennes med advokat før Q3 2026. Disse
              vilkårene gjelder dagens drift, men kan endres ved formell publisering. Vesentlige
              endringer varsles til registrerte brukere på e-post minst 30 dager før de trer i
              kraft.
            </p>
          </div>

          <div className="pk-prosa">
            <p>Vilkår for bruk av AK Golf-tjenestene: booking, portal og coaching.</p>

            <h2>1. Tjenestebeskrivelse</h2>
            <p>
              AK Golf («Tjenesten») er en SaaS-plattform for golfspillere og coacher levert av AK
              Golf Group AS, org.nr. 927&nbsp;248&nbsp;581, Bossumveien 6, 1605 Fredrikstad («vi»,
              «oss», «AK Golf»).
            </p>
            <p>
              Tjenesten omfatter blant annet PlayerHQ (spillerportal), AgencyOS (coach-portal),
              AI-coach, treningsplaner, booking, og tilhørende data- og analyseverktøy.
            </p>

            <h2>2. Konto og bruk</h2>
            <p>
              For å bruke Tjenesten må du opprette en brukerkonto. Du er ansvarlig for at
              opplysningene du oppgir er riktige, og for å beskytte påloggingsinformasjonen din.
            </p>
            <p>
              Du må være minst 16 år for å opprette egen konto. For spillere under 16 år må en
              forelder eller foresatt opprette og forvalte kontoen.
            </p>
            <p>
              Det er ikke tillatt å dele konto, omgå tekniske begrensninger, eller bruke Tjenesten
              til å samle data om andre brukere uten samtykke.
            </p>

            <h2>3. Abonnement og betaling</h2>
            <p>
              Tjenesten tilbys som gratis-tier (begrenset) og Pro-tier (kr&nbsp;300 per måned,
              inkl. mva). Pro-abonnement faktureres månedlig via Stripe og fornyes automatisk
              inntil oppsigelse.
            </p>
            <p>
              Du kan si opp Pro-abonnementet når som helst via <em>Meg → Abonnement</em>.
              Oppsigelsen gjelder fra neste fornyelsesdato. Du beholder tilgang til Pro-funksjonene
              ut inneværende betalt periode.
            </p>
            <p>
              Enkelttjenester (Pro-time, Trackman-analyse mv.) betales per booking. Avbestilling
              senest 24 timer før oppmøte gir full refusjon. Senere avbestilling refunderes ikke,
              men kan etter avtale flyttes til ny dato.
            </p>

            <h2>4. Innhold og data</h2>
            <p>
              Du beholder eierskap til alle data du laster opp eller registrerer i Tjenesten
              (runder, tester, notater, opptak osv.). Du gir AK Golf en ikke-eksklusiv lisens til å
              lagre, prosessere og vise disse dataene som nødvendig for å levere Tjenesten.
            </p>
            <p>
              Anonymiserte og aggregerte data kan brukes til produktforbedring og statistikk uten
              egen varsling.
            </p>

            <h2>5. AI-coach og automatiserte agenter</h2>
            <p>
              AK Golf bruker språkmodeller (Anthropic Claude) og automatiserte agenter for å gi
              anbefalinger. AI-coachens svar er ikke å regne som personlig medisinsk, juridisk
              eller finansiell rådgivning.
            </p>
            <p>
              Vi gjør vårt beste for at anbefalingene er treffsikre, men kan ikke garantere
              resultat. Du bør konsultere kvalifisert fagperson ved skader, helseutfordringer eller
              annen tvil.
            </p>

            <h2>6. Tilgjengelighet og endringer</h2>
            <p>
              Vi tilstreber høy oppetid, men kan ikke garantere uavbrutt drift. Planlagt vedlikehold
              varsles når mulig.
            </p>
            <p>
              Vi kan endre, utvide eller fjerne funksjoner over tid. Vesentlige negative endringer
              varsles minst 30 dager på forhånd, og du har da rett til å si opp uten
              oppsigelsestid.
            </p>

            <h2>7. Ansvarsbegrensning</h2>
            <p>
              Tjenesten leveres «som den er». AK Golf er ikke ansvarlig for indirekte tap, tapt
              fortjeneste, eller skade som følge av at spilleren handler på AI-anbefalinger eller
              treningsplaner.
            </p>
            <p>
              Vårt samlede erstatningsansvar er uansett begrenset til de siste 12 månedenes
              innbetalte abonnementskostnad.
            </p>

            <h2>8. Personvern</h2>
            <p>
              Behandling av personopplysninger er beskrevet i vår{" "}
              <a href="/personvern">personvernerklæring</a>.
            </p>

            <h2>9. Verneting og lovvalg</h2>
            <p>
              Vilkårene reguleres av norsk rett. Tvister behandles ved Fredrikstad tingrett som
              avtalt verneting, med mindre ufravikelig lov bestemmer noe annet.
            </p>

            <h2>10. Kontakt</h2>
            <p>
              Spørsmål om vilkårene rettes til <a href="mailto:support@akgolf.no">support@akgolf.no</a>.
            </p>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
