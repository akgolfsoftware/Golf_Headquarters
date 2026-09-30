/** Prøvefil for PH-14 Tester. Syntetiske data, ingen ekte spillere. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH14Tester, type PH14Props, type PH14Test } from "@/components/portal/precision/PH14Tester";

export const sti = "/portal/tren/tester";
export const natt = ["data-natt"];

const t = (id: string, navn: string, akse: PH14Test["akse"], verdi: string | null, hist: number[], over: Partial<PH14Test> = {}): PH14Test => ({
  id, navn, akse, regel: "Ti slag mot flagg. Poeng etter nærhet til hullet, høyeste sum vinner.", verdi, maalinger: hist.length,
  sisteDato: hist.length ? "26.09" : null, delta: hist.length > 1 ? { tekst: "+2", bra: true } : null, hoyereErBedre: true, forsok: 10,
  historikk: [...hist].reverse().map((v, i) => ({ dato: `${String(26 - i * 7).padStart(2, "0")}.09.2026`, verdi: `${v} p` })), kurve: hist, href: "#", ...over,
});
const base: PH14Props = {
  tilstand: "data", antallForfaller: 1, egenHref: "#", registrerHref: "#", tnHref: "#",
  grupper: [
    { id: "golfslag", label: "Golfslag", tester: [
      t("a", "Putting 3 m · 10 slag med et langt navn som må brytes pent", "slag", "7 p", [4, 5, 6, 7]),
      t("b", "Wedge 50 m", "slag", "12 p", [10, 12], { hoyereErBedre: false, delta: { tekst: "−2", bra: false } }),
      t("c", "Driver bane", "slag", null, []),
    ] },
    { id: "teknikk", label: "Teknikk", tester: [t("d", "Attack Angle", "tek", "−1,2 %", [3])] },
  ],
};
const Vis = (p: Partial<PH14Props>) => <PlayerHQSkall innboksHref="#" uleste={0}><PH14Tester {...base} {...p} /></PlayerHQSkall>;
export const tilstander = {
  data: <Vis />,
  "data-natt": <Vis />,
  tom: <Vis tilstand="tom" grupper={[]} antallForfaller={0} />,
  feil: <Vis tilstand="feil" grupper={[]} ukjentKode="FEIL 503 · TESTER" />,
};
