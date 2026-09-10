"use client";
/**
 * Fasit: designsystem/train-lock/PH-21 Min kurve.dc.html
 * Avvik:
 *   - Faktiske GolfBox-runder, kilde og datadekning er lagt til eksisterende historikk.
 *   - Funksjonell videreutvikling mens ny Claude Design-versjon utarbeides.
 */
import { useState } from "react";
import { Caps, Kort, TomTilstand } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";
import type { Turneringshistorikk } from "@/lib/domain/turneringshistorikk";
import { resultatKilde, resultatStatus } from "@/lib/domain/turneringsresultat";

const dato = (d: Date) => new Date(d).toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" });
const motPar = (n: number | null) => n == null ? "—" : n > 0 ? `+${n}` : String(n);
const meta = { fontSize: 13, lineHeight: 1.6, color: TL.mute };
const kontroll = { minHeight: 44, minWidth: 0, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.field, background: TL.elev, color: TL.text, padding: "8px 12px", fontSize: 16 };

export function TurneringshistorikkTrainLock({ h, mobile = false }: { h: Turneringshistorikk; mobile?: boolean }) {
  const [sesong, setSesong] = useState("alle");
  const [sok, setSok] = useState("");
  const [antall, setAntall] = useState(20);
  if (!h.harHistorikk) return <Kort><TomTilstand icon="trophy" title="Ingen turneringer å vise" sub={h.tomGrunn} /></Kort>;
  const rader = h.aar.filter(a => sesong === "alle" || String(a.aar) === sesong).flatMap(a => a.turneringer)
    .filter(t => t.navn.toLocaleLowerCase("nb").includes(sok.toLocaleLowerCase("nb")));
  return <section aria-label="Din turneringshistorikk" style={{ display: "grid", gap: 14, minWidth: 0 }}>
    <Kort eyebrow="Din turneringshistorikk">
      <div style={{ display: "flex", gap: mobile ? 20 : 34, flexWrap: "wrap" }}>
        <div><strong style={{ fontSize: 26 }}>{h.antall}</strong><Caps>turneringsstarter</Caps></div>
        <div><strong style={{ fontSize: 26 }}>{h.bestePlassering != null ? `${h.bestePlassering}.` : "—"}</strong><Caps>beste plassering</Caps></div>
      </div>
      <p style={meta}>Beste plassering gjelder egen klasse og bygger på {h.medPlassering} fullførte resultater med plassering.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 12, marginTop: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>Sesong<select style={kontroll} value={sesong} onChange={e => { setSesong(e.target.value); setAntall(20); }}>
          <option value="alle">Alle sesonger</option>{h.aar.map(a => <option key={a.aar} value={a.aar}>{a.aar}</option>)}
        </select></label>
        <label style={{ display: "grid", gap: 6 }}>Søk i turneringer<input type="search" style={kontroll} value={sok} onChange={e => { setSok(e.target.value); setAntall(20); }} /></label>
      </div>
    </Kort>
    <Kort>
      {!rader.length && <p role="status">Ingen turneringer matcher utvalget.</p>}
      {rader.slice(0, antall).map(t => <details key={t.turneringId} style={{ borderBottom: `1px solid ${TL.hair}`, padding: "12px 0", overflowWrap: "anywhere" }}>
        <summary style={{ minHeight: 48, cursor: "pointer" }}>
          <strong>{t.navn}</strong><br />
          <span style={meta}>{dato(t.startDato)} · {resultatStatus(t.status)} · {resultatKilde(t.kilde)}</span><br />
          <span>{t.brutto != null ? `${t.brutto} slag brutto` : "Totalscore mangler"}
            {t.plassering != null && t.status === "FINISHED" ? ` · Plass ${t.plasseringTekst ?? t.plassering} i klassen` : ""}</span>
        </summary>
        {t.klasse && <p style={meta}>Klasse: {t.klasse}</p>}
        {t.motPar != null && <p style={meta}>Score mot par fra kilden: {motPar(t.motPar)}.</p>}
        {(t.runder?.length ?? 0) > 0 ? <table style={{ width: "100%", tableLayout: "fixed", textAlign: "left", fontVariantNumeric: "tabular-nums", marginTop: 12 }}>
          <thead><tr><th scope="col">Runde</th><th scope="col">Brutto</th><th scope="col">Mot par</th></tr></thead>
          <tbody>{t.runder?.map(r => <tr key={r.nummer}>
            <th scope="row" style={{ padding: "10px 0", fontWeight: 400 }}>{r.nummer}{r.hull ? <small style={{ display: "block", ...meta }}>{r.hull} hull</small> : null}</th>
            <td>{r.brutto ?? "—"}{r.fullfort !== true && <small style={{ display: "block", ...meta }}>{r.fullfort === false ? "Ikke fullført" : "Fullstendighet ukjent"}</small>}</td>
            <td>{motPar(r.motPar)}</td>
          </tr>)}</tbody>
        </table> : <p style={meta}>Rundedetaljer er ikke tilgjengelige ennå.</p>}
        {t.kildeDelvis && <p role="status" style={meta}>Kilden er delvis hentet. Flere klasser kan mangle.</p>}
        <p style={meta}>{t.kildeDato ? `Resultatene ble hentet ${dato(t.kildeDato)}.` : "Hentedato for resultatene er ikke dokumentert."} Turneringsdatoen er ikke nødvendigvis datoen for hver runde.</p>
        {t.kildeUrl && /^https?:\/\//i.test(t.kildeUrl) && <a href={t.kildeUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", minHeight: 44, alignItems: "center", textDecoration: "underline" }}>Se hos arrangøren</a>}
      </details>)}
      {rader.length > antall && <button style={{ ...kontroll, marginTop: 12 }} onClick={() => setAntall(n => n + 20)}>Vis flere turneringer</button>}
    </Kort>
  </section>;
}
