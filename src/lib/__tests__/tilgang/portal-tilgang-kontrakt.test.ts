/**
 * KONTRAKTTEST: talent-gaten mot den faktiske kildekoden under `src/app/portal`.
 *
 * Hvorfor kildeskann og ikke e2e: gaten er en RUTEKONTRAKT. Den brytes ikke av
 * en knapp som ser feil ut, men av at noen legger til en ny side og glemmer
 * `kreverTilgang` — eller åpner en side som ikke står på allowlisten. Begge
 * deler er usynlige i en nettleser så lenge `gratisForAlle()`-vinduet står
 * åpent (alle får FULL frem til 1. september 2026), så en e2e-test ville vært
 * grønn uansett. Denne testen leser koden og fanger driften med én gang.
 *
 * Modellen er den samme som Next.js kjører: en side er beskyttet av ALLE
 * `layout.tsx` fra `src/app/portal` og ned, PLUSS sin egen `page.tsx`.
 * Strengeste ledd vinner (FULL > TALENT > INGEN). Et ledd som kaller
 * `requirePortalUser()` uten `kreverTilgang` håndhever FULL (default-verdien
 * i `requirePortalUser.ts`) — det er fail-closed-mekanismen.
 *
 * Allowlisten importeres fra produksjonskoden (`talent-allowlist.ts`) —
 * ALDRI kopier den hit. Jf. docs/testing.md: et lokalt speil av
 * produksjonslogikk driver fra originalen og tester til slutt seg selv.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import {
  erApenForTalent,
  TALENT_APNE_PREFIKSER,
} from "@/lib/auth/talent-allowlist";

const APP = join(process.cwd(), "src", "app");
const PORTAL = join(APP, "portal");
const ROT_LAYOUT = join(PORTAL, "layout.tsx");

type Niva = "INGEN" | "TALENT" | "FULL";
const RANG: Record<Niva, number> = { INGEN: 0, TALENT: 1, FULL: 2 };

/**
 * Fjern kommentarer før matching. Uten dette matcher skannet prosa som
 * «se requirePortalUser (plan T2)» og rapporterer en guard som ikke finnes —
 * det skjedde faktisk under utviklingen av denne testen.
 */
function utenKommentarer(kode: string): string {
  return kode.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Argumentet til første `requirePortalUser(...)`, med balanserte parenteser. */
function hentGuardArgument(kode: string): string | null {
  const treff = /requirePortalUser\s*\(/.exec(kode);
  if (!treff) return null;
  const start = treff.index + treff[0].length;
  let dybde = 1;
  for (let i = start; i < kode.length; i++) {
    if (kode[i] === "(") dybde++;
    else if (kode[i] === ")" && --dybde === 0) return kode.slice(start, i);
  }
  return null;
}

/** Nivået én fil håndhever, eller null hvis den ikke guarder i det hele tatt. */
function nivaIFil(fil: string): Niva | null {
  if (!existsSync(fil)) return null;
  const arg = hentGuardArgument(utenKommentarer(readFileSync(fil, "utf8")));
  if (arg === null) return null;
  const m = /kreverTilgang:\s*"(FULL|TALENT|INGEN)"/.exec(arg);
  return m ? (m[1] as Niva) : "FULL";
}

function finnSider(dir: string, ut: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) finnSider(f, ut);
    else if (e === "page.tsx") ut.push(f);
  }
  return ut;
}

/** Filsti → URL. Rutegrupper `(legacy)`/`(fullscreen)` teller ikke i URL-en. */
function tilRute(fil: string): string {
  const segs = relative(APP, dirname(fil))
    .split(sep)
    .filter((s) => !(s.startsWith("(") && s.endsWith(")")));
  return `/${segs.join("/")}`;
}

type Ledd = { hvem: string; niva: Niva };

/** Alle guard-ledd for en side: layouts fra /portal og ned, så siden selv. */
function guardKjede(fil: string, taMedRotLayout: boolean): Ledd[] {
  const ledd: Ledd[] = [];
  let dir = PORTAL;
  const rest = relative(PORTAL, dirname(fil));
  for (const seg of [null, ...(rest === "" ? [] : rest.split(sep))]) {
    if (seg !== null) dir = join(dir, seg);
    const lay = join(dir, "layout.tsx");
    if (!taMedRotLayout && lay === ROT_LAYOUT) continue;
    const n = nivaIFil(lay);
    if (n) ledd.push({ hvem: relative(process.cwd(), lay), niva: n });
  }
  const np = nivaIFil(fil);
  if (np) ledd.push({ hvem: relative(process.cwd(), fil), niva: np });
  return ledd;
}

const INGEN_GUARD: Ledd = { hvem: "(ingen guard)", niva: "INGEN" };
const strengeste = (ledd: Ledd[]): Ledd =>
  ledd.reduce((a, b) => (RANG[b.niva] > RANG[a.niva] ? b : a), INGEN_GUARD);

const SIDER = finnSider(PORTAL).sort();

test("kartet er ikke tomt — skannet finner faktisk portal-sidene", () => {
  assert.ok(
    SIDER.length > 100,
    `Fant bare ${SIDER.length} page.tsx under src/app/portal. Enten er skannet ` +
      `ødelagt, eller så er portalen flyttet — begge deler gjør resten av ` +
      `denne fila verdiløs, så den skal ikke passere stille.`,
  );
});

/**
 * DEN SIKKERHETSKRITISKE RETNINGEN: en side som IKKE står på allowlisten skal
 * være låst til FULL. Går denne rød, er en flate åpnet for den gratis
 * TALENT-profilen uten å stå i rutekontrakten — altså en lekkasje.
 *
 * Rot-layouten holdes UTENFOR målingen, og det er fortsatt et bevisst valg
 * etter at den ble løsnet 16.08.2026 (se siste test): setter noen den tilbake
 * til FULL, ville en måling som tok den med blitt grønn uansett hva som skjedde
 * lenger nede — en test som ikke kan bli rød. Det ble avdekket ved
 * mutasjonstesting av denne fila: (legacy)-layouten ble satt til TALENT uten at
 * testen merket det. Ved å regne uten rot-layouten måler vi det som faktisk
 * betyr noe: holder hver enkelt side tett på egen hånd?
 *
 * UGUARDEDE-unntakslista er BORTE (16.08.2026). Den inneholdt de 11 rutene som
 * bare levde på rot-layouten; alle har nå fått sin egen guard, og lista ble
 * fjernet i stedet for å stå igjen tom. Enhver ny rute uten guard er dermed
 * rød med én gang — som den skal være.
 */
test("ingen lekkasje: sider utenfor allowlisten er låst til FULL", () => {
  const apne = SIDER.filter((f) => !erApenForTalent(tilRute(f))).flatMap((f) => {
    const e = strengeste(guardKjede(f, false));
    return e.niva === "FULL" ? [] : [{ rute: tilRute(f), niva: e.niva, hvem: e.hvem }];
  });
  assert.deepEqual(
    apne.map((a) => a.rute),
    [],
    `Sider utenfor talent-allowlisten som ikke er FULL-gated:\n` +
      `${apne.map((a) => `  ${a.niva.padEnd(6)} ${a.rute}  (svakeste ledd: ${a.hvem})`).join("\n")}\n\n` +
      `Rot-layouten håndhever kun innlogging — den fanger deg ikke lenger opp. ` +
      `Skal ruten være åpen, legg den i TALENT_APNE_PREFIKSER ` +
      `(src/lib/auth/talent-allowlist.ts) — ellers sett kreverTilgang: "FULL".`,
  );
});

/**
 * MOTSATT RETNING: står ruten på allowlisten, skal den faktisk være nåbar.
 * Rot-layouten holdes utenfor her av samme grunn som over.
 *
 * KJENTE_AVVIK-unntakslista er BORTE (17.08.2026). De fem som sto igjen var
 * ALLE samme feil som rot-layouten hadde, ett hakk lenger ned: et mellomliggende
 * layout-ledd — `(legacy)/layout.tsx` og `(fullscreen)/layout.tsx` — arvet
 * FULL-defaulten og stengte ruter allowlisten hadde åpnet, deriblant selve
 * test-gjennomføringen. Begge er nå løsnet til "INGEN" etter samme rekkefølge
 * som rot-jobben brukte 16.08: først egen guard på hver av de 23 sidene under
 * dem, DERETTER løsne layouten. Lista ble fjernet i stedet for å stå igjen tom,
 * så enhver ny allowlistet rute som stenges er rød med én gang.
 */
test("allowlisten holder det den lover (rot-layout holdt utenfor)", () => {
  const blokkert = SIDER.filter((f) => erApenForTalent(tilRute(f))).flatMap((f) => {
    const e = strengeste(guardKjede(f, false));
    return e.niva === "FULL" ? [{ rute: tilRute(f), hvem: e.hvem }] : [];
  });
  assert.deepEqual(
    blokkert.map((b) => b.rute),
    [],
    `Ruter som står på talent-allowlisten, men som en FULL-guard stenger:\n` +
      `${blokkert.map((b) => `  ${b.rute}  (${b.hvem})`).join("\n")}\n\n` +
      `Legg kreverTilgang: "TALENT" (eller "INGEN") på siden — ellers lyver ` +
      `allowlisten om hva den gratis TALENT-profilen faktisk kommer inn på. ` +
      `Er det et LAYOUT-ledd som stenger, skal ikke layouten få nivået: guard ` +
      `hver side under den først, så løsne layouten til "INGEN".`,
  );
});

test("hvert prefiks i allowlisten peker på en rute som finnes", () => {
  const ruter = new Set(SIDER.map(tilRute));
  const doede = TALENT_APNE_PREFIKSER.filter(
    (p) => !ruter.has(p) && ![...ruter].some((r) => r.startsWith(`${p}/`)),
  );
  assert.deepEqual(
    doede,
    [],
    `Prefikser i TALENT_APNE_PREFIKSER uten en eneste matchende side: ` +
      `${doede.join(", ")}. Enten skrivefeil, eller så er ruten slettet — ` +
      `et dødt prefiks gir falsk trygghet om at noe er åpnet.`,
  );
});

/**
 * REGRESJONSVAKT for feilen som ble rettet 2026-08-16.
 *
 * Var: `src/app/portal/layout.tsx` kalte `requirePortalUser()` UTEN
 * kreverTilgang, altså FULL, og den layouten wrapper HELE /portal. Dermed
 * fantes tilgangsnivået TALENT ikke i praksis: en TALENT-bruker ble sendt til
 * /portal/oppgrader, som selv ligger under /portal og derfor traff samme
 * layout — en redirect-løkke. Alle `kreverTilgang: "TALENT"`-merkingene
 * lenger nede i treet var unåelige. Feilen var sovende fordi gratisForAlle()
 * gir alle FULL frem til 1. september 2026 (src/lib/feature-flags.ts).
 *
 * Nå: rot-layouten håndhever kun innlogging/rolle/samtykke ("INGEN"), og
 * tilgangsnivået eies av hver enkelt side. Settes den tilbake til FULL — eller
 * fjernes kreverTilgang så defaulten slår inn igjen — kommer løkka tilbake, og
 * denne testen sier ifra.
 */
test("rot-layouten håndhever INGEN — nivået eies av hver side", () => {
  assert.equal(
    nivaIFil(ROT_LAYOUT),
    "INGEN",
    `src/app/portal/layout.tsx håndhever "${nivaIFil(ROT_LAYOUT)}" og ikke ` +
      `"INGEN". Layouten wrapper HELE /portal, også /portal/oppgrader — ` +
      `krever den et tilgangsnivå, blir en TALENT-bruker sendt til ` +
      `oppgraderingssiden, som treffer samme layout og sender ham videre ` +
      `igjen: redirect-løkke, og ingen kan betale seg ut av den. ` +
      `Tilgangsnivået settes per side (fail-closed: en ny side arver ` +
      `FULL-defaulten fra requirePortalUser).`,
  );
});

/**
 * Betalingsveien MÅ være nåbar for ALLE innloggede — også for en spiller uten
 * tilgang i det hele tatt. Er den ikke det, står brukeren i en løkke han ikke
 * kan betale seg ut av: requirePortalUser sender ham til /portal/oppgrader,
 * som sender ham videre til oppgraderingsflyten, som sender ham tilbake.
 * Dette er hele grunnen til at rot-layouten er "INGEN".
 */
test("oppgraderingsveien er nåbar for alle innloggede", () => {
  for (const rute of [
    "/portal/oppgrader",
    "/portal/meg",
    "/portal/meg/abonnement",
    "/portal/meg/abonnement/oppgrader/flyt",
  ]) {
    const fil = SIDER.find((f) => tilRute(f) === rute);
    assert.ok(fil, `Fant ikke ${rute} — er betalingsveien flyttet?`);
    const e = strengeste(guardKjede(fil, true));
    assert.equal(
      e.niva,
      "INGEN",
      `${rute} krever "${e.niva}" (satt i ${e.hvem}). Betalingsveien må være ` +
        `åpen for alle innloggede — ellers kan ingen kjøpe seg ut av låsen.`,
    );
  }
});
