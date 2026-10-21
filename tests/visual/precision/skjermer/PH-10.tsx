/** Prøvefil for PH-10 Plan i nytt design (pakke 3). Syntetiske data fra utkastet: uke 41, mandag 5. oktober 2026. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH10Plan } from "@/components/portal/precision/PH10Plan";
import { PH10PlanLaster } from "@/components/portal/precision/PH10PlanLaster";
import type { TodaySession, WeekDay } from "@/app/portal/actions";
import type { KalenderHendelse } from "@/lib/domain/kalender-lag";
import type { PlanOpptatt } from "@/lib/portal/plan-visning";

export const sti = "/portal/planlegge";

type Akse = TodaySession["pyramidArea"];
const OKTER: [number, string, string, Akse, string, string, TodaySession["status"]?][] = [
  [0, "15:30", "16:45", "SLAG", "Innspill og nærspill", "Range 3 · Fredrikstad GK", "COMPLETED"],
  [0, "17:30", "18:15", "FYS", "Styrke bein og kjerne", "Styrkerommet"],
  [1, "16:00", "17:30", "SLAG", "Chip og pitch", "Nærspillsområdet · Fredrikstad GK"],
  [1, "18:00", "18:45", "TEK", "Speiltrening P5.0–P6.0", "Hjemme · speil"],
  [2, "15:00", "17:30", "SPILL", "Spill 9 hull", "Fredrikstad GK"],
  [3, "15:30", "16:30", "TEK", "Teknikk P7.0 Treffpunktet", "Golfstudio"],
  [3, "17:00", "18:00", "SLAG", "Putting 5–10 fot", "Puttinggreen"],
  [4, "15:00", "15:45", "FYS", "Styrke overkropp", "Styrkerommet"],
  [4, "16:00", "17:15", "TEK", "Teknikk P5.0–P6.0", "Golfstudio"],
  [5, "09:00", "11:00", "SPILL", "Banespill 9 hull", "Larvik GK"],
  [6, "09:00", "10:20", "SPILL", "Nærspillsbane", "Larvik GK"],
];
const DAG = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const dato = (d: number) => `2026-10-${String(5 + d).padStart(2, "0")}`;
// Oslo er UTC+2 i oktober (sommertid til 25.10).
const tidspunkt = (d: number, hhmm: string) => new Date(`${dato(d)}T${hhmm}:00+02:00`);
const min = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

function okt(i: number): TodaySession {
  const [d, fra, til, a, navn, sted, status] = OKTER[i];
  return {
    id: `o${i}`, title: navn, startTime: tidspunkt(d, fra), endTime: tidspunkt(d, til), status: status ?? "PLANNED",
    model: "wb", planSessionId: `p${i}`, practiceType: "BLOKK", pyramidArea: a, durationMin: min(til) - min(fra),
    sted, maalsetning: i === 0 ? "Lengdekontroll 100–150 m" : null,
    drills: i === 0 ? [{ id: "d1", name: "Innspill 100–150 m", durationMinutes: 45 }, { id: "d2", name: "9 slag mot flagg", durationMinutes: 20 }] : [],
    href: `/portal/live/o${i}`,
  };
}

function uke(tom = false): WeekDay[] {
  return DAG.map((label, d) => ({
    date: tidspunkt(d, "12:00"), dayLabel: label, dayNumber: 5 + d, isToday: d === 0,
    sessions: tom ? [] : OKTER.map((_, i) => i).filter((i) => OKTER[i][0] === d).map(okt),
  }));
}

const KALENDER: KalenderHendelse[] = [
  ...[0, 1, 2, 4].map((d) => ({ id: `skole${d}`, lag: "SKOLE" as const, dato: dato(d), tittel: "Skole", startMin: min("08:15"), sluttMin: min("14:00"), heldag: false, lesevisning: true })),
  { id: "skole3", lag: "SKOLE", dato: dato(3), tittel: "Skole", startMin: min("10:15"), sluttMin: min("14:30"), heldag: false, lesevisning: true },
  ...[5, 6].map((d) => ({ id: `samling${d}`, lag: "TURNERING" as const, dato: dato(d), tittel: "Treningssamling · Larvik GK", startMin: null, sluttMin: null, heldag: true })),
];
const OPPTATT: PlanOpptatt[] = [{ id: "tannlege", dato: dato(3), startMin: min("08:30"), sluttMin: min("10:00"), tittel: "Tannlege" }];
const PERIODE = { navn: "Grunnperiode", fokus: null, uke: 3, antallUker: 8 };
const FORSLAG = [{ coachName: "Anders Kristiansen", session: { ...okt(5), id: "f1", title: "Bunkerslag 20–40 m", startTime: tidspunkt(2, "18:00"), endTime: tidspunkt(2, "18:45"), durationMin: 45, pyramidArea: "SLAG" as const, sted: "Bunker · Fredrikstad GK" } }];

const MAAL = [
  { id: "m1", tittel: "Handicap under 4,0", kategori: "Resultatmål" as const, frist: "1. juni 2027", pct: 62, status: "on-track" as const, href: "/portal/mal/goal/m1" },
  { id: "m2", tittel: "Fire putteøkter i uka", kategori: "Prosessmål" as const, frist: null, pct: 40, status: "behind" as const, href: "/portal/mal/goal/m2" },
];

const Vis = ({ tom = false, feil = false, forslag = false, uke: offset = 0 }: { tom?: boolean; feil?: boolean; forslag?: boolean; uke?: number }) => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>
    <PH10Plan data={{ weekNumber: 41, week: uke(tom) }} kalender={tom ? [] : KALENDER} opptatt={tom ? [] : OPPTATT}
      forslag={forslag ? FORSLAG : []} periode={tom ? null : PERIODE} harTekniskPlan={!tom} maal={tom ? [] : MAAL} ukeOffset={offset} tilstand={feil ? "feil" : "data"} />
  </PlayerHQSkall>
);

export const tilstander = {
  uke: <Vis />,
  forslag: <Vis forslag />,
  nesteUke: <Vis uke={1} />,
  tom: <Vis tom />,
  laster: <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}><PH10PlanLaster /></PlayerHQSkall>,
  feil: <Vis feil />,
};
