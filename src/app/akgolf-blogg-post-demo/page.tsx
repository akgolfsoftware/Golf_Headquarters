/**
 * Marketing demo — Ett blogginnlegg (akgolf.no/blogg/[slug])
 * Hero med kategori-pill + tittel + dato + leseretid + forfatter, hero-bilde,
 * artikkel-body, forfatter-card og relaterte artikler.
 */
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Share2,
  Bookmark,
  Quote,
} from "lucide-react";
import { MarketingNav, MarketingFooter } from "../_marketing-demo/chrome";

type RelatedPost = {
  slug: string;
  title: string;
  category: string;
  readMinutes: number;
  imageHue: number;
};

const RELATED: RelatedPost[] = [
  {
    slug: "putting-20-minutter",
    title: "Slik trener du putting på 20 minutter daglig",
    category: "Coaching",
    readMinutes: 6,
    imageHue: 72,
  },
  {
    slug: "mental-trening",
    title: "Hvorfor mental trening er undervurdert i golf",
    category: "Mental",
    readMinutes: 7,
    imageHue: 200,
  },
  {
    slug: "vinterforberedelse",
    title: "Hva gode spillere gjør i vintermånedene",
    category: "Coaching",
    readMinutes: 8,
    imageHue: 195,
  },
];

export default function BloggPostDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <Link
            href="/akgolf-blogg-demo"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Tilbake til blogg
          </Link>

          <div className="mt-8 flex items-center gap-2">
            <span className="rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-foreground">
              Coaching
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Metode
            </span>
          </div>

          <h1 className="mt-6 font-display text-[40px] font-semibold leading-[1.05] tracking-tight md:text-[56px]">
            Slik bygger du en treningsplan som{" "}
            <em className="font-display font-normal italic [font-family:var(--font-instrument-serif),serif]">
              faktisk
            </em>{" "}
            fungerer
          </h1>

          <p className="mt-6 text-[19px] leading-[1.55] text-muted-foreground">
            Vi har coachet over 200 spillere de siste tre sesongene. Her er
            strukturen som skiller dem som blir bedre fra dem som står på stedet
            hvil.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-b border-border py-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
                <span className="font-display text-[16px] font-semibold leading-none">
                  AK
                </span>
              </div>
              <div>
                <div className="text-[14px] font-semibold">
                  Anders Kristiansen
                </div>
                <div className="text-[12px] text-muted-foreground">
                  Hovedcoach · PGA Class A
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" strokeWidth={1.5} />
                8. mai 2026
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" strokeWidth={1.5} />9 min lesetid
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              Del
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              <Bookmark className="h-3.5 w-3.5" strokeWidth={1.5} />
              Lagre
            </button>
          </div>
        </div>
      </section>

      {/* Hero bilde */}
      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div
            className="relative h-[440px] w-full overflow-hidden rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(159 28% 88%) 0%, hsl(159 18% 70%) 100%)",
            }}
          >
            <div className="absolute inset-0 grid place-items-center opacity-30">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
                AK Golf · hero-bilde
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Artikkel-body */}
      <article className="bg-background">
        <div className="mx-auto max-w-3xl px-6 pb-16">
          <p className="text-[18px] leading-[1.7] text-foreground">
            De fleste spillere jeg møter har én ting felles når vi setter oss
            ned for første gang: de har trent mye, men ikke nødvendigvis riktig.
            De har slått tusenvis av baller på range, lest bøker om sving, og
            kanskje gått til en coach en gang i året. Likevel står handicapet
            der det har stått i tre år.
          </p>

          <p className="mt-6 text-[17px] leading-[1.75] text-foreground">
            Det er ikke fordi de mangler talent. Det er fordi de mangler{" "}
            <strong>struktur</strong>. En treningsplan som fungerer er ikke en
            liste med øvelser — det er en arkitektur som styrer hva du gjør, når
            du gjør det, og hvorfor.
          </p>

          <h2 className="mt-12 font-display text-[28px] font-semibold leading-[1.15] tracking-tight">
            1. Start med en ærlig diagnose
          </h2>
          <p className="mt-4 text-[17px] leading-[1.75] text-foreground">
            Før du legger en plan, må du vite hvor du faktisk taper slag. Hos
            oss på Mulligan starter alle nye spillere med en Strokes Gained-test
            mot TrackMan. Tallene lyver ikke — de viser om du taper mest fra tee,
            i innspill, rundt greenen eller på putting.
          </p>

          <blockquote className="my-10 border-l-4 border-primary bg-card p-8 rounded-r-2xl">
            <Quote
              className="h-6 w-6 text-primary opacity-50"
              strokeWidth={1.5}
            />
            <p className="mt-3 font-display text-[22px] font-medium italic leading-[1.4] [font-family:var(--font-instrument-serif),serif]">
              De fleste spillere bruker 70 % av treningstiden på det de allerede
              er gode på. Det er menneskelig — men det er ikke utvikling.
            </p>
            <footer className="mt-4 text-[13px] text-muted-foreground">
              — Markus Roinås Pedersen, da han startet hos oss i 2023
            </footer>
          </blockquote>

          <h2 className="mt-12 font-display text-[28px] font-semibold leading-[1.15] tracking-tight">
            2. Bygg i fem lag — pyramiden
          </h2>
          <p className="mt-4 text-[17px] leading-[1.75] text-foreground">
            AK Golf-pyramiden er måten vi strukturerer all trening på. Fem lag,
            hver med sin egen rolle i utviklingen:
          </p>

          <ul className="mt-5 space-y-2.5 text-[17px] leading-[1.6] text-foreground">
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>FYS</strong> — fysisk fundament, mobilitet, rotasjon
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>TEK</strong> — teknikk, svingarbeid, video
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>SLAG</strong> — slagprogresjon, range, sand, putte
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>SPILL</strong> — banespill, 9- og 18-hulls
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>TURN</strong> — konkurransepuls, turnering
              </span>
            </li>
          </ul>

          <h3 className="mt-10 font-display text-[22px] font-semibold leading-[1.2] tracking-tight">
            Hvorfor pyramide og ikke sjekkliste?
          </h3>
          <p className="mt-4 text-[17px] leading-[1.75] text-foreground">
            Fordi lagene er avhengige av hverandre. Du kan ikke bygge TEK uten
            FYS. Du kan ikke konkurrere i TURN hvis SPILL ikke sitter. Når en
            spiller stagnerer, er det ofte fordi vi har hoppet over et lag — og
            løsningen er nesten alltid å gå ett trinn ned.
          </p>

          <h2 className="mt-12 font-display text-[28px] font-semibold leading-[1.15] tracking-tight">
            3. Periodiser sesongen i tre faser
          </h2>
          <p className="mt-4 text-[17px] leading-[1.75] text-foreground">
            Vi deler sesongen i forberedelses-, spesifikk- og konkurransefase.
            Hver fase har egen fordeling av pyramide-lagene. I forberedelse er
            FYS og TEK dominerende. I konkurransefase er SPILL og TURN det. Det
            høres åpenbart ut, men 9 av 10 spillere gjør motsatt — de slår
            range-baller i juli og henter frem styrkebøkene i november.
          </p>

          <h2 className="mt-12 font-display text-[28px] font-semibold leading-[1.15] tracking-tight">
            4. Mål og juster — uke for uke
          </h2>
          <p className="mt-4 text-[17px] leading-[1.75] text-foreground">
            En plan uten oppfølging er en ønskeliste. Vi gjennomgår tallene
            ukentlig: hvor mye tid ble brukt per lag, hva sa Strokes
            Gained-bevegelsen, hva sier spilleren selv. Justeringer skjer i små
            steg — sjelden full overhaling.
          </p>

          <p className="mt-6 text-[17px] leading-[1.75] text-foreground">
            Dette er ikke raketforskning. Men det er heller ikke det de fleste
            gjør. Hvis du vil ha hjelp til å sette opp din egen versjon, har vi
            plass for nye spillere i juni.
          </p>

          <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
            <h3 className="font-display text-[24px] font-semibold leading-[1.2] tracking-tight">
              Vil du teste vår metode?
            </h3>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Bestill en 60-minutters introøkt på Mulligan. 990 kr, ingen
              binding.
            </p>
            <Link
              href="#"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Book introøkt
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </article>

      {/* Forfatter-card */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <span className="font-display text-[28px] font-semibold leading-none">
                AK
              </span>
            </div>
            <div className="flex-1">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Forfatter
              </span>
              <h3 className="mt-1 font-display text-[24px] font-semibold tracking-tight">
                Anders Kristiansen
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
                Hovedcoach og daglig leder i AK Golf Academy. PGA Class A Pro
                med over 15 års erfaring fra elite-coaching, junior-utvikling og
                voksenopplæring. Jobber daglig med spillere fra HCP 36 til
                tour-aspiranter.
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href="#"
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Se alle artikler
                </Link>
                <Link
                  href="#"
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Book en økt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Relaterte artikler */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="font-display text-[28px] font-semibold tracking-tight">
            Relaterte artikler
          </h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Mer fra samme tema, plukket av redaksjonen.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            {RELATED.map((p) => (
              <Link
                key={p.slug}
                href="/akgolf-blogg-post-demo"
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-foreground/30"
              >
                <div
                  className="h-44 w-full"
                  style={{
                    background: `linear-gradient(135deg, hsl(${p.imageHue} 28% 88%) 0%, hsl(${p.imageHue} 18% 76%) 100%)`,
                  }}
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                      {p.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {p.readMinutes} min
                    </span>
                  </div>
                  <h3 className="font-display text-[18px] font-semibold leading-[1.25] tracking-tight">
                    {p.title}
                  </h3>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[13px] font-medium text-primary group-hover:gap-2.5 transition-all">
                    Les saken
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
