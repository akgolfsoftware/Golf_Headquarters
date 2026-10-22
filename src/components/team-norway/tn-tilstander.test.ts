import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

// Tom, laster og feil (utkast 2, «Tilstander»; planen tn-designloft 22.10, steg 3).

const app = new URL("../../app/team-norway/", import.meta.url);
const skjermer = new URL("./skjermer/", import.meta.url);

function menyAdresser(): string[] {
  const kilde = readFileSync(new URL("./tn-shell.tsx", import.meta.url), "utf8");
  const meny = kilde.slice(kilde.indexOf("export function tnHovedmeny"), kilde.indexOf("export function tnBunnmeny"));
  return [...meny.matchAll(/(?:"|`)(\/team-norway[^"`]*)(?:"|`)/g)].map((m) => m[1]!.replace("${groupId}", "[groupId]"));
}

test("hvert menypunkt i de seks hovedpunktene har egen laster i skjermens form", () => {
  const adresser = menyAdresser();
  assert.ok(adresser.length >= 25, `fant bare ${adresser.length} menyadresser`);
  // Faner under et menypunkt (f.eks. Referanse › Søk) arver lasteren til mappa over, men aldri Hjem-lasteren på roten.
  const harLaster = (deler: string[]): boolean => {
    if (deler.length === 0) return false;
    const fil = new URL(`./${deler.join("/")}/loading.tsx`, app);
    return existsSync(fil) ? readFileSync(fil, "utf8").includes("TnLasterSkjerm") : harLaster(deler.slice(0, -1));
  };
  const uten = adresser.filter((a) => a !== "/team-norway" && !harLaster(a.slice("/team-norway/".length).split("/")));
  assert.deepEqual(uten, []);
});

test("Hjem har lasteren på roten", () => {
  assert.ok(readFileSync(new URL("./loading.tsx", app), "utf8").includes('form="hjem"'));
});

test("IUP-en har egen laster", () => {
  assert.ok(readFileSync(new URL("./spiller/[spillerId]/loading.tsx", app), "utf8").includes('form="iup"'));
});

// Skjermer som viser data fra basen, sier hva som mangler når det ikke finnes noe.
// Unntak med grunn: låsen er selv tilstanden, og testøkta eies av TrackMan-økta.
const UNNTAK: Record<string, string> = {
  "tn-iup-laast-visning.tsx": "låsen uten deling er selv tilstanden",
  "tn-testokt-visning.tsx": "testøkta bygges i TrackMan-økta",
};

test("ingen Team Norway-skjerm mangler tom-tilstand", () => {
  const filer = readdirSync(skjermer).filter((f) => f.endsWith("-visning.tsx") || f === "tn-oversikt-skjerm.tsx" || f === "tn-testoversikt.tsx");
  const uten = filer.filter((f) => !(f in UNNTAK) && !/TnTomtilstand|TnMangler|empty=|k\.tom/.test(readFileSync(new URL(f, skjermer), "utf8")));
  assert.deepEqual(uten, []);
});

test("én tom-tilstand: skallet gjenbruker komponenten i tn-tilstand", () => {
  const kilde = readFileSync(new URL("./tn-shell.tsx", import.meta.url), "utf8");
  assert.ok(kilde.includes('export { TnTomtilstand } from "./tn-tilstand"'));
  assert.ok(!kilde.includes("export function TnTomtilstand"));
});
