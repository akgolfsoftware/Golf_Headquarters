# Språk og hvordan appen virker

Lesestykke. Ikke kodekontrakt. Fasit for **betydning** i HQ: `docs/ordbok-master-trening.md` + `docs/ordbok.json`. Fasit for **staving på skjerm**: `docs/ordbok-ak-golf-konsept.md` (del B).

Oppdatert 18.09.2026 mot ordbok v2026-09-16 og Grok-flaten.

---

## 1. Én setning

Coach **planlegger** i AgencyOS. Spiller **gjennomfører** i PlayerHQ. AI **foreslår**. Du **godkjenner**. Tall merkes med **kilde**. Putting måles i **fot**. Mangler tall: skriv **ukjent** / **—**, aldri 0.

---

## 2. Ordboken — tre lag

| Lag | Hva | Vinner ved krøll |
|---|---|---|
| **Master** | Hva et ord *betyr* (pyramide, område, SG) | Master |
| **JSON** `ordbok.json` | Koder koden får lov å bruke | Master + JSON |
| **Del B** | Hvordan det *staves* på skjermen (spiller, ikke elev) | Master for betydning, del B for UI |

**Utgått (skal ikke brukes i ny UI):** L-faser som L_KROPP/L_ARM, CS50–CS100, M0–M5, PR1–PR5 som synlige merkelapper. De kan ligge i gammel database. På skjerm: **motorikk** (uten ball / lav hast / auto), **belastning** (inne / treningsområde / bane / konkurranse), **press** (alene / observert / konkurranse / turnering).

**Roller på skjerm:** spiller · coach · hovedcoach · forelder · admin. Aldri «elev» eller «atlet».

**Tall:** desimal med komma, tusen med mellomrom, klokke 24h, avstand i meter, putting i fot, køllehastighet i mph.

---

## 3. Pyramiden (alltid denne rekkefølgen)

`FYS · TEK · SLAG · SPILL · TURN`

| Lag | Betydning | Typisk innhold |
|---|---|---|
| **FYS** | Kropp | styrke, kondisjon, bevegelighet |
| **TEK** | Bevegelse uten å «score» | posisjon, treff, køllevei |
| **SLAG** | Golfslaget | utslag, innspill, chip, putt |
| **SPILL** | Golf som spill | banespill, strategi, press |
| **TURN** | Når det gjelder | rutine, recon, konkurranse |

Putting er **ikke** et sjette lag. Putting er **fot** av SLAG (og SG-PUTT). «Putting i fot» = avstand 0–3 ft, 3–5 ft … 40+ ft. Aldri meter på putt.

---

## 4. Nitten treningsområder

Det du planlegger mot. Ett område per øktblokk når det går.

**Fullsving:** Utslag · Innspill ~200 / 150 / 100 / 50 m  
**Nærspill:** Chip · Pitch · Lob · Bunker  
**Putt (fot):** 0–3 · 3–5 · 5–10 · 10–25 · 25–40 · 40+  
**FYS:** Styrke · Kondisjon · Bevegelighet  
**Bane:** Banespill  

Tre akser på toppen, ikke flere merkelapper:

- **Motorikk:** uten ball → lav hastighet → automatikk  
- **Belastning:** innendørs → treningsområde → bane → konkurranse  
- **Press:** alene → observert → konkurranse → turnering  

SG-bøtter (hva runden *målte*): **OTT** utslag · **APP** innspill · **ARG** nærspill · **PUTT** putting. Format `+1,2` / `−0,4`.

SG er **hypotese til trening**, ikke diagnose alene. DataGolf er **proffreferanse** (herre). GolfBox er **norske runder** (Oleo, NGF, …). Blandes aldri i samme tall.

---

## 5. Hvordan trening planlegges

Ovenfra og ned. Det under **arver** det over, det overstyrer ikke i stillhet.

```
Årsplan     →  sesongens retning (pyramide-balanse, turneringer)
Periode     →  4–8 uker, én hovedhensikt (grunn / spesial / turnering / evaluering / testuke / ferie / samling)
Måned       →  volum og hvilke områder som får tid
Uke         →  det spilleren ser i PlayerHQ Plan (man–søn)
Økt         →  oppskrift: område + motorikk + belastning + press + øvelser
Live        →  gjennomføring (slag / øvelse), så oppsummering
```

**Regler som styrer flyten**

1. AI skriver **utkast**. Køen i AgencyOS er porten. Ingenting lander hos spilleren før **godkjenn**.  
2. **Lagret** hos coach ≠ **delt** til spiller.  
3. Avvik (syk, vær, Mina-uken) = nytt forslag i kø, ikke stille omskriving av årsplanen.  
4. Én neste handling. Anti-paralyse.

Mac O'Grady-fasene (grunntrening, oppbygging, spesialisering, konkurranse, overgang, hvile) er **eget vokabular** — ikke det samme som periodetypene i skjemaet. Ikke vis begge som om de er ett.

---

## 6. To ansikter, samme spiller

```
        Årsplan / uke / økt          (sannhet i databasen)
              /                \
     AgencyOS (coach)        PlayerHQ (spiller)
     planlegger, godkjenner  ser uke, trener live, leser analyse
```

Forelder leser, booker, samtykker. Ser **ikke** Live-slag.

---

## 7. AgencyOS — hva hver ting *er*

Ni punkter i menyen. Resten under Oppsett.

| Meny | Hva det er, enkelt |
|---|---|
| **Hjem** | I dag for coach. Nå, tidslinje, kø. Godkjenn herfra. |
| **Stall** | Dine spillere. Kort, ikke Excel. Inn til 360 / uke. |
| **Kalender** | Når økter og folk er. Dag / uke / måned. |
| **Workbench** | Der årsplan → uke **tegnes**. Tidskalender man–søn, blokker, så **publiser**. |
| **Innboks** | Meldinger og tråder, ikke plan. |
| **Godkjenninger** | Køen. Forslag inn, du sier ja / rediger / avvis. Systemet skriver etterpå. |
| **AgenticOS** | Sporet: hva agenten gjorde, hva som venter, hva som feilet. Ikke egen app. |
| **Analyse** | Stall og SG på tvers. Hypotese, ikke automatisk ny uke. |
| **Oppsett** | Bibliotek, program, drift, abonnement, øktbygger som verktøy. |

**Workbench-dybde:** årsplan → periode → måned → øktbygger → publiser til spilleruke. Gruppeplan er egen handling (ikke duplikat av individ).

**Bank:** øvelse (én drill) → program (rekke) → publiser / moderer / versjon. Coach-øvelse er ikke plattformøvelse før den er godkjent.

**Live for coach:** se økt mens den pågår, gruppe eller én. Oppsummering etterpå.

**Drift (kun admin):** feillogg, restore, kvittering. Coach ser ikke restore.

---

## 8. PlayerHQ — hva hver ting *er*

Fire faner. Live er **mørk fokus**, ikke en femte fane.

| Flate | Hva det er |
|---|---|
| **I dag** | Hva skjer nå. Én primær handling: Start økt. |
| **Plan** | Uken som er **delt**. Ikke coachens utkast. |
| **Analyse** | Egne runder og SG, kilde merket. Tom = setning, ikke 0-graf. |
| **Meg** | Mål, bag, datakilder, runder, gameplan, varsler, coachkontakt. |
| **Øktoppskrift** | Før live: hva økten *er* (område, reps, mål). |
| **Live slag / øvelse** | Registrer. Pause. Lagre lokalt. Delt når synk er gjort. |
| **Oppsummering** | Etter økt. Ærlig grunnlag. |
| **Datakilder** | Hva som er koblet: TrackMan, DataGolf, GolfBox, egen runde. |
| **DataGolf** | Proffreferanse, merket. Ikke junior-sannhet alene. |
| **Kurve** | Egne turneringsrunder. Uten public-id: tekst, ikke falsk graf. |
| **Bag** | Køller. Forelder skriver ikke. |
| **Gameplan** | Banebibliotek. GPS er parkert. |
| **Utfordring** | Delt stasjon i gruppe. Lagret ≠ delt. |
| **Gratis** | Ingen coachkontakt / utfordring. |

---

## 9. Flyt du kjenner igjen i hverdagen

1. Du setter **årsplan** (pyramide + turneringer).  
2. Workbench fyller **uken** med områder.  
3. **Publiser** → spilleren ser det under Plan.  
4. Spilleren trykker **Start økt** på I dag.  
5. Live lagrer forsøk. Oppsummering.  
6. Analyse + ev. agent = **forslag** i Godkjenninger.  
7. Du godkjenner neste uke. Punkt 2.

Mina-eksempel: forslaget om å droppe mandag pga. reise er et **kø-kort**, ikke en stille endring av årsplanen.

---

## 10. Hva som ikke er språk i appen

| Si ikke | Si |
|---|---|
| elev, atlet | spiller |
| trener (alene) | coach |
| gjennomsnitt | snitt |
| 0 når data mangler | — / ukjent |
| putt i meter | putt i fot |
| L1, CS70, PR4 i UI | motorikk / belastning / press |
| DataGolf = Oleo | GolfBox = norske tourer; DataGolf = herre-proff |

---

Kort: **pyramiden styrer *hva slags* trening, de nitten områdene styrer *hvor*, årsplan→økt styrer *når*, køen styrer *at det er du som slipper det ut*.**
