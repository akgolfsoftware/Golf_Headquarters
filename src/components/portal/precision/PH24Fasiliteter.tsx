"use client";

/**
 * PH-24 Meg › Fasiliteter i nytt design: hvilke av de 19 treningsområdene spilleren kan trene på, vist som
 * fylte områder i aksefargen og stiplet for det som mangler. Områdene er svarene fra oppstarten
 * (preferences.onboarding.fasilitetOmrader) og lagres med lagreFasilitetOmrader. Under ligger anlegg og
 * utstyr som før (lagreFasilitetProfil, uendret). Én Lagre lagrer det som er endret.
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, skjermen «Fasiliteter»).
 * Stil: src/styles/playerhq-ny-meg.css.
 *
 * Avvik:
 *   - Spørsmålsflyten «ett spørsmål om gangen» er ikke med. Områdene endres direkte i rutenettet.
 *   - Har spilleren ikke svart i oppstarten, vises «—» og alle områdene som ikke valgt, aldri 0 av 19.
 *   - «Anlegg og utstyr» (ti valg) står i tillegg, fordi øvelsesbanken filtrerer på dem.
 *   - Stedene fra oppstarten vises som liste; de kan ikke endres her.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-24-FASILITETER.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, X } from "lucide-react";
import type { DrillFasilitet } from "@/generated/prisma/client";
import { lagreFasilitetOmrader, lagreFasilitetProfil } from "@/app/portal/meg/innstillinger/actions";
import { ANTALL_FASILITETER, FASILITET_FAMILIER } from "@/lib/portal/fasilitet-katalog";
import type { Omrade } from "@/lib/onboarding/oppstart";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PH24FasiliteterData = {
  tilgjengelig: DrillFasilitet[];
  steder: { id: string; navn: string; inne: boolean }[];
  /** Områdene fra oppstarten; null når spilleren ikke har svart. */
  omrader: Omrade[] | null;
  /** Når områdene sist ble lagret, f.eks. «28. september»; null når ukjent. */
  omraderDato?: string | null;
};

/** De 19 områdene gruppert som i tegningen (meg.html, OMR). */
const OMRADE_FAMILIER: { navn: string; akse: "slag" | "fys" | "spill"; o: [Omrade, string][] }[] = [
  { navn: "Utslag", akse: "slag", o: [["Utslag", "Utslag"]] },
  { navn: "Innspill", akse: "slag", o: [["Innspill ca. 200 m", "200 m og lengre"], ["Innspill ca. 150 m", "150–200 m"], ["Innspill ca. 100 m", "100–150 m"], ["Innspill ca. 50 m", "50–100 m"]] },
  { navn: "Nærspill", akse: "slag", o: [["Chip", "Chip"], ["Pitch", "Pitch"], ["Lob", "Lob"], ["Bunker", "Bunker"]] },
  { navn: "Putting", akse: "slag", o: [["Putting 0–3 fot", "0–3 fot"], ["Putting 3–5 fot", "3–5 fot"], ["Putting 5–10 fot", "5–10 fot"], ["Putting 10–25 fot", "10–25 fot"], ["Putting 25–40 fot", "25–40 fot"], ["Putting 40+ fot", "40+ fot"]] },
  { navn: "Fysisk", akse: "fys", o: [["Styrke", "Styrke"], ["Kondisjon", "Kondisjon"], ["Bevegelighet", "Bevegelighet"]] },
  { navn: "Spill", akse: "spill", o: [["Banespill", "Banespill"]] },
];
const ANTALL_OMRADER = 19;

export function PH24Fasiliteter({ data, lagre = lagreFasilitetProfil, lagreOmrader = lagreFasilitetOmrader }: {
  data: PH24FasiliteterData; lagre?: typeof lagreFasilitetProfil; lagreOmrader?: typeof lagreFasilitetOmrader;
}) {
  const router = useRouter();
  const [omr, setOmr] = useState<Set<Omrade>>(() => new Set(data.omrader ?? []));
  const harSvart = data.omrader !== null;
  const omrEndret = omr.size !== (data.omrader?.length ?? 0) || (data.omrader ?? []).some((o) => !omr.has(o));
  const omrMangler = OMRADE_FAMILIER.flatMap((f) => f.o.filter(([k]) => !omr.has(k)).map(([, navn]) => (f.navn === "Putting" ? `putter ${navn}` : f.navn === "Innspill" ? `innspill ${navn}` : navn.toLowerCase())));
  const [valgte, setValgte] = useState<Set<DrillFasilitet>>(() => new Set(data.tilgjengelig));
  const [melding, setMelding] = useState<{ ok: boolean; tekst: string } | null>(null);
  const [pending, start] = useTransition();
  const kjente = new Set(FASILITET_FAMILIER.flatMap((f) => f.valg.map((v) => v.kode)));
  const antall = [...valgte].filter((k) => kjente.has(k)).length;
  const mangler = FASILITET_FAMILIER.flatMap((f) => f.valg).filter((v) => !valgte.has(v.kode)).map((v) => v.tittel.toLowerCase());
  const utstyrEndret = antall !== data.tilgjengelig.filter((k) => kjente.has(k)).length || data.tilgjengelig.some((k) => kjente.has(k) && !valgte.has(k));
  const endret = utstyrEndret || omrEndret;

  function bytt(kode: DrillFasilitet) {
    setMelding(null);
    setValgte((s) => { const n = new Set(s); if (n.has(kode)) n.delete(kode); else n.add(kode); return n; });
  }
  function byttOmr(o: Omrade) {
    setMelding(null);
    setOmr((s) => { const n = new Set(s); if (n.has(o)) n.delete(o); else n.add(o); return n; });
  }
  function lagreValg() {
    setMelding(null);
    start(async () => {
      try {
        const ro = omrEndret ? await lagreOmrader([...omr]) : { ok: true as const };
        if (!ro.ok) { setMelding({ ok: false, tekst: ro.error ?? "Kunne ikke lagre. Prøv igjen." }); return; }
        const r = utstyrEndret ? await lagre([...valgte]) : { ok: true as const };
        if (r.ok) { setMelding({ ok: true, tekst: "Lagret. Planforslagene bruker de nye valgene." }); router.refresh(); }
        else setMelding({ ok: false, tekst: r.error ?? "Kunne ikke lagre. Prøv igjen." });
      } catch { setMelding({ ok: false, tekst: "Kunne ikke lagre. Prøv igjen." }); }
    });
  }

  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · fasiliteter</>}
      tittel={<>Fasiliteter</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link></span>}
    />
    <SkraFlyt lav><div className="side smal">

    <div className="phn-kort">
      <div className="phn-hoved"><strong>{harSvart || omr.size > 0 ? omr.size : "—"}</strong><span className="phn-forklar">av {ANTALL_OMRADER} treningsområder kan du trene der du er</span></div>
      <div className="stolpe" aria-hidden><span style={{ width: `${Math.round(omr.size / ANTALL_OMRADER * 100)}%`, background: "var(--phn-slag)" }} /></div>
      <p className="phn-kilde">{harSvart ? `Ut fra svarene dine${data.omraderDato ? ` ${data.omraderDato}` : ""}. Planforslagene bruker dette.` : "Du har ikke svart ennå. Trykk på områdene du kan trene på, og lagre."}</p>
    </div>

    {OMRADE_FAMILIER.map((f) => <div key={f.navn} className="familie" role="group" aria-label={f.navn}>
      <span>{f.navn}</span>
      <div className="omr-grid">
        {f.o.map(([kode, navn]) => {
          const ja = omr.has(kode);
          return <button key={kode} type="button" className={`omr ${ja ? `a-${f.akse}` : "mangler"}`} aria-pressed={ja} onClick={() => byttOmr(kode)}>
            {ja ? <Check size={16} aria-hidden /> : <X size={16} aria-hidden />}
            <span>{navn}{ja ? "" : " · mangler"}</span>
          </button>;
        })}
      </div>
    </div>)}

    <div className="phn-kort dempet">
      <b className="phn-undertittel">Dette mangler</b>
      <p className="phn-forklar">{omrMangler.length
        ? `${omrMangler.join(", ").replace(/^./, (c) => c.toUpperCase())}. Planen foreslår ikke økter du ikke har sted til. Du kan likevel legge inn en økt på en annen bane.`
        : `Ingenting. Du kan trene alle ${ANTALL_OMRADER} områdene.`}</p>
    </div>

    <section className="phn-seksjon" aria-labelledby="fas-utstyr">
      <div className="phn-sek-topp"><h2 id="fas-utstyr">Anlegg og utstyr</h2><span className="phn-kilde">{antall} av {ANTALL_FASILITETER}</span></div>
      <p className="phn-kilde">Øvelsesbanken viser øvelser du har utstyr til.{mangler.length ? ` Mangler: ${mangler.join(", ")}.` : ""}</p>
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
    </section>

    {data.steder.length > 0 && <section className="phn-seksjon" aria-labelledby="fas-steder">
      <div className="phn-sek-topp"><h2 id="fas-steder">Stedene dine</h2><span className="phn-kilde">Fra oppstarten</span></div>
      <ul className="bag to-kol">
        {data.steder.map((s) => <li key={s.id}><b>{s.inne ? "Inne" : "Ute"}</b><span>{s.navn}</span></li>)}
      </ul>
    </section>}

    <div className="phn-meldinger" aria-live="polite">{melding && <p className="phn-melding" role={melding.ok ? "status" : "alert"}>{melding.tekst}</p>}</div>
    <button type="button" className="phn-knapp pri stor" onClick={lagreValg} disabled={pending || !endret}>{pending ? "Lagrer …" : "Lagre"}</button>
  </div></SkraFlyt></div>;
}
