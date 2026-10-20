/** Prøvefil for PH-15 og PH-15-TN (pakke 6): Wedge Gate, Nærspill Gate og 8-ball. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH15TnTest } from "@/components/portal/precision/PH15TnTest";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { LokalDataEierProvider } from "@/lib/offline-queue/eier-context";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import type { TnValues } from "@/lib/portal-tester/tn-scoring";

export const sti = "/portal/tren/tester/team-norway";

const wedge = tnProtocol("wedge-gate")!;
const naer = tnProtocol("naerspill-gate")!;
const ball = tnProtocol("8-ball-blocked")!;
const inspill = tnProtocol("inspill-gutter-145")!;
const putt = tnProtocol("putt-1-3m")!;
const speed = tnProtocol("putt-speed-1x5")!;
const bane = tnProtocol("golfslag-bane-gutter")!;

const PSVAR = ["I sonen", "Gjennom porten", "Bom"] as const;
/** Poeng-gate: sant = I sonen (4), usant = Bom (0); hver tredje er «Gjennom porten» (1). */
const gate = (svar: boolean[]): TnValues => Object.fromEntries(svar.map((ok, i) => [String(i + 1), { ok: ok ? (i % 3 === 2 ? PSVAR[1] : PSVAR[0]) : PSVAR[2] }]));
/* 8-ball: [carry, side] eller null for «I hull» */
const SLAG: ([number, number] | null)[] = [[9.6, 0.3], null, [8.9, -0.8], [28.6, 0.9], [31.2, -0.6], [30.4, 2.3], [19.3, 0.4], [20.5, 0.3], [21.2, -0.6], [39.2, 0.5]];
const ballVerdier: TnValues = Object.fromEntries(SLAG.map((s, i) => [String(i + 1), (s ? { carry: s[0], side: s[1] } : { holed: "I hull" }) as Record<string, string | number>]));

const uuid = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;
const vis = (n: React.ReactNode) => (
  <LokalDataEierProvider eierId="prove-spiller"><PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall></LokalDataEierProvider>
);
const init = (n: number, values: TnValues, status = "IN_PROGRESS") => ({ sessionId: uuid(n), revision: 1, values, notes: "", status });

export const tilstander = {
  gate: vis(<PH15TnTest protocol={wedge} initial={init(1, gate([true, false, true, true, false]))} />),
  "gate-ferdig": vis(<PH15TnTest protocol={wedge} initial={init(2, gate([true, false, true, true, false, true, false, true, true]), "COMPLETED")} />),
  hand: vis(<PH15TnTest protocol={naer} initial={init(3, gate([true, false, false, true]))} />),
  tn8: vis(<PH15TnTest protocol={ball} initial={init(4, ballVerdier)} />),
  "tn8-tom": vis(<PH15TnTest protocol={ball} localSessionId={uuid(5)} />),
  carry: vis(<PH15TnTest protocol={inspill} initial={init(6, { "1": { carry: 141, side: -3.2 }, "2": { carry: 150.5, side: 6.2 } })} />),
  putt: vis(<PH15TnTest protocol={putt} initial={init(7, { "1": { strokes: 1 }, "2": { strokes: 2 }, "3": { strokes: 1 } })} />),
  speed: vis(<PH15TnTest protocol={speed} initial={init(8, { "1": { distance: 0.5, distanceUnit: "m", longShort: "Lang" }, "2": { distance: 0.25, distanceUnit: "m", longShort: "Kort" } })} />),
  bane: vis(<PH15TnTest protocol={bane} initial={init(9, { "1": { hole: 1, result: 11.5, lie: "Green" } })} />),
  laster: vis(<TmLaster tekst="Henter testen" />),
};
