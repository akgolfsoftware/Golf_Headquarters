import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vilkår — AK Golf",
  description: "Brukervilkår for AK Golf-plattformen.",
};

const SIST_OPPDATERT = "12. mai 2026";

export default function Vilkar() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <header>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Juridisk
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal italic text-primary">Bruker</em>vilkår
          </h1>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Sist oppdatert: {SIST_OPPDATERT}
          </p>
        </header>

        <div className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
          <strong>Utkast.</strong> Endelig versjon godkjennes med advokat før
          Q3 2026. Disse vilkårene gjelder dagens drift, men kan endres ved
          formell publisering. Vesentlige endringer varsles til registrerte
          brukere på e-post minst 30 dager før de trer i kraft.
        </div>

        <article className="prose-akgolf mt-12 space-y-8 text-base leading-relaxed text-foreground">
          <Section title="1. Tjenestebeskrivelse">
            <p>
              AK Golf («Tjenesten») er en SaaS-plattform for golfspillere og
              coacher levert av AK Golf Group AS, org.nr. 927&nbsp;248&nbsp;581,
              Bossumveien 6, 1605 Fredrikstad («vi», «oss», «AK Golf»).
            </p>
            <p>
              Tjenesten omfatter blant annet PlayerHQ (spillerportal), CoachHQ
              (coach-portal), AI-coach, treningsplaner, booking, og tilhørende
              data- og analyseverktøy.
            </p>
          </Section>

          <Section title="2. Konto og bruk">
            <p>
              For å bruke Tjenesten må du opprette en brukerkonto. Du er
              ansvarlig for at opplysningene du oppgir er riktige, og for å
              beskytte påloggingsinformasjonen din.
            </p>
            <p>
              Du må være minst 16 år for å opprette egen konto. For spillere
              under 16 år må en forelder eller foresatt opprette og forvalte
              kontoen.
            </p>
            <p>
              Det er ikke tillatt å dele konto, omgå tekniske begrensninger,
              eller bruke Tjenesten til å samle data om andre brukere uten
              samtykke.
            </p>
          </Section>

          <Section title="3. Abonnement og betaling">
            <p>
              Tjenesten tilbys som gratis-tier (begrenset) og Pro-tier
              (kr&nbsp;300 per måned, inkl. mva). Pro-abonnement faktureres
              månedlig via Stripe og fornyes automatisk inntil oppsigelse.
            </p>
            <p>
              Du kan si opp Pro-abonnementet når som helst via{" "}
              <em>Meg → Abonnement</em>. Oppsigelsen gjelder fra neste
              fornyelsesdato. Du beholder tilgang til Pro-funksjonene ut
              inneværende betalt periode.
            </p>
            <p>
              Enkelttjenester (Pro-time, Trackman-analyse mv.) betales per
              booking. Avbestilling senest 24 timer før oppmøte gir full
              refusjon. Senere avbestilling refunderes ikke, men kan etter
              avtale flyttes til ny dato.
            </p>
          </Section>

          <Section title="4. Innhold og data">
            <p>
              Du beholder eierskap til alle data du laster opp eller registrerer
              i Tjenesten (runder, tester, notater, opptak osv.). Du gir AK
              Golf en ikke-eksklusiv lisens til å lagre, prosessere og vise
              disse dataene som nødvendig for å levere Tjenesten.
            </p>
            <p>
              Anonymiserte og aggregerte data kan brukes til produktforbedring
              og statistikk uten egen varsling.
            </p>
          </Section>

          <Section title="5. AI-coach og automatiserte agenter">
            <p>
              AK Golf bruker språkmodeller (Anthropic Claude) og automatiserte
              agenter for å gi anbefalinger. AI-coachens svar er ikke å regne
              som personlig medisinsk, juridisk eller finansiell rådgivning.
            </p>
            <p>
              Vi gjør vårt beste for at anbefalingene er treffsikre, men kan
              ikke garantere resultat. Du bør konsultere kvalifisert
              fagperson ved skader, helseutfordringer eller annen tvil.
            </p>
          </Section>

          <Section title="6. Tilgjengelighet og endringer">
            <p>
              Vi tilstreber høy oppetid, men kan ikke garantere uavbrutt drift.
              Planlagt vedlikehold varsles når mulig.
            </p>
            <p>
              Vi kan endre, utvide eller fjerne funksjoner over tid. Vesentlige
              negative endringer varsles minst 30 dager på forhånd, og du har
              da rett til å si opp uten oppsigelsestid.
            </p>
          </Section>

          <Section title="7. Ansvarsbegrensning">
            <p>
              Tjenesten leveres «som den er». AK Golf er ikke ansvarlig for
              indirekte tap, tapt fortjeneste, eller skade som følge av at
              spilleren handler på AI-anbefalinger eller treningsplaner.
            </p>
            <p>
              Vårt samlede erstatningsansvar er uansett begrenset til de siste
              12 månedenes innbetalte abonnementskostnad.
            </p>
          </Section>

          <Section title="8. Personvern">
            <p>
              Behandling av personopplysninger er beskrevet i vår{" "}
              <a href="/personvern" className="text-primary underline">
                personvernerklæring
              </a>
              .
            </p>
          </Section>

          <Section title="9. Verneting og lovvalg">
            <p>
              Vilkårene reguleres av norsk rett. Tvister behandles ved
              Fredrikstad tingrett som avtalt verneting, med mindre
              ufravikelig lov bestemmer noe annet.
            </p>
          </Section>

          <Section title="10. Kontakt">
            <p>
              Spørsmål om vilkårene rettes til{" "}
              <a href="mailto:support@akgolf.no" className="text-primary underline">
                support@akgolf.no
              </a>
              .
            </p>
          </Section>
        </article>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
