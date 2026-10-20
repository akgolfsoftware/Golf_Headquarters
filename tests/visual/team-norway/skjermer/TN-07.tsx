/** Prøvefil for TN-07 Turneringer, én turnering, TN-08 Live Watch og TN-17 Legg inn turnering i retning «Skrå» (canvaset, tavlene A1–A4). Syntetiske data. */
import { TnLiveWatchVisning, TnTurneringNyVisning, TnTurneringVisning, TnTurneringerVisning } from "@/components/team-norway/skjermer/tn-turneringer-visning";
import type { TnArbeidskontekst, TnTurneringRad } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/turneringer";

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const spiller: TnArbeidskontekst = { ...kontekst, rolle: "PLAYER", erSpiller: true, kanAdministrere: false };
const naa = new Date(Date.UTC(2026, 9, 20, 10));
const d = (m: number, dag: number) => new Date(Date.UTC(2026, m - 1, dag, 8));
const navn = { b: "Spiller B", c: "Spiller C", f: "Spiller F", j: "Spiller J", d: "Spiller D" };

const turneringer: TnTurneringRad[] = [
  { id: "t1", name: "Junior Masters", startDate: d(10, 19), endDate: d(10, 21), location: "Oslo golfklubb", sourceOrigin: "GOLFBOX",
    results: [{ userId: "c", position: 3, score: 143 }, { userId: "j", position: 8, score: 146 }, { userId: "b", position: 14, score: 149 }],
    entries: [{ userId: "b", entryStatus: "TEED_OFF" }, { userId: "c", entryStatus: "TEED_OFF" }, { userId: "f", entryStatus: "REGISTERED" }, { userId: "j", entryStatus: "TEED_OFF" }] },
  { id: "t2", name: "Norgescup finale", startDate: d(10, 25), endDate: d(10, 26), location: "Larvik", sourceOrigin: "NORGESCUP", results: [],
    entries: ["b", "c", "d", "f", "j"].map((userId) => ({ userId, entryStatus: "REGISTERED" })) },
  { id: "t3", name: "Internasjonal junior, Spania", startDate: d(11, 7), endDate: d(11, 9), location: "Madrid", sourceOrigin: "MANUAL", results: [], entries: [{ userId: "c", entryStatus: "PLANNED" }] },
  { id: "t4", name: "Klubbmesterskap innendørs", startDate: null, endDate: null, location: null, sourceOrigin: "MANUAL", results: [], entries: [{ userId: "f", entryStatus: "PLANNED" }] },
  { id: "t5", name: "Norgescup 4", startDate: d(10, 11), endDate: d(10, 12), location: "Bærum", sourceOrigin: "NORGESCUP",
    results: [{ userId: "c", position: 2, score: 141 }, { userId: "j", position: 5, score: 145 }], entries: [] },
  { id: "t6", name: "Srixon Tour", startDate: d(10, 4), endDate: d(10, 5), location: "Drammen", sourceOrigin: "SRIXON", results: [{ userId: "b", position: 9, score: 149 }], entries: [] },
];
const data = { kontekst, turneringer };

export const tilstander = {
  liste: <TnTurneringerVisning brukerNavn="Trener 1" visDataGolf={false} data={data} navn={navn} visning="kommende" naa={naa} />,
  gjennomfort: <TnTurneringerVisning brukerNavn="Trener 1" visDataGolf={false} data={data} navn={navn} visning="fullforte" naa={naa} />,
  tom: <TnTurneringerVisning brukerNavn="Trener 1" visDataGolf={false} data={{ kontekst, turneringer: [] }} navn={{}} visning="kommende" naa={naa} />,
  turnering: <TnTurneringVisning brukerNavn="Trener 1" visDataGolf={false} data={data} turnering={turneringer[0]!} navn={navn} naa={naa} />,
  "turnering-uten-dato": <TnTurneringVisning brukerNavn="Trener 1" visDataGolf={false} data={data} turnering={turneringer[3]!} navn={navn} naa={naa} />,
  live: <TnLiveWatchVisning brukerNavn="Trener 1" visDataGolf={false} data={data} navn={navn} naa={naa} />,
  "live-tom": <TnLiveWatchVisning brukerNavn="Trener 1" visDataGolf={false} data={{ kontekst, turneringer: [turneringer[1]!] }} navn={navn} naa={naa} />,
  ny: <TnTurneringNyVisning brukerNavn="Spiller C" kontekst={spiller} visDataGolf={false} />,
};
