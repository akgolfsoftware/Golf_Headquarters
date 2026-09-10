---
name: verify-og-commit
description: Kjør full kvalitetsgate (npm run verify) og kontrollert lagring på arbeidsgren for AK Golf HQ. Bruk ALLTID denne skillen når en oppgave er ferdig og skal committes, når brukeren sier "verifiser", "commit", "push", "er det grønt?", "kjør verify", eller før enhver Pull Request. Trigger også når en implementasjon er fullført og neste naturlige steg er å sikre kvalitet og lagre arbeidet.
Versjon: 2 (kontrollert 2026-09-10)
---

Prosjektkilder: `AGENTS.md` → `docs/platform/AGENT-BRIEF.md`. Design velges i `designsystem/README.md`; historiske skill-eksempler overstyrer ikke disse kildene.

# Verify og commit — kvalitetsgate før hver commit

Du sikrer at ingenting ukontrollert når repoet. Rekkefølgen er låst.

## Prosess

1. **Status først:** `git status -sb` + `git diff --stat`. Bekreft at du er på en
   arbeidsgren — ALDRI på main (main er Anders' port, se CLAUDE.md §Git-arbeidsflyt).
2. **Kjør gaten:** `npm run verify`
   Kommandoens gjeldende innhold står i `package.json`. Kontroller også resultatet fra CI; lokal kontroll og CI er ulike kjøringer.
3. **Tolk feil med gotcha-lista** (`.claude/rules/gotchas.md`) FØR du fikser:

   | Symptom | Sannsynlig årsak (gotcha) |
   |---|---|
   | `PrismaClientValidationError` / «Unknown argument» i dev | Foreldet Prisma-klient — RESTART dev-server etter `prisma generate` |
   | `migrate dev`/`db push` foreslått av feilmelding | BEGGE er blokkert — additive endringer går via kirurgisk `db execute` (gotchas.md §Schema-endringer) |
   | DB-feil i `tsx`-script | Manglende `import "./_env"` FØR `@/lib/prisma` |
   | eslint `no-restricted-imports` | Gammelt athletic-bibliotek — bruk golfdata/ eller ui/ |

4. **Fiks og kjør gaten på nytt.** Gjenta til grønt. Aldri commit med rød gate,
   aldri `--no-verify`.
5. **Commit:** Conventional Commits på engelsk (`feat:`, `fix:`, `chore:`, `docs:` …),
   én logisk endring per commit. Skjerm-endringer: ferdig-definisjonen per skjerm i
   skjermbilde-gaten i `CLAUDE.md` §Skjermarbeid må være oppfylt før
   skjermen regnes som ferdig (skjermbilde til Anders, mobil 390px + desktop, lys + mørk,
   fasit ved siden av, alle fire tilstander, én primærhandling etter den gjeldende fasiten, klikk-verifisert).
6. **Ekstern lagring og publisering:** push, PR, merge og deploy følger brukerens gjeldende autorisasjon. Denne skillen gir ikke i seg selv tillatelse til slike handlinger. Fullfør autorisert lokalt arbeid og rapporter konkret hva som er kontrollert før en eventuell nødvendig publiseringsbeslutning.
7. **Oppsummer på norsk:** skill lokal bygg/test, CI, visuell vurdering og faktisk produksjonskontroll. Ikke oppgi CI eller preview som bestått uten en tilgjengelig kjøring/lenke. Ingen designversjon er automatisk valgt fordi testen er grønn.

Ved designarbeid gjelder Anders' siste beskjed og `designsystem/README.md` foran historiske Train-lock-låser. Bruk en navngitt valgt referanse for pikselkontroll, med dokumentert bredde, tema, data og gjengivelsesmiljø. Målrettede kontroller i et syntetisk oppsett er ikke en ende-til-ende-test mot ekte database eller betaling.

## Hurtigvarianter

- Kun typer + lint (rask iterasjon): `npx tsc --noEmit && npx eslint --quiet src`
- Én testfil: `npx tsx --conditions=react-server --experimental-test-module-mocks --test <fil>`
- Full gate er OBLIGATORISK før commit uansett hvor liten endringen føles.

## Aldri

- Aldri push til main. Aldri `--force` / `reset --hard` uten å spørre Anders.
- Aldri utvid hex-baseline eller legg til eslint-disable for å «komme forbi» gaten.
- Aldri hopp over `npm run build` — Turbopack/Serwist-feil synes først der.
