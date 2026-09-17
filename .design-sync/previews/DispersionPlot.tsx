import { DispersionPlot } from "akgolf-hq-komponenter";

/* Kortet bor i en kolonne i appen (390 px mobil / rutenettkolonne). Uten bredde-
   grense skalerer 340×240-viewBoxen til ~530 px høyde og kortet klippes i fangsten. */
const kolonne = { maxWidth: 440 };

/* side = meter fra siktelinjen (− venstre, + høyre), lengde = carry i meter. */
const SYV_JERN = [
  { side: -6, lengde: 152 }, { side: 3, lengde: 158 }, { side: -2, lengde: 155 }, { side: 8, lengde: 149 },
  { side: -9, lengde: 160 }, { side: 1, lengde: 156 }, { side: 5, lengde: 153 }, { side: -4, lengde: 157 },
  { side: 11, lengde: 147 }, { side: -1, lengde: 159 }, { side: 2, lengde: 154 }, { side: -7, lengde: 151 },
  { side: 4, lengde: 156 }, { side: -3, lengde: 158 },
];
const DRIVER = [
  { side: -18, lengde: 236 }, { side: 9, lengde: 244 }, { side: -4, lengde: 241 }, { side: 21, lengde: 229 },
  { side: -24, lengde: 233 }, { side: 3, lengde: 247 }, { side: 14, lengde: 238 }, { side: -11, lengde: 245 },
  { side: 17, lengde: 226 }, { side: -2, lengde: 252 }, { side: 6, lengde: 243 }, { side: -15, lengde: 239 },
  { side: 11, lengde: 240 }, { side: -8, lengde: 248 }, { side: 19, lengde: 231 }, { side: 1, lengde: 246 },
];
const WEDGE_56 = [
  { side: -2, lengde: 81 }, { side: 1, lengde: 83 }, { side: 3, lengde: 80 }, { side: -1, lengde: 84 },
  { side: 0, lengde: 82 }, { side: 2, lengde: 79 }, { side: -3, lengde: 85 }, { side: 1, lengde: 82 },
  { side: 4, lengde: 78 }, { side: -1, lengde: 83 }, { side: 2, lengde: 81 }, { side: 0, lengde: 86 },
];

/** Kanonisk bruk: 7-jern fra en TrackMan-økt, siktemerke 155 m. */
export function SyvJern() {
  return (
    <div style={kolonne}>
      <DispersionPlot kolle="7-jern" skudd={SYV_JERN} grunnlag="14 slag · TrackMan, 12.09.2026" maal={155} />
    </div>
  );
}

/** Driver: bred sidespredning, siktemerke 240 m. Ellipsen vokser med spredningen. */
export function Driver() {
  return (
    <div style={kolonne}>
      <DispersionPlot kolle="Driver" skudd={DRIVER} grunnlag="16 slag · TrackMan, 12.09.2026" maal={240} />
    </div>
  );
}

/** Wedge: tett spredning rundt 82 m. Sideaksen skalerer ned til minst ±8 m. */
export function Wedge() {
  return (
    <div style={kolonne}>
      <DispersionPlot kolle="56°" skudd={WEDGE_56} grunnlag="12 slag · TrackMan, 10.09.2026" maal={82} />
    </div>
  );
}

/** Ingen treffdata for køllen ennå. */
export function Tom() {
  return (
    <div style={kolonne}>
      <DispersionPlot kolle="3-tre" skudd={[]} />
    </div>
  );
}
