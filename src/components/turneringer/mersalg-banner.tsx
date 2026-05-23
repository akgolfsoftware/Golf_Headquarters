/**
 * Mersalg-banner for /turneringer.
 * Konvertering-trakt fra turnerings-trafikk til PlayerHQ Pro.
 *
 * Plausible-event: cta-click-turneringer-til-playerhq
 */

import Link from "next/link";
import { ArrowRight, Target, LineChart, Sparkles } from "lucide-react";

export function MersalgBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-10 sm:py-16 md:px-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
        style={{ background: "rgba(209,248,67,0.18)" }}
      />
      <div className="relative max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
          <Sparkles className="h-3 w-3" strokeWidth={2} />
          PlayerHQ
        </div>
        <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
          Følger du proffene?{" "}
          <em className="font-display font-normal italic text-accent">
            Lær av dem også.
          </em>
        </h2>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.6] opacity-90 md:text-[17px]">
          Du følger Hovland og Aune denne uka — kanskje du bør strukturere din egen
          trening på samme måte. PlayerHQ gir deg treningsdagbok, statistikk og
          AI-coach. Bygd av coacher med 10+ års erfaring fra norsk landslag.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Feature
            Icon={Target}
            tittel="Treningsdagbok"
            tekst="Logg hver økt. Se progresjon over tid."
          />
          <Feature
            Icon={LineChart}
            tittel="Strokes gained"
            tekst="Vet du tjener slag — og hvor du taper dem."
          />
          <Feature
            Icon={Sparkles}
            tittel="AI-coach"
            tekst="Personlige anbefalinger basert på data."
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            href="/auth/signup"
            data-event="cta-click-turneringer-til-playerhq"
            data-source="banner"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Start gratis
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <Link
            href="/playerhq"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-6 text-[15px] font-semibold transition-colors hover:bg-white/10"
          >
            Se hva du får
          </Link>
        </div>
      </div>
    </div>
  );
}

function Feature({
  Icon,
  tittel,
  tekst,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tittel: string;
  tekst: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <h3 className="mt-3 font-display text-base font-semibold tracking-tight">
        {tittel}
      </h3>
      <p className="mt-1 text-[13px] leading-[1.5] opacity-80">{tekst}</p>
    </div>
  );
}
