import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * AK Golf HQ — ESLint config
 *
 * Merk (2026-07-25): design-gatene (hex-forbud + 8pt-grid) er fjernet —
 * den gamle v2-designkanonen er avviklet mens nytt designsystem utvikles
 * i Open Design. Kodekvalitets-reglene under er fortsatt aktive.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Bevisst ubrukte variabler/argumenter prefikset med _ skal ikke advare
  // (standard konvensjon — f.eks. destrukturering der elementer hoppes over,
  // eller stub-funksjoner med ennå-ubrukte parametre).
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Opprydding Fase 2 (docs/arkiv/2026-08-02-docs-rydding/opprydding/03-opprydding-plan.md): gammelt athletic
  // er avviklet — kun golfdata/ er gjeldende kanon. Legacy-filer bærer
  // disable-kommentarer (eslint) med TODO(opprydding) til de migreres (Fase 3/4);
  // ingen NYE importer slipper gjennom. src/components/athletic/** er unntatt
  // (bibliotekets interne kryssimporter — hele mappen slettes i Fase 5).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/athletic/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // NB: gitignore-style group-negasjon ("!…/golfdata") virker IKKE når
              // forelder-mappen er ekskludert — derfor regex med lookahead i stedet.
              regex: "^@/components/athletic($|/(?!golfdata($|/)))",
              message:
                "Bruk golfdata-komponent eller ui-primitiv. Gammelt athletic er avviklet.",
            },
          ],
        },
      ],
    },
  },

  // PP-0.5 Paper CTA guards (2026-08-09) — neon lime never as CTA fill;
  // solid handling monopol is clay #D97757 / T.handling (enTing).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/components/athletic/**",
      "src/lib/v2/tokens.ts",
      "src/styles/**",
      "src/app/globals.css",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value='#D1F843']",
          message:
            "Paper: neon AK-lime (#D1F843) er merkevare/brand — aldri CTA-fyll. Bruk T.cta (ink) eller T.handling (clay Én ting nå).",
        },
        {
          selector: "Literal[value='#d1f843']",
          message:
            "Paper: neon AK-lime (#D1F843) er merkevare/brand — aldri CTA-fyll. Bruk T.cta (ink) eller T.handling (clay Én ting nå).",
        },
      ],
    },
  },

  // Tallformat-vakt: tall som VISES skal gå gjennom src/lib/format-tall.ts
  // (komma-desimal, mellomrom før %, ekte minus «−»), aldri rå .toFixed().
  // Fasiten står i docs/skjermtekst/skjerm-tekst-hovedskjermer.md og har vært
  // skrevet ned lenge uten å være håndhevet — resultatet var åtte konkurrerende
  // formateringsfiler og «62.4%» med punktum på de offentlige stats-sidene.
  //
  // Bruker no-restricted-properties, ikke no-restricted-syntax: sistnevnte er
  // allerede i bruk for #D1F843-vakten over, og i flat config overstyrer den
  // siste blokken den forrige der scopene overlapper.
  //
  // `ignores` er en ENGANGSLISTE over de 117 filene som allerede hadde
  // .toFixed da vakten ble satt opp 22.09.2026. Den skal bare krympe: rydder
  // du i en av dem, fjern linjen. Legg ALDRI til en ny fil — da har vakten
  // mistet hensikten.
  //
  // MERK hakeparentesene: Next.js dynamiske ruter må escapes som
  // `\\[metric\\]`. Uten escaping leser minimatch `[metric]` som en
  // tegnklasse — altså ETT tegn fra {m,e,t,r,i,c} — og mønsteret matcher
  // aldri mappen. Unntaket ser riktig ut i lista og virker likevel ikke.
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    ignores: [
      "src/app/(marketing)/stats/aargang/\\[aar\\]/page.tsx",
      "src/app/(marketing)/stats/pga/drive-distance/explorer.tsx",
      "src/app/(marketing)/stats/pga/fairway-pct/explorer.tsx",
      "src/app/(marketing)/stats/pga/gir-pct/explorer.tsx",
      "src/app/(marketing)/stats/pga/page.tsx",
      "src/app/(marketing)/stats/pga/putts-per-round/explorer.tsx",
      "src/app/(marketing)/stats/pga/scoring-avg/explorer.tsx",
      "src/app/(marketing)/stats/pga/sg-total/explorer.tsx",
      "src/app/(marketing)/stats/pga/spillere/\\[dg_id\\]/page.tsx",
      "src/app/(marketing)/stats/pga/spillere/spiller-tabell.tsx",
      "src/app/(marketing)/stats/regions/\\[slug\\]/page.tsx",
      "src/app/(marketing)/stats/sg-sammenlign/resultat/\\[id\\]/page.tsx",
      "src/app/(marketing)/stats/sg-sammenlign/start/skjema.tsx",
      "src/app/(marketing)/stats/spillere/\\[slug\\]/page.tsx",
      "src/app/(marketing)/stats/tour/\\[slug\\]/page.tsx",
      "src/app/(marketing)/stats/turneringer/\\[slug\\]/page.tsx",
      "src/app/(marketing)/stats/wrapped/\\[slug\\]/page.tsx",
      "src/app/admin/(legacy)/tester/benchmarks/page.tsx",
      "src/app/admin/agents/\\[agentId\\]/page.tsx",
      "src/app/admin/grupper/\\[id\\]/legg-til-medlem-modal.tsx",
      "src/app/admin/grupper/\\[id\\]/page.tsx",
      "src/app/admin/queue/page.tsx",
      "src/app/admin/runder/page.tsx",
      "src/app/admin/trackman/\\[sessionId\\]/page.tsx",
      "src/app/admin/trackman/page.tsx",
      "src/app/admin/videoer/page.tsx",
      "src/app/innsyn/\\[spillerId\\]/page.tsx",
      "src/app/portal/gameplan/\\[baneId\\]/hull/\\[nr\\]/page.tsx",
      "src/app/portal/kalender/data.ts",
      "src/app/portal/mal/leaderboard/page.tsx",
      "src/app/portal/mal/runder/\\[id\\]/slag-wizard.tsx",
      "src/app/portal/mal/sg-hub/coach/\\[spillerId\\]/\\[club\\]/page.tsx",
      "src/app/portal/meg/profil/page.tsx",
      "src/app/portal/statistikk/\\[metric\\]/page.tsx",
      "src/app/team-wang/_components/ak-primitiver.tsx",
      "src/app/team-wang/_data/live-sesong.ts",
      "src/app/team-wang/_data/wang-plan.ts",
      "src/components/admin/compliance/compliance.tsx",
      "src/components/admin/spiller-detalj/spiller-detalj-oversikt.tsx",
      "src/components/admin/v2/AdminCaddieAktivitetV2.tsx",
      "src/components/admin/v2/AdminLocationFormV2.tsx",
      "src/components/admin/v2/AdminPlanMalDetaljV2.tsx",
      "src/components/admin/v2/AdminPlanMalRedigerV2.tsx",
      "src/components/admin/v2/AdminPlanMalerV2.tsx",
      "src/components/admin/v2/AdminReachV2.tsx",
      "src/components/admin/v2/AdminRunderV2.tsx",
      "src/components/admin/v2/AdminSpillerAnalyseV2.tsx",
      "src/components/admin/v2/AdminSpillerFremgangV2.tsx",
      "src/components/admin/v2/AdminSpillerProfilSideV2.tsx",
      "src/components/admin/v2/AdminSpillerTesterV2.tsx",
      "src/components/admin/v2/AdminTalentDiscoveryV2.tsx",
      "src/components/admin/v2/AdminTalentRadarV2.tsx",
      "src/components/admin/v2/AdminTekniskPlanV2.tsx",
      "src/components/admin/v2/GruppeDetaljV2.tsx",
      "src/components/admin/v2/InnsiktStallV2.tsx",
      "src/components/admin/v2/SpillerArbeidsvisningV2.tsx",
      "src/components/admin/v2/oppsett/AdminVideoerTrainLock.tsx",
      "src/components/athletic/golfdata/KpiTile.tsx",
      "src/components/athletic/golfdata/Sparkline.tsx",
      "src/components/hole-analysis/hole-analysis.tsx",
      "src/components/marketing/landing/MarkedForsideReise.tsx",
      "src/components/marketing/v2/MarkedStatsMinProgresjonV2.tsx",
      "src/components/marketing/v2/MarkedStatsSokV2.tsx",
      "src/components/marketing/v2/MarkedStatsVerktoyV2.tsx",
      "src/components/marketing/v2/StatsTurneringerV2.tsx",
      "src/components/meg/artefakter/MaskinromArtefakt.tsx",
      "src/components/meg/artefakter/UkesreviewArtefakt.tsx",
      "src/components/portal/runde-ny/manuell-sg-felt.tsx",
      "src/components/portal/v2/AnalysereHullV2.tsx",
      "src/components/portal/v2/AnalysereV2.tsx",
      "src/components/portal/v2/CoachHubV2.tsx",
      "src/components/portal/v2/CoachSgHubV2.tsx",
      "src/components/portal/v2/FeiringV2.tsx",
      "src/components/portal/v2/ForelderBarnDetaljV2.tsx",
      "src/components/portal/v2/GjorV2.tsx",
      "src/components/portal/v2/MalByggerV2.tsx",
      "src/components/portal/v2/MegHelseV2.tsx",
      "src/components/portal/v2/MegProfilV2.tsx",
      "src/components/portal/v2/NyTestV2.tsx",
      "src/components/portal/v2/PutteLabV2.tsx",
      "src/components/portal/v2/RundeDetaljV2.tsx",
      "src/components/portal/v2/RunderV2.tsx",
      "src/components/portal/v2/TalentMinPlanV2.tsx",
      "src/components/portal/v2/TalentMittNivaV2.tsx",
      "src/components/portal/v2/TalentSammenligningV2.tsx",
      "src/components/portal/v2/UtfordringDetaljV2.tsx",
      "src/components/portal/v2/UtfordringerV2.tsx",
      "src/components/portal/v2/UtstyrHelseV2.tsx",
      "src/components/portal/v2/WorkbenchV2.tsx",
      "src/components/portal/v2/chat/FangstSheet.tsx",
      "src/components/portal/v2/chat/PortalStegListe.tsx",
      "src/components/portal/v2/idag/IDagSelected.tsx",
      "src/components/sg-hub/ConditionsSlider.tsx",
      "src/components/sg-hub/DPlanePlot.tsx",
      "src/components/sg-hub/SgTrainingScatter.tsx",
      "src/components/sg-hub/TempoRibbon.tsx",
      "src/components/shared/calendar/DayView.tsx",
      "src/components/shared/calendar/PlanSidebar.tsx",
      "src/components/shared/calendar/PyramideBar.tsx",
      "src/components/shared/del-runde-modal.tsx",
      "src/components/shared/eksport-modal.tsx",
      "src/components/shared/profile-menu.tsx",
      "src/components/shared/trackman-import-modal.tsx",
      "src/components/stats/count-up.tsx",
      "src/components/stats/pga-kategori-page.tsx",
      "src/components/stats/stats-big-radar.tsx",
      "src/components/stats/stats-kohort-linjegraf.tsx",
      "src/components/stats/stats-trend-graf.tsx",
      "src/components/stats/stats-wrapped-slide.tsx",
      "src/components/team-norway/tn-dokument-tabell.tsx",
      "src/components/trackman/ShotSheet.tsx",
      "src/components/trackman/TrackManSessionDetail.tsx",
      "src/components/v2/datavis.tsx",
      "src/components/v2/dropzone.tsx",
      "src/components/v2/fysisk.tsx",
      "src/components/v2/spesialviz.tsx",
      "src/components/v2/utviklingsplan.tsx",
    ],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          property: "toFixed",
          message:
            "Tall som skal VISES formateres med src/lib/format-tall.ts (formaterTall / formaterProsent / formaterFortegn). Testverdier: src/lib/portal-tester/format-verdi.ts. Trenger du toFixed til ren beregning, gjør det i src/lib/ og returner et tall.",
        },
      ],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "**/.next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Nestede git worktrees (codex/claude-agenter) lever fysisk inne i repo-treet
    // og har egne .next-/build-mapper — uten dette leser lint fra rot deres
    // kompilerte output som om det var kildekode i denne grenen.
    ".worktrees/**",
    // Ikke-app-kode: arkiv (gitignored disk-rester), skill-filer, design-handover
    // og statiske assets. Disse er ikke en del av appen og skal aldri lintes (de
    // inneholder standalone .jsx-eksempler uten imports → falske jsx-no-undef-errors).
    "_archive/**",
    ".claude/**",
    "public/**",
    "wireframe/**",
    // Fasit-referanser (ekstraherte Claude Design-eksports) — kun lesestoff,
    // importeres aldri av appen og skal aldri lintes.
    "docs/**",
    // Paper-speilet (steg 1 i designporten): verbatim kopi av Claude Design-
    // prosjektet 605a48cc. Fasit å måle mot, ikke appkode — standalone .jsx uten
    // imports, egen støtte-runtime. Importeres aldri av src/ og skal aldri lintes.
    "designsystem/**",
    // design-sync (Claude Design-synk, 16.09.2026): konverter-kopi og generert
    // maskinstate — aldri appkode. De håndlagde previews i .design-sync/previews/
    // lintes fortsatt (de committes og går gjennom lint-staged).
    ".ds-sync/**",
    "ds-bundle/**",
    ".design-sync/.cache/**",
    ".design-sync/pkg/types/**",
    ".design-sync/pkg/css/**",
  ]),
]);

export default eslintConfig;
