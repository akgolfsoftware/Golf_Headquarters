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
import { T } from "@/lib/v2/tokens";
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
    borderRadius: T.rCard,
    border: `1px solid ${fylt ? T.cta : T.border}`,
    background: fylt ? T.cta : "transparent",
    color: fylt ? T.onCta : T.fg,
    fontFamily: T.ui,
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
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Topp — fasit: «Teknisk plan» + sub, nøytral Rediger-knapp */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, minWidth: 0 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>
            Teknisk plan
          </h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
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
            background: T.panel2,
            border: `1px dashed ${T.border}`,
            borderRadius: T.rCard,
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
            Ingen fokusområder ennå
          </h3>
          <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
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
              borderRadius: T.rCard,
              border: "none",
              background: T.handling,
              color: T.onHandling,
              fontFamily: T.ui,
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
                background: T.handlingSoft,
                border: `1px solid ${T.border}`,
                borderRadius: T.rCard,
                padding: 16,
              }}
            >
              <Caps>Én ting nå</Caps>
              <h3 style={{ margin: "8px 0", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
                Neste tekniske fokus:{" "}
                <span style={{ fontFamily: T.mono }}>{enTing.pNummer}</span> · {enTing.navn}
              </h3>
              <p style={{ margin: "0 0 16px", fontFamily: T.bodyFont, fontSize: 14, color: T.mut, maxWidth: "52ch" }}>
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
                  borderRadius: T.rCard,
                  background: T.handling,
                  color: T.onHandling,
                  fontFamily: T.ui,
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
              background: T.panel,
              border: `1px solid ${T.border}`,
              borderRadius: T.rCard,
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
                    borderBottom: i < planKort.length - 1 ? `1px solid ${T.borderS}` : undefined,
                    fontFamily: T.ui,
                    fontSize: 13,
                    color: T.fg,
                  }}
                >
                  <span style={{ minWidth: 0 }}>{label}</span>
                  <span style={{ marginLeft: "auto", fontFamily: T.mono, textAlign: "right", minWidth: 0 }}>
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
                      border: `1px solid ${T.border}`,
                      borderRadius: T.rCard,
                      padding: "12px 16px",
                      marginBottom: 8,
                      background: T.panel,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.handling, fontWeight: 600 }}>
                        {f.pNummer}
                      </span>
                      {f.hovedfokus && (
                        <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          hovedfokus
                        </span>
                      )}
                    </div>
                    <span style={{ display: "block", fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, marginTop: 2 }}>
                      {f.navn}
                    </span>
                    {f.beskrivelse && (
                      <span style={{ display: "block", fontFamily: T.bodyFont, fontSize: 12.5, color: T.mut, marginTop: 4 }}>
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
                            background: T.track,
                            borderRadius: T.rPill,
                            overflow: "hidden",
                            marginTop: 12,
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              height: "100%",
                              width: `${pct}%`,
                              background: T.mut,
                              borderRadius: T.rPill,
                            }}
                          />
                        </span>
                        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 4 }}>
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
            style={{ border: `1px solid ${T.border}`, borderRadius: T.rCard }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 44,
                padding: "0 16px",
                cursor: "pointer",
                listStyle: "none",
                fontFamily: T.ui,
                fontSize: 12.5,
                fontWeight: 500,
                color: T.mut,
              }}
            >
              Hvorfor disse fremdriftstallene
            </summary>
            <ul
              style={{
                margin: 0,
                padding: "12px 16px 16px 24px",
                fontFamily: T.bodyFont,
                fontSize: 13,
                color: T.mut,
                borderTop: `1px solid ${T.border}`,
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
