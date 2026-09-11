/**
 * PH-06-rigg — SIMULERT, ikke innlogget databaseprøve.
 *
 * Render statisk markup (renderToStaticMarkup) av SessionSummary med syntetiske
 * LiveV2Summary-tilstander, pakket i en frittstående HTML-fil med Train-lock-tokens
 * (valgt-zip-4) inlinet. Ingen Next dev-server, ingen database, ingen ekte
 * server actions kjøres — `lagreDineOrd` mockes bort med node:test sin
 * `mock.module` (kun for at import-kjeden skal kunne lastes utenfor
 * `react-server`-betingelsen som `react-dom/server` krever) før SessionSummary
 * importeres. Kun første-maling (SSR-markup) verifiseres — ikke klientinteraksjon.
 *
 * Klientinteraksjon (skriving i tekstfelt, lagre/feil/retry, fokus/tastatur) er
 * IKKE dekket av denne riggen — det er verifisert ved lesing av kildekoden
 * (se docs/design-audit/playerhq-ph06-2026-09-11.md) og krever en ekte
 * nettleser-hydrering mot en kjørende app for å bli bevist i praksis.
 *
 * Kjør: npx tsx --experimental-test-module-mocks --test tests/visual/playerhq-summary/render.tsx
 * Output: tests/visual/ut/playerhq-summary/*.html (gitignorert arbeidsfiler)
 */
import { test, mock } from "node:test";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HER = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HER, "..", "..", "..");
const UT_DIR = path.join(REPO_ROOT, "tests", "visual", "ut", "playerhq-summary");

test("PH-06-rigg: render statisk markup for alle tilstander", async () => {
  // Actions-modulen importerer server-only-kode (prisma, agent-triggere) som
  // ikke lastes utenfor react-server-betingelsen — mockes bort da riggen kun
  // bruker første-maling og aldri faktisk trykker "Lagre".
  mock.module("@/app/portal/(fullscreen)/live/[sessionId]/actions", {
    namedExports: {
      lagreDineOrd: async () => ({ ok: true }),
      lagreSpillerVurdering: async () => ({ ok: true }),
    },
  });

  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { SessionSummary } = await import("@/components/portal/live/SessionSummary");
  const {
    TOM_OKT,
    DELVIS_OKT,
    FULLFORT_OKT,
    LANGT_INNHOLD_OKT,
    ELDRE_OKT_UTEN_COMPLETED_IDS,
    EKSISTERENDE_VURDERING,
    NESTE_OKT,
  } = await import("./fixtures");

  const TAILWIND_CSS_PATH = path.join(UT_DIR, "tailwind.css");
  if (!existsSync(TAILWIND_CSS_PATH)) {
    throw new Error(
      `Mangler ${TAILWIND_CSS_PATH} — kjør 'node tests/visual/playerhq-summary/build-tailwind.mjs' først.`,
    );
  }
  const TOKENS_CSS = [
    readFileSync(TAILWIND_CSS_PATH, "utf8"),
    readFileSync(path.join(REPO_ROOT, "src/styles/train-lock-tokens.css"), "utf8"),
    readFileSync(path.join(REPO_ROOT, "src/styles/train-lock-valgt.css"), "utf8"),
  ].join("\n");

  const RADER: Array<{ slug: string; tittel: string; element: ReturnType<typeof createElement> }> = [
    { slug: "tom", tittel: "Tom tilstand — fri økt, ingen tall logget", element: createElement(SessionSummary, { data: TOM_OKT }) },
    { slug: "delvis", tittel: "Delvis gjennomført — 1 av 3 drills ferdigmarkert", element: createElement(SessionSummary, { data: DELVIS_OKT, nesteOkt: NESTE_OKT }) },
    { slug: "fullfort", tittel: "Fullført økt — alle drills ferdigmarkert", element: createElement(SessionSummary, { data: FULLFORT_OKT, nesteOkt: NESTE_OKT }) },
    {
      slug: "fullfort-med-vurdering-lagret",
      tittel: "Fullført — kvittering vist (allerede lagret i loggen)",
      element: createElement(SessionSummary, {
        data: FULLFORT_OKT,
        nesteOkt: NESTE_OKT,
        lagredeOrd: "Fin økt med jevnt treffvindu på begge avstander. Litt tyngre mot slutten.",
        spillerVurdering: EKSISTERENDE_VURDERING,
      }),
    },
    { slug: "langt-innhold", tittel: "Langt innhold — lang tittel, 6 drills, langt coach-navn", element: createElement(SessionSummary, { data: LANGT_INNHOLD_OKT }) },
    { slug: "eldre-fallback", tittel: "Eldre økt uten completedDrillIds — dokumentert fallback til loggene", element: createElement(SessionSummary, { data: ELDRE_OKT_UTEN_COMPLETED_IDS }) },
  ];

  function pageHtml(tittel: string, innerHtml: string, tema: "lys" | "mork"): string {
    const dataTema = tema === "mork" ? ' data-v2-tema="dark"' : "";
    const bg = tema === "mork" ? "#000" : "#F2F1ED";
    return `<!doctype html>
<html data-train-lock="4"${dataTema}>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>PH-06 rigg — ${tittel}</title>
<style>
${TOKENS_CSS}
html,body{margin:0;padding:0;background:${bg};}
* { box-sizing: border-box; }
body { font-family: var(--tl-font-sans, sans-serif); }
</style>
</head>
<body>
<div data-rigg-tittel style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#B83217;color:#fff;font:600 11px/1.4 monospace;padding:4px 8px;">
  SIMULERT · ${tittel}
</div>
<div style="padding-top:28px;">
${innerHtml}
</div>
</body>
</html>`;
  }

  mkdirSync(UT_DIR, { recursive: true });

  let antall = 0;
  for (const rad of RADER) {
    const html = renderToStaticMarkup(rad.element);
    for (const tema of ["lys", "mork"] as const) {
      const fil = path.join(UT_DIR, `${rad.slug}--${tema}.html`);
      writeFileSync(fil, pageHtml(rad.tittel, html, tema), "utf8");
      antall += 1;
    }
  }

  console.log(`PH-06-rigg: skrev ${antall} statiske HTML-filer til ${UT_DIR}`);
});
