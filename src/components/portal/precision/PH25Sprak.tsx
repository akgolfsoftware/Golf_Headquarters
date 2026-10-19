"use client";

/**
 * PH-25 Meg › Innstillinger › Språk i nytt design: valgt språk øverst, og valget som en liste der
 * engelsk står som «Kommer senere» og ikke kan velges.
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, «Innstillinger»; meg-resten.html:
 * «Språk har bare norsk»). Stil: src/styles/playerhq-ny-meg.css.
 *
 * Samme lagring som før (InnstillingerSprakV2): oppdaterPreferences({ spraak }).
 *
 * Avvik:
 *   - «Kommer Q3 2026» er tatt ut: datoen er passert og ingen ny dato er bestemt.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-25-SPRAK.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";

export type PH25SprakData = { spraak: "nb" | "en" };

export function PH25Sprak({ data }: { data: PH25SprakData }) {
  const router = useRouter();
  const [valgt, setValgt] = useState<"nb" | "en">(data.spraak);
  const [pending, start] = useTransition();
  const [lagret, setLagret] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  function bytt(nytt: "nb" | "en") {
    if (nytt === "en" || pending) return; // engelsk kommer senere
    const forrige = valgt;
    setValgt(nytt); setFeil(null);
    start(async () => {
      try {
        await oppdaterPreferences({ spraak: nytt });
        setLagret(true);
        router.refresh();
        setTimeout(() => setLagret(false), 1500);
      } catch { setValgt(forrige); setFeil("Kunne ikke lagre. Prøv igjen."); }
    });
  }

  return <div className="phn phn-meg"><div className="side smal">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg/innstillinger"><ChevronLeft size={18} aria-hidden />Innstillinger</Link>
      <div className="topp-rad">
        <div><div className="phn-dato">Meg · innstillinger</div><h1 className="phn-tittel">Språk</h1></div>
        <span aria-live="polite">{lagret && <span className="phn-pille ok"><i />Lagret</span>}</span>
      </div>
    </div>

    <div className="phn-kort">
      <div className="phn-hoved"><strong>{valgt === "nb" ? "Norsk bokmål" : "English"}</strong><span className="phn-forklar">er språket i appen nå</span></div>
    </div>

    <section className="phn-seksjon" aria-labelledby="sp-valg">
      <div className="phn-sek-topp"><h2 id="sp-valg">Språk i appen</h2></div>
      <div className="liste" role="radiogroup" aria-labelledby="sp-valg">
        <button type="button" role="radio" aria-checked={valgt === "nb"} onClick={() => bytt("nb")}>
          <span className="ikonboks" aria-hidden>NO</span>
          <span><b>Norsk bokmål</b><span className="phn-kilde">Standard for AK Golf</span></span>
          <span className="hoyre">{valgt === "nb" && <Check size={20} aria-hidden />}</span>
        </button>
        <button type="button" role="radio" aria-checked={valgt === "en"} aria-disabled="true" disabled style={{ opacity: 0.6, cursor: "default" }}>
          <span className="ikonboks" aria-hidden>EN</span>
          <span><b>English</b><span className="phn-kilde">Engelsk kommer senere</span></span>
          <span className="hoyre"><span className="phn-pille noy"><i />Kommer senere</span></span>
        </button>
      </div>
      <div aria-live="polite">{feil && <p className="phn-melding" role="alert">{feil}</p>}</div>
    </section>

    <section className="phn-seksjon" aria-labelledby="sp-format">
      <div className="phn-sek-topp"><h2 id="sp-format">Region og format</h2></div>
      <p className="phn-forklar">Datoer, tidssone og tallformat følger valgt språk. Appen bruker norsk tid (Europe/Oslo).</p>
    </section>
  </div></div>;
}
