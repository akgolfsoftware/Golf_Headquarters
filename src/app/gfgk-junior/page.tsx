import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { GfgkFooter } from "./_components/gfgk-footer";
import { GfgkHeader } from "./_components/gfgk-header";
import { SeksjonHeader } from "./_components/seksjon-header";
import { Treningspyramide } from "./_components/treningspyramide";
import { Treningsuke } from "./_components/treningsuke";
import {
  GRUPPER,
  GRUPPE_KEYS,
  HENDELSER_FELLES,
  KONTAKT,
  MANED_KORT,
  SESONG_KORT,
  SLIK_TRENER_VI,
  STARTER_STEG,
  TRENERE,
  UKE_NOTATER,
  VERDIER,
  type GruppeKey,
  type UkeOkt,
} from "./_data/gfgk-junior-data";
import { hentAlleGfgkGrupper } from "./_data/hent-gfgk-data";

// AgencyOS er master for treningstidene — 5 min ISR holder siden synkron med Workbench.
export const revalidate = 300;

const NOKKELTALL: { tall: string; label: string }[] = [
  { tall: "4 grupper", label: "6–19 år, alle nivåer" },
  { tall: "Apr–Okt", label: "utesesong på GFGK" },
  { tall: "2 økter", label: "per uke i hver gruppe" },
  { tall: "Gratis", label: "lånekøller og baller" },
];

function osloIdag(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
}

export default async function GfgkJuniorForside() {
  const grupper = await hentAlleGfgkGrupper();
  const ukeplaner = Object.fromEntries(
    GRUPPE_KEYS.map((k) => [k, grupper[k].ukeplan]),
  ) as Record<GruppeKey, UkeOkt[]>;

  const idag = osloIdag();
  const kommende = HENDELSER_FELLES.filter(([iso]) => iso >= idag).slice(0, 4);

  return (
    <div>
      <GfgkHeader aktiv="hjem" />

      {/* Hero — premium: brufoto med lett skygge, én gull-CTA, forankret nøkkeltall-strip */}
      <section id="top" className="relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <Image
          src="/images/anlegg/gfgk-hero.jpg"
          alt="Fredrikstad Festning bak banen på Gamle Fredrikstad Golfklubb"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="jr-hero-skygge pointer-events-none absolute inset-0" />
        <div className="jr-hero-gradient pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1200px] px-5 pb-32 pt-20 text-white sm:px-7 sm:pb-36 sm:pt-24">
          <div className="jr-fade-up max-w-[680px]">
            <span
              className="text-[13px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--gfgk-gold)" }}
            >
              Junior & Elite – Golf Development Program
            </span>
            <h1
              className="mt-3.5 font-black uppercase leading-[0.96] tracking-[-0.005em]"
              style={{ fontSize: "clamp(44px, 8vw, 74px)" }}
            >
              Juniorgolf
              <br />
              og trening
            </h1>
            <p
              className="mt-5 max-w-[540px] text-[17px] leading-relaxed sm:text-[19px]"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              Strukturert golftrening for barn og ungdom fra 6 til 19 år. Fire grupper
              tilpasset alder og nivå, erfarne trenere og et trygt fellesskap.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#gruppene"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-bold no-underline transition-colors sm:w-auto"
                style={{
                  color: "var(--ink)",
                  background: "var(--gfgk-gold)",
                  boxShadow: "var(--shadow-gold)",
                }}
              >
                Se gruppene
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
              <a
                href="#slik-starter-du"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-6 py-3 text-base font-bold text-white no-underline backdrop-blur-sm transition-colors sm:w-auto"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                }}
              >
                Slik starter du
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Nøkkeltall-strip: forankret i hero-bunnen med negativ margin */}
      <div className="relative z-[5] mx-auto -mt-14 max-w-[1200px] px-5 sm:px-7">
        <div
          className="jr-fade-up grid grid-cols-2 overflow-hidden rounded-[var(--r-lg)] bg-white lg:grid-cols-4"
          style={{ boxShadow: "var(--shadow-lg)", animationDelay: "120ms" }}
        >
          {NOKKELTALL.map((n, i) => (
            <div
              key={n.tall}
              className="px-6 py-5"
              style={{
                borderRight: i % 2 === 0 ? "1px solid var(--n-100)" : undefined,
                borderTop: i >= 2 ? "1px solid var(--n-100)" : undefined,
              }}
            >
              <div className="text-[26px] font-black sm:text-[30px]" style={{ color: "var(--ink)" }}>
                {n.tall}
              </div>
              <div className="mt-0.5 text-sm font-semibold" style={{ color: "var(--fg-3)" }}>
                {n.label}
              </div>
            </div>
          ))}
        </div>
        {/* Partnerstripe — dempet monokrom */}
        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--fg-3)" }}
        >
          <span className="normal-case tracking-normal">I samarbeid med</span>
          <span>Gamle Fredrikstad Golfklubb</span>
          <span>AK Golf Academy</span>
          <span>WANG Toppidrett Fredrikstad</span>
        </div>
      </div>

      {/* 01 Gruppene */}
      <section id="gruppene" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-20 sm:px-7 sm:pt-24">
        <SeksjonHeader
          nr="01"
          eyebrow="Gruppene"
          tittel="Fra 6 til 19 år – fire aldersgrupper"
          ingress="Hver gruppe er tilpasset alder og utviklingsnivå. Alle velkomne – uansett erfaring."
        />
        <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {GRUPPE_KEYS.map((k) => {
            const g = GRUPPER[k];
            return (
              <div
                key={k}
                className="group flex flex-col overflow-hidden rounded-[var(--r-md)] bg-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div className="h-1.5" style={{ background: g.farge }} />
                <div className="flex flex-1 flex-col gap-2.5 p-6">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="m-0 text-[22px] font-bold" style={{ color: "var(--ink)" }}>
                      {g.navn}
                    </h3>
                    <span
                      className="text-[13px]"
                      style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}
                    >
                      {k}
                    </span>
                  </div>
                  <p className="m-0 flex-1 text-[15px] leading-normal" style={{ color: "var(--fg-2)" }}>
                    {g.beskrivelse}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-[13px] font-semibold"
                      style={{ color: "var(--fg-2)", background: "var(--n-50)" }}
                    >
                      {g.okter}
                    </span>
                    <span
                      className="rounded-full px-3 py-1 text-[13px] font-semibold"
                      style={{ color: "var(--fg-2)", background: "var(--n-50)" }}
                    >
                      {g.timer}
                    </span>
                  </div>
                  <Link
                    href={`/gfgk-junior/gruppe/${k.toLowerCase()}`}
                    className="jr-link mt-1 inline-flex items-center gap-1 text-sm font-bold"
                  >
                    Se treningsplanen
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={2.5}
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 02 Slik trener vi */}
      <section id="slik-trener-vi" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-20 sm:px-7 sm:pt-24">
        <SeksjonHeader nr="02" eyebrow="Slik trener vi" tittel="Visjon, filosofi og metode" />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {SLIK_TRENER_VI.map((kort) => (
            <div
              key={kort.tittel}
              className="rounded-[var(--r-md)] bg-white p-6"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div
                className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.12em]"
                style={{ color: "var(--gold-700)" }}
              >
                {kort.tittel}
              </div>
              <p className="m-0 text-[15.5px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                {kort.tekst}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {VERDIER.map((v) => (
            <span
              key={v}
              className="rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold"
              style={{ color: "var(--teal-700)", background: "var(--teal-100)" }}
            >
              {v}
            </span>
          ))}
        </div>

        <Treningspyramide />

        <h3 className="mb-0 mt-12 text-[22px] font-bold sm:text-[26px]" style={{ color: "var(--ink)" }}>
          Sesongperiodisering
        </h3>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {SESONG_KORT.map((s) => (
            <div
              key={s.navn}
              className="rounded-[var(--r-md)] bg-white p-6"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="m-0 text-[19px] font-bold" style={{ color: "var(--ink)" }}>
                  {s.navn}
                </h4>
                <span
                  className="text-[13px]"
                  style={{ fontFamily: "var(--font-jr-mono)", color: "var(--teal-600)" }}
                >
                  {s.mnd}
                </span>
              </div>
              <p className="mb-3.5 mt-2.5 text-[14.5px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                {s.tekst}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-2.5 py-1 text-[12.5px] font-semibold"
                    style={{ color: "var(--fg-3)", background: "var(--n-50)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 03 Treningsuken */}
      <section id="treningsuken" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-20 sm:px-7 sm:pt-24">
        <SeksjonHeader
          nr="03"
          eyebrow="Treningsuken"
          tittel="Slik foregår en treningsuke"
          ingress="Oversikt over faste treningsøkter per aldersgruppe."
        />
        <Treningsuke ukeplaner={ukeplaner} notater={UKE_NOTATER} />
      </section>

      {/* 04 Trenere */}
      <section
        id="trenere"
        className="mt-20 scroll-mt-20 border-y bg-white sm:mt-24"
        style={{ borderColor: "var(--hairline)" }}
      >
        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-7 sm:py-20">
          <SeksjonHeader
            nr="04"
            eyebrow="Trenere"
            tittel="Vårt trenerteam"
            ingress="Erfarne trenere med bakgrunn fra spillerutvikling og konkurranseidrett."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TRENERE.map((t) => (
              <div
                key={t.navn}
                className="flex flex-col items-center gap-1.5 rounded-[var(--r-lg)] p-7 text-center"
                style={{ background: "var(--paper)" }}
              >
                {/* Portrett-fallback: initialer i display-vekt med ink-ring */}
                <div
                  className="flex h-[132px] w-[132px] items-center justify-center rounded-full text-[38px] font-black text-white"
                  style={{ background: "var(--ink)", border: "2px solid var(--ink)" }}
                >
                  {t.initialer}
                </div>
                <div
                  className="mt-3.5 text-[13px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: "var(--teal-600)" }}
                >
                  {t.rolle}
                </div>
                <h3 className="m-0 text-[21px] font-bold" style={{ color: "var(--ink)" }}>
                  {t.navn}
                </h3>
                <p className="m-0 mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                  {t.tekst}
                </p>
                <a
                  href={`mailto:${t.epost}`}
                  className="jr-link mt-2 text-[13px] font-medium"
                  style={{ fontFamily: "var(--font-jr-mono)" }}
                >
                  {t.epost}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 Slik starter du */}
      <section id="slik-starter-du" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-20 sm:px-7 sm:pt-24">
        <SeksjonHeader
          nr="05"
          eyebrow="Slik starter du"
          tittel="Fra første kontakt til første trening"
          ingress="Fire steg – uten bindinger før du har prøvd. Både nybegynnere og erfarne spillere er velkomne."
        />
        <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {STARTER_STEG.map((steg) => (
            <div
              key={steg.nr}
              className="rounded-[var(--r-md)] bg-white p-6"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="text-[34px] font-black" style={{ color: "var(--gold-400)" }}>
                {steg.nr}
              </div>
              <h3 className="mb-2 mt-2.5 text-[19px] font-bold" style={{ color: "var(--ink)" }}>
                {steg.tittel}
              </h3>
              <p className="m-0 text-[14.5px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                {steg.tekst}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 06 Kalender */}
      <section id="kalender" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-20 sm:px-7 sm:pt-24">
        <SeksjonHeader nr="06" eyebrow="Kalender" tittel="Kommende hendelser" />
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {kommende.map(([iso, tittel, tekst]) => {
            const [, mnd, dag] = iso.split("-").map(Number);
            return (
              <div
                key={iso + tittel}
                className="flex gap-5 rounded-[var(--r-md)] bg-white p-6"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div
                  className="flex h-[66px] w-[66px] shrink-0 flex-col items-center justify-center rounded-[var(--r-sm)]"
                  style={{ background: "var(--n-50)" }}
                >
                  <span
                    className="text-[11.5px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: "var(--teal-700)" }}
                  >
                    {MANED_KORT[mnd - 1]}
                  </span>
                  <span className="text-[26px] font-black leading-none tabular-nums" style={{ color: "var(--ink)" }}>
                    {dag}
                  </span>
                </div>
                <div>
                  <h3 className="m-0 mb-1 text-[19px] font-bold" style={{ color: "var(--ink)" }}>
                    {tittel}
                  </h3>
                  <p className="m-0 text-[14.5px] leading-normal" style={{ color: "var(--fg-2)" }}>
                    {tekst}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <Link
          href="/gfgk-junior/kalender"
          className="jr-link mt-6 inline-flex items-center gap-1.5 text-[15px] font-bold"
        >
          Se full treningskalender
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </section>

      {/* 07 Partnere + kontakt-CTA */}
      <section id="kontakt" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pb-24 pt-20 sm:px-7 sm:pt-24">
        <SeksjonHeader nr="07" eyebrow="Samarbeidspartnere" tittel="De vi samarbeider med" />
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          <a
            href="https://akgolf.no"
            className="flex items-center gap-4 rounded-[var(--r-md)] bg-white p-6 no-underline transition-shadow hover:shadow-lg"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <div className="flex h-[60px] w-[84px] shrink-0 items-center justify-center">
              <Image
                src="/logos/ak-golf-logo-primary-on-light.svg"
                alt="AK Golf Academy"
                width={84}
                height={60}
                className="h-full w-auto object-contain"
              />
            </div>
            <div>
              <h3 className="m-0 mb-1 text-lg font-bold" style={{ color: "var(--ink)" }}>
                AK Golf Academy
              </h3>
              <p className="m-0 text-[14.5px] leading-normal" style={{ color: "var(--fg-2)" }}>
                Sportslig samarbeidspartner – treningsmetodikk, sportsplaner og trenerutvikling.
              </p>
            </div>
          </a>
          <a
            href="https://wang.no"
            className="flex items-center gap-4 rounded-[var(--r-md)] bg-white p-6 no-underline transition-shadow hover:shadow-lg"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <div className="flex h-[64px] w-[84px] shrink-0 items-center justify-center">
              <Image
                src="/images/logos/wang.svg"
                alt="WANG Toppidrett"
                width={50}
                height={64}
                className="h-full w-auto object-contain"
              />
            </div>
            <div>
              <h3 className="m-0 mb-1 text-lg font-bold" style={{ color: "var(--ink)" }}>
                WANG Toppidrett Fredrikstad
              </h3>
              <p className="m-0 text-[14.5px] leading-normal" style={{ color: "var(--fg-2)" }}>
                Toppidrettslinje for unge golfere – kombinerer skole og satsing.
              </p>
            </div>
          </a>
        </div>

        <div
          className="relative mt-14 overflow-hidden rounded-[var(--r-xl)] px-7 py-12 sm:px-14"
          style={{ background: "var(--gfgk-gold)" }}
        >
          <div
            className="absolute -bottom-16 -right-10 h-80 w-80 rounded-full"
            style={{ border: "44px solid rgba(255,255,255,0.28)" }}
          />
          <div className="relative max-w-[580px]">
            <h2
              className="m-0 font-black uppercase leading-[0.98]"
              style={{ color: "var(--ink)", fontSize: "clamp(32px, 5vw, 44px)" }}
            >
              Klar for første slag?
            </h2>
            <p className="mb-0 mt-4 text-lg leading-relaxed" style={{ color: "var(--ink)", opacity: 0.85 }}>
              Send en e-post for en uforpliktende prat – vi svarer innen 48 timer. Du trenger
              ikke eget utstyr til prøvetimen.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`mailto:${KONTAKT.epost}?subject=Påmelding juniortrening`}
                className="inline-flex min-h-[48px] items-center rounded-full px-7 py-3.5 text-base font-bold no-underline transition-colors"
                style={{ background: "var(--ink)", color: "var(--gfgk-white)" }}
              >
                Ta kontakt
              </a>
              <a
                href="#gruppene"
                className="inline-flex min-h-[48px] items-center rounded-full px-6 py-3 text-base font-bold no-underline"
                style={{ color: "var(--ink)", border: "2px solid var(--ink)" }}
              >
                Se gruppene
              </a>
            </div>
            <p
              className="mb-0 mt-5 flex items-center gap-2 text-[13px]"
              style={{ fontFamily: "var(--font-jr-mono)", color: "var(--ink)", opacity: 0.7 }}
            >
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              {KONTAKT.epost} · {KONTAKT.adresse}
            </p>
          </div>
        </div>
      </section>

      <GfgkFooter />
    </div>
  );
}
