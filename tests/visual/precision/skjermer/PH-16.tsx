/** Prøvefil for PH-16 Stats-oversikten i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16StatsOversikt, type PH16Trening } from "@/components/portal/precision/PH16StatsOversikt";
import type { PH16StatsData, SgRad } from "@/lib/portal-analyse/ph16-stats-data";
import type { PH14Data, PH14Rad } from "@/lib/portal-tester/ph14-tester-data";

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

const tr = (id: string, navn: string, vis: string, dato: string, kontrollert: boolean): PH14Rad => ({ id, navn, akse: "fys", href: "#", vis, dato, kontrollert, historikk: [1, 2], rekord: false, forste: false });
const tester: PH14Data = {
  rader: [tr("cs", "Club Speed", "108,4 mph", "28. sep.", true), tr("ml", "Markløft trapbar", "140 kg", "21. sep.", false), tr("lh", "Lengdehopp", "2,48 m", "21. sep.", true), tr("rk", "Rotasjonskast", "11,2 m", "21. sep.", false)],
  totalt: 12, tatt: 4, bedre: 3, sammenlignbare: 3, nesteTestdag: { navn: "Club Speed", dag: 19, mnd: "okt", dato: "19. okt.", href: "#" },
  sisteRekord: { navn: "Club Speed", akse: "fys", vis: "108,4 mph", dato: "28. sep.", kontrollert: true, historikk: [106.5, 108.4], href: "#" },
};
const forelopig: PH16StatsData = { ...data, spiller: { ...data.spiller, antallSnittRunder: 5, trend: [75, 74, 76, 73, 72] } };

const Vis = ({ d, t, te = null }: { d: PH16StatsData; t: PH16Trening | null; te?: PH14Data | null }) => <PlayerHQSkall innboksHref="#" uleste={2}><PH16StatsOversikt data={d} trening={t} tester={te} /></PlayerHQSkall>;
export const tilstander = { data: <Vis d={data} t={trening} te={tester} />, forelopig: <Vis d={forelopig} t={trening} te={{ ...tester, sisteRekord: null }} />, tom: <Vis d={tom} t={null} /> };
