"use client";

/**
 * PH-RD-03 Live runde (slag), PH-RD-04 putt og nattflaten for PH-RD-05 —
 * Precision Athletics, runde 24 (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-RD-live.jsx, etag 1790581706716380, data i
 * ui_kits/playerhq/data-live.js).
 *
 * Nattflate: én kolonne, ingen fanelinje, én fullbredde primærhandling nederst.
 * Per slag er avstand, underlag og kølle påkrevd. På green: lengde i fot, break,
 * helning, resultat og (ved bom) fart og hvor du bommet. Straffeslag med ett
 * trykk. «I hull» avslutter hullet. Appen går til neste slag; trykk en verdi i
 * lista for å rette.
 *
 * Bevisste avvik fra tegningen:
 *   - Helning (svak · moderat · kraftig) er lagt til på putt. Modellen
 *     (`PuttRegistrering.slopeAlvorlighet`) krever den; tegningen har den ikke.
 *   - Straffeslag er 0 eller 1 per slag. Modellen har én `straffe`-flagg per slag.
 *   - Tee er bare valgbart på første slag, og Dyp rough finnes ikke i tegningen.
 *     Modellen tillater ikke Tee som hvileposisjon mellom slag.
 *   - Fart på bom er «Kort» eller «Lang» (modellens KORT og FORBI).
 *   - Køllelista er en fast standardbag. Spillerens egen bag finnes ikke i koden.
 *   - Runde-oversikten og SG-panelet er ikke i tegningen; de ligger i koden, men
 *     nås ikke fra denne flaten.
 * Ingen GPS eller banekart (Anders 28.09.2026).
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Flag, Plus } from "lucide-react";
import { FeilTilstand, Ikon, Knapp, LasterTilstand, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import type { HvileLie, LoggetSlag, PuttRegistrering } from "@/lib/runde-logg/types";
import type { PuttBreakRetning, PuttSlopeAlvorlighet } from "@/generated/prisma/enums";
import "@/styles/precision-athletics.css";

export const BAG = ["Driver", "3W", "5W", "4H", "5i", "6i", "7i", "8i", "9i", "PW", "50°", "54°", "58°"] as const;
const PUTTER = "Putter";

type DesignLie = "TEE" | "FAIRWAY" | "SEMI" | "ROUGH" | "BUNKER" | "TRAER" | "GREEN";
const LIER: Array<[DesignLie, string]> = [
  ["TEE", "Tee"], ["FAIRWAY", "Fairway"], ["SEMI", "Semi"], ["ROUGH", "Rough"], ["BUNKER", "Bunker"], ["TRAER", "Trær"], ["GREEN", "Green"],
];
const TIL_HVILE: Record<Exclude<DesignLie, "TEE">, HvileLie> = {
  FAIRWAY: "FAIRWAY", SEMI: "SEMI_ROUGH", ROUGH: "ROUGH", BUNKER: "BUNKER", TRAER: "TREES", GREEN: "GREEN",
};
const BREAKS: Array<[PuttBreakRetning, string]> = [
  ["VENSTRE_HOYRE", "Venstre → høyre"], ["HOYRE_VENSTRE", "Høyre → venstre"], ["OPPOVER", "Oppover"], ["NEDOVER", "Nedover"],
];
const HELNING: Array<[PuttSlopeAlvorlighet, string]> = [["SVAK", "Svak"], ["MODERAT", "Moderat"], ["KRAFTIG", "Kraftig"]];

export type UtkastPutt = {
  brk: PuttBreakRetning; hel: PuttSlopeAlvorlighet; res: "hull" | "miss"; fart: "Kort" | "Lang" | null; miss: "Venstre" | "Høyre" | "På linja" | null;
};
export type UtkastSlag = { id: string; dist: number; lie: DesignLie; club: string; pen: 0 | 1; putt: UtkastPutt | null };
export type SpiltHull = { par: number; slag: number };

type Skjema = {
  dist: string; lie: DesignLie | ""; club: string; pen: 0 | 1;
  brk: PuttBreakRetning | ""; hel: PuttSlopeAlvorlighet | ""; res: "hull" | "miss" | ""; fart: "Kort" | "Lang" | ""; miss: "Venstre" | "Høyre" | "På linja" | "";
};

const FOT = 0.3048;
const toPar = (d: number) => (d > 0 ? `+${d}` : d < 0 ? `−${Math.abs(d)}` : "±0");
const tomt = (): Skjema => ({ dist: "", lie: "", club: "", pen: 0, brk: "", hel: "", res: "", fart: "", miss: "" });
const blank = (dist: number | null, lie: DesignLie | ""): Skjema => ({ ...tomt(), dist: dist != null ? String(dist) : "", lie, club: lie === "GREEN" ? PUTTER : "" });

/** Utkastet omregnes til posisjonskjeden modellen bruker: slag N lander der slag N+1 starter. */
export function utkastTilSlag(u: readonly UtkastSlag[]): LoggetSlag[] {
  return u.map((s, i) => {
    const neste = u[i + 1];
    const slag: LoggetSlag = {
      resultat: neste && neste.lie !== "TEE"
        ? { iHull: false, lie: TIL_HVILE[neste.lie], avstandTilHull: neste.lie === "GREEN" ? Math.round(neste.dist * FOT * 100) / 100 : neste.dist }
        : { iHull: true },
      kolle: s.club,
    };
    if (s.pen && neste) slag.straffe = true;
    if (s.lie === "GREEN" && s.putt) {
      const p: PuttRegistrering = {
        breakRetning: s.putt.brk, slopeAlvorlighet: s.putt.hel,
        fartUtfall: s.putt.res === "hull" ? "HOLED" : s.putt.fart === "Lang" ? "FORBI" : "KORT",
      };
      if (s.putt.res === "miss") p.linjeMiss = s.putt.miss === "Venstre" ? "VENSTRE" : s.putt.miss === "Høyre" ? "HOYRE" : "PAA_LINJE";
      slag.putt = p;
    }
    return slag;
  });
}

function Velg<T extends string>({ label, valg, v, sett, kol }: { label: string; valg: ReadonlyArray<readonly [T, string]>; v: T | ""; sett: (k: T) => void; kol: number }) {
  return <div role="group" aria-label={label} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
    <span style={{ font: "600 14px/1.2 var(--font-sans)", color: "var(--text-secondary)" }}>{label}</span>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${kol},minmax(0,1fr))`, gap: 6 }}>
      {valg.map(([k, l]) => <button key={k} type="button" aria-pressed={v === k} onClick={() => sett(k)}
        style={{ minHeight: 52, minWidth: 0, padding: "0 6px", borderRadius: 8, border: `1px solid ${v === k ? "var(--border-ink)" : "var(--border-hairline)"}`, background: v === k ? "var(--primary)" : "var(--surface-card)", color: v === k ? "var(--text-on-primary)" : "var(--text-primary)", font: "600 14px/1.15 var(--font-sans)", cursor: "pointer", overflowWrap: "anywhere" }}>{l}</button>)}
    </div>
  </div>;
}

function Chip({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} aria-label={label}
    style={{ minHeight: 44, minWidth: 44, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", color: "var(--text-primary)", font: "600 14px/1 var(--font-mono)", cursor: "pointer", minWidth: 0 }}>{children}</button>;
}

export type PH08Props = {
  tilstand: "data" | "laster" | "feil";
  tema?: "night" | "light";
  bane: string;
  hullNr: number;
  antallHull: number;
  par: number;
  lengdeMeter: number;
  spilte: readonly SpiltHull[];
  utkast?: readonly UtkastSlag[];
  feilKode?: string;
  onUtkast?: (u: readonly UtkastSlag[]) => void;
  /** Hullet er ferdig: slagene i modellens kjede og hullets lengde slik spilleren førte den. */
  onFerdigHull: (slag: LoggetSlag[], lengdeMeter: number, antallSlag: number) => void;
  onAvslutt: () => void;
  onTilbake: () => void;
};

export function PH08RundeLive({ tilstand, tema = "night", bane, hullNr, antallHull, par, lengdeMeter, spilte, utkast = [], feilKode, onUtkast, onFerdigHull, onAvslutt, onTilbake }: PH08Props) {
  const [shots, setShots] = useState<UtkastSlag[]>(() => [...utkast]);
  const [edit, setEdit] = useState<number | null>(null);
  const [dr, setDr] = useState<Skjema>(() => (utkast.length ? blank(null, utkast[utkast.length - 1].lie === "GREEN" ? "GREEN" : "") : blank(lengdeMeter, "TEE")));
  const [toast, setToast] = useState<{ t: string; m: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoppOverFirst = useRef(true);

  useEffect(() => {
    if (hoppOverFirst.current) { hoppOverFirst.current = false; return; }
    onUtkast?.(shots);
  }, [shots, onUtkast]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const visToast = (t: string, m: string) => {
    setToast({ t, m });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  };

  const green = dr.lie === "GREEN";
  const strokes = shots.reduce((a, s) => a + 1 + s.pen, 0);
  const n = shots.length + 1;
  const tot = spilte.reduce((a, h) => a + h.slag, 0);
  const totPar = spilte.reduce((a, h) => a + h.par, 0);
  const erForste = shots.length === 0 && edit == null;
  const okBase = dr.dist !== "" && dr.lie !== "" && dr.club !== "";
  const okPutt = okBase && dr.brk !== "" && dr.hel !== "" && (dr.res === "hull" || (dr.res === "miss" && dr.fart !== "" && dr.miss !== ""));
  const ok = green ? okPutt : okBase;
  const kanHull = okBase && dr.pen === 0 && (!green || dr.res === "hull" || dr.res === "");

  const sett = <K extends keyof Skjema>(k: K) => (v: Skjema[K]) =>
    setDr((x) => ({ ...x, [k]: v, ...(k === "lie" && v === "GREEN" ? { club: PUTTER } : {}), ...(k === "lie" && v !== "GREEN" && x.club === PUTTER ? { club: "" } : {}) }));

  const rec = (): UtkastSlag => ({
    id: `s${Date.now()}`, dist: Number(dr.dist), lie: dr.lie as DesignLie, club: dr.club, pen: dr.pen,
    putt: green && dr.brk && dr.hel && dr.res ? { brk: dr.brk, hel: dr.hel, res: dr.res, fart: dr.res === "miss" ? (dr.fart || null) : null, miss: dr.res === "miss" ? (dr.miss || null) : null } : null,
  });

  const avsluttHull = (liste: UtkastSlag[]) => {
    const sc = liste.reduce((a, s) => a + 1 + s.pen, 0);
    const fortsatt = hullNr < antallHull;
    visToast(`Hull ${hullNr}: ${sc} slag (${toPar(sc - par)})`, fortsatt ? `NESTE: HULL ${hullNr + 1}` : "SISTE HULL");
    const forste = liste[0];
    const lengde = forste && forste.lie === "TEE" ? forste.dist : lengdeMeter;
    setShots([]);
    setEdit(null);
    onFerdigHull(utkastTilSlag(liste), lengde, sc);
  };

  const lagre = (hull: boolean) => {
    if (edit != null) {
      setShots((l) => l.map((s, i) => (i === edit ? { ...rec(), id: s.id } : s)));
      visToast(`Slag ${edit + 1} er rettet`, "—");
      setEdit(null);
      setDr(blank(null, ""));
      return;
    }
    const liste = [...shots, rec()];
    if (hull || (green && dr.res === "hull")) { avsluttHull(liste); return; }
    setShots(liste);
    setDr(blank(null, green ? "GREEN" : ""));
  };

  const rett = (i: number) => {
    const s = shots[i];
    setEdit(i);
    setDr({ dist: String(s.dist), lie: s.lie, club: s.club, pen: s.pen, brk: s.putt?.brk ?? "", hel: s.putt?.hel ?? "", res: s.putt?.res ?? "", fart: s.putt?.fart ?? "", miss: s.putt?.miss ?? "" });
  };

  const lieNavn = (k: DesignLie) => LIER.find((l) => l[0] === k)?.[1] ?? k;
  const tomtHull = shots.length === 0 && spilte.length === 0 && edit == null;
  const visLier = LIER.filter(([k]) => k !== "TEE" || erForste || edit === 0);

  const top = <>
    <button type="button" className="pa-iconbtn" aria-label="Tilbake til hurtigføringen" onClick={onTilbake} style={{ width: 56, height: 56 }}><Ikon icon={ArrowLeft} name="arrow-left" size={20} /></button>
    <StatusPille tone="live">Runde</StatusPille>
    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: "1 1 auto" }}>
      <span style={{ font: "600 17px/1 var(--font-sans)", color: "var(--text-primary)" }}>Hull {hullNr} · par {par}</span>
      <Meta style={{ overflowWrap: "anywhere" }}>{lengdeMeter} M · {bane.toUpperCase()}</Meta>
    </span>
    <span style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
      <span style={{ font: "600 17px/1 var(--font-mono)", color: "var(--text-primary)" }}>{spilte.length ? `${tot} (${toPar(tot - totPar)})` : "—"}</span>
      <Meta>ETTER {spilte.length} HULL</Meta>
    </span>
    <button type="button" className="pa-iconbtn" aria-label="Avslutt runden" onClick={onAvslutt} style={{ width: 56, height: 56 }}><Ikon icon={Flag} name="flag" size={20} /></button>
  </>;

  const gateOk = tilstand === "data";
  const action = gateOk ? <Knapp size="xl" fullWidth icon={edit != null ? Check : green && dr.res === "hull" ? Flag : ArrowRight} disabled={!ok} style={{ height: 64 }} onClick={() => lagre(false)}>
    {edit != null ? "Lagre rettelse" : green && dr.res === "hull" ? "I hull · avslutt hullet" : green ? "Lagre putt" : "Lagre slag"}
  </Knapp> : null;

  return <div className="pa-root" data-design="precision-athletics" data-theme={tema === "night" ? "night" : undefined} style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
    <main id="pa-innhold" style={{ flex: 1, width: "100%", maxWidth: 600, margin: "0 auto", boxSizing: "border-box", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 56, flexWrap: "wrap" }}>{top}</div>
      {tilstand === "laster" && <LasterTilstand text="Henter runden …" />}
      {tilstand === "feil" && <FeilTilstand icon={Flag} title="Runden kunne ikke lagres" text="Slagene er lagret på telefonen og sendes når nettet er tilbake." code={feilKode ?? "FRAKOBLET"} />}
      {gateOk && <>
        {tomtHull && <TomTilstand icon={Flag} title="Første slag på hull 1" text="Avstand, underlag og kølle for hvert slag. Appen går videre til neste slag automatisk." />}
        {shots.length > 0 && <section aria-label="Slag på hullet" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
            <span className="kicker" style={{ flex: 1, minWidth: 0 }}>Hull {hullNr} · {strokes} slag så langt</span>
            <Meta>TRYKK EN VERDI FOR Å RETTE</Meta>
          </div>
          <div role="list">
            {shots.map((s, i) => <div role="listitem" key={s.id} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", minHeight: 56, borderTop: i ? "1px solid var(--border-hairline)" : "none", padding: "4px 0", background: edit === i ? "var(--surface-sunken)" : "transparent" }}>
              <Meta style={{ width: 52 }}>{s.lie === "GREEN" ? "PUTT" : "SLAG"} {i + 1}</Meta>
              <Chip onClick={() => rett(i)} label={`Rett avstand slag ${i + 1}`}>{s.dist} {s.lie === "GREEN" ? "fot" : "m"}</Chip>
              <Chip onClick={() => rett(i)} label={`Rett underlag slag ${i + 1}`}>{lieNavn(s.lie)}</Chip>
              <Chip onClick={() => rett(i)} label={`Rett kølle slag ${i + 1}`}>{s.club}</Chip>
              {s.putt && <Chip onClick={() => rett(i)} label={`Rett break putt ${i + 1}`}>{(BREAKS.find((b) => b[0] === s.putt?.brk)?.[1] ?? "").replace(" → ", "→")}</Chip>}
              {s.putt?.fart && <Chip onClick={() => rett(i)} label={`Rett miss putt ${i + 1}`}>{s.putt.fart} · {s.putt.miss}</Chip>}
              {s.pen > 0 && <Meta style={{ color: "var(--text-primary)" }}>+{s.pen} STRAFFE</Meta>}
            </div>)}
          </div>
        </section>}
        <section aria-label={edit != null ? `Rett slag ${edit + 1}` : `Slag ${n}`} style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <h1 style={{ flex: 1, minWidth: 0, font: "var(--type-title-m)", color: "var(--text-primary)" }}>{edit != null ? `Rett slag ${edit + 1}` : green ? `Putt ${shots.filter((s) => s.lie === "GREEN").length + 1}` : `Slag ${n}`}</h1>
            <Meta>ALT ER PÅKREVD</Meta>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "end" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <span style={{ font: "600 14px/1.2 var(--font-sans)", color: "var(--text-secondary)" }}>{green ? "Lengde (fot)" : "Avstand til hull (m)"}</span>
              <input inputMode="numeric" value={dr.dist} placeholder="—" onChange={(e) => sett("dist")(e.target.value.replace(/\D/g, "").slice(0, 3))}
                style={{ width: "100%", minWidth: 0, boxSizing: "border-box", height: 64, fontSize: 28, padding: "0 16px", borderRadius: 8, border: "1px solid var(--border-control)", background: "var(--surface-card)", color: "var(--text-primary)", font: "500 28px/1 var(--font-mono)" } as CSSProperties} />
            </label>
            <Knapp variant={dr.pen ? "primary" : "secondary"} icon={Plus} onClick={() => setDr((x) => ({ ...x, pen: x.pen ? 0 : 1 }))} style={{ height: 64 }}>{dr.pen ? "1 straffe" : "Straffeslag"}</Knapp>
          </div>
          <Velg label="Underlag" valg={visLier} v={dr.lie} sett={sett("lie")} kol={4} />
          {green ? <>
            <Velg label="Break" valg={BREAKS} v={dr.brk} sett={sett("brk")} kol={2} />
            <Velg label="Helning" valg={HELNING} v={dr.hel} sett={sett("hel")} kol={3} />
            <Velg label="Resultat" valg={[["hull", "I hull"], ["miss", "Bom"]] as const} v={dr.res} sett={sett("res")} kol={2} />
            {dr.res === "miss" && <>
              <Velg label="Fart" valg={[["Kort", "Kort"], ["Lang", "Lang"]] as const} v={dr.fart} sett={sett("fart")} kol={2} />
              <Velg label="Hvor bommet du?" valg={[["Venstre", "Venstre"], ["Høyre", "Høyre"], ["På linja", "På linja"]] as const} v={dr.miss} sett={sett("miss")} kol={3} />
            </>}
          </> : <>
            <Velg label="Kølle" valg={BAG.map((b) => [b, b] as const)} v={dr.club} sett={sett("club")} kol={4} />
            {edit == null && <div><Knapp variant="ghost" icon={Flag} disabled={!kanHull} onClick={() => lagre(true)} style={{ height: 52 }}>I hull · avslutt hullet</Knapp></div>}
          </>}
        </section>
      </>}
    </main>
    {action && <div style={{ position: "sticky", bottom: 0, background: "var(--surface-page)", borderTop: "1px solid var(--border-hairline)", zIndex: 5 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 16px calc(16px + env(safe-area-inset-bottom))", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 8 }}>{action}</div>
    </div>}
    {toast && <div role="status" style={{ position: "fixed", top: 16, left: 16, right: 16, display: "flex", justifyContent: "center", zIndex: 200, pointerEvents: "none" }}>
      <div className="pa-toast" style={{ maxWidth: "100%" }}><span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{toast.t}</span><span className="pa-toast__meta">{toast.m}</span></div>
    </div>}
  </div>;
}
