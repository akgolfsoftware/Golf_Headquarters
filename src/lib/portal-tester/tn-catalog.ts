/** Versioned Excel-v3 scorecards. Sources are cell ranges, never legacy seed defaults. */
import { TEST_PROTOKOLLER, hentProtokoll } from "@/lib/domain/pei/protokoll-definisjoner";

export const TN_VERSION = "tn-excel-v3-2026-09-10";
export const TN_RULES_VERSION = "tn-excel-v3-2026-10-02";
/** Anders 14.10.2026: 8-ball med carry og side og 5 poeng i hull; gate-testene førtes som Godkjent eller Bom til 20.10. */
export const TN_GODKJENT_VERSION = "tn-excel-v3-2026-10-14";
/**
 * Anders 20.10.2026 (beslutninger.md §TESTBATTERIET): Nærspill Gate, Wedge Gate og VISA Express gir
 * 1 poeng gjennom porten og 4 poeng gjennom porten og i sonen, maks 36. Driver Gate og Putt Gate
 * telles som OK («X / 6 OK», «X / 10 OK»).
 */
export const TN_POENG_VERSION = "tn-excel-v3-2026-10-20";
/**
 * Anders 20.10.2026 (hovedøkta): Putt Gate føres med ett trykk «OK / Ikke OK», der OK betyr gjennom porten og i
 * fartssonen (TN-PDF-en); fartssone og bomretning er valgfrie. 9 hull lengde er ikke lenger sperret: hvert putt
 * føres i en av fem klasser med poeng (beslutninger.md 28.09). Eldre utgaver leses som før.
 */
export const TN_OK_VERSION = "tn-excel-v3-2026-10-20-ok";
export const TN_VERSIONS = [TN_VERSION, TN_RULES_VERSION, TN_GODKJENT_VERSION, TN_POENG_VERSION, TN_OK_VERSION] as const;
export type TnVersion = typeof TN_VERSIONS[number];
export const tnVersion = (p: TnProtocol): TnVersion => p.version ?? TN_VERSION;
/** `requiredUnless`: feltet kreves bare når det andre feltet står tomt (8-ball: carry og side, eller «I hull»). */
export type TnField = { key: string; label: string; unit?: string; choices?: string[]; min?: number; integer?: boolean; optional?: boolean; requiredUnless?: string };
export type TnRow = { label: string; target?: number; fields: TnField[] };
export type TnKind = "near" | "carry" | "putts" | "course" | "free-course" | "length-putt" | "points" | "gate" | "speed" | "technique";
export type TnProtocol = {
  version?: TnVersion;
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
  // Lagrede resultater med den gamle skalaen merkes med regelversjonen i navnet (Anders 14.10.2026).
  add(id, `${p.name} · skala før 14.10.2026`, `Scorekort GolfslagTester!${id.endsWith("variation") ? "A4:I35" : "K4:S35"}`, "near",
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
  { blocked: "Måleenhet for målavstand må bekreftes. Poenggrensene er avklart." });
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
// Keep the original registry intact: an old draft never silently changes its fields or rules.
const LEGACY_CATALOG: readonly TnProtocol[] = protocols;
/** Regelutgaven fra 02.10.2026, som protokollregisteret samme dag beskriver. Eldre utkast og resultater regnes mot den. */
export const TN_RULES_CATALOG: readonly TnProtocol[] = protocols.map(p => {
  if (p.id === "teknikktest-c") {
    return { ...p, version: TN_RULES_VERSION, rows: p.rows.slice(0, 10),
      blocked: "Målemetode og enhet for Impact Location må bekreftes. Fem grunnmålinger og fem måleforsøk kan lagres som utkast." };
  }
  if (["naerspill-gate", "visa-express"].includes(p.id)) {
    return { ...p, version: TN_RULES_VERSION, blocked: undefined };
  }
  if (p.id === "wedge-gate") {
    return { ...p, version: TN_RULES_VERSION, blocked: undefined, kind: "gate",
      rows: p.rows.map(r => ({ ...r, fields: [choice("ok", "Både utslagsvinkel og carry innenfor sonen", ["Ja", "Nei"])] })) };
  }
  if (p.id === "driver-gate") {
    return { ...p, version: TN_RULES_VERSION, blocked: undefined,
      rows: p.rows.map(r => ({ ...r, label: `${r.label} · bredde 24 cm` })) };
  }
  if (p.id === "putt-gate") {
    return { ...p, version: TN_RULES_VERSION, blocked: undefined,
      rows: p.rows.map(r => ({ ...r, label: `${r.label} · bredde 6 cm`, fields: [
        choice("ok", "Rent gjennom gate", ["Ja", "Nei"]),
        choice("speedZone", "Innenfor lengdesonen på 50 cm", ["Ja", "Nei"]),
        { ...choice("miss", "Bomretning ved gate", ["Venstre", "Høyre"]), optional: true },
      ] })) };
  }
  if (p.kind === "speed") {
    return { ...p, version: TN_RULES_VERSION, blocked: undefined,
      rows: p.rows.map(r => ({ ...r, fields: r.fields.map(f => f.key === "distance"
        ? { ...f, label: "Restavstand til mållinjen", min: 0 } : f) })) };
  }
  return p;
});
const godkjentEllerBom = (key: string, label: string): TnField => choice(key, label, ["Godkjent", "Bom"]);
const GATE_IDS = ["naerspill-gate", "visa-express", "wedge-gate", "driver-gate", "putt-gate"];
/** Katalogen 14.10.2026: 8-ball med carry og side, gate-testene med Godkjent eller Bom. Eldre utkast og resultater regnes mot den. */
export const TN_GODKJENT_CATALOG: readonly TnProtocol[] = TN_RULES_CATALOG.map(p => {
  if (p.points8Ball) {
    return { ...p, version: TN_GODKJENT_VERSION, name: from(p.id).name, rows: p.rows.map(r => ({ ...r, fields: [
      { ...carry, requiredUnless: "holed" }, { ...side, requiredUnless: "holed" },
      { ...choice("holed", "Ballen gikk i hull på ett slag", ["I hull"]), optional: true },
    ] })) };
  }
  if (!GATE_IDS.includes(p.id)) return p;
  // Nærspill Gate og VISA Express var poeng for hånd; nå ett valg per slag.
  const label = p.id === "naerspill-gate" ? "Både utslagsvinkel og carry innenfor sonen"
    : p.id === "visa-express" ? "Godkjent eller bom" : undefined;
  return { ...p, version: TN_GODKJENT_VERSION, blocked: undefined, kind: "gate",
    rows: p.rows.map(r => ({ ...r, fields: label ? [godkjentEllerBom("ok", label)]
      : r.fields.map(f => f.key === "ok" ? godkjentEllerBom("ok", f.label) : f) })) };
});
/** Valgene per slag i gate-testene med poeng, og poengene de gir. */
export const GATE_POENG_VALG = { Bom: 0, "Gjennom porten": 1, "I sonen": 4 } as const;
export const GATE_POENG_IDS = ["naerspill-gate", "visa-express", "wedge-gate"] as const;
const gatePoeng = (label: string): TnField => choice("ok", label, Object.keys(GATE_POENG_VALG));
/** Katalogen 20.10.2026 (første utgave): gate-testene med poeng 0/1/4, Driver Gate og Putt Gate med OK. */
export const TN_POENG_CATALOG: readonly TnProtocol[] = TN_GODKJENT_CATALOG.map(p => {
  if (!GATE_IDS.includes(p.id)) return p;
  if (!(GATE_POENG_IDS as readonly string[]).includes(p.id)) return { ...p, version: TN_POENG_VERSION };
  const label = p.id === "visa-express" ? "Gjennom porten, og i speedsonen" : "Gjennom porten, og carry i sonen";
  return { ...p, version: TN_POENG_VERSION, rows: p.rows.map(r => ({ ...r, fields: [gatePoeng(label)] })) };
});
/** Poeng per klasse i 9 hull lengde (Referens!E11:G15, beslutninger.md 28.09): putten føres i én av fem klasser. */
export const LENGDE_POENG = { "I hull": 6, "Under 1 fot": 3, "1–2 fot": 1, "2–4 fot": 0.5, "Over 4 fot": 0 } as const;
/** Gjeldende katalog (20.10.2026): Putt Gate med ett trykk OK / Ikke OK, 9 hull lengde med fem klasser og poeng. */
export const TN_CATALOG: readonly TnProtocol[] = TN_POENG_CATALOG.map(p => {
  if (p.id === "putt-gate") {
    return { ...p, version: TN_OK_VERSION, rows: p.rows.map(r => ({ ...r, fields: [
      choice("ok", "Gjennom porten og i fartssonen", ["Godkjent", "Bom"]),
      { ...choice("speedZone", "Innenfor lengdesonen på 50 cm", ["Ja", "Nei"]), optional: true },
      { ...choice("miss", "Bomretning ved gate", ["Venstre", "Høyre"]), optional: true },
    ] })) };
  }
  if (p.id === "9-hull-lengde") {
    return { ...p, version: TN_OK_VERSION, blocked: undefined,
      rows: p.rows.map(r => ({ ...r, fields: [choice("klasse", "Hvor endte putten?", Object.keys(LENGDE_POENG))] })) };
  }
  return p;
});
const CATALOGS = [LEGACY_CATALOG, TN_RULES_CATALOG, TN_GODKJENT_CATALOG, TN_POENG_CATALOG, TN_CATALOG];
export function tnProtocol(id: string, count?: number, version?: string): TnProtocol | null {
  if (version !== undefined && !(TN_VERSIONS as readonly string[]).includes(version)) return null;
  const p = version === undefined ? TN_CATALOG.find(p => p.id === id)
    : CATALOGS.map(c => c.find(p => p.id === id && tnVersion(p) === version)).find(Boolean);
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
