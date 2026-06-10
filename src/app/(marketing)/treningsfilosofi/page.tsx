import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Slik trener vi — AK Golf Academy",
  description:
    "Pyramide-systemet, data-drevet trening og individualiserte planer. Slik bygger AK Golf Academy spillere som får fremgang.",
};

const PYRAMIDE = [
  {
    kort: "FYS",
    navn: "Fysisk",
    chip: "bg-pyr-fys text-white",
    tekst:
      "Rotasjon, mobilitet og kjernemuskulatur er fundamentet alt annet bygger på. Har du ikke basen, fester ikke tekniske endringer seg — uansett antall repetisjoner.",
  },
  {
    kort: "TEK",
    navn: "Teknisk",
    chip: "bg-pyr-tek text-white",
    tekst:
      "Sving, grep, impact og club-path — analysert med Trackman som fasit. Vi bygger en sving du kan stole på under press, ikke én som bare ser bra ut på video.",
  },
  {
    kort: "SLAG",
    navn: "Slag",
    chip: "bg-pyr-slag text-white",
    tekst:
      "60–65 % av alle slag skjer innen 100 meter fra flagget. Chip, pitch, putt og bunkerspill trenes systematisk — det er her de fleste slag hentes.",
  },
  {
    kort: "SPILL",
    navn: "Spill",
    chip: "bg-pyr-spill text-primary",
    tekst:
      "Riktig valg er like viktig som riktig utførelse. Vi trener beslutninger, risk/reward og banetilpasning — slik at du skårer lavere med svingene du allerede har.",
  },
  {
    kort: "TURN",
    navn: "Turnering",
    chip: "bg-pyr-turn text-white",
    tekst:
      "Alt du øver på må holde når det gjelder. Pre-shot rutine, fokusstrategi og press-håndtering — slik at du er den samme spilleren i runde to som i treningsrunden.",
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
    <div className="bg-background text-foreground">
      {/* ========== HERO ========== */}
      <section className="mx-auto max-w-7xl px-6 pt-16 md:px-8 md:pt-24">
        <SectionEyebrow>Slik trener vi</SectionEyebrow>
        <h1 className="mt-4 max-w-[20ch] text-balance font-display text-[clamp(44px,6vw,80px)] font-semibold leading-[0.98] tracking-[-0.03em]">
          <Em>Trening</Em> som er balansert, målbar og din egen.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[17px] leading-[1.55] text-muted-foreground">
          Vi tror ikke på trening-flavor-of-the-week. Hver spiller får en plan
          basert på tre prinsipper: balansert pyramide, data-drevet retning, og
          individualisering på alvor.
        </p>

        <div className="relative mt-14 overflow-hidden rounded-3xl">
          <Image
            src="/images/akademy/putting-vann.jpg"
            alt="To spillere på putting-grønn med vann-refleksjon i forgrunnen"
            width={1920}
            height={1280}
            priority
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="h-auto w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, hsl(var(--foreground) / 0.5) 100%)",
            }}
          />
        </div>
      </section>

      {/* ========== PRINSIPP 1 · Pyramiden ========== */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-8">
        <SectionEyebrow>Prinsipp 1 · Pyramiden</SectionEyebrow>
        <SectionH2>
          Fem områder — <Em>samtidig</Em>.
        </SectionH2>
        <p className="mt-4 max-w-[56ch] text-[15px] leading-[1.6] text-muted-foreground">
          Fem områder må jobbes med samtidig — ikke ett etter et. Vi sørger for
          at tiden din fordeles riktig.
        </p>

        <div className="mt-12 grid max-w-[820px] grid-cols-1 gap-4">
          {PYRAMIDE.map((p) => (
            <article
              key={p.kort}
              className="flex items-start gap-4 rounded-[20px] border border-border bg-card p-6"
            >
              <span
                className={`mt-1 inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-[10px] font-mono text-[11px] font-bold uppercase tracking-[0.1em] ${p.chip}`}
              >
                {p.kort}
              </span>
              <div>
                <h3 className="font-display text-[18px] font-bold leading-[1.2] tracking-[-0.015em]">
                  {p.navn}
                </h3>
                <p className="mt-1.5 text-sm leading-[1.55] text-muted-foreground">
                  {p.tekst}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ========== PRINSIPP 2 · Strokes Gained ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <SectionEyebrow>Prinsipp 2 · Strokes Gained</SectionEyebrow>
        <SectionH2>
          Data forteller <Em>hvor</Em> du skal trene.
        </SectionH2>
        <p className="mt-4 max-w-[56ch] text-[15px] leading-[1.6] text-muted-foreground">
          Vi bruker Strokes Gained (SG) til å se nøyaktig hvor du taper slag
          mot ditt nivå. Det betyr at planen din peker på det som faktisk
          koster deg slag — ikke det som føles dårligst.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {SG.map((s) => (
            <div
              key={s.kort}
              className="flex flex-col gap-2 rounded-[20px] border border-border bg-card p-6"
            >
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                {s.kort}
              </span>
              <h3 className="font-display text-[18px] font-bold leading-[1.2] tracking-[-0.015em]">
                {s.navn}
              </h3>
              <p className="text-[13px] leading-[1.55] text-muted-foreground">
                {s.tekst}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-[62ch] text-[15px] leading-[1.6] text-muted-foreground">
          Etter 3–5 registrerte runder ser vi et klart mønster. Kanskje driver
          du bedre enn du tror, men taper alt rundt grønnen. Kanskje er
          innspillene svakheten ingen har fortalt deg om. Planen peker dit
          dataen peker — ikke dit magefølelsen peker.
        </p>

        <div className="relative mt-14 overflow-hidden rounded-3xl">
          <Image
            src="/images/akademy/bunker-shot.jpg"
            alt="Nærbilde av spiller midt i bunker-shot med sand som spruter"
            width={1920}
            height={1280}
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="h-auto w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, hsl(var(--foreground) / 0.5) 100%)",
            }}
          />
        </div>
      </section>

      {/* ========== PRINSIPP 3 · Individualisering ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <SectionEyebrow>Prinsipp 3 · Individualisering</SectionEyebrow>
        <SectionH2>
          Ingen plan er <Em>kopi</Em> av en annen.
        </SectionH2>
        <p className="mt-4 max-w-[62ch] text-[16px] leading-[1.6] text-muted-foreground">
          Det som virker for en elite-junior virker ikke for en 50-åring som
          spiller én gang i uken. Hver plan tar utgangspunkt i tre ting:{" "}
          <strong className="font-semibold text-foreground">målet ditt</strong>,{" "}
          <strong className="font-semibold text-foreground">
            tiden du har tilgjengelig
          </strong>
          , og{" "}
          <strong className="font-semibold text-foreground">
            ferdighetene du allerede har
          </strong>
          . Det er du som setter ambisjonen — vi sørger for at veien dit er
          realistisk.
        </p>
      </section>

      {/* ========== CLOSING CTA ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-16 text-center text-white sm:px-12 lg:px-16 lg:py-20"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(168 72% 11%) 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute -top-[120px] left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent opacity-[0.12] blur-[4px]"
          />
          <span className="relative z-10 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Neste steg
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Vil du trene <Em dark>slik</Em>?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Book en intro-time, eller velg en av coaching-pakkene våre med
            månedlig oppfølging.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Book intro-time
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
            <Link
              href="/coaching"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-xl px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-secondary ring-1 ring-inset ring-secondary/45 transition hover:bg-secondary/10 hover:ring-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Se coaching-pakker
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Seksjonsbyggesteiner (samme anatomi som forsiden) ---------- */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </span>
  );
}

function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-4 max-w-[22ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
      {children}
    </h2>
  );
}

function Em({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <em
      className={`font-display font-normal italic ${dark ? "text-accent" : "text-primary"}`}
    >
      {children}
    </em>
  );
}
