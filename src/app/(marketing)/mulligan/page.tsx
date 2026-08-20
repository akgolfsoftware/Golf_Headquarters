/**
 * Mulligan Indoor Golf — anlegg, rundtur og priser.
 *
 * Fasit: `app/mulligan/page.tsx` i designprosjektet `ak-golf-website`,
 * portert 1:1 20.08.2026. Ny rute i HQ — fantes ikke her fra før.
 *
 * Siden er MØRK med vilje (`bg-mk-ink`): det er et innholdsbånd inne i det
 * lyse skallet, ikke et tema. Ikke «rett opp» til lys — fasiten tegner den
 * slik, og simulatorbildene bærer den mørke flaten.
 *
 * Prisene og lokasjonene er Anders' egne tall fra fasiten. Endres de, endres
 * de her — det finnes ingen prisdatabase for Mulligan.
 */

import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title:
    "Mulligan Indoor Golf — TrackMan-simulatorer i Fredrikstad og Sarpsborg",
  description:
    "Seks TrackMan-simulatorer. Åpent 07–24 hver dag. Book time eller ta hele kvelden med venner.",
};

const LOKASJONER = [
  {
    by: "Fredrikstad",
    sted: "Fairplay Padel Senter, Produksjonsveien 21",
    utstyr: "4 × TrackMan 4",
  },
  {
    by: "Sarpsborg",
    sted: "Superland Quality Hotel, Bjørnstadveien 12",
    utstyr: "2 × TrackMan iO",
  },
];

const PRISER = [
  { navn: "Hverdager 07–15 og 22–24", pris: "325 kr/t" },
  { navn: "Hverdager og helg 15–22", pris: "375 kr/t" },
  { navn: "Spill en hel kveld (fre–lør 18–24), 2 simulatorer", pris: "3000 kr" },
  { navn: "Spill en hel kveld (fre–lør 18–24), 4 simulatorer", pris: "4500 kr" },
];

export default function MulliganPage() {
  return (
    <div className="bg-mk-ink text-mk-bg">
      <section className="relative flex min-h-[70vh] items-end overflow-hidden">
        <Image
          src="/brand/heroes/mulligan-hero-16x9.webp"
          alt="Golfspiller i mørk simulatorbay hos Mulligan"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-mk-ink via-mk-ink/30 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent">
            Mulligan Indoor Golf
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Golf hele året. På TrackMan.
          </h1>
          <p className="mt-6 max-w-xl font-mk-serif text-lg text-mk-mid">
            Seks simulatorer i Fredrikstad og Sarpsborg. Tren med tall, spill
            verdens beste baner, eller ta kvelden med venner. Åpent 07–24 hver
            dag.
          </p>
          <a
            href="#priser"
            className="mt-8 inline-block rounded-full bg-mk-bg px-8 py-3 font-medium text-mk-fg transition-colors hover:bg-mk-soft"
          >
            Se priser og book
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-semibold">Anleggene</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {LOKASJONER.map((l) => (
            <div
              key={l.by}
              className="rounded-2xl border border-mk-bg/10 bg-mk-ink-2 p-8"
            >
              <h3 className="text-xl font-semibold">{l.by}</h3>
              <p className="mt-2 font-mk-serif text-mk-mid">{l.sted}</p>
              <p className="mt-4 font-mono text-sm text-mk-sky">{l.utstyr}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rundtur i lokalet — ekte video */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">Se deg rundt.</h2>
            <p className="mt-6 font-mk-serif text-lg leading-relaxed text-mk-mid">
              Slik ser det ut hos oss: TrackMan-bayer, kunstgress og kaffe.
              Kom innom, eller book første time rett i appen.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <video
              className="w-full max-w-[340px] rounded-2xl border border-mk-bg/10"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Videorundtur i Mulligan-lokalet"
            >
              <source src="/brand/motion/mulligan-rundtur-9x16.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Tren med tall */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/brand/lifestyle/lifestyle-mulligan-tren-16x9.webp"
              alt="Spiller trener alene i simulatorbay med slagdata på skjermen"
              width={2688}
              height={1520}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-semibold">Tren med tall.</h2>
            <p className="mt-6 font-mk-serif text-lg leading-relaxed text-mk-mid">
              Samme målinger som touren bruker. Ballhastighet, spinn, bane og
              treffbilde — hvert slag gir deg svar, ikke gjetning.
            </p>
          </div>
        </div>
      </section>

      {/* Kveld med venner */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-semibold">Ta kvelden her.</h2>
            <p className="mt-6 font-mk-serif text-lg leading-relaxed text-mk-mid">
              Book hele lokalet en fredag eller lørdag: simulatorene, loungen
              og verdens beste baner — for vennegjengen, laget eller jobben.
            </p>
          </div>
          <div className="order-1 overflow-hidden rounded-2xl md:order-2">
            <Image
              src="/brand/lifestyle/lifestyle-mulligan-kveld-16x9.webp"
              alt="Venner samlet i loungen mens én slår mot simulatorskjermen"
              width={2688}
              height={1520}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="priser" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-3xl font-semibold">Priser</h2>
        <div className="mt-10 divide-y divide-mk-bg/10 rounded-2xl border border-mk-bg/10 bg-mk-ink-2">
          {PRISER.map((p) => (
            <div
              key={p.navn}
              className="flex items-center justify-between gap-6 px-8 py-5"
            >
              <span className="font-mk-serif text-mk-mid">{p.navn}</span>
              <span className="whitespace-nowrap font-mono text-mk-bg">
                {p.pris}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-6 font-mk-serif text-sm text-mk-mid">
          Booking via AlbaPlay-appen. «Spill en hel kveld» bestilles på{" "}
          <a
            href="mailto:anders@mulligangolf.no"
            className="text-mk-bg underline decoration-mk-bg/30 underline-offset-4 hover:decoration-mk-bg"
          >
            anders@mulligangolf.no
          </a>
          .
        </p>
      </section>
    </div>
  );
}
