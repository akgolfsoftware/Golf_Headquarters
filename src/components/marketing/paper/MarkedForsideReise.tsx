"use client";

/**
 * Forsiden på akgolf.no — «Reisen» (Anders 2026-08-28: hyper-moderne,
 * 3D-animert forside der de ekte bildene tar deg med på en reise).
 *
 * Bygget uten nye avhengigheter: CSS 3D-perspektiv + custom properties
 * (`--fr-*`) som settes av én passiv scroll-lytter med rAF-throttle.
 * Bevegelsen bor i forside-reise.css; farger/typografi er mk-tokenene
 * (Paper-marketing, lys) som resten av nettstedet.
 *
 * Innhold og copy er videreført fra MarkedForside (porten av ak-golf-
 * website-fasiten 20.08) — reisen er en ny fortellerform, ikke ny tekst.
 * Fotoregelen fra docs/marketing/masterprompt-visuell.md gjelder:
 * coaching-scener med mennesker er alltid ekte foto, aldri generert.
 *
 * prefers-reduced-motion: hele siden faller til statisk layout (CSS-en
 * nuller transformene; lytteren startes ikke).
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import "./forside-reise.css";

/* ── Reisens fire kapitler — ekte foto, én setning per steg ─────────────── */

const KAPITLER = [
  {
    nr: "01",
    eyebrow: "Kartlegging",
    tittel: "Vi starter med sannheten.",
    tekst:
      "Første økt kartlegger svingen, tallene og målene dine. Ikke synsing — måling.",
    src: "/brand/foto/AK-Golf-Academy-9.jpg",
    alt: "Coach og spiller går gjennom svingdata på mobilen mellom slagene",
  },
  {
    nr: "02",
    eyebrow: "Teknikk",
    tittel: "Svingen, målt — aldri på øyemål.",
    tekst:
      "Svingarbeid forankret i P-posisjoner og ballflukt-lovene, filmet og målt med Trackman.",
    src: "/brand/foto/AK-Golf-Academy-8.jpg",
    alt: "Teknisk svingarbeid på rangen med kamera og Trackman",
  },
  {
    nr: "03",
    eyebrow: "Banen",
    tittel: "Trening der scoren settes.",
    tekst:
      "Banecoaching der beslutninger, strategi og scoring trenes der det faktisk gjelder.",
    src: "/brand/foto/AK-Golf-Academy-23.jpg",
    alt: "Banecoaching ute på golfbanen",
  },
  {
    nr: "04",
    eyebrow: "Turnering",
    tittel: "Klar når det gjelder.",
    tekst:
      "Periodisert trening med tydelige mål — du vet alltid neste steg, og hvorfor.",
    src: "/brand/foto/AK-Golf-Academy-14.jpg",
    alt: "Spiller i turneringsmodus på banen",
  },
] as const;

/* ── Filmstripen — bildene som en rull, drevet av scroll ────────────────── */

const STRIP = [4, 17, 21, 26, 30, 35, 39, 42, 12, 28].map((n) => ({
  src: `/brand/foto/AK-Golf-Academy-${n}.jpg`,
  alt: "Fra hverdagen i AK Golf Academy",
}));

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
] as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function MarkedForsideReise() {
  const heroRef = useRef<HTMLElement | null>(null);
  const reiseRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const stripRadRef = useRef<HTMLDivElement | null>(null);
  const rotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const oppdater = () => {
      raf = 0;
      const vh = window.innerHeight;

      // Hero: 0 → 1 over den første viewporthøyden.
      const hero = heroRef.current;
      if (hero) {
        const p = clamp(-hero.getBoundingClientRect().top / vh, 0, 1);
        hero.style.setProperty("--fr-hero", p.toFixed(4));
      }

      // Reisen: fremdrift 0..1 over hele sticky-strekket, fordelt på kapitlene.
      const reise = reiseRef.current;
      if (reise) {
        const r = reise.getBoundingClientRect();
        const total = r.height - vh;
        const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
        const n = KAPITLER.length;
        const kapitler = reise.querySelectorAll<HTMLElement>("[data-fr-kapittel]");
        kapitler.forEach((el, i) => {
          // k = 0 når kapittelet står i fokus; negativt før, positivt etter.
          const k = clamp(p * n - (i + 0.5), -2, 2);
          el.style.setProperty("--fr-k", k.toFixed(4));
          el.style.setProperty("--fr-op", clamp(1 - Math.abs(k), 0, 1).toFixed(4));
          el.style.setProperty("--fr-op-tekst", clamp(1 - Math.abs(k) * 1.6, 0, 1).toFixed(4));
          el.dataset.aktiv = String(Math.abs(k) < 0.5);
        });
      }

      // Filmstripen: rull hele raden forbi mens seksjonen er i viewport.
      const strip = stripRef.current;
      const rad = stripRadRef.current;
      if (strip && rad) {
        const r = strip.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        const maks = Math.max(0, rad.scrollWidth - window.innerWidth);
        strip.style.setProperty("--fr-strip", (p * maks).toFixed(1));
      }
    };

    const onScroll = () => {
      // rAF fyrer aldri i skjulte faner — kjør synkront der (ingenting
      // males uansett), rAF-throttlet når fanen er synlig.
      if (document.hidden) {
        oppdater();
        return;
      }
      if (!raf) raf = requestAnimationFrame(oppdater);
    };
    // rAF suspenderes i skjulte faner; kjør en oppdatering straks fanen
    // blir synlig igjen så scenen aldri står igjen med stale verdier.
    const onVisible = () => {
      if (!document.hidden) oppdater();
    };
    oppdater();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisible);

    // Reveal — seksjoner glir inn første gang de treffer viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("fr-vis");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    rotRef.current
      ?.querySelectorAll(".fr-reveal")
      .forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVisible);
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={rotRef}>
      {/* ── Hero — video med parallakse ─────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100svh] items-center overflow-hidden"
      >
        <video
          className="fr-hero-video absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/heroes/academy-hero-trackman-16x9.webp"
        >
          <source src="/brand/motion/hero-loop-trackman.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-mk-ink/70 via-mk-ink/40 to-mk-ink/10" />
        <div className="fr-hero-inner relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
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
              href="#reisen"
              className="inline-block rounded-full border border-mk-bg/40 px-8 py-3 text-center font-medium text-mk-bg transition-colors hover:border-mk-bg"
            >
              Bli med på reisen
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

      {/* ── Reisen — sticky 3D-kapitler ─────────────────────────────────── */}
      <div
        id="reisen"
        ref={reiseRef}
        className="fr-reise"
        style={{ height: `${(KAPITLER.length + 1) * 100}svh` }}
      >
        <div className="fr-scene bg-mk-bg">
          {KAPITLER.map((k) => (
            <div key={k.nr} data-fr-kapittel className="fr-kapittel">
              <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
                <div className="fr-kapittel-tekst order-2 md:order-1">
                  <p className="fr-kapittel-tall font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
                    {k.nr} · {k.eyebrow}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">
                    {k.tittel}
                  </h2>
                  <p className="mt-6 max-w-md font-mk-serif text-lg leading-relaxed text-mk-muted">
                    {k.tekst}
                  </p>
                </div>
                <div className="fr-kapittel-bilde order-1 overflow-hidden rounded-2xl md:order-2">
                  <Image
                    src={k.src}
                    alt={k.alt}
                    width={2400}
                    height={1600}
                    className="aspect-[3/2] w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filmstripen — bildene som en rull ───────────────────────────── */}
      <section ref={stripRef} className="fr-strip border-y border-mk-border py-16">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
            Hverdagen
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold sm:text-4xl">
            Slik ser arbeidet ut.
          </h2>
        </div>
        <div ref={stripRadRef} className="fr-strip-rad px-6">
          {STRIP.map((b) => (
            <Image
              key={b.src}
              src={b.src}
              alt={b.alt}
              width={720}
              height={480}
              className="aspect-[3/2] w-[280px] flex-none object-cover sm:w-[360px]"
              sizes="360px"
            />
          ))}
        </div>
      </section>

      {/* Tre veier inn */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="fr-reveal">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
            Veien inn
          </p>
          <h2 className="max-w-xl text-3xl font-semibold sm:text-4xl">
            Tre måter å jobbe med oss på.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VEIER.map((v) => (
            <div
              key={v.title}
              className="fr-reveal flex flex-col rounded-2xl border border-mk-border p-8"
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
          <div className="fr-reveal order-2 overflow-hidden rounded-2xl md:order-1">
            <Image
              src="/brand/foto/AK-Golf-Academy-27.jpg"
              alt="Ung spiller trener nærspill med coach på banen"
              width={2400}
              height={1600}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="fr-reveal order-1 md:order-2">
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
          <div className="fr-reveal overflow-hidden rounded-2xl">
            <Image
              src="/brand/mockups/mockup-ipad.webp"
              alt="AK Golf HQ på iPad"
              width={2752}
              height={1536}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="fr-reveal">
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
          <div className="fr-reveal">
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
          <div className="fr-reveal overflow-hidden rounded-2xl">
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
        <div className="fr-reveal rounded-3xl bg-mk-soft px-8 py-16 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
            Kartleggingsøkt
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Klar for å trene med system?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-mk-serif text-lg text-mk-muted">
            Første økt kartlegger svingen, tallene og målene dine — og ender i
            en konkret plan. Velg tid i kalenderen, eller send en e-post.
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
    </div>
  );
}
