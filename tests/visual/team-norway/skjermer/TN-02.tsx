/** Prøvefil for TN-02 IUP › Oversikt (pakke d, wireframes utkast-tn/trenerflate) og låst IUP uten deling. Syntetisk spiller. */
import { TnIupLaastVisning } from "@/components/team-norway/skjermer/tn-iup-laast-visning";
import { TnSpillerprofilVisning } from "@/components/team-norway/skjermer/tn-spillerprofil-visning";
import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/spiller/s1";

type Props = Parameters<typeof TnSpillerprofilVisning>[0];

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const naa = new Date(Date.UTC(2026, 9, 20, 10));
const d = (y: number, m: number, dag: number) => new Date(Date.UTC(y, m - 1, dag, 10));

const base: Props = {
  brukerNavn: "Trener 1",
  kontekst,
  spillerId: "s1",
  aar: 2026,
  naa,
  profil: {
    navn: "Spiller B",
    erTnMedlem: true,
    fodselsdato: d(2009, 4, 12),
    klubb: "Klubb 2",
    skole: "Skole A",
    hcp: -0.8,
    aaret: { runder: 18, bruttoSnitt: 72.1 },
    turneringer: [
      { navn: "Junior Open, Spania", start: d(2026, 10, 18), slutt: d(2026, 10, 20), status: "PLAYING", runder: 2, bruttoSnitt: 70.5, plassering: "T6" },
      { navn: "Norgescup 4", start: d(2026, 8, 22), slutt: d(2026, 8, 23), status: "FINISHED", runder: 2, bruttoSnitt: 73, plassering: "T14" },
      { navn: "Norgescup 3", start: d(2026, 7, 4), slutt: d(2026, 7, 5), status: "CUT", runder: 2, bruttoSnitt: 76.5, plassering: null },
    ],
  },
  tester: {
    tilgang: { kontekst, spillerId: "s1", spillerNavn: "Spiller B" },
    rader: [
      { testId: "t1", protokollNavn: "Wedge Gate", antall: 3, antallUtelatt: 0, sisteScore: 29, sisteEnhet: "p", sisteFormatert: "29 p", sisteDato: d(2026, 9, 14), forrigeScore: 25, besteScore: 29, besteFormatert: "29 p", lowerIsBetter: false, sisteTestdagDeltakerId: null },
      { testId: "t2", protokollNavn: "Driver Basic", antall: 2, antallUtelatt: 0, sisteScore: 0.052, sisteEnhet: "PEI", sisteFormatert: "5,2 %", sisteDato: d(2026, 9, 14), forrigeScore: 0.061, besteScore: 0.052, besteFormatert: "5,2 %", lowerIsBetter: true, sisteTestdagDeltakerId: null },
      { testId: "t3", protokollNavn: "Putt 1–3 m", antall: 3, antallUtelatt: 0, sisteScore: 30, sisteEnhet: "slag", sisteFormatert: "30 slag", sisteDato: d(2026, 8, 20), forrigeScore: 31, besteScore: 30, besteFormatert: "30 slag", lowerIsBetter: true, sisteTestdagDeltakerId: null },
    ],
  },
  lisens: { status: "ok", niva: "FULL", kilde: "PLAYERHQ_ABONNEMENT" },
  reg: { spillerId: "s1", lisensStatus: "BETALT", lisensBetaltDato: d(2026, 1, 8), helseattestUtloper: d(2027, 1, 31), antidopingSignert: d(2026, 2, 2) },
  iup: [],
  akser: { gjennomfort: { FYS: 11, TEK: 12, SLAG: 14, SPILL: 9, TURN: 2 }, planlagtTimer: 53, gjennomfortTimer: 48 },
  delt: {
    wagr: { plass: 412, dato: d(2026, 10, 19) },
    nesteTurneringer: [
      { navn: "Srixon Tour finale", dato: d(2026, 11, 1), merke: "Bekreftet" },
      { navn: "Spanish Junior Open", dato: d(2027, 2, 14), merke: "Planlagt" },
    ],
    avslatteForslag: [{ avslatt: d(2026, 10, 19) }],
  },
  poster: [
    { id: "p1", tekst: "Plan for vinterperioden\nVi starter med to TEK-økter i uka.", authorNavn: "Trener 1", createdAt: d(2026, 10, 16), kvittering: { totalt: 2, apnet: 2 } },
    { id: "p2", tekst: "Pakkeliste høstsamling", authorNavn: "Trener 2", createdAt: d(2026, 10, 2), kvittering: { totalt: 2, apnet: 1 } },
  ],
};

const Vis = (p: Partial<Props>) => <TnSpillerprofilVisning {...base} {...p} />;

export const tilstander = {
  data: <Vis />,
  "uten-data": <Vis akser={null} tester={null} delt={null} poster={[]} profil={{ ...base.profil, turneringer: null, aaret: null }} reg={null} />,
  laast: <TnIupLaastVisning brukerNavn="Trener 1" kontekst={kontekst} spillerId="spiller-c" aktiv="oversikt" navn="Spiller C" klubb="Klubb 3" fodselsaar={2010} wagr={{ plass: 1240, dato: d(2026, 10, 19) }} aar={2026} />,
};
