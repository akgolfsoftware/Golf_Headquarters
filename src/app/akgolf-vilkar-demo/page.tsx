/**
 * Vilkår og betingelser — AK Golf Group AS.
 * URL: /akgolf-vilkar-demo
 *
 * Legal-side med TOC venstre + brødtekst høyre.
 * Sist oppdatert: 5. mai 2026.
 */
import { ScrollText } from "lucide-react";
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
    id: "definisjoner",
    title: "1. Definisjoner",
    body: (
      <>
        <p>I disse vilkårene betyr følgende:</p>
        <ul>
          <li>
            <b>AK Golf:</b> AK Golf Group AS, org.nr 932 145 678, Storgata 12,
            1606 Fredrikstad.
          </li>
          <li>
            <b>Tjenester:</b> coaching, treningsplaner, studio-leie,
            booking-system, PlayerHQ og CoachHQ.
          </li>
          <li>
            <b>Kunde:</b> fysisk eller juridisk person som inngår avtale med AK
            Golf.
          </li>
          <li>
            <b>Spiller:</b> sluttbruker av tjenestene, kan være kunden selv
            eller et barn/foresatt-forhold.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "tjenester",
    title: "2. Tjenester",
    body: (
      <>
        <p>
          AK Golf tilbyr personlig coaching, gruppe-trening, treningsplaner og
          tilgang til indoor-anlegget Mulligan i Borre. Tjenestene leveres av
          PGA-sertifiserte coacher og er beskrevet i detalj på akgolf.no.
        </p>
        <p>
          Vi forbeholder oss retten til å oppdatere eller endre tjenestens
          innhold uten forutgående varsel, så lenge det vesentlige innholdet
          opprettholdes.
        </p>
      </>
    ),
  },
  {
    id: "bestilling",
    title: "3. Bestilling og avtaleinngåelse",
    body: (
      <>
        <p>
          Bestilling skjer via akgolf.no eller booking.akgolf.no. Avtalen er
          bindende når kunden har bekreftet bestillingen og mottatt
          bekreftelses-e-post fra oss.
        </p>
        <p>
          For spillere under 18 år kreves digital signatur fra foresatt via
          BankID før kjøp eller deltakelse.
        </p>
      </>
    ),
  },
  {
    id: "betaling",
    title: "4. Betaling",
    body: (
      <>
        <p>
          Betaling håndteres av Stripe Payments Europe Ltd. Vi aksepterer Visa,
          Mastercard og Vipps. For abonnementer trekkes beløpet automatisk på
          forfallsdato.
        </p>
        <p>
          Faktura kan utstedes for bedriftskunder og avtalefestede tilbud.
          Forfallstid er 14 dager. Ved manglende betaling sendes purring etter
          7 dager, og deretter inkasso etter inkassoloven.
        </p>
        <p>Alle priser inkluderer MVA der det er aktuelt.</p>
      </>
    ),
  },
  {
    id: "avbestilling",
    title: "5. Avbestilling",
    body: (
      <>
        <p>
          <b>24-timers regelen:</b> Coaching-økter og studio-bookinger kan
          avbestilles uten kostnad inntil 24 timer før oppmøte. Senere
          avbestilling eller no-show belastes med 100 % av timeprisen.
        </p>
        <p>
          For abonnementer (PRO, sesongkort): oppsigelse senest 14 dager før
          neste fakturaperiode. Allerede betalt periode refunderes ikke.
        </p>
        <p>
          Force majeure (sykdom med legeattest, alvorlig hindring): kontakt
          oss direkte for individuell vurdering.
        </p>
      </>
    ),
  },
  {
    id: "angrerett",
    title: "6. Angrerett",
    body: (
      <p>
        Forbrukerkunder har 14 dagers angrerett etter angrerettsloven.
        Angreretten bortfaller når tjenesten er levert med kundens samtykke før
        14-dagersfristen er ute. For abonnementer kan angrerett benyttes mot
        forholdsmessig betaling for utført del.
      </p>
    ),
  },
  {
    id: "refusjon",
    title: "7. Refusjon",
    body: (
      <>
        <p>
          Refusjon utbetales til samme betalingsmiddel som ble brukt ved kjøp,
          normalt innen 5 virkedager. Ved klage som godkjennes refunderes
          beløpet med eventuell rente etter forsinkelsesrenteloven.
        </p>
        <p>
          Sesongkort kan ikke refunderes etter bruk, men kan overdras til en
          annen person etter avtale.
        </p>
      </>
    ),
  },
  {
    id: "ansvar",
    title: "8. Ansvar og forsikring",
    body: (
      <>
        <p>
          Kunden deltar på egen risiko. AK Golf er ansvarlig for tap som
          skyldes uaktsomhet fra vår side, begrenset til det beløpet kunden har
          betalt for tjenesten det aktuelle året.
        </p>
        <p>
          Kunden er ansvarlig for egne ulykker, helse og personlig utstyr på
          våre anlegg. Vi anbefaler at alle kunder har egen ulykkesforsikring.
        </p>
      </>
    ),
  },
  {
    id: "immaterielle-rettigheter",
    title: "9. Immaterielle rettigheter",
    body: (
      <p>
        Alt innhold på akgolf.no — tekst, video, treningsplaner, AI-genererte
        analyser — er AK Golf sin eiendom og kan ikke gjengis eller publiseres
        kommersielt uten skriftlig samtykke. Spilleren får en ikke-eksklusiv,
        personlig bruksrett i abonnementsperioden.
      </p>
    ),
  },
  {
    id: "konfliktlosning",
    title: "10. Konfliktløsning",
    body: (
      <>
        <p>
          Vi forsøker alltid å løse uenigheter direkte. Lykkes vi ikke, kan
          forbrukerkunder klage til Forbrukerrådet (forbrukerradet.no).
        </p>
        <p>
          Avtalen reguleres av norsk rett. Verneting er Søndre Østfold
          tingrett.
        </p>
      </>
    ),
  },
  {
    id: "endringer",
    title: "11. Endringer i vilkår",
    body: (
      <p>
        Vi kan endre disse vilkårene ved behov. Eksisterende kunder varsles
        per e-post 30 dager før endringene trer i kraft. Hvis kunden ikke
        aksepterer endringene, kan avtalen sies opp uten kostnad.
      </p>
    ),
  },
  {
    id: "kontakt",
    title: "12. Kontakt",
    body: (
      <>
        <p>
          Spørsmål om vilkårene sendes til:
        </p>
        <p>
          <b>AK Golf Group AS</b>
          <br />
          Storgata 12, 1606 Fredrikstad
          <br />
          akgolfgroup@gmail.com · +47 901 23 456
        </p>
      </>
    ),
  },
];

export default function AkgolfVilkarDemo() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <ScrollText className="h-3.5 w-3.5" strokeWidth={1.5} />
            Juridisk · Vilkår
          </span>
          <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.1] tracking-tight md:text-[56px]">
            <em className="font-medium italic">Vilkår</em> og betingelser
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-muted-foreground">
            Reglene som styrer forholdet mellom deg som kunde og AK Golf Group
            AS. Sist oppdatert{" "}
            <b className="text-foreground">5. mai 2026</b>.
          </p>
        </div>
      </section>

      {/* TOC + content */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[280px_1fr]">
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

          <article className="max-w-3xl">
            <div className="flex flex-col gap-12">
              {SECTIONS.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="font-display text-[26px] font-semibold leading-tight tracking-tight md:text-[30px]">
                    {s.title}
                  </h2>
                  <div className="mt-4 flex flex-col gap-4 text-[15px] leading-[1.7] text-foreground [&_b]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_p]:text-foreground/85">
                    {s.body}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
