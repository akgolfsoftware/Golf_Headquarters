/** Prøvefil for IUP-fanene Ranking, Turneringer og Trening (pakke e, wireframes utkast-tn/trenerflate §2) og låsen på en fane. Syntetiske spillere. */
import { TnIupRankingVisning, TnIupTreningVisning, TnIupTurneringerVisning } from "@/components/team-norway/skjermer/tn-iup-faner-visning";
import { TnIupLaastVisning } from "@/components/team-norway/skjermer/tn-iup-laast-visning";
import type { TnArbeidskontekst, TnSpillerProfil, TnSpillerTreningFane } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/spiller/s1/ranking";

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const d = (y: number, m: number, dag: number) => new Date(Date.UTC(y, m - 1, dag, 10));
const felles = { brukerNavn: "Trener 1", kontekst, spillerId: "s1", spillerNavn: "Spiller B" };

const profil = (aar: number, snitt: number | null, turneringer: TnSpillerProfil["turneringer"]): TnSpillerProfil => ({
  navn: "Spiller B", erTnMedlem: true, fodselsdato: d(2009, 4, 12), klubb: "Klubb 2", skole: null, hcp: -0.8,
  turneringer, aaret: turneringer ? { runder: turneringer.reduce((s, t) => s + t.runder, 0), bruttoSnitt: snitt } : null,
});
const iAar = profil(2026, 72.4, [
  { navn: "Norgescup 1", start: d(2026, 5, 2), slutt: d(2026, 5, 3), status: "FINISHED", runder: 2, bruttoSnitt: 74.5, plassering: "T21" },
  { navn: "Norgescup 2 med et ganske langt turneringsnavn", start: d(2026, 6, 6), slutt: d(2026, 6, 7), status: "FINISHED", runder: 2, bruttoSnitt: 72, plassering: "T9" },
  { navn: "Norgescup 3", start: d(2026, 7, 4), slutt: d(2026, 7, 5), status: "CUT", runder: 2, bruttoSnitt: 76.5, plassering: null },
  { navn: "Junior Open, Spania", start: d(2026, 10, 18), slutt: d(2026, 10, 20), status: "FINISHED", runder: 3, bruttoSnitt: 70.3, plassering: "T6" },
]);
const iFjor = profil(2025, 74.1, [{ navn: "Norgescup 4", start: d(2025, 8, 22), slutt: d(2025, 8, 23), status: "FINISHED", runder: 2, bruttoSnitt: 74.1, plassering: "T30" }]);

const trening: TnSpillerTreningFane = {
  trening: {
    uker: [{ planlagtMin: 600, gjortMin: 540, pct: 90 }, { planlagtMin: 540, gjortMin: 300, pct: 56 }],
    toUker: { planlagtMin: 1140, gjortMin: 840, pct: 74 },
    mestAkse: "TEK",
    underPlan: false,
    fireUker: { akseMin: { FYS: 360, TEK: 540, SLAG: 480, SPILL: 300, TURN: 60 }, planlagtMin: 2100, gjortMin: 1740 },
  },
  kommende: [
    { id: "o1", dato: d(2026, 10, 22), startMinutt: 960, minutter: 90, tittel: "Wedge-avstander", akse: "SLAG", status: "PUBLISHED" },
    { id: "o2", dato: d(2026, 10, 23), startMinutt: 420, minutter: 60, tittel: "Styrke underkropp", akse: "FYS", status: "PUBLISHED" },
  ],
  sistGjort: [{ id: "o3", dato: d(2026, 10, 20), startMinutt: 900, minutter: 75, tittel: "P6–P7 med speil", akse: "TEK", status: "COMPLETED" }],
};
const tomTrening: TnSpillerTreningFane = { trening: { uker: [{ planlagtMin: 0, gjortMin: 0, pct: null }, { planlagtMin: 0, gjortMin: 0, pct: null }], toUker: { planlagtMin: 0, gjortMin: 0, pct: null }, mestAkse: null, underPlan: false, fireUker: { akseMin: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 }, planlagtMin: 0, gjortMin: 0 } }, kommende: [], sistGjort: [] };

export const tilstander = {
  ranking: (
    <TnIupRankingVisning
      {...felles}
      ranking={{
        wagr: { plass: 412, bestePlass: 388, snittPoeng: 512.34, seire: 1, aarsslutt: [{ aar: 2025, plass: 846 }, { aar: 2024, plass: 2239 }], dato: d(2026, 10, 22) },
        historikk: [
          { navn: "Spanish Junior Open", dato: d(2026, 2, 14), aar: 2026, uke: 7, plassering: "T12", plassFoer: 846, plassEtter: 790 },
          { navn: "Norgescup 1", dato: d(2026, 5, 3), aar: 2026, uke: 18, plassering: "T21", plassFoer: 790, plassEtter: 760 },
          { navn: "Junior Open, Spania", dato: d(2026, 10, 20), aar: 2026, uke: 42, plassering: "T6", plassFoer: 520, plassEtter: 412 },
        ],
      }}
    />
  ),
  "ranking-tom": <TnIupRankingVisning {...felles} ranking={{ wagr: null, historikk: [] }} />,
  turneringer: <TnIupTurneringerVisning {...felles} aar={2026} iAar={iAar} iFjor={iFjor} />,
  "turneringer-tom": <TnIupTurneringerVisning {...felles} aar={2026} iAar={profil(2026, null, null)} iFjor={null} />,
  trening: <TnIupTreningVisning {...felles} naa={d(2026, 10, 22)} data={trening} planer={[{ id: "p1", navn: "Vinterplan 2026/27", status: "ACTIVE", startDato: d(2026, 10, 1), sluttDato: d(2027, 3, 31) }]} />,
  "trening-tom": <TnIupTreningVisning {...felles} naa={d(2026, 10, 22)} data={tomTrening} planer={null} />,
  "laast-trening": <TnIupLaastVisning brukerNavn="Trener 1" kontekst={kontekst} spillerId="s3" aktiv="trening" navn="Spiller C" klubb="Klubb 3" fodselsaar={2010} wagr={null} aar={2026} />,
};
