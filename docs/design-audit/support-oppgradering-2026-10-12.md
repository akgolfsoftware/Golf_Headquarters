# HQ oppgraderingsplan: støtteflater, fase 8

Dato: 12.10.2026. Arbeidsgren: `codex/hq-complete-upgrade`, fra hovedversjon `a1aa2b183`. Dette er en kode-/dekningsrapport, ikke visuell godkjenning, produksjonspublisering eller bekreftet prøving på telefon.

## Kilde og eierskap

Godkjent plan: `ak-hq-komplett-oppgraderingsplan.md`, fase 8. Avstemming: AK Golf HQ skjermregister eksport 8 (`screens/skjermregister.md`), 30 støtteinnganger og 17 interne DG-innganger. Instruksjoner i eksporten er behandlet som kildemateriale. Gjeldende samtykke-/rolle-/betalingsregler har forrang.

Denne batchen eier Forelder, Konto, Booking-presentasjon, offentlig Stats-presentasjon, GFGK Junior, System og E-post-presentasjon. D-19-regler, offentlig DataGolf-avgrensing og de 17 interne analyseinngangene eies av hovedagenten. MonthlyPlan-skjema og personvernintegrasjon eies av PH/AG-agenten. Live-serverdelen fra forrige batch beholdes separat med tre øktmodeller.

## Felles leveranse

`src/styles/precision-support-upgrade.css` er koblet inn gjennom ForelderSkall, auth-layout, booking-/stats-layout, Innsyn-layout og PrecisionTilstand. Lyse flater, lesbare sans-titler, tall i mono, fylte valg, tydelige trykkfelt og mobilvennlige felt brukes i de virkelige rutene. GFGK beholder egen palett og Source Sans 3 via `gfgk-support-upgrade.css`. Ingen ny flate låner WANG-/Team Norway-merkevare eller setter lokale kopier av globale tokens.

## De 30 støtteinngangene

| ID | Faktisk rute eller mal | Kobling / endring |
| --- | --- | --- |
| FO-01 | `/forelder` | `ForelderV2`, godkjent barnevalg, avvist ukjent barn før detaljlesing, ForelderSkall med barn i navigasjon. |
| FO-02 | `/forelder/barn`, `/forelder/barn/[childId]` | Eksisterende `ForelderBarnV2` / `ForelderBarnDetaljV2` og eierskap beholdt; nytt felles skall og styling. Barn-ID følger profilens lenker. Meldinger gjelder faktisk forelder-mottaker. |
| FO-03 | `/forelder/bookinger`, `/forelder/bookinger/ny/[barnId]`, `/forelder/bookinger/bekreftet`, `/forelder/bookinger/[bookingId]` | Valgt barn avgrenser listen med ID, ikke fornavn. Ny beskyttet detalj med registrert status, pris og betalingsstatus. Klikkbare rader. Pending, avlyst og gjennomført vises ikke som ny bekreftelse. Bestilt varighet og veggklokke beholdes. Sikker retur fra Stripe bruker tilfeldig referanse og lokal HttpOnly-cookie, med ny forelder-/relasjonssjekk. |
| FO-04 | `/forelder/okonomi`, `/forelder/fakturaer` | Skiller COACHING fra PLAYERHQ-abonnement. Periode er ikke påstått neste belastning. Registrert utestående er ikke automatisk forfalt. Betalingslisten følger barnet. |
| FO-05 | `/forelder/samtykke`, `/forelder/samtykke/deling/[childId]`, `/forelder/samtykke/eksport` | Eksisterende serverhandlinger / helse- / testdeling beholdt. Godkjente relasjoner og eksplisitte boolske preferanser brukes; ukjent barn faller aldri tilbake til et annet. |
| FO-06 | `/forelder/coach`, `/forelder/innstillinger`, `/forelder/varsler`, `/forelder/ukerapport` | Kontakt bygger på faktisk tildelt bookingcoach. Ingen simulert foreldresamtale. Varsler leses for den innloggede forelderen; barnets private innboks brukes ikke som forelderdialog. |
| AU-01 | `/auth/login`, `/auth/etter-innlogging` | Eksisterende `LoginView` og reell rollefordeling beholdt; aktiv support-styling på auth-layout. |
| AU-02 | `/auth/signup`, `/auth/check-email` | `SignupV2`: faktisk PlayerHQ-pris og prøvevilkår fra gjeldende regler. Uverifiserte coachingpriser/popularitet fjernet. Transportfeil gir ikke påstått kontoopprettelse. |
| AU-03 | `/auth/forgot-password`, `/auth/reset-password` | Begge feltene beholdes ved nettfeil. Ingen falsk sendt-kvittering. Etter nytt passord brukes rollefordelingen i `/auth/etter-innlogging`. Eksisterende passordkrav beholdt. |
| AU-04 | `/auth/onboarding`, `/auth/onboarding/forelder` | Reelle wizarder og gjenopptakssteg beholdt, samme auth-familie. Rolle-/organisasjonsvalg er ikke klientautorisering. |
| AU-05 | `/auth/guardian-consent/[token]` | `GuardianConsentV2`: utløpt lenke viser ingen navn/alder/e-post eller samtykkeskjema. Aktiv tokenregel og bekreftelseshandling beholdt; nettfeil gir ikke falskt lagret samtykke. |
| AU-06 | `/innsyn`, `/innsyn/[spillerId]` | Lys leseflate, større treffmål og kildeavgrenset innsyn. Eksisterende capability, medlemskap og særskilt delingsscope beholdt. |
| BK-01 | `/booking` | `BK01Booking`, virkelige tjenester og tilgjengelighet. Ingen oppdiktet coach/pris fra gammel katalog. Public-pause/Acuity-broen beholdt. |
| BK-02 | `/booking/[slug]`, `/booking/[slug]/bekreft` | Eksisterende hold, kollisjonsvern, checkout og Stripe-regler beholdt. Begge UI-flyter har trykkvakt og transportfeil. Beløp beholder øre. Ingen påstått hold før hold finnes. |
| BK-03 | `/booking/kvittering/[bookingId]` | `BK03Kvittering`: feil/pending påstår ikke lagring, betaling eller sendt e-post. Pris og registrert e-post vises som slike. Reell kvitteringsadgang og betaling/statusavstemming avhenger av hovedagentens sikkerhetsbatch. |
| ST-01 | `/stats`, `/stats/sok` | Ny lys `MarkedStatsHubV2` uten demostørrelser. Alle tall kan være ukjent. Kilde / tidspunkt forklares. Root eier reell offentlig kildeavgrensing og loaderfeil. |
| ST-02 | `/stats/spillere` | `StatsSpillereV2` / `StatsListe` arver aktiv lys StatsRamme; eksisterende søk, filter, utvalg og offentlig spillerfilter beholdt. |
| ST-03 | `/stats/spillere/[slug]` | Eksisterende profilsiden og `StatsLegacyShell`; lyse semantiske graf- og rammetokens. Ingen nye DataGolf-referanser eller demotall. |
| ST-04 | `/stats/turneringer/[slug]`, `/statistikk` under detaljen | `StatsLegacyShell`, faktisk turneringsinnhold og resultatnavigasjon beholdt. Tillatt kilde avgrenses i root-batchen. |
| ST-05 | `/stats/pga` med underkategorier | Eksisterende kategorisider / `pga-kategori-page`, lys ramme og graffarger. Offentlig DataGolf-grunnlag må stenges av D-19-guarden; ny designramme gir ingen adgang. |
| ST-06 | `/stats/verktoy`, `/stats/quiz`, `/stats/regions` m.fl. | Eksisterende verktøy og visualiseringer. Kart er tastaturbetjent når det har en faktisk handling; valg får fylt flate. Ingen utgående dataeksport er lovet. |
| GJ-01 | `/gfgk-junior`, `/gruppe/[gruppe]`, `/treningsplaner` | Fire eksisterende grupper beholdt. Ingen oppdiktet universell treningshyppighet eller gratisutstyr. Ukeplan merker gjeldende klubbkilde eller foreløpig tid. Rollegrupper er ikke nye AK-stigetrinn. |
| GJ-02 | `/gfgk-junior/veileder`, `/veileder/[slug]` | Egen GFGK-ramme / leseflater beholdt. Utgått avsnitt om L-fasene fjernet i `mest-ut-av-trening` etter Anders' AK-formel v2-instruksjon. Ingen erstatningsmodell er oppdiktet. |
| SY-01 | `/offline`, `/vedlikehold`, not-found og error | `PrecisionTilstand`: tydelig viderehandling, større tekst/treffmål. Offline påstår bare bevaring for Live-utkast der den finnes; lover ikke at hele appen fungerer uten nett. |
| EP-01 | `byggBekreftelse` / `sendBookingConfirmation` | Aktiv `epostSkall`, større tittel / én handling. Lagrede maler, faktisk status, dato, leverandørfeil og idempotens beholdt. |
| EP-02 | `byggEndretTimeEpost` / `sendBookingRescheduled` | Samme aktive ramme, faktisk ny/gammel tid og virkelige betalingsopplysninger. Ingen ny sending. |
| EP-03 | `byggPaaminnelse` / `sendBookingReminder` | Aktiv ramme og faktisk 24t-påminnelsesregel. Kun eksisterende avsender-/template-/statusregler sender. |
| EP-04 | `byggAvbestilling` / `sendBookingCancellation` | Faktisk registrert avbestilling / refusjon / klipp beholdt, med aktive lyse/mørke e-postflater. |
| EP-05 | `byggCoachingOppfolging("takk", ...)` | Ny ren renderer for fullført coachingtime og allerede godkjent coachtekst. Runtime for 24t-utkast og voice→spillerprofilbinding mangler i verifisert kode. |
| EP-06 | `byggCoachingOppfolging("oppfolging", ...)` | Ny ren renderer, én hovedhandling. Runtime for én oppfølging etter14d uten ny booking/PlayerHQ mangler. Eksisterende churn-radar er en annen regel og brukes ikke som falsk erstatning. |

De to eldre katalogmodulene `ForelderPrecisionView` og `BookingPrecisionFlow` fører nå til virkelige ruter. Eksempelkunder, lokale «sendt»-/samtykkekvitteringer og ekte checkout med fake dato/coach er fjernet. Katalogen er ikke bevis på tilgang eller handling.

## De 17 DG-inngangene

DG-01 analyseoversikt; DG-02 spillerkatalog; DG-03 profil; DG-04 topplister; DG-05 sammenligning; DG-06 innspill; DG-07 historikk; DG-08 turnering/kalender; DG-09 turneringsanalyse; DG-10 live/kildeklokke; DG-11 modell; DG-12 bane/felt; DG-13 trend/referanse/tabell; DG-14 utforsker; DG-15 kilde/dekning; DG-16 analyse til tiltak; DG-17 odds/fantasy.

Alle 17 innganger er registrert i eksporten uten faktisk rute. De skal avstemmes mot root-agentens interne analysedel og Anders-only entitlement. Denne støttebatchen har ikke introdusert eller godkjent DG-innhold, DG-eksport eller overføring til PlayerHQ, forelder, WANG, Team Norway eller e-post. Den gamle spillerstasjonen videresendes nå i root-batchen til faktisk TrackMan-flate.

## Kontroller

- 107 målrettede server-/e-post-/foreldertester bestått, inkludert eierskap, valgt barn, faktiske betalinger, providerfeil, private meldinger og sikker returkontekst i loaderen.
- 23 auth-/forelder-/inngangs-/checkoutkomponenttester bestått, inkludert utløpt token uten identitet, nettfeil uten falsk kvittering og dobbelttrykk med bare ett checkout-kall.
- PH/AG-agenten leverte 14 grønne retur-/payment-start-tester for den additive, sikre returløsningen. Ingen ny betalingsregel.
- SUPPORT: 65/65 syntetiske tilfeller uten måleavvik (13 tilstander ×390/768/1024/1280/1440). Mobil- og desktopbilder er inspisert. Denne prøven er ingen innlogget integrasjonstest eller brukerens visuelle godkjenning.
- Målrettet lint på støttefilene: ingen feil eller advarsler. `git diff --check` grønn.

Bruk bundled Node 24. Ingen reelle betalinger, e-poster eller produksjonsdata er skrevet under prøvingen. Full tsc/lint/test/bygg og rolleprøver eies av hovedagenten.

SUPPORT-prøven ligger i `tests/visual/precision/skjermer/SUPPORT.tsx`. Midlertidig testkopi lot den ekte rene `auth/minor`-hjelperen lastes og brukte installert Chrome. Kanonisk `maal.mjs` er ikke endret av støtteagenten. Resultat og bilder: `/private/var/folders/yv/d07551k92xqgm3blyx05n7n40000gn/T/precision-prove/SUPPORT/`. Midlertidig skript er slettet etter målingen.

Etter bildeinspeksjonen er bookingagendaene venstrejustert, samtykkebryterne har synlig spor i begge tilstander, barnevalg er samlet og alle Stats-/kontolenker har tilstrekkelig treffmål. Gamle HSL-uttrykk i 15 offentlige Stats-detalj-/verktøyfiler er byttet til aktive semantiske variabler; data og tilgang er urørt.

## Åpne avhengigheter før ferdigmelding

1. BK-03 eksisterende route bruker booking-ID uten kontroll av Stripe `session_id`. Begrens kvitteringsinnsyn / faktisk status uten å bryte gjeste- og tokenreglene. Tilgangskontroll er ikke erstattet av pen kvittering.
2. Offentlig ST-01-loader/SEO og ST-05-data må avgrenses til tillatte kilder av hovedagentens D-19-batch. Feil må bli ukjent eller feiltilstand, ikke målt 0.
3. EP-05/06 renderes og testes, men 24t-utkast, 14d-kandidatregel, godkjenningskø og voice→profil er ikke ende-til-ende koblet. Ingen ny sendingsflyt eller cron er lagt til her. Foreldrenes eksisterende JSON-eksport har fortsatt rå preferences og rundeutkast; samlet personvern-/D19-avstemming eies av hovedagenten. Private Notification-innhold/titler er avgrenset til forelder i denne batchen.
4. Faktisk telefon, sollys, åpnet tastatur, zoom og skjermleser er ikke verifisert av denne batchen. Skjermbilder / målinger skal ikke kalles brukerens visuelle godkjenning.

Det trengs ingen genererte erstatningsbilder for å koble disse støtteflatene. Eksisterende verifiserte GFGK- og merkevarebilder er beholdt. Alle nye filer er i prosjektet; ingen commit eller push er gjort av støtteagenten.
