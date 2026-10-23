/** Prøvefil for «Se hva Team Norway ser» og lenken på Del med trener (Team Norway-spiller). Syntetiske data; Jørn Johnsen er fiktiv. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { NavngittDeling } from "@/components/portal/precision/navngitt-deling";
import { TnInnsynLenke } from "@/components/portal/precision/TnInnsynLenke";
import { TnInnsynSpiller, type TnInnsynData } from "@/components/portal/precision/TnInnsynSpiller";
import type { TnInnsyn } from "@/lib/deling/tn-innsyn-data";

export const sti = "/portal/meg/deling/team-norway";

const tn = [{ id: "tn", navn: "Team Norway Golf" }];
const deling = {
  spiller: { id: "s", name: "Jørn Johnsen" }, foresattVisning: false, kanGi: true,
  grupper: [{ id: "tn", navn: "Team Norway Golf", domene: "golfforbundet.no" }], nesteSide: null, invitasjoner: [],
} as unknown as React.ComponentProps<typeof NavngittDeling>["initial"];
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

const d = (s: string) => new Date(`${s}T12:00:00Z`);
const profil = {
  navn: "Jørn Johnsen", erTnMedlem: true, fodselsdato: null, klubb: "Klubb 2", skole: null, hcp: 1.2,
  turneringer: [
    { navn: "Srixon Tour 4 med et langt turneringsnavn som må brytes", start: d("2026-08-14"), slutt: null, status: "FINISHED", runder: 3, bruttoSnitt: 73.33, plassering: "T4" },
    { navn: "Norgescup 2", start: d("2026-06-02"), slutt: null, status: "CUT", runder: 2, bruttoSnitt: 77.5, plassering: null },
  ],
  aaret: { runder: 5, bruttoSnitt: 75 },
};
const okt = (id: string, dato: string, tittel: string, akse: string) => ({ id, dato: d(dato), startMinutt: 960, minutter: 90, tittel, akse, status: "PLANNED" });
const uke = { planlagtMin: 600, gjortMin: 480, pct: 80 };
const faner: Record<string, TnInnsyn> = {
  oversikt: {
    fane: "oversikt", aar: 2026, profil,
    delt: { wagr: { plass: 412, dato: d("2026-10-19") }, nesteTurneringer: [{ navn: "Srixon Tour finale", dato: d("2026-11-01"), merke: "Meldt på" }], avslatteForslag: [] },
    tester: [{ testId: "t1", protokollNavn: "Driver Basic", antall: 3, antallUtelatt: 0, sisteScore: 42, sisteEnhet: "p", sisteFormatert: "42 p", sisteDato: d("2026-10-14"), forrigeScore: 39, besteScore: 42, besteFormatert: "42 p", lowerIsBetter: false, sisteTestdagDeltakerId: null }],
    poster: [{ id: "p1", authorUserId: "a", authorNavn: "Trener En", tekst: "Plan for vinterperioden", kind: "TEKST", createdAt: d("2026-10-16"), editedAt: null, vedlegg: [], kvittering: null }],
  },
  turneringsplan: { fane: "turneringsplan", plan: { spiller: { id: "s", fornavn: "Jørn", etternavn: "Johnsen", rang: 412, snitt: 75, runder: 5, harNivaa: true }, stadium: null, katalog: [], forslag: [], anslag: null, laget: null, modellMangler: false, plan: [{ entryId: "e1", tier: "A", status: "CONFIRMED", statusTekst: "Påmeldt", rad: null, navn: "Spanish Junior Open", d: "2027-02-14", tournamentId: null }] } },
  ranking: { fane: "ranking", ranking: { wagr: { plass: 412, bestePlass: 380, snittPoeng: 512.4, seire: 0, aarsslutt: [], dato: d("2026-10-19") }, historikk: [{ navn: "Srixon Tour 4", dato: d("2026-08-14"), aar: 2026, uke: 33, plassering: "T4", plassFoer: 430, plassEtter: 412 }] } },
  turneringer: { fane: "turneringer", aar: 2026, iAar: profil, iFjor: { ...profil, turneringer: [], aaret: { runder: 8, bruttoSnitt: 76.25 } } },
  trening: {
    fane: "trening", naa: d("2026-10-22"), planer: [{ id: "pl", navn: "Vinterplan", status: "ACTIVE", startDato: d("2026-10-01"), sluttDato: d("2027-03-31") }],
    data: { trening: { uker: [uke, uke], toUker: uke, mestAkse: "TEK", underPlan: false, fireUker: { akseMin: { FYS: 240, TEK: 600, SLAG: 480, SPILL: 300, TURN: 0 }, planlagtMin: 2000, gjortMin: 1620 } }, kommende: [okt("k1", "2026-10-23", "Wedge 40–60 m", "SLAG")], sistGjort: [okt("g1", "2026-10-20", "Driver Gate", "TEK")] },
  },
  tester: { fane: "tester", rader: [{ testId: "t1", protokollNavn: "Driver Basic", antall: 3, antallUtelatt: 0, sisteScore: 42, sisteEnhet: "p", sisteFormatert: "42 p", sisteDato: d("2026-10-14"), forrigeScore: 39, besteScore: 42, besteFormatert: "42 p", lowerIsBetter: false, sisteTestdagDeltakerId: null }] },
  "teknisk-plan": { fane: "teknisk-plan", planer: [{ id: "tp", navn: "P6.0 til P7.0", status: "ACTIVE", startDato: d("2026-09-01"), sluttDato: null, antallOppgaver: 6, antallFullfort: 2 }] },
  fireukerssjekk: { fane: "fireukerssjekk", iup: [], grunnlag: { planer: [], aktivPlan: null, nesteTiltak: null, tester: [] } },
} as unknown as Record<string, TnInnsyn>;

const grunn: TnInnsynData = {
  grupper: tn, fane: "oversikt", iup: faner.oversikt,
  trenere: [{ epost: "trener.en.med.en.lang.adresse@golfforbundet.no", gruppeNavn: "Team Norway Golf", invitert: "2026-09-03T10:00:00Z" }],
  apent: { navn: "Jørn Johnsen", klubb: "Klubb 2", fodselsaar: 2009, wagrPlass: 412 },
};

export const tilstander = {
  delt: <Skall><TnInnsynSpiller data={grunn} /></Skall>,
  ...Object.fromEntries(Object.entries(faner).filter(([f]) => f !== "oversikt").map(([f, iup]) => [f, <Skall key={f}><TnInnsynSpiller data={{ ...grunn, fane: iup.fane, iup }} /></Skall>])),
  "ikke-delt": <Skall><TnInnsynSpiller data={{ ...grunn, trenere: [], iup: null, apent: { ...grunn.apent, klubb: null, fodselsaar: null, wagrPlass: null } }} /></Skall>,
  lenke: <Skall><NavngittDeling initial={deling} skra ekstra={<TnInnsynLenke tnGrupper={tn} />} /></Skall>,
};
