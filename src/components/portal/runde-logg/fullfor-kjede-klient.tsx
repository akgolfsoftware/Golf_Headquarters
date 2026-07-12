"use client";

/**
 * «Fullfør kjeden» — før slag-kjeden per hull på en runde som har scorekort
 * (import/hurtig score) men mangler slag. Statusliste per hull → hull-editor
 * (gjenbruker SlagEditor) → mismatch-blokkering (slag + straffer må stemme
 * med scorekortet) → SG låses opp når alle kjeder er komplette.
 * Ingen slag prefylles — avstander diktes aldri; scorekortets tall vises
 * som fasit ved siden av kjeden.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { lagreHullKjede } from "@/app/portal/mal/runder/[id]/actions";
import type { HvileLie, LoggetHull, LoggetSlag } from "@/lib/runde-logg/types";
import { T, fmtSg, Caps, Kort, Icon } from "@/components/v2";
import { SlagEditor } from "./slag-editor";

const LIE_LABEL: Record<"TEE" | HvileLie, string> = {
  TEE: "Tee",
  FAIRWAY: "Fairway",
  SEMI_ROUGH: "Semi-rough",
  ROUGH: "Rough",
  DEEP_ROUGH: "Dyp rough",
  BUNKER: "Bunker",
  GREEN: "Green",
  TREES: "Trær",
};
const komma = (n: number) => String(n).replace(".", ",");

type KjedeVisRad = { nr: number; fra: string; til: string; straffe: boolean; iHull: boolean };

/** Ren kjede-visning: start → resultat per slag (modul-nivå for ren render). */
function byggVisRader(slag: LoggetSlag[], lengde: number): KjedeVisRad[] {
  let lie: "TEE" | HvileLie = "TEE";
  let avstand = lengde;
  return slag.map((s, i) => {
    const rad: KjedeVisRad = {
      nr: i + 1,
      fra: `${LIE_LABEL[lie]} · ${komma(avstand)} m`,
      til: s.resultat.iHull
        ? "I hull"
        : `${LIE_LABEL[s.resultat.lie]} · ${komma(s.resultat.avstandTilHull)} m igjen`,
      straffe: s.straffe === true,
      iHull: s.resultat.iHull,
    };
    if (!s.resultat.iHull) {
      lie = s.resultat.lie;
      avstand = s.resultat.avstandTilHull;
    }
    return rad;
  });
}

/** Startposisjon for neste slag i kjeden (modul-nivå for ren render). */
function nesteStart(slag: LoggetSlag[], lengde: number): { lie: "TEE" | HvileLie; avstand: number } {
  let lie: "TEE" | HvileLie = "TEE";
  let avstand = lengde;
  for (const s of slag) {
    if (!s.resultat.iHull) {
      lie = s.resultat.lie;
      avstand = s.resultat.avstandTilHull;
    }
  }
  return { lie, avstand };
}

export type FullforHull = {
  holeNumber: number;
  par: number;
  strokes: number;
  putts: number | null;
  fairway: boolean | null;
  /** Fra baneregisteret — null = spilleren setter lengde selv. */
  lengdeMeter: number | null;
  kjedeKomplett: boolean;
};

type FullforKjedeKlientProps = {
  roundId: string;
  courseNavn: string;
  hullListe: FullforHull[];
  sgTotal: number | null;
};

export function FullforKjedeKlient({
  roundId,
  courseNavn,
  hullListe: initListe,
  sgTotal: initSg,
}: FullforKjedeKlientProps) {
  const router = useRouter();
  const [hullListe, setHullListe] = useState(initListe);
  const [sgTotal, setSgTotal] = useState<number | null>(initSg);
  const [aktivt, setAktivt] = useState<number | null>(null);
  const [slag, setSlag] = useState<LoggetSlag[]>([]);
  const [lengde, setLengde] = useState<number | null>(null);
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const valgt = hullListe.find((h) => h.holeNumber === aktivt) ?? null;
  const komplette = hullListe.filter((h) => h.kjedeKomplett).length;
  const alle = hullListe.length;

  const aapne = (h: FullforHull) => {
    setAktivt(h.holeNumber);
    setSlag([]);
    setLengde(h.lengdeMeter);
    setFeil(null);
  };

  // Kjede-tilstand for aktivt hull
  const ferdig = slag.at(-1)?.resultat.iHull === true;
  const straffer = slag.filter((s) => s.straffe).length;
  const kjedeStrokes = slag.length + straffer;
  const mismatch = valgt != null && ferdig && kjedeStrokes !== valgt.strokes;
  const forMange = valgt != null && !ferdig && kjedeStrokes >= valgt.strokes;

  const { lie: startLie, avstand: startAvstand } = nesteStart(slag, lengde ?? 0);
  const kjedeRader = useMemo(() => byggVisRader(slag, lengde ?? 0), [slag, lengde]);

  const lagre = async () => {
    if (!valgt || !ferdig || mismatch || lengde == null) return;
    setLagrer(true);
    setFeil(null);
    const hullData: LoggetHull = {
      holeNumber: valgt.holeNumber,
      par: valgt.par,
      lengdeMeter: lengde,
      slag,
    };
    try {
      const res = await lagreHullKjede(roundId, hullData);
      if (!res.ok) {
        setFeil(res.error ?? "Lagringen feilet — prøv igjen.");
        setLagrer(false);
        return;
      }
      setHullListe((l) =>
        l.map((h) => (h.holeNumber === valgt.holeNumber ? { ...h, kjedeKomplett: true } : h)),
      );
      setSgTotal(res.sgTotal ?? null);
      setAktivt(null);
      setSlag([]);
    } catch {
      setFeil("Fikk ikke kontakt — prøv igjen.");
    }
    setLagrer(false);
  };

  /* ── Feiring: alle kjeder komplette ── */
  if (komplette === alle && aktivt == null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", padding: "10px 0" }}>
            <span style={{ width: 56, height: 56, borderRadius: 9999, background: "color-mix(in srgb, var(--v2-lime) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--v2-lime) 45%, transparent)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="trending-up" size={26} style={{ color: T.lime }} />
            </span>
            <div style={{ fontFamily: T.disp, fontSize: 19, fontWeight: 700, color: T.fg }}>
              Full Strokes Gained klar
            </div>
            {sgTotal != null && (
              <div style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 700, color: sgTotal >= 0 ? T.up : T.down }}>
                {fmtSg(sgTotal)}
              </div>
            )}
            <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg2, lineHeight: 1.55 }}>
              Alle {alle} kjeder komplette — se hvor slagene ble tjent og tapt.
            </div>
            <button
              type="button"
              onClick={() => router.push(`/portal/mal/runder/${roundId}`)}
              className="v2-press v2-focus"
              style={{ appearance: "none", cursor: "pointer", width: "100%", height: 46, borderRadius: 12, border: "none", background: T.lime, color: T.onLime, fontFamily: T.disp, fontSize: 14.5, fontWeight: 700 }}
            >
              Til runden
            </button>
          </div>
        </Kort>
      </div>
    );
  }

  /* ── Hull-editor ── */
  if (valgt) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontFamily: T.disp, fontSize: 18, fontWeight: 700, color: T.fg }}>
            Hull {valgt.holeNumber} · par {valgt.par}
          </div>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.fg2 }}>
            scorekort: {valgt.strokes} slag
            {valgt.putts != null ? ` · ${valgt.putts} putter` : ""}
            {valgt.fairway != null ? ` · FIR ${valgt.fairway ? "ja" : "nei"}` : ""}
          </span>
        </div>

        {lengde == null ? (
          <Kort eyebrow="Hull-lengde mangler i baneregisteret" pad="14px 16px">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                inputMode="numeric"
                placeholder="Lengde i meter"
                aria-label={`Lengde hull ${valgt.holeNumber} i meter`}
                onChange={(e) => {
                  const v = Number(e.target.value.replace(/\D/g, ""));
                  if (v >= 40 && v <= 700) setLengde(v);
                }}
                style={{ flex: 1, height: 44, borderRadius: 11, padding: "0 12px", background: T.panel2, border: `1px solid ${T.borderS}`, color: T.fg, fontFamily: T.mono, fontSize: 13, outline: "none" }}
              />
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>40–700 m</span>
            </div>
          </Kort>
        ) : (
          <>
            {kjedeRader.length > 0 && (
              <Kort eyebrow={`Slag-kjeden — ${kjedeStrokes} av ${valgt.strokes} slag`} pad="14px 12px">
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {kjedeRader.map((rad) => (
                    <div key={rad.nr} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, color: T.fg2, flex: "none" }}>
                        {rad.nr}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}>{rad.fra}</span>
                        <span style={{ fontFamily: T.ui, fontSize: 11.5, color: rad.iHull ? T.up : T.fg2 }}>
                          {" "}→ {rad.til}
                        </span>
                        {rad.straffe && (
                          <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.down, marginLeft: 6 }}>+1 STRAFFE</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Kort>
            )}

            {!ferdig && !forMange && (
              <SlagEditor
                slagNr={slag.length + 1}
                startLie={startLie}
                startAvstand={startAvstand}
                hullLengde={lengde}
                par={valgt.par}
                onLagre={(s) => setSlag((x) => [...x, s])}
                onIHull={(s) => setSlag((x) => [...x, s])}
                onAngre={slag.length > 0 ? () => setSlag((x) => x.slice(0, -1)) : null}
              />
            )}

            {(mismatch || forMange) && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "color-mix(in srgb, var(--v2-down) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--v2-down) 35%, transparent)" }}>
                <Icon name="triangle-alert" size={14} style={{ color: T.down, flex: "none" }} />
                <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg, lineHeight: 1.5 }}>
                  Kjeden har <b>{slag.length} slag + {straffer} straffer</b>, men scorekortet sier{" "}
                  <b>{valgt.strokes}</b> — angre og rett kjeden før lagring.
                </span>
              </div>
            )}

            {(ferdig || forMange) && slag.length > 0 && (
              <button
                type="button"
                onClick={() => setSlag((x) => x.slice(0, -1))}
                className="v2-press v2-focus"
                style={{ appearance: "none", cursor: "pointer", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 9999, background: "transparent", border: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2 }}
              >
                <Icon name="arrow-left" size={12} />
                Angre siste slag
              </button>
            )}

            {feil && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "color-mix(in srgb, var(--v2-down) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--v2-down) 35%, transparent)" }}>
                <Icon name="triangle-alert" size={14} style={{ color: T.down, flex: "none" }} />
                <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg }}>{feil}</span>
              </div>
            )}

            <button
              type="button"
              onClick={lagre}
              disabled={!ferdig || mismatch || lagrer}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: !ferdig || mismatch ? "not-allowed" : "pointer",
                width: "100%",
                height: 50,
                borderRadius: 14,
                border: "none",
                background: ferdig && !mismatch ? T.lime : T.panel3,
                color: ferdig && !mismatch ? T.onLime : T.mut,
                fontFamily: T.disp,
                fontSize: 15,
                fontWeight: 700,
                opacity: lagrer ? 0.75 : 1,
              }}
            >
              {lagrer
                ? "Lagrer…"
                : mismatch || forMange
                  ? `Lagre hull ${valgt.holeNumber} — løs avviket først`
                  : `Lagre hull ${valgt.holeNumber}`}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            setAktivt(null);
            setSlag([]);
          }}
          className="v2-press v2-focus"
          style={{ appearance: "none", cursor: "pointer", width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 0", borderRadius: 12, background: "transparent", border: `1px solid ${T.border}`, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg2 }}
        >
          <Icon name="arrow-left" size={14} />
          Til hull-lista
        </button>
      </div>
    );
  }

  /* ── Statusliste ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Caps>{courseNavn}</Caps>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg, lineHeight: 1.1, marginTop: 6 }}>
          Fullfør kjeden
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 3 }}>
          {komplette} av {alle} kjeder komplette · full SG låses opp på {alle}/{alle}
        </div>
      </div>

      <Kort pad="14px 12px">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ height: 5, borderRadius: 9999, background: T.panel2, margin: "4px 10px 10px" }}>
            <div style={{ width: `${Math.round((komplette / alle) * 100)}%`, height: "100%", borderRadius: 9999, background: T.lime }} />
          </div>
          {hullListe.map((h) => (
            <div key={h.holeNumber} className="v2-row-h" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11.5, fontWeight: 700, color: T.fg2, width: 52 }}>
                Hull {h.holeNumber}
              </span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, whiteSpace: "nowrap" }}>
                par {h.par} · {h.strokes} slag
              </span>
              <div style={{ flex: 1 }} />
              {h.kjedeKomplett ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.up }}>
                  <Icon name="check" size={12} />
                  KJEDE OK
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => aapne(h)}
                  className="v2-press v2-focus"
                  style={{ appearance: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 9999, background: T.panel3, border: `1px solid ${T.borderS}`, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg }}
                >
                  Før slag
                </button>
              )}
            </div>
          ))}
        </div>
      </Kort>

      <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, lineHeight: 1.55 }}>
        Strokes Gained regnes kun fra ekte slag-kjeder — vi gjetter aldri. Kjeden må stemme med
        scorekortet (slag + straffer = score).
      </div>

      <button
        type="button"
        onClick={() => router.push(`/portal/mal/runder/${roundId}`)}
        className="v2-press v2-focus"
        style={{ appearance: "none", cursor: "pointer", width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 0", borderRadius: 12, background: "transparent", border: `1px solid ${T.border}`, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg2 }}
      >
        <Icon name="arrow-left" size={14} />
        Tilbake til runden
      </button>
    </div>
  );
}
