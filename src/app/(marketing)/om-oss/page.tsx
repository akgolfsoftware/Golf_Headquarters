import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const metadata: Metadata = {
  title: "Om oss | AK Golf Academy",
  description:
    "Les om Anders Kristiansen og filosofien bak AK Golf Academy — personlig coaching bygd på Mac O'Grady-metodikk og moderne data-analyse.",
};

export default function OmOss() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <AthleticEyebrow tone="lime">Om oss</AthleticEyebrow>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            <em className="font-normal italic text-primary">Personlig</em>{" "}
            coaching, bygd på data
          </h1>
        </header>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border">
          <Image
            src="/images/akademy/coach-observerer.jpg"
            alt="Anders Kristiansen observerer og veileder spiller på øvingsbanen"
            width={1920}
            height={1280}
            priority
            sizes="(max-width: 1024px) 100vw, 768px"
            className="h-auto w-full object-cover"
          />
        </div>

        <div className="mt-12 space-y-6 text-base leading-relaxed text-foreground">
          <p>
            AK Golf Academy drives av Anders Kristiansen — golfcoach, gründer og
            CEO i AK Golf Group AS. Etter mer enn et tiår med spillere på alle
            nivåer, fra klubbamatører til konkurranseutøvere, har Anders bygget
            en coaching-praksis som kombinerer tett personlig oppfølging med
            målbar fremgang.
          </p>

          <blockquote className="border-l-4 border-primary pl-6 text-lg italic text-primary">
            «Coaching skal ikke være magi. Det skal være tydelig: hva vi jobber
            med, hvorfor vi jobber med det, og hvordan du ser at det virker.
            Det er det Academy er bygget rundt.»
          </blockquote>

          <p>
            Kjernen er AK Golf-pyramiden — et balansert system som sørger for
            at treningstiden fordeles riktig mellom fysikk, teknikk, slag,
            spill og turneringserfaring. Til daglig støttes coachingen av
            PlayerHQ, spillerportalen som holder plan, runder og statistikk
            samlet på ett sted.
          </p>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Selskapet
          </h2>
          <dl className="mt-6 space-y-4 text-sm">
            <Rad label="Org.nummer" value="927 248 581" />
            <Rad label="Adresse" value="AK Golf Group AS, Fredrikstad, Norge" />
            <Rad label="E-post" value="post@akgolf.no" />
          </dl>
        </section>

        <div className="mt-16 text-center">
          <Link
            href="/booking"
            className="font-display inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-accent px-5 text-sm font-bold tracking-[-0.005em] text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Book første time →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Rad({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/40 pb-4 last:border-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
