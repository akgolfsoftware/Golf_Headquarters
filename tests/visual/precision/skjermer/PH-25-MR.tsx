/** Prøvefil for pakke 14 Meg, resten: Velg Full, Behold PlayerHQ, Sikkerhet, Tofaktor, Dataene dine, Turneringsresultater. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25VelgFull } from "@/components/portal/precision/PH25VelgFull";
import { PH25BeholdPlayerHQ } from "@/components/portal/precision/PH25BeholdPlayerHQ";
import { PH25Sikkerhet } from "@/components/portal/precision/PH25Sikkerhet";
import { PH25Tofaktor } from "@/components/portal/precision/PH25Tofaktor";
import { PH25DataeneDine } from "@/components/portal/precision/PH25DataeneDine";
import { PH24Resultater } from "@/components/portal/precision/PH24Resultater";

export const sti = "/portal/meg/abonnement";
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const ingen = async () => {};
const behold = { tilbudId: "t1", slutt: "31. oktober", fraDato: "1. november", minutter: 2890, okter: 86, runder: 23, tester: 11, malsetninger: 3 };
const sik = { epost: "oyvind.rohjan@eksempel.no", google: false, passord: true, tofaktorPaa: false, sisteInnlogging: "i dag 07:42" };
const rader = [
  { navn: "Profil, samtykker og innstillinger", antall: "1", farge: "g9" as const }, { navn: "Økter i planen", antall: "214", farge: "tek" as const },
  { navn: "Runder og slag", antall: "23 · 812", farge: "spill" as const }, { navn: "Testresultater", antall: "11", farge: "slag" as const },
  { navn: "Meldinger med Caddie", antall: "209", farge: "g6" as const },
];
const resultater = {
  person: { name: "Øyvind Rohjan", birth_year: 2009 },
  sesonger: [{ year: 2026, runder: 18, turneringer: 7, snitt_score: 74.2, snitt_til_par: 2.4, snitt_mot_felt: -1.3, justert_snitt: 73.1, segment: null, persentil_kull: null, kull_n: null }],
  monster: [{ year: 2026, hull: 324, birdierate: 0.08, bogeyrate: 0.27, dobbeltrate: 0.05, snitt_par3: 0.31, snitt_par4: 0.12, snitt_par5: -0.2 }],
  runder: [{ turnering_id: 1, turnering: "Norgescup 4 Stavanger med et svært langt turneringsnavn", dato: "2026-09-12", klasse: "Gutter 16", runde: 1, score: 73, til_par: 1, felt_snitt: 75.4, felt_n: 60, mot_felt: -2.4, justert_score: 72.6, feltstyrke: null, hull: null }],
};
export const tilstander = {
  full: <S><PH25VelgFull data={{ faarProveuke: true, forsteTrekk: "mandag 12. oktober" }} /></S>,
  "full-uten-prove": <S><PH25VelgFull data={{ faarProveuke: false, forsteTrekk: "mandag 12. oktober" }} /></S>,
  behold: <S><PH25BeholdPlayerHQ data={behold} /></S>,
  "behold-tom": <S><PH25BeholdPlayerHQ data={{ ...behold, slutt: null, fraDato: null, minutter: 0, okter: 0, runder: 0, tester: 0, malsetninger: 0 }} /></S>,
  sikkerhet: <S><PH25Sikkerhet data={sik} loggUt={ingen} /></S>,
  "sikkerhet-google": <S><PH25Sikkerhet data={{ ...sik, google: true, passord: false, tofaktorPaa: true, sisteInnlogging: null }} loggUt={ingen} /></S>,
  "tofaktor-feil": <S><PH25Tofaktor /></S>,
  data: <S><PH25DataeneDine data={{ totalt: 1284, rader, talt: "i dag 14:20", filnavn: "ak-golf-data-2026-10-05.json" }} /></S>,
  resultater: <S><PH24Resultater data={{ koblet: true, resultater }} /></S>,
  "resultater-koble": <S><PH24Resultater data={{ koblet: false, ventende: null }} /></S>,
  "resultater-ventende": <S><PH24Resultater data={{ koblet: false, ventende: { linkId: 1, kandidat: { person_id: 9, name: "Øyvind Rohjan", birth_year: 2009, club: "Gamle Fredrikstad GK", tournaments: 14, evidence: [{ tournament: "Norgescup 4", date: "2026-09-12", class: "G16" }] } } }} /></S>,
};
