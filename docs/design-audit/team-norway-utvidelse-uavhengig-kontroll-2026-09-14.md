# Team Norway — uavhengig kontroll av PlayerHQ-utvidelsen

Dato: 14. september 2026. Arbeidsgren: `codex/team-norway-demo-2026-09-14`.

## Omfang og beslutninger

Anders bestilte videre koding av Team Norway mot faktiske PlayerHQ-funksjoner og en komplett prompt til det eksisterende Claude Design-/Claw-prosjektet. Utvidelsen omfatter valgt spiller, testoversikt/testdetaljer/analyse, gruppeanalyse, kalender/Workbench, teknisk plan og evalueringens faktiske grunnlag.

Claw-valget fra 13. september videreføres. Nye tillegg er ikke visuelt godkjent av Anders. Manuelle endringer i Claude Design er ikke rørt. Tilnærmet gratis trenerflater og betalte spillerlisenser er det kommersielle målet; pris, betaler og ny betalingsimplementering er ikke bestemt.

## Kilder og kontrollmiljø

- Faktisk kode og målrettede tester i arbeidsgrenen, kontrollert separat fra kodeøktenes ferdigmeldinger.
- Ny miljøfri appkopi: `.worktrees/codex/tn-utvidelse-lokal-prove-2026-09-14`, lokal port 3013.
- Isolert lokal Auth på 54521 og appdatabase `tn_fullfor_app_20260914` på 54522. Ingen produksjonsdata eller produksjonsskjema er endret.
- To nye syntetiske tekniske planer, én for demospiller A og én for B, klargjort for positive og avviste lagringsprøver. Eksisterende testresultater og demoen på 3012 er bevart.
- Private kjørelogger, testgrunnlag og skjermbilder: `/private/tmp/ak-hq-tn-utvidelse-20260914/`. Ingen passord eller nøkler i denne rapporten.

## Funn under uavhengig kodekontroll

Første implementasjon hadde feil/mangler i primærscore for 8-ball, validering av sammenlignbare resultater, plattformrolle kontra grupperolle, direkte tilgang til annen spillers data, objektbinding ved lagring og kalenderens datogrenser. Rettelser og nye regresjonstester er bestilt i de samme to Claude Code-øktene.

Den første målrettede testen fra Codex stoppet på testverktøyets lokale IPC-sperre, før applikasjonstestene kjørte. Kjøring med Node 24 og `node --import tsx` gjennomførte deretter de daværende 21 spilleroversiktstestene uten feil. Dette er et mellomresultat; endelig samlet kontroll må gjelde den siste koden.

Den nye appkopien manglet først importerbare designfiler. Disse ble kopiert inn. En midlertidig gammel byggcache ble deretter flyttet utenfor appen for å hindre CSS-verktøyet i å skanne binærdata. Innloggingens GET svarte deretter 200. Dette alene er ikke bevis på gjennomført innlogging eller fungerende nye skjermreiser.

## Endelig kontroll

Status: Pågår. Samlet kvalitetskontroll og reelle nettleserreiser registreres her etter at kodeøktene har levert siste retting. Tidligere testdagbevis gjelder den tidligere demoen og skal ikke presenteres som bevis på hele denne utvidelsen.

## Designoverlevering

[Komplett Claude Design-prompt](../planer/claude-design-claw-team-norway-komplett-prompt-2026-09-14.md) er levert som selvstendig kopierbar tekstfil i den private dokumentmappen. Prompten er ikke automatisk sendt til Claude Design.

## Reelle avklaringer som gjenstår

- Separat lagring av evaluering har ingen eksisterende modell/handling. Dagens reise kan vise grunnlag og gå til et faktisk tiltak; den skal ikke påstå at en egen evaluering er lagret.
- Pris og betaler for spillerlisenser er ikke avklart. Eksisterende tilgangsregler beholdes.
- Visuell godkjenning av nye tillegg krever gjennomgang mot valgt Claw-versjon på mobil og desktop.
- Ingen commit, push, merge eller ny publisering inngår i denne kontrollen.
