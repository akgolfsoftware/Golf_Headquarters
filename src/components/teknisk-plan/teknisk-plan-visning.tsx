"use client";

/**
 * PlayerHQ · Teknisk plan — Paper-lesevisning (fase2/W1).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-teknisk-plan.html.
 *
 * Vedtak Anders 11.08.2026: BEHOLD ALT bak nytt design. Lesevisningen er
 * førsteinntrykket (Én ting nå → plankort → fokusliste med MORAD
 * P-posisjoner → why-details); HELE dagens verktøykasse (oppgave-CRUD,
 * fullsving-shell, logReps, sidebar) ligger uendret bak den nøytrale
 * «Rediger planen»-knappen — ett trykk unna, ingenting fjernet.
 *
 * All data kommer serialisert fra serveren; redigeringsinnholdet kommer
 * server-rendret som ReactNode. Ingenting fabrikkeres her.
 */

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Pencil, BookOpen } from "lucide-react";
import { TL } from "@/lib/v2/train-lock";

import { Caps } from "@/components/v2";

export type FokusLes = {
  id: string;
  /** MORAD P-posisjon, P1.0–P10.0 — aldri forenklet. */
  pNummer: string;
  navn: string;
  /** Oppgavetitlene i området — null når posisjonen ikke har oppgaver. */
  beskrivelse: string | null;
  /** Reps logget / reps-mål (ærlig enhet — planen måles i reps, ikke økter). */
  gjort: number;
  av: number;
  hovedfokus: boolean;
};

export type EnTingLes = {
  pNummer: string;
  navn: string;
  tekst: string;
  ctaLabel: string;
  ctaHref: string;
};

function knappStil(fylt: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    padding: "0 16px",
    borderRadius: TL.radius.card,
    border: `1px solid ${fylt ? TL.fill : TL.hair}`,
    background: fylt ? TL.fill : "transparent",
    color: fylt ? TL.onFill : TL.text,
    fontFamily: TL.font.sans,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
  };
}

export function TekniskPlanVisning({
  tittelSub,
  enTing,
  planKort,
  fokus,
  whyPunkter,
  rediger,
}: {
  tittelSub: string;
  enTing: EnTingLes | null;
  planKort: [string, string][];
  fokus: FokusLes[];
  whyPunkter: string[];
  rediger: ReactNode;
}) {
  const [modus, setModus] = useState<"les" | "rediger">("les");

  if (modus === "rediger") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            data-od-id="tek-til-lesevisning"
            className="v2-press v2-focus"
            onClick={() => setModus("les")}
            style={knappStil(false)}
          >
            <BookOpen size={16} strokeWidth={1.7} aria-hidden />
            Til lesevisning
          </button>
        </div>
        {rediger}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Topp — fasit: «Teknisk plan» + sub, nøytral Rediger-knapp */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, minWidth: 0 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>
            Teknisk plan
          </h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
            {tittelSub}
          </span>
        </div>
        <button
          type="button"
          data-od-id="tek-rediger"
          className="v2-press v2-focus"
          onClick={() => setModus("rediger")}
          style={knappStil(false)}
        >
          <Pencil size={16} strokeWidth={1.7} aria-hidden />
          Rediger planen
        </button>
      </div>

      {fokus.length === 0 ? (
        /* Tom tilstand — planen har ingen fokusområder ennå. Veien videre er
           redigeringsverktøyet (ekte handling — aldri en død knapp). */
        <div
          style={{
            padding: "24px 16px",
            background: TL.dock,
            border: `1px dashed ${TL.hair}`,
            borderRadius: TL.radius.card,
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
            Ingen fokusområder ennå
          </h3>
          <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
            Planen er opprettet, men har ingen P-posisjoner med oppgaver. Den bygges vanligvis
            etter en svinganalyse — be coachen om en, eller legg inn første oppgave selv.
          </p>
          {/* Kontrakt §3: i tom tilstand er redigeringen veien videre — ett trykk. */}
          <button
            type="button"
            data-od-id="tek-tom-rediger"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            onClick={() => setModus("rediger")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              width: "100%",
              borderRadius: TL.radius.card,
              border: "none",
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Legg inn første oppgave
          </button>
        </div>
      ) : (
        <>
          {/* Én ting nå — fokuset med størst gjenstående arbeid */}
          {enTing && (
            <div
              style={{
                background: TL.dim,
                border: `1px solid ${TL.hair}`,
                borderRadius: TL.radius.card,
                padding: 16,
              }}
            >
              <Caps>Én ting nå</Caps>
              <h3 style={{ margin: "8px 0", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                Neste tekniske fokus:{" "}
                <span style={{ fontFamily: TL.font.mono }}>{enTing.pNummer}</span> · {enTing.navn}
              </h3>
              <p style={{ margin: "0 0 16px", fontFamily: TL.font.sans, fontSize: 14, color: TL.mute, maxWidth: "52ch" }}>
                {enTing.tekst}
              </p>
              {/* Kontrakt §3: skjermens ene aksenthandling. */}
              <Link
                href={enTing.ctaHref}
                data-od-id="tek-neste-okt"
                data-paper-en-ting="true"
                className="v2-press v2-focus"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 56,
                  width: "100%",
                  borderRadius: TL.radius.card,
                  background: TL.fill,
                  color: TL.onFill,
                  fontFamily: TL.font.sans,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {enTing.ctaLabel}
              </Link>
            </div>
          )}

          {/* Plankort */}
          <div
            style={{
              background: TL.elev,
              border: `1px solid ${TL.hair}`,
              borderRadius: TL.radius.card,
              padding: 16,
            }}
          >
            <Caps>planen</Caps>
            <div style={{ marginTop: 4 }}>
              {planKort.map(([label, verdi], i) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    padding: "8px 0",
                    borderBottom: i < planKort.length - 1 ? `1px solid ${TL.hair}` : undefined,
                    fontFamily: TL.font.sans,
                    fontSize: 13,
                    color: TL.text,
                  }}
                >
                  <span style={{ minWidth: 0 }}>{label}</span>
                  <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, textAlign: "right", minWidth: 0 }}>
                    {verdi}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fokusliste — MORAD P-posisjoner */}
          <div>
            <Caps>fokusområder · P-posisjoner</Caps>
            <div style={{ marginTop: 8 }}>
              {fokus.map((f) => {
                const pct = f.av > 0 ? Math.min(100, Math.round((f.gjort / f.av) * 100)) : 0;
                return (
                  <div
                    key={f.id}
                    style={{
                      border: `1px solid ${TL.hair}`,
                      borderRadius: TL.radius.card,
                      padding: "12px 16px",
                      marginBottom: 8,
                      background: TL.elev,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                      <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.fill, fontWeight: 600 }}>
                        {f.pNummer}
                      </span>
                      {f.hovedfokus && (
                        <span style={{ fontFamily: TL.font.mono, fontSize: 9.5, color: TL.mute, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          hovedfokus
                        </span>
                      )}
                    </div>
                    <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text, marginTop: 2 }}>
                      {f.navn}
                    </span>
                    {f.beskrivelse && (
                      <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, marginTop: 4 }}>
                        {f.beskrivelse}
                      </span>
                    )}
                    {f.av > 0 && (
                      <>
                        <span
                          aria-hidden
                          style={{
                            display: "block",
                            height: 6,
                            background: TL.hair,
                            borderRadius: TL.radius.pill,
                            overflow: "hidden",
                            marginTop: 12,
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              height: "100%",
                              width: `${pct}%`,
                              background: TL.mute,
                              borderRadius: TL.radius.pill,
                            }}
                          />
                        </span>
                        <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 4 }}>
                          {f.gjort.toLocaleString("nb-NO")} av {f.av.toLocaleString("nb-NO")} reps
                          {f.gjort >= f.av ? " · fullført" : ""}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hvorfor disse fremdriftstallene */}
          <details
            data-od-id="tek-why"
            style={{ border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 44,
                padding: "0 16px",
                cursor: "pointer",
                listStyle: "none",
                fontFamily: TL.font.sans,
                fontSize: 12.5,
                fontWeight: 500,
                color: TL.mute,
              }}
            >
              Hvorfor disse fremdriftstallene
            </summary>
            <ul
              style={{
                margin: 0,
                padding: "12px 16px 16px 24px",
                fontFamily: TL.font.sans,
                fontSize: 13,
                color: TL.mute,
                borderTop: `1px solid ${TL.hair}`,
              }}
            >
              {whyPunkter.map((p) => (
                <li key={p} style={{ marginBottom: 8 }}>
                  {p}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  );
}
