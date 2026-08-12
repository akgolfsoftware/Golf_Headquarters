"use client";

/**
 * PlayerHQ · Logg en runde (etterregistrering) — Paper-port PP-3 (fase 1).
 * Fasit: designsystem/paper/fase1/playerhq-runde-logg.html.
 *
 * ÉN skjerm (ingen stegmaskin): runde-fakta (Dato + Bane), modusveksler
 * «Hull for hull | Bare totalen», 18-cellers rutenett av number-inputs
 * eller ett totalfelt, «Sist loggført» med de 2 siste rundene (ekte data),
 * og skjermens ene clay-handling «Logg runden» i fast dokk. KUN brutto.
 *
 * Lagring gjenbruker eksisterende actions UENDRET:
 * - Hull for hull → syntetiserHurtigHull per utfylt hull → lagreLoggetRunde
 *   (samme motor som live-føringen ender i; delvis runde er lov, min. 1 hull).
 * - Bare totalen → logRoundManual (Round uten HoleScore-rader — actionen
 *   redirecter selv til rundelista ved suksess).
 */

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { lagreLoggetRunde, hentBaneHull } from "@/app/portal/(legacy)/mal/runder/logg/actions";
import { logRoundManual } from "@/app/portal/mal/runder/ny/actions";
import { syntetiserHurtigHull } from "@/lib/runde-logg/syntetiser-hurtig";
import { T, Icon, Velger } from "@/components/v2";

const ANTALL_HULL = 18;
/** Standardlengder per par når baneregisteret mangler data (som oppsett-steget). */
const STANDARD_LENGDE: Record<number, number> = { 3: 150, 4: 350, 5: 480 };

type Modus = "hull" | "total";

type SisteRunde = { dato: string; bane: string; slag: number };

type Props = {
  baner: Array<{ id: string; name: string }>;
  /** De 2 siste loggførte rundene — tom liste = tom tilstand. */
  siste: SisteRunde[];
};

function iDagISO(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dag = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dag}`;
}

export function RundeEtterregistreringKlient({ baner, siste }: Props) {
  const [modus, setModus] = useState<Modus>("hull");
  const [dato, setDato] = useState(iDagISO());
  const [courseId, setCourseId] = useState(baner[0]?.id ?? "");
  const [scores, setScores] = useState<Array<number | null>>(Array(ANTALL_HULL).fill(null));
  const [total, setTotal] = useState<number | null>(null);
  /** Par + lengde per hull fra baneregisteret; fallback par 4. */
  const [hullInfo, setHullInfo] = useState<Array<{ par: number; lengdeMeter: number }>>(
    Array.from({ length: ANTALL_HULL }, () => ({ par: 4, lengdeMeter: STANDARD_LENGDE[4] })),
  );
  const [fraRegister, setFraRegister] = useState(false);
  const [lagrer, startLagring] = useTransition();
  const [feil, setFeil] = useState(false);
  const [kvittering, setKvittering] = useState<{
    roundId: string;
    hull: number;
    slag: number;
    rel: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function visToast(t: string) {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  // Hent par/lengde fra baneregisteret når banen endres.
  useEffect(() => {
    if (!courseId) return;
    let aktiv = true;
    (async () => {
      try {
        const registrert = await hentBaneHull(courseId);
        if (!aktiv) return;
        if (registrert.length === 0) {
          setHullInfo(
            Array.from({ length: ANTALL_HULL }, () => ({ par: 4, lengdeMeter: STANDARD_LENGDE[4] })),
          );
          setFraRegister(false);
          return;
        }
        const perHull = new Map(registrert.map((h) => [h.holeNumber, h]));
        setHullInfo(
          Array.from({ length: ANTALL_HULL }, (_, i) => {
            const reg = perHull.get(i + 1);
            const par = reg?.par ?? 4;
            return { par, lengdeMeter: reg?.lengdeMeter ?? STANDARD_LENGDE[par] ?? 350 };
          }),
        );
        setFraRegister(true);
      } catch {
        if (!aktiv) return;
        setFraRegister(false);
      }
    })();
    return () => {
      aktiv = false;
    };
  }, [courseId]);

  const fylte = scores.filter((s) => s != null).length;
  const sumSlag = scores.reduce<number>((a, s) => a + (s ?? 0), 0);
  const sumPar = scores.reduce<number>((a, s, i) => a + (s != null ? hullInfo[i].par : 0), 0);
  const relDiff = sumSlag - sumPar;
  const relStr = relDiff === 0 ? "E" : relDiff > 0 ? `+${relDiff}` : String(relDiff);

  const courseNavn = useMemo(
    () => baner.find((b) => b.id === courseId)?.name ?? "",
    [baner, courseId],
  );

  const lagre = () => {
    if (!courseId) {
      visToast("Velg bane først.");
      return;
    }
    if (!dato) {
      visToast("Sett dato først.");
      return;
    }
    if (modus === "hull" && fylte === 0) {
      visToast("Tast minst ett hull først.");
      return;
    }
    if (modus === "total" && total == null) {
      visToast("Tast totalscoren først.");
      return;
    }
    setFeil(false);
    startLagring(async () => {
      try {
        if (modus === "hull") {
          const hull = scores
            .map((s, i) =>
              s == null
                ? null
                : syntetiserHurtigHull({
                    holeNumber: i + 1,
                    par: hullInfo[i].par,
                    lengdeMeter: hullInfo[i].lengdeMeter,
                    strokes: s,
                  }),
            )
            .filter((h): h is NonNullable<typeof h> => h != null);
          const res = await lagreLoggetRunde({
            courseId,
            playedAt: new Date(dato).toISOString(),
            hull,
          });
          setKvittering({ roundId: res.roundId, hull: hull.length, slag: res.score, rel: relStr });
        } else {
          // «Bare totalen» — Round uten HoleScore-rader. Actionen redirecter
          // selv til /portal/mal/runder ved suksess.
          await logRoundManual({
            courseId,
            playedAt: new Date(dato).toISOString(),
            score: total as number,
          });
        }
      } catch (e) {
        // redirect() i server action kaster NEXT_REDIRECT — la den propagere.
        const digest = (e as { digest?: string } | null)?.digest;
        if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
        setFeil(true);
      }
    });
  };

  const nullstill = () => {
    setScores(Array(ANTALL_HULL).fill(null));
    setTotal(null);
    setKvittering(null);
  };

  const eyebrowStil = {
    fontFamily: T.mono,
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.09em",
    textTransform: "uppercase",
    color: T.mut,
  } as const;

  const kortStil = {
    background: T.panel,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  } as const;

  const tom = siste.length === 0;

  return (
    <div
      data-paper-slug="playerhq-runde-logg"
      data-od-id="playerhq-runde-logg"
      style={{ minHeight: "100dvh", background: T.bg, color: T.fg, fontFamily: T.ui }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 16px 32px",
          paddingTop: "calc(12px + env(safe-area-inset-top))",
        }}
      >
        {/* ── Topp — fasit .topp ── */}
        <header
          data-paper-topp
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <Link
            href="/portal/analysere"
            aria-label="Til Analyse"
            className="v2-press v2-focus"
            style={{
              flex: "none",
              width: 44,
              height: 44,
              borderRadius: 12,
              border: `1px solid ${T.border}`,
              color: T.fg,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            <Icon name="chevron-left" size={18} />
          </Link>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>
              Logg en runde
            </h1>
            <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
              Etterregistrering · kun brutto
            </span>
          </div>
        </header>

        {/* ── Feiltilstand — «Prøv igjen» er skjermens ene aksenthandling ── */}
        {feil && !kvittering && (
          <div
            style={{
              padding: "24px 16px",
              background: T.panel2,
              border: `1px dashed ${T.border}`,
              borderRadius: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
              Klarte ikke å lagre runden
            </h3>
            <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut, lineHeight: 1.55 }}>
              Alt du har tastet ligger trygt på telefonen. Prøv igjen når som helst — ingenting
              må tastes på nytt.
            </p>
            <button
              type="button"
              onClick={() => setFeil(false)}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: "pointer",
                width: "100%",
                minHeight: 56,
                border: "none",
                borderRadius: 12,
                background: T.handling,
                color: T.onHandling,
                fontFamily: T.disp,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Prøv igjen
            </button>
          </div>
        )}

        {/* ── Kvittering (hull for hull) ── */}
        {kvittering && !feil && (
          <>
            <div
              style={{
                padding: "24px 16px",
                background: T.panel,
                border: `1px solid ${T.up}`,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontFamily: T.disp,
                  fontSize: 16,
                  fontWeight: 600,
                  color: T.fg,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Icon name="check" size={20} style={{ color: T.up }} />
                Runden er lagret
              </h3>
              <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut, lineHeight: 1.55 }}>
                {kvittering.hull} hull · {kvittering.slag} slag ({kvittering.rel}) · brutto. Runden
                ligger i Analyse og teller i statistikken din. Anders ser den i stallen.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href={`/portal/mal/runder/${kvittering.roundId}`}
                className="v2-press v2-focus"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 48,
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  fontFamily: T.ui,
                  fontSize: 14,
                  fontWeight: 500,
                  color: T.fg,
                  textDecoration: "none",
                }}
              >
                Se runden i Analyse
              </Link>
              <button
                type="button"
                onClick={nullstill}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  cursor: "pointer",
                  minHeight: 48,
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  background: "transparent",
                  fontFamily: T.ui,
                  fontSize: 14,
                  fontWeight: 500,
                  color: T.fg,
                }}
              >
                Logg en runde til
              </button>
            </div>
          </>
        )}

        {/* ── Skjemaet ── */}
        {!feil && !kvittering && (
          <>
            {tom && (
              <div
                style={{
                  padding: "24px 16px",
                  background: T.panel2,
                  border: `1px dashed ${T.border}`,
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
                  Ingen runder loggført ennå
                </h3>
                <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut, lineHeight: 1.55 }}>
                  Den første runden gir Analyse noe å jobbe med. Fyll inn under — hull for hull
                  gir mest, men bare totalen teller også.
                </p>
              </div>
            )}

            {/* Runde-fakta — kilde: Round */}
            <div style={kortStil}>
              <span style={eyebrowStil}>runden</span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginTop: 8,
                  minWidth: 0,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <label
                    htmlFor="rdato"
                    style={{ ...eyebrowStil, display: "block", marginBottom: 4 }}
                  >
                    Dato
                  </label>
                  <input
                    id="rdato"
                    type="date"
                    value={dato}
                    max={iDagISO()}
                    onChange={(e) => setDato(e.target.value)}
                    className="v2-focus"
                    style={{
                      width: "100%",
                      minHeight: 48,
                      padding: "0 12px",
                      fontFamily: T.mono,
                      fontSize: 13,
                      background: T.bg,
                      color: T.fg,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <Velger
                    label="Bane"
                    options={baner.map((b) => ({ value: b.id, label: b.name }))}
                    value={courseId}
                    onChange={setCourseId}
                  />
                </div>
              </div>
            </div>

            {/* Modus: hull for hull / bare totalen */}
            <div
              role="group"
              aria-label="Føringsmodus"
              style={{
                display: "flex",
                gap: 4,
                background: T.panel2,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: 4,
                marginBottom: 16,
              }}
            >
              {(
                [
                  ["hull", "Hull for hull"],
                  ["total", "Bare totalen"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={modus === id}
                  onClick={() => setModus(id)}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    flex: 1,
                    minHeight: 44,
                    border: modus === id ? `1px solid ${T.border}` : "none",
                    background: modus === id ? T.panel : "transparent",
                    borderRadius: 8,
                    fontFamily: T.ui,
                    fontSize: 13,
                    fontWeight: 500,
                    color: modus === id ? T.fg : T.mut,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {modus === "hull" ? (
              <div style={kortStil}>
                <span style={eyebrowStil}>brutto slag per hull</span>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                    marginTop: 8,
                    minWidth: 0,
                  }}
                >
                  {scores.map((s, i) => (
                    <div key={i} style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontFamily: T.mono,
                          fontSize: 9.5,
                          color: T.mut,
                          marginBottom: 2,
                        }}
                      >
                        <span>hull {i + 1}</span>
                        <span>par {hullInfo[i].par}</span>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        inputMode="numeric"
                        value={s ?? ""}
                        aria-label={`Hull ${i + 1}, par ${hullInfo[i].par}`}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          setScores((prev) =>
                            prev.map((x, j) => (j === i ? (v >= 1 && v <= 15 ? v : null) : x)),
                          );
                        }}
                        className="v2-focus"
                        style={{
                          width: "100%",
                          minHeight: 44,
                          padding: 0,
                          textAlign: "center",
                          fontFamily: T.mono,
                          fontSize: 16,
                          fontVariantNumeric: "tabular-nums",
                          background: T.bg,
                          color: T.fg,
                          border: `1px solid ${T.border}`,
                          borderRadius: 8,
                          outline: "none",
                          appearance: "textfield",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 12 }}>
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontVariantNumeric: "tabular-nums",
                      fontSize: 32,
                      fontWeight: 500,
                      lineHeight: 1,
                      color: T.fg,
                    }}
                  >
                    {sumSlag}
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 14, color: T.mut }}>
                    {relStr} · {fylte} av {ANTALL_HULL} hull
                  </span>
                </div>
                <details style={{ margin: "12px 0 0", border: `1px solid ${T.border}`, borderRadius: 12 }}>
                  <summary
                    className="v2-focus"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 44,
                      padding: "0 16px",
                      cursor: "pointer",
                      listStyle: "none",
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: T.mut,
                    }}
                  >
                    Hvorfor dette tallet
                  </summary>
                  <ul
                    style={{
                      margin: 0,
                      padding: "12px 16px 16px 26px",
                      fontFamily: T.bodyFont,
                      fontSize: 13,
                      color: T.mut,
                      lineHeight: 1.55,
                    }}
                  >
                    <li style={{ marginBottom: 8 }}>
                      Kilde: hullene du har tastet — {fylte} av {ANTALL_HULL}.
                    </li>
                    <li style={{ marginBottom: 8 }}>
                      Beregning: {sumSlag} slag minus par {sumPar} på utfylte hull = {relStr}.
                    </li>
                    <li>
                      Forbehold: kun brutto — ekte slag. Netto og poeng finnes ikke i denne appen.
                    </li>
                  </ul>
                </details>
                {!fraRegister && (
                  <p style={{ margin: "12px 0 0", fontFamily: T.ui, fontSize: 10.5, color: T.mut }}>
                    Banen mangler hulldata i registeret — par settes til 4 per hull.
                  </p>
                )}
              </div>
            ) : (
              <div style={kortStil}>
                <span style={eyebrowStil}>brutto totalt · 18 hull</span>
                <input
                  type="number"
                  min={18}
                  max={160}
                  inputMode="numeric"
                  placeholder="—"
                  value={total ?? ""}
                  aria-label="Brutto totalscore"
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setTotal(v >= 18 && v <= 160 ? v : null);
                  }}
                  className="v2-focus"
                  style={{
                    width: "100%",
                    minHeight: 72,
                    marginTop: 8,
                    textAlign: "center",
                    fontFamily: T.mono,
                    fontSize: 32,
                    fontVariantNumeric: "tabular-nums",
                    background: T.bg,
                    color: T.fg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    outline: "none",
                    appearance: "textfield",
                  }}
                />
                <p
                  style={{
                    margin: "12px 0 0",
                    fontFamily: T.bodyFont,
                    fontSize: 12.5,
                    color: T.mut,
                    lineHeight: 1.55,
                  }}
                >
                  Uten hull for hull kan ikke Analyse regne SG per hull — men totalen teller
                  fortsatt i snittet ditt. Helt greit å bruke den.
                </p>
              </div>
            )}

            {/* Sist loggført — kilde: Round. Vises bare når det finnes noe. */}
            {siste.length > 0 && (
              <div style={kortStil}>
                <span style={eyebrowStil}>sist loggført</span>
                <div style={{ marginTop: 4 }}>
                  {siste.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        padding: "8px 0",
                        borderBottom: i === siste.length - 1 ? "none" : `1px solid ${T.border}`,
                        fontSize: 13,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: T.fg,
                        }}
                      >
                        {r.bane}
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          flex: "none",
                          fontFamily: T.mono,
                          fontVariantNumeric: "tabular-nums",
                          color: T.fg2,
                        }}
                      >
                        {r.dato} · {r.slag} slag
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fast dokk — skjermens ene clay-handling */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                zIndex: 5,
                paddingTop: 12,
                paddingBottom: "calc(8px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))",
                background: `linear-gradient(to top, ${T.bg} 72%, transparent)`,
              }}
            >
              <button
                type="button"
                onClick={lagre}
                disabled={lagrer}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  cursor: lagrer ? "wait" : "pointer",
                  width: "100%",
                  minHeight: 56,
                  border: "none",
                  borderRadius: 12,
                  background: T.handling,
                  color: T.onHandling,
                  fontFamily: T.disp,
                  fontSize: 16,
                  fontWeight: 700,
                  opacity: lagrer ? 0.75 : 1,
                }}
              >
                {lagrer ? "Lagrer…" : "Logg runden"}
              </button>
              {courseNavn && (
                <p
                  style={{
                    margin: "6px 0 0",
                    textAlign: "center",
                    fontFamily: T.mono,
                    fontSize: 10,
                    color: T.mut,
                  }}
                >
                  {courseNavn} · {dato.split("-").reverse().join(".")}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 96,
            transform: "translateX(-50%)",
            zIndex: 100,
            background: T.fg,
            color: T.bg,
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: 13,
            fontFamily: T.ui,
            maxWidth: "min(90vw, 420px)",
          }}
        >
          {toast}
        </div>
      )}
      <style>{`details > summary::-webkit-details-marker { display: none; }
input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
    </div>
  );
}
