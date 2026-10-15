/** Prøvefil for PH-16 Stats-oversikten i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16StatsOversikt, type PH16Trening } from "@/components/portal/precision/PH16StatsOversikt";
import type { PH16StatsData, SgRad } from "@/lib/portal-analyse/ph16-stats-data";

export const sti = "/portal/analysere";

const rad = (id: string, g: SgRad["g"], pga: number | null, n = 10): SgRad => ({ id, label: id, g, c: null, pga, n, d: null });
const data: PH16StatsData = {
  spiller: { navn: "Testspiller", kategori: null, nesteKategori: null, snittBrutto: 73.1, forrigeSnitt: 74.6, slagTilNesteKategori: null, antallSnittRunder: 10, trend: [75, 74, 76, 73, 72, 74, 73, 71, 72, 73] },
  sg: [
    { g: "tee", label: "Tee", rows: [rad("tee", "tee", 0.2)] },
    { g: "innspill", label: "Innspill", rows: [rad("i150", "innspill", -0.5), rad("i100", "innspill", -0.4)] },
    { g: "naer", label: "Nærspill", rows: [rad("chip", "naer", -0.4)] },
    { g: "putt", label: "Putting", rows: [rad("p3", "putt", 0)] },
  ],
  runder: [], trening: { pyramide: { rows: [], totalHours: null, src: "" }, trackman: { koller: [], data: {} } },
  tester: [{ id: "cs", name: "Club Speed", sub: "", axis: "fys", unit: "mph", hist: [106.5, 108.4], dates: ["12.07", "28.09"], norm: null, hi: true, by: "Kontrollert" },
    { id: "ml", name: "Markløft trapbar", sub: "", axis: "fys", unit: "kg", hist: [130, 140], dates: ["01.07", "21.09"], norm: null, hi: true, by: "Egenregistrert" }],
};
const trening: PH16Trening = { gjortMin: 2890, planMin: 3140, pct: 92, periode: "7. sep.–4. okt.",
  akser: [{ akse: "fys", gjortMin: 540 }, { akse: "tek", gjortMin: 660 }, { akse: "slag", gjortMin: 1015 }, { akse: "spill", gjortMin: 450 }, { akse: "turn", gjortMin: 225 }] };
const tom: PH16StatsData = { ...data, spiller: { ...data.spiller, snittBrutto: null, forrigeSnitt: null, antallSnittRunder: 0, trend: [] }, sg: data.sg.map((g) => ({ ...g, rows: g.rows.map((r) => ({ ...r, pga: null, n: 0 })) })), tester: [] };

const Vis = ({ d, t }: { d: PH16StatsData; t: PH16Trening | null }) => <PlayerHQSkall innboksHref="#" uleste={2}><PH16StatsOversikt data={d} trening={t} /></PlayerHQSkall>;
export const tilstander = { data: <Vis d={data} t={trening} />, tom: <Vis d={tom} t={null} /> };
