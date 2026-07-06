import type { Metadata } from "next";
import {
  CtaLime,
  CtaOutlineLys,
  Em,
  HeroEm,
  MarketingHero,
  SectionEyebrow,
  SectionH2,
} from "@/components/marketing/marketing-sections";

export const metadata: Metadata = {
  title: "Om oss | AK Golf Academy",
  description:
    "Les om Anders Kristiansen og filosofien bak AK Golf Academy: personlig coaching bygd på Mac O'Grady-metodikk og moderne data-analyse.",
};

/* Manifest — tre prinsipper destillert fra Academy-filosofien */
const MANIFEST = [
  {
    nr: "01",
    title: "Tydelig, ikke magisk",
    text: "Du skal alltid vite hva vi jobber med, hvorfor vi jobber med det, og hvordan du ser at det virker.",
  },
  {
    nr: "02",
    title: "Balansert, ikke tilfeldig",
    text: "AK Golf-pyramiden fordeler treningstiden riktig mellom fysikk, teknikk, slag, spill og turneringserfaring.",
  },
  {
    nr: "03",
    title: "Målbar, ikke synsing",
    text: "PlayerHQ holder plan, runder og statistikk samlet på ett sted. Fremgangen er synlig, ikke noe du må tro på.",
  },
] as const;

export default function OmOss() {
  return (
    <div className="bg-background text-foreground">
      {/* ========== HERO · full-bleed foto + forest-scrim ========== */}
      <MarketingHero
        foto="/images/akademy/coach-observerer.jpg"
        eyebrow="Om oss · AK Golf Academy"
        tittel={
          <>
            Personlig coaching, <HeroEm>bygd på data.</HeroEm>
          </>
        }
        ingress="AK Golf Academy drives av Anders Kristiansen: golfcoach, gründer og CEO i AK Golf Group AS. Tett personlig oppfølging, målbar fremgang."
        primaer={{ href: "/booking", label: "Book første time" }}
        sekundaer={{ href: "/coacher", label: "Møt coachene" }}
      />

      {/* ========== MANIFEST · tre prinsipper ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Manifest · Det vi tror på</SectionEyebrow>
          <SectionH2>
            Tre ting vi <Em>aldri går på akkord med</Em>.
          </SectionH2>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {MANIFEST.map((m) => (
              <div
                key={m.nr}
                className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-8"
              >
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {m.nr}
                </span>
                <h3 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.015em]">
                  {m.title}
                </h3>
                <p className="text-sm leading-[1.55] text-muted-foreground">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HISTORIEN ========== */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Historien</SectionEyebrow>
          <SectionH2>
            Coaching som <Em>kan måles</Em>.
          </SectionH2>

          <div className="mt-10 max-w-[62ch] space-y-6 text-[16px] leading-[1.6] text-foreground">
            <p>
              Anders har brukt mer enn et tiår på spillere på alle nivåer,
              fra klubbamatører til konkurranseutøvere. Underveis vokste det
              frem en praksis der personlig oppfølging og målbare resultater
              ikke er motsetninger, men to sider av samme metode.
            </p>

            <blockquote className="border-l-2 border-primary pl-6 font-display text-[clamp(20px,2.5vw,26px)] font-normal italic leading-[1.45] text-primary">
              «Coaching skal ikke være magi. Det skal være tydelig: hva vi
              jobber med, hvorfor vi jobber med det, og hvordan du ser at det
              virker. Det er det Academy er bygget rundt.»
            </blockquote>

            <p>
              Kjernen er AK Golf-pyramiden, et balansert system som sørger for
              at treningstiden fordeles riktig mellom fysikk, teknikk, slag,
              spill og turneringserfaring. Til daglig støttes coachingen av
              PlayerHQ, spillerportalen som holder plan, runder og statistikk
              samlet på ett sted.
            </p>
          </div>
        </div>
      </section>

      {/* ========== SELSKAPET · hairline-strip ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <SectionEyebrow className="mb-6 block">
          Selskapet · AK Golf Group AS
        </SectionEyebrow>
        <dl className="border-y border-border">
          <Rad label="Org.nummer" value="927 248 581" mono />
          <Rad label="Adresse" value="AK Golf Group AS, Fredrikstad, Norge" />
          <Rad label="E-post" value="post@akgolf.no" mono />
        </dl>
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
            AK Golf Academy · Fredrikstad
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Klar for <Em dark>første time</Em>?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Start med en enkelt time, så ser vi sammen hva som er riktig vei
            videre for spillet ditt.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLime href="/booking" withArrow>
              Book første time
            </CtaLime>
            <CtaOutlineLys href="/kontakt">Ta kontakt</CtaOutlineLys>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Selskaps-rad (side-lokal) ---------- */

function Rad({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-4 last:border-b-0">
      <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "font-mono text-[14px] font-semibold tabular-nums text-foreground"
            : "text-[15px] font-medium text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
