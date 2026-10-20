/** Prøvefil for TN-23 Teknisk plan (alle planer og én plan) i retning «Skrå» (canvaset, tavlene C1–C2). Syntetiske data. */
import { TnTekniskPlanVisning, TnTekniskPlanerVisning, type TnTekniskPlanKontekst } from "@/components/team-norway/skjermer/tn-teknisk-plan-visning";
import type { TnTekniskOppgaveRad, TnTekniskPlanDetalj, TnTekniskPlanRad } from "@/lib/domain/tn-teknisk-plan";

export const sti = "/team-norway/spiller/b/teknisk-plan";

const kontekst: TnTekniskPlanKontekst = { erSpiller: false, erTrener: true, kanAdministrere: true, gruppeId: "g1" };
const d = (y: number, m: number, dag: number) => new Date(Date.UTC(y, m - 1, dag));
const ingen = async () => {};

const planer: TnTekniskPlanRad[] = [
  { id: "p1", navn: "Vinter 2026/27 · nedsving", status: "ACTIVE", startDato: d(2026, 10, 1), sluttDato: d(2027, 3, 31), antallOppgaver: 4, antallFullfort: 1 },
  { id: "p2", navn: "Sommer 2026 · oppstilling og baksving", status: "ARCHIVED", startDato: d(2026, 4, 1), sluttDato: d(2026, 9, 30), antallOppgaver: 5, antallFullfort: 5 },
];

const oppgave = (id: string, tittel: string, status: string, trackStatus: string, omraade: string, reps: [number, number, number, number, number, number], beskrivelse: string | null = null): TnTekniskOppgaveRad => ({
  id, tittel, beskrivelse, pyramide: "TEK", omraade, koller: ["7-jern"], status, trackStatus,
  repsGjortDry: reps[0], repsMaalDry: reps[1], repsGjortLav: reps[2], repsMaalLav: reps[3], repsGjortFull: reps[4], repsMaalFull: reps[5],
  lastRepLoggedAt: status === "PENDING" ? null : d(2026, 10, 18),
});

const plan: TnTekniskPlanDetalj = {
  id: "p1", navn: "Vinter 2026/27 · nedsving", status: "ACTIVE", startDato: d(2026, 10, 1), sluttDato: d(2027, 3, 31),
  posisjoner: [
    { id: "x6", pNummer: "P6.0", navn: "Kølle parallell i nedsving", hovedfokus: true, oppgaver: [
      oppgave("o1", "Skaftet på linje med høyre underarm", "ACTIVE", "PAA_VEI", "Driving range", [180, 200, 90, 150, 20, 100], "Kølla skal peke mellom ballen og føttene i P6.0. Speil eller video bakfra."),
      oppgave("o2", "Hold vinkelen i høyre håndledd", "ACTIVE", "STAGNERER", "Driving range", [140, 200, 30, 150, 0, 100]),
    ] },
    { id: "x7", pNummer: "P7.0", navn: "Treffpunktet", hovedfokus: false, oppgaver: [oppgave("o3", "Hendene foran ballen i treff", "PENDING", "INAKTIV", "Nærspill", [0, 150, 0, 150, 0, 100])] },
    { id: "x4", pNummer: "P4.0", navn: "Toppen av baksvingen", hovedfokus: false, oppgaver: [oppgave("o4", "Venstre arm i plan på toppen", "DONE", "FERDIG", "Driving range", [200, 200, 150, 150, 100, 100])] },
  ],
  siste: [],
};

export const tilstander = {
  planer: <TnTekniskPlanerVisning brukerNavn="Trener 1" kontekst={kontekst} spillerId="b" spillerNavn="Spiller B" planer={planer} />,
  "uten-planer": <TnTekniskPlanerVisning brukerNavn="Trener 1" kontekst={kontekst} spillerId="b" spillerNavn="Spiller B" planer={[]} />,
  plan: <TnTekniskPlanVisning brukerNavn="Trener 1" kontekst={kontekst} spillerId="b" spillerNavn="Spiller B" plan={plan} siste={[{ tid: "2026-10-18 17:40", hvem: "Trener 1", hva: "Logget reps" }]} handlinger={{ loggRep: ingen, opprettOppgave: ingen, oppdaterOppgave: ingen, slettOppgave: ingen }} />,
};
