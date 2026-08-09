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

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
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
  ]),
]);

export default eslintConfig;
