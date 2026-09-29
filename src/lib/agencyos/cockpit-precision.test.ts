import { test } from "node:test";
import assert from "node:assert/strict";
import { byggAG01Data, kalenderRader, kalPst, hhmm } from "./cockpit-precision";
import type { CockpitData, CockpitTimelineSession } from "@/components/admin/cockpit/agency-cockpit";

function okt(id: string, startMin: number, durMin: number): CockpitTimelineSession {
  return { id, startMin, durMin, time: "", initials: "TT", playerName: `Spiller ${id}`, axis: "tek", axisLabel: "TEK", title: "Privattime", meta: [{ icon: "user", text: "1-til-1" }, { icon: "map-pin", text: "Studio 1" }], href: `/admin/gjennomfore/okter/${id}` };
}

const brief = {
  now: 10 * 60 + 30,
  timeline: [okt("b", 11 * 60, 60), okt("a", 8 * 60, 60), okt("c", 10 * 60, 60), okt("d", 14 * 60, 60)],
  tasks: [{ id: "n1", label: "Ring klubben", tag: "DAG", due: true }],
  kpis: [
    { label: "ØKTER I DAG", value: "4", delta: { text: "1 ferdig · 1 pågår · 2 igjen", tone: "flat" }, icon: "calendar-clock" },
    { label: "MRR", value: "4,2", unit: "k", icon: "banknote" },
  ],
  activePlayersCount: 12,
  stallSgKpi: "—",
  planAdherenceKpi: "—",
  dagensVerdiKr: 2400,
} as unknown as CockpitData;

const tillegg = { utenforPlan: [], utenforPlanUker: "UKE 38–39", turneringer: [] };

test("kalenderen sorteres og får ferdig · pågår · neste · planlagt", () => {
  const rader = kalenderRader(brief.timeline, brief.now);
  assert.deepEqual(rader.map((r) => [r.id, r.status, r.start, r.slutt]), [
    ["a", "ferdig", "08:00", "09:00"],
    ["c", "pagar", "10:00", "11:00"],
    ["b", "neste", "11:00", "12:00"],
    ["d", "planlagt", "14:00", "15:00"],
  ]);
  assert.equal(rader[0].sted, "Studio 1");
});

test("stripen går fra 05 til 22 og klemmes", () => {
  assert.equal(kalPst(5 * 60), 0);
  assert.equal(kalPst(22 * 60), 100);
  assert.equal(kalPst(3 * 60), 0);
  assert.equal(kalPst(23 * 60), 100);
  assert.equal(hhmm(7 * 60 + 5), "07:05");
});

test("økonomi vises bare for head coach", () => {
  const felles = { brief, ko: { totalt: 3, rows: [] }, tillegg, fokus: null, kicker: "K", klokke: "10:30" };
  assert.equal(byggAG01Data({ ...felles, erHeadCoach: false }).okonomi, null);
  const hc = byggAG01Data({ ...felles, erHeadCoach: true }).okonomi;
  assert.deepEqual(hc?.map((k) => k.verdi), ["4,2k", `${(2400).toLocaleString("nb-NO")} kr`]);
});

test("mangler tallet, blir det «—»", () => {
  const uten = { ...brief, kpis: [], dagensVerdiKr: null } as unknown as CockpitData;
  const d = byggAG01Data({ brief: uten, ko: { rows: [] }, tillegg, fokus: null, erHeadCoach: true, kicker: "K", klokke: "10:30" });
  assert.equal(d.nokkeltall.find((k) => k.label === "Økter i dag")?.verdi, "—");
  assert.deepEqual(d.okonomi?.map((k) => k.verdi), ["—", "—"]);
  assert.equal(d.venter.totalt, 0);
});
