import { FakturaRad, Kort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 560 };

/** Fakturaliste i et Kort: åpen, forfalt og betalt — beløp i mono, status-pill til høyre. */
export function Liste() {
  return (
    <div style={boks}>
      <Kort eyebrow="Fakturaer · 3" pad="15px 17px">
        <div>
          <FakturaRad nr="F-2026-131" hva="Performance — september" belop="1 200,00" valuta="kr" forfall="15. september" status="aapen" />
          <FakturaRad nr="F-2026-118" hva="Privattime 90 min — nærspill" belop="2 500,00" valuta="kr" forfall="1. september" status="forfalt" />
          <FakturaRad nr="F-2026-104" hva="Performance Pro — august" belop="2 220,00" valuta="kr" forfall="15. august" status="betalt" last />
        </div>
      </Kort>
    </div>
  );
}

/** Klikkbar rad: hover-flate med innrykk, siste rad uten skillelinje. */
export function Klikkbar() {
  return (
    <div style={boks}>
      <Kort pad="8px 17px">
        <div>
          <FakturaRad nr="F-2026-131" hva="Performance — september" belop="1 200,00" valuta="kr" forfall="15. september" status="aapen" last onClick={() => {}} />
        </div>
      </Kort>
    </div>
  );
}
