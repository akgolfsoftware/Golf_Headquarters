// MIDLERTIDIG målingsside for W1 (syntetiske data). Skal ikke legges inn.
import { WangCoachKlient } from "@/app/team-wang/coach/WangCoachKlient";
import type { WangOmraade } from "@/components/wang/WangAppSkall";
import { byggWangTrenerData } from "@/app/team-wang/_data/wang-trener-data";
import type { WangLiveData } from "@/app/team-wang/_data/hent-wang-gruppe";
import { byggWangPlanData, TOM_PLANDATA, type WangPlanOkt } from "@/app/team-wang/_data/wang-plan-visning";

export const dynamic = "force-dynamic";

const NAVN = ["Kristoffer Langbakken Haugseth", "Ida Solberg", "Magnus Aasheim", "Emma Johansen", "Henrik Berg", "Sara Lie"];
const live = {
  gruppeId: "g1", gruppeNavn: "WANG Toppidrett Fredrikstad", antallElever: NAVN.length,
  elever: [...NAVN.map((n, i) => ({ id: `e${i}`, navn: n, rolle: "PLAYER" })), { id: "t1", navn: "Trener", rolle: "COACH" }],
  perioder: [{ id: "p2", fase: "SPESIAL", startIso: "2026-10-01", endIso: "2026-11-30", fokus: "Nærspill", ukevolMin: null, ukevolMax: null }],
  hendelser: [], fasteOkter: [{ ukedag: 0, startTid: "07:30", sluttTid: "09:00", sted: "Golfhallen", tittel: "Morgentrening" }],
  skoleDager: [], fokusomraader: [], oppdatertIso: "2026-10-18",
} as unknown as WangLiveData;

const NAA = new Date();
const okt = (d: number, done: boolean, akse: WangPlanOkt["akse"], fraGruppa = false): WangPlanOkt => ({
  scheduledAt: new Date(NAA.getTime() - d * 86_400_000), durationMin: 90, status: done ? "COMPLETED" : "PLANNED", akse, fraGruppa,
});
const ja = { scope: "TRENINGSPLAN", mottakerGruppeId: "g1", gitt: true, gittAvRolle: "FORESATT", createdAt: new Date("2026-09-01") };
const sett = (ferdig: number) => Array.from({ length: 8 }, (_, i) => okt(i * 3 + 1, i < ferdig, (["FYS", "TEK", "SLAG", "SPILL"] as const)[i % 4], i % 2 === 0));

export default async function Side({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const p = await searchParams;
  const tom = p.tom === "1";
  const plan = tom ? TOM_PLANDATA : byggWangPlanData([
    { id: "e0", kreverForesatt: true, fodselsdato: null, samtykkeRader: [ja], okter: sett(4) },
    { id: "e1", kreverForesatt: true, fodselsdato: null, samtykkeRader: [ja], okter: sett(8) },
    { id: "e2", kreverForesatt: true, fodselsdato: null, samtykkeRader: [ja], okter: sett(7) },
    { id: "e3", kreverForesatt: true, fodselsdato: null, samtykkeRader: [], okter: [] },
    { id: "e4", kreverForesatt: true, fodselsdato: null, samtykkeRader: [ja], okter: [] },
  ], "g1", NAA);
  return (
    <WangCoachKlient
      omraade={(p.omraade ?? "elever") as WangOmraade}
      fane={p.fane}
      id={p.id}
      rolle="TRENER"
      tester={{ delerIder: ["e0", "e3"], resultater: [] }}
      plan={plan}
      data={byggWangTrenerData(live, "2026-10-19", "08:00")}
    />
  );
}
