---
description: Kjører npm run verify lokalt, skriver PR-tittel og beskrivelse etter malen, åpner PR
---

Gjør klar og åpne en pull request for gjeldende branch.

1. Kjør `git status` — bekreft at alt relevant er committet. Hvis ikke, list uncommitted endringer og spør Anders om de skal committes.
2. Kjør `npm run verify` (dekker `prisma validate`, `prisma generate`, `tsc --noEmit`, `eslint`, `check-action-auth`, `check-token-gap` og `npm run build`). Hvis noe feiler: stopp, rapporter feilen, ikke fortsett til PR.
3. Har `prisma/schema.prisma` blitt endret i denne branchen: bekreft at endringen er gjort som kirurgisk `db execute`-script (se `.claude/rules/gotchas.md` §Schema-endringer) og committet — ikke via `prisma migrate dev`/`db push`, begge er blokkert i dette repoet.
4. Se gjennom `git log main..HEAD` og `git diff main..HEAD --stat` for å forstå full endring.
5. Skriv PR-tittel som `type(scope): kort beskrivelse` (feat/fix/chore/refactor/docs).
6. Skriv PR-beskrivelse etter denne malen:

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
9. Rapporter PR-lenken og minn om at Vercel preview-URL skal sjekkes før merge — ikke bare `localhost`.
10. Legg til én linje i `docs/feillogg.md` (format øverst i filen) hvis noe i denne økten kostet ekstra tid — ellers ikke rør filen.
11. Ikke merge selv, og aldri push til `main` uten Anders' eksplisitte «ja» i samtalen — håndheves også av `.claude/hooks/beskytt.mjs`.
