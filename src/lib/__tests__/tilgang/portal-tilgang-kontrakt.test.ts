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
 * Rot-layouten holdes UTENFOR målingen, og det er et bevisst valg: den låser
 * i dag alt til FULL (se siste test), så en måling som tok den med ville vært
 * grønn uansett hva noen gjorde lenger nede — en test som ikke kan bli rød.
 * Det ble faktisk avdekket ved mutasjonstesting av denne fila: (legacy)-
 * layouten ble satt til TALENT uten at testen merket det.
 *
 * Ved å regne uten rot-layouten måler vi det som faktisk betyr noe: holder
 * sidene tett den dagen rot-layouten løsnes? UGUARDEDE er de rutene som i dag
 * IKKE gjør det — de lever kun på rot-layouten, og må få sin egen
 * `kreverTilgang: "FULL"` FØR rot-layouten kan røres.
 */
const UGUARDEDE: readonly string[] = [
  "/portal/analyse",
  "/portal/baneguide",
  "/portal/baneguide/[baneId]",
  "/portal/baneguide/[baneId]/hull/[nr]",
  "/portal/mal/bygger",
  "/portal/trackman",
  "/portal/trackman/[sessionId]",
  "/portal/tren/[sessionId]/planlagt",
  "/portal/tren/kalender",
  "/portal/tren/ovelser",
  "/portal/tren/ovelser/[id]",
] as const;

test("ingen lekkasje: sider utenfor allowlisten er låst til FULL", () => {
  const apne = SIDER.filter((f) => !erApenForTalent(tilRute(f))).flatMap((f) => {
    const e = strengeste(guardKjede(f, false));
    return e.niva === "FULL" ? [] : [{ rute: tilRute(f), niva: e.niva, hvem: e.hvem }];
  });
  const nye = apne.filter((a) => !UGUARDEDE.includes(a.rute));
  assert.deepEqual(
    nye.map((a) => a.rute),
    [],
    `Sider utenfor talent-allowlisten som ikke er FULL-gated:\n` +
      `${nye.map((a) => `  ${a.niva.padEnd(6)} ${a.rute}  (svakeste ledd: ${a.hvem})`).join("\n")}\n\n` +
      `Skal ruten være åpen, legg den i TALENT_APNE_PREFIKSER ` +
      `(src/lib/auth/talent-allowlist.ts) — ellers sett kreverTilgang: "FULL".`,
  );

  const naaGuardet = UGUARDEDE.filter((r) => !apne.some((a) => a.rute === r));
  assert.deepEqual(
    naaGuardet,
    [],
    `Disse har fått egen guard og skal ut av UGUARDEDE-lista:\n  ` +
      `${naaGuardet.join("\n  ")}\nEr lista tom, kan rot-layouten trygt løsnes.`,
  );
});

/**
 * MOTSATT RETNING: står ruten på allowlisten, skal den faktisk være nåbar.
 * Rot-layouten holdes utenfor her, fordi den i dag låser HELE portalen til
 * FULL (se den siste testen i fila) og ville druknet alle enkeltavvik.
 *
 * KJENTE_AVVIK er fryst med vilje: lista skal gå NED, aldri opp. Nytt avvik
 * = rød test. Rettet avvik = også rød test, med beskjed om å fjerne linja.
 */
const KJENTE_AVVIK: readonly string[] = [
  // Blokkert av src/app/portal/(fullscreen)/layout.tsx (krever FULL):
  "/portal/tren/tester/[testId]/gjennomfor",
  // Blokkert av src/app/portal/(legacy)/layout.tsx (krever FULL):
  "/portal/mal/runder/[id]/fullfor",
  "/portal/mal/runder/[id]/shot-by-shot",
  "/portal/statistikk",
  "/portal/tren/tester/katalog",
  // Egen side uten kreverTilgang → arver FULL-defaulten. Nabosiden
  // /portal/meg/utstyrsbag har "INGEN", så dette ser ut som en forglemmelse.
  "/portal/meg/utstyr",
] as const;

test("allowlisten holder det den lover (rot-layout holdt utenfor)", () => {
  const blokkert = SIDER.filter((f) => erApenForTalent(tilRute(f))).flatMap((f) => {
    const e = strengeste(guardKjede(f, false));
    return e.niva === "FULL" ? [{ rute: tilRute(f), hvem: e.hvem }] : [];
  });
  const nye = blokkert.filter((b) => !KJENTE_AVVIK.includes(b.rute));
  assert.deepEqual(
    nye.map((b) => `  ${b.rute}  (blokkeres av ${b.hvem})`),
    [],
    `Ruter som står på talent-allowlisten, men som en FULL-guard stenger:\n` +
      `${nye.map((b) => `  ${b.rute}  (${b.hvem})`).join("\n")}\n\n` +
      `Legg kreverTilgang: "TALENT" (eller "INGEN") på siden — ellers lyver ` +
      `allowlisten om hva den gratis TALENT-profilen faktisk kommer inn på.`,
  );

  const fikset = KJENTE_AVVIK.filter((r) => !blokkert.some((b) => b.rute === r));
  assert.deepEqual(
    fikset,
    [],
    `Disse står i KJENTE_AVVIK, men er ikke lenger blokkert:\n  ${fikset.join("\n  ")}\n` +
      `Fjern dem fra lista i denne fila — den skal krympe, ikke bli utdatert.`,
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
 * KARAKTERISERING av en kjent, udokumentert-til-nå feil (funnet 2026-08-16).
 *
 * `src/app/portal/layout.tsx` kaller `requirePortalUser()` UTEN kreverTilgang,
 * altså FULL, og den layouten wrapper HELE /portal. Konsekvensen er at
 * tilgangsnivået TALENT i praksis ikke finnes: en TALENT-bruker blir sendt til
 * /portal/oppgrader, som selv ligger under /portal og derfor treffer samme
 * layout — en redirect-løkke. Alle 60 `kreverTilgang: "TALENT"`-merkingene
 * lenger nede i treet er dermed unåelige.
 *
 * Feilen er SOVENDE i dag: gratisForAlle() gir alle FULL frem til 1. september
 * 2026 (src/lib/feature-flags.ts), så ingenting vises i prod nå.
 *
 * Fiksen er IKKE bare å løsne rot-layouten. 11 ruter utenfor allowlisten har
 * ingen egen guard og lever kun på denne layouten (bl.a. /portal/trackman,
 * /portal/baneguide, /portal/tren/ovelser, /portal/mal/bygger). Løsnes rot-
 * layouten før de får `kreverTilgang: "FULL"`, snus en fail-closed feil til en
 * ekte lekkasje. Rekkefølgen må være: guard de 11 først, så løsne rot.
 *
 * Testen står her for å gjøre den rekkefølgen umulig å gjøre i vanvare —
 * fikser du rot-layouten, blir denne rød og peker på resten av jobben.
 */
test("DOKUMENTERT FEIL: rot-layouten låser hele /portal til FULL", () => {
  assert.equal(
    nivaIFil(ROT_LAYOUT),
    "FULL",
    `src/app/portal/layout.tsx håndhever ikke lenger FULL — bra, men da må ` +
      `du samtidig sjekke at alle sider utenfor talent-allowlisten har fått ` +
      `sin egen kreverTilgang: "FULL". «ingen lekkasje»-testen over er den ` +
      `som avgjør. Når begge er grønne: slett denne testen og oppdater ` +
      `docs/testing.md §Manuell verifisering av tilgangsflytene 16.08.`,
  );
});
