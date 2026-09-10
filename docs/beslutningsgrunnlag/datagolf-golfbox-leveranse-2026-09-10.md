# DataGolf og GolfBox – leveransegrunnlag 10.09.2026

Bestilling: fullfør spillerverktøyet med DataGolf og GolfBox-turneringsresultater, og legg det i `main`. Arbeidet er isolert på `codex/datagolf-golfbox-complete`, med `origin/main` ved `a619ec5df` som grunnlag. Andre sesjoners endringer i hovedarbeidsmappen er beholdt der.

## Funksjon

- Spilleren søker etter proffer, ser ferdighetsprofil og faktiske brutto runder, sammenligner egne målinger og utforsker seks dokumenterte innspillsintervaller. Se [spillerverktøyet](../planer/datagolf-spillerverktoy-2026-09-10.md) og [designprompten](../design-system/datagolf-claude-design-prompt-2026-09-10.md).
- GolfBox-resultater vises i DataGolf, egen turneringsanalyse og turneringsdetaljen. Felles historikk gir sesongfilter, søk, flere resultater, klasse, status, brutto sum, runder, faktiske hullantall, score mot par, hentedato og arrangørlenke. Egne registrerte starter beholdes uten duplikater.
- Komplette 18-hullsrunder fra GolfBox kan gi spillerens eget brutto rundesnitt når egne registrerte fullrunder mangler. Det legges ikke til antatte fairway- eller greentreff. Brutto på ulike baner er beskrivende, ikke et justert ferdighetsgap.
- Ti-ballutfordringer lagres med eierskapskontroll og beskyttelse mot dobbeltlagring. Feil kan rettes og lagring forsøkes på nytt. Historikken viser sammenlignbare treningsforsøk.

## Resultatkjeden

GolfBox-formatet er kontrollert mot offentlige svar 10.09.2026. `ResultSum.ActualText` og faktisk hullscore er brutto slag; `ActualValue` på rundesummen er skalert. Poengspill og nettoklasseplassering brukes ikke som brutto. Kilden må dokumentere fullføringen. Manglende fremtidige runder beholder rundenummer og tomme verdier.

- Alle individuelle klasser hentes, lag og anonymiserte oppføringer utelates. Bruttovisning prioriteres når samme spiller står i flere klasser. Manglende klasser merkes som delvis import.
- Spilleroppslag avviser motstridende fødselsår og land. Ulike ISO-landkoder normaliseres. Eksisterende brukeroppkobling og tilgangskontroll beholdes; slettede/anonymiserte brukere speiles ikke.
- Kalenderen identifiserer turneringer med kilde-ID. Navneendring lager ikke ny turnering og kalenderhenting oppdaterer ikke resultatets hentedato.
- Deltakelse, runder og brukerens resultat lagres i én transaksjon per spiller. Kildekorrigering erstatter bare runder for samme deltakelse og kilde. Bruttofeltet i `TournamentResult` mottar aldri score mot par.
- Tomme eller feilende kildesvar beholder eksisterende resultatdata. Andre turneringer fortsetter ved feil. Forsøk og delvis dekning registreres som metadata i eksisterende snapshot, uten rå persondata.
- Eksisterende jobb tar pågående og nylige turneringer, samt inntil 60 eldre turneringer per kjøring. Eldre resultatuttak roteres etter eldste forsøk og kontrolleres på nytt etter sju dager. Mislykkede kilder gir feilstatus i jobben.
- «Min kurve» bruker dokumenterte komplette 18-hullsrunder. Den beregner ikke lenger en antatt lik parverdi for alle runder. Spredningen krever faktisk score mot par per runde.

## Målt datastatus før utrulling

Lesekontroll mot den kanoniske Golf_Headquarters-basen (`dcnxoztjtdqoidaekxry`). Kun aggregerte tall og kildeformat er brukt i rapporten.

| Måling | Resultat |
|---|---|
| `dashboard.dg_rounds` | 1 306 489 runder |
| Nyeste DataGolf-turneringsdato | 06.09.2026 |
| Nyeste DataGolf-rundeimport | 08.09.2026 kl. 10:48 UTC |
| GOLFBOX-oppføringer / med brutto totalscore | 58 245 / 0 |
| NM / Norgescup / Olyo / Østlands / Regiontour med brutto totalscore | 0 i alle fem kildegrupper |
| Srixon-oppføringer / med brutto totalscore | 8 768 / 39 |

Tallene forklarer behovet for ny materialisering. De er et datert førbilde, ikke en påstand om at historikken allerede er reparert i produksjon. GolfBox-utvalget utelater sammenslåtte turneringsdubletter.

## Verifikasjon og grenser

- `npm test`: **2 188 funksjonstester + 3 komponenttester, alle grønne** på den isolerte leveransegrenen. Tester dekker blant annet reelt kildeformat med syntetiske verdier, brutto mot netto, delvise runder, klassefeil, korrigering, spilleridentitet, brukeravgrensning, deduplisering, dato ved årsskifte og lagringsfeil.
- Ny parser kjørt mot to offentlige GolfBox-turneringer: 78 og 84 deltakelser, henholdsvis 230 og 164 fullførte brutto runder, ingen mislykkede klasser. Bare aggregerte antall ble skrevet ut; ingen resultatdata ble lagret i databasen.
- Nettleser: faktiske React-komponenter med syntetiske data på 390 og 1280 px, lyst/mørkt, samt tomme/feiltilstander på 320 px. Sammenligning, historikkfilter, 20→25 rader, rundedetaljer, innspill og lagring med feil/retry bestått uten JavaScript-feil eller horisontal sideflyt.
- Nettleserriggen simulerer navigasjon og serverhandlinger. Full app med innlogget produksjonsbruker og reell databaseskriving er ikke kjørt. Lokale bevis: `/tmp/datagolf-golfbox-preview/`. Ingen skjermbilder eller persondata legges i Git.
- Full `npm run verify`: **grønn**, inkludert TypeScript, ESLint, tilgangs-/import-/design-/dokumentkontroller, Next.js-produksjonsbygg og Serwist. Bygget brukte dummyverdier uten produksjonsnøkler. Den eksisterende kontrastmålingen rapporterer fortsatt 12 kjente kombinasjoner; dette er ikke en samlet tilgjengelighetsgodkjenning. Leveransegrenens `package.json` har dokumentkontroll i `verify`; `prosjekt:sjekk` finnes bare i den andre sesjonens nyere prosjektomorganisering og er derfor ikke lagt inn her.
- Ingen databaseskjema, tilgangsregler, miljøverdier eller produksjonsoppsett er endret. Ingen manuell produksjonsimport er kjørt. Ny kildedekning krever at ordinær synk kjører på den leverte koden; eldre rader får ikke et oppdiktet fullføringsbevis i mellomtiden.
- Dagens komponenter er brukt som arbeidsgrunnlag. Anders reviderer skjermene i Claude Design; visuell godkjenning mot en ny valgt versjon gjenstår. Dette er funksjonsleveranse og kildekontroll, ikke endelig designgodkjenning.

Kilder: [DataGolf API](https://datagolf.com/api-access), [DataGolf rådata](https://datagolf.com/raw-data-notes), [GolfBox offentlig resultatvisning](https://scores.golfbox.dk/).
