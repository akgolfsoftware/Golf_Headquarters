"use client";

/**
 * Marketing — Forside v2 (Starlink-rytme, coaching-først).
 * Én primær handling: «Book en samtale». Ekte foto. Ingen inventerte tall.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  MRamme,
  Eyebrow,
  HeroT,
  SeksT,
  Lede,
  MCta,
  useMobile,
  M,
} from "./marked-ramme";
import { AvslorRoot, useParallaks } from "./scroll-animasjon";
import { PlayerHqTelefon, type AppSkjermId } from "./forside-app-mock";
import { T } from "@/lib/v2/tokens";
import {
  Icon,
  Caps,
  Kort,
  StatusPill,
  AvatarInit,
  SgKategorier,
} from "@/components/v2";

const TJENESTER: {
  navn: string;
  varighet: string;
  tekst: string;
  img: string;
  alt: string;
}[] = [
  {
    navn: "Flex-økt",
    varighet: "20 / 50 / 90 min",
    tekst: "Drop-in med coach — ett tema eller dypere, når det passer.",
    img: "/images/akademy/coaching-tripod.jpg",
    alt: "Coach filmer sving med stativ",
  },
  {
    navn: "Performance",
    varighet: "60 min",
    tekst: "Strukturert økt: TrackMan, analyse og plan inn i PlayerHQ.",
    img: "/images/akademy/putting-data.jpg",
    alt: "Putting med måleutstyr",
  },
  {
    navn: "Performance Pro",
    varighet: "90 min",
    tekst: "TrackMan, video, spredning og skriftlig plan.",
    img: "/images/akademy/utslag-fairway.jpg",
    alt: "Utslag fra fairway",
  },
  {
    navn: "Gruppe-økt",
    varighet: "60 min · inntil 6",
    tekst: "Nivåtilpasset trening i gruppe med coach.",
    img: "/images/akademy/bunker-shot.jpg",
    alt: "Bunkerslag",
  },
];

const PAKKER: { navn: string; okter: string; frem?: boolean; pkt: string[] }[] = [
  {
    navn: "Performance",
    okter: "2 økter per måned",
    pkt: [
      "Faste økter med coachen din",
      "Treningsplan i PlayerHQ",
      "PlayerHQ inkludert uten månedspris",
      "Meldingskontakt mellom øktene",
    ],
  },
  {
    navn: "Performance Pro",
    okter: "4 økter per måned",
    frem: true,
    pkt: [
      "Alt i Performance",
      "Dobbelt så mange coach-økter",
      "TrackMan og videoanalyse",
      "Oppfølging rundt turneringer",
    ],
  },
];

function Punkt({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "flex",
        gap: 9,
        alignItems: "flex-start",
        fontFamily: T.ui,
        fontSize: 13.5,
        color: T.fg2,
        lineHeight: 1.55,
      }}
    >
      <Icon name="check" size={14} style={{ color: T.lime, flex: "none", marginTop: 3 }} />
      {children}
    </span>
  );
}

function HjelpNote({ tittel, children }: { tittel?: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "13px 15px",
        borderRadius: 14,
        background: T.panel2,
        border: `1px solid ${T.border}`,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 20,
          height: 20,
          flex: "none",
          borderRadius: 9999,
          border: `1px solid ${T.borderS}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: T.mono,
          fontSize: 11,
          fontWeight: 700,
          color: T.lime,
        }}
      >
        ?
      </span>
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55 }}>
        {tittel && <strong style={{ color: T.fg, fontWeight: 600 }}>{tittel} </strong>}
        {children}
      </span>
    </div>
  );
}

function FullSeksjon({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: M.maxw,
        margin: "0 auto",
        padding: "0 22px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function useStickySkjerm(): AppSkjermId {
  const [id, setId] = useState<AppSkjermId>("hjem");
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = ["fs-app-hjem", "fs-app-plan", "fs-app-analyse"]
      .map((i) => document.getElementById(i))
      .filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        const map: Record<string, AppSkjermId> = {
          "fs-app-hjem": "hjem",
          "fs-app-plan": "plan",
          "fs-app-analyse": "analyse",
        };
        const next = map[hit.target.id];
        if (next) setId(next);
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: [0.2, 0.5, 0.8] },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return id;
}

export function MarkedForsideV2() {
  const mobile = useMobile();
  const parallaxRef = useRef<HTMLDivElement>(null);
  useParallaks(parallaxRef, 0.2);
  const aktivSkjerm = useStickySkjerm();

  return (
    <MRamme mobile={mobile} aktiv="hjem" cta={{ label: "Book en samtale", href: "/booking" }}>
      <AvslorRoot>
        {/* ── 1. Hero full-bleed ── */}
        <header
          style={{
            position: "relative",
            minHeight: mobile ? "92vh" : "100vh",
            display: "flex",
            alignItems: "flex-end",
            overflow: "hidden",
          }}
        >
          <div
            ref={parallaxRef}
            className="m-parallaks"
            style={{
              position: "absolute",
              inset: "-8% 0 -8% 0",
              zIndex: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/akademy/coach-observerer.jpg"
              alt="Coach følger en spiller under trening"
              fetchPriority="high"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background: `linear-gradient(180deg, color-mix(in srgb, ${T.bg} 15%, transparent) 0%, color-mix(in srgb, ${T.bg} 55%, transparent) 45%, color-mix(in srgb, ${T.bg} 92%, transparent) 100%)`,
            }}
          />
          <FullSeksjon
            style={{
              position: "relative",
              zIndex: 2,
              paddingBottom: mobile ? 48 : 72,
              paddingTop: mobile ? 120 : 160,
            }}
          >
            <Eyebrow>AK Golf Academy · Fredrikstad</Eyebrow>
            <HeroT mobile={mobile} em="fremgang">
              Coaching som gir
            </HeroT>
            <Lede style={{ marginTop: 18, maxWidth: 480, color: T.fg }}>
              Personlig oppfølging med faste økter, en plan som lever mellom øktene, og
              tall som viser hva som faktisk fungerer. Appen følger med — coachen er
              hovedsaken.
            </Lede>
            <div
              style={{
                marginTop: 22,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <AvatarInit navn="Markus Røinås Pedersen" size={40} />
              <span>
                <span
                  style={{
                    display: "block",
                    fontFamily: T.ui,
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: T.fg,
                  }}
                >
                  Markus Røinås Pedersen
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: T.ui,
                    fontSize: 12.5,
                    color: T.mut,
                    marginTop: 2,
                  }}
                >
                  Head Coach, AK Golf Academy
                </span>
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 28,
                alignItems: "center",
              }}
            >
              <MCta href="/booking" icon="arrow-right">
                Book en samtale
              </MCta>
              <Link
                href="/coaching"
                className="v2-focus"
                style={{
                  fontFamily: T.ui,
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: T.fg2,
                  textDecoration: "none",
                  minHeight: 44,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Se oppleggene
              </Link>
            </div>
          </FullSeksjon>
        </header>

        {/* ── 2. Tjenester ── */}
        <FullSeksjon style={{ paddingTop: mobile ? 56 : 88, paddingBottom: 24 }}>
          <div className="m-avslor">
            <Caps>Hva coaching hos oss er</Caps>
            <div style={{ marginTop: 12 }}>
              <SeksT mobile={mobile} em="økt">
                Fire måter å booke en
              </SeksT>
            </div>
            <Lede style={{ marginTop: 12 }}>
              Alle økter er med coach. Pris avtales i samtalen — den avhenger av opplegg
              og reisevei.
            </Lede>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)",
              gap: T.gap,
              marginTop: 28,
            }}
          >
            {TJENESTER.map((t, i) => (
              <article
                key={t.navn}
                className={`m-avslor m-avslor-d${(i % 4) + 1}`}
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  border: `1px solid ${T.border}`,
                  background: T.panel,
                }}
              >
                <div style={{ height: mobile ? 160 : 190, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.img}
                    alt={t.alt}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                <div style={{ padding: "16px 18px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                    <h3
                      style={{
                        fontFamily: T.disp,
                        fontWeight: 700,
                        fontSize: 19,
                        color: T.fg,
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {t.navn}
                    </h3>
                    <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut, flex: "none" }}>
                      {t.varighet}
                    </span>
                  </div>
                  <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.55, margin: "8px 0 0" }}>
                    {t.tekst}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div
            className="m-avslor"
            style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
              gap: T.gap,
              marginTop: 28,
            }}
          >
            {PAKKER.map((p) => (
              <Kort key={p.navn} tint={p.frem} pad="22px 22px 24px">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>
                    {p.navn}
                  </span>
                  {p.frem && <StatusPill>Mest valgt</StatusPill>}
                </div>
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.lime,
                    display: "block",
                    marginTop: 8,
                  }}
                >
                  {p.okter}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 16 }}>
                  {p.pkt.map((x) => (
                    <Punkt key={x}>{x}</Punkt>
                  ))}
                </div>
              </Kort>
            ))}
          </div>
          <div className="m-avslor" style={{ marginTop: 18, maxWidth: 640 }}>
            <HjelpNote tittel="Hva er en coaching-pakke?">
              Antall økter med coach per måned — ikke et app-nivå. PlayerHQ er den samme
              for alle og er inkludert uten egen månedspris så lenge du har pakke.
            </HjelpNote>
          </div>
        </FullSeksjon>

        {/* ── 3. App som bevis ── */}
        <FullSeksjon style={{ paddingTop: mobile ? 40 : 64, paddingBottom: mobile ? 40 : 72 }}>
          <div className="m-avslor" style={{ maxWidth: 520 }}>
            <Caps>Verktøyet følger med</Caps>
            <div style={{ marginTop: 12 }}>
              <SeksT mobile={mobile} em="samme tallene">
                Du og coachen ser
              </SeksT>
            </div>
            <Lede style={{ marginTop: 12 }}>
              PlayerHQ er ikke et separat produkt du kjøper i stedet for coaching. Det er
              der planen, øktene og strokes gained lever mellom timene.
            </Lede>
          </div>

          {mobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 36, marginTop: 32 }}>
              {(["hjem", "plan", "analyse"] as const).map((id) => (
                <div key={id} className="m-avslor">
                  <Caps size={10} style={{ marginBottom: 12 }}>
                    {id === "hjem" ? "Hjem" : id === "plan" ? "Plan" : "Analyse"}
                  </Caps>
                  <PlayerHqTelefon aktiv={id} scale={0.82} />
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 400px",
                gap: 48,
                marginTop: 40,
                alignItems: "start",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {(
                  [
                    {
                      id: "fs-app-hjem",
                      t: "Hjem",
                      d: "Dagens økt, status og hva coachen har prioritert — uten støy.",
                    },
                    {
                      id: "fs-app-plan",
                      t: "Plan",
                      d: "Ukeplan og fordeling på treningsområder. Planen oppdateres etter økt og runde.",
                    },
                    {
                      id: "fs-app-analyse",
                      t: "Analyse",
                      d: "Strokes gained viser hvor slagene forsvinner, mot tour, nasjonalt nivå eller din egen historikk.",
                    },
                  ] as const
                ).map((b) => (
                  <div
                    key={b.id}
                    id={b.id}
                    style={{
                      minHeight: "70vh",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      padding: "32px 0",
                    }}
                  >
                    <Caps>{b.t}</Caps>
                    <p
                      style={{
                        fontFamily: T.ui,
                        fontSize: 17,
                        color: T.fg2,
                        lineHeight: 1.6,
                        margin: "14px 0 0",
                        maxWidth: 420,
                      }}
                    >
                      {b.d}
                    </p>
                  </div>
                ))}
              </div>
              <div className="m-klebrig">
                <PlayerHqTelefon aktiv={aktivSkjerm} />
              </div>
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <Link
              href="/playerhq"
              className="v2-focus"
              style={{
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 600,
                color: T.fg2,
                textDecoration: "none",
              }}
            >
              Les mer om PlayerHQ →
            </Link>
          </div>
        </FullSeksjon>

        {/* ── 4. SG ── */}
        <FullSeksjon style={{ paddingTop: 24, paddingBottom: mobile ? 48 : 72 }}>
          <div
            className="m-avslor"
            style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "1.1fr 0.9fr",
              gap: 28,
              alignItems: "start",
            }}
          >
            <div>
              <Caps>Tallene, sammenlignet</Caps>
              <div style={{ marginTop: 12 }}>
                <SeksT mobile={mobile} em="slagene forsvinner">
                  Se hvor
                </SeksT>
              </div>
              <Lede style={{ marginTop: 12 }}>
                Midtlinjen er valgt baseline (f.eks. tour eller nasjonalt nivå). Stolpe
                til venstre betyr slag tapt. Du kan også sammenligne mot din egen
                historikk.
              </Lede>
              <p
                style={{
                  fontFamily: T.ui,
                  fontSize: 12.5,
                  color: T.mut,
                  lineHeight: 1.55,
                  margin: "14px 0 0",
                  maxWidth: 440,
                }}
              >
                Figuren under er et illustrasjonseksempel. Ekte tall bygger på runder og
                strokes gained du logger i PlayerHQ eller som coachen har tilgang til.
              </p>
              <div style={{ marginTop: 20 }}>
                <Link
                  href="/stats/sg-sammenlign"
                  className="v2-focus"
                  style={{
                    fontFamily: T.ui,
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: T.lime,
                    textDecoration: "none",
                  }}
                >
                  Åpne SG-sammenligning →
                </Link>
              </div>
            </div>
            <div className="m-avslor m-avslor-d2">
              <SgKategorier baseline="illustrasjon · scratch" />
            </div>
          </div>
        </FullSeksjon>

        {/* ── 5. Bevis + CTA ── */}
        <FullSeksjon style={{ paddingTop: 8, paddingBottom: mobile ? 64 : 96 }}>
          <div className="m-avslor">
            <Caps>Hvorfor det fungerer</Caps>
            <p
              style={{
                fontFamily: T.disp,
                fontWeight: 700,
                fontSize: mobile ? 22 : 28,
                letterSpacing: "-0.03em",
                color: T.fg,
                margin: "12px 0 0",
                maxWidth: 560,
                lineHeight: 1.15,
              }}
            >
              Coaching med plan — ikke tilfeldige tips på rangen.
            </p>
          </div>
          <div
            className="m-avslor"
            style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
              gap: T.gap,
              marginTop: 24,
            }}
          >
            {[
              { t: "TrackMan og video", d: "Vi måler før vi mener." },
              { t: "Plan i PlayerHQ", d: "Samme tall for deg og coachen." },
              { t: "Faste økter", d: "2 eller 4 per måned i pakke." },
            ].map((b) => (
              <Kort key={b.t} pad="18px 18px">
                <div style={{ fontFamily: T.ui, fontWeight: 700, fontSize: 15, color: T.fg }}>
                  {b.t}
                </div>
                <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, marginTop: 6 }}>
                  {b.d}
                </div>
              </Kort>
            ))}
          </div>

          <div className="m-avslor" style={{ marginTop: 32 }}>
          <Kort
            tint
            pad="28px 26px"
          >
            <div
              style={{
                display: "flex",
                flexDirection: mobile ? "column" : "row",
                gap: 20,
                alignItems: mobile ? "stretch" : "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: T.disp,
                    fontWeight: 700,
                    fontSize: mobile ? 22 : 26,
                    color: T.fg,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Klar for en uforpliktende samtale?
                </div>
                <p
                  style={{
                    fontFamily: T.ui,
                    fontSize: 14.5,
                    color: T.fg2,
                    margin: "10px 0 0",
                    maxWidth: 420,
                    lineHeight: 1.55,
                  }}
                >
                  Vi finner opplegg som passer spillet ditt. Pris avtales i samtalen.
                </p>
              </div>
              <MCta href="/booking" icon="arrow-right">
                Book en samtale
              </MCta>
            </div>
          </Kort>
          </div>
          <div style={{ marginTop: 18, textAlign: mobile ? "left" : "center" }}>
            <Link
              href="/playerhq"
              className="v2-focus"
              style={{
                fontFamily: T.ui,
                fontSize: 13.5,
                fontWeight: 600,
                color: T.mut,
                textDecoration: "none",
              }}
            >
              Bare nysgjerrig på appen? Se PlayerHQ
            </Link>
          </div>
        </FullSeksjon>
      </AvslorRoot>
    </MRamme>
  );
}
