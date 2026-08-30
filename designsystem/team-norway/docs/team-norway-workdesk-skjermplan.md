# Team Norway i AK Golf HQ — dokumentkilder og planlagte skjermer

Funn fra `akgolf-hq`, 30.08.2026. Formålet er å vite hva som faktisk er bestilt før dette designsystemet tegner flere skjermer.

## Relevante dokumenter

Rangert etter hvor styrende de er.

| Fil | Hva den gir |
|---|---|
| `.claude/rules/beslutninger.md` | **Den viktigste.** Ligger utenfor `docs/`. Blokkene «TEAM NORWAY-WORKDESK — spesifikasjon» (8 punkter), «WANG/TEAM NORWAY — fire svar», «FORRETNINGSMODELL: SPILLERLISENSER». Dette er byggeordren. |
| `docs/kartlegging-teamnorway-wang-playerhq.md` | 226 linjer. Hva som finnes i kode vs. hva som er plan. §8 «Underlag for design» gir data/tilstander/handlinger per eksisterende skjerm. |
| `docs/MASTERPLAN-GJENSTAAENDE.md` | STEG 11 (bølge N, N7–N14) = organisasjonsflaten og føringsskjermen. STEG 6 (6.4, 6.8) = TN-status og lisensmodell. Låste beslutninger N-D1→N-D5. |
| `docs/treningsplanlegger/wang-toppidrett/grunnlag-funn.md` | TN-rammeverket: fem prosesser, 11-tests batteri, periodiseringspyramiden, Investeringsperioden 16–19 år. |
| `docs/treningsplanlegger/wang-toppidrett/arshjul-2026-2027.md` | TN-testperiode uke 34–36, intern test/eval uke 43. |
| `designsystem/train-lock/HANDOFF.md` | Navneregler: «TN-batteri Q3», aldri «PEI Q3 · X av 8 stasjoner». Testhub-struktur. |
| `docs/platform/BUSINESS-RULES.md` | TN IUP Ref-ark 2025 som putting-benchmark. |
| `docs/arkitektur-kartlegging-2026-08-30.md` | `/admin/team/ekstern` — administrasjon av ekstern lesetilgang. |

## Status i kode

Team Norway finnes **ikke** som egen flate. Eneste spor er en `Group`-rad med `slug: "team-norway"`, `kind: "ekstern"`, `managedByAkGolf: false`, pluss generisk ekstern-leser-infrastruktur. Alt annet er plan.

Tre skjermer eksisterer i dag:

- `/innsyn` — ekstern leser-oversikt, samtykkebaserte grupper
- `/innsyn/[spillerId]` — spillerdetalj, kun samtykket scope (`TEST_RESULTATER` / `STATS`)
- `/admin/team/ekstern` — gi og trekke ekstern lesetilgang

## Planlagte skjermer

Fra Workdesk-spesifikasjonen og bølge N. Ambisjonen er å erstatte Messenger-grupper, e-post og Word/Excel.

### Ramme

1. **Organisasjonsskall (TN)** — egen flate, aldri under AgencyOS. Logo, skinne og handlingsfarge arves per organisasjon.
2. **Oversikt (TN)** — dekningsgrad-kortet («4 av 11 med profil») er **obligatorisk** her.

### Test

3. **Testprotokollbibliotek** — protokoller deles på tvers av AK Golf, WANG og TN. Opprettes én gang. Versjonert og låst ved første bruk; resultater peker på versjonen, endring gir ny versjon.
4. **Test-føringsskjerm** — det ekte skjermgapet. Én trener fører mange spillere gjennom samme protokoll på testdag. Flyt: velg protokoll → før spiller for spiller i kø. Fysiske tester er primærcase (10+ elever etter tur på samme øvelse). Tre arketyper: port, tall, stige. Pluss PEI-variant.
5. **Attestering** — skriver til `test_shots`.
6. **Egne tester** — TN kan opprette egne protokoller.

### Uttak

7. **Uttak / uttakskriterier** — `selection_criteria`, `selection_scores`, vurderingsmatrise. To harde regler: appen konkluderer aldri, uttak er alltid underlag. Og det heter **«vurdering»**, aldri «karakterer» — skolens karakterer holdes utenfor appen.

### Kommunikasjon

8. **Grupper med poster** — trener poster til gruppen med video, bilder, lenker og vedlegg (flybilletter, hotell). **Ingen fri chat.**
9. **Poster til enkeltspiller** — 1:1 til mindreårige skal være sporbare og synlige for forelder.
10. **Dokumentdeling per gruppe** — med lesekvittering («12 av 14 har åpnet uttakskriteriene») og «sist oppdatert»-merking.

### Samling

11. **Samlingspunkt** — samlinger. Gapet i datamodellen: ingen kobling mellom `GroupSchedule` (`SAMLING`/`HELDAGSSAMLING`) og spillernes `WorkbenchSession`. Og ingen modell for *hvem som er tatt ut* til en gitt samling — en testdag er ikke nødvendigvis hele gruppa.

### Analyse

12. **Analyse ×4** — AnalyseTerminal, SpredningsAnalyse, KohortUtvikling, ResultatVsFelt. Tre motorer aldri blandet.
13. **DataGolf ×3** — DataGolfProfil, TruthLayer. Attribusjon «Data powered by DataGolf» er lisenskrav.
14. **GolfBox-resultater**.
15. **Kartlegging av spillere** — landskapsanalyse av norsk juniorgolf, ikke internt register: antall Olyo-/Srixon Tour-spillere per region, nivå, konkurranser per år, klubber med flest spillere per klasse. Datagrunnlaget finnes (941k resultater). **Venter på Anders' MD-fil** før bygging.

### Den navngitte listen — funnet

`CoachShell.tsx` i `akgolfsoftware/talenthq@main` inneholder TN-navigasjonen. Dette er de faktiske skjermene, ikke en rekonstruksjon.

**TN-egne ruter (5):**

| Rute | Menytittel | Gruppe |
|---|---|---|
| `/team-norway` | Oversikt | Daglig |
| `/team-norway/fellestesting` | Fellestesting | Daglig |
| `/team-norway/uttak` | Uttaksliste | Uttak |
| `/team-norway/view` | Rangliste | Uttak |
| `/team-norway/skoler` | Skoleoversikt | Skoler |

**Delte ruter TN-menyen peker på (9):** `/cockpit` (Treneroversikt), `/testbatteri`, `/analyse`, `/utvikling` (Spillerutvikling), `/admin/turneringer`, `/datagolf` (DataGolf-terminal), `/spredning` (Spredningsanalyse), `/truth` (Sannhetslag), `/kohort-explorer` (Kohort-utvikling).

Dette forklarer «Team Norway ×7» i N-D5: de fem TN-egne pluss to som ikke ligger i menyen (sannsynligvis innlogging og merkeoppsett). De ni delte er talt separat under Testføring/Analyse/DataGolf.

**Merk gruppestrukturen** — Daglig / Uttak / Skoler / Data. TN-menyen har `Fellestesting` som egen rad ved siden av `Testbatteri`; det er nettopp føringsskjermen N8 beskriver.

Nyttig funn i tillegg: `ProtocolScorecard.prompt.md` dokumenterer **16 TN-testprotokoller** — 9 Golfslag-tester (8-ball variation/blocked, Golfslag bane, Driver basic, Inspill Basis, Wedge Variation, 18-hull, Putt 1–3 m, 9 hull lengde) og 7 Teknikk-porter (Nærspill/Wedge/Driver/Putt Gate, VISA Express, Putt Speed 1×5 / 3×3). `grunnlag-funn.md` sier 11 tester × 3 kjøringer. De to tallene må avstemmes.

### Ikke funnet

## Låste beslutninger som binder designet

| # | Beslutning |
|---|---|
| N-D1 | Egen organisasjonsflate for WANG/TN. Aldri under AgencyOS. «Det skal være egne skjermer.» |
| N-D2 | TN-rød **kun** på logo og skinne, aldri som statusfarge — kolliderer med `--tl-danger`. |
| N-D3 | PEI = resultat ÷ lengde. Lavere er bedre. |
| — | Dataansvar: AK Golf eier alt. Hver spiller/forelder samtykker direkte til AK Golf. |
| — | Pilot høsten 2026: Anders + 2–5 navngitte TN-trenere, tilgang kun til egne grupper. Bevis på én samling før utrulling. |
| — | Gratis pilot 2026/27 → spillerlisenser fra 2027. Organisasjonen betaler aldri for plattformen, kun for lisenser. |
| — | TN-spillere har **krav** om komplett PlayerHQ (FULL-tilgang). |
| — | NGF-samarbeidet er produktleveranse, ikke rapportplikt. |

## Avvik mot dette designsystemet — status

Alle fem er nå avklart.

**1. Rødfargen — avgjort.** Fire kandidater fantes: `#D70232` (målt fra logofilen), `#D50431` (N-D2), `#BA0C2F` (talenthq `logos/`), `#EF2B2D` (talenthq `ds-logos/`).

To av dem er provbart ikke logoens: `#BA0C2F` + `#00205B` er **Pantone 200 / 281** — det norske flaggets spesifikasjon, ordrett. `#EF2B2D` + `#002868` er **«Old Glory Red» / «Old Glory Blue»** — det amerikanske flagget, ordrett. Begge er plassholdere plukket fra flaggpaletter, og de to SVG-ene er dessuten håndtegnede med feil strekproporsjoner og generisk skrift.

`#D50431` har ingen oppgitt kilde. `#D70232` er målt fra logofilen.

**Beholdt: `#012B5D` / `#D70232`.** N-D2 og begge SVG-ene i talenthq bør rettes. Ekte vektorlogo bør hentes fra NGF.

**2. Regelen om rødt — ingen konflikt.** N-D2 sier rødt kun på logo og skinne, aldri status. Dette systemet landet uavhengig på samme regel. Konvergens.

**3. Pyramideterminologien — rettet.** `PyramidDiagram` bruker nå de kanoniske kortformene **TURN / SPILL / SLAG / TEK / FYS** i figuren, med det fulle navnet som undertittel. Propagert til utøverdashboardet og presentasjonsmalen.

De fem TN-**prosessene** er en annen akse: Strategisk, Teknisk, Fysisk, Mentalt, Sosialt. Terminologikortet er rettet til den rekkefølgen.

**4. Årsplanens faser — rettet.** Fra fire oppdiktede faser til kanoniske tre: **GRUNN** uke 44–11, **SPES** uke 12–16, **TURN** uke 17–42. Test- og evalueringsuken (uke 43) er nå et hendelsesmerke på tidslinjen, ikke en fase.

Periodegrensene er fortsatt uavklarte i kildene selv (GRUNN slutt uke 10 vs 11; SPES start uke 11, 12 eller 14). Årsplanen bruker uke 11/12 og punktet står som åpent i readme.

**5. Designsystemets myndighet — arbeidsdeling foreslått.** Skrevet ut i readme under «Forholdet til Train-lock»: Train-lock eier plattformens flater, dette systemet eier `/team-norway/*`. Ingen skjerm har to fasiter. **Krever bekreftelse** — N7 er i dag formulert som om Train-lock skal tegne også TNs egne skjermer.

## Det som mangler i datamodellen

Fra kartleggingens §6, verdt å vite før skjermer tegnes som forutsetter det:

- Ingen kobling mellom en `GroupSchedule`-samling og spillernes `WorkbenchSession`. To lag som ikke vet om hverandre.
- Ingen modell for uttak til en enkelt samling utover ordinært `GroupMember`-medlemskap.
- Ingen `PlayerProgram`-verdi for Team Norway — kun `Group.slug`. All WANG-spesifikk kode fanger derfor ikke TN-spillere.
- Ingen organisasjonsbetalt abonnementsmodell. Spillerlisens-beslutningen har ingen teknisk representasjon.
- To ulike tilgangsveier (COACH-eierskap vs. ekstern-leser-samtykke) ser **ikke** det samme. En Workdesk må velge hvilken den bygger på.
