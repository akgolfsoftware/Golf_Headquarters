"use client";

/**
 * Marketing — Forside v2 (akgolf.no, retning C «Presis», mørk-først).
 *
 * COACHING-FØRST + SCROLL-DREVET (Anders 2026-07-24). Siden fortelles nedover:
 *   1. Hero med ekte foto (parallakse) — coachen og én handling.
 *   2. Coaching-tjenestene vi faktisk tilbyr, med ekte bilder.
 *   3. PlayerHQ i en klebrig scene: ekte app-skjermer bygget av de SAMME
 *      v2-komponentene som portalen bruker (`Skjerm`, `TallHero`, `Trend`,
 *      `FordelingRad`, `Rad`), ikke tegnede mockup-bilder.
 *   4. AK Golf Intelligence — spilleren sammenligner tallene sine mot
 *      PGA Tour-baselinen (DataGolf) og mot norsk nivå.
 *   5. Bevis og booking.
 *
 * Bevegelse: `Avslor`/`Parallaks`/`useAktivtSteg` fra ./scroll-animasjon, som
 * kun styrer NÅR klassene i motion-katalogen slår inn. Redusert bevegelse gir
 * en helt statisk side — alt innhold er der uansett.
 *
 * Én primær handling hele veien: «Book en samtale» (→ /booking).
 *
 * Copy: `docs/skjermtekst` (M1-bevislinje), den godkjente teksten på /coaching,
 * og tjenestebeskrivelsene fra det ekte tjeneste-oppsettet. Ingen priser her —
 * de bor i booking, som leser dem fra databasen. Kanon-coach på markedsflater:
 * Markus Røinås Pedersen. Kun T.*-tokens + rgba/color-mix. Norsk bokmål.
 *
 * NB: «AK Golf Intelligence» er et NYTT navn på datalaget (Anders 2026-07-24).
 * Det står ikke i `docs/skjermtekst` ennå — legg det inn der hvis det skal være
 * offisielt navn utad.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import {
  MRamme,
  Seksjon,
  Eyebrow,
  HeroT,
  SeksT,
  Lede,
  MCta,
  useMobile,
} from "./marked-ramme";
import { Avslor, Parallaks, useAktivtSteg } from "./scroll-animasjon";
import { T } from "@/lib/v2/tokens";
import {
  Icon,
  Caps,
  Kort,
  Rad,
  Skjerm,
  StatusPill,
  AvatarInit,
  AkseChip,
  MikroMeta,
  TallHero,
  Trend,
  FordelingRad,
  AkseBar,
  InnsiktChip,
  DeltaChip,
  SgKategorier,
} from "@/components/v2";

/* ══════════════════════════════════════════════════════════════
   Lokale idiomer
   ══════════════════════════════════════════════════════════════ */

function Punkt({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: "flex", gap: 9, alignItems: "flex-start", fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.55 }}>
      <Icon name="check" size={14} style={{ color: T.lime, flex: "none", marginTop: 3 }} />
      {children}
    </span>
  );
}

/** «?»-note: klargjør et begrep uten å rope (samme idiom som /coaching). */
function HjelpNote({ tittel, children }: { tittel?: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 15px", borderRadius: 14, background: T.panel2, border: `1px solid ${T.border}` }}>
      <span
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
          marginTop: 1,
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

/** Foto med tonet overlegg — brukes i tjenestekortene. */
function Foto({ src, alt, hoyde }: { src: string; alt: string; hoyde: number }) {
  return (
    <div style={{ position: "relative", height: hoyde, overflow: "hidden", borderRadius: 16, border: `1px solid ${T.borderS}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 35%, color-mix(in srgb, ${T.bg} 78%, transparent) 100%)`,
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Innhold — alt speiler noe som finnes på ekte
   ══════════════════════════════════════════════════════════════ */

/** Coaching-tjenestene vi faktisk tilbyr (samme oppsett som booking). */
const TJENESTER: { navn: string; varighet: string; d: string; foto: string; alt: string }[] = [
  {
    navn: "Flex-økt",
    varighet: "20 · 50 · 90 min",
    d: "Drop-in med coach når du trenger det. Ett tema, eller dybde-analyse med praksis.",
    foto: "/images/akademy/utslag-fairway.jpg",
    alt: "Spiller slår utslag fra fairway",
  },
  {
    navn: "Performance",
    varighet: "60 min",
    d: "Strukturert økt med TrackMan, analyse og plan som legges rett i PlayerHQ.",
    foto: "/images/akademy/coaching-tripod.jpg",
    alt: "Coach filmer sving med kamera på stativ",
  },
  {
    navn: "Performance Pro",
    varighet: "90 min",
    d: "TrackMan, video, dispersjon og skriftlig plan. For deg som jobber mot et konkret mål.",
    foto: "/images/akademy/putting-data.jpg",
    alt: "Putting-trening med måleutstyr",
  },
  {
    navn: "Gruppe-økt",
    varighet: "60 min · inntil 6",
    d: "Nivåtilpasset trening i gruppe. Samme plan og oppfølging som individuelt.",
    foto: "/images/akademy/bunker-shot.jpg",
    alt: "Spiller slår fra bunker",
  },
];

/** Abonnementspakkene — antall økter per måned, aldri app-nivå. */
const PAKKER: { navn: string; okter: string; frem?: boolean; pkt: string[] }[] = [
  {
    navn: "Performance",
    okter: "2 økter per måned",
    pkt: [
      "Faste økter med coachen din",
      "Treningsplan i PlayerHQ, oppdatert etter hver økt",
      "PlayerHQ inkludert, uten månedspris",
      "Meldingskontakt mellom øktene",
    ],
  },
  {
    navn: "Performance Pro",
    okter: "4 økter per måned",
    frem: true,
    pkt: [
      "Alt i Performance",
      "Dobbelt så mange økter med coach",
      "TrackMan-økter og videoanalyse",
      "Oppfølging rundt turneringer",
    ],
  },
];

const BEVIS: { v: string; l: string }[] = [
  { v: "120+", l: "Aktive spillere" },
  { v: "9 500", l: "Økter loggført" },
  { v: "4 av 5", l: "Senker snittscoren første sesong" },
];

/* ══════════════════════════════════════════════════════════════
   PlayerHQ — ekte skjermer, bygget av portalens egne komponenter
   ══════════════════════════════════════════════════════════════ */

const STEG: { caps: string; t: string; em: string; d: string }[] = [
  {
    caps: "Hjem",
    t: "Én ting å gjøre",
    em: "nå",
    d: "Spilleren åpner appen og ser dagens økt og formen sin. Ingen meny å lete i, én knapp videre.",
  },
  {
    caps: "Plan",
    t: "Uka er lagt av",
    em: "coachen",
    d: "Planen kommer fra økta dere hadde, ikke fra en mal. Den justeres når tallene endrer seg.",
  },
  {
    caps: "Analyse",
    t: "Der slagene",
    em: "forsvinner",
    d: "Strokes gained per del av spillet, med en klar anbefaling om hva som skal trenes først.",
  },
];

function SkjermHjem() {
  return (
    <>
      <Kort tint eyebrow="I dag">
        <TallHero value="60" unit="min" size={38} accent sub="Nærspill · Mulligan Indoor" />
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
          <AkseChip a="SLAG" />
          <StatusPill tone="lime">Kl 17:00</StatusPill>
        </div>
      </Kort>
      <div style={{ marginTop: 10 }}>
        <Kort eyebrow="Formen din">
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.fg }}>+1,8</span>
            <DeltaChip v="+0,6" dir="up" />
          </div>
          <div style={{ marginTop: 10 }}>
            <Trend series={[-0.4, 0.2, -0.1, 0.8, 0.6, 1.2, 1.8]} height={54} />
          </div>
        </Kort>
      </div>
      <div style={{ marginTop: 10 }}>
        <Kort eyebrow="Resten av uka">
          <Rad leading={<AkseChip a="TEK" />} title="Sving · 45 min" sub="Onsdag · Range" meta={<MikroMeta icon="clock">Planlagt</MikroMeta>} />
          <Rad leading={<AkseChip a="SPILL" />} title="9 hull med kart" sub="Fredag · GFGK" meta={<MikroMeta icon="clock">Planlagt</MikroMeta>} last />
        </Kort>
      </div>
      <div style={{ marginTop: 10 }}>
        <InnsiktChip>Nærspill koster deg mest denne måneden.</InnsiktChip>
      </div>
    </>
  );
}

function SkjermPlan() {
  return (
    <>
      <Kort eyebrow="Uke 30" action={<Caps size={9}>4 økter</Caps>}>
        <Rad leading={<AkseChip a="SLAG" />} title="Nærspill · 60 min" sub="Mandag · Mulligan" meta={<MikroMeta icon="check">Gjort</MikroMeta>} />
        <Rad leading={<AkseChip a="TEK" />} title="Sving · 45 min" sub="Onsdag · Range" meta={<MikroMeta icon="check">Gjort</MikroMeta>} />
        <Rad leading={<AkseChip a="SPILL" />} title="9 hull med kart" sub="Fredag · GFGK" meta={<MikroMeta icon="clock">Planlagt</MikroMeta>} />
        <Rad leading={<AkseChip a="FYS" />} title="Styrke · 40 min" sub="Lørdag" meta={<MikroMeta icon="clock">Planlagt</MikroMeta>} last />
      </Kort>
      <div style={{ marginTop: 10 }}>
        <Kort tint eyebrow="Fordeling denne uka">
          <AkseBar a="SLAG" v={120} m={120} max={160} enhet="min" />
          <AkseBar a="TEK" v={45} m={60} max={160} enhet="min" />
          <AkseBar a="SPILL" v={90} m={90} max={160} enhet="min" />
          <AkseBar a="FYS" v={40} m={80} max={160} enhet="min" last />
        </Kort>
      </div>
    </>
  );
}

function SkjermAnalyse() {
  return (
    <>
      <Kort tint eyebrow="Strokes gained · siste 10 runder">
        <TallHero value="+1,8" unit="SG totalt" delta="+0,6" dir="up" size={38} accent />
        <div style={{ marginTop: 14 }}>
          <Trend series={[-0.4, 0.2, -0.1, 0.8, 0.6, 1.2, 1.8]} height={64} xLabels={["MAI", "JUN", "JUL"]} />
        </div>
      </Kort>
      <div style={{ marginTop: 10 }}>
        <Kort eyebrow="Størst gevinst å hente">
          <FordelingRad signal code="NÆR" pct={64} value="−1,2" neg />
          <FordelingRad signal code="PUTT" pct={38} value="−0,5" neg />
          <FordelingRad signal code="INN" pct={22} value="+0,3" />
          <FordelingRad signal code="TEE" pct={18} value="+0,4" last />
        </Kort>
      </div>
      <div style={{ marginTop: 10 }}>
        <InnsiktChip>Planen din prioriterer nærspill de neste tre ukene.</InnsiktChip>
      </div>
    </>
  );
}

const SKJERMER = [SkjermHjem, SkjermPlan, SkjermAnalyse];

/* ══════════════════════════════════════════════════════════════
   AK Golf Intelligence — sammenligning mot tour og norsk nivå
   ══════════════════════════════════════════════════════════════ */

export function MarkedForsideV2() {
  const mobile = useMobile();
  const { ref: sceneRef, aktivt } = useAktivtSteg(STEG.length);
  const AktivSkjerm = SKJERMER[Math.min(aktivt, SKJERMER.length - 1)];

  return (
    <MRamme mobile={mobile} aktiv="hjem" cta={{ label: "Book en samtale", href: "/booking" }}>
      {/* ═══ 1. Hero — foto med parallakse ═══ */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: `1px solid ${T.border}` }}>
        <Parallaks
          styrke={0.14}
          style={{ position: "absolute", inset: "-12% 0", zIndex: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/akademy/coach-observerer.jpg"
            alt=""
            aria-hidden
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </Parallaks>
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: `linear-gradient(100deg, ${T.bg} 6%, color-mix(in srgb, ${T.bg} 82%, transparent) 46%, color-mix(in srgb, ${T.bg} 30%, transparent) 100%)`,
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>
          <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 64 : 128, paddingBottom: mobile ? 72 : 132 }}>
            <div style={{ maxWidth: 640 }}>
              <Avslor>
                <Eyebrow>AK Golf · Coaching</Eyebrow>
                <HeroT mobile={mobile} em="fremgang">
                  Coaching som gir
                </HeroT>
              </Avslor>
              <Avslor forsink={120}>
                <Lede style={{ marginTop: 22 }}>
                  Personlig oppfølging bygget på data, ikke magefølelse. Du får faste økter med din egen
                  coach, en plan som lever mellom øktene, og tall som viser at det virker.
                </Lede>
              </Avslor>
              <Avslor forsink={220}>
                <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 13 }}>
                  <AvatarInit navn="Markus Røinås Pedersen" size={42} />
                  <span>
                    <span style={{ display: "block", fontFamily: T.ui, fontSize: 15, fontWeight: 600, color: T.fg }}>
                      Markus Røinås Pedersen
                    </span>
                    <span style={{ display: "block", fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 2 }}>
                      Head Coach, AK Golf Academy
                    </span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28, alignItems: "center" }}>
                  <MCta href="/booking" icon="arrow-right">
                    Book en samtale
                  </MCta>
                  <MCta ghost href="/coaching">
                    Se coaching-oppleggene
                  </MCta>
                </div>
              </Avslor>
            </div>
          </Seksjon>
        </div>
      </div>

      {/* ═══ 2. Tjenestene ═══ */}
      <Seksjon mobile={mobile}>
        <Avslor>
          <Caps>Coaching hos oss</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile} em="passer deg">
              Velg formen som
            </SeksT>
          </div>
          <Lede style={{ marginTop: 14 }}>
            Alt fra en kort drop-in til fast oppfølging hver uke. Samme coach, samme plan, samme tall.
          </Lede>
        </Avslor>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)",
            gap: T.gap,
            marginTop: 26,
          }}
        >
          {TJENESTER.map((t, i) => (
            <Avslor key={t.navn} forsink={i * 90}>
              <Kort pad="0" style={{ overflow: "hidden" }}>
                <Foto src={t.foto} alt={t.alt} hoyde={mobile ? 170 : 190} />
                <div style={{ padding: "18px 20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, letterSpacing: "-0.02em" }}>
                      {t.navn}
                    </span>
                    <MikroMeta icon="clock">{t.varighet}</MikroMeta>
                  </div>
                  <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "9px 0 0" }}>{t.d}</p>
                </div>
              </Kort>
            </Avslor>
          ))}
        </div>

        <Avslor forsink={120}>
          <div style={{ marginTop: 26 }}>
            <Caps>Fast oppfølging</Caps>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap, marginTop: 16 }}>
              {PAKKER.map((p) => (
                <Kort key={p.navn} tint={p.frem} pad="24px 24px 26px">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 21, color: T.fg, letterSpacing: "-0.02em" }}>
                      {p.navn}
                    </span>
                    {p.frem && <StatusPill>Mest valgt</StatusPill>}
                  </div>
                  <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.lime, display: "block", marginTop: 8 }}>
                    {p.okter}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
                    {p.pkt.map((x) => (
                      <Punkt key={x}>{x}</Punkt>
                    ))}
                  </div>
                </Kort>
              ))}
            </div>
            <div style={{ marginTop: T.gap, maxWidth: 640 }}>
              <HjelpNote tittel="Hva er en coaching-pakke?">
                Antall økter med coach per måned, ikke et app-nivå. Appen PlayerHQ er den samme for alle, og
                er inkludert uten månedspris så lenge du har pakke. Pris avtales i samtalen, den avhenger av
                opplegg og reisevei.
              </HjelpNote>
            </div>
          </div>
        </Avslor>
      </Seksjon>

      {/* ═══ 3. PlayerHQ — klebrig scene med ekte app-skjermer ═══ */}
      {mobile ? (
        <Seksjon mobile style={{ paddingTop: 0 }}>
          <Avslor>
            <Caps>PlayerHQ · inkludert</Caps>
            <div style={{ marginTop: 14 }}>
              <SeksT mobile em="i lomma">
                Coachen din
              </SeksT>
            </div>
            <Lede style={{ marginTop: 14 }}>
              Planen, tallene og øktene ligger i appen mellom timene. Dette er skjermene slik de faktisk ser
              ut.
            </Lede>
          </Avslor>
          <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 28 }}>
            {STEG.map((s, i) => {
              const Skjermbilde = SKJERMER[i];
              return (
                <Avslor key={s.caps}>
                  <Caps size={9}>{s.caps}</Caps>
                  <div style={{ marginTop: 8, fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg, letterSpacing: "-0.02em" }}>
                    {s.t} <em style={{ fontStyle: "italic", color: T.lime }}>{s.em}</em>
                  </div>
                  <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "8px 0 16px" }}>{s.d}</p>
                  {/* Ekte app-ramme, skalert ned så 390px-skjermen får plass. */}
                  <div style={{ overflow: "hidden", borderRadius: 28 }}>
                    <div style={{ transform: "scale(0.82)", transformOrigin: "top left", width: 390, marginBottom: -140 }}>
                      <Skjerm mobile aktiv={i === 0 ? "hjem" : i === 1 ? "plan" : "analyse"}>
                        <Skjermbilde />
                      </Skjerm>
                    </div>
                  </div>
                </Avslor>
              );
            })}
          </div>
        </Seksjon>
      ) : (
        <div ref={sceneRef} style={{ position: "relative" }}>
          <Seksjon mobile={false} style={{ paddingTop: 0, paddingBottom: 0 }}>
            <Avslor>
              <Caps>PlayerHQ · inkludert i coaching-pakken</Caps>
              <div style={{ marginTop: 14, maxWidth: 620 }}>
                <SeksT mobile={false} em="i lomma">
                  Coachen din
                </SeksT>
                <Lede style={{ marginTop: 14 }}>
                  Planen, tallene og øktene ligger i appen mellom timene. Skjermene under er bygget av de
                  samme komponentene som portalen kjører på — dette er appen, ikke en tegning av den.
                </Lede>
              </div>
            </Avslor>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 390px", gap: 64, marginTop: 40, alignItems: "start" }}>
              {/* Tekstspalten ruller */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {STEG.map((s, i) => {
                  const paa = i === aktivt;
                  return (
                    <div
                      key={s.caps}
                      style={{
                        minHeight: "58vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        opacity: paa ? 1 : 0.34,
                        transition: "opacity 420ms cubic-bezier(0.2,0.7,0.2,1)",
                        borderLeft: `2px solid ${paa ? T.lime : T.border}`,
                        paddingLeft: 22,
                      }}
                    >
                      <Caps size={9}>{s.caps}</Caps>
                      <div style={{ marginTop: 10, fontFamily: T.disp, fontWeight: 700, fontSize: 34, color: T.fg, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                        {s.t} <em style={{ fontStyle: "italic", color: T.lime }}>{s.em}</em>
                      </div>
                      <p style={{ fontFamily: T.ui, fontSize: 15, color: T.fg2, lineHeight: 1.65, margin: "12px 0 0", maxWidth: 420 }}>{s.d}</p>
                    </div>
                  );
                })}
              </div>

              {/* Telefonen står stille */}
              <div className="m-klebrig" style={{ width: 390 }}>
                <div style={{ transform: "scale(0.86)", transformOrigin: "top center" }}>
                  <Skjerm mobile aktiv={aktivt === 0 ? "hjem" : aktivt === 1 ? "plan" : "analyse"}>
                    <AktivSkjerm />
                  </Skjerm>
                </div>
              </div>
            </div>
          </Seksjon>
        </div>
      )}

      {/* ═══ 4. AK Golf Intelligence ═══ */}
      <Seksjon mobile={mobile}>
        <Avslor>
          <Caps>AK Golf Intelligence</Caps>
          <div style={{ marginTop: 14, maxWidth: 620 }}>
            <SeksT mobile={mobile} em="mot de beste">
              Se hvor du står
            </SeksT>
            <Lede style={{ marginTop: 14 }}>
              Tallene dine måles mot PGA Tour-baselinen og mot norsk nivå, i samme enhet: slag. Da blir
              «bli bedre på nærspill» til «du taper 1,2 slag per runde der, og det er den største enkeltposten».
            </Lede>
          </div>
        </Avslor>

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.1fr 1fr", gap: T.gap, marginTop: 26, alignItems: "start" }}>
          <Avslor>
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              {/* Kanonisk divergerende SG-graf (v2 `SgKategorier`): streken i midten
                  ER baselinen, stolpe til venstre = tapte slag, til høyre = vunne. */}
              <SgKategorier
                baseline="PGA Tour-baseline"
                hjelp="sgOmrade"
                kategorier={[
                  { akse: "OTT", sg: 0.4 },
                  { akse: "APP", sg: 0.3 },
                  { akse: "ARG", sg: -1.2 },
                  { akse: "PUTT", sg: -0.5 },
                ]}
              />
              <InnsiktChip cta="Slik regnes SG" href="/stats/sg-sammenlign">
                Streken i midten er baselinen. Stolpe til venstre betyr tapte slag der.
              </InnsiktChip>
            </div>
          </Avslor>

          <Avslor forsink={120}>
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              <Kort eyebrow="Hva du kan sammenligne">
                <Rad leading={<Icon name="trophy" size={16} style={{ color: T.lime }} />} title="Mot PGA Tour" sub="DataGolf-baseline per del av spillet" />
                <Rad leading={<Icon name="users" size={16} style={{ color: T.lime }} />} title="Mot norsk nivå" sub="Snittet i din årgang og kategori" />
                <Rad leading={<Icon name="trending-up" size={16} style={{ color: T.lime }} />} title="Mot deg selv" sub="Utviklingen din gjennom sesongen" last />
              </Kort>
              <HjelpNote tittel="Hvor kommer tallene fra?">
                Rundene du logger, TrackMan-øktene og turneringsresultatene dine. Ingenting gjettes: mangler
                grunnlaget, står det «mangler» i stedet for et tall.
              </HjelpNote>
              <div>
                <MCta ghost href="/stats/sg-sammenlign" icon="arrow-right">
                  Prøv SG-sammenligningen
                </MCta>
              </div>
            </div>
          </Avslor>
        </div>
      </Seksjon>

      {/* ═══ 5. Bevis ═══ */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 12 : 24, paddingBottom: mobile ? 12 : 24 }}>
        <Avslor>
          <div
            style={{
              borderTop: `1px solid ${T.border}`,
              borderBottom: `1px solid ${T.border}`,
              padding: mobile ? "26px 0" : "32px 0",
              display: "flex",
              flexDirection: mobile ? "column" : "row",
              alignItems: mobile ? "flex-start" : "center",
              gap: mobile ? 22 : 0,
            }}
          >
            <span style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, flex: 1, paddingRight: 24 }}>
              Brukt av spillere fra junior til aspirerende Tour.
            </span>
            <div style={{ display: "flex", gap: mobile ? 28 : 48 }}>
              {BEVIS.map((b) => (
                <span key={b.l}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: T.mono,
                      fontSize: 26,
                      fontWeight: 700,
                      color: T.fg,
                      letterSpacing: "-0.02em",
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.v}
                  </span>
                  <Caps size={8.5} style={{ marginTop: 5 }}>
                    {b.l}
                  </Caps>
                </span>
              ))}
            </div>
          </div>
        </Avslor>
      </Seksjon>

      {/* ═══ 6. Slutt-CTA ═══ */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 36 : 64 }}>
        <Avslor>
          <Kort tint pad={mobile ? "26px 22px" : "36px 40px"}>
            <div
              style={{
                display: "flex",
                flexDirection: mobile ? "column" : "row",
                alignItems: mobile ? "flex-start" : "center",
                gap: 20,
              }}
            >
              <div style={{ flex: 1 }}>
                <SeksT mobile={mobile} em="samtale">
                  Start med en
                </SeksT>
                <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 480 }}>
                  Uforpliktende prat om spillet ditt og hva du vil oppnå. Så finner vi opplegget som passer.
                </p>
              </div>
              <MCta href="/booking" icon="arrow-right">
                Book en samtale
              </MCta>
            </div>
          </Kort>

          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6, margin: "18px 0 0", textAlign: mobile ? "left" : "center" }}>
            Vil du bare prøve appen først?{" "}
            <Link href="/playerhq" className="v2-tekstlenke v2-focus" style={{ color: T.fg2, fontWeight: 600 }}>
              Se PlayerHQ
            </Link>
          </p>
        </Avslor>
      </Seksjon>
    </MRamme>
  );
}
