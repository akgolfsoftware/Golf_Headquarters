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
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
