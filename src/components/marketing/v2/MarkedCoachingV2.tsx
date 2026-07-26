"use client";

/**
 * Marketing — Coaching (/coaching). Delt MRamme. Coaching-først, én lime-CTA.
 */

import { useState, type ReactNode } from "react";
import {
  MRamme,
  Eyebrow,
  HeroT,
  SeksT,
  Lede,
  MCta,
  Seksjon,
  useMobile,
} from "./marked-ramme";
import { AvslorRoot } from "./scroll-animasjon";
import { T } from "@/lib/v2/tokens";
import { Icon, Caps, Kort, StatusPill, AvatarInit } from "@/components/v2";

const TJENESTER: {
  navn: string;
  varighet: string;
  skjer: string;
  tarMed: string;
  forHvem: string;
  img: string;
  alt: string;
}[] = [
  {
    navn: "Flex-økt",
    varighet: "20 / 50 / 90 min",
    skjer: "Én konkret sak eller dypere økt — du og coachen blir enige på stedet.",
    tarMed: "Tydelig neste steg og notater i PlayerHQ om du har tilgang.",
    forHvem: "Deg som vil ha en enkeltøkt uten abonnement.",
    img: "/images/akademy/coaching-tripod.jpg",
    alt: "Coach filmer sving",
  },
  {
    navn: "Performance",
    varighet: "60 min",
    skjer: "TrackMan, analyse og plan som legges inn i PlayerHQ.",
    tarMed: "Oppdatert ukeplan og øvelser du kan trene videre på.",
    forHvem: "Spillere som vil ha struktur og oppfølging over tid.",
    img: "/images/akademy/putting-data.jpg",
    alt: "Putting med data",
  },
  {
    navn: "Performance Pro",
    varighet: "90 min",
    skjer: "TrackMan, video, spredning og skriftlig plan.",
    tarMed: "Dypere analyse og tydelig prioritert treningsfokus.",
    forHvem: "Deg som vil gå grundigere og ha mer tid på banen/range.",
    img: "/images/akademy/utslag-fairway.jpg",
    alt: "Utslag",
  },
  {
    navn: "Gruppe-økt",
    varighet: "60 min · max 6",
    skjer: "Nivåtilpasset trening i gruppe med coach.",
    tarMed: "Felles økt + individuelle justeringer.",
    forHvem: "Junior, lag eller venner som vil trene sammen.",
    img: "/images/akademy/bunker-shot.jpg",
    alt: "Bunker",
  },
];

const PAKKER = [
  {
    navn: "Performance",
    okter: "2 økter / mnd",
    pkt: ["Faste økter", "Plan i PlayerHQ", "App inkludert", "Meldinger mellom økter"],
  },
  {
    navn: "Performance Pro",
    okter: "4 økter / mnd",
    frem: true,
    pkt: ["Alt i Performance", "Dobbelt frekvens", "TrackMan og video", "Turneringsoppfølging"],
  },
];

const STEG = [
  {
    t: "Ankomst",
    d: "Kort prat om form og mål for økten.",
    img: "/images/akademy/walking-bag.jpg",
    alt: "Spiller med bag",
  },
  {
    t: "Måling",
    d: "TrackMan, video eller tester — tall før mening.",
    img: "/images/akademy/putting-data.jpg",
    alt: "Måling",
  },
  {
    t: "Arbeid",
    d: "Trening på det som koster flest slag.",
    img: "/images/akademy/coach-observerer.jpg",
    alt: "Coach observerer",
  },
  {
    t: "Plan",
    d: "Neste steg legges i PlayerHQ før du drar.",
    img: "/images/akademy/coaching-tripod.jpg",
    alt: "Video og plan",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Trenger jeg egne køller?",
    a: "Ja, ta med baggen din. Vi har ikke utleiekøller som standard. Si ifra på forhånd hvis du trenger tilpasning.",
  },
  {
    q: "Hvor langt i forveien må jeg booke?",
    a: "Jo tidligere, jo bedre — spesielt kvelder og helger. Ledige tider ser du i booking, eller vi finner tid i samtalen.",
  },
  {
    q: "Hva hvis jeg må avbestille?",
    a: "Avbestill i god tid (helst mer enn 24 timer før). Nærmere frist kan økten gå tapt, avhengig av avtale. Det står også i bekreftelsen.",
  },
  {
    q: "Passer dette for nybegynnere?",
    a: "Ja. Vi tilpasser tempo og språk. Flex-økt eller Performance er vanlig start — vi anbefaler det som passer deg, uten å stenge noe ute.",
  },
];

function Punkt({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: "flex", gap: 8, alignItems: "flex-start", fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.5 }}>
      <Icon name="check" size={14} style={{ color: T.lime, flex: "none", marginTop: 3 }} />
      {children}
    </span>
  );
}

function HjelpNote({ tittel, children }: { tittel: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "13px 15px", borderRadius: 14, background: T.panel2, border: `1px solid ${T.border}` }}>
      <span aria-hidden style={{ width: 20, height: 20, borderRadius: 9999, border: `1px solid ${T.borderS}`, display: "grid", placeItems: "center", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.lime, flex: "none" }}>
        ?
      </span>
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55 }}>
        <strong style={{ color: T.fg, fontWeight: 600 }}>{tittel} </strong>
        {children}
      </span>
    </div>
  );
}

function FaqAcc({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => {
        const on = open === i;
        return (
          <div key={item.q} style={{ borderRadius: 14, border: `1px solid ${T.border}`, background: T.panel, overflow: "hidden" }}>
            <button
              type="button"
              className="v2-press v2-focus"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : i)}
              style={{
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "16px 18px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                minHeight: 52,
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {item.q}
              <Icon name={on ? "chevron-up" : "chevron-down"} size={18} style={{ color: T.mut, flex: "none" }} />
            </button>
            {on && (
              <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "0 18px 16px", maxWidth: 640 }}>
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function MarkedCoachingV2() {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="coaching" cta={{ label: "Book en samtale", href: "/booking" }}>
      <AvslorRoot>
        <Seksjon mobile={mobile}>
          <div
            className="m-avslor"
            style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "1.1fr 0.9fr",
              gap: mobile ? 28 : 48,
              alignItems: "center",
            }}
          >
            <div>
              <Eyebrow>Coaching</Eyebrow>
              <HeroT mobile={mobile} em="hverdagen">
                Bedre golf i
              </HeroT>
              <Lede style={{ marginTop: 18 }}>
                Du får en coach som følger deg over tid — ikke bare én time på rangen.
                Måling, plan og økter henger sammen.
              </Lede>
              <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 12 }}>
                <AvatarInit navn="Markus Røinås Pedersen" size={40} />
                <span>
                  <span style={{ display: "block", fontFamily: T.ui, fontSize: 14.5, fontWeight: 600, color: T.fg }}>
                    Markus Røinås Pedersen
                  </span>
                  <span style={{ display: "block", fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 2 }}>
                    Head Coach, AK Golf Academy
                  </span>
                </span>
              </div>
              <div style={{ marginTop: 26 }}>
                <MCta href="/booking" icon="arrow-right">
                  Book en samtale
                </MCta>
              </div>
            </div>
            <div
              className="m-avslor m-avslor-d2"
              style={{
                borderRadius: 20,
                overflow: "hidden",
                border: `1px solid ${T.borderS}`,
                height: mobile ? 240 : 360,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/akademy/coach-observerer.jpg"
                alt="Coach følger spiller"
                loading="eager"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        </Seksjon>

        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <div className="m-avslor">
            <Caps>Tjenester</Caps>
            <div style={{ marginTop: 12 }}>
              <SeksT mobile={mobile}>Velg form — samme coachingkvalitet</SeksT>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
            {TJENESTER.map((t, i) => (
              <article
                key={t.navn}
                className={`m-avslor m-avslor-d${(i % 4) + 1}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "1fr" : "200px 1fr",
                  gap: 0,
                  borderRadius: 18,
                  overflow: "hidden",
                  border: `1px solid ${T.border}`,
                  background: T.panel,
                }}
              >
                <div style={{ minHeight: mobile ? 140 : 100 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: mobile ? 140 : 160 }} />
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "baseline", justifyContent: "space-between" }}>
                    <h3 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg, margin: 0 }}>{t.navn}</h3>
                    <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut }}>{t.varighet}</span>
                  </div>
                  <dl style={{ margin: "14px 0 0", display: "grid", gap: 10 }}>
                    <div>
                      <dt style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>I økten</dt>
                      <dd style={{ margin: "4px 0 0", fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.5 }}>{t.skjer}</dd>
                    </div>
                    <div>
                      <dt style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>Du tar med deg</dt>
                      <dd style={{ margin: "4px 0 0", fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.5 }}>{t.tarMed}</dd>
                    </div>
                    <div>
                      <dt style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>Passer for</dt>
                      <dd style={{ margin: "4px 0 0", fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.5 }}>{t.forHvem}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </Seksjon>

        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <div className="m-avslor">
            <Caps>Pakker</Caps>
            <div style={{ marginTop: 12 }}>
              <SeksT mobile={mobile}>Fast frekvens</SeksT>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap, marginTop: 22 }}>
            {PAKKER.map((p) => (
              <Kort key={p.navn} tint={p.frem} pad="22px">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>{p.navn}</span>
                  {p.frem && <StatusPill>Mest valgt</StatusPill>}
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.lime, display: "block", marginTop: 8 }}>{p.okter}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                  {p.pkt.map((x) => (
                    <Punkt key={x}>{x}</Punkt>
                  ))}
                </div>
              </Kort>
            ))}
          </div>
          <div className="m-avslor" style={{ marginTop: 16, maxWidth: 640 }}>
            <HjelpNote tittel="Pakke er antall økter.">
              Performance og Performance Pro er coaching-pakker (2 eller 4 økter per måned), ikke app-nivåer. PlayerHQ er inkludert.
            </HjelpNote>
          </div>
        </Seksjon>

        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <div className="m-avslor">
            <Caps>Slik går en økt</Caps>
            <div style={{ marginTop: 12 }}>
              <SeksT mobile={mobile}>Fra ankomst til plan</SeksT>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
              gap: T.gap,
              marginTop: 24,
            }}
          >
            {STEG.map((s, i) => (
              <div key={s.t} className={`m-avslor m-avslor-d${(i % 4) + 1}`}>
                <div style={{ borderRadius: 14, overflow: "hidden", height: 120, border: `1px solid ${T.border}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.lime, marginTop: 10 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontFamily: T.ui, fontWeight: 700, fontSize: 15, color: T.fg, marginTop: 4 }}>{s.t}</div>
                <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5, margin: "6px 0 0" }}>{s.d}</p>
              </div>
            ))}
          </div>
        </Seksjon>

        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <div className="m-avslor">
            <Caps>Spørsmål før du booker</Caps>
            <div style={{ marginTop: 12, marginBottom: 20 }}>
              <SeksT mobile={mobile}>Kort og ærlig</SeksT>
            </div>
          </div>
          <div className="m-avslor">
            <FaqAcc items={FAQ} />
          </div>
        </Seksjon>

        <Seksjon mobile={mobile} style={{ paddingTop: 8, paddingBottom: mobile ? 56 : 80 }}>
          <Kort tint pad="28px 24px">
            <div
              style={{
                display: "flex",
                flexDirection: mobile ? "column" : "row",
                gap: 18,
                alignItems: mobile ? "stretch" : "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 22 : 26, color: T.fg, letterSpacing: "-0.03em" }}>
                  Finn riktig opplegg i en samtale
                </div>
                <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, margin: "10px 0 0", maxWidth: 420, lineHeight: 1.55 }}>
                  Uforpliktende. Vi snakker om mål, tid og nivå — pris avtales der.
                </p>
              </div>
              <MCta href="/booking" icon="arrow-right">
                Book en samtale
              </MCta>
            </div>
          </Kort>
        </Seksjon>
      </AvslorRoot>
    </MRamme>
  );
}
