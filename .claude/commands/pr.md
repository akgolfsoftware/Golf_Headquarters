---
description: Kjører verify:static og tester lokalt (bygg går i CI), skriver PR-tittel og beskrivelse etter malen, åpner PR
---

Gjør klar og åpne en pull request for gjeldende branch.

1. Kjør `git status -sb && git diff origin/main..HEAD --stat` i ETT kall — bekreft at alt relevant er committet. Hvis ikke, list uncommitted endringer og spør Anders om de skal committes.
2. Kjør `npm run verify:static` og `npm test` lokalt (typer, lint, vakter, tester). Er begge grønne på samme commit fra forrige kjøring i økta, hopp over dem. Ikke kjør `npm run build` lokalt og ikke hele `npm run verify`: CI (`.github/workflows/ci.yml`) kjører full `npm run verify` inkludert bygg på hver PR, så et lokalt bygg er dobbeltarbeid. Rører endringen bare dokumenter/mapper: kjør bare `npm run prosjekt:sjekk`. Feiler noe: stopp og rapporter, ikke fortsett til PR. Kjør kommandoene til fil og les bare halen.
3. Har `prisma/schema.prisma` blitt endret i denne branchen: bekreft at endringen er gjort som kirurgisk `db execute`-script (se `.claude/rules/gotchas.md` §Schema-endringer) og committet — ikke via `prisma migrate dev`/`db push`, begge er blokkert i dette repoet.
4. Ikke les full diff eller hele loggen — du kjenner endringen fra økta; stat-listen fra steg 1 er nok.
5. Skriv PR-tittel som `type(scope): kort beskrivelse` (feat/fix/chore/refactor/docs).
6. Skriv PR-beskrivelse etter denne malen:

```markdown
## Hva og hvorfor
[Maks 3 linjer]

## Testet
- [ ] verify:static og npm test grønt lokalt (full verify + bygg kjører i CI)
- [ ] Sjekket lys OG mørk modus (hvis UI)
- [ ] Sjekket mobil 390px OG desktop (hvis UI)
- [ ] Databaseendring verifisert (hvis skjemaendring)

## Skjermbilder
[Kun hvis UI-endring — ett bilde mobil 390px og ett desktop, lys modus; natt bare hvis endringen berører nattema]
```

7. Push branchen: `git push -u origin <branch-navn>`.
8. Åpne PR (bruk GitHub MCP-verktøyet i denne økten, eller `gh pr create --title "..." --body "..."` lokalt).
9. Rapporter PR-lenken og minn om at Vercel preview-URL skal sjekkes før merge. Ikke poll CI/Vercel; sjekk én gang med `gh pr checks` når Anders spør.
10. Legg til én linje i `docs/feillogg.md` (format øverst i filen) hvis noe i denne økten kostet ekstra tid — ellers ikke rør filen.
11. Ikke merge selv, og aldri push til `main` uten Anders' eksplisitte «ja» i samtalen — håndheves også av `.claude/hooks/beskytt.mjs`.
12. Kostnad: PR-steget skal ta under 8 tool-kall. Skjermbilder og målinger tas kun når endringen er UI og de ikke allerede ligger i økta; ett sett (390 lys + 1280 lys), ikke alle tilstander. Beskrivelsen skrives kort (malen over, ingen ekstra seksjoner) og i ett kall. Ingen ekstra gjennomlesing av filer, ingen sub-agenter, ingen ny verify hvis den allerede er grønn på samme commit.
