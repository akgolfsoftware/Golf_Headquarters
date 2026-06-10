import type { Metadata } from "next";
import { Check } from "lucide-react";
import { SubscribeButton } from "@/components/marketing/subscribe-button";
import {
  CtaLime,
  Em,
  HeroEm,
  MarketingHero,
  SectionEyebrow,
  SectionH2,
} from "@/components/marketing/marketing-sections";

export const metadata: Metadata = {
  title: "Coaching — AK Golf Academy",
  description:
    "Performance og Performance Pro: personlig golf-coaching med Anders Kristiansen. PlayerHQ inkludert. Fra 1 200 kr/mnd.",
};

type Plan = "performance" | "performance_pro";

type Pakke = {
  plan: Plan;
  eb: string;
  navn: string;
  pris: string;
  okter: string;
  beskrivelse: string;
  egnet: string;
  inkludert: string[];
  cta: string;
  fremhevet: boolean;
};

const PAKKER: Pakke[] = [
  {
    plan: "performance",
    eb: "Anbefalt",
    navn: "Performance",
    pris: "1 200",
    okter: "2 × 20 min per måned",
    beskrivelse:
      "For deg som vil ha jevn oppfølging og en plan å trene etter mellom øktene.",
    egnet: "Klubbspillere som vil bli bedre over tid",
    inkludert: [
      "2 personlige treningsøkter à 20 min",
      "Skreddersydd treningsplan i PlayerHQ",
      "Oppfølging mellom øktene",
      "Full tilgang til PlayerHQ — gratis",
      "Trackman-data der relevant",
    ],
    cta: "Bli Performance-kunde",
    fremhevet: true,
  },
  {
    plan: "performance_pro",
    eb: "For høye mål",
    navn: "Performance Pro",
    pris: "2 220",
    okter: "4 × 20 min per måned",
    beskrivelse:
      "For deg med høye mål — klubblag, elite, eller turneringsspill. Tett oppfølging hver uke.",
    egnet: "Konkurransespillere og spillere med klare mål",
    inkludert: [
      "4 personlige treningsøkter à 20 min",
      "Periodisert plan tilpasset turneringskalender",
      "Tett oppfølging mellom øktene",
      "Full tilgang til PlayerHQ — gratis",
      "Trackman-data + video-analyse der relevant",
      "Direkte kontakt på melding mellom økter",
    ],
    cta: "Bli Performance Pro-kunde",
    fremhevet: false,
  },
];

const OEKT_INNHOLD = [
  "20 min fokusert trening med Anders",
  "Klare fokuspunkter og drills å øve på",
  "Trackman-data lagret automatisk",
  "Plan oppdateres i PlayerHQ",
];

export default function Coaching() {
  return (
    <div className="bg-background text-foreground">
      {/* ========== HERO · full-bleed foto + forest-scrim ========== */}
      <MarketingHero
        foto="/images/akademy/coaching-tripod.jpg"
        eyebrow="Coaching · Abonnement"
        tittel={
          <>
            <HeroEm>Coaching</HeroEm> som gir fremgang.
          </>
        }
        ingress="Som abonnent får du 2 eller 4 coaching-timer hver måned. Du booker dem selv fra PlayerHQ når det passer deg — og får en plan, statistikk og oppfølging mellom øktene."
        primaer={{ href: "#pakker", label: "Se pakkene" }}
        sekundaer={{ href: "/booking", label: "Book enkelttime" }}
      />

      {/* ========== PAKKER · tjeneste-kort med featured-mørk Performance ========== */}
      <section id="pakker" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Coaching · Månedlig</SectionEyebrow>
          <SectionH2>
            Velg <Em>pakken</Em> som passer.
          </SectionH2>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
            {PAKKER.map((p) => (
              <PakkeCard key={p.plan} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== HVA INKLUDERER EN ØKT ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Slik fungerer det</SectionEyebrow>
          <SectionH2>
            Hva inkluderer en <Em>økt</Em>?
          </SectionH2>
          <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.6] text-muted-foreground">
            Hver økt er strukturert rundt det du jobber med akkurat nå. Anders
            bygger neste steg basert på data fra forrige økt og målene dine.
          </p>
          <ul className="mt-8 grid max-w-3xl grid-cols-1 gap-x-12 gap-y-3 sm:grid-cols-2">
            {OEKT_INNHOLD.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-[15px] leading-[1.55]"
              >
                <Check
                  className="mt-1 h-[18px] w-[18px] shrink-0 text-primary"
                  strokeWidth={1.5}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ========== CLOSING CTA · enkelt-timer uten binding ========== */}
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
            Enkelt-timer · Uten binding
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Ikke klar for <Em dark>abonnement</Em>?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Du kan også booke enkelt-timer uten binding. Pro-time 30 min eller
            60 min, Trackman-økt eller gruppeøkt — se hva som er ledig.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLime href="/booking" withArrow>
              Se ledige tider
            </CtaLime>
          </div>
          <p className="relative z-10 mt-6 text-[13px] text-white/70">
            Spørsmål om hvilken pakke som passer for deg?{" "}
            <a
              href="mailto:post@akgolf.no"
              className="font-medium text-accent hover:underline"
            >
              post@akgolf.no
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

/* ---------- Pakke-kort (forsidens tjeneste-kort-anatomi, utvidet) ---------- */

function PakkeCard({ p }: { p: Pakke }) {
  const f = p.fremhevet;
  return (
    <article
      className={`flex flex-col rounded-[20px] border p-8 ${
        f ? "dark border-transparent bg-background" : "border-border bg-card"
      }`}
    >
      <span
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${
          f ? "text-accent" : "text-muted-foreground"
        }`}
      >
        {p.eb} · {p.okter}
      </span>
      <h3
        className={`mt-3 font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em] ${
          f ? "text-white" : "text-foreground"
        }`}
      >
        {p.navn}
      </h3>
      <div
        className={`mt-6 flex items-baseline gap-1.5 border-t pt-5 ${
          f ? "border-white/15" : "border-border"
        }`}
      >
        <span
          className={`font-mono text-4xl font-semibold leading-none tracking-[-0.025em] tabular-nums ${
            f ? "text-white" : "text-foreground"
          }`}
        >
          {p.pris}
        </span>
        <small
          className={`font-mono text-xs ${f ? "text-white/70" : "text-muted-foreground"}`}
        >
          kr / mnd
        </small>
      </div>
      <p
        className={`mt-6 text-sm leading-[1.55] ${f ? "text-white/90" : "text-foreground"}`}
      >
        {p.beskrivelse}
      </p>
      <p
        className={`mt-2 text-[13px] leading-[1.5] ${
          f ? "text-white/60" : "text-muted-foreground"
        }`}
      >
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
          Egnet for
        </span>{" "}
        {p.egnet}
      </p>
      <ul className="mt-6 flex flex-col gap-2.5">
        {p.inkludert.map((item) => (
          <li
            key={item}
            className={`flex items-start gap-2.5 text-sm leading-[1.45] ${
              f ? "text-white/90" : "text-foreground"
            }`}
          >
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${f ? "text-accent" : "text-primary"}`}
              strokeWidth={1.5}
            />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-7">
        <SubscribeButton
          plan={p.plan}
          className={`inline-flex h-11 w-full items-center justify-center gap-1.5 font-display text-sm font-semibold tracking-[-0.005em] transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            f
              ? "rounded-full bg-accent [--primary:164_100%_17.3%] text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] hover:brightness-105"
              : "rounded-xl text-primary ring-1 ring-inset ring-primary hover:bg-primary/5"
          }`}
        >
          {p.cta}
        </SubscribeButton>
      </div>
    </article>
  );
}
