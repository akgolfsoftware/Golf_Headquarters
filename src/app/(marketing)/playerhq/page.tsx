/**
 * AK Golf HQ — produktsiden for plattformen (offentlig).
 *
 * Fasit: `app/hq/page.tsx` i designprosjektet `ak-golf-website`, portert
 * 20.08.2026. Ruten beholder sin eksisterende URL `/playerhq` (SEO + lenker),
 * mens fasiten kaller den `/hq` fordi den er et frittstående nettsted.
 *
 * Ett avvik fra fasiten: alle `akgolf-hq.vercel.app/auth/*`-lenker er gjort
 * interne. Dette ER appen — å sende brukeren ut til et absolutt domene for å
 * logge inn på samme sted er en omvei, og bryter innloggingstilstanden.
 * Skallet eies av `(marketing)/layout.tsx`.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AK Golf HQ — Hele treningen din. Ett sted.",
  description:
    "Plattformen som samler plan, økter, tester og Trackman-data — for spiller og coach.",
};

const FUNKSJONER = [
  {
    title: "Plan",
    text: "Ukeplanen din, periodisert gjennom sesongen. Hver økt vet hvorfor den finnes.",
  },
  {
    title: "Økter",
    text: "Gjennomfør økter med drills, mål og logging — på rangen, på banen eller i simulatoren.",
  },
  {
    title: "Tester",
    text: "Standardiserte testprotokoller som viser fremgangen i tall, ikke i følelser.",
  },
  {
    title: "Trackman",
    text: "Slagdata kobles rett på treningen din. Se hva som faktisk endrer seg.",
  },
  {
    title: "Analyse",
    text: "Strokes gained og rundelogg viser hvor slagene forsvinner — og hvor planen skal peke.",
  },
  {
    title: "Coach-kobling",
    text: "Coachen ser det samme som deg og justerer planen mellom øktene.",
  },
];

export default function HqPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-24">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
          AK Golf HQ
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
          Hele treningen din. Ett sted.
        </h1>
        <p className="mt-6 max-w-xl font-mk-serif text-lg leading-relaxed text-mk-muted">
          AK Golf HQ er plattformen bak coachingen: treningsplanen din, øktene,
          testene og Trackman-tallene — samlet, målt og fulgt opp.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/auth/login"
            className="inline-block rounded-full bg-mk-cta px-8 py-3 text-center font-medium text-mk-on-cta transition-colors hover:bg-mk-cta-hover"
          >
            Logg inn i AK Golf HQ
          </Link>
          <Link
            href="/booking"
            className="inline-block rounded-full border border-mk-hairline px-8 py-3 text-center font-medium transition-colors hover:border-mk-fg"
          >
            Snakk med en coach først
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="overflow-hidden rounded-3xl">
          <Image
            src="/brand/heroes/hq-hero-16x9.webp"
            alt="AK Golf HQ i bruk i coachingstudioet"
            width={2752}
            height={1536}
            className="w-full object-cover"
            priority
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-xl text-3xl font-semibold sm:text-4xl">
          Alt treningen din trenger — ingenting den ikke trenger.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {FUNKSJONER.map((f) => (
            <div key={f.title} className="rounded-2xl bg-mk-soft p-8">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-3 font-mk-serif text-sm leading-relaxed text-mk-muted">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/brand/mockups/mockup-iphone.webp"
              alt="AK Golf HQ på mobil"
              width={2752}
              height={1536}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-semibold">Med deg på banen.</h2>
            <p className="mt-6 font-mk-serif text-lg leading-relaxed text-mk-muted">
              Planen ligger i lomma. Logg runder, følg økter og se tallene dine
              der treningen faktisk skjer.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-mk-soft px-8 py-16 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
            Pris
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Gratis med coaching. Ellers 299 kr/mnd.
          </h2>
          <p className="mx-auto mt-4 max-w-md font-mk-serif text-lg text-mk-muted">
            Trener du med en av coachene våre, er plattformen inkludert. Vil du
            bruke den på egen hånd, koster den 299 kr i måneden — ingen
            binding.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-block rounded-full bg-mk-cta px-8 py-3 font-medium text-mk-on-cta transition-colors hover:bg-mk-cta-hover"
            >
              Kom i gang
            </Link>
            <Link
              href="/auth/login"
              className="inline-block rounded-full border border-mk-hairline px-8 py-3 font-medium transition-colors hover:border-mk-fg"
            >
              Har konto? Logg inn
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
