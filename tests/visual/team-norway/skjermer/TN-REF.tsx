/** Prøvefil for Referanse: WAGR med graf, Sammenlign, Søk, Norsk golf og HCP Norge. Syntetiske spillere. */
import { TnReferanseManglerVisning, TnReferanseSammenlignVisning, TnReferanseSokVisning } from "@/components/team-norway/skjermer/tn-referanse-flere-visning";
import { TnReferanseWagrVisning } from "@/components/team-norway/skjermer/tn-referanse-wagr-visning";
import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { byggWagrLeaderboard, type WagrResultatInn } from "@/lib/domain/tn-referanse-wagr-regler";

export const sti = "/team-norway/referanse";

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const dato = new Date(Date.UTC(2026, 9, 22));
const felles = { brukerNavn: "Trener 1", visDataGolf: false, kontekst };
const gruppe = { id: "norge", navn: "Norge", tittel: "Norske herrer på WAGR", utvalg: "Alle norske herrer med WAGR-plass.", kunAar: null, wagrDato: dato };
const rader = byggWagrLeaderboard(
  [
    { nivaa: null, wagrId: 1, navn: "Spiller A Nordvik", land: "Norway", plass: 48, snittPoeng: 820.5, bestePlass: 40, seire: 2, aarsslutt: { "2024": 310, "2025": 96 }, sisteTurnering: { name: "Junior Open", date: dato, finish: "T3" } },
    { nivaa: null, wagrId: 2, navn: "Spiller B Fjeld med et svært langt etternavn", land: "Norway", plass: 131, snittPoeng: 640, bestePlass: 120, seire: 0, aarsslutt: { "2024": 560, "2025": 210 }, sisteTurnering: null },
    { nivaa: null, wagrId: 3, navn: "Spiller C Moe", land: "Norway", plass: 188, snittPoeng: 590.1, bestePlass: 150, seire: 1, aarsslutt: { "2024": 402, "2025": 240 }, sisteTurnering: null },
  ],
  dato,
);
const kort = (id: number, navn: string, plass: number, a: Record<string, number>) => ({
  wagrId: id, navn, land: "Norway", plass, bestePlass: plass - 8, snittPoeng: 700.25, seire: 1, scoreIAar: 72.1, scoreIFjor: 73.4,
  aarForAar: [...Object.entries(a).map(([aar, p]) => ({ aar: Number(aar), plass: p })), { aar: 2026, plass }], turneringIder: [1, 2, 3, id + 10], wagrDato: dato,
});
const d = (m: number, dag: number) => new Date(Date.UTC(2026, m - 1, dag));
const resultater: WagrResultatInn[] = [
  { wagrId: 1, spillerNavn: "Spiller A Nordvik", eventId: 11, navn: "Lytham Trophy", dato: d(5, 5), finish: "4", power: 812, points: 60, rankBefore: 61, rankAfter: 48 },
  { wagrId: 1, spillerNavn: "Spiller A Nordvik", eventId: 12, navn: "Junior Open med et ganske langt turneringsnavn", dato: d(9, 21), finish: "1", power: 402, points: 45, rankBefore: 196, rankAfter: 188 },
  { wagrId: 2, spillerNavn: "Spiller B Fjeld med et svært langt etternavn", eventId: 13, navn: "Junior-NM", dato: d(8, 30), finish: "T6", power: 288, points: 20, rankBefore: 331, rankAfter: null },
  { wagrId: 2, spillerNavn: "Spiller B Fjeld med et svært langt etternavn", eventId: 11, navn: "Lytham Trophy", dato: null, finish: null, power: null, points: null, rankBefore: null, rankAfter: null },
];
const valg = rader.map((r) => ({ wagrId: r.wagrId, navn: r.navn, plass: r.plass }));

export const tilstander = {
  wagr: <TnReferanseWagrVisning {...felles} grupper={[gruppe, { ...gruppe, id: "junior", navn: "Junior Norden" }]} valgt={gruppe} rader={rader} />,
  "wagr-turneringer": <TnReferanseWagrVisning {...felles} grupper={[gruppe, { ...gruppe, id: "junior", navn: "Junior Norden" }]} valgt={gruppe} rader={rader} visning="turneringer" resultater={resultater} aar={2026} />,
  "wagr-sesong": <TnReferanseWagrVisning {...felles} grupper={[gruppe, { ...gruppe, id: "junior", navn: "Junior Norden" }]} valgt={gruppe} rader={rader} visning="sesong" resultater={resultater} aar={2026} />,
  "wagr-turneringer-tom": <TnReferanseWagrVisning {...felles} grupper={[gruppe]} valgt={gruppe} rader={rader} visning="turneringer" resultater={[]} aar={2026} />,
  "wagr-tom": <TnReferanseWagrVisning {...felles} grupper={[]} valgt={null} rader={[]} />,
  sammenlign: <TnReferanseSammenlignVisning {...felles} valg={valg} kort={[kort(1, "Spiller A Nordvik", 48, { "2024": 310, "2025": 96 }), kort(2, "Spiller B Fjeld med et svært langt etternavn", 131, { "2024": 560, "2025": 210 })]} dato={dato} />,
  "sammenlign-tom": <TnReferanseSammenlignVisning {...felles} valg={[]} kort={[]} dato={null} />,
  sok: <TnReferanseSokVisning {...felles} sok="spiller" treff={valg.map((v) => ({ ...v, land: "Norway", grupper: ["Norge", "Junior Norden"] }))} dato={dato} />,
  "sok-ingen": <TnReferanseSokVisning {...felles} sok="xyz" treff={[]} dato={dato} />,
  "norsk-golf": <TnReferanseManglerVisning {...felles} fane="norsk-golf" />,
  hcp: <TnReferanseManglerVisning {...felles} fane="hcp" />,
};
