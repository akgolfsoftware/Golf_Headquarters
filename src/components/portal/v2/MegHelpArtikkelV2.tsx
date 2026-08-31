"use client";
import { TL } from "@/lib/v2/train-lock";
import { AK } from "@/lib/v2/ak-palett";

/**
 * PlayerHQ Meg · Hjelp · Artikkel — v2 Presis + B-pakke (klarspråk, T.* only).
 */

import { useState } from "react";
import Link from "next/link";
import { Caps, Kort, Icon, AkseBar, InnsiktChip, AvatarInit, MikroMeta, AKSE_NAVN } from "@/components/v2";
import type { AkseKey } from "@/lib/v2/format";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type ArtikkelToc = { id: string; tittel: string };

export type MegHelpArtikkelData = {
  eyebrow: string;
  tittelLead: string;
  tittelItalic: string;
  forfatter: { initialer: string; navn: string; rolle: string };
  oppdatert: string;
  lesetid: number;
  toc: ArtikkelToc[];
};

/* ── Lokale subkomponenter (før: del-knapp.tsx + feedback.tsx) ─────── */

function DelKnapp({ tittel }: { tittel: string }) {
  const [kopiert, setKopiert] = useState(false);

  async function del() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: tittel, url });
        return;
      } catch {
        // Bruker avbrøt deling, eller share feilet — fall tilbake til clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 2000);
    } catch {
      // Clipboard utilgjengelig (f.eks. usikker kontekst) — ingen handling.
    }
  }

  return (
    <button
      type="button"
      onClick={del}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: "pointer",
        marginLeft: "auto",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "transparent",
        border: "none",
        padding: 0,
        fontFamily: TL.font.sans,
        fontSize: 12,
        fontWeight: 600,
        color: TL.fill,
      }}
    >
      <Icon name={kopiert ? "check" : "copy"} size={12} />
      {kopiert ? "Lenke kopiert" : "Del"}
    </button>
  );
}

function ArtikkelFeedback() {
  const [takket, setTakket] = useState(false);

  if (takket) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: TL.font.sans,
          fontSize: 13,
          fontWeight: 600,
          color: TL.fill,
          background: `color-mix(in srgb, ${TL.fill} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${TL.fill} 35%, transparent)`,
          borderRadius: 9999,
          padding: "9px 16px",
        }}
      >
        <Icon name="check" size={14} />
        Takk for tilbakemeldingen!
      </span>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <span onClick={() => setTakket(true)}>
        <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, minHeight: 56,
          }}>Ja, fikk svar</span>
      </span>
      <span onClick={() => setTakket(true)}>
        <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, minHeight: 56,
          }}>Nei, savner noe</span>
      </span>
    </div>
  );
}

/* ── Prose-byggeklosser ────────────────────────────────────────────── */

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 21, letterSpacing: "-0.015em", color: TL.text, margin: "26px 0 0", scrollMarginTop: 24 }}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 15.5, color: TL.text, margin: "18px 0 0" }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: TL.font.sans, fontSize: 14, lineHeight: 1.7, color: TL.mute, margin: "10px 0 0" }}>
      {children}
    </p>
  );
}

function Kode({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.text, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 5, padding: "1px 5px" }}>
      {children}
    </code>
  );
}

/* Pyramide-figuren — redaksjonelt eksempel (ideal-fordeling). Lagene bruker
   kanon-aksefargene (AK.ax); etikettene ligger i en legende under figuren så
   kontrasten holder i både lys og mørk modus. */
const PYRAMIDE_LAG: { a: AkseKey; pct: number; points: string }[] = [
  { a: "FYS", pct: 15, points: "40,200 320,200 290,165 70,165" },
  { a: "TEK", pct: 28, points: "70,165 290,165 264,130 96,130" },
  { a: "SLAG", pct: 32, points: "96,130 264,130 238,95 122,95" },
  { a: "SPILL", pct: 17, points: "122,95 238,95 212,60 148,60" },
  { a: "TURN", pct: 8, points: "148,60 212,60 180,20" },
];

function PyramideFigur() {
  return (
    <Kort style={{ margin: "18px 0 0" }}>
      <svg viewBox="0 0 360 220" style={{ width: "100%", maxWidth: 420, height: "auto", margin: "0 auto", display: "block" }}>
        {PYRAMIDE_LAG.map((l) => (
          <polygon key={l.a} points={l.points} fill={AK.ax[l.a]} opacity={0.9} />
        ))}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 14px", marginTop: 12 }}>
        {PYRAMIDE_LAG.map((l) => (
          <span key={l.a} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 700, color: TL.mute }}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: AK.ax[l.a] }} />
            {AKSE_NAVN[l.a]} · {l.pct}%
          </span>
        ))}
      </div>
      <Caps size={9} style={{ textAlign: "center", marginTop: 10 }}>
        Pyramiden ideal-fordelt — mai 2026, A1-spiller (eksempel)
      </Caps>
    </Kort>
  );
}

/* Ukefordeling — redaksjonelt eksempel fra kildeskjermen. */
const UKE_FORDELING: { a: AkseKey; pct: number; target: number }[] = [
  { a: "TURN", pct: 8, target: 10 },
  { a: "SPILL", pct: 17, target: 15 },
  { a: "SLAG", pct: 32, target: 30 },
  { a: "TEK", pct: 28, target: 30 },
  { a: "FYS", pct: 15, target: 15 },
];

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegHelpArtikkelV2({ data }: { data: MegHelpArtikkelData }) {
  return (
    <div data-paper-wave-g="meghelpartikkel" data-paper-pattern  data-paper-portal-meg-help-artikkel className="grid grid-cols-1 lg:grid-cols-[1fr_220px]" style={{ gap: 16 * 2, alignItems: "start", maxWidth: 960, margin: "0 auto", width: "100%"}}>
      <article style={{ maxWidth: 720, minWidth: 0 }}>
        {/* Hode */}
        <Caps>{data.eyebrow}</Caps>
        <h1 style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 32, letterSpacing: "-0.025em", color: TL.text, margin: "10px 0 0", lineHeight: 1.1 }}>
          {data.tittelLead}{" "}
          <em style={{ fontStyle: "italic", fontWeight: 400, color: TL.fill }}>{data.tittelItalic}</em>?
        </h1>

        {/* Byline */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, borderTop: `1px solid ${TL.hair}`, borderBottom: `1px solid ${TL.hair}`, padding: "12px 0", marginTop: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <AvatarInit navn={data.forfatter.navn} size={32} />
            <span>
              <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 600, color: TL.text }}>{data.forfatter.navn}</span>
              <Caps size={8.5}>{data.forfatter.rolle}</Caps>
            </span>
          </span>
          <MikroMeta icon="clock">{data.lesetid} min lesetid</MikroMeta>
          <MikroMeta icon="calendar">Oppdatert {data.oppdatert}</MikroMeta>
          <DelKnapp tittel={`${data.tittelLead} ${data.tittelItalic}?`} />
        </div>

        {/* Brødtekst — redaksjonelt innhold, 1:1 fra kildeskjermen */}
        <H2 id="h1">Hvorfor en pyramide?</H2>
        <P>
          Pyramide-systemet er måten vi i AK Golf tenker om{" "}
          <strong style={{ color: TL.text }}>hvor tid brukes</strong> over en treningsuke. I bunnen
          ligger <Kode>FYS</Kode> og <Kode>TEK</Kode> — basisen for alt. Lenger opp kommer{" "}
          <Kode>SLAG</Kode>, <Kode>SPILL</Kode> og til toppen <Kode>TURN</Kode> — alt som er
          turneringsspesifikt mentalt og taktisk.
        </P>
        <P>
          Hvis du legger 80% av tida på toppen og lar bunnen forfalle, spiller du oppå et grunnlag
          som smuldrer. Hvis du legger 100% i bunnen blir du sterk og solid — men aldri
          turneringsklar.
        </P>

        <PyramideFigur />

        <H2 id="h2">De fem disiplinene</H2>
        <P>Hver disiplin har sin egen rolle i bygget.</P>

        <H3>FYS · Fysisk</H3>
        <P>
          Beinbøy, hofterotasjon, core-stabilitet, mobilitet i overkropp. Bunnen — kapasiteten du
          har <em>under</em> svingen.
        </P>

        <H3>TEK · Teknikk</H3>
        <P>
          Bevegelse, impact, biomekanikk. Drillene her bruker som regel <em>ikke</em> ball — eller
          bruker ball i kontrollerte settings.
        </P>

        <H3>SLAG · Slag-trening</H3>
        <P>
          Når du faktisk slår ball mot et resultat. Approach-distanser, putting-pace, chip-landing,
          bunker-pop.
        </P>

        <H3>SPILL · Bane-spill</H3>
        <P>På bane, ikke på range. 9-hulls simuleringer, par-3-blokker, scoring-konkurranser.</P>

        <H3>TURN · Turneringsspesifikt</H3>
        <P>Mental, taktisk, ritualer. Pre-shot-rutinen. Pust-protokollen mellom hull.</P>

        <H2 id="h3">Slik balanseres uka</H2>
        <P>
          En typisk uke for en A1-spiller fordeler seg på{" "}
          <strong style={{ color: TL.text }}>6–8 økter</strong> totalt.
        </P>

        <Kort style={{ margin: "18px 0 0" }}>
          {UKE_FORDELING.map((p, i) => (
            <AkseBar key={p.a} a={p.a} v={p.pct} m={p.target} max={40} enhet="%" last={i === UKE_FORDELING.length - 1} />
          ))}
          <Caps size={9} style={{ textAlign: "center", marginTop: 10 }}>
            Øyvind, mai 2026 — pyramide-treff 72% (eksempel)
          </Caps>
        </Kort>

        <div style={{ marginTop: 18 }}>
          <InnsiktChip>
            <strong style={{ color: TL.text }}>Tips fra Anders:</strong> Hvis du ser at en uke har 0% i
            én disiplin — det er ikke krise. Men hvis det går 3 uker uten en farge, vil
            pyramide-treffet falle merkbart.
          </InnsiktChip>
        </div>

        <H2 id="h4">Hva skjer når balansen tipper?</H2>
        <P>
          Pyramide-treff under <Kode>60%</Kode> betyr at hovedcoach varsles. Du får da to forslag:
          enten justere planen, eller akseptere midlertidig skjevhet.
        </P>

        {/* Tilbakemelding */}
        <Kort eyebrow="Var dette nyttig?" style={{ marginTop: 26 }}>
          <ArtikkelFeedback />
        </Kort>

        {/* Coach-CTA */}
        <Kort
          style={{
            marginTop: 16,
            background: `linear-gradient(140deg, color-mix(in srgb, ${TL.fill} 55%, ${TL.elev}), ${TL.elev})`,
            border: `1px solid color-mix(in srgb, ${TL.fill} 60%, transparent)`,
          }}
        >
          <Caps size={9}>Fant du ikke svaret?</Caps>
          <h3 style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 20, letterSpacing: "-0.015em", color: TL.text, margin: "8px 0 0" }}>
            Snakk med <em style={{ fontStyle: "italic", fontWeight: 400, color: TL.fill }}>coach direkte</em>
          </h3>
          <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, lineHeight: 1.6, color: TL.mute, margin: "8px 0 0" }}>
            Anders K og resten av coach-teamet svarer innen 4 timer på hverdager. Helt fritt for
            Pro-medlemmer.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            <Link href="/portal/coach/melding/ny" style={{ textDecoration: "none", display: "block" }}>
              <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, minHeight: 56,
          }}>Send melding</span>
            </Link>
            <Link
              href="/portal/meg/abonnement"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
                fontFamily: TL.font.sans,
                fontSize: 12,
                fontWeight: 600,
                color: TL.mute,
                padding: "4px 0",
              }}
            >
              Se abonnement →
            </Link>
          </div>
        </Kort>
      </article>

      {/* Innholdsfortegnelse (desktop) */}
      <aside className="hidden lg:block" style={{ position: "sticky", top: 24, borderLeft: `1px solid ${TL.hair}`, paddingLeft: 16 }}>
        <Caps size={9} style={{ marginBottom: 8 }}>I denne artikkelen</Caps>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {data.toc.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="v2-row-h"
              style={{ display: "block", borderRadius: 8, padding: "6px 8px", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, textDecoration: "none" }}
            >
              {t.tittel}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}
