/**
 * KONTRAKTTEST: per-trener-capabilities (G6) mot kildekoden.
 *
 * G6 innførte 9 nye capabilities og en override-tabell slik at ADMIN kan gi
 * eller ta bort rettigheter per trener. Hele poenget faller sammen hvis en
 * flate glemmer å spørre: rollen alene slipper deg da inn, og overriden blir
 * pynt. `scripts/check-action-auth.mjs` fanger at en server action har NOEN
 * auth-import — den sier ingenting om at nettopp DENNE flaten spør om
 * nettopp DEN capabilityen. Det hullet er det denne fila dekker.
 *
 * Testen er et kildeskann, ikke en e2e: den skal fange at en ny side under
 * /admin/grupper legges til uten gate, og det er en tekstlig egenskap ved
 * repoet — ikke noe man ser i en nettleser før feil person står inne på
 * flaten.
 *
 * To guard-varianter, med vilje forskjellige (src/lib/auth/):
 *   requireCapability(cap)        — sider. Redirecter bort.
 *   assertCapability(user, cap)   — server actions. Kaster "forbidden".
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { Capability } from "@/lib/auth/cbac";

const ROT = process.cwd();
const SRC = join(ROT, "src");

/**
 * Admin-flatene G6 gjorde capability-styrte. Ligger en side under ett av
 * disse prefiksene, SKAL den spørre om en capability — rolle alene holder ikke.
 */
const GATEDE_PREFIKSER: readonly string[] = [
  "src/app/admin/grupper",
  "src/app/admin/tester",
  "src/app/admin/agents",
  "src/app/admin/agenticos",
] as const;

/**
 * Rene redirect-stubber: ingen data, ingen UI, sender bare videre til en flate
 * som ER gated. Å kreve en capability her ville bare gitt en dårligere
 * redirect (bruker uten tilgang havner på /admin i stedet for på målsiden,
 * som selv avviser). Holdes utenfor bevisst, ikke ved en forglemmelse.
 */
const REDIRECT_STUBBER: readonly string[] = [
  "src/app/admin/agents/page.tsx", // → /admin/agenticos (USE_AGENTS-gated)
  // MASTERPLAN 15.1: kø-adressene ble til faner på /admin/ko, som gater hver
  // fane på sin opprinnelige capability (synligeFaner + canUser). Låst av
  // src/lib/admin/ko/faner.test.ts, inkludert at siden faktisk bruker gaten.
  "src/app/admin/agenticos/ko/page.tsx", // → /admin/ko?fane=agentko (USE_AGENTS)
  "src/app/admin/agenticos/godkjenn/page.tsx", // → /admin/ko?fane=agentgodkjenn (USE_AGENTS)
  "src/app/admin/tester/foreslatte/page.tsx", // → /admin/ko?fane=tester (MANAGE_TESTS)
  // MASTERPLAN 15.5: fire agenticos-adresser ble til faner på /admin/jarvis,
  // som gater alle fire likt (USE_AGENTS — samme gate som de fire kildesidene
  // hadde). Låst av src/lib/admin/jarvis/faner.test.ts, inkludert at siden
  // faktisk bruker gaten.
  "src/app/admin/agenticos/page.tsx", // → /admin/jarvis (USE_AGENTS)
  "src/app/admin/agenticos/projects/page.tsx", // → /admin/jarvis?fane=prosjekter (USE_AGENTS)
  "src/app/admin/agenticos/runtimes/page.tsx", // → /admin/jarvis?fane=runtimes (USE_AGENTS)
  "src/app/admin/agenticos/skills/page.tsx", // → /admin/jarvis?fane=skills (USE_AGENTS)
] as const;

function filerUnder(dir: string, pred: (f: string) => boolean, ut: string[] = []): string[] {
  let innhold: string[];
  try {
    innhold = readdirSync(dir);
  } catch {
    return ut;
  }
  for (const e of innhold) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) filerUnder(f, pred, ut);
    else if (pred(f)) ut.push(f);
  }
  return ut;
}

const utenKommentarer = (k: string) =>
  k.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const les = (f: string) => utenKommentarer(readFileSync(f, "utf8"));
const rel = (f: string) => relative(ROT, f);

test("hver side under en capability-gated admin-flate kaller requireCapability", () => {
  const mangler = GATEDE_PREFIKSER.flatMap((p) =>
    filerUnder(join(ROT, p), (f) => f.endsWith("page.tsx"))
      .filter((f) => !REDIRECT_STUBBER.includes(rel(f)))
      .filter((f) => !/requireCapability\s*\(/.test(les(f)))
      .map(rel),
  );
  assert.deepEqual(
    mangler,
    [],
    `Sider under capability-gatede admin-flater uten requireCapability:\n  ` +
      `${mangler.join("\n  ")}\n\n` +
      `Legg til requireCapability(Capability.X) øverst i sidens komponent. ` +
      `Er siden en ren redirect-stubb, før den inn i REDIRECT_STUBBER her.`,
  );
});

test("hver server action under samme flater kaller assertCapability", () => {
  const mangler = GATEDE_PREFIKSER.flatMap((p) =>
    filerUnder(join(ROT, p), (f) => /(^|\/)([a-z-]*actions)\.ts$/.test(f))
      .filter((f) => !/assertCapability\s*\(/.test(les(f)))
      .map(rel),
  );
  assert.deepEqual(
    mangler,
    [],
    `Server actions under capability-gatede flater uten assertCapability:\n  ` +
      `${mangler.join("\n  ")}\n\n` +
      `Layout-guarden kjører ALDRI for en server action — en action uten ` +
      `egen sjekk er åpen for enhver innlogget coach, uansett override.`,
  );
});

/**
 * Capabilities som er DEFINERT men ikke håndhevet noe sted. De vises i
 * ADMIN-UI-et som avkryssingsbokser, så en coach kan få dem tatt bort uten at
 * det har noen effekt — verdt å vite om, men ikke nødvendigvis feil (flere er
 * dekket av rolle-guards i dag).
 *
 * Lista er fryst: legger noen til en NY capability uten å koble den til en
 * gate, blir testen rød og tvinger fram et bevisst valg.
 */
const IKKE_HANDHEVET: readonly string[] = [
  // Coach/admin-rettigheter G6 definerte, men som ennå ikke har en gate.
  // Disse er de reelle hullene i lista — flatene de gjelder styres i dag av
  // rolle-guards, så en REVOKE på en enkelt trener har ingen effekt.
  "EDIT_PLAYER_PLAN",
  "MANAGE_BOOKINGS",
  "MANAGE_USERS",
  "VIEW_ALL_PLAYERS",
  "VIEW_PLAYER_DATA",
  // Basis-rettigheter enhver innlogget bruker har. PlayerHQ gater på
  // requirePortalUser + rolle, ikke på capability, så disse er per design
  // uten kallsted. Forventet — ikke et hull.
  "CREATE_BOOKING",
  "EDIT_OWN_PROFILE",
  "VIEW_CHILDREN",
  "VIEW_OWN_BOOKINGS",
  "VIEW_OWN_PROFILE",
] as const;

test("alle capabilities er enten håndhevet et sted, eller kjent uhåndhevet", () => {
  const kode = filerUnder(
    SRC,
    (f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.endsWith(".test.ts"),
  )
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");

  // Tre håndhevingsmønstre finnes i koden, og alle tre teller:
  //   requireCapability(Capability.X) / assertCapability(user, Capability.X)
  //   can(role, Capability.X) / canUser(user, Capability.X)
  //   caps.has(Capability.X)  ← /innsyn-layouten (T8) bruker denne
  const handhevet = new Set(
    [
      ...kode.matchAll(
        /(?:requireCapability|assertCapability|canUser|can)\s*\([^)]*Capability\.([A-Z_]+)/g,
      ),
      ...kode.matchAll(/\.has\(\s*Capability\.([A-Z_]+)/g),
    ].map((m) => m[1]),
  );

  const alle = Object.keys(Capability).sort();
  const uten = alle.filter((c) => !handhevet.has(c));

  const nyeUten = uten.filter((c) => !IKKE_HANDHEVET.includes(c));
  assert.deepEqual(
    nyeUten,
    [],
    `Capabilities som ikke håndheves noe sted:\n  ${nyeUten.join("\n  ")}\n\n` +
      `En capability uten kallsted er en avkryssingsboks uten effekt. Koble ` +
      `den til en gate, eller før den inn i IKKE_HANDHEVET med begrunnelse.`,
  );

  const naaHandhevet = IKKE_HANDHEVET.filter((c) => handhevet.has(c));
  assert.deepEqual(
    naaHandhevet,
    [],
    `Disse håndheves nå og skal ut av IKKE_HANDHEVET:\n  ${naaHandhevet.join("\n  ")}`,
  );
});

test("alle capabilities i IKKE_HANDHEVET finnes faktisk i Capability", () => {
  const ukjente = IKKE_HANDHEVET.filter((c) => !(c in Capability));
  assert.deepEqual(
    ukjente,
    [],
    `IKKE_HANDHEVET nevner capabilities som ikke finnes: ${ukjente.join(", ")}. ` +
      `Sannsynligvis omdøpt — da er unntaket dødt og skjuler et ekte hull.`,
  );
});
