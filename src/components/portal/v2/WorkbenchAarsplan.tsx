"use client";

/**
 * 8c.2 — ÅRSPLAN-CANVAS (fasit workbench-arsplan.jsx, Anders' interaksjon):
 * hele sesongen som horisontal tidslinje med periodeblokker (farge per type),
 * turneringsmarkører og nå-linje. Perioder DRAS inn fra biblioteket — under
 * draget følger en dato-boble markøren og viser dato/måned live; slipp åpner
 * bekreftelses-popup (sluttdato + fokus + ukevolum + ØKTBUDSJETT per
 * pyramideområde) — Anders-logikken: alt som tilføres canvas → popup.
 * Trykk på en blokk → samme popup i rediger-modus (+ Slett med bekreft-steg).
 * Mobil: samme canvas med horisontal scroll + «Ny periode»-knapp (uten drag).
 */

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { T, Kort, Caps, Icon, Knapp, TomTilstand, StatusPill } from "@/components/v2";
import { LPHASE_LABEL, LPHASE_FARGE, LPHASE_BESKRIVELSE } from "@/lib/labels/taxonomy";
import { budsjettSum, type PeriodeInput, type SessionBudget } from "@/lib/workbench/perioder";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import type { LPhase } from "@/generated/prisma/client";

const DND_MIME = "application/x-akgolf-wb";
const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const PERIODE_TYPER: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING", "TESTUKE", "FERIE", "TRENINGSSAMLING", "HELDAGSSAMLING"];
const OMRAADER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

/** Default varighet (dager) per type ved slipp — alt kan justeres i popupen. */
const DEFAULT_DAGER: Record<string, number> = {
  GRUNN: 28, SPESIAL: 28, TURNERING: 14, TESTUKE: 7, FERIE: 7, TRENINGSSAMLING: 3, HELDAGSSAMLING: 1,
};

function tilISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function datoKort(d: Date): string {
  return `${d.getDate()}. ${MND_KORT[d.getMonth()]}`;
}
function dagIAaret(d: Date, year: number): number {
  return Math.floor((d.getTime() - new Date(year, 0, 1).getTime()) / 86_400_000);
}
function dagerIAaret(year: number): number {
  return Math.round((new Date(year + 1, 0, 1).getTime() - new Date(year, 0, 1).getTime()) / 86_400_000);
}

export interface AarsplanHandlers {
  lagre: (input: PeriodeInput, periodeId?: string) => Promise<{ ok: boolean; error?: string }>;
  slett: (periodeId: string) => Promise<{ ok: boolean; error?: string }>;
}

interface PopupState {
  periodeId?: string;
  lPhase: LPhase;
  startDato: string;
  sluttDato: string;
  fokus: string;
  ukevolumMinT: string; // timer i UI (minutter i DB)
  ukevolumMaxT: string;
  budsjett: SessionBudget;
}

/* ── Dragbare periode-brikker (vises i biblioteket i årsplan-zoom) ── */
export function PeriodePalett() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Caps size={9}>Perioder — dra inn på tidslinja</Caps>
      {PERIODE_TYPER.map((p) => (
        <div
          key={p}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData(DND_MIME, JSON.stringify({ kind: "periode", lPhase: p }));
            e.dataTransfer.effectAllowed = "copy";
          }}
          title={LPHASE_BESKRIVELSE[p]}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: T.panel2, border: `1px dashed ${T.borderS}`, cursor: "grab" }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 3, background: LPHASE_FARGE[p], flex: "none" }} />
          <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg }}>{LPHASE_LABEL[p]}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Selve canvaset ── */
export function WorkbenchAarsplan({ data, handlers, onEndret }: {
  data: WorkbenchData;
  /** Uten handlers = lesevisning (ingen drag/redigering). */
  handlers?: AarsplanHandlers;
  onEndret: () => void;
}) {
  const year = (data.weekStartISO ? new Date(data.weekStartISO) : new Date()).getFullYear();
  const totDager = dagerIAaret(year);
  const blocks = data.seasonBlocks ?? [];
  const turneringer = data.tournamentCalendar ?? [];
  const banRef = useRef<HTMLDivElement>(null);

  const [boble, setBoble] = useState<{ pct: number; tekst: string } | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  // Hold-og-dra en plassert blokk venstre/høyre for å flytte hele perioden.
  // Rent lokalt UI-forskyv til slipp — selve lagringen skjer i popupen
  // (samme "alt til canvas → bekreft"-regel som resten av årsplanen).
  const dragRef = useRef<{ id: string; pointerId: number; startX: number; moved: boolean } | null>(null);
  const [drag, setDrag] = useState<{ id: string; deltaDager: number } | null>(null);
  const [bekreftSlett, setBekreftSlett] = useState(false);
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  // x-posisjon på tidslinja → dato i året.
  const datoFraX = (clientX: number): Date => {
    const rect = banRef.current?.getBoundingClientRect();
    if (!rect) return new Date(year, 0, 1);
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const dag = Math.round(pct * (totDager - 1));
    return new Date(year, 0, 1 + dag);
  };

  const aapneNyPopup = (lPhase: LPhase, start: Date) => {
    const slutt = new Date(start);
    slutt.setDate(slutt.getDate() + (DEFAULT_DAGER[lPhase] ?? 7) - 1);
    setFeil(null);
    setBekreftSlett(false);
    setPopup({ lPhase, startDato: tilISO(start), sluttDato: tilISO(slutt), fokus: "", ukevolumMinT: "", ukevolumMaxT: "", budsjett: {} });
  };

  const aapneRedigerPopup = (b: NonNullable<WorkbenchData["seasonBlocks"]>[number], skiftDager = 0) => {
    setFeil(null);
    setBekreftSlett(false);
    const start = new Date(b.startDate);
    const slutt = new Date(b.endDate);
    if (skiftDager !== 0) {
      start.setDate(start.getDate() + skiftDager);
      slutt.setDate(slutt.getDate() + skiftDager);
    }
    setPopup({
      periodeId: b.id,
      lPhase: b.lPhase,
      startDato: tilISO(start),
      sluttDato: tilISO(slutt),
      fokus: b.focus ?? "",
      ukevolumMinT: b.weeklyVolMin != null ? String(Math.round((b.weeklyVolMin / 60) * 10) / 10) : "",
      ukevolumMaxT: b.weeklyVolMax != null ? String(Math.round((b.weeklyVolMax / 60) * 10) / 10) : "",
      budsjett: b.budsjett ?? {},
    });
  };

  // Hold-og-dra en plassert blokk: terskel før det telles som drag (ikke trykk),
  // live dato-boble mens du drar, popup forhåndsutfylt med nye datoer ved slipp.
  const PIXEL_TERSKEL = 6;
  const startBlokkDrag = (e: ReactPointerEvent<HTMLButtonElement>, b: NonNullable<WorkbenchData["seasonBlocks"]>[number]) => {
    if (!handlers) return;
    dragRef.current = { id: b.id, pointerId: e.pointerId, startX: e.clientX, moved: false };
  };
  const flyttBlokkDrag = (e: ReactPointerEvent<HTMLButtonElement>, b: NonNullable<WorkbenchData["seasonBlocks"]>[number]) => {
    const st = dragRef.current;
    if (!st || st.id !== b.id) return;
    const dx = e.clientX - st.startX;
    if (!st.moved && Math.abs(dx) > PIXEL_TERSKEL) {
      st.moved = true;
      e.currentTarget.setPointerCapture(st.pointerId);
    }
    if (!st.moved) return;
    const rect = banRef.current?.getBoundingClientRect();
    if (!rect) return;
    const deltaDager = Math.round((dx / rect.width) * totDager);
    setDrag({ id: b.id, deltaDager });
    const nyStart = new Date(b.startDate);
    nyStart.setDate(nyStart.getDate() + deltaDager);
    setBoble({ pct: ((dagIAaret(nyStart, year)) / totDager) * 100, tekst: datoKort(nyStart) });
  };
  const avsluttBlokkDrag = (e: ReactPointerEvent<HTMLButtonElement>, b: NonNullable<WorkbenchData["seasonBlocks"]>[number]) => {
    const st = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    setBoble(null);
    if (!st || st.id !== b.id) return;
    if (st.moved) {
      const dx = e.clientX - st.startX;
      const rect = banRef.current?.getBoundingClientRect();
      const deltaDager = rect ? Math.round((dx / rect.width) * totDager) : 0;
      if (deltaDager !== 0) aapneRedigerPopup(b, deltaDager);
    } else {
      aapneRedigerPopup(b);
    }
  };

  const lagre = async () => {
    if (!handlers || !popup || lagrer) return;
    setLagrer(true);
    setFeil(null);
    const minT = parseFloat(popup.ukevolumMinT.replace(",", "."));
    const maxT = parseFloat(popup.ukevolumMaxT.replace(",", "."));
    const res = await handlers.lagre(
      {
        lPhase: popup.lPhase,
        startDato: popup.startDato,
        sluttDato: popup.sluttDato,
        fokus: popup.fokus || undefined,
        ukevolumMin: Number.isFinite(minT) ? Math.round(minT * 60) : null,
        ukevolumMax: Number.isFinite(maxT) ? Math.round(maxT * 60) : null,
        budsjett: Object.keys(popup.budsjett).length > 0 ? popup.budsjett : null,
      },
      popup.periodeId,
    );
    setLagrer(false);
    if (res.ok) {
      setPopup(null);
      onEndret();
    } else {
      setFeil(res.error ?? "Kunne ikke lagre perioden.");
    }
  };

  const slett = async () => {
    if (!handlers || !popup?.periodeId || lagrer) return;
    setLagrer(true);
    const res = await handlers.slett(popup.periodeId);
    setLagrer(false);
    if (res.ok) {
      setPopup(null);
      onEndret();
    } else {
      setFeil(res.error ?? "Kunne ikke slette perioden.");
    }
  };

  // Lane-fordeling for overlappende blokker.
  const lanes: { b: (typeof blocks)[number]; lane: number }[] = [];
  const laneSlutt: number[] = [];
  for (const b of [...blocks].sort((x, y) => x.startDate.localeCompare(y.startDate))) {
    const s = dagIAaret(new Date(b.startDate), year);
    const e = dagIAaret(new Date(b.endDate), year);
    let lane = laneSlutt.findIndex((slutt) => slutt < s);
    if (lane === -1) { lane = laneSlutt.length; laneSlutt.push(e); } else { laneSlutt[lane] = e; }
    lanes.push({ b, lane });
  }
  const antallLanes = Math.max(1, laneSlutt.length);
  const naaPct = (dagIAaret(new Date(), year) / totDager) * 100;

  return (
    <Kort eyebrow={`Årsplan ${year}`} action={handlers ? (
      <button type="button" className="v2-press v2-focus" onClick={() => aapneNyPopup("GRUNN", new Date())} style={{ appearance: "none", background: "transparent", border: 0, cursor: "pointer", padding: 0 }}>
        <Caps size={9}>+ Ny periode</Caps>
      </button>
    ) : undefined}>
      <div style={{ overflowX: "auto" }} data-wb-aarsplan>
        <div style={{ minWidth: 860, paddingBottom: 4 }}>
          {/* Månedsakse */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", marginBottom: 6 }}>
            {MND_KORT.map((m) => (
              <span key={m} style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, borderLeft: `1px solid ${T.border}`, paddingLeft: 5 }}>{m}</span>
            ))}
          </div>

          {/* Baner med periodeblokker + drop-sone */}
          <div
            ref={banRef}
            data-wb-aarsplan-bane
            onDragOver={handlers ? (e) => {
              if (!e.dataTransfer.types.includes(DND_MIME)) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
              const d = datoFraX(e.clientX);
              setBoble({ pct: (dagIAaret(d, year) / totDager) * 100, tekst: datoKort(d) });
            } : undefined}
            onDragLeave={handlers ? () => setBoble(null) : undefined}
            onDrop={handlers ? (e) => {
              e.preventDefault();
              setBoble(null);
              try {
                const raw = e.dataTransfer.getData(DND_MIME);
                const p = raw ? (JSON.parse(raw) as { kind?: string; lPhase?: string }) : null;
                if (p?.kind === "periode" && p.lPhase && (PERIODE_TYPER as string[]).includes(p.lPhase)) {
                  aapneNyPopup(p.lPhase as LPhase, datoFraX(e.clientX));
                }
              } catch { /* ignorer ugyldig payload */ }
            } : undefined}
            style={{ position: "relative", borderRadius: 12, background: T.panel2, border: `1px dashed ${T.border}`, minHeight: 40 + antallLanes * 40, padding: "8px 0" }}
          >
            {/* Nå-linje */}
            <div style={{ position: "absolute", left: `${naaPct}%`, top: 0, bottom: 0, width: 2, background: T.lime, opacity: 0.7, borderRadius: 2 }} aria-hidden />

            {blocks.length === 0 && (
              <div style={{ padding: "18px 16px" }}>
                <TomTilstand icon="calendar-range" title="Ingen perioder ennå" sub={handlers ? "Dra en periodetype inn hit fra biblioteket — eller bruk + Ny periode." : "Årsplanen er ikke lagt ennå."} />
              </div>
            )}

            {lanes.map(({ b, lane }) => {
              const s = Math.max(0, dagIAaret(new Date(b.startDate), year));
              const e = Math.min(totDager - 1, dagIAaret(new Date(b.endDate), year));
              const sum = budsjettSum(b.budsjett ?? null);
              const farge = LPHASE_FARGE[b.lPhase] ?? T.mut;
              const draggesNaa = drag?.id === b.id;
              const visS = draggesNaa ? s + drag.deltaDager : s;
              const visE = draggesNaa ? e + drag.deltaDager : e;
              return (
                <button
                  key={b.id}
                  type="button"
                  data-wb-periode={b.id}
                  onPointerDown={handlers ? (ev) => startBlokkDrag(ev, b) : undefined}
                  onPointerMove={handlers ? (ev) => flyttBlokkDrag(ev, b) : undefined}
                  onPointerUp={handlers ? (ev) => avsluttBlokkDrag(ev, b) : undefined}
                  onPointerCancel={handlers ? (ev) => avsluttBlokkDrag(ev, b) : undefined}
                  className={`v2-focus ${draggesNaa ? "v2-drag-lift" : "v2-press v2-drag-settle"}`}
                  title={`${LPHASE_LABEL[b.lPhase]} · ${datoKort(new Date(b.startDate))}–${datoKort(new Date(b.endDate))}${b.focus ? ` · ${b.focus}` : ""}${handlers ? " · hold og dra for å flytte" : ""}`}
                  style={{
                    appearance: "none",
                    position: "absolute",
                    left: `${(visS / totDager) * 100}%`,
                    width: `${Math.max(0.8, ((visE - visS + 1) / totDager) * 100)}%`,
                    top: 8 + lane * 40,
                    height: 34,
                    borderRadius: 9,
                    background: `color-mix(in srgb, ${farge} 20%, ${T.panel})`,
                    border: `1px solid color-mix(in srgb, ${farge} 55%, transparent)`,
                    cursor: handlers ? "grab" : "default",
                    touchAction: handlers ? "none" : undefined,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 8px",
                    overflow: "hidden",
                    textAlign: "left",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: farge, flex: "none" }} />
                  <span style={{ fontFamily: T.ui, fontSize: 11, fontWeight: 700, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {LPHASE_LABEL[b.lPhase]}
                  </span>
                  {/* G3: peak-merke for turneringsperioder / høy ukevolum */}
                  {(b.lPhase === "TURNERING" || (b.weeklyVolMax != null && b.weeklyVolMax >= 600)) && (
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 7.5,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: T.onLime,
                        background: T.lime,
                        borderRadius: 4,
                        padding: "1px 5px",
                        flex: "none",
                      }}
                      title="Peak / konkurranse-nær periode"
                    >
                      Peak
                    </span>
                  )}
                  {sum > 0 && <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, color: T.fg2, flex: "none" }}>{sum}/uke</span>}
                </button>
              );
            })}

            {/* Dato-boble under drag (Anders: live dato som følger markøren) */}
            {boble && (
              <div style={{ position: "absolute", left: `${boble.pct}%`, top: -2, transform: "translate(-50%, -100%)", pointerEvents: "none", zIndex: 5 }}>
                <div style={{ background: T.lime, color: T.onLime, fontFamily: T.mono, fontSize: 10, fontWeight: 700, borderRadius: 8, padding: "4px 9px", whiteSpace: "nowrap", boxShadow: "0 6px 18px rgba(0,0,0,0.35)" }}>
                  {boble.tekst}
                </div>
                <div style={{ width: 2, height: 10, background: T.lime, margin: "0 auto" }} />
              </div>
            )}
          </div>

          {/* Turneringsrad */}
          <div style={{ position: "relative", height: 26, marginTop: 6 }}>
            {turneringer.map((t, i) => {
              const d = new Date(t.startDate);
              if (d.getFullYear() !== year) return null;
              const pct = (dagIAaret(d, year) / totDager) * 100;
              const major = t.priority === "MAJOR";
              return (
                <span key={i} title={`${t.title} · ${datoKort(d)}`} style={{ position: "absolute", left: `${pct}%`, top: 2, transform: "translateX(-50%)", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <Icon name="trophy" size={major ? 14 : 11} style={{ color: major ? T.warn : T.mut }} />
                </span>
              );
            })}
            {turneringer.length > 0 && (
              <span style={{ position: "absolute", right: 0, top: 4, fontFamily: T.mono, fontSize: 8, color: T.mut }}>turneringer</span>
            )}
          </div>

          {/* G3: legende periodetyper + peak + trophy */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10, alignItems: "center" }}>
            {(["GRUNN", "SPESIAL", "TURNERING", "FERIE"] as LPhase[]).map((p) => (
              <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: LPHASE_FARGE[p] }} />
                <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, color: T.mut, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {LPHASE_LABEL[p]}
                </span>
              </span>
            ))}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
              <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 800, color: T.onLime, background: T.lime, borderRadius: 3, padding: "1px 4px" }}>Peak</span>
              <span style={{ fontFamily: T.mono, fontSize: 8, color: T.mut }}>turnering / høy volum</span>
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon name="trophy" size={10} style={{ color: T.warn }} />
              <span style={{ fontFamily: T.mono, fontSize: 8, color: T.mut }}>turnering i kalender</span>
            </span>
          </div>
        </div>
      </div>

      {/* Periode-popup (ny/rediger) — Anders-logikken: alt justerbart, så Bekreft */}
      {popup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={lagrer ? undefined : () => setPopup(null)} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
          <div role="dialog" aria-label={popup.periodeId ? "Rediger periode" : "Ny periode"} className="v2-sheet-in" style={{ position: "relative", width: "min(440px, 100%)", maxHeight: "88vh", overflowY: "auto", background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: LPHASE_FARGE[popup.lPhase] }} />
              <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>
                {popup.periodeId ? "Rediger" : "Ny"} · {LPHASE_LABEL[popup.lPhase]}
              </h2>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, margin: "6px 0 0", lineHeight: 1.5 }}>{LPHASE_BESKRIVELSE[popup.lPhase]}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              <label style={{ display: "block" }}>
                <Caps size={8.5}>Fra</Caps>
                <input type="date" value={popup.startDato} onChange={(e) => setPopup({ ...popup, startDato: e.target.value })} style={feltStil} />
              </label>
              <label style={{ display: "block" }}>
                <Caps size={8.5}>Til</Caps>
                <input type="date" value={popup.sluttDato} min={popup.startDato} onChange={(e) => setPopup({ ...popup, sluttDato: e.target.value })} style={feltStil} />
              </label>
            </div>

            <label style={{ display: "block", marginTop: 10 }}>
              <Caps size={8.5}>Fokus</Caps>
              <input type="text" value={popup.fokus} placeholder="f.eks. Putting + nærspill" onChange={(e) => setPopup({ ...popup, fokus: e.target.value })} style={feltStil} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <label style={{ display: "block" }}>
                <Caps size={8.5}>Ukevolum min (t)</Caps>
                <input type="number" inputMode="decimal" min={0} step={0.5} value={popup.ukevolumMinT} onChange={(e) => setPopup({ ...popup, ukevolumMinT: e.target.value })} style={feltStil} />
              </label>
              <label style={{ display: "block" }}>
                <Caps size={8.5}>Ukevolum maks (t)</Caps>
                <input type="number" inputMode="decimal" min={0} step={0.5} value={popup.ukevolumMaxT} onChange={(e) => setPopup({ ...popup, ukevolumMaxT: e.target.value })} style={feltStil} />
              </label>
            </div>

            {/* Øktbudsjett per pyramideområde (Anders: «4 FYS-økter i uka») */}
            <div style={{ marginTop: 14 }}>
              <Caps size={8.5}>Økter per uke · per område</Caps>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 7 }}>
                {OMRAADER.map((o) => {
                  const verdi = popup.budsjett[o] ?? 0;
                  const sett = (v: number) => {
                    const nytt = { ...popup.budsjett };
                    if (v <= 0) delete nytt[o];
                    else nytt[o] = Math.min(21, v);
                    setPopup({ ...popup, budsjett: nytt });
                  };
                  return (
                    <div key={o} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 3, background: T.ax[o], flex: "none" }} />
                      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, width: 46 }}>{o}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                        <button type="button" onClick={() => sett(verdi - 1)} disabled={verdi <= 0} className="v2-press" aria-label={`Færre ${o}-økter`} style={stepperStil(verdi <= 0)}>−</button>
                        <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: verdi > 0 ? T.fg : T.mut, width: 22, textAlign: "center" }}>{verdi}</span>
                        <button type="button" onClick={() => sett(verdi + 1)} className="v2-press" aria-label={`Flere ${o}-økter`} style={stepperStil(false)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {budsjettSum(popup.budsjett) > 0 && (
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fg2, marginTop: 7 }}>Sum: {budsjettSum(popup.budsjett)} økter/uke</div>
              )}
            </div>

            {feil && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down, display: "block", marginTop: 10 }}>{feil}</span>}

            {bekreftSlett ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 16, padding: "10px 12px", borderRadius: 11, background: `color-mix(in srgb, ${T.down} 8%, ${T.panel2})`, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)` }}>
                <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg }}>Slette perioden? Kan ikke angres.</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Knapp ghost onClick={() => setBekreftSlett(false)} disabled={lagrer}>Avbryt</Knapp>
                  <Knapp icon="trash-2" onClick={slett} disabled={lagrer}>{lagrer ? "Sletter…" : "Bekreft"}</Knapp>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                {popup.periodeId && (
                  <Knapp ghost icon="trash-2" onClick={() => setBekreftSlett(true)} disabled={lagrer}>Slett</Knapp>
                )}
                <span style={{ flex: 1 }} />
                <Knapp ghost onClick={() => setPopup(null)} disabled={lagrer}>Avbryt</Knapp>
                <Knapp icon="check" onClick={lagre} disabled={lagrer || !popup.startDato || !popup.sluttDato}>
                  {lagrer ? "Lagrer…" : popup.periodeId ? "Lagre" : "Legg inn periode"}
                </Knapp>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lesevisning-hint når handlers mangler men blokker finnes */}
      {!handlers && blocks.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <StatusPill tone="info">Lesevisning</StatusPill>
        </div>
      )}
    </Kort>
  );
}

const feltStil: React.CSSProperties = {
  width: "100%",
  height: 40,
  borderRadius: 10,
  border: `1px solid ${T.borderS}`,
  background: T.panel2,
  color: T.fg,
  fontFamily: T.ui,
  fontSize: 13,
  padding: "0 10px",
  marginTop: 5,
};

function stepperStil(disabled: boolean): React.CSSProperties {
  return {
    appearance: "none",
    width: 30,
    height: 30,
    borderRadius: 9,
    border: `1px solid ${T.borderS}`,
    background: T.panel3,
    color: disabled ? T.mut : T.fg,
    fontFamily: T.mono,
    fontSize: 15,
    fontWeight: 700,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}

/* ── 8c.3: kompakt periodestrip (uke-/måned-zoom) ─────────────
   Mini-årshjul over canvaset: periodene som fargede segmenter, nå-markør
   og markering av visningsvinduet. Klikk → årsplan-zoom. Vises kun når
   spilleren faktisk har perioder (aldri pynte-tomrom). */
export function WBPeriodeStrip({ data, vindu, onTilAarsplan }: {
  data: WorkbenchData;
  /** Synlig vindu som markeres på stripen (f.eks. uka eller måneden). */
  vindu?: { fra: Date; til: Date };
  onTilAarsplan?: () => void;
}) {
  const blocks = data.seasonBlocks ?? [];
  if (blocks.length === 0) return null;
  const year = (data.weekStartISO ? new Date(data.weekStartISO) : new Date()).getFullYear();
  const totDager = dagerIAaret(year);
  const pct = (d: Date) => (Math.max(0, Math.min(totDager - 1, dagIAaret(d, year))) / totDager) * 100;
  const naaPct = pct(new Date());
  const aktiv = blocks.find((b) => {
    const s = new Date(b.startDate);
    const e = new Date(b.endDate);
    const naa = new Date();
    return s <= naa && naa <= e;
  });

  return (
    <button
      type="button"
      onClick={onTilAarsplan}
      className="v2-press v2-focus"
      title="Åpne årsplanen"
      data-wb-periodestrip
      style={{ appearance: "none", display: "block", width: "100%", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: "9px 14px", cursor: onTilAarsplan ? "pointer" : "default", textAlign: "left" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <Icon name="calendar-range" size={12} style={{ color: T.fg2 }} />
        <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>Periodisering</span>
        {aktiv && (
          <span style={{ fontFamily: T.ui, fontSize: 11, color: T.fg2 }}>
            Nå: <span style={{ fontWeight: 700, color: T.fg }}>{LPHASE_LABEL[aktiv.lPhase]}</span>
            {aktiv.focus ? ` · ${aktiv.focus}` : ""}
          </span>
        )}
        <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>årsplan →</span>
      </div>
      <div style={{ position: "relative", height: 10, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
        {blocks.map((b) => (
          <span key={b.id} style={{ position: "absolute", left: `${pct(new Date(b.startDate))}%`, width: `${Math.max(0.6, pct(new Date(b.endDate)) - pct(new Date(b.startDate)))}%`, top: 0, bottom: 0, background: LPHASE_FARGE[b.lPhase] ?? T.mut, opacity: 0.85 }} />
        ))}
        {vindu && (
          <span style={{ position: "absolute", left: `${pct(vindu.fra)}%`, width: `${Math.max(0.8, pct(vindu.til) - pct(vindu.fra))}%`, top: 0, bottom: 0, border: `1.5px solid ${T.fg}`, borderRadius: 4, boxSizing: "border-box" }} />
        )}
        <span style={{ position: "absolute", left: `${naaPct}%`, top: -1, bottom: -1, width: 2, background: T.lime }} />
      </div>
    </button>
  );
}
