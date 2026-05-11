/**
 * Personvernerklæring — AK Golf Group AS.
 * URL: /akgolf-personvern-demo
 *
 * Legal-side. 2-kolonne: sticky TOC venstre, brødtekst høyre.
 * Sist oppdatert: 5. mai 2026.
 */
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  MarketingFooter,
  MarketingNav,
} from "@/app/_marketing-demo/chrome";

type Section = {
  id: string;
  title: string;
  body: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: "behandlingsansvarlig",
    title: "1. Behandlingsansvarlig",
    body: (
      <>
        <p>
          AK Golf Group AS er behandlingsansvarlig for personopplysningene som
          samles inn på akgolf.no og i tilknyttede tjenester (PlayerHQ,
          CoachHQ, booking og Mulligan Indoor). Selskapet er registrert i
          Brønnøysundregistrene med org.nr 932 145 678 og inngår i konsernet
          Skarpnord Invest AS.
        </p>
        <p>
          Kontakt: akgolfgroup@gmail.com · +47 901 23 456 · Storgata 12, 1606
          Fredrikstad.
        </p>
      </>
    ),
  },
  {
    id: "data-vi-samler",
    title: "2. Hvilke data vi samler",
    body: (
      <>
        <p>Vi samler følgende kategorier av personopplysninger:</p>
        <ul>
          <li>
            <b>Identitet:</b> navn, fødselsdato, kjønn, fotografi (frivillig).
          </li>
          <li>
            <b>Kontakt:</b> e-post, telefon, adresse, foresattes kontaktinfo
            for U18.
          </li>
          <li>
            <b>Idrett:</b> handicap, NGF-medlemskap, klubbtilhørighet,
            treningsdata fra Trackman, video og notater fra coachene.
          </li>
          <li>
            <b>Betaling:</b> faktura-historikk og kortdetaljer (lagres hos
            Stripe — vi har aldri tilgang til kortnummer).
          </li>
          <li>
            <b>Teknisk:</b> IP-adresse, enhetstype, nettleser, sesjons-cookies.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "hvordan-vi-bruker",
    title: "3. Hvordan vi bruker data",
    body: (
      <>
        <p>
          Vi bruker personopplysningene kun til formålene de ble samlet inn
          for:
        </p>
        <ul>
          <li>Levere coaching, booking og treningsplan-tjenester</li>
          <li>Fakturere og håndtere betaling</li>
          <li>Sende driftsmessige beskjeder (timepåminnelser, endringer)</li>
          <li>
            Forbedre tjenestene gjennom anonymisert statistikk og
            tilbakemeldinger
          </li>
          <li>
            Sende markedsføring — kun til kunder som har gitt eksplisitt
            samtykke, og som kan trekkes når som helst
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "rettslig-grunnlag",
    title: "4. Rettslig grunnlag",
    body: (
      <p>
        Vi behandler dine opplysninger på grunnlag av en eller flere av
        følgende: avtale (GDPR art. 6 nr. 1 b), berettiget interesse (art. 6 nr.
        1 f), rettslig forpliktelse (art. 6 nr. 1 c) eller eksplisitt samtykke
        (art. 6 nr. 1 a). For sensitive opplysninger — som helseinformasjon i
        coaching — kreves alltid eksplisitt samtykke.
      </p>
    ),
  },
  {
    id: "bankid-u18",
    title: "5. BankID og samtykke for U18",
    body: (
      <>
        <p>
          For spillere under 18 år krever vi at en foresatt signerer
          samtykkeerklæring digitalt via BankID før vi behandler treningsdata,
          video eller fakturerer for tjenester.
        </p>
        <p>
          Vi bruker BankID Mobil via Signicat. Sertifikatet lagres med
          tidsstempel og hash, men vi lagrer aldri ditt fødselsnummer. Du kan
          trekke samtykket når som helst ved å kontakte oss.
        </p>
      </>
    ),
  },
  {
    id: "lagringstid",
    title: "6. Hvor lenge vi lagrer data",
    body: (
      <ul>
        <li>
          <b>Aktiv kunde:</b> så lenge avtaleforholdet varer.
        </li>
        <li>
          <b>Etter avsluttet kundeforhold:</b> 3 år, deretter anonymiseres
          eller slettes.
        </li>
        <li>
          <b>Regnskapsdokumentasjon:</b> 5 år (bokføringsloven § 13).
        </li>
        <li>
          <b>Markedsføringssamtykke:</b> til samtykket trekkes.
        </li>
        <li>
          <b>Cookies og logger:</b> 24 måneder.
        </li>
      </ul>
    ),
  },
  {
    id: "tredjeparter",
    title: "7. Tredjeparter og databehandlere",
    body: (
      <>
        <p>
          Vi deler personopplysninger med følgende underleverandører som er
          GDPR-compliant og bundet av databehandleravtale:
        </p>
        <ul>
          <li>
            <b>Supabase</b> (database og auth) — EU-region (Frankfurt)
          </li>
          <li>
            <b>Vercel</b> (drift av nettsider) — EU-region
          </li>
          <li>
            <b>Stripe</b> (betalingsbehandling) — Irland og USA (SCC)
          </li>
          <li>
            <b>Trackman</b> (treningsdata fra studio) — Danmark
          </li>
          <li>
            <b>Plausible Analytics</b> (anonymisert bruksstatistikk) — Tyskland
          </li>
          <li>
            <b>Resend</b> (transaksjonell e-post) — EU og USA (SCC)
          </li>
        </ul>
        <p>
          Vi selger aldri personopplysninger og deler ikke med annonsører.
        </p>
      </>
    ),
  },
  {
    id: "internasjonal-overforing",
    title: "8. Overføring utenfor EØS",
    body: (
      <p>
        Når data overføres utenfor EØS (typisk Stripe og Resend i USA), gjøres
        det med EUs standard kontraktsklausuler (SCC) og tilleggssikring etter
        Schrems II-dommen. Du kan be om kopi av disse klausulene.
      </p>
    ),
  },
  {
    id: "dine-rettigheter",
    title: "9. Dine rettigheter",
    body: (
      <>
        <p>Du har rett til å:</p>
        <ul>
          <li>Få innsyn i hvilke personopplysninger vi har om deg</li>
          <li>Be om retting av feil eller utdaterte data</li>
          <li>Be om sletting (retten til å bli glemt)</li>
          <li>Be om begrensning av behandling</li>
          <li>Be om dataportabilitet (eksport i maskinlesbart format)</li>
          <li>Trekke samtykke når som helst</li>
          <li>Klage til Datatilsynet (datatilsynet.no)</li>
        </ul>
        <p>
          Henvendelser sendes til akgolfgroup@gmail.com. Vi svarer innen 30
          dager.
        </p>
      </>
    ),
  },
  {
    id: "automatiserte-beslutninger",
    title: "10. Automatiserte beslutninger og profilering",
    body: (
      <p>
        Vi bruker AI-assisterte verktøy til å analysere Trackman-data og
        foreslå treningsfokus. Disse anbefalingene gjennomgås alltid av en
        menneskelig coach før de presenteres for spilleren — vi tar ingen
        helautomatiserte beslutninger som har rettsvirkning.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "11. Cookies",
    body: (
      <p>
        Vi bruker nødvendige cookies for sesjonshåndtering og frivillige
        cookies for analyse. Se vår{" "}
        <Link
          href="/akgolf-cookies-demo"
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          cookie-policy
        </Link>{" "}
        for full liste og innstillinger.
      </p>
    ),
  },
  {
    id: "sikkerhet",
    title: "12. Sikkerhet",
    body: (
      <p>
        Alle data overføres med TLS 1.3. Database og backups er kryptert i ro.
        Tilgang til kundedata er begrenset til ansatte med legitimt behov,
        logges og revideres kvartalsvis. Ved sikkerhetsbrudd som påvirker dine
        data informerer vi deg og Datatilsynet innen 72 timer.
      </p>
    ),
  },
  {
    id: "endringer",
    title: "13. Endringer i denne erklæringen",
    body: (
      <p>
        Vi kan oppdatere erklæringen ved endringer i tjenestene eller
        regelverket. Vesentlige endringer varsles per e-post 30 dager før
        ikrafttredelse. Mindre endringer publiseres med ny dato nederst på
        siden.
      </p>
    ),
  },
  {
    id: "kontakt-dpo",
    title: "14. Kontakt personvernombud",
    body: (
      <>
        <p>
          Spørsmål om personvern eller behandling av dine opplysninger sendes
          til:
        </p>
        <p>
          <b>AK Golf Group AS</b>
          <br />
          Att: Personvernansvarlig
          <br />
          Storgata 12, 1606 Fredrikstad
          <br />
          akgolfgroup@gmail.com · +47 901 23 456
        </p>
      </>
    ),
  },
];

export default function AkgolfPersonvernDemo() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
            Juridisk · Personvern
          </span>
          <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.1] tracking-tight md:text-[56px]">
            <em className="font-medium italic">Personvern</em>erklæring
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-muted-foreground">
            Hvordan AK Golf Group AS behandler dine personopplysninger. Vi
            følger GDPR og norsk personvernlovgivning. Sist oppdatert{" "}
            <b className="text-foreground">5. mai 2026</b>.
          </p>
        </div>
      </section>

      {/* TOC + content */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[280px_1fr]">
          {/* Sticky TOC */}
          <aside className="md:sticky md:top-24 md:h-fit">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Innhold
            </h2>
            <nav className="mt-4 flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-md px-3 py-2 text-[13px] leading-snug text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Body */}
          <article className="max-w-3xl">
            <div className="flex flex-col gap-12">
              {SECTIONS.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-24"
                >
                  <h2 className="font-display text-[26px] font-semibold leading-tight tracking-tight md:text-[30px]">
                    {s.title}
                  </h2>
                  <div className="mt-4 flex flex-col gap-4 text-[15px] leading-[1.7] text-foreground [&_b]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_p]:text-foreground/85">
                    {s.body}
                  </div>
                </section>
              ))}

              <div className="mt-8 rounded-2xl border border-border bg-card p-8">
                <h3 className="font-display text-[18px] font-semibold tracking-tight">
                  Spørsmål eller henvendelse?
                </h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
                  Send oss en e-post på{" "}
                  <a
                    href="mailto:akgolfgroup@gmail.com"
                    className="text-primary underline underline-offset-2 hover:opacity-80"
                  >
                    akgolfgroup@gmail.com
                  </a>{" "}
                  så svarer vi innen 30 dager.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
