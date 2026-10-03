/** Prøvefil for PH-15 Test: gjennomfør (natt). Syntetiske data, ingen ekte spillere. */
import { PH15Innspill, PH15Treff, type PH15InnspillProps, type PH15TreffProps } from "@/components/portal/precision/PH15TestGjennomfor";

export const sti = "/portal/tren/tester/demo/gjennomfor";

const noop = () => {};
const felles = { onAvslutt: noop, onAngre: noop, onLagre: noop, opptatt: false, lagreFeil: null } as const;

const innspill: PH15InnspillProps = {
  ...felles, tilstand: "data", tittel: "Inspill Basic med et langt testnavn som må brytes pent", meta: "Inspill Basic · 10 slag", shots: 10,
  slag: [{ malAvstandM: 50, tillMalM: 3.2 }, { malAvstandM: 50, tillMalM: 5.8 }, { malAvstandM: 50, tillMalM: 2.1 }, { malAvstandM: 50, tillMalM: 4.4 }, { malAvstandM: 50, tillMalM: 1.6 }, { malAvstandM: 50, tillMalM: 3.9 }],
  snittPei: "7,1 %", snittTilMal: 3.5, malAvstand: 50, tillMal: 3.5, onMalAvstand: noop, onTillMal: noop, onRegistrer: noop,
};
const ti = Array.from({ length: 10 }, (_, i) => ({ malAvstandM: 50, tillMalM: [3.2, 5.8, 2.1, 4.4, 1.6, 3.9, 2.7, 4.1, 3.3, 2.5][i] }));

const treff: PH15TreffProps = {
  ...felles, tilstand: "data", tittel: "Putt Gate", meta: "Putt Gate · 10 slag", shots: 10,
  slag: [{ ok: true, side: null }, { ok: false, side: "V" }, { ok: true, side: null }, { ok: true, side: null }, { ok: false, side: "H" }, null, null, null, null, null],
  venterPaaSide: false, harSide: true, maal: 8, deltaForrige: null, onTreff: noop, onBom: noop, onSide: noop,
};
const alle = Array.from({ length: 10 }, (_, i) => ({ ok: i !== 2 && i !== 6, side: i === 2 ? ("V" as const) : i === 6 ? ("H" as const) : null }));

export const natt = ["innspill-data", "innspill-tom", "innspill-ferdig", "treff-data", "treff-side", "treff-ferdig", "laster", "feil"];

export const tilstander = {
  "innspill-data": <PH15Innspill {...innspill} />,
  "innspill-tom": <PH15Innspill {...innspill} tilstand="tom" slag={[]} snittPei={null} snittTilMal={null} tillMal={0} />,
  "innspill-ferdig": <PH15Innspill {...innspill} slag={ti} snittPei="6,7 %" snittTilMal={3.3} />,
  "treff-data": <PH15Treff {...treff} />,
  "treff-side": <PH15Treff {...treff} slag={[{ ok: true, side: null }, { ok: false, side: null }, null, null, null, null, null, null, null, null]} venterPaaSide />,
  "treff-ferdig": <PH15Treff {...treff} slag={alle} deltaForrige={2} />,
  laster: <PH15Innspill {...innspill} tilstand="laster" />,
  feil: <PH15Innspill {...innspill} tilstand="feil" />,
};
