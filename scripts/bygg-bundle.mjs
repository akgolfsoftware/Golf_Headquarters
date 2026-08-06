// Bygger Claude Paper-komponentene til en bundel lokalt — det Claude Designs
// kompilator (check_design_system) ellers gjør, og som ikke kan utløses herfra.
//
// Bruk:  node scripts/bygg-bundle.mjs
// Ut:    designsystem/bundle/_ds_bundle.local.js
//
// Kilden er speilet i designsystem/paper (se scripts/speil-designsystem.mjs).
// Hvilke navn bundelen skal eksponere leses av _ds_manifest.json, ikke av en
// håndholdt liste — nye komponenter i Claude Design kommer automatisk med.
//
// MERK om mekanikk: en tidligere variant strippet import-linjene og kjørte hver
// kilde isolert. Det er nødvendig hvis man limer ÉN komponent oppå serverens
// ferdige bundel, men feil her: 24 av kildene importerer fra søsken (viz.jsx,
// overlay-focus.jsx, Button.jsx …), og hver kildefil har et toppnivå `css` som
// kolliderer i felles skop. esbuild løser modulgrafen og gir hver modul sitt
// eget skop, så begge problemene forsvinner i stedet for å håndteres.
import { build } from "esbuild";
import { readFileSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const PAPER = resolve("designsystem/paper");
const UT = resolve("designsystem/bundle/_ds_bundle.local.js");

const manifest = JSON.parse(readFileSync(resolve(PAPER, "_ds_manifest.json"), "utf8"));

// Grupper eksportnavn per kildefil. Flere navn kan komme fra samme fil (viz.jsx).
const perKilde = new Map();
for (const { name, sourcePath } of manifest.components) {
  if (!perKilde.has(sourcePath)) perKilde.set(sourcePath, []);
  perKilde.get(sourcePath).push(name);
}

// Entry-modulen genereres i minnet, ikke på disk — den er avledet, ikke kildekode.
const linjer = [];
let i = 0;
for (const [sti, navn] of perKilde) {
  const alias = navn.map((n) => `${n} as __m${i}_${n}`).join(", ");
  linjer.push(`import { ${alias} } from ${JSON.stringify("./" + sti)};`);
  i++;
}
linjer.push(`const NS = {};`);
i = 0;
for (const [, navn] of perKilde) {
  for (const n of navn) linjer.push(`NS[${JSON.stringify(n)}] = __m${i}_${n};`);
  i++;
}
linjer.push(`globalThis[${JSON.stringify(manifest.namespace)}] = NS;`);
const entry = linjer.join("\n");

// React kommer fra <script src=react.umd> i kortet, ikke fra node_modules.
const reactFraGlobal = {
  name: "react-fra-global",
  setup(b) {
    b.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "global-react" }));
    b.onLoad({ filter: /.*/, namespace: "global-react" }, () => ({
      contents: `const R = globalThis.React;
if (!R) throw new Error("React mangler pa global — kortet ma laste react.umd for bundelen");
export default R;
export const {
  createElement, Fragment, useState, useEffect, useRef, useId, useCallback,
  useMemo, useLayoutEffect, useReducer, useContext, createContext, forwardRef,
  memo, useImperativeHandle, useSyncExternalStore, useTransition, useDeferredValue,
  Children, cloneElement, isValidElement, StrictMode,
} = R;`,
      loader: "js",
    }));
  },
};

mkdirSync(resolve("designsystem/bundle"), { recursive: true });

const res = await build({
  stdin: { contents: entry, resolveDir: PAPER, sourcefile: "ds-entry.js", loader: "js" },
  bundle: true,
  format: "iife",
  jsx: "transform",
  target: "es2020",
  outfile: UT,
  plugins: [reactFraGlobal],
  logLevel: "error",
  metafile: true,
});

const moduler = Object.keys(res.metafile.inputs).filter((k) => k.endsWith(".jsx")).length;
const bytes = statSync(UT).size;
const serverBundle = resolve(PAPER, "_ds_bundle.js");
let sammenlign = "";
try { sammenlign = `  (serverens kompilat: ${statSync(serverBundle).size} B)`; } catch {}

// Røyktest: alle navn manifestet lover skal finnes i utdata.
const kode = readFileSync(UT, "utf8");
const mangler = manifest.components
  .map((c) => c.name)
  .filter((n) => !kode.includes(JSON.stringify(n)));

console.log(`bygget ${manifest.components.length} navn fra ${moduler} moduler → ${bytes} B${sammenlign}`);
console.log(`  namespace: ${manifest.namespace}`);
if (mangler.length) {
  console.log(`  MANGLER i utdata: ${mangler.join(", ")}`);
  process.exit(1);
}
writeFileSync(resolve("designsystem/bundle/.gitkeep"), "");
