# Claude Design — DataGolf H2-04, kontroll 10.09.2026

**Konklusjon:** Den nye leveransen gir DataGolf en sammenhengende spillerreise og et konkret visuelt arbeidsgrunnlag. Tre reproduserte feil i referansevalg og lagring må rettes før denne prototypens oppførsel brukes som grunnlag for bygging. Den dekker en ny skjermfamilie; resten av designpakken er i hovedsak uendret. Anders har levert oppdateringen til vurdering, uten å velge den automatisk for implementering eller publisering.

## Kilde og differanse

Vedlegg: `Player HQ Train lock.zip`, SHA-256 `c850e25cd74266d98f44feb2c914fb81839eb48ae8be497a071ab8eda481f158`.

Sammenlignet med ZIP (3), SHA-256 `b952d3350ba28659cbe7b2232b80141208161ce58adb0b73e2746aa996c11012`:

- 527 filer mot 524; tre nye filer, tre endrede, 521 identiske og ingen fjernet.
- Nytt: `H2-04 DataGolf spillerverktoy.dc.html`, tilhørende `standalone-src.dc.html` og pakket standalone-HTML. Dette er tre representasjoner av én ny prototype.
- Endret: `HANDOFF.md`, `SCREEN-INDEX.md` og miniatyrbildet.
- De to lesbare DataGolf-kildefilene har identisk logikk. Den pakkede standalone-filen er brukt i nettleserkontrollen.
- H2-03 v2 er identisk med ZIP (3). Feilene i [forrige testregistreringskontroll](claude-design-zip-3-review-2026-09-10.md) er derfor fortsatt aktuelle.
- H1-registeret er uendret: 478 rader, 193 `venter-design`, 127 `arvet-monster`, 102 `tegnet`, 50 undersøkte videresendinger og seks interne. Registeret dokumenterer dermed ikke oppdatert dekning etter DataGolf-tillegget.
- `SCREEN-INDEX.md` har nå to identiske H2-04-rader, i tillegg til tidligere duplikater. Handoff bruker dessuten H2-04 både om kommende TN-protokoller og om DataGolf; disse trenger forskjellige ID-er.

## Hva som virker i prøvene

Den nye familien dekker DG-01–DG-10: proffvalg, profil, meg mot proff, proff mot proff, innspill, turneringer, oppsett, ti baller, resultat/historikk og forklaringer.

- Søk blant 240 tydelig syntetiske profiler; søk uten treff, tom kilde og kildefeil med nytt forsøk er tilgjengelige. Kildefeil slår av søket og påstår ikke et kjent antall profiler.
- Manglende egne runder beholder proffens tall og viser manglende egen verdi. Valg av 50 runder oppgir faktisk tilgjengelige 12.
- Profilgrafen viser positive og negative SG-verdier på hver sin side av null med samme lengde per enhet og lesbare fortegn. Modellverdier, rundetall og relative drivertall forklares separat.
- Avstand utenfor valgt kildeintervall blokkerer normal start. Tomt, `-1`, `150` og `Infinity` ble avvist i intervallet 91,44–137,16 meter.
- Ti registrerte baller er ikke automatisk lagret. Angre før lagring gir ni registreringer og deaktivert lagreknapp. Simulert lagringsfeil beholder alle ti og ingen historikkrad. Nytt forsøk etter feilen lykkes lokalt.
- Vanlig lagring gir én historikkrad med mål, kilde, avstand og leie. Ingen faktisk serverlagring er prøvd eller levert av prototypen.

## Feil før bygging

| ID | Prioritet | Reproduksjon og funn | Retting |
|---|---|---|---|
| DG-F1 | P1 | Velg Proff A → Innspill → Rough. Visningen sier at intervallet mangler data. Gå til Prøv selv → rough 0,00–137,16 m. Start er likevel tillatt med 6,1 m radius hentet fra **fairway 100–150 yards**. | Samme oppslag må kontrollere proff, leie, intervall og kildedato i innspill, oppsett, gjennomføring og historikk. Manglende referanse må blokkere profføvelsen eller kreve eksplisitt valg av egen regel. |
| DG-F2 | P1 | Registrer ti baller → Lagre forsøket → trykk Angre ball 10 før lagringen avsluttes. Prototypen viser lagret resultat og historikkrad med **ni registrerte baller**. | Lagring må bruke et uforanderlig sett med validerte registreringer. Endringer under lagring må enten sperres eller håndteres som en separat kladd; kontroller antall og referanse før resultat bekreftes. |
| DG-F3 | P1 | Registrer ti baller → Lagre forsøket → oppfrisk siden umiddelbart. Etter gjenåpning står den fast i `lagrer`, har ti registreringer, ingen historikkrad og deaktivert lagreknapp. | Versjoner og valider lokal tilstand. Gjenåpnet, uavklart lagring må kunne avstemmes eller forsøkes igjen uten dobbeltlagring. Lokal kladd og bekreftet lagring trenger hver sin status. |
| DG-F4 | P2 | Proff-mot-proff bruker venstre side for Proff A og høyre for Proff B uansett fortegn. Både +0,70 og −0,20 for A peker mot venstre, mens teksten sier ±2,50-skala. | Bruk en egen felles nullakse med fortegnsriktig retning for begge spillere, eller et tydelig merket sammenligningsdiagram uten påstand om en felles positiv/negativ akse. |
| DG-F5 | P2 | Åpne «Hva betyr SG?». Ingen dialogrolle finnes, fokus blir på åpneren og Escape lukker ikke. | Gi forklarings- og rettedialogene tilgjengelig navn, dialogrolle, fokus inn/ut, fokusbegrensning og Escape. Nummerer de gjentatte valgene i ballkorrigeringen i tilgjengelige navn. |
| DG-F6 | P2 | «Registrer en runde» åpner forklaringen om brutto; «Åpne min turneringskalender» åpner forklaringen om rundeutvalg. | Koble til riktig videre reise eller marker eksplisitt at dette er en simulert utgang. Ikke la en handlingsknapp åpne en annen funksjon. |

DG-F1–F3, dialogatferden og begge feilutgangene er reprodusert med vanlige klikk, feltinntasting og oppfrisking i Chromium. DG-F4 er kontrollert i kildekode og gjengitt skjermbilde. Dette er prototypefunn, ikke nye påstander om feil i produksjonsappen.

Kildeinnganger i `H2-04 DataGolf spillerverktoy.dc.html`: lokal lagring rundt 835, `lagre()` rundt 901, `innData` rundt 950, proff-mot-proff rundt 1085 og oppsettsreferanse rundt 1149. Linjetallene tilhører vedlegget, ikke appkoden.

## Samsvar med appens funksjoner

Prototypens egne nærspillregler er plassholdere som endrer dagens oppgave. [Dagens stasjonskode](../../src/lib/datagolf/stasjon.ts) bruker eksempelvis chip fra 10 meter, på green og ferdig i to slag; prototypen bruker en sirkel med radius to meter og skjuler startavstanden. Lob og bunker endres også fra greentreff til radiusmål. Putting mangler de konkrete startavstandene som dagens kode gir.

Dette er en endring av hva som måles, ikke bare et nytt utseende. Bevar dagens funksjon i designoverleveringen, eller før et konkret forslag til ny fagregel. Plassholderverdier skal ikke presenteres som fastsatte AK-regler. At en regel finnes i koden er heller ikke en ny faglig godkjenning av den.

Ny DataGolf/GolfBox-implementering arbeides med i en separat oppgave. Før bygging må designkontrakten avstemmes mot den ferdige versjonen, særlig egne GolfBox-runder, datakilde per resultat, fullførte 18-hullsrunder, tilgjengelige referanser og lagring. Flere «åpne spørsmål» i handoff kan besvares fra denne koden og trenger ikke bli nye spørsmål til Anders.

## Visuell vurdering og kontrollomfang

Jeg har visuelt sett profil ved 390 px i mørkt tema, oppsett ved 390 px i lyst tema og proff-mot-proff ved 1440 px i lyst tema. Retningen er rolig og lesbar, med tydelig hovedtall og gode store registreringsknapper. Profilens fortegn er tydelige. Mobiloppsettet bruker mye høyde på forklaringer og alle slagvalg; startknappen kommer langt ned. Behold valgt slag og mål synlig, men samle øvrige valg og lengre forklaringer bak tydelige åpne/lukke-kontroller. På desktop bør diagram og tilhørende tall ligge nærmere hverandre.

56 kombinasjoner er målt: sju hovedvisninger × fire bredder (320/390/834/1440) × to temaer. Ingen intern horisontal overflyt ble målt på produktets ramme i disse tilstandene. Produktets innholdsbredde følger valget; ytterbredden er to piksler større på grunn av kanten. Faneraden har egen horisontal scrolling. Målingen er ikke bevis for samtlige dialog-, feil- og lastetilstander eller for global tilgjengelighet.

Kjøringen brukte en separat lokal Chromium med syntetiske data og eksternt nettverk blokkert. Ingen JavaScript-feil oppstod i de prøvde reisene. Ingen ekte spillerdata, server, innlogging, betaling eller produksjon ble brukt. 200 % tekst, skjermleser og fysiske telefoner er ikke prøvd; ingen samlet kontrastgodkjenning er gitt. Skjermbilder og maskinlesbart bevis er lagret privat i denne Codex-oppgavens `design-siste/`, utenfor Git og `public/`.

## Neste leveranse

Bruk [tilbakemeldingen til Claude Design](../design-system/claude-design-datagolf-h2-04-tilbakemelding.md) for å rette denne familien. H2-03-feilene, øvrige TN-protokoller, coach, booking, forelder og resten av den bestilte pakken består som eget arbeid. Den nye DataGolf-prototypen erstatter ikke en samlet lanseringskontroll eller oppgaven med å samle kode i main.
