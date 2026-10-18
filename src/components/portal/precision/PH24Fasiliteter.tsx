"use client";

/**
 * PH-24 Meg › Fasiliteter i nytt design: hvor spilleren kan trene, vist som fylte områder i aksefargen
 * og stiplet for det som mangler. Trykk på et område slår det av eller på; Lagre skriver til
 * lagreFasilitetProfil (uendret).
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, skjermen «Fasiliteter»).
 * Stil: src/styles/playerhq-ny-meg.css.
 *
 * Avvik:
 *   - Tallet er anlegg og utstyr av 10, ikke dekning av de 19 treningsområdene: svarene fra
 *     fasilitetsspørsmålene i oppstarten lagres ikke, så dekningen kan ikke regnes uten å gjette.
 *   - Spørsmålsflyten «ett spørsmål om gangen» er ikke med. Valgene endres direkte i rutenettet.
 *   - Styrke, kondisjon og bevegelighet (FYS) er ikke med: lagreFasilitetProfil godtar bare de ti
 *     verdiene i katalogen og ville stille droppet vektstang, trapbar, løpebane og medisinball.
 *   - Stedene fra oppstarten vises som liste; de kan ikke endres her.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-24-FASILITETER.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, X } from "lucide-react";
import type { DrillFasilitet } from "@/generated/prisma/client";
import { lagreFasilitetProfil } from "@/app/portal/meg/innstillinger/actions";
import { ANTALL_FASILITETER, FASILITET_FAMILIER } from "@/lib/portal/fasilitet-katalog";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";

export type PH24FasiliteterData = { tilgjengelig: DrillFasilitet[]; steder: { id: string; navn: string; inne: boolean }[] };

export function PH24Fasiliteter({ data, lagre = lagreFasilitetProfil }: { data: PH24FasiliteterData; lagre?: typeof lagreFasilitetProfil }) {
  const router = useRouter();
  const [valgte, setValgte] = useState<Set<DrillFasilitet>>(() => new Set(data.tilgjengelig));
  const [melding, setMelding] = useState<{ ok: boolean; tekst: string } | null>(null);
  const [pending, start] = useTransition();
  const kjente = new Set(FASILITET_FAMILIER.flatMap((f) => f.valg.map((v) => v.kode)));
  const antall = [...valgte].filter((k) => kjente.has(k)).length;
  const mangler = FASILITET_FAMILIER.flatMap((f) => f.valg).filter((v) => !valgte.has(v.kode)).map((v) => v.tittel.toLowerCase());
  const endret = antall !== data.tilgjengelig.filter((k) => kjente.has(k)).length || data.tilgjengelig.some((k) => kjente.has(k) && !valgte.has(k));

  function bytt(kode: DrillFasilitet) {
    setMelding(null);
    setValgte((s) => { const n = new Set(s); if (n.has(kode)) n.delete(kode); else n.add(kode); return n; });
  }
  function lagreValg() {
    setMelding(null);
    start(async () => {
      try {
        const r = await lagre([...valgte]);
        if (r.ok) { setMelding({ ok: true, tekst: "Lagret. Planforslagene bruker de nye valgene." }); router.refresh(); }
        else setMelding({ ok: false, tekst: r.error ?? "Kunne ikke lagre. Prøv igjen." });
      } catch { setMelding({ ok: false, tekst: "Kunne ikke lagre. Prøv igjen." }); }
    });
  }

  return <div className="phn phn-meg"><div className="side smal">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link>
      <div><div className="phn-dato">Meg · fasiliteter</div><h1 className="phn-tittel">Fasiliteter</h1></div>
    </div>

    <div className="phn-kort">
      <div className="phn-hoved"><strong>{antall}<small>av {ANTALL_FASILITETER}</small></strong><span className="phn-forklar">anlegg og utstyr du har tilgang til</span></div>
      <div className="stolpe" aria-hidden><span style={{ width: `${Math.round(antall / ANTALL_FASILITETER * 100)}%`, background: "var(--phn-slag)" }} /></div>
      <p className="phn-kilde">Planforslagene og øvelsesbanken bruker dette. Trykk på et område for å endre det.</p>
    </div>

    {FASILITET_FAMILIER.map((f) => <div key={f.navn} className="familie" role="group" aria-label={f.navn}>
      <span>{f.navn}</span>
      <div className="omr-grid">
        {f.valg.map((v) => {
          const ja = valgte.has(v.kode);
          return <button key={v.kode} type="button" className={`omr ${ja ? `a-${f.akse}` : "mangler"}`} aria-pressed={ja} onClick={() => bytt(v.kode)} title={v.hjelp}>
            {ja ? <Check size={16} aria-hidden /> : <X size={16} aria-hidden />}
            <span>{v.tittel}{ja ? "" : " · mangler"}</span>
          </button>;
        })}
      </div>
    </div>)}

    <div className="phn-kort dempet">
      <b className="phn-undertittel">Dette mangler</b>
      <p className="phn-forklar">{mangler.length
        ? `${mangler.join(", ").replace(/^./, (c) => c.toUpperCase())}. Planen foreslår ikke økter du ikke har sted til. Du kan likevel legge inn en økt et annet sted.`
        : "Ingenting. Du har tilgang til alt i lista."}</p>
    </div>

    {data.steder.length > 0 && <section className="phn-seksjon" aria-labelledby="fas-steder">
      <div className="phn-sek-topp"><h2 id="fas-steder">Stedene dine</h2><span className="phn-kilde">Fra oppstarten</span></div>
      <ul className="bag to-kol">
        {data.steder.map((s) => <li key={s.id}><b>{s.inne ? "Inne" : "Ute"}</b><span>{s.navn}</span></li>)}
      </ul>
    </section>}

    <div className="phn-meldinger" aria-live="polite">{melding && <p className="phn-melding" role={melding.ok ? "status" : "alert"}>{melding.tekst}</p>}</div>
    <button type="button" className="phn-knapp pri stor" onClick={lagreValg} disabled={pending || !endret}>{pending ? "Lagrer …" : "Lagre"}</button>
  </div></div>;
}
