# Fra designoverlevering til åpen lansering

10.09.2026. Dette er gjennomføringsdetaljer under [gjeldende arbeidsliste](../MASTERPLAN-GJENSTAAENDE.md), ikke et nytt eller redusert lanseringsomfang. Anders ønsker komplett app med booking og betaling før åpen lansering.

**Raskeste forsvarlige vei er å ferdigstille sammenhengende skjermfamilier, mens kode, integrasjoner og driftskontroll går parallelt.** Full designpakke trenger ikke være ferdig før første valgte familie bygges. Ingen bestemt lanseringsdato kan bekreftes før funksjonshull, fagspørsmål og faktiske integrasjoner er kontrollert.

| Trinn | Claude Design / Anders | Codex | Ferdigkriterium |
|---|---|---|---|
| 1. Samordne grunnlaget | Claude retter kilde-/versjonskonflikter og leverer felles komponenter, verdier, ressurser og referanser. Anders velger en konkret versjon for første familie. | Bevarer originaler, kartlegger kobling til eksisterende komponenter og kontrollerer dekning. | Ett entydig grunnlag for bygging, ingen tomme «ferdige» filer eller nye slettingsordre. |
| 2. Spiller og coach | Trening, tester, oppsummering og planlegging leveres som én sammenhengende reise. | Kobler til faktiske data og tilgang, retter beregninger, lagring og publisering, samt porter utseendet. | Samme økt og resultat gjennom hele reisen; avbrutt og feil fungerer; visuell kontroll på valgte formater/temaer. |
| 3. Kunde og booking | Konto, tilbud, tjeneste/coach/sted/tid, pris, betaling og bekreftelse leveres. | Verifiserer eksisterende booking- og betalingsintegrasjon: kollisjoner, valgt coach, ventende/feilet betaling, gjentatte hendelser og administrasjon. | Hel kundereise består i korrekt testmiljø med faktisk integrasjon. Betaling godkjennes først ved bekreftet betalingsstatus, ikke bare retur til en takk-side. |
| 4. Resten av appen | Leverer de resterende familiene i inventaret og dokumenterte mønsterunntak. | Implementerer hver familie, kvalitetssikrer norsk, data, tilgang og feiltilstander. | Ingen uforklarte ruter, manglende brukerfunksjoner eller skjulte designhull. Mønsterarv er kontrollert konkret. |
| 5. Lanseringskontroll | Anders ser de ferdige reisene og velger hva som skal publiseres. | Kjører full bygg/test, nettleserreiser, visuelle differanser og kontroll av mobil, tastatur, feil og ytelse. Kartlegger miljøvariabler, domene, e-postlevering, logging, backup/gjenoppretting og tilbakeføring ved feil. | Ingen åpne blokkerende avvik. Faktiske priser, avtaleinnhold, datatilgang og nødvendige samtykker er avklart i produktet. |
| 6. Publisering | Konkret lanseringsversjon og kjent restliste presenteres for endelig publiseringsbeslutning dersom publisering ikke allerede er autorisert. | Publiserer den godkjente versjonen, kontrollerer innlogging/booking/betaling i drift med avtalt testopplegg og kan tilbakeføre ved alvorlig feil. | Faktiske driftskontroller består; beredskap og ansvar er kjent. |

## Hva som allerede er kontrollert lokalt

Den tekniske grenen har gjennomført `npm run verify`, inkludert produksjonsbygging, med isolerte testverdier. Alle 2 210 automatiserte tester bestod i siste samlede kjøring. Dette er lokalt bevis, ikke CI- eller produksjonsbekreftelse.

Team Norway har ny versjonert registrering med 38 varianter. 27 kan beregnes; 11 tillater råutkast mens faglige regler avklares. Eldre standardregistrering som bruker feil total er avvist. Eldre resultater og sammenligningsgrunnlag er ikke automatisk migrert. Den nye versjonen er ennå ikke fullt koblet til alle coach-tildelinger, talentberegninger og sammenligninger. Dette må inngå i trinn 2 før helheten erklæres ferdig.

Tre nye scorekort er prøvd i lokal nettleser med syntetisk lagringsadapter: manglende putt avvises, fullføring låser feltene, wedge og 8-ball kan fullføres, og 390/1440 px i begge temaer har ingen global horisontal overflyt. Denne prøven er ikke en test mot faktisk database eller en visuell godkjenning av den kommende designversjonen.

## Opplysninger som faktisk mangler

Faglig: gate-poengskalaer og geometri/OK-regler, Putt Speed-måling og enhet, deler av 9 hull lengde og teknikkoppsett. Slike regler kan ikke avgjøres av designverktøyet.

Design: hvilken navngitt familieversjon som er valgt for bygging, samt komplett overlevering av resten. Siste ZIP er kontrollert i [reviewrapporten](../beslutningsgrunnlag/claude-design-zip-2-review-2026-09-10.md).

Drift: produksjonsmiljø og reelle leverandørforløp er ikke bekreftet av denne lokale kjøringen. Ingen produksjonsdatabase er endret, og ingen betaling, e-postutsending, push eller deploy er utført. Nødvendige driftsavklaringer hentes fra eksisterende konfigurasjon og tilgjengelige verktøy før Anders bes om opplysninger.
