import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SGConsole } from "@/components/marketing/sg-console";
import { PlayerHQMockup } from "@/components/marketing/playerhq-mockup";
import { BookingAnbefaling } from "@/components/marketing/booking-anbefaling";

export const metadata: Metadata = {
  title: "AK Golf | Hver slag teller. Nå kan du bevise det.",
  description:
    "Norges datadrevne golfakademi. Strokes gained, periodiserte planer, PlayerHQ og coach-terminal i ett system. For spillere som vil til toppen.",
};

/* Enkel data for bento og band — moderne stil */
const BENTO = [
  {
    icon: "📈",
    title: "Strokes gained i dybden",
    desc: "Se nøyaktig hvor slagene tapes og vinnes — per kategori, mot tour-snitt. Samme modell som proffene bruker.",
    span: "col-span-1 md:col-span-3",
    dark: false as const,
  },
  {
    icon: "📋",
    title: "Plan & Workbench",
    desc: "År, periode, uke og økt i én flate. Coach tildeler — du gjennomfører med ett trykk.",
    span: "col-span-1 md:col-span-3",
    dark: false as const,
  },
  {
    icon: "💬",
    title: "Coach i lomma",
    desc: "Direktemelding, video-feedback og notater fra coachen din — i sanntid.",
    span: "col-span-1 md:col-span-3",
    dark: true as const,
  },
  {
    icon: "🧪",
    title: "FYS & tester",
    desc: "Utviklingspyramiden — fra fysisk base til turneringsforberedelse.",
    span: "col-span-1 md:col-span-2",
    dark: false as const,
  },
  {
    icon: "⭐",
    title: "Talent-løype",
    desc: "For juniorer som skal til toppen — steg-for-steg program.",
    span: "col-span-1 md:col-span-2",
    dark: false as const,
  },
  {
    icon: "📡",
    title: "TrackMan",
    desc: "Hvert slag målt. Dispersjon, ballflukt, køllesnitt og spin.",
    span: "col-span-1 md:col-span-2",
    dark: false as const,
  },
] as const;

const BAND = [
  { num: "2.8", label: "SNITT SG PER RUNDE", suffix: "" },
  { num: "41", label: "AKTIVE SPILLERE", suffix: "" },
  { num: "14", label: "ÅR ERFARING", suffix: "" },
  { num: "2200", label: "TIMER COACHING", suffix: "+" },
] as const;

const PRISER = [
  {
    tier: "Gratis",
    price: "0",
    sub: "kr / mnd",
    desc: "Logg runder, se egen utvikling, enkel tilgang til drills.",
    features: [
      "Spillerprofil & historikk",
      "Enkel SG-oversikt",
      "Drills-bibliotek",
      "Booking av drop-in",
    ],
    cta: "Start gratis",
    href: "/auth/signup",
    featured: false,
  },
  {
    tier: "Performance",
    price: "1 200",
    sub: "kr / mnd",
    desc: "Full treningsplan + PlayerHQ. Anbefalt for seriøse amatører.",
    features: [
      "Periodisert plan + Workbench",
      "Månedlig SG-rapport",
      "PlayerHQ full tilgang",
      "2× coaching pr. måned",
      "Fri tilgang alle anlegg",
    ],
    cta: "Start Performance",
    href: "/coaching",
    featured: true,
  },
  {
    tier: "Performance Pro",
    price: "2 220",
    sub: "kr / mnd",
    desc: "For de som sikter høyt. Full analyse, fysikk og turnering.",
    features: [
      "Alt i Performance",
      "Full SG per runde + innsikt",
      "Fysisk program + tester",
      "4× coaching pr. måned",
      "Turneringsforberedelse",
    ],
    cta: "Søk opptak",
    href: "/kontakt",
    featured: false,
  },
] as const;

export default function NyLanding() {
  return (
    <div className="bg-background text-foreground">
      {/* ========== HERO — Moderne (tekst + SG-konsoll) ========== */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-14 md:grid-cols-12 md:gap-8 lg:pt-16">
          {/* Left text */}
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Norges datadrevne golfakademi
            </div>

            <h1 className="mt-6 max-w-[15ch] font-display text-[clamp(42px,7vw,78px)] font-semibold leading-[0.92] tracking-[-0.035em]">
              Hver slag<br />teller.<br />Nå kan du <em className="font-medium italic text-primary">bevise</em> det.
            </h1>

            <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.55] text-muted-foreground">
              Strokes gained i dybden, periodiserte planer og coach i samme system.
              Bygd for spillere som vil til topp 12 % — og coacher som vet hvem som trenger dem nå.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BookingAnbefaling
                triggerLabel="Start gratis prøve"
                triggerClassName="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 font-display text-[15px] font-bold tracking-[-0.005em] text-accent-foreground shadow transition hover:brightness-105 active:scale-[0.985]"
              />
              <Link
                href="/playerhq"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-6 font-display text-[15px] font-semibold tracking-[-0.005em] transition hover:bg-muted/40"
              >
                Se PlayerHQ <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex gap-8 text-sm text-muted-foreground">
              <div>
                <div className="font-mono text-xl font-semibold tabular-nums tracking-[-1px] text-foreground">2.8</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em]">SNITT SG / RUNDE</div>
              </div>
              <div>
                <div className="font-mono text-xl font-semibold tabular-nums tracking-[-1px] text-foreground">41</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em]">AKTIVE SPILLERE</div>
              </div>
            </div>
          </div>

          {/* Right: SG Console */}
          <div className="md:col-span-5">
            <SGConsole />
          </div>
        </div>

        {/* Subtle marquee (robust CSS — moved to globals.css for Turbopack/App Router compatibility) */}
        <div className="overflow-hidden border-t border-border/60 bg-[#0A1F17] py-2.5 text-white">
          <div className="marquee flex items-center gap-x-10 whitespace-nowrap text-[11px] font-semibold tracking-[0.06em] text-[#CFE8D8]/80">
            <span className="flex shrink-0 items-center gap-10 pr-10">
              ØYVIND ROHJAN · +2.9 SG SISTE 18 · <span className="text-accent">PERSONAL BEST</span> · PUTT 1.84 · TOPP 8% NORSK · WANG 2026 KLAR
            </span>
            <span className="flex shrink-0 items-center gap-10 pr-10">
              ØYVIND ROHJAN · +2.9 SG SISTE 18 · <span className="text-accent">PERSONAL BEST</span> · PUTT 1.84 · TOPP 8% NORSK · WANG 2026 KLAR
            </span>
          </div>
        </div>
      </section>

      {/* ========== ÉN PLATTFORM — TO UTTRYKK ========== */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            ÉN PLATTFORM · TO UTTRYKK
          </div>
          <h2 className="mt-3 font-display text-[38px] font-semibold tracking-[-0.02em] md:text-[44px]">
            To apper. <em className="font-normal italic text-primary">Én sannhet.</em>
          </h2>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Spilleren får et lyst, rolig magasin over hva <strong className="text-foreground">jeg</strong> skal gjøre i dag.
            Coachen får en mørk terminal over <strong className="text-foreground">hvem som trenger meg</strong> nå.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* PlayerHQ light */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em]">
              <span>PlayerHQ · Spiller</span>
              <span className="text-muted-foreground">LYST</span>
            </div>
            <div className="p-5">
              <PlayerHQMockup />
            </div>
          </div>

          {/* AgencyOS dark terminal preview */}
          <div className="overflow-hidden rounded-2xl border border-[#1F2E27] bg-[#0A1F17] text-white">
            <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-accent">
              <span>AgencyOS · Coach</span>
              <span className="text-white/50">TERMINAL</span>
            </div>
            <div className="p-5">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.1em] text-white/50">Hvem trenger meg nå</div>
              <div className="space-y-2 text-sm">
                {[
                  { init: "ØR", name: "Øyvind Rohjan", why: "3 putts på 17-18 · ARG svak", tag: "I DAG" },
                  { init: "MH", name: "Mathias H.", why: "Low drive · tee total -1.4", tag: "HØY PRI" },
                  { init: "LN", name: "Lukas N.", why: "Ingen økter siste 9 dager", tag: "INAKTIV" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-mono text-xs font-bold text-accent">{p.init}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-white/60">{p.why}</div>
                    </div>
                    <div className="font-mono text-[10px] font-bold text-lime-400">{p.tag}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.1em] text-accent hover:underline">Åpne cockpit →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BENTO FEATURES ========== */}
      <section className="border-y border-border bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">06 moduler</div>
              <h2 className="font-display text-4xl font-semibold tracking-[-0.015em]">Alt for å bli bedre.</h2>
            </div>
            <Link href="/coaching" className="hidden items-center gap-1 text-sm font-semibold text-primary md:flex">
              Se hele plattformen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            {BENTO.map((item, index) => (
              <div
                key={index}
                className={`group rounded-2xl border p-6 transition ${item.dark ? "border-white/10 bg-[#0A1F17] text-white" : "border-border bg-card"} ${item.span}`}
              >
                <div className="mb-4 text-2xl">{item.icon}</div>
                <div className="font-display text-[19px] font-semibold tracking-[-0.01em]">{item.title}</div>
                <p className={`mt-2 text-[13.5px] leading-snug ${item.dark ? "text-white/70" : "text-muted-foreground"}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TALL-BAND ========== */}
      <section className="bg-[#0A1F17] py-12 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-6 md:grid-cols-4">
          {BAND.map((s, i) => (
            <div key={i}>
              <div className="font-mono text-[46px] font-semibold tracking-[-1.5px]">{s.num}<span className="text-accent">{s.suffix}</span></div>
              <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== PRISER ========== */}
      <section id="priser" className="mx-auto max-w-7xl scroll-mt-12 px-6 py-20">
        <div className="mx-auto max-w-[620px] text-center">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Priser</div>
          <h2 className="mt-2 font-display text-[38px] font-semibold tracking-[-0.015em]">Start gratis. Oppgrader når du vil.</h2>
          <p className="mt-3 text-muted-foreground">Ingen binding. PlayerHQ + coaching i samme pakke.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PRISER.map((p, idx) => (
            <div
              key={idx}
              className={`flex flex-col rounded-2xl border p-8 ${p.featured ? "border-transparent bg-[#0A1F17] text-white ring-1 ring-inset ring-white/10" : "border-border bg-card"}`}
            >
              <div className={`font-mono text-xs font-semibold uppercase tracking-[0.12em] ${p.featured ? "text-accent" : "text-muted-foreground"}`}>
                {p.tier}
              </div>
              <div className="mt-4 flex items-end gap-1">
                <span className={`font-mono text-[46px] font-semibold tracking-[-1.5px] tabular-nums ${p.featured ? "text-white" : ""}`}>{p.price}</span>
                <span className={`pb-1 text-sm ${p.featured ? "text-white/60" : "text-muted-foreground"}`}>{p.sub}</span>
              </div>
              <p className={`mt-3 text-[13px] ${p.featured ? "text-white/80" : "text-muted-foreground"}`}>{p.desc}</p>

              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {p.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.featured ? "text-accent" : "text-primary"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={p.href}
                className={`mt-8 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold tracking-[-0.01em] transition ${p.featured ? "bg-accent text-[#005840] hover:brightness-105" : "border border-primary/70 text-primary hover:bg-primary/5"}`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl bg-primary px-8 py-14 text-center text-white md:px-16 md:py-16">
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">Opptak 2026 åpent</div>
          <h2 className="mt-3 font-display text-[38px] font-semibold tracking-[-0.02em] md:text-[46px]">
            Klar for neste steg?
          </h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-[15px] text-white/85">
            Vi tar inn maks 20 nye spillere denne sesongen. Start med en gratis kartleggingsøkt — vi ser hvor du er og om det passer.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BookingAnbefaling
              triggerLabel="Book gratis kartlegging"
              triggerClassName="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 font-display text-base font-bold text-accent-foreground shadow hover:brightness-105"
            />
            <Link
              href="/kontakt"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 px-6 font-display text-base font-semibold text-white hover:bg-white/10"
            >
              Snakk med Anders
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
