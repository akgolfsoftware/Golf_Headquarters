#!/usr/bin/env node
// TA-12 / PR 1h: tilgangsvakt for API-ruter og server actions.
//
// Utfyller check-action-auth.mjs (som bare ser på import per fil) med:
//  1. Hver eksporterte handler (GET/POST/PUT/PATCH/DELETE) i src/app/**/route.ts
//     må kalle en gjenkjent tilgangsvakt (rolle, eier, cron, webhook-signatur,
//     delt hemmelighet), stå i PUBLIC_ROUTES, eller bære markøren
//     `// tilgang: <begrunnelse>`.
//  2. «Bare innlogget» (getCurrentUser, requirePortalUser, ...) teller IKKE som
//     tilgangssjekk når handlingen tar en spiller-/ressurs-ID fra klienten.
//     Da kreves rolle-/eiersjekk eller markøren `// tilgang: eier sjekkes i X`.
//     Gjelder både route.ts og eksporterte server actions.
//  3. Kjent gjeld (KJENT_GJELD) er eksisterende hull med funn-ID fra
//     kodegjennomgangen 06.10. Listen kan bare krympe: en oppføring som ikke
//     lenger trengs (hullet er rettet) gir feil til den fjernes.
//
// Kjør: node scripts/check-tilgang-vakt.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const METODER = ["GET", "POST", "PUT", "PATCH", "DELETE"];

/** Vakter som faktisk avgjør hvem som får lov (rolle, eier, hemmelighet, signatur). */
export const STERKE_VAKTER = [
  "requireCoachActionUser",
  "requireAdminActionUser",
  "requireSpillerActionUser",
  "requireParentActionUser",
  "requireCapability",
  "canAccessMissionControl",
  "harCoachTilgangTilSpiller",
  "assertCoachTilgangTilSpiller",
  "erCoachetSpiller",
  "coachScopedPlayerWhere",
  "canAccessPlayer",
  "assertCanViewPlayerData",
  "assertOwnOrCoached",
  "ensurePlanAccess",
  "coachAction",
  "spillerAction",
  "adminAction",
  "parentAction",
  "avvisUgyldigCron",
  "erGyldigCronAuth",
  "authenticateMcpRequest",
  "shortcutTokenOk",
  "signWebhookToken",
  "timingSafeEqual",
  "constructEvent",
  "krevDokumentOpplastingstilgang",
  "hentTnVedleggForViewer",
];

/** «Bare innlogget»: sier hvem du er, ikke hva du får gjøre. */
export const SVAKE_VAKTER = [
  "getCurrentUser",
  "getCurrentUserRaw",
  "requirePortalUser",
  "requireConsentingUser",
];

// Rolle- og hemmelighetssjekker som ikke er funksjonskall.
const STERKE_MONSTRE = [
  /\bCRON_SECRET\b/,
  /\brole\s*:\s*\{\s*in\s*:/,
  // Rollegrind: requirePortalUser({ allow: ["COACH", ...] }). Uten `allow` er det bare innlogget.
  /\brequirePortalUser\(\s*\{[^}]*\ballow\s*:/,
  /\b(?:hentBarnForForelder|hentBarnHvisTilhoerer)\s*\(/,
  /\bparentRelation\.find\w*\(/,
  // Eiersammenligning: recording.uploadedById !== user.id (begge rekkefølger).
  /\b\w*(?:Id|ID)\s*(?:!==|===|!=|==)\s*(?:user|me|bruker|current\w*)\.id\b/,
  /\b(?:user|me|bruker|current\w*)\.id\s*(?:!==|===|!=|==)\s*[\w.?]*(?:Id|ID)\b/,
  /\b(?:isCoach|isAdmin|erCoach|erAdmin)\s*\(/,
  /headers\.get\(\s*["']x-[a-z-]*(?:secret|token)[a-z-]*["']\s*\)/i,
];

const MARKOR = /\/\/\s*tilgang:\s*\S/;

/**
 * Bevisst offentlige / maskin-til-maskin-ruter UTEN vakt i selve handleren.
 * Nøkkel: rute relativt til repo (src/app/...). Verdi: én linje begrunnelse.
 */
export const PUBLIC_ROUTES = new Map([
  ["src/app/api/health/route.ts", "helsesjekk, returnerer bare status"],
  ["src/app/kino/route.ts", "ren omdirigering, ingen data"],
  ["src/app/api/auth/oauth-callback/route.ts", "Supabase-kode i URL er legitimasjonen (omkobling: TA-02)"],
  ["src/app/api/google-calendar/callback/route.ts", "OAuth-callback, HMAC-state (binding til økt: TA-14)"],
  ["src/app/api/notion/oauth/callback/route.ts", "OAuth-callback, HMAC-state (binding til økt: TA-14)"],
  ["src/app/api/google-calendar/webhook/route.ts", "Google-webhook, kanal-token verifisert mot HMAC"],
  ["src/app/api/stripe/webhook/route.ts", "Stripe-webhook, signatur verifisert med constructEvent"],
  ["src/app/api/push/subscribe/route.ts", "auth i lib/push/subscriptions (kaster unauthenticated)"],
  ["src/app/api/push/unsubscribe/route.ts", "auth i lib/push/subscriptions, kun egne abonnement"],
  ["src/app/api/lead/route.ts", "offentlig leadskjema, same-origin og rate-limit (utsending: TA-17)"],
  ["src/app/api/client-error/route.ts", "åpen feilrapport fra nettleser (varsler: TA-16)"],
  ["src/app/api/stats/search/route.ts", "åpent statistikksøk (Data Golf-tall: TA-06)"],
  ["src/app/api/mcp/akgolf/route.ts", "GET er åpent manifest; POST krever API-nøkkel (authenticateMcpRequest)"],
]);

/**
 * Kjent gjeld: «<fil>#<METODE|funksjon>» -> funn-ID fra kodegjennomgangen 06.10.
 * Listen skal bare krympe. Rettes hullet, fjern oppføringen (skriptet krever det).
 */
export const KJENT_GJELD = new Map([
  ["src/app/api/coach/ai-chat/route.ts#POST", "TA-01"],
  ["src/app/api/parse-date/route.ts#POST", "TA-07"],
  ["src/app/api/upload/route.ts#POST", "TA-05"],
  ["src/app/api/portal/swing-video/upload/route.ts#POST", "TA-21"],
  ["src/lib/storage/video.ts#uploadVideo", "TP-01"],
]);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) yield p;
  }
}

function harKall(txt, navn) {
  return new RegExp("\\b" + navn + "\\s*\\(").test(txt);
}

export function vaktNiva(txt) {
  const sterk =
    STERKE_VAKTER.some((n) => harKall(txt, n)) || STERKE_MONSTRE.some((re) => re.test(txt));
  const svak = SVAKE_VAKTER.some((n) => harKall(txt, n));
  return { sterk, svak, markor: MARKOR.test(txt) };
}

// ID-navn. For server actions snevres det til ID-er som peker ut en annen
// spiller/bruker; ellers ville alle ID-er til brukerens egne rader gitt støy.
const ALLE_ID = String.raw`\w*(?:Id|ID)`;
const SPILLER_ID = String.raw`(?:spill+er|player|athlete|elev|barn|child|user|target\w*|for\w*)Id`;
const INN = String.raw`(?:body|data|parsed\.data|input|payload|json|params|query)`;

/**
 * Tar koden en ID fra klienten? Heuristikk, bevisst bred.
 * `kunSpiller`: bare ID-er som peker ut en spiller/bruker (brukes for actions).
 */
export function tarIdFraKlient(txt, rel = "", kunSpiller = false) {
  const id = kunSpiller ? SPILLER_ID : ALLE_ID;
  if (!kunSpiller && /\[[A-Za-z]*[iI]d\]/.test(rel)) return true;
  if (new RegExp(String.raw`\b${id}\??\s*:\s*z\.`).test(txt)) return true;
  if (!kunSpiller && /\.get\(\s*["'](?:\w*[iI]d|bucket|path)["']/.test(txt)) return true;
  if (kunSpiller && /\.get\(\s*["'](?:spill|player|user)\w*[iI]d["']/.test(txt)) return true;
  if (new RegExp(String.raw`\b${INN}\b[^;\n]{0,60}\.${id}\b`).test(txt)) return true;
  if (new RegExp(String.raw`\{[^}]*\b${id}\b[^}]*\}\s*=\s*(?:await\s+)?(?:\w+\.json\(\)|${INN}\b)`).test(txt)) return true;
  if (kunSpiller) {
    // Parameterlisten til selve actionen: (spillerId: string, ...) / ({ spillerId }).
    const sig = txt.match(/^export\s+(?:async\s+function\s+\w+|const\s+\w+\s*=\s*async)\s*\(([^)]*)\)/m);
    if (sig && new RegExp(String.raw`\b${id}\b`).test(sig[1])) return true;
  }
  return false;
}

const SLUTT_PA_FUNKSJON = /\n[}\]]\)?;?[ \t]*(?:\n|$)/;

function skjaer(txt, startRe, hentNavn) {
  const starter = [];
  let m;
  while ((m = startRe.exec(txt))) starter.push({ navn: hentNavn(m), fra: m.index });
  const deler = [];
  let felles = "";
  let cursor = 0;
  for (const s of starter) {
    const slutt = txt.slice(s.fra).search(SLUTT_PA_FUNKSJON);
    const til = slutt === -1 ? txt.length : s.fra + slutt + 1;
    felles += txt.slice(cursor, s.fra);
    cursor = til;
    deler.push({ navn: s.navn, tekst: txt.slice(s.fra, til) });
  }
  felles += txt.slice(cursor);
  return { felles, deler };
}

/** Del en routefil i felles-del (hjelpekode) + én tekst per eksportert handler. */
export function delOppRute(txt) {
  const re = new RegExp(
    "^export\\s+(?:async\\s+function|function|const)\\s+(" + METODER.join("|") + ")\\b",
    "gm",
  );
  const { felles, deler } = skjaer(txt, re, (m) => m[1]);
  return { felles, handlere: deler.map((d) => ({ metode: d.navn, tekst: d.tekst })) };
}

/** Eksporterte server actions: navn + tekst per funksjon. */
export function delOppAction(txt) {
  const re = /^export\s+(?:async\s+function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async|\())/gm;
  const { felles, deler } = skjaer(txt, re, (m) => m[1] || m[2]);
  return { felles, funksjoner: deler };
}

/**
 * Vurder én enhet (handler/action). Returnerer null hvis OK, ellers årsakstekst.
 * `felles` er filens ikke-eksporterte hjelpekode (kan inneholde vakten).
 */
export function vurder({ rel, tekst, felles, offentlig = false }) {
  const n = vaktNiva(felles + "\n" + tekst);
  if (n.sterk || n.markor || offentlig) return null;
  if (!n.svak) return "ingen tilgangssjekk";
  if (tarIdFraKlient(tekst, rel) || tarIdFraKlient(felles, "")) {
    return "bare innlogget, men tar ID fra klienten uten rolle-/eiersjekk";
  }
  return null;
}

export function analyserRute(rel, txt) {
  const funn = [];
  const { felles, handlere } = delOppRute(txt);
  const offentlig = PUBLIC_ROUTES.has(rel);
  if (handlere.length === 0 && !/^export\s*\{[^}]*\b(?:GET|POST|PUT|PATCH|DELETE)\b/m.test(txt)) {
    funn.push({ noekkel: `${rel}#*`, arsak: "route.ts uten gjenkjent handler" });
  }
  for (const h of handlere) {
    const arsak = vurder({ rel, tekst: h.tekst, felles, offentlig });
    if (arsak) funn.push({ noekkel: `${rel}#${h.metode}`, arsak });
  }
  return funn;
}

const USE_SERVER = /^\s*["']use server["'];?\s*$/m;
const ACTION_PUBLIC = new Set([
  "src/app/(marketing)/kontakt/actions.ts",
  "src/app/auth/guardian-consent/[token]/actions.ts",
  "src/app/auth/lyd-samtykke/[token]/actions.ts",
  "src/app/inviter/forelder/[token]/actions.ts",
  "src/lib/auth/logout.ts",
  "src/lib/report-client-error.ts",
]);

export function analyserAction(rel, txt) {
  if (!USE_SERVER.test(txt)) return [];
  if (ACTION_PUBLIC.has(rel)) return [];
  if (rel.endsWith("/constants.ts") || rel.includes("/lib/periode-helpers")) return [];
  const funn = [];
  const { felles, funksjoner } = delOppAction(txt);
  for (const f of funksjoner) {
    // Bare «bare innlogget + klient-ID»-regelen for actions; manglende import
    // fanges av check-action-auth.mjs.
    const n = vaktNiva(felles + "\n" + f.tekst);
    if (n.sterk || n.markor || !n.svak) continue;
    if (tarIdFraKlient(f.tekst, "", true)) {
      funn.push({
        noekkel: `${rel}#${f.navn}`,
        arsak: "bare innlogget, men tar ID fra klienten uten rolle-/eiersjekk",
      });
    }
  }
  return funn;
}

export function samleFunn(rotMappe = ".") {
  const funn = [];
  let antallRuter = 0;
  let antallHandlere = 0;
  for (const root of ["src/app", "src/lib", "src/components"]) {
    const abs = path.join(rotMappe, root);
    for (const file of walk(abs)) {
      const rel = path.relative(rotMappe, file).replace(/\\/g, "/");
      const txt = readFileSync(file, "utf8");
      if (rel.startsWith("src/app/") && /\/route\.ts$/.test(rel)) {
        antallRuter++;
        antallHandlere += delOppRute(txt).handlere.length;
        funn.push(...analyserRute(rel, txt));
      } else {
        funn.push(...analyserAction(rel, txt));
      }
    }
  }
  return { funn, antallRuter, antallHandlere };
}

/** Sammenlign funn mot gjeld. Ren funksjon, brukes av testen. */
export function sammenlign(funn, gjeld = KJENT_GJELD) {
  const noekler = new Set(funn.map((f) => f.noekkel));
  const nye = funn.filter((f) => !gjeld.has(f.noekkel));
  const utdatert = [...gjeld.keys()].filter((k) => !noekler.has(k));
  return { nye, utdatert };
}

function main() {
  const { funn, antallRuter, antallHandlere } = samleFunn(".");
  const { nye, utdatert } = sammenlign(funn);
  let feil = false;
  if (nye.length) {
    feil = true;
    console.error(
      "check-tilgang-vakt: mangler tilgangssjekk:\n" +
        nye.map((f) => `  ${f.noekkel}: ${f.arsak}`).join("\n") +
        "\nKall en rolle-/eier-/cron-/signaturvakt, legg ruten i PUBLIC_ROUTES med begrunnelse, " +
        "eller skriv `// tilgang: <hvor sjekken skjer>` i handleren. «Bare innlogget» holder ikke " +
        "når ID-en kommer fra klienten.",
    );
  }
  if (utdatert.length) {
    feil = true;
    console.error(
      "check-tilgang-vakt: kjent gjeld som ikke lenger trengs (fjern fra KJENT_GJELD):\n" +
        utdatert.map((k) => `  ${k} (${KJENT_GJELD.get(k)})`).join("\n"),
    );
  }
  if (feil) process.exit(1);
  console.log(
    `check-tilgang-vakt: OK. ${antallRuter} ruter / ${antallHandlere} handlere sjekket, ${KJENT_GJELD.size} i kjent gjeld.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
