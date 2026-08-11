"use client";

/**
 * UtenforBanenV2 — PlayerHQ «Utenfor banen» (Paper-port W2, fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-hjem-rest.html.
 *
 * Tre faner (Fysisk · Lag · Utfordringer) med aria-pressed, «Én ting nå» kun
 * når dagens FYS-økt faktisk finnes (aldri fabrikkert), uke-grid med
 * gjort/planlagt/tom-markører og forklar-linje, og ærlig tom tilstand per
 * fasit («Ingenting aktivt utenfor banen» → skriv til coachen).
 *
 * Ærlige avvik fra fasiten (datamodellen eier sannheten):
 *  - Lag-fanen viser HCP/kategori, IKKE SG siste 30 dager — venner deler aldri
 *    tall (B39-personvernmodellen). Forklar-linjen sier det som det er.
 *  - Utfordringskortene har ingen fremdriftsspor (gjort/mål) — DrillChallenge
 *    har ikke målverdi i modellen. Viser deltakere, frist og egen plassering.
 */

import { useState } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Kort, Caps, TomTilstand } from "@/components/v2";

export type UkeDagStatus = "" | "gjort" | "planlagt";

export type UtenforBanenData = {
  ukeNr: number;
  /** Én status per ukedag, mandag først. */
  uke: UkeDagStatus[];
  gjortAntall: number;
  planlagtAntall: number;
  dagensFys: {
    id: string;
    tittel: string;
    tid: string;
    varighetMin: number;
    sted: string | null;
  } | null;
  okt: {
    navn: string;
    varighetMin: number | null;
    ovelser: { navn: string; meta: string }[];
  } | null;
  venner: { id: string; navn: string; hcp: number | null; kategori: string | null }[];
  utfordringer: {
    id: string;
    navn: string;
    beskrivelse: string | null;
    deltakere: number;
    slutt: string | null;
    minRank: number | null;
    minScore: number | null;
  }[];
};

const DAGER = ["ma", "ti", "on", "to", "fr", "lø", "sø"] as const;
const FANER = [
  ["fysisk", "Fysisk"],
  ["lag", "Lag"],
  ["utfordring", "Utfordringer"],
] as const;
type Fane = (typeof FANER)[number][0];

function initialer(navn: string): string {
  return navn
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((d) => d[0]?.toUpperCase() ?? "")
    .join("");
}

function forklarStil(): React.CSSProperties {
  return { fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 12, letterSpacing: "0.03em" };
}

export function UtenforBanenV2({ data }: { data: UtenforBanenData }) {
  const [fane, setFane] = useState<Fane>("fysisk");

  const harFysisk = data.okt !== null || data.planlagtAntall > 0 || data.dagensFys !== null;
  const heltTom = !harFysisk && data.venner.length === 0 && data.utfordringer.length === 0;

  return (
    <div
      data-paper-slug="playerhq-hjem-rest"
      data-od-id="playerhq-utenfor-banen"
      style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%", minWidth: 0 }}
    >
      {/* Topp — fasit: Utenfor banen / Fysisk · lag · utfordringer */}
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Utenfor banen</h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
          {heltTom
            ? "Ingenting aktivert"
            : `Fysisk · lag · utfordringer${data.planlagtAntall > 0 ? ` · ${data.gjortAntall} av ${data.planlagtAntall} økter denne uka` : ""}`}
        </span>
      </div>

      {heltTom ? (
        <Kort>
          <TomTilstand
            icon="dumbbell"
            title="Ingenting aktivt utenfor banen"
            sub="Fysisk plan settes opp av coachen din. Lag og utfordringer krever at du er med i en stall som har det slått på — spør coachen hvis du vil bli med."
          />
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link
              href="/portal/coach"
              data-od-id="rest-tom-chat"
              className="v2-press v2-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "0 16px",
                borderRadius: T.rTag,
                border: `1px solid ${T.border}`,
                background: T.panel,
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Skriv til coachen
            </Link>
          </div>
        </Kort>
      ) : (
        <>
          {/* Én ting nå — kun når dagens FYS-økt finnes (aldri fabrikkert). */}
          {data.dagensFys && (
            <div
              style={{
                background: T.handlingSoft,
                border: `1px solid ${T.border}`,
                borderRadius: T.rCard,
                padding: 16,
              }}
            >
              <Caps>Én ting nå</Caps>
              <h2 style={{ margin: "8px 0 4px", fontFamily: T.disp, fontSize: 16, fontWeight: 600, color: T.fg }}>
                Fysisk økt i dag — {data.dagensFys.varighetMin} min
              </h2>
              <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut, maxWidth: "46ch" }}>
                {data.dagensFys.tittel} kl.{" "}
                <span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>{data.dagensFys.tid}</span>
                {data.dagensFys.sted ? ` · ${data.dagensFys.sted}` : ""}. Ligger i planen din i dag.
              </p>
              <Link
                href={`/portal/gjennomfore/${data.dagensFys.id}`}
                data-od-id="rest-nu-start"
                className="v2-press v2-focus"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 48,
                  borderRadius: T.rTag,
                  background: T.handling,
                  color: T.onHandling,
                  fontFamily: T.ui,
                  fontSize: 13.5,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Start dagens fysiske økt
              </Link>
            </div>
          )}

          {/* Faneknapper — fasit .faneknapper med aria-pressed */}
          <div style={{ display: "flex", gap: 8 }} role="group" aria-label="Utenfor banen">
            {FANER.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={fane === id}
                onClick={() => setFane(id)}
                data-od-id={`rest-fane-${id}`}
                className="v2-press v2-focus"
                style={{
                  flex: 1,
                  minHeight: 40,
                  border: `1px solid ${fane === id ? T.borderS : T.border}`,
                  borderRadius: T.rTag,
                  background: fane === id ? T.panel2 : T.panel,
                  color: T.fg,
                  fontFamily: T.ui,
                  fontSize: 12.5,
                  fontWeight: fane === id ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {fane === "fysisk" && (
            <>
              <Kort
                eyebrow={`Uke ${data.ukeNr}`}
                action={
                  <span className="num" style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                    {data.gjortAntall}/{data.planlagtAntall} økter
                  </span>
                }
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, minWidth: 0 }}>
                  {DAGER.map((d, i) => {
                    const s = data.uke[i];
                    return (
                      <div
                        key={d}
                        style={{
                          border: `1px solid ${T.border}`,
                          borderRadius: T.rTag,
                          padding: "8px 2px",
                          textAlign: "center",
                          background: s === "planlagt" ? T.panel2 : T.panel,
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            fontFamily: T.mono,
                            fontSize: 9,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: T.mut,
                          }}
                        >
                          {d}
                        </span>
                        <span
                          aria-hidden
                          style={{
                            display: "block",
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            margin: "6px auto 0",
                            background: s === "gjort" ? T.up : s === "planlagt" ? "transparent" : T.panel2,
                            border: `1px ${s === "planlagt" ? "dashed" : "solid"} ${s === "gjort" ? T.up : T.border}`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <p style={forklarStil()}>Fylt = gjennomført · stiplet = planlagt · tom = ikke satt opp.</p>
              </Kort>

              <Kort
                eyebrow="Dagens økt"
                action={
                  data.okt?.varighetMin != null ? (
                    <span className="num" style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                      {data.okt.varighetMin} min
                    </span>
                  ) : undefined
                }
              >
                {data.okt && data.okt.ovelser.length > 0 ? (
                  data.okt.ovelser.map((o, i, arr) => (
                    <div
                      key={`${o.navn}-${i}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0,1fr) auto",
                        gap: 8,
                        alignItems: "center",
                        minHeight: 44,
                        borderBottom: i === arr.length - 1 ? "none" : `1px solid ${T.borderS}`,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.fg }}>
                          {o.navn}
                        </span>
                        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 1 }}>
                          {o.meta}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <TomTilstand
                    icon="activity"
                    title="Ingen fysisk økt satt opp i dag"
                    sub="Øktene fra fysisk-planen din dukker opp her."
                  />
                )}
                <Link
                  href="/portal/tren/fys-plan"
                  data-od-id="rest-fys-plan"
                  className="v2-press v2-focus"
                  style={{
                    marginTop: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 44,
                    borderRadius: T.rTag,
                    border: `1px solid ${T.border}`,
                    background: T.panel,
                    color: T.fg,
                    fontFamily: T.ui,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Åpne hele fysisk-planen
                </Link>
              </Kort>
            </>
          )}

          {fane === "lag" && (
            <Kort
              eyebrow="Vennene dine"
              action={
                <span className="num" style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                  {data.venner.length} {data.venner.length === 1 ? "spiller" : "spillere"}
                </span>
              }
            >
              {data.venner.length > 0 ? (
                <>
                  {data.venner.map((v, i, arr) => (
                    <Link
                      key={v.id}
                      href={`/portal/venner/${v.id}`}
                      data-od-id={`rest-lag-${v.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minHeight: 52,
                        padding: "8px 0",
                        borderBottom: i === arr.length - 1 ? "none" : `1px solid ${T.borderS}`,
                        textDecoration: "none",
                        color: "inherit",
                        minWidth: 0,
                      }}
                    >
                      <span
                        aria-hidden
                        className="num"
                        style={{
                          flex: "none",
                          width: 34,
                          height: 34,
                          borderRadius: 999,
                          display: "grid",
                          placeItems: "center",
                          background: T.panel2,
                          border: `1px solid ${T.border}`,
                          fontFamily: T.mono,
                          fontSize: 11,
                          fontWeight: 700,
                          color: T.fg,
                        }}
                      >
                        {initialer(v.navn)}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {v.navn}
                        </span>
                        <span style={{ display: "block", fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 1 }}>
                          {v.hcp != null ? `HCP ${v.hcp.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}` : "HCP —"}
                          {v.kategori ? ` · kat. ${v.kategori}` : ""}
                        </span>
                      </span>
                    </Link>
                  ))}
                  <p style={forklarStil()}>
                    Venner ser kun at du har trent — aldri plan, tall eller coach-notater. Deling styres under Meg → Personvern.
                  </p>
                </>
              ) : (
                <TomTilstand
                  icon="users"
                  title="Ingen venner ennå"
                  sub="Legg til venner under Venner for å se laget ditt her."
                />
              )}
            </Kort>
          )}

          {fane === "utfordring" && (
            <Kort
              eyebrow="Aktive utfordringer"
              action={
                <span className="num" style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                  {data.utfordringer.length} aktive
                </span>
              }
            >
              {data.utfordringer.length > 0 ? (
                <>
                  {data.utfordringer.map((u) => (
                    <Link
                      key={u.id}
                      href={`/portal/utfordringer/${u.id}`}
                      data-od-id={`rest-utfordring-${u.id}`}
                      style={{
                        display: "block",
                        border: `1px solid ${T.border}`,
                        borderRadius: T.rCard,
                        padding: "12px 16px",
                        marginBottom: 8,
                        background: T.panel,
                        textDecoration: "none",
                        color: "inherit",
                        minWidth: 0,
                      }}
                    >
                      <span style={{ display: "block", fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
                        {u.navn}
                      </span>
                      {u.beskrivelse && (
                        <span style={{ display: "block", fontFamily: T.bodyFont, fontSize: 12.5, color: T.mut, marginTop: 2 }}>
                          {u.beskrivelse}
                        </span>
                      )}
                      <span
                        className="num"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          fontFamily: T.mono,
                          fontSize: 10,
                          color: T.mut,
                          marginTop: 8,
                        }}
                      >
                        <span>
                          {u.deltakere} {u.deltakere === 1 ? "deltaker" : "deltakere"}
                          {u.minRank != null ? ` · din plass: ${u.minRank}.` : u.minScore != null ? ` · din score: ${u.minScore}` : ""}
                        </span>
                        {u.slutt && <span>{u.slutt}</span>}
                      </span>
                    </Link>
                  ))}
                  <p style={forklarStil()}>Utfordringer settes opp av coachen for stallen. Du kan ikke lage egne ennå.</p>
                </>
              ) : (
                <TomTilstand
                  icon="flag"
                  title="Ingen aktive utfordringer"
                  sub="Utfordringer fra coachen dukker opp her når de settes i gang."
                />
              )}
            </Kort>
          )}
        </>
      )}
    </div>
  );
}
