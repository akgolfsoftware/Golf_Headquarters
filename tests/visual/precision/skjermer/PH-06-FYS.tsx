/** Prøvefil for føring av fysisk økt (Live fysisk, PH-06). Syntetiske data, ingen database. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHFysiskOkt } from "@/components/portal/precision/PHFysiskOkt";
import { byggFysOkt, type FysOktRadInn } from "@/lib/portal-plan/fysisk-okt";

export const sti = "/portal/planlegge/fysisk/okt/o1";
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const r = (id: string, navn: string, o: Partial<FysOktRadInn> = {}): FysOktRadInn => ({
  id, navn, sett: 4, repsMin: 6, repsMax: 6, belastningPst: null, loggBelastningKg: 90, rir: 2, hvile: 120, notat: null,
  intervallSerier: null, intervallMinutter: null, pulssone: null, pause: null, loggSett: null, loggRepsPerSett: null, loggRir: null, loggSettData: null, ...o,
});
const rader = [
  r("a", "Markløft trapbar"),
  r("b", "Bulgarsk utfall med et langt navn som må brytes på smal skjerm", { sett: 3, repsMin: 8, repsMax: 8, loggBelastningKg: 16 }),
  r("c", "Rotasjonskast", { sett: 5, repsMin: 5, repsMax: 5, loggBelastningKg: null, rir: null, hvile: null }),
  r("d", "Intervall på sykkel", { intervallSerier: 6, intervallMinutter: 3, pulssone: "S3", pause: "2 min pause mellom" }),
];
const okt = (o: Partial<Parameters<typeof byggFysOkt>[0]> = {}) => byggFysOkt({
  id: "o1", navn: "Styrke bein og kjerne", dag: "MAN", type: "styrke", estimertMinutter: 45, gjennomfortAt: null, faktiskMinutter: null, rader, ...o,
}, "Underkropp A og B");
const ok = async () => ({ ok: true });
const feil = async () => ({ ok: false, error: "Ikke lagret. Prøv igjen." });
const ferdigRader = rader.map((x, i) => (i === 0 ? { ...x, loggSettData: [{ vekt: 90, reps: 6, rir: 2 }, { vekt: 92.5, reps: 6, rir: 2 }, { vekt: 92.5, reps: 5, rir: 1 }] } : x));
export const tilstander = {
  data: <S><PHFysiskOkt okt={okt()} lagre={ok} angre={ok} /></S>,
  ferdig: <S><PHFysiskOkt okt={okt({ gjennomfortAt: new Date("2026-10-05T16:30:00Z"), rader: ferdigRader })} lagre={ok} angre={ok} /></S>,
  tom: <S><PHFysiskOkt okt={okt({ rader: [] })} lagre={ok} angre={ok} /></S>,
  feil: <S><PHFysiskOkt okt={okt()} lagre={feil} angre={ok} /></S>,
};
