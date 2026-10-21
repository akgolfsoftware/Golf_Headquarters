"use client";

/**
 * PH-13 Break-tabell i nytt design (pakke 4, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjerm «break». Ligger under putting i
 * øvelsesbanken (flyttet fra Utenfor banen, vedtak 28.09). Avstand i fot.
 *
 * Avvik:
 *   - Tallene er i centimeter fra appens eksisterende formel (beregnBreakCm), ikke i hullbredder.
 *     Begge er eksempel: Anders har ikke valgt tabell og greenhastighet ennå. Merket «Eksempel».
 *   - Uthevet rad er 5–10 fot fast, ikke regnet ut fra hvor spilleren har flest putter.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-13.
 */
import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { formaterTall } from "@/lib/format-tall";
import { BREAK_HELLING, BREAK_STIMP, breakTabell } from "@/lib/portal-drills/ovelser-visning";
import { OvTilbake } from "./PH13Felles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-ovelser.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke8-skra.css";

export function PH13BreakTabell({ antallPutting }: { antallPutting: number }) {
  const [stimp, setStimp] = useState(10);
  const rader = breakTabell(stimp);
  return (
    <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Break-tabell"
      bilde="/images/playerhq/slag-putting.jpg" bildePosisjon="50% 50%"
      overlinje="Øvelsesbank · putting"
      tittel="Break-tabell"
      ingress="Hvor langt utenfor hullet du sikter, etter avstand og helling på greenen."
      handling={<span className="skra-tilbake"><OvTilbake href="/portal/drills" tekst="Øvelsesbank" /></span>}
    />
    <SkraFlyt lav>
      <div className="phn-ov-smal phn-seksjon" style={{ gap: 32 }}>
        <div className="phn-felt"><span>Greenhastighet (Stimp)</span>
          <div className="phn-valg" role="group" aria-label="Greenhastighet">
            {BREAK_STIMP.map((s) => <button key={s.verdi} type="button" aria-pressed={stimp === s.verdi} onClick={() => setStimp(s.verdi)}>{s.navn}</button>)}
          </div>
        </div>
        <section className="phn-kort">
          <div className="phn-sek-topp"><h2>Sikt utenfor hullet, cm</h2><span className="phn-ov-estimat">Eksempel</span></div>
          <table className="phn-ov-breaktab">
            <thead><tr><th scope="col">Avstand</th>{BREAK_HELLING.map((h, i) => <th key={h} scope="col">{i === 0 ? `${h} % helling` : `${h} %`}</th>)}</tr></thead>
            <tbody>
              {rader.map((r) => <tr key={r.fot} className={r.uthevet ? "uthevet" : undefined}><td>{r.fot} fot</td>{r.cm.map((v, i) => <td key={i}>{v === 0 ? "Midt i" : formaterTall(v, 0)}</td>)}</tr>)}
            </tbody>
          </table>
          <p className="phn-kilde">Tallene er eksempel til tabellen er valgt. Uthevet rad: 5–10 fot.</p>
        </section>
        <Link className="phn-rad-lenke" href="/portal/drills">
          <span><b>Øvelser for putting</b><span className="phn-kilde">{antallPutting === 0 ? "Ingen puttingøvelser i banken ennå" : `${antallPutting} ${antallPutting === 1 ? "øvelse" : "øvelser"} i banken`}</span></span>
          <ChevronRight className="phn-ikon" aria-hidden />
        </Link>
      </div>
    </SkraFlyt>
    </div>
  );
}
