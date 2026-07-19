---
name: verify-og-commit
description: Kjør full kvalitetsgate (npm run verify) og commit + push på gren for AK Golf HQ. Bruk ALLTID denne skillen når en oppgave er ferdig og skal committes, når brukeren sier "verifiser", "commit", "push", "er det grønt?", "kjør verify", eller før enhver Pull Request. Trigger også når en implementasjon er fullført og neste naturlige steg er å sikre kvalitet og lagre arbeidet.
Versjon: 1 (2026-07-19)
---

# Verify og commit — kvalitetsgate før hver commit

Du sikrer at ingenting ukontrollert når repoet. Rekkefølgen er låst.

## Prosess

1. **Status først:** `git status -sb` + `git diff --stat`. Bekreft at du er på en
   arbeidsgren — ALDRI på main (main er Anders' port, se CLAUDE.md §Git-arbeidsflyt).
2. **Kjør gaten:** `npm run verify`
   (= `prisma validate` → `prisma generate` → `tsc --noEmit` → `eslint --quiet src`
   → `node scripts/check-no-hex.mjs` → `npm run build`).
3. **Tolk feil med gotcha-lista** (`.claude/rules/gotchas.md`) FØR du fikser:

   | Symptom | Sannsynlig årsak (gotcha) |
   |---|---|
   | `PrismaClientValidationError` / «Unknown argument» i dev | Foreldet Prisma-klient — RESTART dev-server etter `prisma generate` |
   | Hex-gate feiler | Rå hex-farge — bruk Tailwind-tokens/CSS-vars; baseline i `scripts/check-no-hex-baseline.json` utvides ALDRI for ny kode |
   | `migrate dev`/`db push` foreslått av feilmelding | BEGGE er blokkert — additive endringer går via kirurgisk `db execute` (gotchas.md §Schema-endringer) |
   | DB-feil i `tsx`-script | Manglende `import "./_env"` FØR `@/lib/prisma` |
   | eslint `no-restricted-imports` | Gammelt athletic-bibliotek — bruk golfdata/ eller ui/ |

4. **Fiks og kjør gaten på nytt.** Gjenta til grønt. Aldri commit med rød gate,
   aldri `--no-verify`.
5. **Commit:** Conventional Commits på engelsk (`feat:`, `fix:`, `chore:`, `docs:` …),
   én logisk endring per commit. Skjerm-endringer: master-skjermplanens haker
   oppdateres i SAMME commit (CLAUDE.md §FØR DU RØRER EN SKJERM).
6. **Push grenen:** `git push -u origin <gren>`. Ved nettverksfeil: retry 4× med
   eksponentiell backoff (2s, 4s, 8s, 16s).
7. **Oppsummer på norsk** hva som ble gjort, og — hvis leveransen er klar —
   åpne draft-PR mot main med klarspråk-beskrivelse + Vercel-preview-lenke.
   Merge skjer ALDRI uten Anders' eksplisitte «ja».

## Hurtigvarianter

- Kun typer + lint (rask iterasjon): `npx tsc --noEmit && npx eslint --quiet src`
- Én testfil: `npx tsx --conditions=react-server --experimental-test-module-mocks --test <fil>`
- Full gate er OBLIGATORISK før commit uansett hvor liten endringen føles.

## Aldri

- Aldri push til main. Aldri `--force` / `reset --hard` uten å spørre Anders.
- Aldri utvid hex-baseline eller legg til eslint-disable for å «komme forbi» gaten.
- Aldri hopp over `npm run build` — Turbopack/Serwist-feil synes først der.
