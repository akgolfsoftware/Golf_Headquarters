# Innlogging: retting av nettlesertestene 01.10.2026

Del av L01 i [lanseringsplanen](../planer/lanseringsplan-2026-10-01.md). Appgrunnlag: main `3d8818238`. Arbeidsgren: `codex/lansering-innlogging-2026-10-01`, basert på planleveransen `e12cf3dbd`.

## Årsak og retting

Produksjonskjøringen [36875104233](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36875104233) hadde 222 beståtte, seks feil og 72 utelatte prøver. Tre tester feilet i hver nettleser fordi de forventet passordfelt og «Glemt passord?» straks siden åpnet. `LoginView` starter med magisk lenke; passordvisningen velges med «Logg inn med passord».

Testene utfører nå dette valget gjennom `selectPasswordLogin`. Hjelpen venter på sidens lastede ressurser før klikk, lukker eventuelt cookie-banner og krever et synlig passordfelt. Samme valg er lagt inn foran alle direkte passordinnlogginger i `tests/e2e`, også de innloggede testene som ellers var utelatt uten testkonto. Ingen testkrav er fjernet, og ingen nye skip er lagt til.

Gjenopprettingsprøven følger lenken, kontrollerer riktig skjema og går tilbake til innlogging. En ny prøve kontrollerer at e-post bevares ved bytte mellom passord og magisk lenke, og at knappen krever utfylte felt. Begge prøves på 390 og 1440 px i Chromium og WebKit. Knappkontrollen undersøker begge innloggingsvisninger.

## Kontroller og avgrensning

| Kontroll | Resultat |
|---|---|
| Uendrede tester mot lokal produksjonsbygg med HTTPS | De samme seks feilene gjenskapt i Chromium og WebKit |
| Rettede og utvidede målrettede prøver | 12 bestått, 0 feil, 0 utelatt |
| Samlet kontroll av auth, offentlige ruter og statisk knappkontroll | 24 bestått, 0 feil, 0 utelatt |
| Rettede målrettede prøver mot publisert `https://akgolf-hq.vercel.app` | 12 bestått, 0 feil, 0 utelatt, uten innlogging eller innsending |
| Playwright registrerer alle testfilene | 306 prøver i 41 filer; listekontroll, ikke 306 utførte prøver |
| Full `npm run verify` før lagring | Bestått: statiske kontroller, 3 876 enhetsprøver, 14 komponentprøver, Next-bygg og Serwist; ingen feil eller utelatte prøver |

Testene kjørte mot egen lokal app på 3077 og HTTPS på 3078, med dummy-tjenester og uten produksjonsmiljøfil. WebKit oppgraderer ressursforespørsler til HTTPS med appens eksisterende sikkerhetshoder, så ren lokal HTTP var ikke et gyldig sammenligningsgrunnlag. Bare den private lokale testkonfigurasjonen godtar det egenutstedte sertifikatet. Sikkerhetshodene er ikke endret. Vedlikehold er slått av bare i denne lokale prosessen (`VEDLIKEHOLD=0`) for å prøve vilkår/personvern; produksjonsoppsettet er urørt.

Kontrollene sendte ingen e-post, innlogging eller betaling. De dokumenterer valg av metode og navigering til gjenoppretting, ikke levering av e-post, Google, kodeverifisering eller full passordtilbakestilling. Innloggede forretningsreiser er fortsatt et eget kontrollpunkt. De 12 målrettede prøvene består også mot publisert app, men hele GitHub-produksjonskjøringen må avleses etter integrasjon; lokal retting lukker ikke hele L01 eller L06.

Lokale logger: `/tmp/ak-hq-login-before-tls-20261001.log`, `/tmp/ak-hq-login-after-tls-20261001.log` og `/tmp/ak-hq-login-regression-20261001.log`. Den målrettede produksjonsprøven ligger i `/tmp/ak-hq-login-prod-20261001.log`; full kvalitetskontroll i `/tmp/ak-hq-login-verify-20261001.log`. Private sertifikater, konfigurasjon og nettleserbilder er gitignorert under `.codex/environments/login-check-2026-10-01/` og `test-results/`.

## Sikkerhet og personvern

Diffen endrer bare tester og dokumentasjon. Ingen rolle-, eier-, samtykke- eller tilgangsregler endres. Bare syntetisk e-post og en syntetisk streng fylles ut; innsendingsknappene klikkes ikke i de nye prøvene. Ingen persondata eller hemmeligheter er lagt i kildekoden eller rapporten. Gjenopprettingssiden kontrolleres uten å sende tilbakestillingslenke. De eksisterende vaktene i appen beholdes.
