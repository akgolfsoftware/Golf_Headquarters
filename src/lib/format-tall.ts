/**
 * format-tall.ts — den ENE kilden for hvordan et tall vises i appen.
 *
 * Fasiten står i docs/skjermtekst/skjerm-tekst-hovedskjermer.md:
 *
 *   «Tall: komma-desimal, mellomrom-tusenskille, `73 %` (mellomrom før %)»
 *   «SG: fortegn ALLTID (+/−), komma, ekte minus «−»»
 *
 * Den regelen har vært skrevet ned lenge, men ikke håndhevet av noe. Resultatet
 * var åtte konkurrerende formateringsfiler, fire ulike `fmtSg`, rundt hundre
 * lokale `fmt`-hjelpere og 380 rå `toFixed` — og dermed «62.4%» med punktum på
 * de offentlige statistikksidene.
 *
 * Tre ting var inkonsistente på tvers av kodebasen, og avgjøres her:
 *
 *   1. Desimalskilletegn — ALLTID komma. `toFixed` gir punktum og skal ikke
 *      brukes til visning.
 *   2. Minustegn — ALLTID ekte minus «−» (U+2212), aldri ASCII-bindestrek.
 *      Ekte minus har samme bredde som «+» og linjerer i tallkolonner.
 *   3. Mellomrom før % — ALLTID, som i «73 %». Det er norsk rettskrivning.
 *
 * Testverdier har sin egen formatter (portal-tester/format-verdi.ts), fordi de
 * må kjenne scoring-typen for å vite enheten.
 */

/** Ekte minus (U+2212) — ikke ASCII-bindestrek. */
const MINUS = "−";

/** Smalt hardt mellomrom (U+00A0) foran %, så tall og tegn aldri brytes. */
const NBSP = " ";

function nb(n: number, min: number, maks: number): string {
  return n.toLocaleString("nb-NO", {
    minimumFractionDigits: min,
    maximumFractionDigits: maks,
  });
}

/** Bytter ASCII-bindestrek mot ekte minus. */
function ekteMinus(s: string): string {
  return s.replace(/^-/, MINUS);
}

/**
 * Vanlig desimaltall: «120,5», «1 240», «3,80».
 *
 * `desimaler` er maks antall; sett `fast: true` for å alltid vise så mange
 * (nyttig i tallkolonner som skal linjere).
 */
export function formaterTall(
  n: number | null | undefined,
  desimaler = 1,
  fast = false,
): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return ekteMinus(nb(n, fast ? desimaler : 0, desimaler));
}

/**
 * Prosent med mellomrom foran tegnet: «73 %», «62,4 %».
 *
 * Tar tallet slik det skal LESES (73 for 73 %), ikke som brøk. En brøk
 * konverteres av kallstedet, som er det eneste som vet hvilken form verdien
 * har — det var nettopp den forvekslingen som ga «0,0» for PEI.
 */
export function formaterProsent(
  n: number | null | undefined,
  desimaler = 0,
  fast = false,
): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${ekteMinus(nb(n, fast ? desimaler : 0, desimaler))}${NBSP}%`;
}

/**
 * Tall som alltid bærer fortegn — brukt for strokes gained og andre verdier
 * der retningen er hele poenget: «+0,41», «−0,05», «0,00».
 *
 * Null vises uten fortegn. Et «+0,00» leses som en liten gevinst, og det er
 * ikke det målingen sier.
 */
export function formaterFortegn(
  n: number | null | undefined,
  desimaler = 2,
): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const avrundet = Number(n.toFixed(desimaler));
  if (avrundet === 0) return nb(0, desimaler, desimaler);
  const tegn = avrundet < 0 ? MINUS : "+";
  return `${tegn}${nb(Math.abs(avrundet), desimaler, desimaler)}`;
}

/** Varighet i minutter → «45 min» / «1 t 30 min». */
export function formaterVarighet(minutter: number | null | undefined): string {
  if (minutter == null || !Number.isFinite(minutter)) return "—";
  const total = Math.round(minutter);
  const timer = Math.floor(total / 60);
  const rest = total % 60;
  if (timer === 0) return `${rest} min`;
  if (rest === 0) return `${timer} t`;
  return `${timer} t ${rest} min`;
}
