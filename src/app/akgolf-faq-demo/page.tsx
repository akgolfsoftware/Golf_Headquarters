/**
 * Marketing — FAQ (Vanlige spørsmål)
 * URL: /akgolf-faq-demo
 *
 * Kategori-filter (Booking / Coaching / Pris / Junior) og 14 FAQ-items
 * i accordion. De første 2 er åpne by default.
 */

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

type Kategori = "Booking" | "Coaching" | "Pris" | "Junior";

interface Faq {
  kategori: Kategori;
  sporsmal: string;
  svar: string;
  defaultOpen?: boolean;
}

const FAQS: Faq[] = [
  {
    kategori: "Booking",
    sporsmal: "Hvordan booker jeg en økt med en coach?",
    svar: "Gå til Coacher, velg en coach som passer deg, og trykk «Book økt». Du velger tjeneste, tidspunkt, betaler i kassen, og får bekreftelse på e-post umiddelbart. Hele prosessen tar under to minutter.",
    defaultOpen: true,
  },
  {
    kategori: "Booking",
    sporsmal: "Kan jeg avbestille eller flytte en time?",
    svar: "Ja — du kan gratis avbestille eller flytte timen din inntil 6 timer før den starter. Etter det belastes 50 % av timeprisen. Avbestilling skjer direkte i Min side eller ved å svare på bekreftelses-e-posten.",
    defaultOpen: true,
  },
  {
    kategori: "Booking",
    sporsmal: "Hva skjer hvis coachen blir syk?",
    svar: "Du får automatisk full refusjon eller mulighet til å booke om til en ny tid med samme eller en annen coach uten ekstra kostnad. Vi gir beskjed så raskt vi vet.",
  },
  {
    kategori: "Coaching",
    sporsmal: "Hvilken coach passer for meg som nybegynner?",
    svar: "Sara Pedersen og Markus Karlsen tar mye nybegynnere — Sara fokuserer mest på juniorer og familier, mens Markus jobber mest med voksne nybegynnere og banespill. Begge er tålmodige og strukturerte. Du kan også filtrere på «Voksne nybegynnere» i coach-listen.",
  },
  {
    kategori: "Coaching",
    sporsmal: "Hva er forskjellen på 1-til-1 og gruppe-coaching?",
    svar: "1-til-1 er 60 minutter alene med coach, dedikert til deg, og er det vi anbefaler for raskest fremgang. Gruppe-coaching (2–4 spillere) er sosialt, rimeligere, og passer bra for venner eller familier som vil utvikle seg sammen.",
  },
  {
    kategori: "Coaching",
    sporsmal: "Hvor lang tid tar det før jeg ser fremgang?",
    svar: "Det varierer, men typisk merker du tydelig forskjell etter 4–6 økter med jevn trening mellom timene. Vi setter alltid opp en konkret plan etter første økt slik at du vet hva som er fokus de neste ukene.",
  },
  {
    kategori: "Coaching",
    sporsmal: "Filmer dere med TrackMan på hver økt?",
    svar: "Ja, alle økter på Mulligan Indoor Borre kjøres med TrackMan. Du får tilgang til både video og data i AK Golf-appen rett etter timen, og kan se gjennom det selv eller dele med en venn.",
  },
  {
    kategori: "Pris",
    sporsmal: "Hva koster det å abonnere på PRO?",
    svar: "PRO koster 300 kr/mnd eller 3 000 kr/år (du sparer 600 kr). PRO gir deg ubegrenset tilgang til AI-coachen, periodiserte treningsplaner, SG-tracking, video-arkiv og 10 % rabatt på alle coaching-timer.",
  },
  {
    kategori: "Pris",
    sporsmal: "Hva koster en time med en coach?",
    svar: "Prisene varierer fra 1 100 kr/time hos Sara Pedersen til 2 500 kr/time for elite-coaching med Anders Kristiansen. De fleste timene ligger mellom 1 200 og 1 500 kr. PRO-medlemmer får 10 % rabatt på alle timer.",
  },
  {
    kategori: "Pris",
    sporsmal: "Kan jeg få faktura i stedet for kort?",
    svar: "Ja — bedrifter og klubber kan få faktura på 14 dager. Velg «Faktura» i kassen, fyll inn org.nr og fakturaadresse. Faktura sendes på e-post samme dag.",
  },
  {
    kategori: "Pris",
    sporsmal: "Finnes det rabattordninger?",
    svar: "Vi har pakker på 5 timer (10 % rabatt) og 10 timer (15 % rabatt) som du kan kjøpe direkte i appen. Junior under 18 år får alltid 20 % på enkelttimer. Klubber og bedrifter kan kontakte oss for skreddersydde avtaler.",
  },
  {
    kategori: "Junior",
    sporsmal: "Fra hvilken alder kan barn begynne?",
    svar: "Vi tar imot juniorer fra 6 år på Mulligan og fra 8 år på GFGK Bossum. Junior-akademiet på Mulligan kjøres hver lørdag klokken 10:00–12:00 og er delt inn i aldersgrupper 6–9 år, 10–13 år og 14–16 år.",
  },
  {
    kategori: "Junior",
    sporsmal: "Trenger barnet eget utstyr?",
    svar: "Nei — vi har låneklubber i alle størrelser på begge anlegg. Når barnet finner ut at golf er noe det vil holde på med, kan vi hjelpe med klubbetilpasning og kjøp gjennom pro-shop.",
  },
  {
    kategori: "Junior",
    sporsmal: "Får foreldrene følge med?",
    svar: "Ja, foreldre er alltid velkomne til å se på fra café-området. Vi har også egne forelder + barn-økter (2-pakke) hos Sara Pedersen hvis dere vil trene sammen.",
  },
  {
    kategori: "Junior",
    sporsmal: "Hvordan henger junior-coaching sammen med skole?",
    svar: "For elever på WANG Toppidrett Fredrikstad er coaching integrert i skoletilbudet med faste økter mandag, onsdag og fredag kl 08–10. For øvrige juniorer tilbyr vi økter på ettermiddager og lørdag.",
  },
];

const KATEGORIER: { navn: "Alle" | Kategori; tellverdi: number }[] = [
  { navn: "Alle", tellverdi: FAQS.length },
  {
    navn: "Booking",
    tellverdi: FAQS.filter((f) => f.kategori === "Booking").length,
  },
  {
    navn: "Coaching",
    tellverdi: FAQS.filter((f) => f.kategori === "Coaching").length,
  },
  {
    navn: "Pris",
    tellverdi: FAQS.filter((f) => f.kategori === "Pris").length,
  },
  {
    navn: "Junior",
    tellverdi: FAQS.filter((f) => f.kategori === "Junior").length,
  },
];

export default function AkgolfFaqDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      {/* Hero */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Hjelp · FAQ
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-[56px] font-medium leading-[1.05] tracking-tight">
            Spørsmål?{" "}
            <em className="italic text-primary">Vi har svar.</em>
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.65] text-muted-foreground">
            De vanligste spørsmålene fra elever, foreldre og bedrifter. Finner
            du ikke det du leter etter, ta kontakt på e-post eller chat.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <HelpCircle
                className="h-4 w-4 text-primary"
                strokeWidth={1.5}
              />
              {FAQS.length} spørsmål
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle
                className="h-4 w-4 text-primary"
                strokeWidth={1.5}
              />
              Chat tilgjengelig 09 – 21
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" strokeWidth={1.5} />
              Svar innen 24 timer
            </span>
          </div>
        </div>
      </section>

      {/* Kategori-filter */}
      <section className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-8 py-4">
          <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Filtrer
          </span>
          {KATEGORIER.map((k, i) => (
            <button
              key={k.navn}
              type="button"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card hover:border-primary"
              }`}
            >
              {k.navn}
              <span
                className={`font-mono text-[10px] tabular ${
                  i === 0 ? "opacity-70" : "text-muted-foreground"
                }`}
              >
                {k.tellverdi}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FAQ-accordion */}
      <section className="mx-auto max-w-3xl px-8 py-16">
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FaqItem key={faq.sporsmal} faq={faq} index={i} />
          ))}
        </div>
      </section>

      {/* Kontakt-CTA */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="rounded-2xl border border-border bg-card p-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Fortsatt usikker?
                </div>
                <h2 className="mt-3 font-display text-[40px] font-medium leading-tight tracking-tight">
                  Snakk med oss <em className="italic">direkte</em>
                </h2>
                <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
                  Send en e-post, ring oss, eller åpne chatten nede i hjørnet.
                  Vi svarer raskt — alltid en ekte person, aldri en bot.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href="/akgolf-kontakt-demo"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-medium text-primary-foreground hover:opacity-90"
                >
                  Til kontaktskjema
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
                <a
                  href="tel:+4740012345"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-[14px] font-medium hover:border-primary"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.5} />
                  +47 400 12 345
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FaqItem({ faq, index }: { faq: Faq; index: number }) {
  return (
    <details
      className="group rounded-2xl border border-border bg-card transition-colors hover:border-primary/40 open:border-primary/40"
      open={faq.defaultOpen}
    >
      <summary className="flex cursor-pointer items-center gap-6 p-6 [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-[10px] tabular text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-secondary-foreground">
          {faq.kategori}
        </span>
        <h3 className="flex-1 font-display text-[18px] font-medium leading-snug">
          {faq.sporsmal}
        </h3>
        <ChevronDown
          className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          strokeWidth={1.5}
        />
      </summary>
      <div className="border-t border-border px-6 pb-6 pt-4">
        <p className="ml-[60px] max-w-2xl text-[14px] leading-[1.7] text-muted-foreground">
          {faq.svar}
        </p>
      </div>
    </details>
  );
}

function TopNav() {
  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 text-[14px] font-medium">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>AK Golf</span>
        </Link>
        <div className="hidden items-center gap-8 text-[13px] md:flex">
          <a href="/akgolf-tjenester-demo" className="hover:text-primary">
            Tjenester
          </a>
          <a href="/akgolf-om-demo" className="hover:text-primary">
            Om
          </a>
          <a href="/akgolf-coacher-demo" className="hover:text-primary">
            Coacher
          </a>
          <a href="/akgolf-kontakt-demo" className="hover:text-primary">
            Kontakt
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/auth-login-demo"
            className="hidden text-[13px] hover:text-primary md:inline"
          >
            Logg inn
          </a>
          <a
            href="/booking-index-demo"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
          >
            Book økt
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-[14px] font-medium">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>AK Golf</span>
            </div>
            <p className="mt-4 max-w-xs text-[12px] leading-[1.6] text-muted-foreground">
              Coaching, plan og fremgang. PGA-coacher i Vestfold og Østfold.
            </p>
          </div>
          <FooterCol
            title="Tjenester"
            links={["Privat coaching", "Junior", "Bedrift", "Camps"]}
          />
          <FooterCol
            title="Selskap"
            links={["Om oss", "Coacher", "Anlegg", "Kontakt"]}
          />
          <FooterCol
            title="Hjelp"
            links={["FAQ", "Personvern", "Vilkår", "Logg inn"]}
          />
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[12px] text-muted-foreground">
          <span>© 2026 AK Golf Group AS</span>
          <span>akgolf.no</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-4 space-y-2 text-[13px]">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-primary">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
