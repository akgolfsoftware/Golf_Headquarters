---
description: Kjører npm run verify lokalt, skriver PR-tittel og beskrivelse etter malen, åpner PR
---

Gjør klar og åpne en pull request for gjeldende branch.

Regelen er bygd for lavt forbruk: kjør dyre kontroller én gang, les minst mulig, ikke vent i løkker.

1. Kjør `git status --short` — bekreft at alt relevant er committet. Hvis ikke, list filene og spør Anders.
2. Kjør `npm run verify` ÉN gang, med utdata til fil: `npm run verify > /tmp/verify.log 2>&1; tail -30 /tmp/verify.log`. Les bare halen. Er HEAD uendret siden en grønn verify i denne økten (`git rev-parse HEAD` er den samme), hopp over og skriv «verify grønn på <sha>». Feiler noe: stopp, rapporter, ikke fortsett. Kjør aldri verify på nytt for å «se om det ble grønt» uten en endring.
3. Endret `prisma/schema.prisma`: bekreft kirurgisk `db execute`-script (se `.claude/rules/gotchas.md` §Schema-endringer), aldri `migrate dev`/`db push`.
4. Les bare `git log --oneline origin/main..HEAD` og `git diff --stat origin/main..HEAD`. Ikke les hele diffen — du skrev den selv.
5. PR-tittel: `type(scope): kort beskrivelse` (feat/fix/chore/refactor/docs).
6. PR-beskrivelse etter malen under, kort: 3–6 linjer totalt. Bare avkrysningene du faktisk har kjørt.

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
[Kun hvis UI-endring: ett par (390 px og 1280 px) per endret skjerm. Ikke for tekstendringer, ren logikk eller gjentatte tilstander.]
```

7. Push: `git push -u origin <branch-navn>`. Batch pushene: én push per ferdig oppgave, ikke per commit.
8. Åpne PR med `gh pr create --title "..." --body "..."`.
9. Rapporter PR-lenken i én linje. Vercel-forhåndsvisning: sjekk ÉN gang med `gh pr checks <nr>` når Anders ber om det. Ikke poll `gh run`, `actions_list` eller `actions_get` (enorme svar); stol på webhook-hendelser.
10. Legg til én linje i `docs/feillogg.md` bare hvis noe kostet ekstra tid — ellers ikke rør filen.
11. Ikke merge selv, og aldri push til `main` uten Anders' eksplisitte «ja» — håndheves også av `.claude/hooks/beskytt.mjs`.
