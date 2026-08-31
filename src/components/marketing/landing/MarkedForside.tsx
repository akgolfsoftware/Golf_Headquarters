import Image from "next/image";
import Link from "next/link";

/**
 * Forsiden på akgolf.no — Paper, lys, ekte foto.
 *
 * Fasit: `app/page.tsx` i designprosjektet `ak-golf-website`. Portert 1:1
 * 20.08.2026 etter Anders' beslutning samme dag. Tre avvik, alle fordi HQ
 * eier mer enn designprosjektet gjør:
 *   1. `/hq` → `/playerhq` (eksisterende HQ-rute, beholder sin URL).
 *   2. `mailto:`-CTA-ene → `/booking`. HQ har ekte booking; fasiten hadde
 *      bare e-post fordi den er et frittstående nettsted uten datalag.
 *      E-postadressen står fortsatt i kontaktseksjonen som alternativ.
 *   3. Skallet (nav/footer) kommer fra `(marketing)/layout.tsx` — fasiten
 *      har det i sin egen rot-layout. Denne filen tegner ALDRI eget skall.
 *
 * Fotoene er de ekte Academy-bildene i `public/brand/`. Regelen fra
 * `docs/marketing/masterprompt-visuell.md` gjelder: coaching-scener med
 * mennesker er alltid ekte foto, aldri generert.
 */

const METODIKK = [
  {
    src: "/brand/foto/AK-Golf-Academy-8.jpg",
    title: "Teknikk",
    text: "Svingarbeid forankret i P-posisjoner og ballflukt-lovene — filmet, målt med Trackman, aldri på øyemål.",
  },
  {
    src: "/brand/foto/AK-Golf-Academy-23.jpg",
    title: "Spill",
    text: "Banecoaching der beslutninger, strategi og scoring trenes der det faktisk gjelder.",
  },
  {
    src: "/brand/foto/AK-Golf-Academy-14.jpg",
    title: "Plan",
    text: "Periodisert trening med tydelige mål — du vet alltid neste steg, og hvorfor.",
  },
];

const VEIER = [
  {
    title: "1:1-coaching",
    text: "Fast coach, faste økter og en plan som lever mellom øktene. For deg som vil senke scoren med system.",
    href: "/coaching",
    lenketekst: "Se coachingtilbudet",
  },
  {
    title: "Junior og elite",
    text: "Strukturert utvikling fra junior til turneringsspiller — samme metodikk som brukes i toppidretts- og klubbsatsing.",
    href: "/junior",
    lenketekst: "Les om juniorsatsingen",
  },
  {
    title: "AK Golf HQ",
    text: "Tren på egen hånd med plattformen: plan, økter, tester og Trackman-tall samlet på ett sted.",
    href: "/playerhq",
    lenketekst: "Utforsk plattformen",
  },
];

export function MarkedForside() {
  return (
    <>
      {/* Hero med motion-loop */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/heroes/academy-hero-trackman-16x9.webp"
        >
          <source src="/brand/motion/hero-loop-trackman.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-mk-ink/70 via-mk-ink/40 to-mk-ink/10" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-mk-bg/80">
            AK Golf Academy · Fredrikstad
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-mk-bg sm:text-6xl">
            Coaching bygget på målt sannhet.
          </h1>
          <p className="mt-6 max-w-xl font-mk-serif text-lg text-mk-bg/85">
            Trackman-data, P-posisjoner og en metodikk som følger deg fra
            første økt til turneringsscore. Ikke synsing — måling.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/booking"
              className="inline-block rounded-full bg-mk-bg px-8 py-3 text-center font-medium text-mk-fg transition-colors hover:bg-mk-soft"
            >
              Book en kartleggingsøkt
            </Link>
            <Link
              href="#metodikk"
              className="inline-block rounded-full border border-mk-bg/40 px-8 py-3 text-center font-medium text-mk-bg transition-colors hover:border-mk-bg"
            >
              Se hvordan vi jobber
            </Link>
          </div>
        </div>
      </section>

      {/* Troverdighetsbånd */}
      <section className="border-b border-mk-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 font-mono text-xs uppercase tracking-[0.18em] text-mk-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Coach — WANG Toppidrett Fredrikstad</span>
          <span className="hidden text-mk-hairline sm:inline">·</span>
          <span>Sportssjef — Gamle Fredrikstad GK</span>
          <span className="hidden text-mk-hairline sm:inline">·</span>
          <span>Team Norway Golf-tilknytning</span>
        </div>
      </section>

      {/* Om coachingen — ekte foto */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
              1:1-coaching
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Én spiller. Én plan. Ett system.
            </h2>
            <p className="mt-6 font-mk-serif text-lg leading-relaxed text-mk-muted">
              Hver økt bygger på forrige. Svingen analyseres mot P-posisjoner,
              treningen periodiseres, og fremgangen måles — ikke antas. Du ser
              tallene sammen med coachen, og du vet alltid hva du jobber med og
              hvorfor.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/brand/foto/AK-Golf-Academy-9.jpg"
              alt="Coach og spiller går gjennom svingdata på mobilen mellom slagene"
              width={2400}
              height={1600}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Metodikk — tre ekte foto */}
      <section id="metodikk" className="bg-mk-soft py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
            Metodikken
          </p>
          <h2 className="max-w-xl text-3xl font-semibold sm:text-4xl">
            Fra range til bane til turnering.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {METODIKK.map((card) => (
              <div
                key={card.title}
                className="overflow-hidden rounded-2xl bg-mk-surface"
              >
                <Image
                  src={card.src}
                  alt={card.title}
                  width={2400}
                  height={1600}
                  className="aspect-[3/2] w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="mt-2 font-mk-serif text-sm leading-relaxed text-mk-muted">
                    {card.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tre veier inn */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
          Veien inn
        </p>
        <h2 className="max-w-xl text-3xl font-semibold sm:text-4xl">
          Tre måter å jobbe med oss på.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VEIER.map((v) => (
            <div
              key={v.title}
              className="flex flex-col rounded-2xl border border-mk-border p-8"
            >
              <h3 className="text-xl font-semibold">{v.title}</h3>
              <p className="mt-3 flex-1 font-mk-serif leading-relaxed text-mk-muted">
                {v.text}
              </p>
              <Link
                href={v.href}
                className="mt-6 font-medium underline decoration-mk-hairline underline-offset-4 transition-colors hover:decoration-mk-fg"
              >
                {v.lenketekst}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Junior — ekte foto */}
      <section className="bg-mk-soft py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div className="order-2 overflow-hidden rounded-2xl md:order-1">
            <Image
              src="/brand/foto/AK-Golf-Academy-27.jpg"
              alt="Ung spiller trener nærspill med coach på banen"
              width={2400}
              height={1600}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
              Junior
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Utvikling som tåler å bli målt.
            </h2>
            <p className="mt-6 font-mk-serif text-lg leading-relaxed text-mk-muted">
              Juniorsatsingen bygger på samme metodikk som elitecoachingen —
              tilpasset alder og nivå, med tydelige steg fra første golfskole
              til turneringsspill.
            </p>
            <Link
              href="/junior"
              className="mt-8 inline-block rounded-full bg-mk-cta px-6 py-3 text-sm font-medium text-mk-on-cta transition-colors hover:bg-mk-cta-hover"
            >
              Les om juniorsatsingen
            </Link>
          </div>
        </div>
      </section>

      {/* HQ-teaser */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/brand/mockups/mockup-ipad.webp"
              alt="AK Golf HQ på iPad"
              width={2752}
              height={1536}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
              AK Golf HQ
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Hele treningen din. Ett sted.
            </h2>
            <p className="mt-6 font-mk-serif text-lg leading-relaxed text-mk-muted">
              Plan, økter, tester og Trackman-tall samlet i én plattform — for
              deg som spiller, og for coachen som følger deg.
            </p>
            <Link
              href="/playerhq"
              className="mt-8 inline-block rounded-full bg-mk-cta px-6 py-3 text-sm font-medium text-mk-on-cta transition-colors hover:bg-mk-cta-hover"
            >
              Utforsk plattformen
            </Link>
          </div>
        </div>
      </section>

      {/* Mulligan-teaser — ink-bånd */}
      <section className="bg-mk-ink py-24 text-mk-bg">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent">
              Mulligan Indoor Golf
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              TrackMan-simulatorer. Åpent 07–24.
            </h2>
            <p className="mt-6 font-mk-serif text-lg leading-relaxed text-mk-mid">
              Seks simulatorer fordelt på Fredrikstad og Sarpsborg. Tren, spill
              verdens beste baner, eller ta kvelden med venner.
            </p>
            <Link
              href="/mulligan"
              className="mt-8 inline-block rounded-full bg-mk-bg px-6 py-3 text-sm font-medium text-mk-fg transition-colors hover:bg-mk-soft"
            >
              Se anlegg og priser
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/brand/lifestyle/lifestyle-mulligan-kveld-16x9.webp"
              alt="Venner spiller golfsimulator en kveld hos Mulligan"
              width={2688}
              height={1520}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl bg-mk-soft px-8 py-16 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
            Kartleggingsøkt
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Klar for å trene med system?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-mk-serif text-lg text-mk-muted">
            Første økt kartlegger svingen, tallene og målene dine — og ender i
            en konkret plan. Vi anbefaler 90 minutter, til vanlig timepris.
            Velg tid i kalenderen, eller send en e-post.
          </p>
          <Link
            href="/booking"
            className="mt-8 inline-block rounded-full bg-mk-cta px-8 py-3 font-medium text-mk-on-cta transition-colors hover:bg-mk-cta-hover"
          >
            Book en kartleggingsøkt
          </Link>
          <p className="mt-4 font-mono text-xs text-mk-muted">
            <a
              href="mailto:akgolfgroup@gmail.com?subject=Kartleggings%C3%B8kt"
              className="transition-colors hover:text-mk-fg"
            >
              akgolfgroup@gmail.com
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
