# Kontroll av tilgang, AI-grense og importenheter

Oppdatert 11.09.2026. Kontrollen gjelder samlingsgrenen `codex/arbeidsdeling-ao-trackman-2026-09-11`. Den dokumenterer kode- og testbevis før GitHub-review; fletting og publisert kontroll registreres separat.

## Resultat

| Område | Bygget og prøvd | Åpen grense |
|---|---|---|
| Abonnementshenting · R-H | Alle tre tilgangsoppslag må lykkes og valideres. Driftsfeil gir en nøytral feil med nytt forsøk i stedet for betalingskrav, tomt abonnement eller delvis utvidet tilgang. | Ingen virkelig database-, betalings- eller innlogget produksjonsprøve inngår. |
| TrackMan-enheter · R-D | Eksplisitt mph/m/s og yard/meter bevares gjennom importen. Carry holdes adskilt fra total. Ugyldig eksplisitt enhet blir ukjent. Forhåndsvisning, lagring og stabilitetsberegning skal bruke samme normaliserte tall. | Eldre kilder uten enhetsmerking bruker fortsatt den dokumenterte arveregelen og kan være tvetydige. |
| Caddie-tilgang · R-A | Søk kombinerer tekst og tillatt spillerområde. Direkte spiller-, økt-, statistikk- og rundeoppslag kontrollerer ressursen. Godkjenningsutkast bindes til bruker, samtale, verktøykall og verktøynavn, tas én gang og kontrolleres igjen ved utføring. | Dagens Caddie- og MCP-innganger er begrenset til administratorrollen; dette beviser ikke en egen ordinær coachinngang. |
| Caddie-dataminimering · R-B | Kjente identiteter erstattes med stabile pseudonymer før eksternt modellkall. Kontaktdata, interne referanser, frie databasefelt og klientlevert verktøyhistorikk sendes ikke som modellgrunnlag. | Regex-basert maskering beviser ikke at vilkårlig fritekst er fri for persondata. Ukjente stavemåter og andre ustrukturerte identifikatorer krever en strengere produktgrense før fri tekst kan erklæres trygg. |
| Privat lokal lagring · R-C | IndexedDB, localStorage og sessionStorage avgrenses til serververifisert bruker. Autentiserte sider og Next-data går bare til nettverk. Dobbel lagringsfeil gir et vedvarende varsel. | Eldre eierløse data beholdes urørt og leses ikke automatisk. Ekte innlogget ende-til-ende-kontroll gjenstår. [Detaljert kontroll](../design-audit/lokal-lagring-personvern-2026-09-11.md). |

## Avgrensninger som følger videre

- Referansekartet for Caddie/MCP ligger i prosessen per administrator i 15 minutter. Etter utløp eller ny prosess må ressursen søkes opp igjen.
- AgencyOS-køene i `src/lib/admin/ko/last-godkjenninger.ts` og `src/lib/admin/innboks-saker.ts` må få samme eiergrense før administratorer bare ser utkast de faktisk kan godkjenne.
- Kontrollene brukte syntetiske data. Ingen ekstern AI, melding, betaling, import mot virkelig database, migrasjon eller produksjonsendring ble kjørt.

## Samlet lokal kontroll

- 90 målrettede integrasjonstester bestod uten hoppede tilfeller.
- Hele testpakken bestod med 2 424 enhetstester og fire komponenttester.
- Full `npm run verify` bestod med typesjekk, streng kodekontroll, prosjektkontroll, 56 raske designvisninger og Next.js/Serwist-produksjonsbygg.
- Dokument- og filregisteret er regenerert etter endringene.

Endelig commit og GitHub-kontroll føres i pull requesten og masterplanen når samlingen er ferdig.
