# AK Golf HQ: én sammenhengende datakjede

**Status:** Gjennomføringsplan, ikke ny produktmaster eller godkjenning av database-/tilgangsendringer. [Treningsplanlegging og språk](../treningsplanlegging-og-sprak.md) er fortsatt eneste master for metode, plan og begreper. [Produktreglene](../platform/BUSINESS-RULES.md) styrer tilgang og arbeidsflyt. Dagens kode og tester avgjør hva som faktisk virker.

## Målet

Én spillerreise skal kunne følges uten brudd:

**Mål og tilgjengelighet → årsplan → periodisering → uke → økt/test/turnering → gjennomføring → registrert resultat → kvalitetssikret analyse → trenerbeslutning → justert plan → ny måling.**

Spilleren arbeider i PlayerHQ. Treneren planlegger og godkjenner i AgencyOS/Workbench. Foresatt, WANG, GFGK og Team Norway får bare det innsynet deres rolle og gyldige samtykke tillater. Booking, betaling og drift gjør økter mulig, men er ikke golffaglige prestasjonsdata og skal ikke blandes inn i analysen.

**Ord brukt nedenfor:** Strokes Gained (SG) er slag vunnet eller tapt mot en tydelig navngitt referanse. sRPE er øktbelastning beregnet som minutter × spillerens opplevde anstrengelse. *Spillerbilde* betyr et lite, midlertidig datauttrekk for ett spørsmål, ikke en ny kopi av hele profilen. *Sporbarhet* betyr at et tall eller forslag kan følges tilbake til kilden og beregningen.

## Systemgrensene

| Del | Eier | Ansvar |
|---|---|---|
| AK Golf HQ | Appens databaser og serverlogikk | Spiller, tilgang, plan, økt, resultat, kilde, beregning, beslutning og revisjonsspor. |
| Masterbrain | Separat, versjonert kunnskapskilde | Godkjent metode, begreper, testprotokoller, regler og øvelser. Eier ikke spillernes rådata. |
| Eksterne kilder | UpGame, TrackMan m.fl. | Leverer målinger eller filer. De skriver ikke direkte i plan eller teknisk diagnose. |
| Trener | AgencyOS | Bekrefter hypotese, velger øvelse og godkjenner eller avviser planendring. |
| Spiller | PlayerHQ | Ser planen, registrerer gjennomføring og kan korrigere egne innføringer innen gjeldende tilgang. |

Resten av HQ støtter denne sløyfen uten å eie treningsanalysen: nettsted og booking leder til avtale og kalender; konto og foresattes samtykke åpner riktig tilgang; coachingpakke og betaling styrer tjenesten, ikke faglig score; skole, gruppe og landslag får avgrenset samarbeid og innsyn. En endret booking kan påvirke når en økt kan legges, men betalingsbeløp og private skoleopplysninger skal ikke brukes til å forklare golfresultater.

Masterbrain skal **ikke få fri tilgang til hele HQ-databasen**. En serverbasert, tilgangsstyrt tjeneste bygger et avgrenset *spillerbilde* for ett formål og én periode. Den kombinerer beregnede HQ-data med en kjent versjon av Masterbrain-metoden. Dette er svaret på «hvordan Masterbrain leser HQ»: HQ leser og avgrenser spillerdata; metode- og anbefalingslaget får bare de feltene det trenger. Ingen permanent kopi av hele spillerprofilen legges i Masterbrain-repoet.

## Én flyt fra kilde til ny plan

1. **Innhenting:** Manuell brutto runde, intern slag-for-slag-logg, ekstern SG lagt inn manuelt, UpGame-CSV med hullsummer, TrackMan CSV/HTML/bilde, tester, Live-økt og registrert tid/anstrengelse. Hver post har spiller, kilde, tidspunkt, enhet, rå/normalisert verdi og kobling til runde, test eller økt. UpGame-CSV er ikke live API-synk og gir ikke slagposisjoner.
2. **Kvalitet:** Sjekk format, duplikat, enhet, dato, antall gyldige slag, protokoll/versjon og manglende felt. `null` betyr ukjent, aldri null målt verdi. Vis hva som ble avvist eller må bekreftes manuelt. Bevar originalkilden ved korreksjon.
3. **Beregning:** Bruk deterministiske domenefunksjoner før AI: brutto score, SG med riktig referanse og datagrunnlag, testtrend fra sammenlignbar protokoll, TrackMan per kølle/slagform og spredning, planlagt mot gjennomført tid og sRPE (minutter × opplevd anstrengelse). Ikke beregn SG fra hullsummer alene.
4. **Tolkning:** Lag en observasjon med kilde, antall, periode, metodeversjon og usikkerhet. Masterbrain kan knytte observasjonen til faglige hypoteser og **godkjente** øvelser. Kandidatbanken og fritekst er ikke automatisk anbefalbare. Mental, sosial, taktisk og fysisk kontekst kan påvirke trenerens vurdering, men skal ikke gjøres til automatisk score- eller skadediagnose.
5. **Beslutning:** Et forslag i trenerens eksisterende godkjenningskø viser nøyaktig hva som foreslås endret, hvorfor, datagrunnlag, alternativet «ikke endre», og hvilke økter/uker som berøres. AI foreslår; treneren godkjenner, redigerer eller avviser. Ingen stille publisering eller automatisk teknisk diagnose.
6. **Utførelse og effekt:** Godkjent endring går gjennom Workbench til spillerens plan. Neste økt, test og runde kobles til beslutningen, slik at coach kan se om tiltaket ble utført og om målingen senere endret seg. Manglende effekt gir ny vurdering, ikke automatisk eskalering.

## Lesekontrakten for Masterbrain-støttet analyse

Et formålsstyrt spillerbilde bør svare med disse **typene**, ikke hele databasetabeller:

| Blokk | Minimum | Skal utelates som standard |
|---|---|---|
| Identitet/tilgang | Intern spillerreferanse, rolle, coach-tilgang og nødvendig samtykkestatus | Navn, e-post, telefon, fødselsdato |
| Plan | Aktiv års-/periode-/ukeplan, mål, neste økter og planstatus | Andre spilleres planer |
| Gjennomføring | Dato, type, planlagte/gjennomførte minutter, anstrengelse og status | Frie private notater |
| Prestasjon | Brutto runder, kildeklassifisert SG, tester med protokoll, TrackMan-sammendrag per kølle | Rå video, rå bildefiler, ubegrenset slaglogg |
| Kvalitet | Antall, tidsvindu, enhet, manglende data og metode-/kildeversjon | Gjetninger om ikke-registrerte verdier |
| Beslutning | Tidligere forslag, trenerens valg og evalueringspunkt | Betaling, faktura, bookingpris |

Tilgang kontrolleres på serveren for **hvert** oppslag, også når AI kaller et verktøy. Eksterne lesere får ikke samme spillerbilde som coachen. Helse og skade er særskilt beskyttet: ingen rå helseopplysninger til ekstern AI; eventuelle belastningshensyn må være et minimert, autorisert signal. Data som sendes til modell, logg og revisjonsspor må ha egen personvernkontroll. Sletting og innsyn må omfatte nye avledede data før de lagres.

## Hva som finnes, og hva som ikke er ferdig

- **Finnes:** Workbench-planlegging, flere aktive øktmodeller, manuelle/interne runder, UpGame-filimport, TrackMan-import og lagrede slag, tester, domeneberegninger, lokale Masterbrain-kunnskapsoppslag, godkjent øvelsesbank og `PlanAction` med proveniens/godkjenning. Caddie har allerede noen tilgangsstyrte leseverktøy for spiller, økter, runder og aggregert statistikk. Dette er deler av kjeden, ikke én ferdig sammenhengende kontrakt.
- **Kjent SG-avvik:** Egen baseline bruker maks 20 runder, mens nærspill/putting krever 24 for «pålitelig» status; de siste fem rundene overlapper dessuten referansen. `round-agent` lager forslag fra 30-dagers SG og fast `-0,5`-grense, ikke fra validert trend mot eget nivå, og setter manglende områdeverdier til 0 i svakhetsgrunnlaget. Dette må ikke omtales som den ønskede beslutningsmetoden.
- **Kjent testavvik:** `test-agent` sammenligner siste test med opptil tre tidligere ved faste prosentgrenser. Planen krever i tillegg kontroll av identisk protokoll, retning på skalaen, forhold og tilstrekkelig serie før et varsel får faglig vekt. Varselterskel og tidsvindu er ikke produktbesluttet.
- **Kjent TrackMan-avvik:** Import, normalisering, spredningsberegning og kobling til teknisk oppgave finnes, men `trackman-agent` kan kode en «fault» fra få Face-to-Path-målinger. Det må behandles som hypotese, ikke diagnose. Den nyere tekniske demovisningen leser ikke lagrede TrackMan-økter.
- **Kjent kunnskapsgap:** `sync:masterbrain` oppdaterer lokale filer, men gjør ikke `rag-corpus` søkbart av seg selv; embedding har en egen flyt. Verifiser faktisk synkversjon, godkjent bank og hvilke agenter som bruker hvilken kunnskapsvei. Ikke anta at «Masterbrain er koblet til» betyr at alle regler og øvelser er aktive.
- **Øktmodell:** `TrainingPlanSession`, `TrainingSessionV2` og `WorkbenchSession` sameksisterer. Følg den bestilte OW-3-overgangen og test identitet/status gjennom plan → Live → oppsummering; ikke bygg et nytt fjerde øktobjekt.

## Gjennomføringsrekkefølge

| Fase | Oppgave | Ferdig når |
|---|---|---|
| 0. Kart | Lag et faktisk data- og tilgangskart: hver kilde, import, beregning, skjerm, agent og write-path. Registrer hvilke Masterbrain-versjoner som brukes. | Én sporbar syntetisk spillerreise er tegnet fra kilde til planendring, med hull og eiere. Ingen ny lagring ennå. |
| 1. Kvalitet og sikkerhet | Rett SG-vindu/overlapp, manglende-verdi-håndtering, testprotokoll-sammenligning og TrackMan-hypotese. Sperr faglige forslag ved utilstrekkelig grunnlag. | Enhetstester viser både gyldig forslag og «for lite data»; ingen ubegrunnet diagnose eller planforslag. |
| 2. Felles spillerbilde | Bygg én serverbasert, formålsstyrt lesekontrakt over eksisterende data og øktmodeller. Kilde, enhet, tidspunkt, antall og tilgang følger hvert felt. | Samme tall og status vises i PlayerHQ, AgencyOS og analysetjenesten; kryss-spiller-tilgang avvises i tester. |
| 3. Fagbro | Versjoner Masterbrain-synk og godkjent øvelsesbank; hent bare relevante kunnskapsblokker per analyse. Forslag får proveniens: datarader, regel, metodeversjon og forventet effekt. | En syntetisk analyse kan forklares og reproduseres uten at AI leser rå database eller finner på drill. |
| 4. Beslutning og visning | Én Analyse-flate med faner for runder/SG, tester, TrackMan, belastning og datagrunnlag i PlayerHQ/AgencyOS. Planendringer går via eksisterende godkjenningskø og Workbench. | Coach kan følge kilde → observasjon → hypotese → forslag → godkjent uke/økt; spiller ser bare publisert plan. 390 px og desktop kontrollert. |
| 5. Pilot og utrulling | Prøv komplett kjede i isolert testmiljø med syntetiske data: manuell runde, UpGame-CSV, TrackMan, testdag, Live-økt, forslag, coachvalg og retest. Deretter begrenset menneskelig fagkontroll. | Ingen datalekkasje, ingen doble importerte runder, ingen automatisk publisering, korrekt revisjonsspor og forståelig «mangler data»-tilstand. Produksjonsendring krever egen autorisasjon. |

**Første konkrete leveranse:** fase 0 og de fire faglige feilene i fase 1. Da kan resten bygges på et datagrunnlag som faktisk tåler å påvirke treningen. Valg av varselterskel, sammenligningsvindu og hvilke sensitive kontekstsignaler treneren kan se, må tas eksplisitt før fase 3–4 automatiserer forslag.
