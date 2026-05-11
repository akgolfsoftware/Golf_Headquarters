import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personvern — AK Golf",
  description: "Personvernerklæring for AK Golf-plattformen.",
};

const SIST_OPPDATERT = "12. mai 2026";

export default function Personvern() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <header>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Juridisk
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">Personvern</em>-erklæring
          </h1>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Sist oppdatert: {SIST_OPPDATERT}
          </p>
        </header>

        <div className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
          <strong>Utkast.</strong> Endelig versjon godkjennes med advokat før
          Q3 2026. Innholdet under beskriver hvordan vi behandler personopplysninger
          i dagens drift.
        </div>

        <article className="mt-12 space-y-8 text-base leading-relaxed text-foreground">
          <Section title="1. Behandlingsansvarlig">
            <p>
              AK Golf Group AS, org.nr. 932&nbsp;341&nbsp;860, Bossumveien 6,
              1605 Fredrikstad, er behandlingsansvarlig for personopplysninger
              som registreres i AK Golf-tjenesten.
            </p>
            <p>
              Kontakt:{" "}
              <a href="mailto:personvern@akgolf.no" className="text-primary underline">
                personvern@akgolf.no
              </a>
            </p>
          </Section>

          <Section title="2. Hva vi samler inn">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Kontaktopplysninger:</strong> navn, e-post, telefon,
                hjemmeklubb.
              </li>
              <li>
                <strong>Spillerprofil:</strong> handicap, alder, antall års
                spilling, ambisjon.
              </li>
              <li>
                <strong>Trenings- og spilldata:</strong> runder, tester,
                drills, Trackman-import, AI-chat-historikk.
              </li>
              <li>
                <strong>Helse-relatert data (frivillig):</strong> hvilepuls,
                søvn — kun hvis du selv registrerer.
              </li>
              <li>
                <strong>Tekniske data:</strong> IP-adresse, nettleser,
                pålogging-tidspunkt, feillogger.
              </li>
              <li>
                <strong>Betalingsdata:</strong> håndteres av Stripe — vi lagrer
                kun ID og status, ikke kortinformasjon.
              </li>
            </ul>
          </Section>

          <Section title="3. Formål og rettslig grunnlag">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Levere tjenesten</strong> (avtale, GDPR art. 6 nr. 1 b)
              </li>
              <li>
                <strong>Booking, fakturering, kontakt</strong> (avtale)
              </li>
              <li>
                <strong>Produktforbedring og analyse</strong> (berettiget
                interesse, art. 6 nr. 1 f) — alltid med anonymisering når mulig
              </li>
              <li>
                <strong>Markedsføring til eksisterende kunder</strong> (berettiget
                interesse — kan reservere deg fra i innstillinger)
              </li>
              <li>
                <strong>Etterleve regnskaps- og bokføringsplikt</strong>{" "}
                (rettslig forpliktelse)
              </li>
            </ul>
          </Section>

          <Section title="4. Databehandlere vi bruker">
            <p>
              Vi deler nødvendige opplysninger med følgende underleverandører,
              alle med databehandleravtale (DPA) på plass:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Supabase</strong> (EU-region) — database, autentisering,
                fillagring
              </li>
              <li>
                <strong>Vercel</strong> (EU-region) — hosting og deploy
              </li>
              <li>
                <strong>Stripe</strong> — betalingsbehandling
              </li>
              <li>
                <strong>Resend</strong> — utsendelse av transaksjons-e-post
              </li>
              <li>
                <strong>Anthropic</strong> — AI-coach (Claude). Anthropic
                lagrer ikke prompts ut over kort retensjonsperiode for misbrukskontroll
              </li>
              <li>
                <strong>Sentry</strong> — feilrapportering (PII filtrert ut)
              </li>
            </ul>
          </Section>

          <Section title="5. Lagringstid">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Aktive konto-data:</strong> så lenge kontoen er aktiv
              </li>
              <li>
                <strong>Inaktive kontoer:</strong> slettes etter 36 måneder
                uten innlogging
              </li>
              <li>
                <strong>Regnskapsdata (fakturaer, betalinger):</strong> 5 år iht.
                bokføringsloven
              </li>
              <li>
                <strong>Feillogger:</strong> 90 dager
              </li>
              <li>
                <strong>AI-chat-historikk:</strong> kan slettes av deg når som
                helst — slettes uansett ved konto-sletting
              </li>
            </ul>
          </Section>

          <Section title="6. Dine rettigheter">
            <p>Du har rett til:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Innsyn i hvilke opplysninger vi har om deg</li>
              <li>Retting av feil eller ufullstendige opplysninger</li>
              <li>
                Sletting («retten til å bli glemt») — gjelder ikke data vi er
                lovpålagt å beholde
              </li>
              <li>Begrensning av behandling</li>
              <li>Dataportabilitet — utlevering i maskinlesbart format</li>
              <li>Innsigelse mot behandling basert på berettiget interesse</li>
              <li>
                Klage til Datatilsynet (
                <a
                  href="https://www.datatilsynet.no"
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener"
                >
                  datatilsynet.no
                </a>
                )
              </li>
            </ul>
            <p>
              Send forespørsel til{" "}
              <a href="mailto:personvern@akgolf.no" className="text-primary underline">
                personvern@akgolf.no
              </a>{" "}
              — vi svarer innen 30 dager.
            </p>
          </Section>

          <Section title="7. Mindreårige">
            <p>
              For brukere under 16 år må forelder eller foresatt opprette og
              forvalte kontoen. Vi behandler ikke data om mindreårige uten
              gyldig samtykke fra foresatt.
            </p>
          </Section>

          <Section title="8. Cookies og analytics">
            <p>
              Vi bruker minimalt med cookies — kun det som er nødvendig for
              innlogging og sikkerhet. For analytics bruker vi{" "}
              <strong>Plausible</strong>, som er cookie-fri og GDPR-vennlig.
            </p>
            <p>
              Vi bruker ikke Google Analytics, Facebook Pixel eller tilsvarende
              tredjepart-tracking på marketing-sidene.
            </p>
          </Section>

          <Section title="9. Endringer">
            <p>
              Vi kan oppdatere denne erklæringen. Vesentlige endringer varsles
              på e-post til registrerte brukere. Datoen for siste oppdatering
              står øverst på siden.
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
