---
description: Kjører npm run verify lokalt, skriver PR-tittel og beskrivelse etter malen, åpner PR
---

Gjør klar og åpne en pull request for gjeldende branch. Regelen er skrevet for lavt forbruk: færre lesinger, ingen gjentatte kjøringer, kort tekst.

1. Kjør `git status` — bekreft at alt relevant er committet. Hvis ikke, list uncommitted endringer og spør Anders om de skal committes.
2. Kjør `npm run verify` bare hvis den ikke allerede er grønn på nøyaktig denne commit-en i denne økten (`git rev-parse HEAD` samme som ved siste grønne kjøring, og ingen endringer siden). Aldri kjør den to ganger på samme commit. Send utdata til fil og les bare halen (`> /tmp/verify.log 2>&1; tail -30 /tmp/verify.log`), aldri hele loggen. Den dekker `prisma validate`, `prisma generate`, `tsc --noEmit`, `eslint`, `check-action-auth`, `check-token-gap` og `npm run build`) — men bare hvis den ikke allerede er grønn på nøyaktig denne commiten i denne økten. Redirect utdata til fil og les bare halen. Hvis noe feiler: stopp, rapporter feilen, ikke fortsett til PR. Kun dokumentendringer (`*.md`, `docs/`, `.claude/`): kjør `npm run prosjekt:sjekk` i stedet for hele verify.
3. Har `prisma/schema.prisma` blitt endret i denne branchen: bekreft at endringen er gjort som kirurgisk `db execute`-script (se `.claude/rules/gotchas.md` §Schema-endringer) og committet — ikke via `prisma migrate dev`/`db push`, begge er blokkert i dette repoet.
4. Kjør `git log --oneline origin/main..HEAD` og `git diff origin/main..HEAD --stat`. Les aldri hele diffen på nytt — du skrev den selv; åpne bare enkeltfiler hvis noe er uklart.
5. Skriv PR-tittel som `type(scope): kort beskrivelse` (feat/fix/chore/refactor/docs).
6. Skriv PR-beskrivelse etter denne malen. Hold den kort (maks ca. 15 linjer): ett–to avsnitt per felt, kryss bare av det som faktisk er kjørt, og utelat felt som ikke gjelder. Ikke gjengi diffen eller filliste:

Hold beskrivelsen kort (maks ca. 15 linjer) og skriv den ferdig i ett steg. Ikke omskriv den.

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
8. Åpne PR med `gh pr create --title "..." --body "..."` (billigere enn GitHub MCP). Ett kall, ikke les svaret på nytt.
9. Rapporter PR-lenken. Ikke poll CI eller Vercel (`actions_list`/`actions_get` gir enorme svar); hent forhåndslenken med ett `gh pr checks` når Anders ber om den, ellers minn om at den skal sjekkes før merge. Ikke poll CI eller Vercel i løkke: gjør én sjekk med `gh pr checks <nr>` og stopp. Fortsett økten uten å vente.
10. Legg til én linje i `docs/feillogg.md` (format øverst i filen) hvis noe i denne økten kostet ekstra tid — ellers ikke rør filen.
11. Ikke kjør ekstra kontroller, subagenter eller gjennomgangsrunder etter at verify er grønn med mindre Anders ber om det.
12. Ikke merge selv, og aldri push til `main` uten Anders' eksplisitte «ja» i samtalen — håndheves også av `.claude/hooks/beskytt.mjs`.
