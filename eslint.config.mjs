import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * AK Golf HQ — ESLint config
 *
 * Inkluderer V2-migration drift-prevention-regler som gjelder for
 * src/components/v2/ + migrerte sider. Reglene blokker:
 * - Hardkodede hex-farger (må bruke Tailwind-tokens eller CSS-vars)
 * - Off-grid spacing (p-3, p-5, p-7, p-9)
 *
 * Eldre sider beholder eksisterende imports inntil de migreres til v2.
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
  // Opprydding Fase 2 (docs/opprydding/03-opprydding-plan.md): gammelt athletic
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
  // V2 drift-prevention — gjelder for src/components/v2/ + design-system-v2-rute
  {
    files: [
      "src/components/v2/**/*.{ts,tsx}",
      "src/app/(internal)/design-system-v2/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // Hardkodede hex-farger i string-literal
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message:
            "Ingen hardkodede hex-farger i v2-koden. Bruk Tailwind-tokens (bg-primary, text-accent) eller CSS-vars (hsl(var(--primary))).",
        },
        {
          // Off-grid Tailwind-spacing i className
          selector:
            "Literal[value=/\\b(p|m|gap|space-y|space-x|w|h)-[3579](\\s|$)/]",
          message:
            "8pt-grid: bruk p-2/p-4/p-6/p-8/p-10/p-12 — ikke p-3/p-5/p-7/p-9.",
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
  ]),
]);

export default eslintConfig;
