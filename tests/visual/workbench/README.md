# Workbench-komponentprøve

Start fra repo-roten med `node tests/visual/workbench/server.mjs`.
Prøven lytter bare på `http://127.0.0.1:5460`. Åpne den gjennom nettleserverktøyet.

Den importerer faktisk `WorkbenchShell`, `WorkbenchUke`, kalenderen og dialogene.
Kun syntetiske personer og økter brukes. Next-ruting er lokal, og alle serverhandlinger
returnerer en synlig feil. Ingen miljøfiler leses og ingen database eller API kobles til.
Dette er bevis for layout, utvalg og feilvisning, ikke for innlogging eller lagring.
`?fixture=empty` viser den tomme uka. `?fixture=slow` forsinker den avviste
serverhandlingen to sekunder for kontroll av lastetilstanden. Standardprøven
har overlapp og skolebånd.

Fontene hentes fra siste lokale Next-bygg. Kjør `npm run build` hvis appens fonter
mangler. Bygde prøvefiler og skjermbilder ligger privat under `/private/tmp/`.

Kontroller 1440 × 880 og 390 × 844 CSS-piksler. Les reelle vindusmål etter at
nettleseren har endret størrelse; normaliser nettleserzoom før kontroll.
Ta skjermbilde med `cua_repl`, og bruk innholdets faktiske filformat.
Noen opptaksverktøy leverer JPEG ved 1×, selv om designeksporten er PNG ved 2×.

```sh
node scripts/workbench-compare.mjs \
  --reference docs/design/workbench-handover/WB-uke-coach-normal-1440.png \
  --actual /private/tmp/ak-hq-workbench-natt-20260920/uke-app-1440-full.jpg \
  --out /private/tmp/ak-hq-workbench-natt-20260920/app-kontroll \
  --scale 1 --reference-scale 2 --label uke-desktop
```

`--reference-scale 2` er en eksplisitt nedskalering til appbildets målestokk.
Rapporten bevarer begge originale filhashene, mål, formater og normaliseringen.
JPEG-komprimering og ulikt innhold påvirker differansen; ingen automatisk visuell
godkjenning gis. Ingen beskjæring eller maskering brukes i sammenligningen.

Prøvens gyldige kalenderdatoer er 14.–20. september 2026, uke 38. Tegningens
«uke 37 / 15.–21. september / 2026» er innbyrdes uforenlig. Domenets datoer og
beregnede volum beholdes korrekte. Formelfelt uten lagrede verdier vises som —.
