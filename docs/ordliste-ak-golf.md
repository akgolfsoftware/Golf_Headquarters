# AK Golf — Ordliste & terminologi

> **Hensikt:** Single source of truth for alle norske ord, uttrykk og fagtermer brukt i PlayerHQ + CoachHQ. Rettskriv her FØRSTE GANG — alle endringer reflekteres automatisk siden komponenter bruker disse strings.
>
> **Vedlikehold:** Når du legger til/endrer ord, søk-erstatt i kode (`grep -r "gammelt ord" src/`).
>
> **Stavemåte-prinsipp:** Norsk bokmål. Bruk æ, ø, å. Norsk talleformat (`+3,5` med komma).

---

## 1. Roller

| Term | Bokmål | Notater |
|---|---|---|
| Spiller | spiller | aldri "elev" eller "atlet" |
| Coach | coach | aldri "trener" i UI (men ok i navn som "hovedcoach") |
| Hovedcoach | hovedcoach | én ord, ikke "hoved-coach" |
| Forelder | forelder / foreldre | flertall: foreldre |
| Admin | admin | systembruker |
| Akademi-coach | akademi-coach | bindestrek |

## 2. Diskipliner (pyramide-balanse, ALLTID uppercase)

| Term | Uppercase | Beskrivelse |
|---|---|---|
| Fysisk | **FYS** | Styrke, mobilitet, kondisjon |
| Teknisk | **TEK** | Swing, kontakt, plane, sekvens |
| Slag | **SLAG** | Slagspesifikk trening (pitch, putt, bunker) |
| Spill | **SPILL** | Spillsimulering, scoring, situasjoner |
| Turnering | **TURN** | Turneringsspesifikk forberedelse |

**ALLTID brukt slik:** `FYS · TEK · SLAG · SPILL · TURN` (i den rekkefølgen, dot-separator).

## 3. Strokes Gained (SG)

| Term | Bokmål | Forkortelse | Notater |
|---|---|---|---|
| Strokes Gained | strokes gained | SG | Engelsk fagterm beholdt |
| SG Total | SG-Total | SG-T | Bindestrek |
| SG Off-the-tee | SG-OTT | OTT | Sjelden norsk; bruk OTT |
| SG Approach | SG-APP | APP | Approach-spillet |
| SG Around-green | SG-ARG | ARG | Kort spill nær green |
| SG Putting | SG-PUTT | PUTT | Putting |
| SG-snitt | snitt-SG | — | Bruk "snitt" foran |
| SG-trend | SG-trend | — | |
| Benchmark | benchmark | — | Engelsk-norsk akseptert |
| Kategori-benchmark | kategori-benchmark | — | A1/A2/B1/B2 sammenligning |
| DataGolf | DataGolf | — | Egen merkenavn, CamelCase |
| SG-svakhet | SG-svakhet | — | Bindestrek |
| SG-potensial | SG-potensial | — | Norsk skrivemåte (med "potensial" ikke "potential") |

## 4. Treningsplanlegging — periodisering

| Term | Bokmål | Notater |
|---|---|---|
| Sesongplan | sesongplan | ett ord |
| Årsplan | årsplan | ett ord |
| Periodisering | periodisering | norsk |
| Periode | periode | flertall: perioder |
| Periode-blokk | periode-blokk | bindestrek |
| Periode-fase | periode-fase | bindestrek |
| Mac O'Grady-fasene | Mac O'Grady-fasene | apostrof med bokstavelig |

### Faser (i rekkefølge sesong)

| Fase | Bokmål | Engelsk fagterm | Notater |
|---|---|---|---|
| Grunntrening | grunntrening | base | Tidlig sesong, volum |
| Oppbygging | oppbygging | build | Generell utvikling |
| Spesialisering | spesialisering | specific | Disiplin-fokus |
| Konkurranse | konkurranse | peak / race | Toppform |
| Overgang | overgang | transition | Etter peak |
| Hvile | hvile | recovery | Aktiv hvile |

**Skjema-felt-navn:** `GRUNNTRENING / OPPBYGGING / SPESIALISERING / KONKURRANSE / OVERGANG / HVILE` (uppercase enum).

### Praksis-typer

| Term | Bokmål | Notater |
|---|---|---|
| Blokk-praksis | blokk-praksis | bindestrek |
| Random-praksis | random-praksis | engelsk-norsk |
| Differensiell-praksis | differensiell-praksis | |
| Variabel praksis | variabel praksis | uten bindestrek |

### CS-system (Capacity Stress)

| Term | Bokmål | Notater |
|---|---|---|
| CS-maks | CS-maks | bindestrek |
| CS70, CS75, CS80 | `CS70`, `CS75`, `CS80` | UPPERCASE + tall, ingen mellomrom |
| Belastning | belastning | "Belastning: Medium/Høy/Lav" |
| Volum | volum | timer/reps |
| Intensitet | intensitet | |

## 5. Trening — økter & drills

| Term | Bokmål | Notater |
|---|---|---|
| Treningsøkt | treningsøkt | ett ord |
| Økt | økt | kort form |
| Live økt | live økt | mellomrom |
| Drill | drill | flertall: drills (engelsk akseptert) |
| Drill-bibliotek | drill-bibliotek | bindestrek |
| Ny økt | ny økt | aldri "ny session" |
| Sett | sett | flertall: sett (uendret) |
| Reps | reps | flertall, fra "repetisjoner" |
| Repetisjoner | repetisjoner | full form |
| Serie | serie | flertall: serier |
| Hvile | hvile | mellom sett |
| Rest-timer | rest-timer | bindestrek |
| Område | område | hvor drillen utføres |
| Belastning | belastning | "low/medium/high" |
| Praksistype | praksistype | ett ord |
| Mål | mål | "70%", "10 reps" |

### Områder (på driving range / golfbane)

| Term | Bokmål | Notater |
|---|---|---|
| Driving range | driving range | mellomrom, anglisisme akseptert |
| Range | range | kort form |
| Range matte 4 | range matte 4 | "matte N" |
| Putting green | putting green | mellomrom |
| Chipping-område | chipping-område | bindestrek |
| Bunker | bunker | |
| Tee-område | tee-område | |
| Bane | bane | |
| Mulligan Indoor | Mulligan Indoor | proprietary navn |
| TrackMan-studio | TrackMan-studio | CamelCase navn |
| Simulator | simulator | |
| Innendørs | innendørs | ett ord |
| Utendørs | utendørs | ett ord |

### Status på økter

| Term | Bokmål | Badge-stil |
|---|---|---|
| Planlagt | planlagt | grå/forest |
| Av Anders | av Anders | mono forest badge |
| Selvplanlagt | selvplanlagt | lime badge |
| Fullført | ✓ fullført | grønn checkmark |
| Hoppet over | hoppet over | grå |
| Avbrutt | avbrutt | rød |
| I gang | i gang | lime puls |
| Live | LIVE | rød puls |

## 6. Mål & måltyper

| Term | Bokmål | Notater |
|---|---|---|
| Mål | mål | aldri "goal" i UI |
| Resultatmål | resultatmål | ett ord |
| Prosessmål | prosessmål | ett ord |
| Streak-mål | streak-mål | bindestrek |
| Outcome goal | resultatmål | engelsk → norsk |
| Process goal | prosessmål | |
| Aktivt mål | aktivt mål | flertall: aktive mål |
| Oppnådd | oppnådd | |
| Avbrutt mål | avbrutt mål | aldri "abandoned" |
| Mål-fremdrift | mål-fremdrift | bindestrek |
| Mål-progresjon | mål-progresjon | alternativ |
| Sannsynlighet | sannsynlighet | "38% sannsynlig" |
| Milepæl | milepæl | flertall: milepæler |

## 7. Turneringer

| Term | Bokmål | Notater |
|---|---|---|
| Turnering | turnering | flertall: turneringer |
| Konkurranse | konkurranse | synonym |
| Mitt hovedmål | mitt hovedmål | lime stjerne |
| Prioritet 1 / Prio 1 | PRIO 1 | uppercase |
| Major | MAJOR | uppercase i pill |
| Normal | NORMAL | |
| Local | LOCAL | |
| Påmeldt | påmeldt | aldri "registrert" |
| Avregistrert | avregistrert | |
| Trukket | trukket | "withdrew" |
| Bekreftet | bekreftet | |
| Plassering | plassering | "14. plass" |
| Score | score | engelsk akseptert |
| Snittscore | snittscore | ett ord |
| Cut | cut | engelsk fagterm |
| Lededagsleder | leder | enkel form |

### Turnerings-eksempler (default-data)

| Turnering | Bane | Dato | Format |
|---|---|---|---|
| Sørlandsåpent | Mandal Golfklubb | 10—12 juni | 54 hull stroke play |
| Bossum Open | Bossum GK | 24. juni | 36 hull |
| NM Slag | varierer | 8. juli | 72 hull |
| Trondheim Open | Trondheim GK | 22. juli | 54 hull |
| GFGK Mesterskap | GFGK | 5. august | Klubbmesterskap |

## 8. HCP & score-termer

| Term | Bokmål | Notater |
|---|---|---|
| HCP | HCP | aldri "handicap" i UI (men ok i sammensetning) |
| Handicap | handicap | i full tekst |
| HCP-utvikling | HCP-utvikling | bindestrek |
| HCP-mål | HCP-mål | bindestrek |
| Course Rating | course rating | engelsk fagterm |
| CR | CR | forkortelse |
| Slope | slope | engelsk |
| Par | par | "par 72" |
| Bogey | bogey | engelsk |
| Birdie | birdie | engelsk |
| Eagle | eagle | engelsk |
| Stroke play | stroke play | engelsk |
| Match play | match play | engelsk |
| Hull | hull | flertall: hull (uendret) |
| 9 hull / 18 hull | 9 hull / 18 hull | tall + mellomrom |

## 9. Kalender & tid

| Term | Bokmål | Notater |
|---|---|---|
| Kalender | kalender | |
| Dag | dag | |
| Uke | uke | "uke 21" |
| Måned | måned | |
| Sesong | sesong | |
| I dag | i dag | mellomrom |
| I går | i går | mellomrom |
| I morgen | i morgen | mellomrom |
| Denne uka | denne uka | aldri "denne uken" |
| Forrige uke | forrige uke | |
| Neste uke | neste uke | |
| Måned | måned | |
| Mandag–søndag | mandag, tirsdag, onsdag, torsdag, fredag, lørdag, søndag | lowercase |
| Man, Tir, Ons, Tor, Fre, Lør, Søn | kort | uppercase første bokstav |
| Januar–desember | januar, februar, mars, april, mai, juni, juli, august, september, oktober, november, desember | lowercase |
| Jan, Feb, Mar, Apr, Mai, Jun, Jul, Aug, Sep, Okt, Nov, Des | kort | uppercase første bokstav |
| Klokken | kl. | "kl. 09:00" |
| Tid | tid | 24h-format: "09:00" |
| Varighet | varighet | "60 min" / "1 t 30 min" |
| Min | min | minutter forkortelse |
| Time / timer | t | "2 t" |
| Sekund | sek | forkortelse |

## 10. Statistikk-termer

| Term | Bokmål | Notater |
|---|---|---|
| Statistikk | statistikk | aldri "stats" i UI |
| Snitt | snitt | aldri "gjennomsnitt" (lengre) |
| Trend | trend | |
| Trendlinje | trendlinje | ett ord |
| Pyramide-balanse | pyramide-balanse | bindestrek |
| Pyramide-fordeling | pyramide-fordeling | |
| Streak | streak | engelsk-norsk |
| Lengste streak | lengste streak | |
| Rekord | rekord | "personlig rekord" |
| Beste runde | beste runde | |
| Konsistens | konsistens | |
| Variasjon | variasjon | |
| Median | median | |
| Persentil | persentil | |
| Daglig | daglig | |
| Ukentlig | ukentlig | |
| Månedlig | månedlig | |

## 11. TrackMan-termer

| Term | Bokmål | Notater |
|---|---|---|
| TrackMan | TrackMan | CamelCase merkenavn |
| Club speed | club speed | engelsk fagterm |
| Ball speed | ball speed | engelsk |
| Smash factor | smash factor | engelsk |
| Carry | carry | engelsk (carry-distance) |
| Total distance | total distance | |
| Launch angle | launch angle | |
| Spin rate | spin rate | |
| Deviation | deviation | "Avvik" eller "dev" |
| Apex | apex | toppunkt |
| Attack angle | attack angle | |
| Club path | club path | |
| Face angle | face angle | |
| Sesjon | sesjon | TrackMan-økt |
| TrackMan-økt | TrackMan-økt | bindestrek |

## 12. Kølle-typer

| Term | Bokmål | Notater |
|---|---|---|
| Driver | driver | |
| Iron 7 / Jern 7 | jern 7 | "jern 7" eller "I7" |
| Wedge / Kile | wedge | engelsk akseptert |
| Putter | putter | |
| Hybrid | hybrid | |
| Fairway / Wood 3 | wood 3 | |
| Lengde-jern | lengde-jern | bindestrek |
| Midt-jern | midt-jern | bindestrek |
| Kort-jern | kort-jern | bindestrek |
| Approach-wedge | approach-wedge | |
| Sand-wedge | sand-wedge | |
| Pitching-wedge | pitching-wedge | |
| Lob-wedge | lob-wedge | |

## 13. Knapp-tekst & CTAs (standardisert)

| Funksjon | Bokmål | Stil |
|---|---|---|
| Lagre | Lagre | primary lime |
| Avbryt | Avbryt | outline |
| Lukk | Lukk | outline / X-ikon |
| Slett | Slett | danger |
| Bekreft | Bekreft | primary |
| Tilbake | Tilbake | outline |
| Neste | Neste → | primary |
| Forrige | ← Forrige | outline |
| Ferdig | Ferdig | primary lime |
| Fortsett | Fortsett | primary |
| Send | Send | primary |
| Be om | Be om økt | aldri "request" |
| Logg | Logg ny økt | aldri "log new" |
| Start økt | Start økt | lime primary med play-ikon |
| Avslutt | Avslutt | outline (i live-modus: lime) |
| Pause | Pause | outline |
| Gjenoppta | Gjenoppta | primary |
| Endre | Endre | outline |
| Rediger | Rediger | outline |
| Vis | Vis | outline |
| Skjul | Skjul | outline |
| Se mer | Se mer → | text-button forest |
| Se alle | Se alle → | text-button forest |
| Åpne | Åpne → | text-button forest |
| Last ned | Last ned | outline |
| Eksporter | Eksporter | outline |
| Importer | Importer | primary |
| Send melding | Send melding | primary lime |
| Be om hjelp | Be om hjelp | outline |
| Marker som lest | Marker som lest | outline |
| Marker oppnådd | Marker oppnådd | primary |
| Oppgrader | Oppgrader til Pro | primary lime |

## 14. Notifikasjoner & feedback

| Term | Bokmål | Notater |
|---|---|---|
| Varsel | varsel | flertall: varsler |
| Notifikasjon | notifikasjon | synonym, mer formell |
| Melding | melding | flertall: meldinger |
| Tråd | tråd | meldingstråd |
| Uleste | uleste | "5 uleste" |
| Vedlegg | vedlegg | flertall: vedlegg (uendret) |
| Spørsmål | spørsmål | flertall: spørsmål (uendret) |
| Svar | svar | flertall: svar (uendret) |
| Tilbakemelding | tilbakemelding | |
| Toast | toast | engelsk-norsk, UI-feedback |
| Suksess | Sendt! / Lagret! / Bekreftet! | korte beskjeder |
| Feil | Noe gikk galt | aldri "Error" |

## 15. Tier & abonnement

| Term | Bokmål | Notater |
|---|---|---|
| Tier | tier | engelsk-norsk, eller "nivå" |
| Gratis | Gratis | uppercase første bokstav |
| Pro | Pro | aldri "Premium" eller "Plus" |
| Elite | Elite | for selekterte spillere |
| Abonnement | abonnement | aldri "subscription" |
| Pris | pris | "300 kr/mnd" |
| Faktura | faktura | |
| Betaling | betaling | |
| Forfalt | forfalt | "800 kr forfalt" |
| Betalt | betalt | |
| Avbestill | Avbestill Pro | |
| Pause-abonnement | pause-abonnement | bindestrek |
| Oppgrader | oppgrader | "Oppgrader til Pro" |
| Nedgrader | nedgrader | |
| MVA | MVA | 25% |

## 16. AI & coach-hjelpere

| Term | Bokmål | Notater |
|---|---|---|
| AI | AI | |
| AI-foreslå | AI-foreslå | bindestrek |
| AI-coach | AI-coach | bindestrek |
| AI-generert | AI-generert | bindestrek |
| Forslag | forslag | |
| Anbefaling | anbefaling | |
| Anbefalt for deg | Anbefalt for deg | lime stripe |
| Hvorfor? | "Hvorfor?" | italic begrunnelse |
| Begrunnelse | begrunnelse | |
| Genererer... | Genererer... | progress-indicator |
| Caddie | Caddie | AI-assistent navn |
| Forbered meg | Forbered meg | AI-knapp |

## 17. Helse & skader

| Term | Bokmål | Notater |
|---|---|---|
| Helse | helse | |
| Skade | skade | |
| Symptom | symptom | flertall: symptomer |
| Smerte | smerte | |
| Smerteskala | smerteskala | 1-10 |
| Treningshelse | treningshelse | ett ord |
| Restitusjon | restitusjon | aldri "recovery" |
| Søvn | søvn | |
| Stress | stress | |
| Belastning | belastning | |
| Energinivå | energinivå | ett ord |

## 18. Tilstander & feedback-ord

| Term | Bokmål | Notater |
|---|---|---|
| Optimal | optimal | grønn |
| God | god | grønn |
| Moderat | moderat | gul |
| Lav | lav | gul/rød |
| Høy | høy | |
| Trenger oppmerksomhet | trenger oppmerksomhet | gul-orange |
| Trenger justering | trenger justering | |
| Klar | klar | "Klar til start" |
| Ikke klar | ikke klar | |
| Aktiv | aktiv | flertall: aktive |
| Inaktiv | inaktiv | flertall: inaktive |
| Pausert | pausert | aldri "paused" |
| Avsluttet | avsluttet | |

## 19. Hyppige uttrykk (eyebrows)

> Mono small uppercase letter-spacing 0.08em

| Eyebrow | Bokmål |
|---|---|
| MIN PLATFORM | `MIN PLATFORM` |
| MIN WORKBENCH | `MIN WORKBENCH` |
| MINE VARSLER | `MINE VARSLER` |
| MIN STALL | `MIN STALL` |
| TURNERING | `TURNERING` |
| PERIODE | `PERIODE` |
| UKE 21 | `UKE 21` (med tall) |
| DAG · 19. MAI | `DAG · 19. MAI` |
| LIVE · 09:42 | `LIVE · 09:42` |
| RACE 19 | `RACE 19` (sesong-uke teller) |
| COACH BRIEFING · MANDAG | `COACH BRIEFING · MANDAG` |

## 20. Hyppige hero-titler (mal)

| Mønster | Eksempel |
|---|---|
| "God morgen, [navn]" | God morgen, Markus |
| "[Tall] [substantiv] [verb] [italic-ord]" | 38 spillere venter |
| "Min [italic]workbench[/italic]" | Min *workbench* |
| "Lag *ny plan*" | Lag *ny plan* |
| "Mine *mål*" | Mine *mål* |
| "Din *innboks*" | Din *innboks* |

## 21. Personas (eksempel-data)

| Navn | Detaljer |
|---|---|
| **Markus Røinås Pedersen** | Spiller, HCP +3,5, A1, GFGK, 16 år |
| **Anders Kristiansen** | Head coach AK Golf, 38 aktive spillere |
| Joachim Tangen | Spiller, HCP +1,2, A1 |
| Emma Sundsdal | Spiller, HCP 4,8, A2 |
| Øyvind Røhjan | Spiller, HCP +3,5, A1 |
| Sigrid Berg | Spiller, HCP 8,2, B1 |
| Nora Lillevold | Spiller, HCP 12,4, B2 |
| Henrik Vorli | Spiller, HCP +0,4, A1 |
| Ida Mathisen | Spiller, HCP 3,1, A2 |

## 22. Klubber & lokasjoner (eksempel-data)

| Klubb | Forkortelse | Lokasjon |
|---|---|---|
| Gamle Fredrikstad Golfklubb | GFGK | Fredrikstad |
| Bossum Golfklubb | Bossum GK | Bærum |
| Mandal Golfklubb | Mandal GK | Mandal |
| Trondheim Golfklubb | Trondheim GK | Trondheim |
| Mulligan Indoor | — | Innendørs simulator-fasilitet (AK Golf) |

## 23. Tall, dato, tid — formatering

| Kontekst | Bokmål | Eksempel |
|---|---|---|
| Desimaltall | komma som desimalskille | `+3,5`, `72,4`, `0,42 SG` |
| Tusenseparator | mellomrom | `47 250 kr`, `1 247 reps` |
| Prosent | `%` med mellomrom | `73 %` (formelt) eller `73%` (kompakt) — VELG ÉN |
| Dato kort | `19/5` eller `19. mai` | bruk kontekst |
| Dato lang | `19. mai 2026` | månedsnavn lowercase |
| Tid | `09:00` | 24h ALLTID |
| Periode | `19—25 mai` | tankestrek (—), ikke bindestrek |
| Range | `100—150 m` | tankestrek |
| Tall + enhet | `60 min`, `21 dager`, `5 sett` | mellomrom |
| Pluss-prefix HCP | `+3,5` | viktig at + er der |
| Minus-prefix HCP | `−3,5` | bruk minus-tegn (−), ikke bindestrek |

## 24. Forbudt-liste

❌ **Aldri bruk disse i UI:**

| Forbudt | Bruk i stedet |
|---|---|
| Elev | spiller |
| Trener (alene) | coach |
| Goal | mål |
| Session | økt |
| Workout | økt |
| Stats | statistikk |
| Schedule | plan / kalender |
| Subscription | abonnement |
| Cancel | avbryt / avbestill |
| Save | lagre |
| Submit | send |
| Loading... | Laster... |
| Error | Noe gikk galt |
| Click | klikk (norsk, ikke "click here") |
| Sign in | logg inn |
| Sign out | logg ut |
| Username | brukernavn |
| Password | passord |
| All / Show all | Alle / Vis alle |
| 🏌️ ⛳ 🎯 ⭐ | Lucide SVG-ikoner |

---

## Endrings-prosess

1. **Endre i denne fila først.**
2. Søk-erstatt i kode:
   ```bash
   grep -rln "gammelt ord" src/ | xargs sed -i '' 's/gammelt ord/nytt ord/g'
   ```
3. Verifiser: `npx tsc --noEmit && npm run build`
4. Commit med meldingsformat: `chore(ordliste): "X" → "Y"`

**Sist oppdatert:** 2026-05-20 (Markus R.P. som default-spiller, AK Golf v2-design)
