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

### 2A. FYS — fysiske underkategorier

| Term | Bokmål | Notater |
|---|---|---|
| Styrke | styrke | generell |
| Maks-styrke | maks-styrke | bindestrek |
| Eksplosiv styrke | eksplosiv styrke | uten bindestrek |
| Power | power | engelsk-norsk akseptert |
| Spenstighet | spenstighet | hopp + pliometrisk |
| Pliometrisk | pliometrisk | trening |
| Kondisjon | kondisjon | utholdenhet |
| Utholdenhet | utholdenhet | aerob + anaerob |
| Intervall | intervall | |
| Mobilitet | mobilitet | bevegelighet |
| Hofte-mobilitet | hofte-mobilitet | bindestrek |
| Skulder-mobilitet | skulder-mobilitet | bindestrek |
| Rygg-mobilitet | rygg-mobilitet | bindestrek |
| Stabilitet | stabilitet | core + leddstabilitet |
| Core-stabilitet | core-stabilitet | bindestrek |
| Anker | anker | "lower body anchor", forklarende |
| Koordinasjon | koordinasjon | |
| Balanse | balanse | |
| Beinstyrke | beinstyrke | ett ord |
| Core | core | engelsk-norsk |
| Overkroppstyrke | overkroppstyrke | ett ord |
| Rotasjonsstyrke | rotasjonsstyrke | ett ord |
| Hofterotasjon | hofterotasjon | ett ord |
| Spinal-mobilitet | spinal-mobilitet | bindestrek |
| Restitusjon | restitusjon | |
| Aktiv hvile | aktiv hvile | uten bindestrek |
| Statisk tøyning | statisk tøyning | |
| Dynamisk oppvarming | dynamisk oppvarming | |

### 2B. TEK — tekniske underkategorier

| Term | Bokmål | Notater |
|---|---|---|
| Swing-mekanikk | swing-mekanikk | bindestrek |
| Swing-sekvens | swing-sekvens | bindestrek |
| Kinematisk kjede | kinematisk kjede | "kinetic chain" |
| Plane | plane | engelsk fagterm |
| Swing-plane | swing-plane | bindestrek |
| On-plane | on-plane | |
| Steep / Shallow | brattere / flatere | |
| Kontakt | kontakt | "Konsistent kontakt" |
| Lavpunkt | lavpunkt | "bottom of arc" |
| Treff-punkt | treff-punkt | bindestrek |
| Strike location | strike location | engelsk-norsk |
| Sekvens | sekvens | hvordan kroppen jobber |
| Tempo | tempo | |
| Rytme | rytme | |
| Balanse | balanse | i swingen |
| Posisjon | posisjon | "Topp-posisjon" |
| Topp-posisjon | topp-posisjon | bindestrek |
| Slutt-posisjon | slutt-posisjon | bindestrek |
| Setup | setup | engelsk fagterm |
| Grep | grep | hånd på køllen |
| Stance | stance | engelsk-norsk |
| Posture | posture | engelsk-norsk |
| Alignment | alignment | sikt + føtter |
| Sikt | sikt | "Sikt mot flagg" |
| Sikting | sikting | |
| Rotasjon | rotasjon | |
| Hip rotation | hofterotasjon | norsk form |
| Shoulder rotation | skulderrotasjon | norsk form |
| Hip-shoulder separation | hofte-skulder-separasjon | bindestreker |
| X-factor | X-factor | engelsk fagterm |
| Hånd-banen | hånd-banen | bindestrek |
| Klubbhastighet | klubbhastighet | ett ord, mph eller m/s |
| Klubbflate | klubbflate | "face angle" |
| Face angle | face angle | engelsk |
| Klubbveis | klubbveis | "club path" |
| Klubb-bane | klubb-bane | "club path" alternativ |
| Angle of attack | angle of attack | engelsk fagterm |
| Attack angle | attack angle | kort form |
| Loft | loft | klubbloft |
| Dynamic loft | dynamisk loft | norsk form |
| Spin-akse | spin-akse | bindestrek |
| Spin rate | spinrate | ett ord eller med mellomrom |
| Compression | compression | engelsk fagterm |
| Lead arm | lead arm | engelsk |
| Lag | lag | "Bevare lag" |
| Release | release | engelsk |
| Hands ahead | hands ahead | engelsk-norsk |
| Følge gjennom | følge gjennom | "Follow-through" |
| Follow-through | follow-through | bindestrek |
| Impact | impact | engelsk |
| Takeaway | takeaway | engelsk |

### 2C. SLAG — slag-spesifikke kategorier

| Term | Bokmål | Notater |
|---|---|---|
| Full swing | full swing | mellomrom |
| Drive | drive | "tee-shot" |
| Iron-spill | iron-spill | bindestrek |
| Jern-spill | jern-spill | norsk form |
| Approach-spill | approach-spill | bindestrek |
| Innspill | innspill | "approach" norsk |
| Wedge-spill | wedge-spill | bindestrek |
| Kile-spill | kile-spill | norsk form |
| Pitch | pitch | engelsk |
| Pitch-skudd | pitch-skudd | bindestrek |
| Chip | chip | engelsk |
| Chip-skudd | chip-skudd | bindestrek |
| Bump and run | bump and run | engelsk fagterm |
| Flop shot | flop shot | engelsk |
| Lob shot | lob shot | engelsk |
| Punch shot | punch shot | engelsk |
| Knockdown | knockdown | engelsk |
| Stinger | stinger | engelsk fagterm |
| Bunker-spill | bunker-spill | bindestrek |
| Greenside bunker | greenside bunker | engelsk-norsk |
| Fairway-bunker | fairway-bunker | bindestrek |
| Plugged lie | plugged lie | engelsk |
| Buried lie | buried lie | engelsk |
| Putting | putting | engelsk |
| Putt | putt | enkelt slag |
| Kort-putt | kort-putt | bindestrek, 0–3m |
| Mid-putt | mid-putt | 3–6m |
| Lang-putt | lang-putt | 6m+ |
| Lag-putt | lag-putt | "speed putting" |
| Distance-kontroll | distance-kontroll | bindestrek |
| Avstandskontroll | avstandskontroll | ett ord, norsk form |
| Linje-kontroll | linje-kontroll | bindestrek |
| Lese green | lese green | "green reading" |
| Green-lesing | green-lesing | bindestrek |
| Break | break | engelsk fagterm |
| Speed | speed | "puttingspeed" |
| Tempo (putting) | tempo | i putting-kontekst |
| Draw | draw | venstre-buet (høyrehendt) |
| Fade | fade | høyre-buet (høyrehendt) |
| Hook | hook | over-draw |
| Slice | slice | over-fade |
| Straight | rett | "Rett ball" |
| High ball | høyt slag | norsk form |
| Low ball | lavt slag | norsk form |
| Trajectory | trajectory | ballbane-engelsk |
| Ballbane | ballbane | ett ord, norsk |
| Lav trajectory | lav trajectory | "low ball flight" |
| Avstandsmål | avstandsmål | "50–100 m" |

### 2D. SPILL — spillsimuleringskategorier

| Term | Bokmål | Notater |
|---|---|---|
| Spillsimulering | spillsimulering | ett ord |
| 9-hulls spill | 9-hulls spill | bindestrek |
| 18-hulls spill | 18-hulls spill | bindestrek |
| Course management | course management | engelsk |
| Banespill | banespill | norsk form |
| Strategi | strategi | "Strategi-trening" |
| Smart spill | smart spill | |
| Risk-reward | risk-reward | engelsk |
| Risiko-belønning | risiko-belønning | norsk form |
| Layup | layup | engelsk |
| Plassering | plassering | "Ball-plassering" |
| Scrambling | scrambling | engelsk fagterm |
| Up-and-down | up-and-down | engelsk |
| Save par | save par | redning |
| Save bogey | save bogey | redning |
| Best-ball | best-ball | engelsk |
| Worst-ball | worst-ball | engelsk |
| Skins | skins | engelsk fagterm |
| Stableford | stableford | engelsk fagterm |
| Match-spill | match-spill | bindestrek |
| Match play | match play | engelsk |
| Stroke-spill | stroke-spill | bindestrek |
| Pressure-shot | press-slag | norsk form |
| Pres | pres | "under pres" |
| Press handling | takle pres | norsk form |
| Spill mot scorekort | spill mot scorekort | |
| Spill mot motstander | spill mot motstander | match play |
| Scoring | scoring | "Scoring-drill" |
| Konkurranse-simulering | konkurranse-simulering | bindestrek |

### 2E. TURN — turnerings-spesifikke kategorier

| Term | Bokmål | Notater |
|---|---|---|
| Turneringsforberedelse | turneringsforberedelse | ett ord |
| Mental forberedelse | mental forberedelse | |
| Visualisering | visualisering | "Se slaget før det skjer" |
| Pre-shot rutine | pre-shot rutine | bindestrek |
| Post-shot rutine | post-shot rutine | bindestrek |
| Tee-off rutine | tee-off rutine | bindestrek |
| Oppvarming | oppvarming | "Pre-round warmup" |
| Pre-round | pre-round | engelsk fagterm |
| Post-round | post-round | engelsk fagterm |
| Banerecon | banerecon | "course recon" |
| Bane-vandring | bane-vandring | bindestrek |
| Yardage-book | yardage-book | bindestrek |
| Avstandsbok | avstandsbok | norsk form |
| Vind-spill | vind-spill | bindestrek |
| Vær-tilpasning | vær-tilpasning | bindestrek |
| Pace of play | spilletempo | norsk form |
| Round management | runde-strategi | norsk form |
| Lead protection | beskytte ledelse | norsk form |
| Comeback | comeback | engelsk-norsk |
| Mental ro | mental ro | |
| Pust-rutine | pust-rutine | bindestrek |
| Konsentrasjon | konsentrasjon | |
| Fokus-trigger | fokus-trigger | bindestrek |
| Reset-rutine | reset-rutine | bindestrek, etter dårlig slag |
| Selvprat | selvprat | ett ord |
| Self-talk | self-talk | engelsk-norsk |
| Mentaltrening | mentaltrening | ett ord |
| Visualiseringsøvelse | visualiseringsøvelse | ett ord |

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
| Range matte 1–N | range matte 4 | "matte N" |
| Range gress-tee | gress-tee | bindestrek |
| Range target | range target | engelsk-norsk |
| Putting green | putting green | mellomrom |
| Practice green | practice green | engelsk-norsk |
| Chipping green | chipping green | mellomrom |
| Chipping-område | chipping-område | bindestrek |
| Pitching-område | pitching-område | bindestrek |
| Bunker | bunker | |
| Greenside bunker | greenside bunker | mellomrom |
| Fairway-bunker | fairway-bunker | bindestrek |
| Tee-område | tee-område | bindestrek |
| Tee 1 | tee 1 | "tee N" |
| Fairway | fairway | |
| Rough | rough | engelsk |
| Semi-rough | semi-rough | bindestrek |
| Green | green | |
| Hovedbane | hovedbane | ett ord |
| Korthullsbane | korthullsbane | "pitch and putt" |
| Par-3 bane | par-3 bane | bindestrek |
| 9-hulls bane | 9-hulls bane | bindestrek |
| 18-hulls bane | 18-hulls bane | bindestrek |
| Mini-bane | mini-bane | bindestrek |
| Simulator | simulator | |
| Mulligan Indoor | Mulligan Indoor | AK Golf-fasilitet |
| TrackMan-studio | TrackMan-studio | bindestrek |
| GC Quad | GC Quad | merkenavn |
| Foresight | Foresight | merkenavn |
| Innendørs | innendørs | ett ord |
| Utendørs | utendørs | ett ord |
| Treningsrom | treningsrom | ett ord, fysisk gym |
| Gym | gym | |
| Restitusjonsrom | restitusjonsrom | ett ord |
| Klubbhus | klubbhus | ett ord |
| Locker-rom | locker-rom | bindestrek |
| Pro-shop | pro-shop | bindestrek |

### Trenings-modus & metoder

| Term | Bokmål | Notater |
|---|---|---|
| Blokk-praksis | blokk-praksis | bindestrek, samme drill gjentas |
| Random-praksis | random-praksis | bindestrek, drills randomiseres |
| Variabel praksis | variabel praksis | uten bindestrek |
| Differensiell praksis | differensiell praksis | |
| Constraint-based | constraint-based | engelsk fagterm |
| Game-based | game-based | engelsk |
| Spillbasert læring | spillbasert læring | norsk form |
| Mental praksis | mental praksis | uten utstyr |
| Dry swing | dry swing | engelsk, uten ball |
| Slow motion | slow motion | engelsk |
| Treningstempo | treningstempo | ett ord |
| Game speed | game speed | engelsk, "som i ekte runde" |
| Mirror practice | speil-praksis | norsk form |
| Video-analyse | video-analyse | bindestrek |
| Video-review | video-review | bindestrek |
| Bilde-analyse | bilde-analyse | bindestrek |
| Feedback-loop | feedback-loop | bindestrek |
| Internal cue | indre fokus | norsk form |
| External cue | ytre fokus | norsk form |
| Cue-ord | cue-ord | bindestrek, "swing-tanke" |
| Tanke-spor | tanke-spor | bindestrek |
| Mental cue | mental cue | engelsk-norsk |
| Repetisjon | repetisjon | flertall: repetisjoner |
| Sett | sett | flertall: sett (uendret) |
| Reps | reps | kort for repetisjoner |
| 1-og-1 | 1-og-1 | bindestrek, en rep om gangen |
| Stasjon | stasjon | "Stasjon 1, 2, 3" |
| Sirkel-trening | sirkel-trening | bindestrek |
| Superset | superset | engelsk fagterm |

### Belastning-skala

| Term | Bokmål | Notater |
|---|---|---|
| Belastning | belastning | |
| Volum | volum | timer × intensitet |
| Intensitet | intensitet | hardhetsgrad |
| Lav | lav | grønn-zone |
| Moderat | moderat | gul-zone |
| Medium | medium | mellom moderat og høy |
| Høy | høy | rød-zone |
| Maks | maks | toppintensitet |
| RPE | RPE | "Rate of Perceived Exertion", 1–10 |
| Anstrengelse | anstrengelse | "Hvor hardt?" |
| Treningsbelastning | treningsbelastning | ett ord, "training load" |
| Daglig belastning | daglig belastning | |
| Ukens belastning | ukens belastning | |
| Belastnings-zone | belastnings-zone | bindestrek |
| Optimal-zone | optimal-zone | bindestrek |
| Overload | overload | engelsk, advarsel-zone |
| Under-trent | under-trent | bindestrek |
| TSS | TSS | "Training Stress Score" |
| CTL | CTL | "Chronic Training Load" — fitness |
| ATL | ATL | "Acute Training Load" — fatigue |
| TSB | TSB | "Training Stress Balance" — form |
| Form | form | TSB-resultat |
| Friskhet | friskhet | "freshness" |
| Tretthet | tretthet | "fatigue" |
| Skarphet | skarphet | "sharpness" |

### Tester & måling

| Term | Bokmål | Notater |
|---|---|---|
| Test | test | flertall: tester |
| Test-batteri | test-batteri | bindestrek |
| Protokoll | protokoll | "Test-protokoll" |
| Baseline | baseline | engelsk-norsk |
| Retest | retest | ett ord |
| Combine | combine | engelsk fagterm |
| TrackMan-combine | TrackMan-combine | bindestrek |
| Wedge matrix | wedge matrix | engelsk fagterm |
| Putting-test | putting-test | bindestrek |
| Chipping-test | chipping-test | bindestrek |
| SG-Total test | SG-Total test | mellomrom |
| Smith machine squat | smith machine squat | engelsk |
| Knebøy | knebøy | norsk form |
| Vertikalt hopp | vertikalt hopp | "vertical jump" |
| Standlengde-hopp | standlengde-hopp | bindestrek |
| Medisinball-kast | medisinball-kast | bindestrek |
| 60m sprint | 60m sprint | tall + mellomrom |
| Y-balance | Y-balance | engelsk fagterm |
| Overhead squat | overhead squat | engelsk |
| Single leg balance | en-bens-balanse | norsk form |
| Score | score | tall fra test |
| Percentil | percentil | sammenligning |
| Persentil-rang | persentil-rang | bindestrek |
| Forbedring | forbedring | |
| Tilbakegang | tilbakegang | |
| Vedlikehold | vedlikehold | |
| Best ever | beste resultat | norsk form |
| Personlig best | personlig best | uten bindestrek |
| PR | PR | "Personal Record" |

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
