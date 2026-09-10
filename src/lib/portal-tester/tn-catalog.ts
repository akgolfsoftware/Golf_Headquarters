/** Versioned Excel-v3 scorecards. Sources are cell ranges, never legacy seed defaults. */
import { TEST_PROTOKOLLER, hentProtokoll } from "@/lib/domain/pei/protokoll-definisjoner";

export const TN_VERSION = "tn-excel-v3-2026-09-10";
export type TnField = { key: string; label: string; unit?: string; choices?: string[]; min?: number; integer?: boolean; optional?: boolean };
export type TnRow = { label: string; target?: number; fields: TnField[] };
export type TnKind = "near" | "carry" | "putts" | "course" | "free-course" | "length-putt" | "points" | "gate" | "speed" | "technique";
export type TnProtocol = {
  id: string; name: string; source: string; kind: TnKind; rows: TnRow[];
  blocked?: string; variableCount?: boolean; points8Ball?: boolean;
};
const number = (key: string, label: string, unit?: string, min?: number): TnField => ({ key, label, unit, min });
const choice = (key: string, label: string, choices: string[]): TnField => ({ key, label, choices });
const result = number("result", "Til hull", "m", 0);
const target = number("target", "Målavstand", "m", Number.MIN_VALUE);
const carry = number("carry", "Carry", "m", 0);
const side = number("side", "Sideavvik (venstre − / høyre +)", "m");
const hole = { ...number("hole", "Hullnummer", undefined, 1), integer: true };
const lie = choice("lie", "Ballens plassering etter slaget", ["Green", "Fairway", "Rough", "Bunker"]);
const speedFields: TnField[] = [
  { ...number("speed", "Hastighet", undefined, 0), optional: true },
  { ...choice("speedUnit", "Hastighetsenhet", ["mph", "km/t", "m/s"]), optional: true },
  { ...choice("speedType", "Hastighet målt på", ["Ball", "Køllehode"]), optional: true },
];
const rows = (targets: (number | null)[], fields: TnField[], label = "Forsøk"): TnRow[] => targets.map((t, i) => ({
  label: `${label} ${i + 1}${t === null ? "" : ` · ${String(t).replace(".", ",")} m`}`,
  ...(t === null ? {} : { target: t }), fields: t === null ? [target, ...fields] : fields,
}));
const from = (id: string) => hentProtokoll(id)!;
const aims = (id: string) => from(id).rows.map(r => r.maal ?? null);
const protocols: TnProtocol[] = [];
function add(id: string, name: string, source: string, kind: TnKind, rs: TnRow[], extra: Partial<TnProtocol> = {}) {
  protocols.push({ id, name, source, kind, rows: rs, ...extra });
}
for (const id of ["8-ball-variation", "8-ball-blocked"]) {
  const p = from(id);
  add(id, p.name, `Scorekort GolfslagTester!${id.endsWith("variation") ? "A4:I35" : "K4:S35"}`, "near",
    p.rows.map(r => ({ label: r.slag!, target: r.lengde, fields: [result] })), { points8Ball: true });
}
for (const [id, name, source] of [
  ["golfslag-bane", "Golfslag bane", "U4:AG78"], ["18-hull", "18 hull", "BO4:CA53"],
]) {
  const p = from(id);
  for (const [variant, rs] of Object.entries(p.rowsByGender!)) {
    add(`${id}-${variant}`, `${name} · ${variant}`, `Scorekort GolfslagTester!${source}`, "course",
      rs.map((r, i) => ({ label: `Slag ${i + 1}${r.lie === "b" ? " · fra bunker" : ""}`, target: r.lengde, fields: [hole, result, lie] })));
  }
}
add("golfslag-bane-egen", "Golfslag bane · egne lengder", "Scorekort GolfslagTester!U86:AG121", "free-course",
  rows(Array(30).fill(null), [hole, choice("startLie", "Ballens plassering før slaget", ["Fairway", "Rough", "Tee", "Bunker"]), result, lie]));
for (const [id, name, n, dist, source] of [
  ["driver-270", "Driver basic · 270 m", 5, 270, "AI4:AR10"],
  ["driver-220", "Driver basic · 220 m", 5, 220, "AI15:AR21"],
  ["inspill-gutter-145", "Innspill Basis · gutter 145 m", 5, 145, "AT4:BC10"],
  ["inspill-gutter-160", "Innspill Basis · gutter 160 m", 5, 160, "AT15:BC21"],
  ["inspill-jenter-125", "Innspill Basis · jenter 125 m", 5, 125, "AT26:BC32"],
  ["inspill-jenter-145", "Innspill Basis · jenter 145 m", 5, 145, "AT37:BC43"],
] as const) add(id, name, `Scorekort GolfslagTester!${source}`, "carry", rows(Array(n).fill(dist), [carry, side, ...speedFields]));
add("wedge-variation", "Wedge Variation", "Scorekort GolfslagTester!BE4:BM14", "carry", rows(aims("wedge-variation"), [carry, side]));
add("putt-1-3m", "Putt 1–3 m", "Scorekort GolfslagTester!CC4:CI36", "putts",
  rows(aims("putt-1-3m"), [{ ...number("strokes", "Antall slag til hull", "slag", 1), integer: true }]));
add("9-hull-lengde", "9 hull lengde", "Scorekort GolfslagTester!CL4:CR15; Referens!E11:G15", "length-putt",
  rows(aims("9-hull-lengde"), [number("feet", "Restavstand", "fot", 0), choice("holed", "Ball i hull", ["Ja", "Nei"])]),
  { blocked: "Måleenhet for målavstand og poeng ved senket putt versus svært liten restavstand må bekreftes." });
for (const [id, name, source] of [
  ["naerspill-gate", "Nærspill Gate", "A4:F16"], ["visa-express", "VISA Express", "H4:L16"], ["wedge-gate", "Wedge Gate", "A26:F38"],
]) {
  const p = from(id);
  add(id, name, `Scorekort TeknikTester!${source}`, "points", p.rows.map(r => ({
    label: [r.launch, r.carrySone, r.speedsone].filter(Boolean).join(" · "), fields: [number("points", "Poeng", "poeng", 0)],
  })), { blocked: "Poengskala og treffkriterier må bekreftes før testen kan fullføres. Registreringer kan lagres som utkast." });
}
for (const [id, name, n, distance, source] of [
  ["driver-gate", "Driver Gate", 6, "2 m", "H26:L35"], ["putt-gate", "Putt Gate", 10, "40 cm", "N26:S40"],
] as const) add(id, name, `Scorekort TeknikTester!${source}`, "gate", Array.from({ length: n }, (_, i) => ({
  label: `Forsøk ${i + 1} · gateavstand ${distance}`, fields: [choice("ok", "Gjennom gate", ["Ja", "Nei"]), ...(id === "putt-gate" ? [{ ...choice("miss", "Bomretning", ["Venstre", "Høyre"]), optional: true }] : [])],
})), { blocked: "Gategeometri og OK-regel må bekreftes. Regnearkets ufullstendige opptelling brukes ikke som resultat." });
for (const id of ["putt-speed-1x5", "putt-speed-3x3"]) add(id, from(id).name, `Scorekort TeknikTester!${id.endsWith("1x5") ? "N4:S12" : "U4:Z16"}`, "speed",
  rows(aims(id), [number("distance", "Distanse"), choice("distanceUnit", "Enhet", ["m", "cm", "fot"]), choice("longShort", "Lang/kort", ["Lang", "Kort", "På mål"])]),
  { blocked: "Det må avklares om Distanse er restavstand eller rullelengde, og hvilken enhet protokollen krever." });
add("pei-test-bane", "PEI Test Bane", "PEI Test Bane!A3:F22; Forklaring!B4", "free-course",
  rows(Array(18).fill(null), [hole, choice("startLie", "Ballens plassering før slaget", ["Fairway", "Rough", "Tee", "Bunker"]), result]), { variableCount: true });
for (const [id, name, ts, source] of [
  ["pei-slagtest-egen", "Slagtest · egne lengder", Array(18).fill(null), "A9:G29"],
  ["pei-wedgetest-egen", "Wedgetest · egne lengder", Array(18).fill(null), "I9:O29"],
  ["pei-st-leon", "ST Leon ROT", aims("pei-st-leon"), "Q9:W29"],
  ["pei-st-cloud", "ST Cloud GC", aims("pei-st-cloud"), "Y9:AE29"],
  ["pei-pga27", "PGA Tour · 27 slag", aims("pei-pga27"), "AG10:AG36"],
  ["pei-inspill-120", "Innspill 120 m", Array(5).fill(120), "A45:A50"],
  ["pei-inspill-160", "Innspill 160 m", Array(5).fill(160), "A51:A56"],
  ["pei-inspill-variation", "Innspill Variation", aims("pei-inspill-variation"), "A57:A67"],
  ["pei-wedge-blocked", "Wedge 3 Blocked", aims("pei-wedge-blocked"), "I35:I44"],
  ["pei-wedge-variation", "Wedge 3 Variation", [30,70,50,70,50,70,30,30,50], "I45:I54"],
] as [string, string, (number | null)[], string][]) add(id, name, `PEI Tester!${source}`, "carry", rows(ts, [carry, side]));
add("standard-sving", "Standard sving · 7-jern", "PEI Tester!A34:A44", "carry", rows(Array(10).fill(null), [carry, side], "Mål = egen medianlengde med 7-jern"));
for (const [id, range] of [["a", "B1:N20"], ["b", "R1:AD20"], ["c", "AG1:AS20"]]) {
  add(`teknikktest-${id}`, `Teknikktest · panel ${id.toUpperCase()}`, `Teknikktest!${range}`, "technique", [
    ...rows(Array(5).fill(null), [carry, side], "Oppsett A"),
    ...rows(Array(10).fill(null), [carry, side, number("clubPath", "Club Path", "°"), number("faceAngle", "Face Angle", "°"), number("attackAngle", "Attack Angle", "°"), number("dynamicLoft", "Dynamic Loft", "°"), number("impactLocation", "Impact Location"), ...speedFields], "Måling B"),
  ], { blocked: "Målsetting fra del A, målemetode og enhet for Impact Location må bekreftes. Råmålinger kan lagres som utkast." });
}
export const TN_CATALOG: readonly TnProtocol[] = protocols;
export function tnProtocol(id: string, count?: number): TnProtocol | null {
  const p = TN_CATALOG.find(p => p.id === id);
  if (!p) return null;
  if (count === undefined) return p;
  if (!p.variableCount || !Number.isInteger(count) || count < 1 || count > 200) return null;
  return { ...p, rows: Array.from({ length: count }, (_, i) => ({ ...p.rows[0], label: `Forsøk ${i + 1}` })) };
}
/** Match only official definitions at call sites; never replace a user's custom test by name. */
export function isTnTestName(name: string): boolean {
  const n = name.toLowerCase().replace(/[–—]/g, "-").replace(/\s/g, "");
  const names = [...TEST_PROTOKOLLER.map(p => p.name), ...TN_CATALOG.map(p => p.name), "TN Nærspill Gate", "TN Wedge Gate", "TN Driver Gate", "TN Putt Gate", "TN VISA Express", "Putt Speed Control", "Putt Speed 1x5", "Putt Speed 3x3", "Inspill 120m", "Inspill 160m", "Teknikktest Spredning"];
  return names.some(s => s.toLowerCase().replace(/[–—]/g, "-").replace(/\s/g, "") === n);
}
