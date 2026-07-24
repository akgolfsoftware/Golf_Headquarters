"use client";

/**
 * Marketing — Forside v2 (akgolf.no, retning C «Presis», mørk-først).
 *
 * COACHING-FØRST (Anders' beslutning 2026-07-24): forsiden selger coaching, ikke
 * appen. Rekkefølgen er kjøpsreisen: hvem coachen er → hvordan vi jobber →
 * hva du får (pakkene) → verktøyet som følger med (PlayerHQ) → bevis → book.
 * PlayerHQ er nå STØTTEARGUMENT for coachingen, ikke hovedproduktet på denne
 * flaten; app-sporet lever videre på /playerhq og i nav-CTA-en.
 *
 * Én primær handling på hele siden: «Book en samtale» (→ /booking). Alt annet
 * er ghost eller stille tekstlenke (enkelhets-regelen, FASIT §3).
 *
 * Chrome (MNav/MFot/MRamme) og marketing-idiomene kommer fra den DELTE
 * `./marked-ramme` — denne fila hadde tidligere sin egen kopi av hele rammen,
 * som drev fra de andre markedssidene. Ingen V2Shell: en uinnlogget besøkende
 * har ikke app-navigasjon.
 *
 * Copy: `docs/skjermtekst/skjerm-tekst-hovedskjermer.md` (M1 bevis-linje + M3
 * coaching) og den godkjente teksten som allerede står på /coaching — ingenting
 * er diktet opp her. Kanon-coach på markedsflater: Markus Røinås Pedersen.
 * Priser nevnes ikke for coaching: pakke = antall økter, aldri app-nivå.
 * Kun T.*-tokens + rgba/color-mix (ingen rå hex). Norsk bokmål æøå.
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
import { T } from "@/lib/v2/tokens";
import {
  Icon,
  Caps,
  Kort,
  StatusPill,
  AvatarInit,
  TallHero,
  Trend,
  FordelingRad,
  InnsiktChip,
} from "@/components/v2";

/* ── Lokale, side-spesifikke idiomer ───────────────────── */

/** Sjekkpunkt i en pakke-liste. */
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

/** Coach-portrett i hero. Ekte foto finnes i public/images/akademy. */
function CoachFoto({ navn, src, mobile }: { navn: string; src: string; mobile: boolean }) {
  return (
    <div
      style={{
        width: mobile ? "100%" : 380,
        height: mobile ? 280 : 440,
        flex: "none",
        borderRadius: 24,
        border: `1px solid ${T.borderS}`,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={navn} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

/* ── Innhold ───────────────────────────────────────────── */

/** Slik jobber vi — tre steg, kjøpsreisen i klarspråk. */
const STEG: { i: string; t: string; d: string }[] = [
  {
    i: "message-circle",
    t: "Vi starter med en samtale",
    d: "Uforpliktende prat om spillet ditt og hva du vil oppnå. Så finner vi opplegget som passer.",
  },
  {
    i: "bar-chart",
    t: "Vi måler før vi mener",
    d: "Strokes gained viser hvor slagene faktisk forsvinner. Coachen bygger planen på tallene dine, ikke på magefølelse.",
  },
  {
    i: "calendar",
    t: "Vi følger deg mellom øktene",
    d: "Planen ligger i PlayerHQ og oppdateres etter hver økt og runde. Du har meldingskontakt med coachen hele veien.",
  },
];

/** Coaching-pakker — antall økter per måned. Aldri app-nivåer, aldri pris her. */
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

export function MarkedForsideV2() {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="hjem" cta={{ label: "Book en samtale", href: "/booking" }}>
      {/* ── Hero: coachen først, én primær handling ── */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 36 : 56 }}>
        <div
          style={{
            display: "flex",
            flexDirection: mobile ? "column" : "row",
            gap: mobile ? 32 : 56,
            alignItems: mobile ? "stretch" : "center",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow>AK Golf · Coaching</Eyebrow>
            <HeroT mobile={mobile} em="fremgang">
              Coaching som gir
            </HeroT>
            <Lede style={{ marginTop: 22 }}>
              Personlig oppfølging bygget på data, ikke magefølelse. Du får faste økter med din egen coach,
              en plan som lever mellom øktene, og tall som viser at det virker.
            </Lede>

            {/* Coachen som ansikt på løftet */}
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
          </div>

          <CoachFoto navn="Markus Røinås Pedersen" src="/images/akademy/coach-observerer.jpg" mobile={mobile} />
        </div>
      </Seksjon>

      {/* ── Slik jobber vi ── */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Slik jobber vi</Caps>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
            gap: T.gap,
            marginTop: 18,
          }}
        >
          {STEG.map((s, i) => (
            <Kort key={s.t} tint={i === 0} pad="22px 22px 24px">
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(209,248,67,0.10)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon name={s.i} size={18} style={{ color: T.lime }} />
              </span>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, letterSpacing: "-0.02em" }}>
                {s.t}
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "9px 0 0" }}>{s.d}</p>
            </Kort>
          ))}
        </div>
      </Seksjon>

      {/* ── Pakkene: hva du faktisk får ── */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Coaching-pakker</Caps>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap, marginTop: 18 }}>
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
            Antall økter med coach per måned, ikke et app-nivå. Appen PlayerHQ er den samme for alle, og er
            inkludert uten månedspris så lenge du har pakke. Pris avtales i samtalen, den avhenger av opplegg
            og reisevei.
          </HjelpNote>
        </div>
      </Seksjon>

      {/* ── Verktøyet coachen jobber i (PlayerHQ som støtte, ikke hovedsak) ── */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 560 }}>
          <Caps>Verktøyet følger med</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile} em="samme tallene">
              Du og coachen ser
            </SeksT>
          </div>
          <Lede style={{ marginTop: 14 }}>
            Strokes gained viser hvor du taper slag. Planen prioriterer det som koster mest. Alt ligger i
            PlayerHQ, som er inkludert i coaching-pakken.
          </Lede>
        </div>

        <div
          style={{
            marginTop: 26,
            padding: 1.5,
            borderRadius: 24,
            background: `linear-gradient(140deg, ${T.lime} 0%, rgba(209,248,67,0.06) 30%, rgba(0,88,64,0.7) 100%)`,
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              background: T.bg,
              borderRadius: 23,
              padding: mobile ? "16px 14px" : "24px 26px",
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "1.4fr 1fr",
              gap: 14,
            }}
          >
            <Kort tint eyebrow="Strokes gained · siste 4 runder">
              <TallHero value="+1,8" unit="SG totalt" delta="+0,6" dir="up" size={mobile ? 40 : 52} accent hjelp="sgTotal" />
              <div style={{ marginTop: 16 }}>
                <Trend series={[-0.4, 0.2, -0.1, 0.8, 0.6, 1.2, 1.8]} height={mobile ? 70 : 88} xLabels={["MAI", "JUN", "JUL"]} />
              </div>
            </Kort>
            {!mobile && (
              <Kort eyebrow="Størst gevinst å hente">
                <div>
                  <FordelingRad signal code="NÆR" pct={64} value="−1,2" neg />
                  <FordelingRad signal code="PUTT" pct={38} value="−0,5" neg />
                  <FordelingRad signal code="INN" pct={22} value="+0,3" />
                  <FordelingRad signal code="TEE" pct={18} value="+0,4" last />
                </div>
                <div style={{ marginTop: 12 }}>
                  <InnsiktChip cta="Se planen" href="/playerhq">
                    Nærspill koster deg mest. Planen din prioriterer det nå.
                  </InnsiktChip>
                </div>
              </Kort>
            )}
          </div>
        </div>
      </Seksjon>

      {/* ── Bevis ── */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 12 : 24, paddingBottom: mobile ? 12 : 24 }}>
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
      </Seksjon>

      {/* ── Slutt-CTA: samme ene handling som i heroen ── */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 36 : 64 }}>
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

        {/* Stille sidevei for de som bare vil prøve appen — aldri en andre primær. */}
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6, margin: "18px 0 0", textAlign: mobile ? "left" : "center" }}>
          Vil du bare prøve appen først?{" "}
          <Link href="/playerhq" className="v2-tekstlenke v2-focus" style={{ color: T.fg2, fontWeight: 600 }}>
            Se PlayerHQ
          </Link>
        </p>
      </Seksjon>
    </MRamme>
  );
}
