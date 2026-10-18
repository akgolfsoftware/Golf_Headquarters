"use client";

/**
 * PH-13 Øvelse i nytt design (pakke 4, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjerm «ovelse». Stil: playerhq-ny-ovelser.css.
 *
 * Øvelsen viser AK-formelen i de åtte trinnene fra masteren og «Legg i plan» for en dag denne uka.
 * «Legg i plan» lager en ny økt med øvelsen i Workbench (createSessionFromSource), som utkast.
 *
 * Avvik:
 *   - Mål (trinn 8) og målet under det store tallet vises som «—»: øvelsene har ikke mål i basen.
 *   - Måleutstyr (trinn 4) er utstyrslista på øvelsen, ikke TrackMan ja/nei.
 *   - «Slik gjør du det» er øvelsens egen beskrivelse, ikke de faste stegene i utkastet.
 *   - Varighet kan ikke velges i «Legg i plan»: økta får øvelsens egen varighet. Endres i Workbench.
 *   - Dager som er passert i uka kan ikke velges.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-13.
 */
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { createSessionFromSource } from "@/lib/workbench/wb-actions";
import { OV_AKSE_KODE, OV_AKSE_NAVN, type OvelseVisning, type UkeDag } from "@/lib/portal-drills/ovelser-visning";
import { OvTilbake } from "./PH13Felles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-ovelser.css";

export type PH13DetaljProps = {
  ovelse: OvelseVisning;
  /** null: brukeren kan ikke legge inn økter (forelder). */
  playerId: string | null;
  uke: { nr: number; dager: UkeDag[] };
  /** Skjermprøven: åpne «Legg i plan» ved første visning. */
  startMedArk?: boolean;
};

export function PH13DrillDetalj({ ovelse: o, playerId, uke, startMedArk }: PH13DetaljProps) {
  const [ark, setArk] = useState(!!startMedArk);
  const [melding, setMelding] = useState<string | null>(null);
  const formel: [string, string][] = [
    ["Hensikt", `${OV_AKSE_KODE[o.akse]} · ${OV_AKSE_NAVN[o.akse]}`],
    ["Treningsområde", o.omraade ?? "—"],
    ["Sted og treningsmiljø", o.miljo.join(", ") || "—"],
    ["Måleutstyr", o.utstyr.join(", ") || "—"],
    ["Gjennomføring", o.motorikk ?? "—"],
    ["Press", o.press ?? "—"],
    ["Mengde", o.mengde ?? (o.min != null ? `${o.min} min` : "—")],
    ["Mål", "—"],
  ];
  const stort = o.mengde ?? (o.min != null ? String(o.min) : "—");
  const stortTekst = o.mengde ? (o.min != null ? `${o.min} min` : "") : o.min != null ? "min" : "Mengde ikke satt";
  const brukt = o.brukt > 0 ? `brukt i ${o.brukt} ${o.brukt === 1 ? "økt" : "økter"} siste 30 dager` : "ny for deg";

  return (
    <div className="phn">
      <OvTilbake href="/portal/drills" tekst="Øvelsesbank" />
      <div className="phn-ov-topp">
        <span className="phn-dato">Øvelsesbank · {OV_AKSE_KODE[o.akse]}{o.omraade ? ` · ${o.omraade}` : ""}</span>
        <h1 className="phn-tittel">{o.navn}</h1>
      </div>
      {melding && <p className="phn-ov-status" role="status">{melding}</p>}
      <div className="phn-ov-ovgrid">
        <div className="phn-seksjon" style={{ gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public eller øvelsens eget bilde */}
          <img className="phn-ov-helt" src={o.bilde.src} alt="" width={1400} height={933} style={{ objectPosition: o.bilde.posisjon }} />
          <div className="phn-hoved"><strong>{stort}</strong>{stortTekst && <span className="phn-forklar">{stortTekst}</span>}</div>
          <div className="phn-knapper">
            {playerId && <button type="button" className="phn-knapp pri" onClick={() => setArk(true)}>Legg i plan</button>}
            <Link className="phn-knapp sek" href="/portal/caddie">Spør Caddie om øvelsen</Link>
          </div>
          <section className="phn-seksjon" aria-label="Slik gjør du det">
            <div className="phn-sek-topp"><h2>Slik gjør du det</h2></div>
            <p className="phn-ov-beskrivelse">{o.beskrivelse ?? "Øvelsen har ingen beskrivelse ennå."}</p>
          </section>
          <p className="phn-kilde">{o.kilde} · {brukt}</p>
        </div>
        <section className="phn-seksjon" aria-label="AK-formelen">
          <div className="phn-sek-topp"><h2>AK-formelen</h2><span className="phn-kilde">Åtte trinn</span></div>
          <dl className="phn-ov-formel">
            {formel.map(([navn, verdi], i) => <div key={navn}><dt data-nr={i + 1}>{navn}</dt><dd>{verdi}</dd></div>)}
          </dl>
        </section>
      </div>
      {ark && playerId && <LeggIPlanArk o={o} playerId={playerId} uke={uke} onLukk={() => setArk(false)} onLagt={(t) => { setArk(false); setMelding(t); }} />}
    </div>
  );
}

function LeggIPlanArk({ o, playerId, uke, onLukk, onLagt }: { o: OvelseVisning; playerId: string; uke: PH13DetaljProps["uke"]; onLukk: () => void; onLagt: (tekst: string) => void }) {
  const ark = useRef<HTMLDialogElement>(null);
  const ledige = uke.dager.filter((d) => !d.forbi);
  const [dag, setDag] = useState(ledige[1]?.iso ?? ledige[0]?.iso ?? "");
  const [tid, setTid] = useState("16:00");
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, start] = useTransition();
  useEffect(() => { ark.current?.showModal(); }, []);

  const lagre = () => {
    const [t, m] = tid.split(":").map(Number);
    if (!dag || !Number.isFinite(t) || !Number.isFinite(m)) { setFeil("Velg dag og starttid."); return; }
    start(async () => {
      setFeil(null);
      // Kilde-ID for en øvelse i banken: «drill:<id>» (src/lib/workbench/sources-map.ts).
      const r = await createSessionFromSource({ playerId, sourceId: `drill:${o.id}`, date: dag, startMinute: t * 60 + m });
      if (!r.ok) { setFeil(r.error); return; }
      const d = uke.dager.find((x) => x.iso === dag);
      onLagt(`${o.navn} er lagt inn ${d ? `${d.kort} ${d.dag}.` : dag} kl. ${tid} som utkast. Den teller i uka med en gang.`);
    });
  };

  return (
    <dialog ref={ark} className="phn-ark" aria-label="Legg i plan" onClose={onLukk} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      <div className="phn-ark-kropp">
        <div className="phn-ark-topp">
          <h2>Legg i plan</h2>
          <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button>
        </div>
        {feil && <p className="phn-melding" role="alert">{feil}</p>}
        <div className="phn-felt"><span>Dag i uke {uke.nr}</span>
          <div className="phn-ov-ukedager" role="group" aria-label={`Dag i uke ${uke.nr}`}>
            {uke.dager.map((d) => <button key={d.iso} type="button" aria-pressed={dag === d.iso} disabled={d.forbi} onClick={() => setDag(d.iso)}>{d.kort}<b>{d.dag}</b></button>)}
          </div>
        </div>
        <label className="phn-felt">Starttid<input type="time" value={tid} onChange={(e) => setTid(e.target.value)} /></label>
        <p className="phn-kilde">Øvelsen legges inn som utkast i Workbench{o.min != null ? `, ${o.min} min` : ""}, og teller i uka med en gang.</p>
        <button type="button" className="phn-knapp pri phn-ov-knapp-stor" disabled={lagrer || !dag} onClick={lagre}>{lagrer ? "Legger inn …" : "Legg inn"}</button>
      </div>
    </dialog>
  );
}
