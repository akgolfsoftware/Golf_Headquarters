# Workbench Økt – kontroll 21.09.2026

## Grunnlag

- Valgt referanse: `docs/design/workbench-handover/Workbench WB-05-11.dc.html`,
  Økt-varianten i WB-07.
- Implementert rute:
  `/admin/workbench/[playerId]?vis=okt&uke=YYYY-MM-DD&okt=[sessionId]`.
- Datakilde: eksisterende `WorkbenchSession` og `WorkbenchDrill`. Ingen
  databaseskjema, tilgangsregel eller hostet database er endret.
- Testdata: bare syntetisk spiller og syntetiske økter i lokal Supabase på
  loopback.

## Funksjonskontroll

- Økt åpner første aktive økt i valgt uke, eller den eksplisitte økt-ID-en når
  den tilhører den tilgangssikrede uke-lastingen.
- Øktvelgeren beholder uke, spiller og valgt økt i URL-en.
- Alle åtte formelfelt vises for valgt øvelse. Manglende data vises som `—`;
  skjermen finner ikke på verdier.
- En syntetisk øvelse ble opprettet med område, Måte og Målsetning. Ny lasting
  bekreftet at dataene var lagret og ble vist i både hovedflate og inspector.
- Eksisterende, tilgangssikrede handlinger brukes til tid, publisering,
  tilbaketrekking, ny øvelse, rekkefølge og fjerning.
- Desktop og mobil 390 × 844 er kontrollert innlogget. Mobilen viser åtte
  piller og fast «Valgt øvelse»-panel.

## Sikkerhet og personvern

Økt-ruten bruker `loadWeek`, som validerer spillerens tilgang før økter eller
opptattid leses. Alle skriv går via eksisterende serverhandlinger som bruker
`hentMedTilgang` før databasen endres. Den eksplisitte økt-ID-en brukes bare til
å velge blant økter som allerede er returnert for samme spiller og uke.

Ingen hemmeligheter, produksjonsdata, nye logger eller åpne ruter er innført.

## Kontroller

- Målrettet ESLint: bestått uten advarsler.
- `tsc --noEmit`: bestått.
- URL-test for valgt økt: bestått.
- Innlogget desktop og 390 × 844: kontrollert i lokal app.
- Lokal lagring og ny lasting av syntetisk øvelse: bestått.
- Full `npm run verify`: bestått med 3330 tester, fire komponenttester,
  statiske kontroller, TypeScript og produksjonsbygg/Serwist.

Full PNG-sammenstilling mot fasiten er ikke lagret av nettleserverktøyet.
Dette er derfor et fungerende teknisk kontrollpunkt, ikke en visuell
sluttgodkjenning eller produksjonskontroll.
