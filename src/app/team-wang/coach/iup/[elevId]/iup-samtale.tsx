"use client";
import { T } from "@/lib/v2/tokens";

/**
 * IUP-samtalen — tre steg i én skjerm.
 *
 * Samtalen skjedde før i et dokument ved siden av produktet: fokusområdene som
 * ble avtalt havnet aldri i årsplanen eleven ser, og evalueringen av forrige
 * periode fantes bare som notat hos treneren.
 *
 * Skjermen er delt mellom elev og trener i samme rom — derfor står
 * egenvurdering og trenervurdering ved siden av hverandre, ikke i hver sin
 * visning. Én primær handling: «Lagre og del med eleven».
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import {
  AKSE_REKKEFOLGE,
  AkseChip,
  MaalStatusChip,
  STATUS_TEKST,
  formaterEgentid,
  type AkAkse,
  type MaalStatus,
} from "../../../_components/ak-primitiver";
import { lagreIupSamtale } from "./actions";

export interface IupPeriode {
  id: string;
  navn: string;
  startIso: string;
  sluttIso: string;
  fokus: string | null;
}

export interface IupMaaling {
  id: string;
  navn: string;
  akse: AkAkse;
  verdi: number;
  datoIso: string;
}

interface EvalRad {
  id: string;
  akse: AkAkse;
  tittel: string;
  egentidMinUke: number;
  maalemetode: string | null;
  status: MaalStatus;
  egenvurdering: number | null;
  trenervurdering: number | null;
  kommentar: string | null;
}

interface NyRad {
  akse: AkAkse;
  tittel: string;
  egentidMinUke: number;
  maalemetode: string | null;
}

const STEG = ["Evaluering", "Nye fokusområder", "Del med eleven"];
const STATUSER: MaalStatus[] = ["IKKE_STARTET", "PAA_VEI", "NAADD"];

function kortDato(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  const mnd = [
    "jan",
    "feb",
    "mar",
    "apr",
    "mai",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "des",
  ];
  return `${d}. ${mnd[m - 1]}`;
}

export function IupSamtale({
  elevId,
  elevNavn,
  avsluttende,
  neste,
  evalueringer: startEval,
  nyeStart,
  maalinger,
}: {
  elevId: string;
  elevNavn: string;
  avsluttende: IupPeriode | null;
  neste: IupPeriode | null;
  evalueringer: EvalRad[];
  nyeStart: NyRad[];
  maalinger: IupMaaling[];
}) {
  const [rader, setRader] = useState<EvalRad[]>(startEval);
  const [nye, setNye] = useState<NyRad[]>(nyeStart);
  const [melding, setMelding] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, start] = useTransition();

  const fornavn = elevNavn.split(" ")[0];
  const sumEgentid = nye.reduce((s, n) => s + n.egentidMinUke, 0);

  const settEval = (id: string, endring: Partial<EvalRad>) =>
    setRader((r) => r.map((x) => (x.id === id ? { ...x, ...endring } : x)));

  const lagre = () => {
    setMelding(null);
    setFeil(null);
    if (!neste) {
      setFeil("Fant ingen neste periode å avtale fokusområder for.");
      return;
    }
    if (nye.some((n) => !n.tittel.trim())) {
      setFeil("Alle fokusområder må ha en tittel.");
      return;
    }
    start(async () => {
      const svar = await lagreIupSamtale({
        elevId,
        evalueringer: rader.map((r) => ({
          id: r.id,
          egenvurdering: r.egenvurdering,
          trenervurdering: r.trenervurdering,
          status: r.status,
          kommentar: r.kommentar,
        })),
        nestePeriodeId: neste.id,
        nyeFokus: nye.map((n) => ({
          akse: n.akse,
          tittel: n.tittel.trim(),
          egentidMinUke: n.egentidMinUke,
          maalemetode: n.maalemetode?.trim() || null,
        })),
      });
      if (svar.ok)
        setMelding(`Lagret. Fokusområdene ligger nå i ${fornavn}s årsplan.`);
      else setFeil(svar.feil);
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-app)",
        padding: "clamp(16px,4vw,32px) clamp(16px,4vw,40px) 72px",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <Link
          href="/team-wang/coach"
          className="wang-pressable"
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            minHeight: 44,
            padding: "0 16px",
            borderRadius: 999,
            background: "var(--surface-card)",
            boxShadow: "var(--shadow-card-sm)",
            fontFamily: "var(--font-brand)",
            fontWeight: 600,
            fontSize: 13,
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden /> Tilbake til
          årsplanen
        </Link>

        {/* Hero */}
        <section
          style={{
            background: "var(--grad-hero-line)",
            boxShadow: "var(--shadow-hero)",
            borderRadius: "var(--radius-card)",
            padding: "clamp(20px,4vw,26px)",
            color: "var(--text-on-dark)",
          }}
        >
          <span
            className="t-label"
            style={{ display: "block", color: "var(--wang-mint)" }}
          >
            IUP-samtale · {elevNavn}
          </span>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-brand)",
              fontWeight: 800,
              fontSize: "clamp(21px,4vw,28px)",
              letterSpacing: "-0.015em",
              marginTop: 6,
            }}
          >
            {avsluttende?.navn ?? "Ingen periode"} →{" "}
            {neste?.navn ?? "ingen neste periode"}
          </span>
          <p
            style={{
              margin: "7px 0 0",
              fontSize: 14,
              lineHeight: 1.55,
              color: "var(--text-on-dark-dim)",
              maxWidth: 620,
            }}
          >
            Evaluer perioden som avsluttes, les tallene som faktisk er målt, og
            avtal fokusområdene som skrives inn i {fornavn}s årsplan.
          </p>

          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}
          >
            {STEG.map((s, i) => (
              <span
                key={s}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  height: 28,
                  padding: "0 13px",
                  borderRadius: 999,
                  background: T.farge.hvitA14,
                  fontFamily: "var(--font-brand)",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: "var(--wang-mint)",
                    color: "var(--wang-navy)",
                    fontWeight: 800,
                    fontSize: 10,
                  }}
                >
                  {i + 1}
                </span>
                {s}
              </span>
            ))}
          </div>
        </section>

        <div className="wang-okt-kolonner" style={{ display: "grid", gap: 18 }}>
          {/* Steg 1 og 2: evaluering + målte tall */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              minWidth: 0,
            }}
          >
            <section className="wang-card" style={{ padding: "16px 18px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                <span
                  className="t-label"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {avsluttende?.navn ?? "Perioden"} · slik gikk det
                </span>
                <span style={{ display: "flex", gap: 12 }}>
                  <Nokkel farge="var(--wang-teal)" tekst="Egenvurdering" />
                  <Nokkel farge="var(--wang-navy)" tekst="Trener" />
                </span>
              </div>

              {rader.length === 0 ? (
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  Ingen fokusområder å evaluere i denne perioden. Avtal de
                  første under.
                </p>
              ) : (
                rader.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "12px 0",
                      borderBottom:
                        i === rader.length - 1
                          ? "none"
                          : "1px solid var(--border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        minWidth: 0,
                      }}
                    >
                      <AkseChip akse={r.akse} />
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontFamily: "var(--font-brand)",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "var(--text-primary)",
                          lineHeight: 1.4,
                        }}
                      >
                        {r.tittel}
                      </span>
                      <MaalStatusChip status={r.status} />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px 20px",
                        marginTop: 10,
                        alignItems: "center",
                      }}
                    >
                      <Skala
                        label="Egenvurdering"
                        verdi={r.egenvurdering}
                        farge="var(--wang-teal)"
                        onVelg={(v) => settEval(r.id, { egenvurdering: v })}
                      />
                      <Skala
                        label="Trener"
                        verdi={r.trenervurdering}
                        farge="var(--wang-navy)"
                        onVelg={(v) => settEval(r.id, { trenervurdering: v })}
                      />
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 11.5,
                          color: "var(--text-secondary)",
                        }}
                      >
                        Status
                        <select
                          value={r.status}
                          onChange={(e) =>
                            settEval(r.id, {
                              status: e.target.value as MaalStatus,
                            })
                          }
                          style={feltStil(150)}
                        >
                          {STATUSER.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_TEKST[s]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="wang-card" style={{ padding: "16px 18px" }}>
              <span
                className="t-label"
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                Målt i perioden
              </span>
              {maalinger.length === 0 ? (
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  Ingen testresultater registrert i denne perioden. Vurderingen
                  hviler da på observasjon alene — noter gjerne hvorfor.
                </p>
              ) : (
                maalinger.map((m, i) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      minHeight: 44,
                      padding: "9px 0",
                      borderBottom:
                        i === maalinger.length - 1
                          ? "none"
                          : "1px solid var(--border-subtle)",
                      minWidth: 0,
                    }}
                  >
                    <AkseChip akse={m.akse} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <b
                        style={{
                          display: "block",
                          fontFamily: "var(--font-brand)",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "var(--text-primary)",
                        }}
                      >
                        {m.navn}
                      </b>
                      <span
                        className="wang-num"
                        style={{
                          display: "block",
                          fontSize: 11.5,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {kortDato(m.datoIso)}
                      </span>
                    </span>
                    <b
                      className="wang-num"
                      style={{
                        flex: "none",
                        fontFamily: "var(--font-brand)",
                        fontWeight: 800,
                        fontSize: 15,
                        color: "var(--wang-teal-text)",
                      }}
                    >
                      {m.verdi}
                    </b>
                  </div>
                ))
              )}
            </section>
          </div>

          {/* Steg 3: nye fokusområder + den ene primære handlingen */}
          <section
            className="wang-card"
            style={{ padding: "16px 18px", alignSelf: "start", minWidth: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                className="t-label"
                style={{ color: "var(--text-secondary)" }}
              >
                Fokusområder for {neste?.navn.toLowerCase() ?? "neste periode"}
              </span>
              <span
                className="wang-num"
                style={{
                  fontFamily: "var(--font-brand)",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "var(--wang-teal-text)",
                }}
              >
                {formaterEgentid(sumEgentid)} egentid/uke
              </span>
            </div>

            {nye.map((n, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    minWidth: 0,
                  }}
                >
                  <select
                    value={n.akse}
                    onChange={(e) =>
                      setNye((v) =>
                        v.map((x, j) =>
                          j === i
                            ? { ...x, akse: e.target.value as AkAkse }
                            : x,
                        ),
                      )
                    }
                    aria-label="Pyramideakse"
                    style={feltStil(84)}
                  >
                    {AKSE_REKKEFOLGE.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <input
                    value={n.tittel}
                    onChange={(e) =>
                      setNye((v) =>
                        v.map((x, j) =>
                          j === i ? { ...x, tittel: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="Hva skal eleven jobbe med?"
                    aria-label="Fokusområde"
                    style={{ ...feltStil(0), flex: 1, minWidth: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => setNye((v) => v.filter((_, j) => j !== i))}
                    aria-label="Fjern fokusområde"
                    className="wang-pressable"
                    style={{
                      flex: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      border: "none",
                      cursor: "pointer",
                      background: "transparent",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Trash2 size={16} strokeWidth={2} aria-hidden />
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11.5,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Egentid
                    <select
                      value={n.egentidMinUke}
                      onChange={(e) =>
                        setNye((v) =>
                          v.map((x, j) =>
                            j === i
                              ? { ...x, egentidMinUke: Number(e.target.value) }
                              : x,
                          ),
                        )
                      }
                      style={feltStil(112)}
                    >
                      {[30, 60, 90, 120, 150, 180, 240].map((m) => (
                        <option key={m} value={m}>
                          {formaterEgentid(m)}/uke
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    value={n.maalemetode ?? ""}
                    onChange={(e) =>
                      setNye((v) =>
                        v.map((x, j) =>
                          j === i ? { ...x, maalemetode: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="Hvordan måles det?"
                    aria-label="Målemetode"
                    style={{ ...feltStil(0), flex: 1, minWidth: 140 }}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setNye((v) => [
                  ...v,
                  {
                    akse: "TEK",
                    tittel: "",
                    egentidMinUke: 120,
                    maalemetode: null,
                  },
                ])
              }
              className="wang-pressable"
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minHeight: 44,
                padding: "0 16px",
                borderRadius: 999,
                border: "1px dashed var(--neutral-300)",
                cursor: "pointer",
                background: "transparent",
                fontFamily: "var(--font-brand)",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              <Plus size={16} strokeWidth={2.2} aria-hidden /> Legg til
              fokusområde
            </button>

            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                Skrives inn i {fornavn}s årsplan med én gang.
              </p>
              <button
                type="button"
                onClick={lagre}
                disabled={lagrer || !neste}
                className="wang-pressable"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 44,
                  width: "100%",
                  padding: "0 20px",
                  borderRadius: "var(--radius-chip)",
                  border: "none",
                  cursor: lagrer || !neste ? "default" : "pointer",
                  opacity: lagrer || !neste ? 0.6 : 1,
                  background: "var(--wang-navy)",
                  color: "var(--white)",
                  fontFamily: "var(--font-brand)",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {lagrer ? "Lagrer …" : `Lagre og del med ${fornavn}`}
              </button>

              {melding ? (
                <p
                  role="status"
                  style={{
                    margin: "10px 0 0",
                    fontSize: 12.5,
                    color: "var(--wang-teal-text)",
                    fontWeight: 700,
                  }}
                >
                  {melding}
                </p>
              ) : null}
              {feil ? (
                <p
                  role="alert"
                  style={{
                    margin: "10px 0 0",
                    fontSize: 12.5,
                    color: "var(--cat-pink)",
                    fontWeight: 700,
                  }}
                >
                  {feil}
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ---- Deler -------------------------------------------------------------

function feltStil(bredde: number): React.CSSProperties {
  return {
    height: 40,
    width: bredde || undefined,
    padding: "0 12px",
    borderRadius: 12,
    border: "1px solid var(--border-subtle)",
    background: "var(--neutral-50)",
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: "var(--text-primary)",
    outline: "none",
  };
}

function Nokkel({ farge, tekst }: { farge: string; tekst: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: "var(--text-secondary)",
      }}
    >
      <span
        style={{ width: 8, height: 8, borderRadius: 999, background: farge }}
      />
      {tekst}
    </span>
  );
}

/** 1–5 som trykkbare prikker. Samme visning som elevens, men redigerbar. */
function Skala({
  label,
  verdi,
  farge,
  onVelg,
}: {
  label: string;
  verdi: number | null;
  farge: string;
  onVelg: (v: number | null) => void;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span style={{ display: "inline-flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onVelg(verdi === i ? null : i)}
            aria-label={`${label} ${i} av 5`}
            aria-pressed={verdi === i}
            className="wang-pressable"
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
            }}
          >
            <span
              style={{
                width: 13,
                height: 13,
                borderRadius: 999,
                background:
                  verdi !== null && i <= verdi ? farge : "var(--neutral-200)",
              }}
            />
          </button>
        ))}
      </span>
    </span>
  );
}
