"use client";

import { useEffect, useMemo, useState } from "react";

import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";
import type { TnTrenerVerktoy } from "@/components/portal/precision/PH15TnTest";
import { kobleTrackManTilTest } from "@/app/team-norway/tn-testokt-actions";
import type { TnProtocol } from "@/lib/portal-tester/tn-catalog";
import { foreslaKobling, fraMaalet, grenseFor, type TmSlag } from "@/lib/trackman/test-kobling";

/**
 * TrackMan-import og kobling til testslag i trenerens testøkt (utkast 3, «Import og kobling» og «Slag som ikke
 * passer», Anders 22.10.2026). Forslaget går i rekkefølge med riktig kølle. Treneren bekrefter alle med ett trykk
 * eller bytter ett og ett i lista. Slag mer enn 15 m (30 m i Driver Basic) fra målet foreslås ikke, men kan velges.
 * Carry og Side fylles i utkastet; koblingen lagres når testen er lagret på serveren (revisjon ≥ 1).
 */
export type TnKoblingOkt = { id: string; dato: string; akse: "TEK" | "SLAG" | null; slag: TmSlag[] };

const tall = (v: number | null, d = 1) => (v === null ? "—" : v.toLocaleString("nb-NO", { minimumFractionDigits: d, maximumFractionDigits: d }));
const sideTekst = (v: number | null) => (v === null ? "—" : `${tall(Math.abs(v))} ${v < 0 ? "V" : v > 0 ? "H" : ""}`.trim());
const slagNavn = (s: TmSlag) => `TM ${s.shotNumber} · ${s.club ?? "—"} · Carry ${tall(s.carryDistance)} · Side ${sideTekst(s.side)}`;

export function TnTrackManKobling({ spillerId, protocol, okter, ctx }: { spillerId: string; protocol: TnProtocol; okter: TnKoblingOkt[]; ctx: TnTrenerVerktoy }) {
  const [oktId, setOktId] = useState(okter[0]?.id ?? "");
  const okt = okter.find((o) => o.id === oktId) ?? null;
  const testslag = useMemo(() => protocol.rows.map((r, i) => ({ indeks: i, target: r.target ?? null })), [protocol]);
  const forslag = useMemo(() => (okt ? foreslaKobling(protocol.id, testslag, okt.slag) : null), [okt, protocol.id, testslag]);
  const [valg, setValg] = useState<Record<number, string>>({});
  const [ventende, setVentende] = useState<{ forsokIndeks: number; trackManShotId: string; passerIkke: boolean }[] | null>(null);
  const [melding, setMelding] = useState<string | null>(null);

  // Nytt forslag når økta byttes: foreslåtte slag som passer, ellers tomt.
  useEffect(() => {
    if (!forslag) return;
    setValg(Object.fromEntries(forslag.forslag.map((f) => [f.indeks, f.slag && !f.passerIkke ? f.slag.id : ""])));
  }, [forslag]);

  // Koblingen lagres når testen finnes på serveren.
  useEffect(() => {
    if (!ventende || ctx.revision < 1) return;
    const liste = ventende;
    setVentende(null);
    void kobleTrackManTilTest({ spillerId, testSessionId: ctx.sessionId, koblinger: liste }).then((r) =>
      setMelding(r.ok ? `${r.antall} slag koblet til TrackMan (TM).` : r.error),
    );
  }, [ventende, ctx.revision, ctx.sessionId, spillerId]);

  function bekreft() {
    if (!okt) return;
    const rader: Record<number, Record<string, string>> = {};
    const koblinger: { forsokIndeks: number; trackManShotId: string; passerIkke: boolean }[] = [];
    for (const t of testslag) {
      const s = okt.slag.find((x) => x.id === valg[t.indeks]);
      if (!s || s.carryDistance === null || s.side === null) continue;
      rader[t.indeks] = { carry: String(s.carryDistance), side: String(s.side) };
      const d = fraMaalet(t.target, s);
      koblinger.push({ forsokIndeks: t.indeks, trackManShotId: s.id, passerIkke: d !== null && d > grenseFor(protocol.id) });
    }
    if (!koblinger.length) { setMelding("Ingen slag er valgt."); return; }
    ctx.fyll(rader);
    setVentende(koblinger);
    setMelding(`Carry og Side er fylt inn for ${koblinger.length} slag. Koblingen lagres med testen.`);
  }

  const brukt = new Set(Object.values(valg).filter(Boolean));

  return (
    <section className="phn-kort" aria-label="TrackMan">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>TrackMan</h2>
        <TrackmanImportModal variant="secondary" label="Importer fra TrackMan" onBehalfOfUserId={spillerId} onImportert={setOktId} triggerStyle={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 16px" }} />
      </div>
      {!okter.length ? (
        <p className="phn-forklar">Ingen TrackMan-økter for spilleren ennå. Importer fila, så foreslår appen hvilke slag som hører til testen.</p>
      ) : (
        <>
          <label style={{ display: "grid", gap: 4, maxWidth: 480, minWidth: 0 }}>
            <span className="phn-kilde">TrackMan-økt</span>
            <select value={oktId} onChange={(e) => setOktId(e.target.value)} style={{ minHeight: 44, maxWidth: "100%" }}>
              {okter.map((o) => <option key={o.id} value={o.id}>{o.dato} · {o.akse ?? "—"} · {o.slag.length} slag</option>)}
            </select>
          </label>
          {forslag && okt ? (
            <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
              {forslag.forslag.map((f) => (
                <label key={f.indeks} style={{ display: "grid", gap: 4, minWidth: 0 }}>
                  <span style={{ fontWeight: 600 }}>Testslag {f.indeks + 1}{f.target === null ? "" : ` · ${f.target} m`}</span>
                  <select value={valg[f.indeks] ?? ""} disabled={ctx.laast} onChange={(e) => setValg((v) => ({ ...v, [f.indeks]: e.target.value }))} style={{ minHeight: 44, maxWidth: "100%", minWidth: 0 }}>
                    <option value="">Ikke koblet · føres for hånd</option>
                    {okt.slag.map((s) => <option key={s.id} value={s.id} disabled={brukt.has(s.id) && valg[f.indeks] !== s.id}>{slagNavn(s)}</option>)}
                  </select>
                  {f.passerIkke && f.slag ? (
                    <span className="phn-kilde">Passer ikke: TM {f.slag.shotNumber} ligger {tall(f.fraMaalet)} m fra målet (grensen er {grenseFor(protocol.id)} m). Velg det i lista for å koble likevel.</span>
                  ) : null}
                </label>
              ))}
              {forslag.feilKolle.length ? <p className="phn-kilde">Feil kølle, hoppet over: {forslag.feilKolle.map((s) => `TM ${s.shotNumber} (${s.club ?? "—"})`).join(", ")}.</p> : null}
              {forslag.mangler ? <p className="phn-kilde">For få slag: {forslag.mangler} testslag mangler TrackMan-slag. Før dem for hånd.</p> : null}
              <div className="phn-knapper">
                <button type="button" className="phn-knapp pri" disabled={ctx.laast || !brukt.size} onClick={bekreft}>Bekreft {brukt.size} slag</button>
              </div>
              <p className="phn-kilde">Carry og Side kommer fra TrackMan. Avstand fra hullet og PEI regnes av appen.</p>
            </div>
          ) : null}
        </>
      )}
      {melding ? <p role="status" className="phn-forklar">{melding}</p> : null}
    </section>
  );
}
