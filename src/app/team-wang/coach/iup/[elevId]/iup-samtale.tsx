"use client";
import styles from "./iup-samtale.module.css";

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

import { useRef, useState, useTransition } from "react";
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
  /**
   * Ferdig formatert måling med enhet («3,80 %», «7 OK av 10»). Var tidligere
   * et rått tall, som ble rendret som «0.038» — med punktum, og uten at noen
   * kunne se at det egentlig betød 3,8 %.
   */
  verdi: string;
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
  kanRedigere = true,
  tilbakeHref = "/team-wang/coach",
}: {
  elevId: string;
  elevNavn: string;
  avsluttende: IupPeriode | null;
  neste: IupPeriode | null;
  evalueringer: EvalRad[];
  nyeStart: NyRad[];
  maalinger: IupMaaling[];
  kanRedigere?: boolean;
  tilbakeHref?: string;
}) {
  const [rader, setRader] = useState<EvalRad[]>(startEval);
  const [nye, setNye] = useState<NyRad[]>(nyeStart);
  const [melding, setMelding] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, start] = useTransition();
  const requestId = useRef(crypto.randomUUID());

  const fornavn = elevNavn.split(" ")[0];
  const sumEgentid = nye.reduce((s, n) => s + n.egentidMinUke, 0);

  const settEval = (id: string, endring: Partial<EvalRad>) =>
    setRader((r) => r.map((x) => (x.id === id ? { ...x, ...endring } : x)));

  const lagre = () => {
    if (!kanRedigere) return;
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
      try {
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
        nestePeriodeNavn: neste.navn,
        requestId: requestId.current,
        nyeFokus: nye.map((n) => ({
          akse: n.akse,
          tittel: n.tittel.trim(),
          egentidMinUke: n.egentidMinUke,
          maalemetode: n.maalemetode?.trim() || null,
        })),
      });
      if (svar.ok) {
        setMelding(`Vurderingen er lagret. Fokusområdene ligger som forslag i ${fornavn}s Workbench og endrer ikke årsplanen før godkjenning.`);
        requestId.current = crypto.randomUUID();
      }
      else setFeil(svar.feil);
      } catch {
        setFeil("Vurderingen kunne ikke lagres. Innholdet ditt er beholdt her. Prøv å lagre igjen.");
      }
    });
  };

  return (
    <div
      className={styles.side}
      data-org="wang"
      style={{
        minHeight: "100vh",
        background: "var(--bg-app)",
        padding: kanRedigere ? "0 0 72px" : "clamp(16px,4vw,32px) clamp(16px,4vw,40px) 72px",
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
          href={tilbakeHref}
          className="wang-pressable"
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            minHeight: 44,
            padding: "0 16px",
            borderRadius: 8,
            background: "var(--surface-card)",
            boxShadow: "none",
            fontFamily: "var(--font-wang-brand)",
            fontWeight: 600,
            fontSize: 13,
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden /> Tilbake
        </Link>

        {/* Hero */}
        <section
          className={styles.innledning}
          style={{
            background: "var(--wang-navy)",
            boxShadow: "none",
            borderRadius: 4,
            padding: "clamp(20px,4vw,26px)",
            color: "var(--text-on-dark)",
          }}
        >
          <h1 className={styles.tittel}>IUP-samtale med {elevNavn}</h1>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-wang-brand)",
              fontWeight: 600,
              fontSize: 18,
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
            foreslå fokusområder for {fornavn}. De legges i årsplanen først når eleven godkjenner.
          </p>

          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}
            aria-label="Samtalens tre steg"
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
                  borderRadius: 8,
                  background: "var(--overlay-on-dark-12)",
                  fontFamily: "var(--font-wang-brand)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: 8,
                    background: "var(--wang-mint)",
                    color: "var(--wang-navy)",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {i + 1}
                </span>
                {s}
              </span>
            ))}
          </div>
        </section>

        {!kanRedigere ? <p className={styles.lesetilstand} role="note">Du leser den delte IUP-samtalen. Vurderinger og forslag endres av treneren. Nye fokusområder legges først i årsplanen når spilleren godkjenner.</p> : null}
        <div className={styles.kolonner}>
          {/* Steg 1 og 2: evaluering + målte tall */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              minWidth: 0,
            }}
          >
            <section className={styles.seksjon} style={{ padding: "20px 22px" }}>
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
                <h2
                  className={styles.seksjonTittel}
                  style={{ color: "var(--text-secondary)" }}
                >
                  {avsluttende?.navn ?? "Perioden"} · slik gikk det
                </h2>
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
                      <AkseChip akse={r.akse} size={13} />
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontFamily: "var(--font-wang-brand)",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "var(--text-primary)",
                          lineHeight: 1.4,
                        }}
                      >
                        {r.tittel}
                      </span>
                      <MaalStatusChip status={r.status} size={13} />
                    </div>

                    {kanRedigere ? <>
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
                        farge="var(--wang-teal-text)"
                        deaktivert={!kanRedigere || lagrer}
                        onVelg={(v) => settEval(r.id, { egenvurdering: v })}
                      />
                      <Skala
                        label="Trener"
                        verdi={r.trenervurdering}
                        farge="var(--wang-navy)"
                        deaktivert={!kanRedigere || lagrer}
                        onVelg={(v) => settEval(r.id, { trenervurdering: v })}
                      />
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 13,
                          color: "var(--text-secondary)",
                        }}
                      >
                        Status
                        <select
                          disabled={!kanRedigere || lagrer}
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
                    <label className={styles.kommentar}>
                      Kommentar til vurderingen
                      <textarea value={r.kommentar ?? ""} disabled={!kanRedigere || lagrer} onChange={event => settEval(r.id, { kommentar: event.target.value })} placeholder="Hva ligger bak vurderingen?" rows={3} />
                    </label>
                    </> : <dl className={styles.leseverdier}>
                      <div><dt>Egenvurdering</dt><dd>{r.egenvurdering === null ? "Ikke vurdert" : `${r.egenvurdering} av 5`}</dd></div>
                      <div><dt>Trener</dt><dd>{r.trenervurdering === null ? "Ikke vurdert" : `${r.trenervurdering} av 5`}</dd></div>
                      <div><dt>Status</dt><dd>{STATUS_TEKST[r.status]}</dd></div>
                      <div><dt>Kommentar til vurderingen</dt><dd>{r.kommentar?.trim() || "Ingen kommentar registrert"}</dd></div>
                    </dl>}
                  </div>
                ))
              )}
            </section>

            <section className={styles.seksjon} style={{ padding: "20px 22px" }}>
              <h2
                className={styles.seksjonTittel}
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                Målt i perioden
              </h2>
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
                    <AkseChip akse={m.akse} size={13} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <b
                        style={{
                          display: "block",
                          fontFamily: "var(--font-wang-brand)",
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
                          fontSize: 13,
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
                        fontFamily: "var(--font-wang-brand)",
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
            className={styles.seksjon}
            style={{ padding: "20px 22px", alignSelf: "start", minWidth: 0 }}
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
              <h2
                className={styles.seksjonTittel}
                style={{ color: "var(--text-secondary)" }}
              >
                Fokusområder for {neste?.navn.toLowerCase() ?? "neste periode"}
              </h2>
              <span
                className="wang-num"
                style={{
                  fontFamily: "var(--font-wang-brand)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--wang-teal-text)",
                }}
              >
                {formaterEgentid(sumEgentid)} egentid/uke
              </span>
            </div>

            {!kanRedigere ? (nye.length ? nye.map((n, i) => <div key={i} className={styles.lesefokus}>
              <AkseChip akse={n.akse} size={13} /><h3>{n.tittel}</h3>
              <dl className={styles.leseverdier}><div><dt>Egentid</dt><dd>{formaterEgentid(n.egentidMinUke)}/uke</dd></div><div><dt>Målemetode</dt><dd>{n.maalemetode?.trim() || "Ingen målemetode registrert"}</dd></div></dl>
            </div>) : <p>Ingen nye fokusområder registrert.</p>) : <>
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
                          disabled={!kanRedigere || lagrer}
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
                    disabled={!kanRedigere || lagrer}
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
                    disabled={!kanRedigere || lagrer}
                    className="wang-pressable"
                    style={{
                      flex: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      borderRadius: 8,
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
                      fontSize: 13,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Egentid
                    <select
                          disabled={!kanRedigere || lagrer}
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
                    disabled={!kanRedigere || lagrer}
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
              disabled={!kanRedigere || lagrer}
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
                borderRadius: 8,
                border: "1px dashed var(--neutral-300)",
                cursor: "pointer",
                background: "transparent",
                fontFamily: "var(--font-wang-brand)",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              <Plus size={16} strokeWidth={2.2} aria-hidden /> Legg til
              fokusområde
            </button>
            </>}

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
                  fontSize: 13,
                  color: "var(--text-secondary)",
                }}
              >
                Spilleren får se før og etter i PlayerHQ og velger selv om forslaget skal inn i årsplanen.
              </p>
              {!neste ? <p className={styles.lesetilstand}>Ingen neste periode er registrert. Gruppen må ha en periode før nye fokusområder kan deles.{kanRedigere ? <> <Link href="/team-wang/coach?omraade=trening&fane=periode">Åpne gruppeperiodene</Link>.</> : null}</p> : null}
              {kanRedigere ? <button
                type="button"
                onClick={lagre}
                disabled={lagrer || !neste || !kanRedigere}
                className="wang-pressable"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 44,
                  width: "100%",
                  padding: "0 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: lagrer || !neste ? "default" : "pointer",
                  opacity: lagrer || !neste ? 0.6 : 1,
                  background: "var(--action)",
                  color: "var(--action-text)",
                  fontFamily: "var(--font-wang-brand)",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {lagrer ? "Lagrer …" : `Lagre og del med ${fornavn}`}
              </button> : null}

              {melding ? (
                <p
                  role="status"
                  style={{
                    margin: "10px 0 0",
                    fontSize: 14,
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
                    fontSize: 14,
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
    minHeight: 44,
    width: bredde || undefined,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid var(--border-subtle)",
    background: "var(--neutral-50)",
    fontFamily: "var(--font-wang-body)",
    fontSize: 13,
    color: "var(--text-primary)",

  };
}

function Nokkel({ farge, tekst }: { farge: string; tekst: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "var(--text-secondary)",
      }}
    >
      <span
        style={{ width: 8, height: 8, borderRadius: 8, background: farge }}
      />
      {tekst}
    </span>
  );
}

/** 1–5 som tallvalg med en fylt valgt verdi. Samme visning som elevens, men redigerbar. */
function Skala({
  label,
  verdi,
  farge,
  onVelg,
  deaktivert = false,
}: {
  label: string;
  verdi: number | null;
  farge: string;
  onVelg: (v: number | null) => void;
  deaktivert?: boolean;
}) {
  return (
    <span className={styles.skala}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span style={{ display: "inline-flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onVelg(verdi === i ? null : i)}
            aria-label={`${label} ${i} av 5`}
            disabled={deaktivert}
            aria-pressed={verdi === i}
            className="wang-pressable"
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: verdi === i ? farge : "var(--neutral-100)",
              color: verdi === i ? "var(--white)" : "var(--wang-navy)",
              fontFamily: "var(--font-wang-brand)",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {i}
          </button>
        ))}
      </span>
    </span>
  );
}
