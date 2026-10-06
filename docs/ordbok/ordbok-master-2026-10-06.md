# Master-ordbok for AK Golf HQ

**Dato:** 06.10.2026 · **Grunnlag:** `main` på commit `9f39c7d44` og grenen `docs/workbench-beskrivelse` · **Gjelder:** alt som vises til spillere, coacher, foreldre, WANG og Team Norway i PlayerHQ og AgencyOS.

Dokumentet er laget ved å lese. Ingen kode er endret. Det skal brukes av designsystemet i Claude Design (`guidelines/treningsplanlegging-master.md`) og av koden.

## Slik leser du ordboken

**Statusene**

- **Fastsatt:** står i fasiten. Fasiten er `docs/treningsplanlegging.md` (kalt **M**), eller en bindende beslutning i `.claude/rules/beslutninger.md` (kalt **B**) som M ikke motsier. AGENTS.md gjør M til eneste master for språk, og B-blokkene er bindende vedtak fra Anders.
- **Funnet:** brukes i kode eller dokumenter, men står ikke i fasiten.
- **Uavklart:** kildene sier forskjellige ting, eller ingen kilde sier det. Uavklarte ord er aldri gjettet. Der det finnes en anbefaling, står den i del D eller E.

**Kildene**

- «M 84» betyr linje 84 i `docs/treningsplanlegging.md`.
- «B 385» betyr linje 385 i `.claude/rules/beslutninger.md`.
- Andre kilder oppgis med fil og linje. «Sett i koden» betyr en fil under `src/` eller `prisma/`.

**Kolonnene i del A**

| Kolonne | Innhold |
|---|---|
| Ord i appen | Skrevet nøyaktig slik det skal stå, med stor eller liten forbokstav |
| Betyr | Én eller to setninger |
| Kort | Forkortelse, og når den kan brukes |
| Ikke bruk | Varianter som er funnet og skal bort |
| Engelsk | Golfbegrep som beholdes på engelsk |
| Enhet | For tall |

**Viktige forbehold**

- `docs/TERMINOLOGI.md` finnes ikke.
- Claude Design-prosjektet kunne ikke åpnes, fordi tilkoblingen avviste innloggingen. Designsystemet er lest fra speilet i `designsystem/precision-athletics/`.

---

## Del A · Begreper

### A1 Treningsmodellen

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Årsplan | Sesongen med perioder, turneringer, tester og samlet mengde. Fra- og til-dato velges fritt | — | Sesongplan (som navn på flaten) | — | timer | M 336, 345–346; B 124–131 | Fastsatt |
| Periode | Et datospenn med fokus, ukevolum, øktbudsjett per akse og periodemål | — | Fase, blokk | — | min per uke | M 337, 385–393 | Fastsatt |
| Måned | Fire til seks uker etter periodens retning. Skal få eget innhold: fokus, målsetninger, timer per akse og evaluering | — | — | — | timer | M 338; B 128 | Fastsatt |
| Uke | Arbeidsflaten der økter opprettes, flyttes, gjentas og publiseres | Uke 41 | Week | — | — | M 339, 397 | Fastsatt |
| Økt | En tidfestet treningsøkt med tid, varighet, pyramide, sted og øvelser. Er utkast til den publiseres | — | Session, workout, treningsøkt i knapper | — | min | M 84, 340, 416–418 | Fastsatt |
| Øvelse | En tellbar del av en økt | — | Drill, driller, drills | — | — | M 93–94, 222, 238 | Fastsatt |
| Øvelsesbank | Samlingen av øvelser man velger fra. Pyramiden velges først | — | Drill-bibliotek, Treningsbank (WANG), Øvelsesbibliotek | — | — | M 93 («øvelsesbibliotek»); B 386 («øvelsesbanken»); `src/components/portal/precision/PH13DrillBank.tsx:131` | Uavklart |
| Treningsblokk | Et datospenn med samme innhold. Er ikke en øvelse | — | — | — | uker | M 267 | Fastsatt |
| Gruppeøkt | Økt som er felles for en gruppe | — | — | — | min | M 402 | Fastsatt |
| Kalenderinnhold | Økt · Gruppeøkt · Skole · Booking · Turnering · Reise · Test · Sjekkpunkt · Helse. Opptatt tid gir bare sammenheng | — | — | — | — | M 401–412 | Fastsatt |
| Workbench | Flaten der planen lages, fra år til økt. Samme motor for spiller og coach | — | Planlegger, CoachHQ | Workbench | — | B §Workbench; M 179 | Fastsatt |
| Velg treningsplan | Valg mellom de fem standardplanene | — | Lag en plan, Planbygger | — | — | M 207 | Fastsatt |
| Standardplan | Weekend Warrior · Klubbspilleren · Junior-aspirant · Konkurransespilleren · Practice like the pros. Kan velges i alle kategorier A–K | — | — | Weekend Warrior, Practice like the pros | — | M 207–209; B 164 | Fastsatt |
| Øktmal | En lagret økt som kan legges inn igjen | — | Mal (alene) | — | — | `src/lib/workbench/wb-actions.ts:1996`; `AG11Workbench.tsx:62` | Funnet |
| Treukerssyklus | Tre uker som gjentas i planen | — | — | — | uker | `src/lib/workbench/treukerssyklus-actions.ts` | Funnet |
| Blokktrening / Variasjonstrening | To treningsmåter. Telling skrives som «1 av 3 øvelser» | — | Repetisjon, Random | — | — | M 266–267, 614–619 | Fastsatt |

### A2 Periodetyper og uketyper

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Grunnperiode | Bygge kapasitet, teknisk grunnlag og treningsvaner | GRUNN (bare kode) | Grunn (alene i UI), Basisperiode | — | — | M 370–377; B 429–436 | Fastsatt |
| Spesialperiode | Spesifikk trening mot spillerens behov | SPESIAL (bare kode) | Spesialisering, Spesialiseringsperiode, SPES | — | — | M 371, 376; B 436 | Fastsatt |
| Turneringsperiode | Forberedelse og gjennomføring rundt turneringer | TURNERING (bare kode) | TURN (om periode), Konkurranseperiode | — | — | M 377 | Fastsatt |
| Evaluering | Oppsummering, analyse og justering | — | Evalueringsperiode | — | — | M 378; B 436 | Fastsatt |
| Ferie | Ferie, pause eller redusert plan | — | Hvile, Ferieperiode | — | — | M 380; `src/app/portal/kalender/data.ts:42` | Fastsatt |
| Restitusjon | Hvile og gjenoppbygging. Har ikke noe standard antall økter | — | Recovery, Avlastning | — | — | M 90, 381; B 439–446 | Fastsatt |
| Testuke | Hendelse i årsplanen med tester og målinger. Er ikke en treningsperiode | — | — | — | — | M 379, 784 | Fastsatt |
| Treningssamling | Hendelse: samling over flere økter eller dager | — | Samling (alene) | — | dager | M 382, 784 | Fastsatt |
| Heldagssamling | Hendelse: samling med heldagsformat | — | — | — | — | M 383, 784 | Fastsatt |
| Uketype: Utvikling · Vedlikehold · Turnering | Ukens retning i ukeplanen | — | — | — | — | `prisma/schema.prisma` `WeekType`; `src/components/admin/precision/AG11Ark.tsx:342` | Uavklart |
| Ukenotat: Teknikkuke · Pre-turnering · Samling · Test · Evaluering · Ferie | Merkelapper på en uke | — | — | — | — | `AG11Ark.tsx:338` | Funnet |

Uketypene er uavklart fordi `docs/treningsplanlegging-og-sprak.md:123-128` har Utvikling, Turnering, Avlastning, Test og Forberedelse. Se D18.

### A3 De fem aksene og pyramiden

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Fysisk | Utvikle fysisk kapasitet | FYS (alltid i versaler) | Fysikk, Fysisk trening (som aksenavn) | — | — | M 448; B 75 | Fastsatt |
| Teknisk | Utvikle bevegelse og teknisk utførelse | TEK | Teknikk (som aksenavn), Teknisk trening | — | — | M 449; B 75 | Fastsatt |
| Golfslag | Utvikle et bestemt golfslag | SLAG | Slag (som fullt navn), Slagtrening, Slagøvelser | — | — | M 450; B 75 | Fastsatt |
| Spill | Bruke ferdighetene i en spillsituasjon | SPILL | Banespill (om aksen), Spilltrening, Spill på bane | — | — | M 451; B 75–76 | Fastsatt |
| Turnering | Forberede eller gjennomføre turneringsspill | TURN | Turneringsspill (som aksenavn) | — | — | M 452 | Fastsatt |
| Akse | Én av de fem: FYS · TEK · SLAG · SPILL · TURN. Farge betyr alltid akse og ingenting annet | — | Kategori, disiplin | — | — | B 75, 698–710 | Fastsatt |
| Pyramide | De fem aksene som hensikt for en økt eller øvelse | — | — | — | — | M 446–454; B 386 | Uavklart |

Pyramiden er uavklart fordi M 454 sier at den «foreslår, men låser ikke», mens B 386 og B 1035 sier at den «styrer kategoriseringen og øvelsesbanken». Se D9.

### A4 AK-formelen

Formelen er `PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS` (M 770). Den merker hver øvelse og test. Kodenavnene til venstre i formelen vises aldri. Brukeren ser navnene i tabellen.

| Ord i appen | Betyr | Lovlige verdier | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| AK-formelen | Merkelappen på en øvelse, i fem ledd | Pyramide · Treningsområde · Læringssteg · Treningsmiljø · Press | AK-formel v1, økt-ID `TEK_TEE_L-BALL_CS60_M2_PR2` | — | — | M 743–749, 770 | Fastsatt |
| Treningsområde | Hva som trenes. 19 områder | Se de fem radene under | Ferdighetsområde, Skill area | — | — | M 489–496 | Fastsatt |
| Utslag | Slag fra tee | Utslag | Tee Total, Tee-slag, Tee total | — | m | M 491; `src/components/teknisk-plan/constants.ts:36` | Fastsatt |
| Innspill | Slag inn mot green, i fire avstandsbånd | 200 m og lengre · 150–200 m · 100–150 m · 50–100 m | Approach, Inspill, «200 m +», «~150 m», Tilnærming | Approach (bare SG-kode APP) | m | M 492, 758–760 | Fastsatt |
| Nærspill | Slag innenfor 50 m | Chip · Pitch · Lob · Bunker | Kortspill, kort spill, rundt green, Around green | Chip, Pitch, Lob | m | M 89, 245, 493 | Fastsatt |
| Putting | Putt i seks avstandsbånd | 0–3 fot · 3–5 fot · 5–10 fot · 10–25 fot · 25–40 fot · 40+ fot | Kortputt, Mellomputt, Langputt, Lengdeputt, meter som hovedenhet | — | fot (meter kan stå i parentes) | M 139, 494; B 1037 | Fastsatt |
| Fysisk (område) | Fysiske områder | Styrke · Kondisjon · Bevegelighet | Mobilitet, Fysikk | — | kg, min | M 495 | Fastsatt |
| Banespill | Treningsområdet for spill på bane | Banespill | — (betyr ikke aksen SPILL) | — | hull | M 496; B 76 | Fastsatt |
| Læringssteg | Hvor langt bevegelsen er automatisert | Uten ball · Lav hastighet · Automatikk | Motorikk (som overskrift), Læringsfase, Fase, L-fase, Auto, Lav fart, Full fart, Tørrsving | — | — | M 246, 599–610 | Fastsatt |
| Hastighet | Fart som prosent av spillerens egen Club Speed. Gjelder bare Utslag og Innspill | Lav hastighet 25 %, 50 % eller 75 %. Automatikk 100 % | CS50, CS60–CS100, «intensitet» | Club Speed | % | M 603–610, 729; B 1033 | Fastsatt |
| Treningsmiljø | Hvor økten foregår, i grove trekk | Innendørs · Treningsområde · Bane · Konkurranse (bare eldre data) | Belastning (om sted), Miljø, M0–M5 | — | — | M 229–231, 514–515, 751–756 | Fastsatt |
| Sted | Hvor økten foregår, i detalj | Utendørs treningsområde · Golfbane · Innendørs golf · Fysisk treningssted · Hjemme / eget sted · Annet sted | Range (alene), Studio | Driving range | — | M 518–538 | Fastsatt |
| Press | Hvem som ser på, eller hva som står på spill | Alene · Observert · Konkurranse · Turnering | PR1–PR5, Fri, Krav, Utfordring, «Ingen press», «Lav press», «Hoy press» | — | — | M 743–749 | Fastsatt |
| Teknisk fokus | Ett valgfritt fokus per øvelse. En økt kan ha flere øvelser | Sikte og oppstilling · Startretning · Kurve · Høyde · Treffpunkt · Lengdekontroll · Spinn · Landingspunkt · Utrulling · Køllevalg · Bruk av bounce · Sandinngang · Lie-variasjon · Greenlesing · Ballstart · Spilleformat · Strategioppgave | Teknisk dimensjon, Dimensjon | — | — | M 621–641; B 80 | Fastsatt |
| Treningsmåte | Hvordan øvelsen gjennomføres | Blokktrening · Variasjonstrening · Konkurranseform · Spill/test | Måte, Repetisjon, Random, Spilltest | — | — | M 614–619 | Fastsatt |
| Måleutstyr | Hva som måler øvelsen | Med TrackMan · Uten TrackMan · Annen radar · Ikke relevant | Liste med FlightScope, Garmin R10 og Mevo+ som egne valg | TrackMan | — | M 585–590 | Fastsatt |
| Sandtrinn | Trinn for bunker | Uten ball i sanden · Med ball | — | — | — | M 637 | Fastsatt |
| Mengde | Hvor mye som gjøres | Slag · Putter · Hull · Tid · Serier · Repetisjoner · Oppgaver | Reps (i UI), Volum (om én øvelse) | — | antall, min | M 429, 681–688 | Fastsatt |
| Styrke (mengde) | Serier × repetisjoner @ vekt, med RIR og pause | «4 × 6 @ 90 kg · RIR 2» | — | RIR | kg, s | M 685; B 79 | Fastsatt |
| RIR | Repetisjoner igjen i reserve | 0–4 | — | RIR | antall | M 685 | Fastsatt |
| Pulssone | Intensitet i kondisjon | S1–S5 | — | — | — | M 686; B 79 | Fastsatt |
| P-posisjon | Posisjon i svingen. Navnene står under tabellen | P1.0–P10.0 | P9.0 med venstre arm | — | — | M 651–662; B 465–475 | Fastsatt |
| Utgåtte koder | Skal aldri vises eller skrives på nytt | — | L-faser (L-Kropp … L-Auto), CS-koder, M0–M5, PR1–PR5 | — | — | M 735–737; B 1032 | Fastsatt |

Navnene på P-posisjonene (M 651–662):

| Posisjon | Navn |
|---|---|
| P1.0 | Adresse / Oppstilling |
| P2.0 | Kølle parallell i baksving |
| P3.0 | Venstre arm parallell i baksving |
| P4.0 | Toppen av baksvingen |
| P5.0 | Venstre arm parallell i nedsving |
| P6.0 | Kølle parallell i nedsving |
| P7.0 | Treffpunktet |
| P8.0 | Kølle parallell i gjennomføring |
| P9.0 | Høyre arm parallell i oppfølging |
| P10.0 | Fullføring og balanse |

### A5 Nivåer (alle systemene som finnes)

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Gratis | Appnivå uten betaling | — | TALENT, FREE (på skjerm) | — | — | M 155; B 30.09 (linje 70–92) | Fastsatt |
| Full | Betalt appnivå, 299 kr/mnd eller 2 690 kr/år | — | Pro, Premium, Plus, ELITE, FULL i versaler | — | kr | M 155; B 1047 | Fastsatt |
| TALENT · FULL · INGEN | Interne tilgangsutfall. Vises aldri | — | — | — | — | M 156 | Fastsatt |
| Talentprofil | Gratis spillerprofil. Er ikke en prøveperiode | — | — | — | — | M 157 | Fastsatt |
| Performance / Performance Pro | Coaching-pakker. Er ikke appnivå | — | Pro (alene) | — | klipp per måned | M 158; B 683 | Fastsatt |
| Kategori A–K | Spillerens nivå etter brutto snittscore. A er best. Navnene står under tabellen | Kategori C (stor K når det står alene) | Kategori 1–11, «A1–A2», HCP-basert kategori, «E–A+» (WANG) | — | slag | M 184–199; `src/lib/domain/ak-kategori.ts:41-52`; B 281 | Fastsatt |
| Kategorigrupper (f.eks. A–C, D–G, H–K) | Ingen kilde vedtar slike grupper. De finnes bare i demodata og to kodefiler med ulik inndeling | — | — | — | — | `designsystem/precision-athletics/ui_kits/_shared/data-trening.js:71-73`; `src/lib/plan-engine/standard-fordeling.ts:11-14`; `src/lib/ai-plan/system-prompt.ts:16-18` | Uavklart |
| Nivå på øvelse | Ingen kilde gir øvelser et nivå | — | — | — | — | Søk i M, B og design: ingen treff | Uavklart |
| Referanse for testnivå | Nivåtall per kategori for tester. Ikke vedtatt. Vises som «—» og «Referanse ikke satt» | — | — | — | — | B 226–227, 1079 | Fastsatt |
| CS-nivåer (CS0, CS20–CS100) | Gammel skala for svinghastighet. M sier at den er utgått og erstattet av prosent av Club Speed. Global instruks sier «uavklart», og WANG-årsplanen bruker «CS50» | — | — | — | — | M 735–737; B 1033; `~/.claude/CLAUDE.md` §4; `designsystem/wang/fasit/arsplan-2026-27/WANG Arsplan 2026-27.dc.html:323` | Uavklart |
| AK-stigen | AK Golfs juniorprogram i fire trinn: Mini → Basis → Utvikling → Elite | — | Fem trinn, Knøtt som trinn, A1–A4 (på skjerm) | — | — | B 968–972; `src/lib/agencyos/ak-stigen-data.ts:30` | Fastsatt |
| Knøtt | Egen gruppe for 11–12 år, ved siden av stigen. Er ikke et trinn | — | — | — | år | B 968–970 | Fastsatt |
| Aldersgrenser i AK-stigen | Koden: til og med 10, 13, 15 og 19 år. Designet: 7–10, 10–13, 13–16 og 16+ | — | — | — | år | `ak-stigen-data.ts:31-34`; `designsystem/.../agencyos/data-ag3.js:46-49` | Uavklart |
| Ung · Junior · Amatør · Profesjonell | Nivåene i utviklingssjekken, for WANG- og TN-medlemmer. Ung = 8.–10. klasse. Man er junior ut det året man fyller 19 | — | Proff, Pro | — | — | B 193–194, 258–263; `src/lib/iup/utviklingssjekk.ts:6` | Fastsatt |
| Antall spørsmål per IUP-nivå | B sier Junior 41. IUP 2027 sier Junior 43 | — | — | — | antall | B 258; `docs/design-handoff/README.md:55` | Uavklart |
| Landslagsnivå | Team Norways nivå per klasse (Gutter U18, Jenter U18, Damer, Herrer), vist i tillegg til A–K. Tallene mangler | — | TN-klasse, landslagsklasse | — | — | B 267; `docs/beslutningsgrunnlag/mulighetskart-wang-tn-2026-09-28.md:35` | Uavklart |
| NGF-nivå | NGFs egen trapp, omtalt i en hjelpetekst | — | — | — | — | `src/lib/v2/hjelpetekster.ts:249-251` | Funnet |
| Program | Spillerens tilknytning: WANG Toppidrett, WANG Ung, GFGK Mini, GFGK Bredde, GFGK Jenter, GFGK Elite, AK Golf Academy, AK Golf Junior Academy, Selvbetjent | — | — | — | — | `src/components/portal/v2/MegV2.tsx:88` | Funnet |
| GFGK Elite | Gruppenavn. Er ikke et appnivå | — | — | — | — | M 160 | Fastsatt |

Navnene på kategoriene A–K, med brutto snittscore (M 184–199). Hvert bånd tar med nedre grense, men ikke øvre:

| Kategori | Navn | Brutto snitt |
|---|---|---|
| A | World Elite | under 68 |
| B | National Elite | 68–72 |
| C | National U21 | 72–74 |
| D | Regional Elite | 74–76 |
| E | Regional U18 | 76–78 |
| F | Klubbspiller Senior | 78–80 |
| G | Klubbspiller Junior | 80–85 |
| H | Rekrutt Senior | 85–90 |
| I | Rekrutt Junior | 90–95 |
| J | Nybegynner Senior | 95–100 |
| K | Nybegynner Junior | 100+ |

### A6 Målsetning og mål

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Målsetning | Det spilleren sikter mot | — | Mål (alene), Goal, Målsetting | — | — | M 85, 241; B 71 | Fastsatt |
| Resultatmål | Målsetning om et utfall, f.eks. «Topp 10 i NM» eller «HCP under 5» | — | — | — | — | M 350–352 | Fastsatt |
| Prosessmål | Målsetning om det man gjør, f.eks. «Tre putteøkter per uke» | — | — | — | — | M 353 | Fastsatt |
| mål (måltall) | Brukes bare om måltall: TrackMan-mål, rep-mål, resultatkrav, ukevolum | Rep-mål, TrackMan-mål | — | — | — | M 85, 241 | Fastsatt |
| Periodemål | Målsetning for en periode | — | — | — | — | M 392 | Fastsatt |
| Ikke startet · På vei · Nådd | Statusene til en målsetning | — | Oppnådd, Mål oppnådd, Ferdig | — | — | M 312 | Fastsatt |
| Nivå for målsetning | År, periode, måned, uke eller økt. Foreslås ut fra fristen | — | — | — | — | M 362–366 | Fastsatt |
| Målemetode · Resultatkrav | Feltene i trinn 8 «Mål» på en øvelse | — | — | — | — | M 430, 692–697 | Fastsatt |
| IUP-måltall | 37 måltall i ni grupper, per kvartal og år, bare for WANG- og TN-medlemmer | K1–K4 og ÅR | Q1–Q4 | — | — | `docs/design-handoff/README.md:97-109` | Funnet |

### A7 Tester

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Test | Kalenderinnhold for testgjennomføring | — | — | — | — | M 407 | Fastsatt |
| Tester | Del av Stats i PlayerHQ og eget punkt under Mer i AgencyOS | — | Testbatteri (som fanenavn) | — | — | M 177; B 388 | Fastsatt |
| Testdag / Felles testdag | Dag der en gruppe tar tester sammen | — | — | — | — | `prisma/schema.prisma` `TestDay`; `docs/planer/testbatteri-felles-testdag-og-livescoring-2026-10-02.md` | Funnet |
| Test teller bare komplett | En test gir bare resultat når alle slag er registrert | — | — | — | — | B 712–720 | Fastsatt |
| Egenført · Kontrollert | Hvem som førte testen: spilleren selv, eller kontrollert av trener | — | Ført, Godkjent | — | — | B 266 | Fastsatt |
| Treff · Bom | Utfall per forsøk i treff-tester som Wedge Gate | — | Ja/Nei, poeng (for Wedge Gate) | — | antall treff | B 155–181; `PH15TestGjennomfor.tsx:128` | Fastsatt |
| Testprotokoll | Fast oppsett for en test | — | — | — | — | `src/lib/domain/pei/protokoll-definisjoner.ts` | Funnet |
| Navn på testene | Driver basic · Innspill Basis · Innspill 120 m · Innspill 160 m · Innspill Variation · Wedge Variation · Wedge Gate · Nærspill Gate · VISA Express · Driver Gate · Putt Gate · Putt 1–3 m · Putt Speed · 9 hull lengde · 8-ball · 18 hull · Golfslag bane · PEI Test Bane · Teknikktest | — | Inspill, «TN»-prefiks, «Putt 1-3m», «18 - hull» | 8-ball, Gate, Speed | m, fot, mph | `src/lib/portal-tester/tn-catalog.ts`; `prisma/scripts/seed-ngf-test-protocols.ts` | Funnet |
| Fysiske tester | Benkpress · Markløft trapbar · Lengdehopp · Rotasjonskast · Club Speed | — | Trapbar Deadlift, Standing Long Jump, Ball Throw, CMJ, Knebøy, 3000 m | Club Speed | kg, cm, mph | B 264–267 | Fastsatt |
| PEI | Mål på hvor nær målet slagene lander, som andel av slaglengden. Lagres som brøk og vises i prosent | PEI | — | PEI | % | `src/lib/domain/pei/pei-beregning.ts:2`; `src/lib/portal-tester/format-verdi.ts:13` | Funnet |
| Referanse ikke satt | Vises når nivåtall for en test mangler | — | 0 | — | — | B 226 | Fastsatt |
| Fireukerssjekk | Sjekk hver fjerde uke med prosessmål, målsetninger og utviklingssjekk. Bare for WANG- og TN-medlemmer | — | Halvårsevaluering | — | — | B 258–260, 16 | Fastsatt |
| Utviklingssjekk | Spørsmålsdelen i sju områder: Sosial · Mentalt · Fysisk · Strategisk · Teknisk · Golfutvikling · Neste trinn | — | — | — | skala 1–5 | B 258; `src/lib/iup/utviklingssjekk.ts` | Fastsatt |
| Sesongevaluering | Evaluering uka før uke 43 | — | — | — | — | B 260 | Fastsatt |

### A8 Turnering, konkurransedag og reisedag

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Turnering | Kalenderinnhold for turneringsdeltakelse | — | Konkurranse (om turnering) | — | — | M 405 | Fastsatt |
| Treningsturnering | Lav innsats, test av plan og rutiner | — | Trening (alene) | — | — | M 478–480 | Fastsatt |
| Utviklingsturnering | Målsetning knyttet til periodens fokus | — | Utvikling (alene) | — | — | M 481 | Fastsatt |
| Prestasjonsturnering | Resultatet teller, full konkurranseprosess | — | Prestasjon (alene) | — | — | M 482 | Fastsatt |
| Neste turnering | Neste offisielle golfturnering. Interne konkurranser er økter | — | — | — | — | B 214 | Fastsatt |
| Reise | Kalenderinnhold for reisetid | — | — | — | — | M 406 | Fastsatt |
| Reisedag | En dag med reise til eller fra turnering. Ingen kilde definerer ordet | — | — | — | dag | `docs/planer/workbench-rest-designkontrakt-2026-10-02.md:10` | Uavklart |
| Konkurransedag | Ingen kilde definerer ordet | — | — | — | dag | Søk i M, B, docs og kode: ingen treff | Uavklart |
| Treningsrunde · Turneringsrunde | Rundetyper på golfbane | — | Tellende | — | — | M 527 | Fastsatt |
| WAGR | Verdensrankingen for amatører | WAGR | — | WAGR | plass | B 274 | Fastsatt |
| NGFs juniorranking | Norges Golfforbunds ranking for juniorer | — | — | — | plass | B 274 | Fastsatt |
| Påmelding: Planlagt · Påmeldt · Bekreftet · Trukket · Gjennomført · Ikke fullført | Status for en turneringsdeltakelse | — | — | DNF (bare kode) | — | `prisma/schema.prisma` `TournamentEntryStatus` | Funnet |
| Tourene | Norgescup · Srixon Tour · Olyo Juniortour · Østlandstour · Region Tour · NM | — | Norges Cup, Garmin Norges Cup, OLYO | — | — | `src/app/admin/tournaments/[id]/page.tsx:79` m.fl. | Uavklart |

### A9 Runde og statistikk

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Score | Antall slag på en runde. Alltid brutto | — | Netto, nettoscore | — | slag | M 146, 732 | Fastsatt |
| Brutto | Ekte slag uten handicap | — | — | — | slag | M 146, 732 | Fastsatt |
| Snittscore | Gjennomsnitt av brutto score | — | Brutto snitt, Snitt brutto, Brutto rundesnitt | — | slag | M 177 | Fastsatt |
| Til par | Score minus par for spilte hull. Skrives «71 (−1)» | — | Mot par | — | slag | `src/lib/v2/hjelpetekster.ts:274`; `designsystem/.../ordmaster.md:55` | Funnet |
| HCP | Handicap. Vis faktisk verdi med fortegn, og utled det aldri fra score | HCP | — | — | — | M 138 | Fastsatt |
| Strokes Gained | Slag vunnet eller tapt mot en referanse | SG (i tall og overskrifter) | — | Strokes Gained | slag, med fortegn | M 137, 177 | Fastsatt |
| SG totalt | Sum av de fire SG-kategoriene | — | SG Total, SG total | — | slag | `PHRD08RundeFerdig.tsx:180` | Funnet |
| OTT · APP · ARG · PUTT | De fire SG-kategoriene | Kodene | — | Off the Tee, Approach, Around the Green, Putting | slag | M 201 | Fastsatt |
| Norske navn på SG-kategoriene | Utslag · Innspill · Nærspill · Putting står i to kilder, men ikke i M | — | Around green, Approach (i norsk tekst) | — | — | `docs/ordbok.json` `sg.kategorier`; `docs/treningsplanlegging-og-sprak.md:308-311` | Uavklart |
| Referanse | Hva SG sammenlignes med: Neste kategori (Broadie, merket estimat) eller PGA Tour | — | — | PGA Tour | — | B 341–342 | Fastsatt |
| Estimat | Merke på tall som er beregnet, ikke målt | ESTIMAT (i meta) | — | — | — | B §Data | Fastsatt |
| Foreløpig | Under 4 runder gis ingen konklusjon. 4–7 runder gir «foreløpig». Tee og innspill er sikre fra 12 runder, nærspill og putting fra 24 | — | Innledende | — | runder | B 343–344 | Fastsatt |
| Putter | Antall putter på en runde eller et hull | — | — | — | antall | `PH18Runder.tsx:270` | Funnet |
| Fairway-treff | Utslag som lander på fairway, på par 4 og par 5 | FW (bare i tabeller) | Fairwaytreff, Fairway treff, FIR, FT % | Fairway | % | `src/lib/v2/hjelpetekster.ts:229` | Funnet |
| GIR | Green truffet på regulert antall slag | GIR | Greentreff | GIR | % | `src/lib/v2/hjelpetekster.ts:223-226` | Funnet |
| Opp-og-ned | Hull reddet med ett innspill rundt green og én putt | — | Up-and-down, Scrambling (i norsk tekst) | — | % | B 355 | Fastsatt |
| Scrambling · Sand save | Importerte nøkkeltall | — | — | Scrambling, Sand save | % | `src/components/.../upgame-import-modal.tsx:93-94` | Funnet |
| Straffeslag | Ekstra slag etter regelbrudd | — | Penalty | — | slag | `src/components/portal/runde-logg/ShotEntryNumpad.tsx:168` | Funnet |
| Tiger 5 | Fem feil som koster slag. B nevner to av dem. Koden teller tre andre | — | Tiger Five | — | antall | B 355; `src/lib/min-golf/load-min-golf.ts:304-327`; `hjelpetekster.ts:286` | Uavklart |
| Underlag | Hvor ballen ligger: Tee · Fairway · Semirough · Rough · Dyp rough · Bunker · Green | — | Sand, Lie, Semi-rough, Dypt rough | Fairway, Rough | — | `src/lib/runde-logg/types.ts:34-37` | Funnet |
| Bom på putt | Retningen på bom: Venstre · Høyre · På linja | — | På linje | — | — | B 362 | Fastsatt |
| Break · Fart | Feltene på en putt: lengde, break, fart og bom | — | — | Break | fot | B 360–362 | Fastsatt |
| Registreringsnivå | Rask score · Hull for hull · Slag for slag | — | Slag-for-slag | — | — | `PHRD01VelgNiva.tsx:38-44` | Funnet |
| Dagsform | 1 Tung · 2 Slapp · 3 Ok · 4 God · 5 Topp | — | — | — | 1–5 | M 203 | Fastsatt |
| Opplevd belastning | Hvor tung økta føltes, 1–10. Golføkt får også fokus 1–10 | — | Belastning (om sted), RPE, Anstrengelse, «Hvor tungt» | — | 1–10 | B 358–359; M 231 | Uavklart |
| Etterlevelse | Gjennomført tid delt på planlagt tid, siste fire uker. Uten forfalte økter vises «—» | — | Compliance, Fullføringsgrad | — | % | B 641–675 | Fastsatt |
| TrackMan-parametere | Engelsk navn med stor forbokstav, og norsk forklaring etter | — | CLUB SPEED i versaler, treffprosent om Smash Factor | Attack Angle, Club Path, Face Angle, Face to Path, Dynamic Loft, Smash Factor, Ball Speed, Club Speed, Launch Angle, Launch Direction, Spin Rate, Spin Axis, Carry, Total, Dispersion, Landing Angle, Low Point, Swing Direction | mph, °, rpm, m | M 98–124 | Fastsatt |
| Club Speed | Køllehastighet målt med radar | — | Køllehastighet, Svinghastighet, CHS, Clubhead Speed | Club Speed | mph | M 98–124, 140 | Fastsatt |
| Data Golf | Ekstern datakilde for PGA-tall | — | DataGolf, Datagolf, DATAGOLF | Data Golf | — | B §Data («Powered by Data Golf»); 272 treff på «DataGolf» i kode og dokumenter | Uavklart |
| Powered by Data Golf | Kildelinje på alle offentlige statistikkflater | — | Data powered by DataGolf | — | — | B §Data | Fastsatt |
| SG: Off the Tee · SG: Approach · SG: Around Green · SG: Putting | PGA-sammenligning. **Bare analytiker** | — | — | Ja | slag | `src/components/marketing/v2/MarkedStatsMinProgresjonV2.tsx:41-43` | Funnet |
| T2G, Drive Distance, skill ratings, approach skill, odds og fantasy | Data Golf-felt. **Bare analytiker.** Odds og fantasy vises aldri til WANG- eller TN-trenere | — | — | Ja | yds | `docs/planer/hovedprompt-wang-team-norway-playerhq-2026-10-02.md:348-364`; `docs/design-audit/datagolf-precision-wang-team-norway-2026-10-02.md:11` | Funnet |

Om «D-19»: betegnelsen finnes ikke i repoet. De eneste treffene er celleadresser i et regneark-kart. Data Golf-skjermene heter DG-01 til DG-17. Ordene merket **bare analytiker** gjelder Anders' egne Data Golf-flater, fordi B 776 sier at Data Golf «aldri vises for andre enn Anders».

### A10 Plan og status

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Utkast | Plan eller økt som ikke er sendt til spilleren | — | Kladd, Draft | — | — | M 305–307 | Fastsatt |
| Venter på spiller | Plan som venter på spillerens svar | — | Til godkjenning, Venter på spilleren, Venter på deg | — | — | M 307 | Fastsatt |
| Venter på coach | Plan spilleren har sendt til coach | — | — | — | — | M 307; B 716 | Uavklart |
| Godtatt · Avvist · Aktiv · Arkivert | Resten av statusene til en plan | — | Endring bedt om, Pause | — | — | M 307 | Fastsatt |
| Planlagt · Pågår · Gjennomført · Avlyst · Hoppet over | Statusene til en økt | — | Fullført, Ferdig, Gjort, Logget | — | — | M 308; M 215 | Fastsatt |
| Avbrutt | Økt som ble stoppet før slutt. Står ikke i M | — | — | — | — | `src/lib/domain/workbench/labels.ts:51-60` | Funnet |
| Ikke publisert · Publiserer · Publisert · Trukket tilbake | Statusene for publisering | — | — | — | — | M 309 | Fastsatt |
| Endret etter publisering | Publisert plan som er endret siden | — | — | — | — | `AG11Moduler.tsx:42`; `docs/design-handoff/regler/skjermliste.md` AG-WB-FYS | Funnet |
| Ikke lagret · Lagrer · Lagret · Kunne ikke lagres | Statusene for lagring | — | — | — | — | M 310 | Fastsatt |
| Forslag · Godkjent · Kjører · Utført · Feilet | Statusene til et AI-forslag. «Godkjent» er ikke «Utført» | — | Venter på coach (om AI-forslag) | — | — | M 301, 311 | Fastsatt |
| Forslag (fra trener) | Endring fra WANG- eller TN-trener som spilleren godtar eller avviser samlet | — | Trenerforslag (på skjerm) | — | — | B 277; `docs/design-handoff/regler/overforing-wang-tn.md:6` | Funnet |
| Godta · Avvis | Svar på forslag. «Avvis» er ikke «Angre» | — | Avslå, Godkjenn (om spillerens svar) | — | — | M 282–283 | Uavklart |
| Registrere | Å føre inn data | — | Logge, Føre, Logg | — | — | M 223, 239 | Fastsatt |
| Lagre · Publisere · Avslutt · Avbryt · Angre · Slett | Faste handlingsord | — | Ferdig (som universell status), Fullfør økt | — | — | M 256–284 | Fastsatt |
| Gjenta | Legge inn en økt flere uker på rad | — | — | — | uker | B §Workbench; `docs/design-handoff/design/shared/WB3.jsx.txt:146` | Funnet |
| Avsluttet | En utfordring som eieren har avsluttet | — | Fullført | — | — | B 914 | Fastsatt |
| Risiko · Følg med · Sjekk · Løst | Saker og filtre i Innboks | — | Watch, Sjekk inn | — | — | B 374, 690 | Fastsatt |
| Trenger deg · Følger planen · Hviler | Matrisen i Stall | — | — | — | — | B 161 | Fastsatt |

«Venter på coach» er uavklart fordi B 328 (28.09) fjerner «Send til coach» på forslag. «Godta» er uavklart fordi koden viser «Godkjenn» der spilleren svarer (`PH01IDag.tsx:118`). Se D11 og D12.

### A11 Gruppe og individuell plan

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Gruppe | En samling spillere med felles plan | — | Lag, Team | — | — | B 385; M 402 | Fastsatt |
| Gruppeplan | Gruppas plan. Er grunnmuren, og medlemmene arver den | — | Grunnplan | — | — | B 385 | Fastsatt |
| Egen | Merke på en arvet økt eller periode spilleren har tilpasset. Følger ikke lenger gruppa | EGEN (i meta) | Lokal, Override | — | — | B 385 | Fastsatt |
| Fra gruppa · Fra coach · Egen | Kilden til en periode eller økt | FRA GRUPPA | GRUPPE (alene), Fra Anders (fast navn) | — | — | `docs/design-handoff/regler/skjermliste.md` PH-11-AR | Funnet |
| Stall | Coachens spillere | — | Spillerliste | — | — | M 179 | Fastsatt |
| I dag · Trener nå · Hele stallen | De tre båndene i Stall | — | — | — | — | B 378 | Fastsatt |

### A12 Roller

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Spiller | Standardrollen for den som trener | — | Elev, Atlet, Utøver (i AK HQ) | — | — | M 74 | Fastsatt |
| Coach | AK Golfs coach | — | Trener (alene om AK-coach), CoachHQ | Coach | — | M 75 | Fastsatt |
| Hovedcoach | Coachen med full tilgang, blant annet til Økonomi | — | Head coach, HEAD COACH, Admin (som rollenavn) | Head coach | — | M 75; B 159, 176, 382 | Uavklart |
| Assist Coach | Rollen ASSISTANT i AK Golf. Ser egne økter og gruppeøkter | — | Hjelpecoach, Hjelpetrener, Assistent, assistant coach | Assist Coach | — | B 382, 972–973 | Fastsatt |
| Gruppetrener | Ingen kilde definerer ordet | — | — | — | — | Søk: ingen treff | Uavklart |
| Sportssjef · Trener | De to rollene i `/team-wang` | — | Admin, Kontaktlærer, Rektor | — | — | B 509–520 | Fastsatt |
| Hjelpetrener (Team Norway) | ASSISTANT-rollen i Team Norway | HJ | — | — | — | `designsystem/team-norway/handover/TILGANGSMATRISE.md:33,49` | Funnet |
| TN-trener | Trener i Team Norway | — | — | — | — | `docs/design-audit/datagolf-precision-wang-team-norway-2026-10-02.md:11` | Funnet |
| Analytiker | Brukes om den som ser Data Golf-flatene. Ingen rolle i koden | — | — | — | — | Samme fil, linje 11; B 776 | Uavklart |
| Forelder / foreldre | Den som følger en junior og ofte betaler | — | Foresatt (som standard) | — | — | M 76 | Fastsatt |
| Foresatt | Bare når den juridiske rollen er poenget, f.eks. samtykke under 16 år | — | — | — | — | M 76 | Fastsatt |
| Admin · Gjest | Systemroller i koden | — | — | — | — | `prisma/schema.prisma` `UserRole`; `AdminTilgangV2.tsx:20` | Funnet |

### A13 Tilgang og deling

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| Delingslenke | Lenke spilleren sender fra Meg til trenerens e-post (bare @wang.no og @golfforbundet.no). Gjelder i sju dager | — | — | — | dager | B 268–273 | Fastsatt |
| Innsyn | Det treneren ser etter deling. Innsynet er alt | — | Tilgang (om innsyn) | — | — | B 270 | Fastsatt |
| Trekk tilbake tilgang | Spilleren fjerner trenerens innsyn med en gang | — | Avslutt tilgang, Avsluttet tilgang | — | — | B 271; `src/components/team-norway/tn-tilgang-handlinger.tsx:34` | Uavklart |
| Venter på forelder | Delingen venter på forelders godkjenning (under 16 år) | — | — | — | — | `docs/design-handoff/regler/skjermliste.md:46` | Funnet |
| Samtykke | Ja til deling, opptak eller ytelsesbilde | — | — | — | — | B 247, 337 | Fastsatt |
| Privat · Delt | Om innhold er synlig for andre | — | — | — | — | M 168 | Fastsatt |
| Låst · Åpen | Låst krever nivå eller tilgang. «Åpen» erstatter aldri «publisert» | — | — | — | — | M 218–220 | Fastsatt |
| Opptatt | Det coachen ser av spillerens private avtaler. Aldri tittel | — | — | — | — | B 336 | Fastsatt |
| IUP | Individuell utviklingsplan. Trenerfane i Spiller 360, WANG og Team Norway. PlayerHQ har ingen IUP-fane | IUP | — | — | — | B 16, 254–257 | Fastsatt |
| IUP-samtale | Samtale om IUP. Finnes for alle spillere i Spiller 360 | — | — | — | — | B 381 | Fastsatt |
| Vurdering | Trenerens vurdering i WANG og TN | — | Karakter | — | 1–5 | `designsystem/team-norway/readme.md:165` | Funnet |

### A14 Navigasjon

| Ord i appen | Betyr | Kort | Ikke bruk | Engelsk | Enhet | Kilde | Status |
|---|---|---|---|---|---|---|---|
| I dag · Plan · Stats · Meg | Fanene i PlayerHQ | — | Hjem, Analyse, Statistikk (som fane), Tren | Stats | — | M 176; B 334 | Fastsatt |
| Cockpit · Innboks · Stall · Kalender · Workbench · Mer | Menyen i AgencyOS | — | Hjem, Kø, Godkjenninger, Jarvis (i menyen), Meg | Cockpit | — | M 178–180; B 371 | Fastsatt |
| Booking · Grupper · Tester · Økonomi · Oppsett | Punktene under Mer i AgencyOS | — | Drift, Stall+, Plan-hub | — | — | B 388 | Fastsatt |
| Innboks | Én innboks for meldinger, forslag og varsler, både i PlayerHQ og AgencyOS | — | Varsler, Kø, Godkjenninger | — | — | B 222, 373 | Fastsatt |
| Snittscore · Strokes Gained · Trening · Tester | Delene i Stats | — | — | Strokes Gained | — | M 177 | Fastsatt |
| Spiller 360 | Coachens side om én spiller | — | Spillerprofil (PS-01) | — | — | B 600–606 | Fastsatt |
| Statistikk | Ordet i løpende tekst. Fanen heter Stats | — | Stats (i løpende tekst) | — | — | M 242 | Fastsatt |

---

## Del B · Faste tekster i appen

Tabellen viser teksten slik den står i dag, foreslått tekst etter ordboken, og hvor den står.

- Grunnlaget er Precision-skjermene, Workbench, de gamle skallene som fortsatt er i bruk, WANG- og TN-flatene og varslene.
- Lista er et representativt utvalg, ikke hver eneste streng i appen.
- Stier som starter med `P/` ligger i `src/components/portal/precision/`.
- Stier som starter med `A/` ligger i `src/components/admin/precision/`.
- **OK** betyr at teksten allerede følger ordboken.

### B1 PlayerHQ · meny, skall og feilsider

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| I dag · Plan · Stats · Meg | OK | `src/components/precision/PlayerHQSkall.tsx:23-26` |
| Analyse (fane i det gamle skallet, 26 sider) | Stats | `src/components/v2/shell.tsx:86` |
| Tilbake til hjem | Tilbake til I dag | `src/app/portal/not-found.tsx:19` |
| …Sjekk URLen eller gå tilbake til portalen. | Sjekk adressen, eller gå tilbake til I dag. | `src/app/portal/not-found.tsx:20` |
| Fikk ikke lastet dagen din / Planen ligger trygt hos Anders. | Dagen kunne ikke hentes. Planen din er ikke endret. | `src/app/portal/error.tsx:42-43` |
| Henter dagen din … | OK | `src/app/portal/loading.tsx:8` |
| Tilbake til Analyse | Tilbake til Stats | `src/app/portal/analysere/datagolf/error.tsx:7` |
| Fikk ikke hentet SG | SG kunne ikke hentes. | `src/app/portal/analysere/error.tsx:32` |
| Klarte ikke å hente testene / …Loggede resultater er trygge… | Testene kunne ikke hentes. Registrerte resultater er bevart. | `src/app/portal/tren/tester/error.tsx:24-25` |

### B2 PlayerHQ · I dag og Gjør

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Fullførte økter mot plan | Gjennomførte økter mot plan | `P/PH01IDag.tsx:202-203` |
| Venter på deg | Venter på spiller | `P/PH01IDag.tsx:109` |
| Godkjenn / Avvis | Godta / Avvis | `P/PH01IDag.tsx:118-119` |
| Ligger i varslene / FINNES BAK BJELLA | Ligger i Innboks | `P/PH01IDag.tsx:242` |
| Kunne ikke hente dagens plan | Dagens plan kunne ikke hentes. | `P/PH01IDag.tsx:262` |
| Ingenting planlagt i dag. | OK | `P/PH01IDag.tsx:151` |
| Registrer sett | OK | `P/PH01IDag.tsx:163` |
| {n} av {m} fullført | {n} av {m} gjennomført | `P/PH02Gjor.tsx:40` |
| Fullført / Hvile | Gjennomført / — | `P/PH02Gjor.tsx:46` |
| Nyt hviledagen, eller planlegg fra Workbench. | Ingen økter i dag. | `P/PH02Gjor.tsx:49` |
| Fullført i dag | Gjennomført i dag | `P/PH02Gjor.tsx:77` |
| Trenger logg / Logget | Ikke registrert / Registrert | `P/PH02Gjor.tsx:80` |
| Før runde slag for slag | Registrer runde slag for slag | `P/PH02Gjor.tsx:95` |
| Logg tidligere runde | Registrer tidligere runde | `P/PH02Gjor.tsx:96` |
| Logg fysisk økt | Registrer fysisk økt | `P/PH02Gjor.tsx:98` |
| Gjort | Gjennomført | `P/PH02Gjor.tsx:108` |

### B3 PlayerHQ · Plan, øktark og live-økt

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Fullført / Avlyst / Hoppet over / Pågår (økt-status) | Gjennomført / Avlyst / Hoppet over / Pågår | `P/PH10Plan.tsx:46` |
| Mål for økten | Målsetning for økta | `P/PH10Plan.tsx:165` |
| Denne uken / Ikke denne uka | Velg én form (se E4) | `P/PH10Plan.tsx:149, 199` |
| Kunne ikke hente uken | Uka kunne ikke hentes. | `P/PH10Plan.tsx:196` |
| Fant ikke økta | Økta finnes ikke. | `P/PH03Oktark.tsx:32` |
| Mål nådd (alle øvelser gjort) | Alle øvelser gjennomført | `P/PH03Oktark.tsx:60` |
| …Treneren får beskjed. | …Coachen får beskjed. | `P/PH03Oktark.tsx:91` |
| Fullført / Ikke logget | Gjennomført / Ikke registrert | `P/PH03Oktark.tsx:116` |
| Økta er fullført | Økta er gjennomført. | `P/PH04LiveBrief.tsx:340` |
| Oppgrader for å starte | Krever Full | `P/PH04LiveBrief.tsx:342` |
| ÉN TEKNISK DIMENSJON | ETT TEKNISK FOKUS | `P/PH04LiveBrief.tsx:209` |
| Fullfør økt | Avslutt økt | `P/PH05LiveAktiv.tsx:9, 468` |
| Angre én / Angre ett slag / Angre siste | Angre siste slag (overalt) | `P/PH05LiveAktiv.tsx:150`; `P/PH06Slagteller.tsx`; `P/PH15TestGjennomfor.tsx:426` |
| CARRY / CLUB SPEED / BALL SPEED / SMASH FACTOR | Carry / Club Speed / Ball Speed / Smash Factor | `P/PH06Slagteller.tsx:321-355` |
| Bra jobbet, {navn} | Økta er gjennomført. | `P/PH07Oktoppsummering.tsx:147` |
| Start økt | OK | `P/PH04LiveBrief.tsx:343` |

### B4 PlayerHQ · Workbench og planbygger

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Øvelsesbank · Fysisk program · Øktmaler · Turneringer · Ny teknisk plan · Målsetninger | OK | `A/AG11Workbench.tsx:62` |
| Ukeplan og mål | Ukeplan og målsetninger | `A/AG11Workbench.tsx:426` |
| Tid, belastning og mer | Tid, treningsmiljø og mer | `A/AG11Workbench.tsx:294` |
| Historisk fokus / kildeposisjon | Tidligere fokus | `A/AG11Workbench.tsx:316` |
| Mal · SMART-mål · Periode og volum · Oppsummering | Mal · Målsetning · Periode og volum · Oppsummering | `P/PH12VelgPlan.tsx:42` |
| Lag en plan / Coachen din godkjenner planen før den blir aktiv. | Velg treningsplan | `P/PH12VelgPlan.tsx:102-103` |
| Ett mål per plan. Målet skal kunne testes. | Én målsetning per plan. Den skal kunne testes. | `P/PH12VelgPlan.tsx:127` |
| Ingen mål satt. | Ingen målsetning satt. | `P/PH12VelgPlan.tsx:160` |
| Send til coach | Fjernes (B 328) | `P/PH12VelgPlan.tsx:172` |
| Teknisk dimensjon | Teknisk fokus | `P/PH13DrillDetalj.tsx:36` |
| Miljø | Treningsmiljø | `P/PHTP01TekniskPlan.tsx:146` |
| Caddie forslag | Caddie-forslag | `P/PH13DrillBank.tsx:231` |

### B5 PlayerHQ · runde, tester og Stats

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Velg hvor mye du vil føre… | Velg hvor mye du vil registrere… | `P/PHRD01VelgNiva.tsx:92` |
| Fortsett kladden | Fortsett utkastet | `P/PHRD01VelgNiva.tsx:104` |
| Slag-for-slag | Slag for slag | `P/PHRD01VelgNiva.tsx:38-44` |
| Fredrikstad Golfklubb / Gul (standard når bane mangler) | Velg bane / — | `P/PH08RundeLive.tsx:114-115`; `P/PH09RegistrerRunde.tsx:135, 143` |
| Tee · Fairway · Rough · Sand | Tee · Fairway · Rough · Bunker | `P/PH08RundeLive.tsx:435` |
| Fullfør hull {n} | Registrer hull {n} | `P/PH08RundeLive.tsx:529` |
| Kunne ikke lagre runden over nett. Data er bevart. | Runden kunne ikke lagres. Den er bevart på enheten. | `P/PH08RundeLive.tsx:203` |
| Treningsrunde · Tellende | Treningsrunde · Turneringsrunde | `P/PH09RegistrerRunde.tsx:460` |
| På linje | På linja | `src/components/portal/runde-logg/slag-resultat-detaljer.tsx:95` |
| Lagrer… | Lagrer … | `P/PH15TestGjennomfor.tsx:598` |
| dd.mm.åååå | 19. mai 2026 | `P/PHIUP01Fireukerssjekk.tsx:33` |
| FORELØPIG (under 8 runder) | FORELØPIG ved 4–7 runder; under 4 runder ingen konklusjon | `P/PH16Stats.tsx:349` |
| Skill map | Uavklart (se D33) | `P/PH16bSkillMap.tsx:92` |
| …fra bay-ene på Fredrikstad GK… | …fra simulatorene på… | `P/PH17TrackMan.tsx:91` |
| … · TRACKMAN · BAY 3 · 24.09.2026 / KATEGORI C · AK GOLF-NORM | Data fra økta, ellers «—» | `P/PH17TrackMan.tsx:72, 821-822` |
| Ingen snittmålinger logget for denne køllen. | Ingen målinger ennå. | `P/PH17TrackMan.tsx:~456` |
| TRACKMAN-SPREDNING · 24.09.2026 | Faktisk dato, ellers «—» | `P/PH20Gameplan.tsx:557` |
| Snittscore · Strokes Gained · Trening · Tester | OK | `P/PH16Stats.tsx:42-45` |

### B6 PlayerHQ · Målsetninger, Innboks, Caddie, booking og Meg

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Handicap-mål | Handicap-målsetning | `P/PH19Enkeltmal.tsx:34` |
| Endre mål | Endre målsetning | `P/PH19Enkeltmal.tsx:180, 604` |
| Gratulerer / Mål oppnådd | Målsetning nådd | `P/PH19Enkeltmal.tsx:340` |
| Avbryt mål | Avbryt målsetning | `P/PH19Enkeltmal.tsx:381, 624` |
| Marker som oppnådd | Marker oppnådd | `P/PH19Enkeltmal.tsx:614` |
| FEIL 503 · MÅLSETNING | Målsetningene kunne ikke hentes. | `P/PH19Malsetninger.tsx:59` |
| Leaderboard | Rangering | `P/PH19Leaderboard.tsx:52` |
| Logg din første 18-hulls runde… | Registrer din første 18-hullsrunde… | `P/PH19Leaderboard.tsx:171` |
| SPILERNIVÅ | SPILLERNIVÅ | `P/PH19Talent.tsx:126` |
| talent-programmet | talentprogrammet | `P/PH19Talent.tsx:76` |
| Henter samtalen med Anders … | Henter samtalen med coachen … | `P/PH21Innboks.tsx:205` |
| Book en prøvetime / Book en privattime | Book time | `P/PH21Innboks.tsx:236`; `P/PH24Meg.tsx:122` |
| Tung · Slapp · Ok · God · Topp | OK | `P/PH21Innboks.tsx:535-539` |
| Krever Pro-abonnement / Oppgrader til Pro | Krever Full / Oppgrader til Full | `P/PH22CaddieChat.tsx:966, 1032` |
| Booking feilet. Prøv igjen. | Bookingen kunne ikke fullføres. Prøv igjen. | `P/PH23Booking.tsx:147` |
| Kunne ikke flytte time / Kunne ikke avbestille | Timen kunne ikke flyttes. / Timen kunne ikke avbestilles. | `P/PH23Booking.tsx:185, 211` |
| Betalingen er mottatt. Timen bekreftes når betalingen er registrert… | Betalingen er mottatt. Timen er bekreftet. | `P/PH23Booking.tsx:427` |
| Profilen ble lagret og oppdatert! | Lagret. | `P/PH24Profil.tsx:417` |
| Utstyrsbagen ble oppdatert og lagret! | Lagret. | `P/PH24Utstyr.tsx:142` |
| Notater &amp; spesifikasjoner | Notater og spesifikasjoner | `P/PH24Utstyr.tsx:37` |
| …PLAN, ANALYSE ELLER COACH | …PLAN, STATS ELLER COACH | `P/PH24dUtfordringer.tsx:199` |
| Ukesdigest søndag kveld | Ukesmelding søndag kveld | `P/PH25Abonnement.tsx:708` |
| Løft spillet med Pro / Inkludert i Pro | Full / Inkludert i Full | `src/app/portal/meg/abonnement/oppgrader/flyt/oppgrader-flyt-wizard.tsx:69, 154` |
| AI-coach 24/7 / AI-coach · 4 credits | Caddie / Caddie | `oppgrader-flyt-wizard.tsx:13, 72, 132` |
| Avbryt når som helst / Fri avbestilling | Kan sies opp når som helst | `oppgrader-flyt-wizard.tsx:72, 85, 129` |
| Hvordan oppgrader til Pro? / Forskjellen mellom Gratis og Pro | Hvordan oppgraderer jeg til Full? / Forskjellen mellom Gratis og Full | `src/app/portal/meg/help/kategori/[slug]/page.tsx:182-183` |
| Drills for svake områder | Øvelser for svake områder | `src/app/portal/meg/help/kategori/[slug]/page.tsx:103-104` |
| Foreslå drill / Ingen drill-forslag | Foreslå øvelse / Ingen øvelsesforslag | `src/components/portal/v2/ForeslaDrillV2.tsx:88, 126` |
| Topp 5 drills / Ingen drills logget | Topp 5 øvelser / Ingen øvelser registrert | `src/components/portal/v2/StatistikkMetrikkV2.tsx:160-162` |
| AI Golf Coach / Oppgrader for AI-coach under trening. | Caddie / Krever Full | `src/components/portal/live/LiveCoachPanel.tsx:25, 265` |

### B7 AgencyOS · meny, Cockpit og Innboks

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Cockpit · Innboks · Stall · Kalender · Workbench + Mer | OK | `src/lib/agencyos/precision-ia.ts:13-28` |
| Stall · Workbench · Kø · Jarvis · Meg (gammel meny på rundt 20 sider) | Cockpit · Innboks · Stall · Kalender · Workbench · Mer | `src/lib/agencyos/skall-ia.ts:8-14` |
| AgenticOS · Plan · Stall+ · Økonomi · Drift / «…maler, drills…» | Booking · Grupper · Tester · Økonomi · Oppsett | `src/components/v2/shell.tsx:150-197` |
| Hjem | Cockpit | `src/components/admin/global-search-modal.tsx:161` |
| HEAD COACH / COACH | Hovedcoach / Coach (se E3) | `src/components/precision/AgencyOSSkall.tsx:118` |
| Ferdig · Pågår · Neste | Gjennomført · Pågår · Neste | `A/AG01Cockpit.tsx:44` |
| …Godkjenninger, forespørsler og utkast dukker opp her. | …Forslag, forespørsler og utkast dukker opp her. | `A/AG01Cockpit.tsx:68` |
| Åpne køen | Åpne Innboks | `A/AG01Cockpit.tsx:74` |
| Risiko · Følg med · Sjekk · Løst | OK | `src/lib/admin/innboks/filter.ts:24-29` |
| Sjekk inn | Sjekk | `src/app/admin/queue/status.ts:2-5` |
| Ferdig (knapp, tre steder) | Løst | `A/AG04Innboks.tsx:225, 233, 234` |
| Kvitter ut | Marker som lest | `A/AG04Innboks.tsx:224` |
| Del digest med spillere og foresatte | Send ukesoppsummering til spillere og foreldre | `A/AG04Innboks.tsx:276` |
| …plan, logg, runder og tester… | …plan, registreringer, runder og tester… | `A/AG04Innboks.tsx:270` |
| Handlingen gikk ikke gjennom. | Handlingen kunne ikke utføres. Prøv igjen. | `A/AG04Innboks.tsx:94, 98` |
| Dine linjer til eleven | Dine linjer til spilleren | `A/AG02Ko.tsx:431, 433` |
| Nye saker kommer fra utøvere, foreldre og agentene. | …fra spillere, foreldre og agentene. | `A/AG02Ko.tsx:646` |
| Slå sammen | OK | `A/AG04Innboks.tsx` |

### B8 AgencyOS · Stall, Spiller 360 og Workbench

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Trenger deg · Følger planen · Hviler | OK | `A/AG07Stall.tsx:42-44` |
| Bra jobba! | Bra jobba. | `A/AG07Stall.tsx:49` |
| Målsetting og oppfølging · Teknikkplan · Fystester | Målsetning og oppfølging · Teknisk plan · Fysiske tester | `A/AG08Faner.tsx:118` |
| Alle endringer logges med navn og tid. | Alle endringer lagres med navn og tid i endringshistorikken. | `A/AG08Rediger.tsx:134` |
| Lagring feilet. Prøv igjen. | Endringene kunne ikke lagres. Prøv igjen. | `A/AG08Rediger.tsx:66` |
| Analyse (knapp til spillerens statistikk, fire steder) | Stats | `src/components/admin/spiller-detalj/spiller-detalj.tsx:299`; `src/components/admin/stall/StallPrecisionView.tsx:223` m.fl. |
| Utkast · Planlagt · Publisert · Pågår · Fullført · Avlyst · Hoppet over · Avbrutt | …Gjennomført… (Avbrutt: se D13) | `src/lib/domain/workbench/labels.ts:51-60` |
| Fullfør økt | Avslutt økt | `labels.ts:233`; `src/components/workbench/SessionExecutionPanel.tsx:91` |
| Økt fullført | Økta er gjennomført. | `labels.ts:238` |
| Se recap | Se oppsummering | `labels.ts:235` |
| Venter på spilleren | Venter på spiller | `labels.ts:289` |
| Coach-notat | Coachnotat | `labels.ts:276` |
| GRUPPE (opphav på øktkort) | FRA GRUPPA | `A/AG11Workbench.tsx:187` |
| Be coach lage teknisk plan (i coachens visning) | Ny teknisk plan | `A/AG11Workbench.tsx:410` |
| …Prøv igjen fra Godkjenninger. | …Prøv igjen fra Innboks. | `src/components/workbench/WorkbenchStall.tsx:181` |
| Gjennomføring og logger blir på originalen. / …og treneren publiserer… | …og registreringer… / …og coachen publiserer… | `src/components/workbench/WorkbenchPlanHandlinger.tsx:28` |
| Fullførte økter / FULLFØRINGSGRAD | Gjennomførte økter / ETTERLEVELSE | `P/TreningsvolumVisning.tsx:23, 46` |
| Logget / Ikke logget / N AV N LOGGET | Registrert / Ikke registrert / N AV N REGISTRERT | `A/AG12Oktark.tsx:108, 135, 141` |
| Ingen driller på denne økta ennå. | Ingen øvelser i økta ennå. | `A/AG13LiveOkt.tsx:262` |
| Styrke · Kondisjon · Mobilitet | Styrke · Kondisjon · Bevegelighet | `A/AG11Moduler.tsx:44` |
| Trening · Utvikling · Prestasjon | Treningsturnering · Utviklingsturnering · Prestasjonsturnering | `A/AG11Moduler.tsx:45` |
| Mål og strategi / INGEN MÅL LAGT INN | Målsetning og strategi / INGEN MÅLSETNINGER LAGT INN | `A/AG11Moduler.tsx:241, 298` |
| Ferdighetsområde · Miljø · Reps | Treningsområde · Treningsmiljø · Repetisjoner | `A/AG14MalRediger.tsx:366, 367, 382` |
| Plan-hub | Maler og øvelser | `A/AG14PlanHub.tsx:189` |
| Fasiter (fane under Tester) | Referanser | `A/AG15Tester.tsx:61` |
| Publiser · Publiser uke · Trekk tilbake · Gjenta | OK | `labels.ts:157-162, 215` |
| Ingen økter denne uken | Ingen økter denne uka. (se E4) | `labels.ts:165` |

### B9 AgencyOS · Caddie, Økonomi, Oppsett og eldre flater

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Venter på coach · Godkjent · Feilet (agentkjøring) | Forslag · Godkjent · Kjører · Utført · Feilet | `A/AG19CaddieHub.tsx:55` |
| Agentkø · Prosjekter · Skills · Samtale | …Ferdigheter… | `A/AG19CaddieHub.tsx:259-262` |
| CREDITS = TIMEKLIPP | COACHING-TIMER | `A/AG20Okonomi.tsx:79` |
| Vis medlemskap TALENT og FULL | Vis nivåene Gratis og Full | `A/AG23Oppsett.tsx:516` |
| Nye saker i Kø | Nye saker i Innboks | `A/AG23Oppsett.tsx:443` |
| Åpne Kø eller Caddie… | Åpne Innboks eller Caddie… | `A/AG24Drift.tsx:128` |
| Talentradar mot peer-snitt, discovery og WAGR. | Talentradar mot snittet i kategorien, talentdager og WAGR. | `A/AG22InnsiktTalent.tsx:243` |
| Oppgaven er fullført. | Oppgaven er markert som gjort. | `A/AG21Oppgaver.tsx:176` |
| Hjelpetrener / hjelpetrener | Assist Coach | `src/app/admin/grupper/[id]/legg-til-medlem-modal.tsx:21` |
| Pro (nivåvalg for ny spiller) | Full | `src/components/admin/v2/AdminNySpillerV2.tsx:285`; `TrainLockSpillerNy.tsx:544` |
| Full PlayerHQ + AI-coach … | Full PlayerHQ + Caddie … | `AdminNySpillerV2.tsx:54` |
| AI-coach · skisse | Caddie · utkast | `src/components/admin/ai-plan-forslag-button.tsx:85` |
| PRO / FREE (tier i stallen) | Full / Gratis | `src/lib/admin/stallen-data.ts:149` |

### B10 WANG-trenerflaten og Team Norway

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Planlegg (Årsplan · Økter · Treningsbank · …) · Følg opp (… · Analyse) | I dag · Trening · Tester · Konkurranse · Meldinger · Elever (+ Administrasjon) | `src/app/team-wang/_data/coach-arsplan.ts:164-189` |
| Læringsfaser / Fase | Læringssteg | `src/app/team-wang/coach/coach-arsplan.tsx:939, 605` |
| …Uten ball → Lav hastighet → Auto… | …Uten ball → Lav hastighet → Automatikk. | `src/app/team-wang/_data/coach-arsplan.ts:11, 155` |
| CS50–80 / CS80–100, M0–M5, Fri → Krav → Utfordring → Konkurranse | Fjernes. Press: Alene · Observert · Konkurranse · Turnering | `coach-arsplan.ts:12-16`; `src/app/team-wang/_data/wang-plan.ts:619-627` |
| Mål for perioden | Målsetning for perioden | `src/app/team-wang/coach/coach-arsplan.tsx:809` |
| Del med eleven | Del med spilleren | `src/app/team-wang/coach/iup/[elevId]/iup-samtale.tsx:71` |
| …TrackMan, kortspill og fysikk | …TrackMan, nærspill og fysisk | `src/app/team-wang/_data/arsplan-fasit-2026-27.ts:163` |
| Live Watch / Live Tournament Watch | I turnering nå | `src/components/team-norway/tn-shell.tsx:65` |
| DataGolf | Data Golf (se E7) | `src/components/team-norway/tn-shell.tsx:86` |
| Hjelpetrener (fem TN-sider) | Avklares (se E3) | `src/app/team-norway/analyse/page.tsx:14` m.fl. |
| Logg | Registrer | `src/app/team-norway/spiller/[spillerId]/teknisk-plan/[planId]/page.tsx:204` |
| Mål uten ball · Mål lav hastighet · Mål full fart | Rep-mål uten ball · Rep-mål lav hastighet · Rep-mål automatikk | samme fil, linje 226-228 |
| Avslutt tilgang / Avsluttet tilgang | Trekk tilbake tilgang / Tilgangen er trukket tilbake | `src/components/team-norway/tn-tilgang-handlinger.tsx:34`; `tn-tilgang-visning.tsx:90` |
| Spilleren har ikke delt profilen med deg. | OK | `src/app/team-norway/workbench/page.tsx:342` |

### B11 Varsler

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Agent: TRAINING GAP (og andre koder) | Forslag: treningsgap | `src/lib/agents/notify-plan-action.ts:32-38` |
| Daily Brief — n spillere krever handling | Dagsbrief: n spillere trenger deg | `src/lib/agents/daily-brief-agent.ts:57` |
| AI Golf Coach er klar | Caddie er klar | `src/lib/agents/live-coach-agent.ts:323` |
| Prøvetime-lead: … | Ny forespørsel om prøvetime: … | `src/lib/agents/lead-oppfolging.ts:109` |
| Google Calendar må kobles til på nytt | Google-kalenderen må kobles til på nytt | `src/lib/google-calendar.ts:237` |
| …tilgjengelig for hele akademi. | …tilgjengelig for hele akademiet. | `src/app/admin/tester/foreslatte/actions.ts:61` |
| Mål oppnådd / «…» er markert som oppnådd. | Målsetning nådd / «…» er markert som nådd. | `src/app/portal/(legacy)/mal/goals-actions.ts:129-130` |
| Trukket fra månedlig saldo (N igjen). | Trukket ett klipp (N igjen). | `src/lib/booking/credit-booking.ts:214-215` |
| Klikk for å se | Trykk for å se | `src/lib/storage/video.ts:111` |
| Planendring / «{navn} flyttet en økt i planen» | OK | `src/lib/notifications/plan-endring-kjerne.ts:12-35` |
| Booking bekreftet / Booking avbestilt / Booking flyttet | OK | `src/lib/stripe/handle-event.ts:247` |

### B12 Visningsnavn i koden som bryter ordboken

Disse oversettelsene fra kodeverdi til skjermtekst ligger i felles moduler og slår gjennom på mange skjermer.

| Tekst i dag | Foreslått | Fil:linje |
|---|---|---|
| Teknikk (navn på aksen TEK, brukt i 19 filer) | Teknisk | `src/components/v2/core.tsx:206`; `src/lib/portal/translate-taxonomy.ts:64` |
| Slag (navn på aksen SLAG) | Golfslag | `src/lib/taxonomy.ts:11`; `src/lib/labels/taxonomy.ts:12`; `src/lib/pyramide.ts:45` |
| Auto (læringssteg, brukt i 12 filer) | Automatikk | `src/lib/ak-formel-visning.ts` `FASE_STEG` |
| Fri / Krav / Utfordring / Konkurranse (press) | Alene / Observert / Konkurranse / Turnering | `src/lib/ak-formel-visning.ts` `PRESS_NIVAER` |
| Ingen press / Lav press / Moderat press / Hoy press / Maks press | Alene / Observert / Konkurranse / Turnering | `src/lib/taxonomy.ts:220` |
| Slow-motion / Simulator (miljø M1/M2) | Fjernes (M0–M5 er utgått) | `src/lib/portal/translate-taxonomy.ts:20` |
| Belastning (filter med CS-verdier) | Fjernes (CS er utgått) | `src/components/portal/v2/AnalyseFilterBar.tsx:197` |
| Tee Total | Utslag | `src/components/teknisk-plan/constants.ts:36` |
| Approach / Around green | Innspill / Nærspill (se E6) | `src/lib/training/labels.ts:3-8` |
| A — OWGR Top 150 … K — HCP 15-25 | Navnene fra AK_BANDS (A World Elite … K Nybegynner Junior) | `src/components/admin/plan-templates/shared.ts:63` |
| Til godkjenning / Endring bedt om (planstatus) | Venter på spiller / Avvist | `src/components/portal/v2/WorkbenchV2.tsx:177-186` |
| Repetisjon (BLOKK) | Blokktrening | `src/lib/portal/translate-taxonomy.ts:57` |
| Hvile (FERIE) | Ferie | `src/app/portal/kalender/data.ts:42` |
| Påmeldt (bekreftet booking) | Bekreftet | `src/components/portal/v2/ForelderBarnDetaljV2.tsx:148` |
| Fullført (turnering) | Gjennomført | `src/lib/domain/turneringsresultat.ts:55` |
| Innendors · Loping · Svomming · Kolle · Hoy | Innendørs · Løping · Svømming · Kølle · Høy | `src/lib/taxonomy.ts:82-85, 134-138, 174, 223` |

---

## Del C · Skriveregler

### C1 Dato og klokkeslett

- **Full dato:** «19. mai 2026». Månedsnavn skrives med liten forbokstav (M 135).
- **Kort dato med ukedag:** «man 5. okt.». Ukedager og måneder forkortes med tre bokstaver, med liten forbokstav, og måneden med punktum. M angir ikke dette, så formen er en anbefaling (antatt). Designsystemet bruker «dd.mm.åååå» i meta-linjer (`designsystem/precision-athletics/readme.md:109`). Se D30.
- **Uke:** «Uke 41» i overskrifter og «uke 41» i løpende tekst (`docs/design-handoff/README.md:64`).
- **Klokkeslett:** 24-timersklokke, «kl. 09:00» (M 133).
- **Spenn:** med tankestrek, «03.10–04.10» og «kl. 09:00–10:30».
- **Varighet:** «60 min», «1 t 30 min», «20 sek» (M 134).
- **Relative ord:** «i dag», «i går», «i morgen», «denne uka» (M 91). Se E4 om «uka» eller «uken».

### C2 Tall og enheter

- **Desimaltegn:** komma, «72,4» (M 130).
- **Tusenskille:** mellomrom, «1 247» (M 131).
- **Prosent:** mellomrom før tegnet, «73 %» (M 132).
- **Tall og enhet:** mellomrom mellom, «150 m», «5 sett», «104 mph» (M 136).
- **Minustegn:** ekte minus, «−0,4», ikke bindestrek (M 137).
- **Strokes Gained:** alltid med fortegn og komma, «+1,2 / −0,4», med referanse og periode (M 137).
- **Avstand:**
  - Putting i fot. Meter kan stå i parentes.
  - Alt annet i meter. Aldri yards for spillere.
  - Kilde: M 139; B 1037.
- **Club Speed og Ball Speed:** mph (M 140).
- **Vinkler og spinn:** grader (°) og rpm (M 141).
- **Styrke:** «4 × 6 @ 90 kg · RIR 2» (M 685).
- **PEI:** lagres som brøk og vises i prosent, «3,8 %» (`src/lib/portal-tester/format-verdi.ts`). Antall desimaler er uavklart, se D28.
- **Mengdetelling:** «1 av 3 øvelser» (M 266).

### C3 Ukjent mot null

- **«—» (tankestrek)** betyr at verdien mangler eller er ukjent. Den skal ha en kort forklaring der det er plass, for eksempel «Referanse ikke satt» (M 144, 297; B 226).
- **«0»** betyr at verdien er målt og er null. Planlagt tid er aldri faktisk tid (M 144).
- **Fremtidige verdier** vises som «kommer», ikke som 0 (`designsystem/precision-athletics/readme.md:112`).
- **Bindestrek «-»** brukes aldri for ukjent.

### C4 Store og små bokstaver

- **Overskrifter, knapper og menyvalg:** stor forbokstav bare på første ord. Eksempler: «Start økt», «Publiser til spiller», «Ny teknisk plan» (`designsystem/precision-athletics/readme.md:110`).
- **Knapper:** verb først, to til tre ord. Ingen utropstegn (M 61–68).
- **Statuser:** stor forbokstav på første ord, «Venter på spiller» (M 305–312).
- **Versaler** brukes bare i kickere (små overskrifter over en tittel) og i meta-linjer med monofont, for eksempel «TRACKMAN · 24.09.2026».
- **Aksekodene** FYS · TEK · SLAG · SPILL · TURN skrives alltid i versaler.
- **Skilletegn:** midtprikk «·» mellom ledd i en linje.
- **TrackMan-parametere:** engelsk med stor forbokstav på hvert ord, «Club Speed». Ikke versaler.
- **Kategori:** «Kategori C» med stor K når det står alene. Midt i en setning skrives «kategori A–K».
- **Ingen emoji** i appen. Bruk tekst eller ikon (M 66).

### C5 «Målsetning» mot «mål»

- **Målsetning** er det spilleren sikter mot: resultatmål og prosessmål.
- **mål** står bare i sammensetninger om måltall: «rep-mål», «TrackMan-mål», «resultatkrav», «ukevolum mål».
- Feil: «Endre mål», «Mål oppnådd», «Mål for perioden».
- Riktig: «Endre målsetning», «Målsetning nådd», «Målsetning for perioden».
- Statusordet er **Nådd**, ikke «oppnådd».
- Kilde: M 85, 241, 312; B 71.

### C6 Brutto score

- **Score** er alltid brutto, altså ekte slag. Netto vises aldri (M 146, 732).
- **Til par** skrives i parentes: «71 (−1)».
- **Netto-klasser** fjernes med en liste over faktiske nettokoder, aldri med regelen «ender på N». Den regelen treffer også Open, Mann og A-klassen (B §Data; `docs/beslutningsgrunnlag/datakartlegging-2026-08-30.md:71-74`).
- **Kategori A–K** bygger på brutto snittscore, aldri på HCP (M 184).

### C7 Navn på organisasjoner og produkter

| Skriv | Ikke skriv | Kilde |
|---|---|---|
| AK Golf HQ | AK golf HQ, AKGolf HQ | M 81–82 |
| AK Golf Academy | Ak Golf Academy | M 82 |
| AK Golf Junior Academy / Junior Academy | Juniorakademiet | M 83 |
| PlayerHQ | Player HQ, Spillerportal (som navn) | M 77 |
| AgencyOS | CoachHQ, Agency OS | M 78 |
| AgenticOS | Synonym for Caddie | M 79 |
| Caddie | AI-coach, AI Golf Coach, Coach AI | M 80 |
| WANG Toppidrett | Wang, WANG toppidrett | `designsystem/wang/DATAMODELL.md:52` |
| Team Norway | Team Norway Golf (i appen), TNG (i UI) | `designsystem/team-norway/readme.md:160` |
| GFGK Junior | Gfgk Junior | B §Merke og tekst |
| TrackMan | Trackman, TM (i UI) | M 98 |
| Data Golf | Uavklart (se E7) | B §Data |
| Mulligan | Skal ikke knyttes direkte til AK Golf-merket | B §Merke og tekst |

MORAD og Mac O'Grady nevnes aldri offentlig (B §Merke og tekst).

---

## Del D · Motsigelser

| # | Tema | Kilde 1 | Kilde 2 | Anbefaling |
|---|---|---|---|---|
| D1 | Hvilket dokument er master for språk | `docs/treningsplanlegging.md` (AGENTS.md:11, 29; B 29.–30.09) | `docs/treningsplanlegging-og-sprak.md:3-5` kaller seg «eneste gjeldende master». Det gjør også skillen `playerhq-arkitektur` (SKILL.md:9, 55). B 1037 sier at valgtreet eies av `-gjennomgang.md` | `docs/treningsplanlegging.md` gjelder. Merk de tre andre som historiske |
| D2 | Ordmasteren i Precision kaller seg autoritativ | `designsystem/precision-athletics/guidelines/ordmaster.md:3`; `readme.md:104` | B 29.09: ordmasteren er avledet | Ordmasteren byttes med fila `treningsplanlegging-master-utkast.md` |
| D3 | Navn på appnivåene | M 155; B 30.09: Gratis / Full | `ordmaster.md:14-15`, `vocabulary.html`, `codex.md:548`: TALENT / FULL. Koden: Pro, PRO/FREE (`stallen-data.ts:149`). Prisma: `Tier` = GRATIS/PRO/ELITE | Gratis / Full på skjerm. Rett ordmaster og kode |
| D4 | Navnet på SPILL | M 451; B 75–76: «Spill» | `ordmaster.md:24`: «SPILL (Banespill)». BUSINESS-RULES 277–281: «Spilltrening» | Spill. Banespill er bare treningsområdet |
| D5 | Navnet på TEK og SLAG | M 449–450: Teknisk / Golfslag | `src/components/v2/core.tsx:206` og 19 filer: Teknikk / Slag. WANG: Slagtrening | Teknisk / Golfslag |
| D6 | Navn på periodene | M 370–371; B 429–436 | `-og-sprak.md:67, 96`: Spesialisering, Overgangsperiode, Pre-season. `-gjennomgang.md:101`: Evalueringsperiode. GFGK Junior (publisert): Spesialisering. WANG og TN: GRUNN/SPES/TURN | M gjelder. GFGK Junior venter på Anders (B 446) |
| D7 | Bånd for Innspill og Putting | M 492–494 | `-og-sprak.md:210-224`: «~150 m (125–175 m)», Kortputt, meter. `AARSPLAN-MOTOR-STATUS.md:39`: putt i meter. Teknisk plan-analyse: 0–3, 3–6, 6–10 ft | M gjelder |
| D8 | Uten ball | M 605; B 1033: eget læringssteg | BUSINESS-RULES 367–369: en egenskap ved øvelsen | M gjelder. Rett BUSINESS-RULES |
| D9 | Pyramiden styrer eller foreslår | M 454, 498: foreslår. Området styrer feltene | B 386, 1035: styrer kategoriseringen og øvelsesbanken | B (28.09) er nyest. Pyramiden velges først og filtrerer banken, men låser ikke feltene. Begge setningene kan stå |
| D10 | Måleutstyr | M 585–590: fire valg | Prisma `Maaleutstyr` og `ak-formel-v2.ts:213`: seks valg | M gjelder. Radartypen kan bli et underfelt |
| D11 | «Venter på coach» | M 307; B 716 | B 328 (28.09): «Send til coach» på forslag fjernes. Prisma `PlanStatus` har ingen PENDING_COACH, men koden bruker strengen (`PlanByggerV2.tsx:124`) | Se E5 |
| D12 | Godta eller Godkjenn når spilleren svarer | M 282–283: Avvis. Statusen heter «Godtatt» (M 307) | `PH01IDag.tsx:118`: Godkjenn / Avvis. AI-forslag: «Godkjent» (M 311) | «Godta» når spilleren svarer på en endring. «Godkjenn» når coach godkjenner et AI-forslag |
| D13 | Avbrutt økt | M 308: fem statuser, uten Avbrutt | `labels.ts:51-60`; design: avbrutt og avlyst er ulike (workbench-rest-designkontrakt:12) | Legg «Avbrutt» inn i M som sjette status |
| D14 | Gjennomført eller Fullført | M 215, 308: Gjennomført | Over 15 steder i koden bruker Fullført, Ferdig, Gjort eller Logget (del B) | Gjennomført |
| D15 | Registrere eller logge | M 223, 239 | Koden: Logg, Logget, Føre, Kladd (del B) | Registrere |
| D16 | Målsetning eller mål | M 85, 241 | M bruker selv «mål» om målsetning (M 327, 337, 365), og trinn 8 heter «Mål» (M 430). Koden: «Mål oppnådd», «Mål og strategi» | Målsetning. Trinn 8 kan hete «Mål og måling» eller beholde «Mål» som måltall |
| D17 | Planstatus i koden | M 307 | `WorkbenchV2.tsx:177-186`: «Til godkjenning», «Endring bedt om». Prisma har PAUSED, som M mangler | Bruk M-ordene. Pause trenger beslutning |
| D18 | Uketyper | Prisma `WeekType`: Utvikling · Vedlikehold · Turnering | `-og-sprak.md:123-128`: Utvikling · Turnering · Avlastning · Test · Forberedelse. `AARSPLAN-MOTOR-STATUS.md`: Avlastning, Test | Se E10 |
| D19 | Norske SG-navn | M 201: bare kodene | `docs/ordbok.json`: Utslag/Innspill/Nærspill/Putting. `src/lib/training/labels.ts:3`: Approach/Around green. Markedssidene: SG: Off the Tee | Se E6 |
| D20 | SG totalt | Ingen kilde i M | «SG Total» 15 steder, «SG totalt» 7, «SG total» 3 | SG totalt |
| D21 | Grenser for nok data | B 343–344: under 4 / 4–7 / 12 / 24 | `-og-sprak.md:302-317`: 8 / 8–11 / 12 / 24. `PH16Stats.tsx:349`: under 8 | B gjelder |
| D22 | Tiger 5 | B 355: «Bogey fra innenfor 130 m», «Bom på enkel opp-og-ned» | `hjelpetekster.ts:286`: fem andre regler. `load-min-golf.ts:304-327` teller bare tre | Se E8 |
| D23 | Bom på putt | B 362: På linja | `slag-resultat-detaljer.tsx:95`: På linje | På linja |
| D24 | Fart på putt | B 360–362: fart | Grillingen runde 8:513: kort/lang. Runderegistreringen: Kort/Forbi/Holt/Sone. TN Putt Speed: Lang/Kort/På mål | Kort · Forbi · I hull, felles for runde og test |
| D25 | Fairway og GIR | Ingen kilde i M | Fairway-treff, Fairwaytreff, Fairway treff, FW, FIR, FT %. GIR, GIR %, «GIR (green i reg.)» | Fairway-treff og GIR |
| D26 | Til par eller mot par | `hjelpetekster.ts:274` | «Mot par» i `RundeDetaljV2.tsx:186` m.fl. | Til par |
| D27 | Innspill eller inspill i testnavn | M 492: Innspill | `protokoll-definisjoner.ts:225` og seed: «Inspill Basis». B skriver «Inspill Basic» | Innspill Basis |
| D28 | PEI-visning | `format-verdi.ts:13`: to desimaler, «3,80 %» | Testbatteri-planen:75: «3,2 %», «5 %» | Én desimal |
| D29 | Club Speed | M 98–124, 140 | «Clubhead Speed (CHS)», «CHS (TM inne)», «Køllehastighet», «Svinghastighet». TN tilbyr mph, km/t og m/s (`tn-catalog.ts:26`) | Club Speed i mph |
| D30 | Datoformat | M 135: «19. mai 2026» | Designsystemet: «dd.mm.åååå». `PHIUP01Fireukerssjekk.tsx:33` | «19. mai 2026» i tekst. «19.05.2026» bare i mono-meta |
| D31 | Turneringstyper | M 478–482: Treningsturnering … | `AG11Moduler.tsx:45`: Trening / Utvikling / Prestasjon. «Utvikling» er også uketype | Fulle navn fra M |
| D32 | Treningsrunde og Tellende | M 527: Treningsrunde · Turneringsrunde | `PH09RegistrerRunde.tsx:460`: Treningsrunde · Tellende | M gjelder |
| D33 | Engelske ord i skjermtekst | M 61–68, 234–250 | Recap, Skills, digest, peer-snitt, discovery, Plan-hub, Live Watch, Daily Brief, lead, Leaderboard, Skill map | Norske ord. «Skill map» trenger et navn fra Anders, men står ikke blant spørsmålene |
| D34 | Rollenavn for hovedcoach | M 75: hovedcoach | B 159, 176, 382: head coach. Koden: HEAD COACH, Hovedcoach, Admin | Se E3 |
| D35 | Rollenavn for assistent | B 972: Assist Coach | Hjelpetrener (grupper og fem TN-sider), Assistent (WANG), assistant coach (designet) | Assist Coach i AK. Se E3 for TN |
| D36 | Forelder eller foresatt | M 76: Forelder er standard | WANG og TN bruker Foresatt som rolle. AG04: «foresatte» | Forelder. Foresatt bare juridisk |
| D37 | Elev eller spiller | M 74: Spiller | WANG bruker Elev. AgencyOS: «eleven», «utøvere» (`AG02Ko.tsx:431, 646`). IUP: «Del med eleven» | Spiller overalt unntatt WANG-menyen |
| D38 | Caddie eller Jarvis i AgencyOS | M 80, 178: Caddie ligger under Mer | B 1014: «Spør Jarvis» i hurtigknappen. B 375: Jarvis-chatten | Se E9 |
| D39 | Belastning har tre betydninger | M 231: bare intensitet, vekt og motstand | Miljø i AK-formelen (kodenavn), «belastning 1–10» etter golføkt (B 358), ACWR («Belastning 1,42», `data-trening.js:63`) og filteret med CS (`AnalyseFilterBar.tsx:197`) | Se E2 |
| D40 | Kategori A–K har fire definisjoner i koden | M 184–199; `ak-kategori.ts:41` | `plan-templates/shared.ts:63` (OWGR/HCP), `ai-plan/context.ts:180` (HCP), `wagr/ngf-kategori.ts:6` (WAGR, bare A–I) | `AK_BANDS` gjelder. De tre andre fjernes |
| D41 | Antall kategorier | M 184: 11 (A–K) | `kapabilitetskart-spillerutvikling-2026-09-28.md:17`: 12 bånd. Eldre: «A–L», «64–106» | 11 |
| D42 | CS-nivåer | M 735–737; B 1033: utgått | `~/.claude/CLAUDE.md` §4: uavklart. WANG-årsplanen: «CS50 min». `oktmal.md:67`. 38 filer i `src/` | Se E1 |
| D43 | Aldersgrenser i AK-stigen | `ak-stigen-data.ts:31-34` | `data-ag3.js:46-49` | Se E1. Koden gjelder til Anders sier noe annet |
| D44 | Antall Junior-spørsmål i IUP | B 258: 41 | `docs/design-handoff/README.md:55`: 43 (IUP 2027) | Versjonsforskjell: 41 i 2025, 43 i 2027. Bruk 43 fra IUP 2027 |
| D45 | Fireukerssjekk eller utviklingssjekk | B 258–260: fireukerssjekk er hendelsen, utviklingssjekk er spørsmålene | `iup-i-playerhq.md:23, 30` kaller PH-IUP-01 «Utviklingssjekk» | B gjelder |
| D46 | Trekk tilbake eller avslutt tilgang | B 271: «trekkes tilgangen» | TN: «Avslutt tilgang». Handoff 04.10: ingen knapp for gruppeinnsyn | Trekk tilbake tilgang |
| D47 | Egenført eller Ført | B 266: Egenført · Kontrollert | WANG: Ført · Kontrollert · Avvist (`wang-data.ts:80`) | Egenført |
| D48 | Fysiske testnavn | B 264: benkpress, markløft trapbar, lengdehopp, rotasjonskast, Club Speed | Seed: Trapbar Deadlift, Standing Long Jump, Ball Throw, Clubhead Speed. WANG: CMJ, Knebøy. Kast i cm mot m | B gjelder. Kast i cm |
| D49 | Data Golf | B §Data: «Powered by Data Golf» | 272 × «DataGolf», «Datagolf», «DATAGOLF» | Se E7 |
| D50 | Data Golf for hvem | B 776: bare Anders | Markedssidene lover «DataGolf-verktøyet» gratis (`MarkedPriserV2.tsx:20`). BUSINESS-RULES 52 åpner det for TALENT | Avgjøres i produkt, ikke i ordboken. Merket som motsigelse |
| D51 | uka eller uken | M 91: denne uka | M 298: «Ingen økter denne uken.» Koden bruker begge i samme skjerm (`PH10Plan.tsx:149, 199`) | Se E4 |
| D52 | Credits | M 159: coaching-time, ikke credit | BUSINESS-RULES 79–86: credits. B 683: klipp. `AG20Okonomi.tsx:79`: CREDITS | Klipp om enheten i pakken, coaching-time om timen |
| D53 | Mengde i AK-formelen | M 770: `PYRAMIDE_OMRÅDE_…` med Å | B 1032: `PYRAMIDE_OMRADE_…` | Bare kodenavn. Ingen betydning for skjermtekst |
| D54 | Konkurranse som treningsmiljø | M 473–474: TURN-økter får vanligvis Treningsmiljø Konkurranse | M 755–756: miljøet Konkurranse beholdes bare for eldre data | Ny planlegging uttrykker konkurranse som Press og Treningsmåte |

---

## Del E · Spørsmål til Anders

Bare spørsmål som ikke kan avgjøres ved å lese filene. Hvert spørsmål har en anbefaling.

**1. Hvilke nivåer brukes for spillere og for øvelser?**

Fakta fra kildene:
- **Spillere:** kategori A–K etter brutto snittscore, med navnene fra M 184–199 og `src/lib/domain/ak-kategori.ts`. I tillegg finnes AK-stigen (Mini → Basis → Utvikling → Elite) for juniorer, og Ung/Junior/Amatør/Profesjonell for WANG og Team Norway.
- **Designsystemets A–C, D–G og H–K finnes bare i demodata** (`data-trening.js:71-73`, `data-wb3.js:86`). Koden grupperer på to andre måter: A–C/D–F/G–I/J–K i `standard-fordeling.ts` og A/B/C–D/E–G/H–I/J–K i `ai-plan/system-prompt.ts`.
- **Øvelser har ikke noe nivå** i noen kilde.
- Aldersgrensene i AK-stigen er ulike i koden og designet.

Anbefaling:
- Kategori A–K er det eneste nivået for spillere.
- Øvelser får ikke nivå ved lansering. Hver standardplan tilpasses kategorien i stedet, slik B 164 sier.
- Fjern grupperingene fra designet til du har vedtatt dem.
- Bekreft at koden har riktige aldersgrenser for AK-stigen (til og med 10, 13, 15 og 19 år).

Begrunnelse: én skala er lettere å forstå, og grupper uten vedtak blir fort fasit ved et uhell.

**2. Hva er CS-nivåene, og hvor skal de brukes?**

Fakta fra kildene:
- CS var en gammel kode for svinghastighet: CS50–CS100 i databasen, CS0 og CS20–CS40 i eldre dokumenter.
- M 735–737 og B 1033 (21.09) sier at skalaen er utgått og erstattet av 25, 50, 75 og 100 % av spillerens egen Club Speed.
- Din globale instruks kaller CS «uavklart». WANG-årsplanen for 2026/27 bruker fortsatt «minimum CS50 for balltrening», og 38 filer i koden viser CS.

Anbefaling:
- Bekreft at CS er utgått overalt, også i WANG-årsplanen. «Lav hastighet 50 %» erstatter «CS50».
- Rett den globale instruksen.

Begrunnelse: to skalaer for samme ting gjør at spillere og trenere ikke vet hvilken som gjelder.

**3. Hva heter rollene på skjerm: «Hovedcoach» eller «Head coach», og hva heter assistenten i Team Norway?**

Anbefaling:
- AK Golf bruker **Hovedcoach** og **Assist Coach**.
- Team Norway beholder sitt eget ord **Hjelpetrener**, fordi TN har et eget designspråk.

Begrunnelse: M 75 sier allerede «hovedcoach», og «Assist Coach» er vedtatt 22.09. Det norske ordet passer i en norsk app.

**4. «uka» eller «uken», «økta» eller «økten»?**

Anbefaling: **uka** og **økta**, alltid.

Begrunnelse: M 91 bruker «denne uka», og de fleste skjermene bruker allerede a-formen. Bare én form gjør tekstene like.

**5. Skal statusen «Venter på coach» finnes?**

Anbefaling: nei, ikke for AK-spillere. Ta den ut av statuslista når «Send til coach» forsvinner.

Begrunnelse: spilleren godkjenner AI-forslag selv (B 328). Coach endrer planen direkte, og spilleren kan angre. Statusen beskriver da en flyt som ikke finnes.

**6. Hva heter SG-kategoriene på norsk?**

Anbefaling: **Utslag (OTT) · Innspill (APP) · Nærspill (ARG) · Putting (PUTT)**. Det norske ordet står først, og koden i parentes der det er plass.

Begrunnelse: ordene er de samme som treningsområdene, så spilleren kan se en svakhet i SG og finne øvelser til den. «Approach» og «Around green» forsvinner fra norsk tekst.

**7. Skal merkenavnet skrives «Data Golf» eller «DataGolf»?**

Anbefaling: **Data Golf**, slik selskapet skriver seg selv og slik B krever i «Powered by Data Golf».

Begrunnelse: én skrivemåte i kildelinjen og i menyen.

**8. Hvilke fem feil er Tiger 5?**

Fakta fra kildene: B nevner to (bogey fra innenfor 130 m, bom på enkel opp-og-ned). Hjelpeteksten har fem andre, og beregningen teller tre.

Anbefaling: skriv lista på fem i M. Koden, hjelpeteksten og beregningen rettes etter den.

Begrunnelse: tallet spilleren ser, må bygge på samme regler som teksten forklarer.

**9. Er Caddie og Jarvis to ulike assistenter?**

Anbefaling: **Caddie** er spillerens assistent i PlayerHQ. **Jarvis** er coachens assistent i AgencyOS, slik hurtigknappen «Spør Jarvis» allerede gjør.

Begrunnelse: M 80 sier Caddie, mens B 1014 og B 375 sier Jarvis i AgencyOS. To navn på samme ting forvirrer. To navn på to ting er greit når skillet er klart.

**10. Hvilke uketyper skal finnes?**

Anbefaling: **Utvikling · Vedlikehold · Turnering · Test** (koden pluss Test). «Avlastning» uttrykkes som perioden Restitusjon.

Begrunnelse: koden har tre typer. Eldre dokumenter har fem. Test brukes i ukenotatene allerede.

Disse er også uavklart, men har en tydelig anbefaling i del D og står derfor ikke blant de ti spørsmålene:
- «Belastning» om opplevd anstrengelse (D39). Anbefaling: «Opplevd belastning 1–10» etter økt. ACWR vises som «ACWR» med forklaring. Ordet «Belastning» alene brukes ikke.
- Reisedag og konkurransedag (A8). Anbefalingen står i Workbench-beskrivelsen, spørsmål 10: rundedagene blir konkurransedager, og reisedagene ligger rett før og etter.

---

## Vedlegg · Filer lest

Lesingen ble gjort av seks parallelle gjennomganger. Stier er relative til repoet når ikke annet står. Filer markert «(utdrag)» eller «(grep)» er lest i deler.

**Fasit og regler (14):**
- docs/treningsplanlegging.md
- docs/design-handoff/regler/treningsplanlegging-master.md
- docs/ordbok.md
- docs/ordbok.json
- docs/treningsplanlegging-og-sprak.md
- docs/treningsplanlegging-og-sprak-gjennomgang.md
- docs/platform/BUSINESS-RULES.md
- .claude/rules/beslutninger.md
- AGENTS.md
- CLAUDE.md
- docs/platform/AGENT-BRIEF.md
- docs/workbench/workbench-beskrivelse-2026-10-05.md (fra grenen docs/workbench-beskrivelse)
- prisma/schema.prisma
- ~/.claude/CLAUDE.md

**Design-handoff og designsystem (34):**
- docs/design-handoff/README.md
- docs/design-handoff/regler/iup-i-playerhq.md
- docs/design-handoff/regler/overforing-wang-tn.md
- docs/design-handoff/regler/claude-code.md
- docs/design-handoff/regler/kodestatus-2026-10-04.md
- docs/design-handoff/regler/skjermliste.md
- docs/design-handoff/regler/spesifikasjon-workbench-og-datakontrakt.md
- docs/design-handoff/kilde/iup-2027-kilde-2026-10-01.md
- docs/design-handoff/kilde/iup-2027-kilde-2026-10-01.json
- docs/design-handoff/design/shared/data-iup.js.txt
- designsystem/README.md
- designsystem/precision-athletics/guidelines/ordmaster.md
- designsystem/precision-athletics/guidelines/vocabulary.html
- designsystem/precision-athletics/readme.md
- designsystem/precision-athletics/LES-MEG.md
- designsystem/precision-athletics/skjermliste.md
- designsystem/precision-athletics/ui_kits/katalog.js
- designsystem/precision-athletics/ui_kits/_shared/data-trening.js
- designsystem/precision-athletics/ui_kits/_shared/data-wb3.js
- designsystem/precision-athletics/ui_kits/_shared/data-pub.js
- designsystem/precision-athletics/ui_kits/_shared/data-iup.js
- designsystem/precision-athletics/ui_kits/_shared/tn-scoring.js
- designsystem/precision-athletics/ui_kits/_shared/test-parts.jsx
- designsystem/precision-athletics/ui_kits/agencyos/data-stall.js
- designsystem/precision-athletics/ui_kits/agencyos/data-ag3.js
- designsystem/precision-athletics/ui_kits/agencyos/screens/AG-16.jsx
- designsystem/precision-athletics/overlevering/codex.md
- designsystem/precision-athletics/overlevering/teknisk-plan-playerhq-agencyos-analyse.md
- designsystem/precision-athletics/overlevering/round-sg-registration-2026-09-27.md
- designsystem/wang/TILGANGSMATRISE.md
- designsystem/wang/readme.md
- designsystem/wang/SKJERMREGISTER.md
- designsystem/wang/DATAMODELL.md
- designsystem/wang/APNE-BESLUTNINGER.md

**Designsystem, fortsatt (8):**
- designsystem/wang/PORTING.md
- designsystem/wang/fasit/arsplan-2026-27/WANG Arsplan 2026-27.dc.html (utdrag)
- designsystem/team-norway/readme.md
- designsystem/team-norway/LES-MEG.md
- designsystem/team-norway/SKILL.md
- designsystem/team-norway/handover/TILGANGSMATRISE.md
- designsystem/team-norway/handover/APNE-BESLUTNINGER.md
- designsystem/team-norway/docs/gap-iup-2025.md
- designsystem/team-norway-app/LES-MEG.md

**Øvrige dokumenter (26):**
- docs/AARSPLAN-MOTOR-STATUS.md
- docs/KARTLEGGING-TRENINGSPLANLEGGING.md
- docs/for-under-etter-spec.md
- docs/skjermtekst/skjerm-tekst-hovedskjermer.md
- docs/treningsplanlegger/wang-toppidrett/oktmal.md
- docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27/README.md
- docs/referanse/masterbrain-rebuild/00-SOURCE-INVENTORY.md
- docs/referanse/masterbrain-rebuild/07-OPEN-QUESTIONS.md
- docs/referanse/masterbrain-rebuild/02-PUTTING-BRAIN.md
- docs/beslutningsgrunnlag/grillingen-runde8-skjermer-2026-09-28.md
- docs/beslutningsgrunnlag/grillingen-runde9-wang-tn-2026-09-28.md
- docs/beslutningsgrunnlag/mulighetskart-wang-tn-2026-09-28.md
- docs/beslutningsgrunnlag/kapabilitetskart-spillerutvikling-2026-09-28.md
- docs/beslutningsgrunnlag/ordbok-og-workbench-analyse-2026-09-15.md
- docs/beslutningsgrunnlag/datakartlegging-2026-08-30.md
- docs/beslutningsgrunnlag/skjermkartlegging-2026-09-28.md
- docs/beslutningsgrunnlag/turneringsdata-spillerprofiler-analyse-2026-09-26.md
- docs/design-audit/testbatteri-kildekontroll-2026-10-02.md
- docs/design-audit/datagolf-precision-wang-team-norway-2026-10-02.md
- docs/planer/hovedprompt-wang-team-norway-playerhq-2026-10-02.md
- docs/planer/testbatteri-felles-testdag-og-livescoring-2026-10-02.md
- docs/planer/testbatteri-protokollregister-2026-10-02.json
- docs/planer/iup-2027-felt-og-beregningsregister-2026-10-02.md
- docs/planer/iup-2027-funksjonsmapping-2026-10-02.json
- docs/planer/plan-portering-claude-design-til-kode-2026-09-25.md
- docs/design-system/datagolf-claude-design-prompt-2026-09-10.md

**Skills (11):**
- .claude/skills/playerhq-arkitektur/SKILL.md
- .claude/skills/agencyos-arkitektur/SKILL.md
- .claude/skills/ak-hq-design/SKILL.md
- .claude/skills/ak-hq-design/references/ (grep i alle)
- .claude/skills/ak-hq-design/references/atletisk-intelligens.md
- .claude/skills/ak-merkevare/SKILL.md
- .claude/skills/agenticos/SKILL.md
- .claude/skills/design-system/SKILL.md
- ~/.claude/skills/playerhq-agents/SKILL.md
- ~/.claude/skills/gfgk-junior-treningsplanlegger/SKILL.md
- ~/.claude/skills/wang-arsplan/SKILL.md

**Kode: visningsnavn, enums og domene (44):**
- scripts/ordbok-json.ts
- src/lib/taxonomy.ts
- src/lib/labels/taxonomy.ts
- src/lib/portal/translate-taxonomy.ts
- src/lib/ak-formel-visning.ts
- src/lib/workbench/ak-formel.ts
- src/lib/domain/ak-formel-v2.ts
- src/lib/domain/workbench/labels.ts
- src/lib/domain/workbench/ovelse-detaljer.ts
- src/components/teknisk-plan/constants.ts
- src/components/workbench-hybrid/taxonomy.ts
- src/lib/feature-flags.ts
- src/lib/admin/stallen-data.ts
- src/lib/agencyos/ak-stigen-data.ts
- src/lib/domain/ak-kategori.ts
- src/lib/domain/spiller-kategori.ts
- src/lib/wagr/ngf-kategori.ts
- src/lib/ai-plan/context.ts
- src/lib/ai-plan/system-prompt.ts
- src/lib/plan-engine/standard-fordeling.ts
- src/lib/v2/hjelpetekster.ts
- src/components/admin/plan-templates/shared.ts
- src/lib/iup/utviklingssjekk.ts
- src/lib/iup/fireukerssjekk.ts
- src/lib/portal-tester/tn-catalog.ts
- src/lib/portal-tester/format-verdi.ts
- src/lib/domain/maal-plannivaa.ts
- src/lib/pyramide.ts
- src/components/v2/core.tsx
- src/components/v2/shell.tsx
- src/components/precision/PlayerHQSkall.tsx
- src/components/precision/AgencyOSSkall.tsx
- src/components/precision/ForelderSkall.tsx
- src/lib/agencyos/precision-ia.ts
- src/lib/agencyos/skall-ia.ts
- src/lib/admin/innboks/filter.ts
- src/app/admin/queue/status.ts
- src/lib/domain/pei/protokoll-definisjoner.ts
- src/lib/domain/pei/pei-beregning.ts
- prisma/scripts/seed-ngf-test-protocols.ts
- src/lib/fys-data.ts
- src/lib/domain/fys-score.ts
- src/lib/portal-fysisk/fysisk-data.ts
- src/lib/domain/turneringsresultat.ts

**Kode: runde, statistikk og Data Golf (16):**
- src/lib/runde-logg/types.ts
- src/lib/runde-logg/schema.ts
- src/components/portal/runde-logg/slag-resultat-detaljer.tsx
- src/lib/sg.ts
- src/lib/stats/sg-estimator.ts
- src/lib/training/labels.ts
- src/lib/min-golf/load-min-golf.ts
- src/lib/admin-spiller/spiller360-data.ts
- src/lib/scrapers/golfbox.ts
- src/components/portal/v2/DataGolfV2.tsx
- src/lib/datagolf/stasjon.ts
- src/lib/datagolf/challenge-data.ts
- src/components/admin/precision/AG17Turneringer.tsx
- src/components/marketing/v2/MarkedPriserV2.tsx
- src/components/wang/wang-data.ts
- src/components/wang/WangTester.tsx

**Kode: PlayerHQ-skjermer (60):**
- Alle filer i `src/components/portal/precision/`:
  - PH01 til PH25, inkludert PH13DrillBank, PH13DrillDetalj, PH16b, PH19-filene, PH24-filene og PH24d
  - PHIUP01, PHRD01, PHRD08, PHTP01
  - iup-evaluering.tsx, navngitt-deling.tsx, trenerdeling-aksept.tsx, trener-iup-svar.tsx, TreningsvolumVisning.tsx
- src/components/portal/workbench/OktArk.tsx
- src/components/portal/live/LiveCoachPanel.tsx
- src/components/portal/v2/ForeslaDrillV2.tsx
- src/components/portal/v2/StatistikkMetrikkV2.tsx
- src/components/portal/v2/TreningLoggV2.tsx
- src/components/portal/v2/InnstillingerAnleggV2.tsx
- src/components/portal/v2/ForelderV2.tsx
- src/components/portal/v2/WorkbenchV2.tsx
- src/components/portal/v2/AnalyseFilterBar.tsx
- src/components/portal/v2/MegV2.tsx
- src/components/portal/v2/ForelderBarnDetaljV2.tsx
- src/app/portal/error.tsx, not-found.tsx, loading.tsx, og de 28 `error.tsx` under src/app/portal/**
- src/app/portal/meg/abonnement/oppgrader/flyt/oppgrader-flyt-wizard.tsx
- src/app/portal/meg/abonnement/avbestill/page.tsx
- src/app/portal/meg/help/kategori/[slug]/page.tsx
- src/app/portal/kalender/data.ts
- src/app/forelder/page.tsx

**Kode: AgencyOS, Workbench, WANG og TN (66):**
- Alle 41 filer i `src/components/admin/precision/`
- `src/components/workbench/`:
  - WorkbenchShell.tsx
  - WorkbenchStall.tsx
  - WorkbenchUkeverksted.tsx
  - WorkbenchOkt.tsx
  - WorkbenchPlanHandlinger.tsx
  - SessionExecutionPanel.tsx
  - Ukeforslag.tsx
  - Trenerforslag.tsx
  - CreateSessionModal.tsx
- src/app/admin/grupper/[id]/legg-til-medlem-modal.tsx
- src/components/admin/team/team-kit.tsx
- `src/components/admin/v2/`:
  - AdminNySpillerV2.tsx
  - TrainLockSpillerNy.tsx
  - GruppeDetaljV2.tsx
  - AdminSpillerProfilV2.tsx
  - SpillerDashboardV2.tsx
  - AdminGodkjenningerV2.tsx
  - AdminTilgangV2.tsx
- src/components/admin/ai-plan-forslag-button.tsx
- src/components/admin/spiller-detalj/spiller-detalj.tsx
- src/components/admin/stall/StallPrecisionView.tsx
- src/components/admin/global-search-modal.tsx
- src/app/team-wang/_data/coach-arsplan.ts
- src/app/team-wang/_data/wang-plan.ts
- src/app/team-wang/_data/arsplan-fasit-2026-27.ts
- src/app/team-wang/coach/coach-arsplan.tsx
- src/app/team-wang/coach/page.tsx
- src/app/team-wang/coach/iup/[elevId]/iup-samtale.tsx
- src/app/team-wang/logg-inn/wang-innloggings-skjema.tsx
- src/app/team-wang/WangToppidrettPrecisionView.tsx
- src/components/team-norway/tn-shell.tsx
- src/components/team-norway/tn-tilgang-visning.tsx
- src/components/team-norway/tn-tilgang-handlinger.tsx
- src/components/team-norway/skjermer/ (alle, tekstsøk)
- src/components/team-norway/app/TeamNorwayAppView.tsx
- src/app/team-norway/analyse/page.tsx
- src/app/team-norway/wang-resultater/page.tsx
- src/app/team-norway/workbench/page.tsx
- src/app/team-norway/spiller/[spillerId]/tester/page.tsx
- src/app/team-norway/spiller/[spillerId]/analyse/page.tsx
- src/app/team-norway/spiller/[spillerId]/teknisk-plan/[planId]/page.tsx

**Kode: varsler (14):**
- src/lib/notifications/plan-endring-kjerne.ts
- src/lib/booking/varsle-ny-booking.ts
- `src/lib/agents/`:
  - notify-plan-action.ts
  - daily-brief-agent.ts
  - live-coach-agent.ts
  - winback-agent.ts
  - ukesrapport-ovelser-agent.ts
  - lead-oppfolging.ts
  - churn-radar.ts
- src/lib/google-calendar.ts
- src/app/admin/tester/foreslatte/actions.ts
- src/lib/booking/credit-booking.ts
- src/lib/storage/video.ts
- src/lib/stripe/handle-event.ts

**Totalt:** omtrent 300 filer, når hver fil i gruppene over telles én gang. I tillegg kommer målrettede utdrag fra rundt 40 andre kodefiler, som er sitert med fil og linje der de brukes.

**Ikke funnet:** `docs/TERMINOLOGI.md`, «D-19», `designsystem/precision-athletics/assets/ak-vocabulary.js` og oversettelsesfiler (i18n, locales og messages finnes ikke).

**Ikke tilgjengelig:** Claude Design-prosjektet. Tilkoblingen avviste innloggingen.
