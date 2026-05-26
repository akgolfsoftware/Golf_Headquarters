import Link from "next/link";
import type { Metadata } from "next";
import { PlayerHQMockup } from "@/components/marketing/playerhq-mockup";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const metadata: Metadata = {
  title: "PlayerHQ — AK Golf Academy",
  description:
    "PlayerHQ er spillerportalen til AK Golf Academy: treningsplaner, runde-registrering, statistikk og AI-coach. Gratis i beta — første betaling 1. juni 2026.",
};

const FUNKSJONER = [
  {
    label: "Hjem",
    tittel: "Dashboard som faktisk hjelper",
    tekst:
      "Personlig hilsen, dagens fokus, neste økt og siste runde. Du ser hvor du står på 10 sekunder.",
  },
  {
    label: "Treningsplan",
    tittel: "Ukeplanen i lomma",
    tekst:
      "Coachen din legger inn øktene — du ser hva som står for tur, kan starte fra mobil og logge ferdig på sekunder.",
  },
  {
    label: "Live-økt",
    tittel: "Tapper-mode for hver økt",
    tekst:
      "Fullscreen-flyt på iPad eller mobil. Rating per drill, vurdering på slutten, automatisk logging tilbake til planen.",
  },
  {
    label: "Runder + SG",
    tittel: "Strokes Gained ferdig regnet",
    tekst:
      "Registrer runden hull-for-hull. SG-fordeling i OTT/APP/ARG/PUTT viser sterke og svake områder over tid.",
  },
  {
    label: "AI-coach",
    tittel: "Personlig analyse 24/7",
    tekst:
      "Spør AI-en om hva som helst — den kjenner HCP-en din, planen din og siste runder. Får konkrete råd, ikke generelt blabla.",
  },
  {
    label: "Mål + streak",
    tittel: "Hold deg på planen",
    tekst:
      "Streak-bars siste 14 dager, achievements når du følger gjennom, og varsler når du har gjort det viktige.",
  },
];

export default function PlayerHQ() {
  return (
    <div>
      <section className="bg-gradient-to-b from-background to-secondary/40 px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
            <AthleticEyebrow tone="lime">
              BETA · Gratis frem til 1. juni 2026
            </AthleticEyebrow>
            <p className="mt-2 text-sm text-muted-foreground">
              PlayerHQ er i beta — bugs kan forekomme. Academy-kunder beholder
              gratis tilgang også etter beta-perioden.
            </p>
          </div>

          <header className="mt-10 text-center">
            <AthleticEyebrow tone="lime">PlayerHQ</AthleticEyebrow>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              <em className="font-normal italic text-primary">Din</em>{" "}
              spillerportal
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground">
              Treningsplaner, statistikk, runde-registrering og AI-coach — alt
              samlet i én app. Bygget av AK Golf Academy for å støtte coaching
              mellom øktene.
            </p>
          </header>
        </div>
      </section>

      <section className="border-y border-border bg-card px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <AthleticEyebrow>Funksjoner</AthleticEyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              <em className="font-normal italic text-primary">Hva</em> får du
            </h2>
          </div>

          <div className="mt-12">
            <PlayerHQMockup />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FUNKSJONER.map((f) => (
              <article
                key={f.label}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                  {f.label}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold leading-tight">
                  {f.tittel}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.tekst}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <AthleticEyebrow>Pris</AthleticEyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Hvordan{" "}
              <em className="font-normal italic text-primary">prises</em>{" "}
              PlayerHQ?
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <article className="rounded-2xl border border-primary/40 bg-primary/5 p-8">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                Academy-kunde
              </h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold tabular-nums">
                  Gratis
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Inkludert i Performance og Performance Pro så lenge abonnementet
                er aktivt.
              </p>
              <Link
                href="/coaching"
                className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
              >
                Se coaching-pakker →
              </Link>
            </article>

            <article className="rounded-2xl border border-border bg-card p-8">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                Uten Academy
              </h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold tabular-nums">
                  300 kr
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  / mnd
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Gratis under beta. Første faktura sendes 1. juni 2026. Du kan
                avslutte når som helst.
              </p>
              <Link
                href="/auth/signup"
                className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
              >
                Prøv gratis nå →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-primary/5 px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            <em className="font-normal italic text-primary">Klar</em> til å
            prøve?
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Bli Academy-kunde for full coaching-pakke, eller signe opp gratis
            for kun PlayerHQ.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/coaching"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-[15px] font-bold text-accent shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Bli Academy-kunde
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-6 text-[15px] font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Prøv PlayerHQ gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
