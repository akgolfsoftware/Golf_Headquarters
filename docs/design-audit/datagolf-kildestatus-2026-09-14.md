# DataGolf – kildestatus og egne resultater 14.09.2026

## Leveranse

DataGolf skiller nå mellom tilgjengelige referansedata, en vellykket lesing uten treff, manglende referansedatasett og faktisk lesefeil. Klassifiseringen er separat for proffprofiler, valgt proffs runder, sammenligningsproffens runder og egne DataGolf-runder.

Manglende PostgreSQL-tabell/schema (`42P01` / `3F000`) gjenkjennes også inni Prismas `meta.driverAdapterError.cause.originalCode`. Nettverks-, kolonne-, rettighets- og ugyldige kildeformatfeil blir fortsatt feil. Rå feilobjekter/forbindelsesopplysninger sendes ikke til nettleseren eller ny logging.

Spilleren får en forståelig begrensning når proffreferansene ikke er klargjort, og «Prøv igjen» med ventetilstand ved faktisk lesefeil. Vanlig tom rundehistorikk forklares som tomt utvalg, ikke som en feil. Eksisterende innspillreferanser brukes fortsatt som reserve; visningen forklarer at disse ikke inneholder beregnet ferdighetsnivå. Manglende tall forblir null/—.

Uten proffreferanser vises nå egne dokumenterte rundetall, lenke til runderegistrering, turneringshistorikk og lagrede utfordringer. Dette hindrer at tidlig tomvisning skjuler egne resultater. Eksisterende farger, typografi og komponentmønstre er videreført; ingen ny designretning er innført.

## Kontroller

- 8/8 syntetiske tjenestetester bestått: nestede manglende-tabell/schema-feil, transiente feil med vellykket ny lesing, rettigheter/kolonner, tomt utvalg, fungerende datasett, delvis tilgjengelig kilde, bevarte egne resultater/tak og ugyldige rader. Eksisterende lesebegrensning på 50 runder og ID-vakt er kontrollert.
- 3/3 komponentkontroller bestått med faktisk DataGolf-rendering: manglende datasett bevarer egne 72 brutto slag og utfordringsresultat, faktisk feil gir retry, tom kilde gir normal forklaring. Uendret turneringshistorikk-komponent er erstattet i denne isolerte kontrollen; dette er ikke en komplett nettleserreise.
- Målrettet ESLint og `git diff --check` er kjørt. Samlet typekontroll/verify eies av hovedøkten og er ikke gjentatt her.
- Ingen database, eksisterende miljøfil eller kjørende demoserver er endret. Ingen ekte proff- eller spillerdata er hentet/importert. Ingen commit, push eller publisering.

Kjøringer:

```sh
node --import tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/datagolf/player-tool-data.test.ts
node --import tsx --experimental-test-module-mocks --test tests/integration/datagolf-kildestatus.test.ts
node_modules/.bin/eslint src/lib/datagolf/player-tool-data.ts src/lib/datagolf/player-tool-data.test.ts src/components/portal/v2/DataGolfV2.tsx tests/integration/datagolf-kildestatus.test.ts
```

## Gjenstår for full DataGolf-datareise

Koordinatorens lokale tabellkontroll fant at `dashboard.dg_players`, `dg_skill_ratings`, `dg_rounds`, `dg_events` og `dg_round_sg` ikke finnes i den isolerte HQ-basen. Denne endringen importerer eller oppretter dem ikke. Feilvisningen er korrigert; en full referansereise med faktiske data er fortsatt ikke bevist.

Målrettet lesing av `docs/utvikling/lokal-testdatabase.md` og de eksisterende DataGolf-/skjermseed-skriptene fant ingen ferdig syntetisk oppskrift som klargjør disse fem tabellene. `scripts/import-datagolf-progress.ts` skriver til appens tournament/publicPlayer/publicPlayerEntry/publicPlayerRound-modeller, og er ikke en oppskrift for denne dashboard-kilden. `sync-datagolf-tak.ts` gjelder innspillreserven. Disse skriptene er ikke kjørt.

Før en full lokal referanseprøve må et separat, uttrykkelig godkjent lokalt datasett levere:

1. Proffnavn/ID og daterte ferdighetsprofiler med sammenhengende ID-er.
2. Turneringsmetadata og daterte bruttorunder (`score_type = 'brutto'`).
3. Valgfrie SG-rader knyttet til rundene; fravær skal fortsatt vises som manglende målinger.
4. Eventuelle innspillreferanser med gyldige intervaller hvis utfordringsreisen skal prøves.

Deretter må hele proffvalg → sammenligning → resultater → innspill/utfordring kontrolleres i nettleser. Hosted datasett, produksjonsfeilens eventuelle årsak og Vercel-demolenke er ikke undersøkt eller friskmeldt av denne leveransen. Anders sin visuelle godkjenning av endret tom-/feiltilstand er ikke innhentet.
