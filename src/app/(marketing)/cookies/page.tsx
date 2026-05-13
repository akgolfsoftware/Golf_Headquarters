import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies — AK Golf Academy",
  description:
    "Slik bruker AK Golf cookies. Oversikt over kategorier og hvordan du kan styre innstillingene dine.",
};

const SIST_OPPDATERT = "12. mai 2026";

export default function CookiesSide() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <header>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Juridisk
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">Cookies</em> og
            sporing
          </h1>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Sist oppdatert: {SIST_OPPDATERT}
          </p>
        </header>

        <article className="prose-akgolf mt-12 space-y-8 text-base leading-relaxed text-foreground">
          <Section title="Hva er cookies?">
            <p>
              Cookies er små tekstfiler som lagres i nettleseren din når du
              besøker AK Golf. De brukes til å huske preferanser, holde deg
              innlogget, og forstå hvordan nettstedet brukes.
            </p>
          </Section>

          <Section title="Kategorier vi bruker">
            <h3 className="mt-4 font-display text-lg font-semibold">
              1. Strengt nødvendige
            </h3>
            <p>
              Kreves for at tjenesten skal fungere — pålogging,
              sesjonshåndtering og sikkerhet. Disse kan ikke slås av.
            </p>

            <h3 className="mt-4 font-display text-lg font-semibold">
              2. Analyse
            </h3>
            <p>
              Vi bruker Plausible Analytics, en personvernvennlig løsning som
              ikke lagrer personopplysninger og ikke krever samtykke etter
              norske regler. Vi måler aggregert trafikk for å forbedre
              opplevelsen.
            </p>

            <h3 className="mt-4 font-display text-lg font-semibold">
              3. Markedsføring
            </h3>
            <p>
              Vi bruker ikke markedsføringscookies eller tredjeparts-piksler i
              dag. Skulle dette endre seg, ber vi om eksplisitt samtykke.
            </p>

            <h3 className="mt-4 font-display text-lg font-semibold">
              4. Preferanser
            </h3>
            <p>
              Brukes til å huske valg du har gjort — språk, tema (lyst/mørkt)
              og hvilke paneler du har åpne i PlayerHQ.
            </p>
          </Section>

          <Section title="Slik styrer du innstillingene">
            <p>
              Du kan blokkere eller slette cookies via nettleserens
              innstillinger. Vær oppmerksom på at strengt nødvendige cookies
              må være aktive for at innlogging skal fungere.
            </p>
          </Section>

          <Section title="Kontakt">
            <p>
              Spørsmål om cookies eller personvern kan rettes til{" "}
              <a
                href="mailto:personvern@akgolf.no"
                className="text-primary underline"
              >
                personvern@akgolf.no
              </a>
              .
            </p>
          </Section>
        </article>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
