---
description: Kjører npm run verify lokalt, skriver PR-tittel og beskrivelse etter malen, åpner PR
---

Gjør klar og åpne en pull request for gjeldende branch.

1. Kjør `git status` — bekreft at alt relevant er committet. Hvis ikke, list uncommitted endringer og spør Anders om de skal committes.
2. Kjør `npm run verify` (tsc, eslint, tester, vakter, build) BARE hvis den ikke allerede er grønn på nøyaktig denne commiten i denne økten (sjekk `git rev-parse HEAD` mot forrige grønne kjøring). Redirect utdata til fil og les bare halen. Feiler noe: stopp, rapporter, ikke fortsett til PR. Kjør aldri verify to ganger på samme commit.
3. Har `prisma/schema.prisma` blitt endret i denne branchen: bekreft at endringen er gjort som kirurgisk `db execute`-script (se `.claude/rules/gotchas.md` §Schema-endringer) og committet — ikke via `prisma migrate dev`/`db push`, begge er blokkert i dette repoet.
4. Les bare `git log --oneline origin/main..HEAD` og `git diff origin/main..HEAD --stat`. Ikke les full diff — du har skrevet endringen selv.
5. Skriv PR-tittel som `type(scope): kort beskrivelse` (feat/fix/chore/refactor/docs).
6. Skriv PR-beskrivelse etter denne malen. Hold den kort (maks ca. 15 linjer); ikke gjenta diffen, bare hva, hvorfor og hva som er testet:

```markdown
## Hva
[Kort — hva denne PR-en gjør]

## Hvorfor
[Hvilket mål/problem den løser]

## Testet
- [ ] npm run verify grønt
- [ ] Sjekket lys OG mørk modus (hvis UI)
- [ ] Sjekket mobil 390px OG desktop (hvis UI)
- [ ] Databaseendring verifisert (hvis skjemaendring)

## Skjermbilder
[Kun hvis UI-endring — mobil 390px først, deretter desktop, lys og mørk, fasit ved siden av]
```

7. Push branchen: `git push -u origin <branch-navn>`.
8. Åpne PR (bruk GitHub MCP-verktøyet i denne økten, eller `gh pr create --title "..." --body "..."` lokalt).
9. Rapporter PR-lenken og minn om at Vercel preview-URL skal sjekkes før merge. Ikke vent på eller poll CI/Vercel i samme økt; stol på webhook-hendelser eller sjekk én gang med `gh pr checks`.
10. Legg til én linje i `docs/feillogg.md` (format øverst i filen) hvis noe i denne økten kostet ekstra tid — ellers ikke rør filen.
11. Ikke merge selv, og aldri push til `main` uten Anders' eksplisitte «ja» i samtalen — håndheves også av `.claude/hooks/beskytt.mjs`.
