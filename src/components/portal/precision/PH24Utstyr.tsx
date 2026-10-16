"use client";

/**
 * PH-24 Meg › Utstyr i nytt design: lengste carry øverst, bagen som rader med carry-stolpe i
 * SLAG-farge, køllene og annet utstyr som tekst, og «Endre bagen» i et ark.
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, skjermen «Utstyr»).
 * Stil: src/styles/playerhq-ny-meg.css. Lagring går som før via lagreUtstyrsbag.
 *
 * Avvik:
 *   - Bagen viser de målte køllene fra TrackMan (median carry), ikke 13 faste køller: bagen er fritekst
 *     per køllegruppe, så carry kan bare vises for køllene som er målt.
 *   - Det store tallet er lengste målte carry, ikke nødvendigvis driveren.
 *   - «Legg til utstyr» er en del av «Endre bagen»; Klokke og Radar finnes ikke som felt.
 *   - Avstand mellom køllene (for tett eller for stort) er beholdt fra forrige versjon.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-24-UTSTYR.
 */
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";
import type { UtstyrsbagInput } from "@/app/portal/meg/utstyrsbag/actions";
import type { UtstyrFlateData } from "@/lib/portal/utstyr-data";
import { analyserGap } from "@/lib/portal/ph24-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";

export type PH24UtstyrProps = {
  data: UtstyrFlateData;
  initialBag: UtstyrsbagInput;
  onLagreBag: (data: UtstyrsbagInput) => Promise<void>;
};

const FELT: { key: keyof UtstyrsbagInput; label: string; hint: string }[] = [
  { key: "driver", label: "Driver", hint: "Modell, loft og skaft" },
  { key: "fairwayWoods", label: "Fairwaywood", hint: "3-wood, 5-wood" },
  { key: "hybrids", label: "Hybrider", hint: "Modell og loft" },
  { key: "irons", label: "Jern", hint: "Modell og spenn, f.eks. 4–PW" },
  { key: "wedges", label: "Wedger", hint: "Loft, bounce og grind" },
  { key: "putter", label: "Putter", hint: "Modell og lengde" },
  { key: "ball", label: "Ball", hint: "Modellen du spiller" },
  { key: "bag", label: "Bag", hint: "Bærebag eller trallebag" },
  { key: "notes", label: "Notater", hint: "Grep, skaft og tilpasninger" },
];

export function PH24Utstyr({ data, initialBag, onLagreBag }: PH24UtstyrProps) {
  const ark = useRef<HTMLDialogElement>(null);
  const [bag, setBag] = useState<UtstyrsbagInput>(initialBag);
  const [melding, setMelding] = useState<{ ok: boolean; tekst: string } | null>(null);
  const [pending, start] = useTransition();

  const maks = data.koller.length ? Math.max(...data.koller.map((k) => k.median)) : 0;
  const lengst = data.koller.length ? data.koller.reduce((a, k) => (k.median > a.median ? k : a)) : null;
  const synkende = [...data.koller].sort((a, b) => b.median - a.median);
  const gap = data.koller.slice(0, -1).map((k, i) => analyserGap(k.klubb, data.koller[i + 1]!.klubb, k.median, data.koller[i + 1]!.median)).filter((g) => g.status !== "normal");

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setMelding(null);
    start(async () => {
      try {
        await onLagreBag(bag);
        ark.current?.close();
        setMelding({ ok: true, tekst: "Bagen er lagret." });
      } catch { setMelding({ ok: false, tekst: "Kunne ikke lagre bagen. Prøv igjen." }); }
    });
  }

  return <div className="phn phn-meg"><div className="side">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link>
      <div><div className="phn-dato">Meg · utstyr</div><h1 className="phn-tittel">Utstyr</h1></div>
    </div>

    <div className="to-del">
      <div>
        <div className="phn-kort">
          <div className="phn-hoved"><strong>{lengst ? Math.round(lengst.median) : "—"}{lengst && <small>m</small>}</strong><span className="phn-forklar">{lengst ? `carry med ${lengst.klubb}` : "lengste carry"}</span></div>
          <p className="phn-kilde">{data.okter > 0 ? `Kilde: TrackMan, median siste ${data.vinduDager} dager, ${data.okter} ${data.okter === 1 ? "økt" : "økter"}.` : "Ingen TrackMan-økter er registrert ennå."}</p>
        </div>
        <section className="phn-seksjon" aria-labelledby="utstyr-bag">
          <div className="phn-sek-topp"><h2 id="utstyr-bag">Bagen</h2><span className="phn-kilde">{data.koller.length ? `${data.koller.length} målte køller · carry i meter` : "Carry i meter"}</span></div>
          {synkende.length
            ? <ul className="bag">{synkende.map((k) => <li key={k.klubb}>
              <b>{k.klubb}</b>
              <span className="stolpe" aria-hidden><span style={{ width: `${maks ? Math.round(k.median / maks * 100) : 0}%` }} /></span>
              <span className="v">{Math.round(k.median)}</span>
            </li>)}</ul>
            : <div className="phn-kort dempet"><p className="phn-forklar">Carry vises når du har slått med køllene på TrackMan.</p></div>}
          {gap.length > 0 && <ul className="bag uten-topp" aria-label="Avstand mellom køllene">{gap.map((g) => <li key={`${g.fra}-${g.til}`} style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
            <span><b>{g.fra} til {g.til}</b> · {g.forklaring}</span>
            <span className="phn-pille vent"><i />{g.status === "for-tett" ? "For tett" : "For stort"}</span>
          </li>)}</ul>}
        </section>
      </div>

      <div>
        <div className="phn-kort">
          <b className="phn-undertittel">Køllene og annet utstyr</b>
          {data.harBag
            ? <ul className="bag to-kol uten-topp">{[...data.bagFelter, ...data.tilbehor].map((f) => <li key={f.kort}><b>{f.label}</b><span>{f.verdi}</span></li>)}</ul>
            : <p className="phn-forklar">Bagen er ikke registrert ennå.</p>}
          {data.notater && <p className="phn-kilde">{data.notater}</p>}
        </div>
        <div className="phn-meldinger" aria-live="polite">{melding && <p className="phn-melding" role={melding.ok ? "status" : "alert"}>{melding.tekst}</p>}</div>
        <div className="phn-knapper"><button type="button" className="phn-knapp pri" onClick={() => { setMelding(null); ark.current?.showModal(); }}>Endre bagen</button></div>
        <p className="phn-kilde">Køllene brukes i runderegistreringen og i TrackMan-oversikten i Stats.</p>
      </div>
    </div>

    <dialog ref={ark} className="phn-ark" aria-labelledby="utstyr-ark-tittel" onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      <form className="phn-ark-kropp" onSubmit={lagre}>
        <div className="phn-ark-topp"><h2 id="utstyr-ark-tittel">Endre bagen</h2><button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X size={20} aria-hidden /></button></div>
        {FELT.map((f) => <label key={f.key} className="phn-felt">{f.label}
          {f.key === "notes"
            ? <textarea rows={2} value={bag[f.key] ?? ""} onChange={(e) => setBag((b) => ({ ...b, [f.key]: e.target.value }))} maxLength={200} />
            : <input value={bag[f.key] ?? ""} onChange={(e) => setBag((b) => ({ ...b, [f.key]: e.target.value }))} maxLength={200} />}
          <span className="hjelp">{f.hint}</span>
        </label>)}
        <div className="phn-ark-fot"><button type="submit" className="phn-knapp pri stor" disabled={pending}>{pending ? "Lagrer …" : "Lagre bagen"}</button></div>
      </form>
    </dialog>
  </div></div>;
}
