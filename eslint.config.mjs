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
  ]),
]);

export default eslintConfig;
