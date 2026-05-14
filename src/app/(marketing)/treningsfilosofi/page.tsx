import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slik trener vi — AK Golf Academy",
  description:
    "Pyramide-systemet, data-drevet trening og individualiserte planer. Slik bygger AK Golf Academy spillere som får fremgang.",
};

const PYRAMIDE = [
  {
    kort: "FYS",
    navn: "Fysisk",
    tekst:
      "Kjernemuskulatur, balanse, mobilitet og rotasjon. Uten den fysiske basen kan ikke tekniske endringer feste seg.",
  },
  {
    kort: "TEK",
    navn: "Teknisk",
    tekst:
      "Sving, grep, impact-posisjon og club-path. Vi bygger en sving som er repeterbar — ikke perfekt på papiret, men perfekt for deg.",
  },
  {
    kort: "SLAG",
    navn: "Slag",
    tekst:
      "Pitch, putt, korthold og bunkerslag. Trygghet rundt grønnen sparer flest slag — derfor får dette stor plass i planen.",
  },
  {
    kort: "SPILL",
    navn: "Spill",
    tekst:
      "Banetilpasning, beslutninger, club-valg og scoring-strategi. Du må vite hvilke slag du skal velge, ikke bare hvordan du slår dem.",
  },
  {
    kort: "TURN",
    navn: "Turnering",
    tekst:
      "Press-håndtering, pre-shot rutine, match-play-mentalitet. Det du gjør på rangen må også fungere når det gjelder.",
  },
];

const SG = [
  { kort: "OTT", navn: "Off The Tee", tekst: "Drives og lengde-slag fra utslag" },
  { kort: "APP", navn: "Approach", tekst: "Innspill til grønn fra fairway/rough" },
  { kort: "ARG", navn: "Around the Green", tekst: "Chip, pitch og korthold" },
  { kort: "PUTT", navn: "Putting", tekst: "Alle slag på grønnen" },
];

export default function Treningsfilosofi() {
  return (
    <div className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Slik trener vi
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            <em className="font-normal italic text-primary">Trening</em> som er
            balansert, målbar og din egen.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground">
            Vi tror ikke på trening-flavor-of-the-week. Hver spiller får en plan
            basert på tre prinsipper: balansert pyramide, data-drevet retning,
            og individualisering på alvor.
          </p>
        </header>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border">
          <Image
            src="/images/akademy/putting-vann.jpg"
            alt="To spillere på putting-grønn med vann-refleksjon i forgrunnen"
            width={1920}
            height={1280}
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="h-auto w-full object-cover"
          />
        </div>

        <section className="mt-16">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Prinsipp 1
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">
            Pyramide-systemet
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Fem områder må jobbes med samtidig — ikke ett etter et. Vi sørger
            for at tiden din fordeles riktig.
          </p>

          <div className="mt-8 space-y-4">
            {PYRAMIDE.map((p) => (
              <article
                key={p.kort}
                className="flex items-start gap-4 rounded-md border border-border bg-card p-6"
              >
                <span className="mt-1 inline-flex h-10 w-12 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-[11px] uppercase tracking-[0.10em] text-primary">
                  {p.kort}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {p.navn}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.tekst}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Prinsipp 2
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">
            Data forteller hvor du skal trene
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Vi bruker Strokes Gained (SG) til å se nøyaktig hvor du taper slag
            mot ditt nivå. Det betyr at planen din peker på det som faktisk
            koster deg slag — ikke det som føles dårligst.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SG.map((s) => (
              <div
                key={s.kort}
                className="rounded-md border border-border bg-card p-4"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                  {s.kort}
                </span>
                <h3 className="mt-2 font-display text-base font-semibold tracking-tight">
                  {s.navn}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.tekst}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Etter noen registrerte runder ser vi mønsteret. Da vet vi om
            problemet sitter i drives, i innspillene, rundt grønnen eller på
            putten — og planen oppdateres deretter.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/akademy/bunker-shot.jpg"
              alt="Nærbilde av spiller midt i bunker-shot med sand som spruter"
              width={1920}
              height={1280}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="h-auto w-full object-cover"
            />
          </div>
        </section>

        <section className="mt-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Prinsipp 3
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">
            Ingen plan er kopi av en annen
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Det som virker for en elite-junior virker ikke for en 50-åring som
            spiller én gang i uken. Hver plan tar utgangspunkt i tre ting:{" "}
            <strong className="text-foreground">målet ditt</strong>,{" "}
            <strong className="text-foreground">tiden du har tilgjengelig</strong>
            , og{" "}
            <strong className="text-foreground">
              ferdighetene du allerede har
            </strong>
            . Det er du som setter ambisjonen — vi sørger for at veien dit er
            realistisk.
          </p>
        </section>

        <section className="mt-20 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Vil du trene slik?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Book en intro-time, eller velg en av coaching-pakkene våre med
            månedlig oppfølging.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/booking"
              className="rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground"
            >
              Book intro-time
            </Link>
            <Link
              href="/coaching"
              className="rounded-md border border-input bg-card px-6 py-4 text-sm font-medium text-foreground hover:border-border"
            >
              Se coaching-pakker →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
