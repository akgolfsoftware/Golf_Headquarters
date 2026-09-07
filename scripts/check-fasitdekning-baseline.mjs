#!/usr/bin/env node
/**
 * Vakt: fasitdekningen går aldri under den committede baselinen.
 *
 * `scripts/maal-fasit-dekning.mjs` teller hvor mange av tegningene i
 * designsystem/train-lock/ som er sitert fra src/. Tallet er IKKE bevis på at en
 * skjerm er portert (designport-planen 05.09 §3: «sitert er ikke bygget»), men det
 * skal aldri synke uten at noen har ment det: vakten måler tallet i arbeidstreet
 * (HEAD) og sammenligner mot den committede baselinen i
 * tests/visual/fasitdekning-baseline.json.
 *
 * Vil noen senke baselinen bevisst (fjerne en feilaktig sitering), endrer de
 * baseline-fila i SAMME PR med ny "grunn" — synlig i diffen, ingen unntaksflagg.
 * Ingen git-oppslag (ingen sammenligning mot origin/main eller andre grener).
 *
 * Kjør fra repo-roten: node scripts/check-fasitdekning-baseline.mjs
 * Exit 0 = OK (HEAD >= baseline) · 1 = HEAD under baseline · 2 = baseline-fil mangler/ugyldig.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const BASELINE_STI = "tests/visual/fasitdekning-baseline.json";

/**
 * Ren sammenligning — testes i src/lib/__tests__/scripts/check-fasitdekning-baseline.test.ts.
 * @param {{ sitert: number, totalt: number }} head
 * @param {{ sitert: number, av: number }} baseline
 * @returns {{ ok: boolean, melding: string }}
 */
export function vurderDekning(head, baseline) {
  const tall = `HEAD ${head.sitert}/${head.totalt} · baseline ${baseline.sitert}/${baseline.av}`;
  if (head.sitert < baseline.sitert) {
    return {
      ok: false,
      melding:
        `fasitdekningen har gått UNDER baselinen (${tall}). En sitering er fjernet uten at en annen ` +
        `tegning er sitert i stedet. Er det med vilje (f.eks. en feilaktig sitering fjernet), senk ` +
        `baselinen i ${BASELINE_STI} i SAMME PR med ny "grunn".`,
    };
  }
  if (head.sitert > baseline.sitert) {
    return { ok: true, melding: `OK — fasitdekning ${tall} (baseline kan heves til ${head.sitert}).` };
  }
  return { ok: true, melding: `OK — fasitdekning ${tall}.` };
}

/**
 * Parser og validerer baseline-JSON-innholdet. Ren funksjon — kaster aldri,
 * returnerer et resultat som kan testes uten prosess-exit.
 * @param {string} raw
 * @returns {{ ok: true, baseline: {sitert:number, av:number} } | { ok: false, feil: string }}
 */
export function parseBaseline(raw) {
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    return { ok: false, feil: `${BASELINE_STI} er ikke gyldig JSON (${err.message}).` };
  }
  if (typeof json.sitert !== "number" || typeof json.av !== "number") {
    return { ok: false, feil: `${BASELINE_STI} mangler tallfeltene "sitert"/"av".` };
  }
  return { ok: true, baseline: json };
}

/** Parser stdout fra maal-fasit-dekning.mjs. Ren funksjon — kaster aldri. */
export function parseMaalOutput(stdout) {
  try {
    return { ok: true, data: JSON.parse(stdout) };
  } catch (err) {
    return { ok: false, feil: `maal-fasit-dekning.mjs ga ugyldig JSON på stdout (${err.message}):\n${stdout.slice(0, 500)}` };
  }
}

/** Kjører maal-fasit-dekning.mjs fra repo-roten `rot` og leser JSON-en. */
function maal(rot) {
  const r = spawnSync(process.execPath, [join(rot, "scripts/maal-fasit-dekning.mjs")], {
    cwd: rot,
    encoding: "utf8",
  });
  if (r.status !== 0) throw new Error(`maal-fasit-dekning.mjs feilet:\n${r.stderr ?? r.error?.message ?? ""}`);
  const parset = parseMaalOutput(r.stdout);
  if (!parset.ok) throw new Error(parset.feil);
  return parset.data;
}

function lesBaseline(rot) {
  let raw;
  try {
    raw = readFileSync(join(rot, BASELINE_STI), "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`check-fasitdekning-baseline: fant ikke ${BASELINE_STI}. Opprett den (se oppgave 1.3).`);
      process.exit(2);
    }
    throw err;
  }
  const parset = parseBaseline(raw);
  if (!parset.ok) {
    console.error(`check-fasitdekning-baseline: ${parset.feil}`);
    process.exit(2);
  }
  return parset.baseline;
}

function main() {
  try {
    const rot = process.cwd();
    const baseline = lesBaseline(rot);
    const head = maal(rot);
    const res = vurderDekning(head, baseline);
    if (res.ok) console.log(`check-fasitdekning-baseline: ${res.melding}`);
    else console.error(`check-fasitdekning-baseline: ${res.melding}`);
    process.exit(res.ok ? 0 : 1);
  } catch (err) {
    console.error(`check-fasitdekning-baseline: uventet feil: ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
