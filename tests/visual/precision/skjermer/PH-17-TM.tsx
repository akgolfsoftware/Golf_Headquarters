/** Prøvefil for PH-17 TrackMan (pakke 6): økter, én økt og alle køller. Syntetiske data: Øyvind Rohjan, i dag 5. oktober 2026. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17TmOkter, type TmOktKort } from "@/components/portal/precision/PH17TmOkter";
import { PH17TmOkt } from "@/components/portal/precision/PH17TmOkt";
import { PH17TmKoller } from "@/components/portal/precision/PH17TmKoller";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import {
  TM_FILTER_STANDARD, TM_HAST_NAVN, gapping, kolleOppsummering, oktHast, oktKoller, oktNavn, sorterKoller, tellende, utstyrsEndringer, utviklingPunkter,
  type TmOkt, type TmSlag,
} from "@/lib/portal-analyse/trackman-stats";

export const sti = "/portal/analysere/trackman";

/* carry, sidespredning, Club Speed, Smash, Launch, Spin */
const KB: Record<string, [number, number, number, number, number, number]> = {
  Driver: [228, 15, 106.9, 1.47, 12.4, 2640], "7-jern": [156, 7, 86.4, 1.36, 17.9, 6820], PW: [121, 5, 79.4, 1.23, 25.1, 8700], "54°": [94, 5, 74.1, 1.17, 30.2, 8940],
};
function rng(s: number) { return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function lagSlag(seed: number, kolle: string, n: number, mal: number | null, hast: TmSlag["hast"]): TmSlag[] {
  const r = rng(seed), g = () => (r() + r() + r() - 1.5) / 0.5, b = KB[kolle];
  return Array.from({ length: n }, (_, i) => {
    const ekstrem = n >= 20 && i === n - 4;
    const cs = b[2] + g(), smash = b[3] + g() * 0.01, carry = (mal ?? b[0]) + g() * 3 - (ekstrem ? b[0] * 0.25 : 0);
    return {
      nr: i + 1, kolle, ekstrem, mal, hast, sx: ekstrem ? 0.8 : 0.06 + g() * 0.22, sy: -0.05 + g() * 0.2,
      bs: cs * smash, smash, launch: b[4] + g(), ldir: g() * 0.8, spin: b[5] + g() * 200, saxis: g() * 2,
      carry, total: carry + 5, side: ekstrem ? b[1] * 1.4 : g() * b[1] / 2.4, apex: 28 + g(), land: 48 + g(),
      cs, aa: -4 + g() * 0.5, path: 1.8 + g() * 0.9, face: 1.2 + g() * 0.8, ftp: g(), dl: 24 + g(),
    };
  });
}
const OKTER: TmOkt[] = [
  { id: "o1", dato: "2026-09-28T14:00:00Z", sted: "Simulator", plan: "Lengdekontroll", slag: [...lagSlag(3, "7-jern", 54, 75, "LAV"), ...lagSlag(5, "54°", 30, 45, "LAV")] },
  { id: "o2", dato: "2026-09-21T14:00:00Z", sted: "Range", plan: "Face to Path", slag: lagSlag(7, "7-jern", 40, null, null) },
  { id: "o3", dato: "2026-09-14T14:00:00Z", sted: "Simulator", plan: null, slag: lagSlag(11, "Driver", 32, null, "FULL") },
  { id: "o4", dato: "2026-08-31T14:00:00Z", sted: "Simulator", plan: null, slag: [...lagSlag(13, "Driver", 10, null, "FULL"), ...lagSlag(17, "7-jern", 10, null, "FULL"), ...lagSlag(19, "PW", 10, null, "FULL"), ...lagSlag(23, "54°", 10, null, "FULL")] },
];
const f = TM_FILTER_STANDARD;
const kort: TmOktKort[] = OKTER.map((o) => {
  const h = oktHast(o.slag);
  return { id: o.id, dato: o.dato, navn: oktNavn(o), akse: o.plan ? "tek" : "slag", antall: tellende(o.slag, f).length, koller: oktKoller(o), sted: o.sted, hast: h ? TM_HAST_NAVN[h] : null };
});
const kolleValg = sorterKoller(OKTER.flatMap((o) => o.slag.map((s) => s.kolle)));
const utv = utviklingPunkter(OKTER, f);

const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
const okter = (over: Partial<React.ComponentProps<typeof PH17TmOkter>["data"]> = {}) => skall(
  <PH17TmOkter data={{ filter: f, okter: kort, slag: kort.reduce((a, o) => a + o.antall, 0), koller: kolleValg.length, kolleValg, utvikling: utv, harOkter: true, ...over }} />,
);
const koller = (tom: boolean) => skall(
  <PH17TmKoller data={{
    filter: f, rader: tom ? [] : kolleOppsummering(OKTER, f), gapping: tom ? { rader: [], antall: 0, utenHast: 0 } : gapping(OKTER, f),
    utstyr: tom ? [] : utstyrsEndringer(utv), kolleValg: tom ? [] : kolleValg,
  }} />,
);

export const tilstander = {
  okter: okter(),
  "okter-filter-tom": okter({ filter: { ...f, kolle: ["PW"], sted: ["Range"] }, okter: [], slag: 0, koller: 0 }),
  "okter-tom": okter({ okter: [], slag: 0, koller: 0, kolleValg: [], utvikling: [], harOkter: false }),
  okt: skall(<PH17TmOkt okt={OKTER[0]} filter={f} />),
  "okt-uten-maal": skall(<PH17TmOkt okt={OKTER[2]} filter={f} />),
  "okt-uten-tall": skall(<PH17TmOkt okt={{ ...OKTER[1], slag: OKTER[1].slag.map((s) => ({ ...s, carry: null, side: null, sx: null, sy: null })) }} filter={f} />),
  koller: koller(false),
  "koller-tom": koller(true),
  laster: skall(<TmLaster tekst="Henter TrackMan" />),
};
