# DataGolf – spillerverktøy

Bestilt av Anders 10.09.2026: Spilleren skal kunne sammenligne seg med proffene og forstå hvor gode de er. Oppfølging: «Fortsett og gjør dette komplett i prosjektet».

Bakgrunn: [dataanalysen](../beslutningsgrunnlag/datagolf-analyse-og-anbefaling-2026-09-10.md) og [målingen](../beslutningsgrunnlag/datagolf-datakontroll-2026-09-10.json).

**Oppfølging samme dag:** GolfBox-resultater er integrert i samme spillerverktøy, turneringshistorikk og turneringsdetalj. [Samlet leveransegrunnlag](../beslutningsgrunnlag/datagolf-golfbox-leveranse-2026-09-10.md) beskriver siste kode, datakontroll, tester og den bestilte innleggingen i main. Testtallene nederst i dette dokumentet gjelder den tidligere DataGolf-kjøringen på et annet lokalt Git-grunnlag.

## Levert funksjon i koden

Kanonisk inngang: `/portal/analysere/datagolf`. Eksisterende tilgang til TALENT beholdes. En spiller trenger ingen egen DataGolf-ID for å utforske proffer eller prøve utfordringer.

| Reise | Implementasjon |
|---|---|
| Velg og søk proff | Siste ferdighetsuttak per spiller fra `dashboard.dg_skill_ratings`. 457 profiler bekreftet med lesespørring 10.09. Ingen duplisering per tour. URL bevarer valgte spillere og rundeutvalg. |
| Forstå proffens nivå | Totalt og fire SG-områder, samme skala på begge sider av null, navn på største relative styrke og dato på modelluttaket. Relative driververdier forklares som yards og prosentpoeng. |
| Meg mot proff | Egne dokumenterte 18-hullsrunder: brutto rundesnitt, fairway- og greentreff. Delvis hullstatistikk er ikke en full rundemåling. Egne DataGolf-runder brukes når egne komplette runder mangler. Antall runder og tidsrom følger verdiene. |
| Proff mot proff | Samme målinger og modellprofil. Modellforskjell krever identisk kildedato. Rå SG-forskjell krever samme turnering, rundenummer og bane. Forskjeller i brutto score på ulike baner fremstilles ikke som et justert nivågap. |
| Innspill | De seks faktiske intervallene, fairway/rough, justert nærhet i meter, SG per slag, greentreff, gode slag og antall slag. Åpne intervaller får ingen oppdiktet øvre grense. |
| Resultater | Faktiske historiske runder, sortert på turneringsdato og rundenummer. Brutto score, mot par, SG og tilgjengelig plassering. Turneringsutvalget kan være avkortet og vises derfor uten gjettet totalscore/sluttstatus. Egne importerte og manuelt registrerte starter beholdes med kilde. |
| Prøv selv | Eksisterende stasjon videreført. Innspillmål bruker kildens intervall uten proporsjonal carry-skalering. Putting/kortspill/tee har tydelig merkede egne treningsregler. |
| Registrer og lagre | Alle ti baller må være registrert. Feiltrykk kan rettes. Lagringsfeil beholder resultatet. Serveren kontrollerer innlogging, eierskap, intervall og gjeldende mål. Forsøks-ID hindrer dobbeltlagring; endret resultat ved samme ID avvises. |
| Egen historikk | Siste 20 utfordringer med proff/kilde, avstand, leie og mål, samt «prøv igjen». Resultatet er en treningsmåling og gir ingen påstand om å ha slått proffen. |

## Datagrunnlag og lagring

- Historiske runder hentes med parametrisert SQL, maksimalt 50 per valgt spiller. Kildens prosentandeler er 0–1; dette er bekreftet med aggregert SQL og konverteres til prosent ved visning. Metadata og numeriske verdier valideres før bruk.
- Ferdighetsprognose, rå turnerings-SG og egne øvrige SG-modeller holdes adskilt. De tidligere kombinasjonene «True SG», «Rest» og et HCP 0–5-felt brukes ikke i spillerverktøyet.
- Detaljerte innspill bruker den eksisterende `datagolf_tak`-pakken. Den tilgjengelige produksjonspakken hadde seks profiler ved analysen. Synken er utvidet til alle spillere med ferdighetsdata, med faktiske bånd fra approach-skill. Profil og bånd oppdateres atomisk per spiller. Tomme API-svar sletter ikke data.
- Feilaktig innspillsynk til oppdiktede nærhetsverdier og `SgBaseline.expectedStrokes` er erstattet av den kanoniske proffreferansesynken. Relative driververdier skrives ikke lenger til absolutte sesongfelt. Automatisk skalering av driver-/hastighetstester fra relative DataGolf-tall er stoppet i koden.
- Utfordringer bruker eksisterende `TrainingPlanSession` og tilhørende logg under en egen arkivert historikkplan for brukeren. Ingen endring i databaseskjema eller spillerens aktive plan. Resultatet er et versjonert, validert objekt i øktloggen.
- Ingen ny synk er kjørt mot produksjon. Historiske feilrader er ikke slettet eller omberegnet i databasen. Nye referanser blir tilgjengelige etter utrulling og ordinær synk; manglende detaljdata vises eksplisitt inntil da.

## Design og kontroll

Dagens DataGolf-komponenter og felles `TL`-designverdier er arbeidsgrunnlag. Dette er en funksjonell videreutvikling, ikke en pikselportering eller en ny bindende designfasit. Ingen nyere Claude Design-versjon er valgt i samtalen. Visuell godkjenning fra Anders gjenstår.

Gjennomført nettleserkontroll av de faktiske React-komponentene i en isolert testrigg med syntetiske data og simulerte navigasjons-/lagringssvar:

- 390 og 1280 piksler, lys og mørk visning: proff mot proff, resultater, innspill, registrering, feiltrykk, lagringsfeil og nytt lagringsforsøk.
- 320 piksler: tom datakilde, kildefeil, søk uten treff og ingen horisontal sideflyt.
- Ingen JavaScript-feil i de fire gjennomgående reisene. Kildesidene og lagringsfunksjonen er prøvd separat med lesespørringer og isolerte funksjonstester.
- Dette er ikke en produksjonstest av en innlogget spiller eller en faktisk skriving til produksjonsdatabasen. Appens komplette skall og ekte serverhandlinger var ikke del av den isolerte nettleserriggen.

Lokale skjermbilder og testvisning ligger i `/tmp/datagolf-preview/`, uten persondata. Spesifikk automatisk testprotokoll ligger der i `ui-results.json`.

Prosjektkontroller fra den første DataGolf-kjøringen 10.09.2026 (historikk):

- 36 relevante DataGolf-tester: grønne, inkludert rådata/ferdighet, intervaller, tomme API-svar, eierskap, dobbeltlagring, endret resultat og lagringsfeil.
- `npm test`: 2 239 tester og 3 komponenttester grønne i en separat kopi uten produksjonsnøkler (2 242 totalt).
- TypeScript, ESLint, tilgangskontroll, importkontroller, farge-/komponentregler og dokumentkontroller: gjennomført. En feil i formatet på komponentens avviksdokumentasjon ble rettet.
- Hele kvalitetskjeden fra `npm run verify` er fullført i den separate kopien. Den siste delen ble kjørt på nytt fra den rettede avvikskontrollen; lokalt Git-grunnlag mot `origin/main` var med. Første forsøk uten nettlesertillatelse/Git-grunnlag var ikke gyldige sluttkontroller.
- Produksjonsbygg med Next.js og Serwist: grønt, uten utrulling. Det er brukt ufarlige testverdier for miljøvariabler.
- Prosjektets kontrastmåling rapporterer fortsatt 12 kjente kombinasjoner i det eksisterende fargesettet; dette er ikke en påstand om full WCAG-godkjenning av appen. Nye sammenligninger bruker lesbare positive og negative tall og semantiske tabelloverskrifter.
- `npm run prosjekt:sjekk` og diffkontroll: grønne. Ingen commit, push, databaseendring eller publisering er utført.

## Kilder

[DataGolf API](https://datagolf.com/api-access), [rådata og dekning](https://datagolf.com/raw-data-notes), [metodeforklaringer](https://datagolf.com/frequently-asked-questions), [innspillsstatistikk](https://datagolf.com/approach-skill).

Hovedfiler: `src/lib/datagolf/player-tool.ts`, `player-tool-data.ts`, `challenge.ts`, `challenge-data.ts`, `src/components/portal/v2/DataGolfV2.tsx` og `StasjonTrainLock.tsx`.
