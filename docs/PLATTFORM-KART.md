> **Dokumentstatus 10.09.2026:** dette er et underlag, ikke en bekreftelse på dagens leveranse. Gjeldende status er `docs/STATUS-NÅ.md`, kodekartet er `docs/platform/AGENT-BRIEF.md`, og visuelt design velges i `designsystem/README.md`.

# Plattform-kart — AK Golf HQ

**Sist målt:** 8. september 2026.
**Hva dette er:** ett kart over hvordan alt henger sammen, og ærlig status.
**Hva dette ikke er:** erstatning for MASTERPLAN (den er oppgavelista). Dette er bildet.

Leseregel: **ferdig** = du kan bruke det med ekte folk i dag uten at det lyver eller er nakent.

---

## Slik jobber det sammen

Én app. Fire ansikter. Én spiller-konto. Data inn fra måling. AI som foreslår. Du som godkjenner.

```
KUNDER / FORELDRE          SPILLER                 DU (COACH)
nettsted  /  booking       PlayerHQ /portal        AgencyOS /admin
     \                         |                         /
      \                        |                        /
       \                       v                       /
        \-------------- samme database ----------------/
                       (Supabase)

DATA INN                         AI                         FAG-LOV
TrackMan  → slag                 Caddie, plan, SG           Masterbrain
GolfBox   → norske resultater    Jarvis-kø                  knowledge/ = lov
DataGolf  → herre-proff          drill-forslag              rag-corpus = støtte
Golfstat  → mer amatør           (alltid: du godkjenner)

EGNE INNGANGER (samme spiller, annen dør)
WANG        /team-wang
Team Norway /team-norway
Forelder    /forelder
Innsyn      /innsyn   (ekstern leser med samtykke)
```

**Regel som aldri skal brytes:** anbefalinger stenger aldri trening. Data merkes etter tillit (målt / beregnet / selvrapportert). Én sannhet per tall.

---

## Status per del

Fem spørsmål på hver rad: planlagt · kodet · ferdig · mangler design · mangler for komplett.

### 1. Nettstedet (`/`)

| | |
|---|---|
| **Planlagt** | Selge coachingen. Én meny. Ekte foto. Book kartlegging. |
| **Kodet** | Ja. Coaching, junior, priser, PlayerHQ-pitch, Mulligan, innlogging. |
| **Ferdig** | Ja å se på. Mobil-heroen holder. Innlogging er sterk («Én konto. Riktig sted.»). |
| **Mangler design** | 15 auth-undersider uten tegnet fasit (ikke lanseringsblokk). |
| **Mangler** | Årsplanen i Stripe (`STRIPE_PRICE_ID_PRO_AAR` i prod). DKIM på e-post. |

### 2. Booking (`/booking`)

| | |
|---|---|
| **Planlagt** | Fire steg: tjeneste → tid → deg → betal. Kun coaching, ikke simulatortid. |
| **Kodet** | Ja. Stripe-løype finnes. Tjenester hentes fra databasen. |
| **Ferdig** | **Nei.** I produksjon 8. sept. er siden naken tekst. CSS-fila (`booking-paper.css`) ble slettet med Paper 30. aug. Klassene står igjen uten klær. |
| **Mangler design** | Skal bruke Train-lock lys (besluttet), ikke gammel Paper. |
| **Mangler** | Koble styling. Deretter ekte kjøp ende-til-ende. |

Dette er pengesiden. Den er den største åpne sprekken i det kundene ser.

### 3. PlayerHQ (`/portal`) — spillerens app

| | |
|---|---|
| **Planlagt** | Fire faner: I dag · Plan · Analyse · Meg. Live-økt, tester, runder, TrackMan, booking. Mørk default. |
| **Kodet** | Ja — 169 sider. Mange er gamle dører som fortsatt bygges. |
| **Ferdig** | Delvis. I dag / skall er portet til Train-lock. Live-økt og scorekort finnes. |
| **Mangler design** | Rest-port 1:1 mot fasit + skjermbilde-gate (P-bølgen). iPad-topp-tab (B2) ikke bygget. |
| **Mangler** | Godkjente drills. Putting-hjerne. Ekte TrackMan-tall i prod (431 slag, nesten bare carry, kun demo-bruker). Sign-off av FULL-skjermene. |

### 4. AgencyOS (`/admin`) — din coach-app

| | |
|---|---|
| **Planlagt** | Fem faner: Stall · Workbench · Kø · Jarvis · Meg. AI foreslår, du godkjenner, systemet utfører. |
| **Kodet** | Ja — ~163 sider. STEG 15: én inngang per funksjon (de fleste). |
| **Ferdig** | Delvis. Du kan planlegge uke, se stall, håndtere kø, svare. |
| **Mangler design** | Spiller 360 (S3) venter på canvas-ja. Cockpit peker på annen mal enn AG-01. To «hjem»: `/admin` lander på Konsoll, første fane er Stall. |
| **Mangler** | Én meny-kilde (koden har fortsatt 7 gamle + 5 nye). Talent-kjeden ferdig i menyen. SG-hub coach-modus (krever deg). |

### 5. Forelder (`/forelder`)

| | |
|---|---|
| **Planlagt** | Lese-først. Fire faner + Mer-ark. Booke for barnet. Samtykke. |
| **Kodet** | 16 sider. Book-for-barn levert 2. sept. |
| **Ferdig** | Delvis. |
| **Mangler design** | Full 1:1-port av FO-01…FO-10 i lys og mørk. |
| **Mangler** | Skjermbilde-gate. Forelder-testbruker i sign-off. |

### 6. WANG Toppidrett (`/team-wang`)

| | |
|---|---|
| **Planlagt** | Egen flate, aldri under AgencyOS. Årsplan + coach + IUP. 22 skjermer i gammel plan. Eget merke (besluttet 2. sept.). |
| **Kodet** | Fellesside med fire faner (Trening / Skole / Kalender / Foreldre). Coach-side (sperret). IUP. Innlogging. |
| **Ferdig** | Fellessiden kan deles (ingen elevnavn). Coach-siden virker for deg. |
| **Mangler design** | Eget WANG-merke — **ingen kode før den designrunden**. 18 av 22 skjermer venter på to svar: coach inn i AgencyOS eller egen dør? Skole-/foreldredata ekte eller demo? |
| **Mangler** | Live-data (timeplan/KM/tester er hardkodet). Meny-vei inn (nås med lenke). Onboarding av elevene som PlayerHQ-brukere. |

### 7. Team Norway (`/team-norway`)

| | |
|---|---|
| **Planlagt** | Workdesk som erstatter Messenger, e-post og Excel. Poster (ikke chat). Tester. Uttak (appen konkluderer aldri). Oversikt med dekningskort. Pilot høsten 2026. |
| **Kodet** | Tre sider: gruppeposter, post til én spiller, dokumenter med lesekvittering. Samtykke i PlayerHQ/Forelder. |
| **Ferdig** | Grunnmur. Ikke et arbeidsområde du kan gi til TN-trenere ennå. |
| **Mangler design** | Malene finnes (Claw). Mangler: oversikt, fellestesting, uttak, rangliste, skoler, samling, årsplan, kalender, workbench, testprotokoller. Ingen TN-forside. |
| **Mangler** | Video/bilde i poster. Pilot. Føringsskjerm testdag (N8). `test_shots`-tabell i prod. |

### 8. TrackMan

| | |
|---|---|
| **Planlagt** | Sannhetslag. Slag inn → analyse og økt. |
| **Kodet** | Import, skjermer, spredningskart. |
| **Ferdig** | **Nei som bevis.** Prod 1. sept.: 431 slag i 16 økter, nesten bare `carryDistance`. Resten NULL. Kun demo-bruker. |
| **Mangler design** | Noen TM-skjermer ikke åpnet (TM-03/12/13/14). |
| **Mangler** | Ekte import av ballhastighet, køllehastighet, smash, launch, spin, path, face. Fem kolonner i databasen brukes aldri (bl.a. attack angle). |

Uten ekte TrackMan-tall kan ikke merket si «vi måler» i en demo.

### 9. GolfBox — norske og europeiske amatørresultater

| | |
|---|---|
| **Planlagt** | Alt norsk (NGF, Olyo, Srixon, Garmin NC, regioner) + R&A/EGA der det ligger i GolfBox. |
| **Kodet** | LIVE. Cron `turneringer-ngf` + `scrape-golfbox`. Klubb og klassekode lagres (fra 31. aug.). |
| **Ferdig** | Ja som innhenting for de kartlagte kundene. Offentlige `/stats`-sider viser det. Mindreårige er filtrert (19-års gulv). |
| **Mangler design** | Ikke et design-gap. |
| **Mangler** | Klubb-aggregat i pipeline-repoet (leser fortsatt «Øst»). Offisielt GolfBox-API (i dag offentlig widget, gråsone). Etterslep på ferdige turneringer uten resultater. |

### 10. DataGolf — herre-proff

| | |
|---|---|
| **Planlagt** | PGA, LIV m.fl. live. Historikk på flere tourer. «Powered by Data Golf» på alle sider. |
| **Kodet** | Cron `datagolf-sync`. Attribusjon på `/stats`. Databro `dg_*`. |
| **Ferdig** | Offentlig stats: ja. Inne i PlayerHQ-analyse: delvis (N12 gjenstår som produktflate). |
| **Mangler design** | AnalyseTerminal, spredning, kohort, ResultatVsFelt — Train-lock (ikke Claw). TN skal bare legge logo/farge oppå. |
| **Mangler** | Dame-tourer (LPGA/LET) — utenfor DataGolf. DP World live. Tre motorer må aldri blandes (SG / DataGolf / GolfBox). |

### 11. Turneringsresultater samlet (`/stats` + PlayerHQ)

| | |
|---|---|
| **Planlagt** | Én sannhet. Aldri dikte tall. Brutto score. |
| **Kodet** | Stor stats-flate (~45 ruter). Wrapped renset for fabrikk-tall. Årgang bak innlogging. |
| **Ferdig** | Offentlig oppslag: ja, med forbehold om kilder. |
| **Mangler design** | Stats har eget mørkt skall, ikke Train-lock/nettsted-krem. Bevisst unntak til det ryddes. |
| **Mangler** | WAGR automatikk. Clippd/college. Turnering-lenker (0 rader). Banestrategi i Masterbrain (hull). |

### 12. AI i AgencyOS (Jarvis / Caddie / plan)

| | |
|---|---|
| **Planlagt** | Signal → fagregel → agent foreslår → du godkjenner → systemet gjør. Aldri stille auto-publisere plan. |
| **Kodet** | Plan-generering, ukesforslag, plan-revisjon, SG-tolkning, drill-forslag (med stopp når banken er tom), Caddie som kan spørre Masterbrain. |
| **Ferdig** | Rørene finnes. Verdien er tynn der fasiten er tom (drills, putting). |
| **Mangler design** | Noen Jarvis-dialoger (start/pause) venter på data. |
| **Mangler** | Putting-diagnose som oppgavetype. Fire flater som fortsatt ikke leser fasiten skikkelig (turneringsforberedelse, deload, livskontekst). CANON i JSON er v1 (A = nybegynner) mens du har låst A = elite. |

---

## Masterbrain — hjernen AI-en skal adlyde

**Hvor den bor**

- Kilden: `~/Developer/masterbrain`
- Speilet HQ leser: `akgolf-hq/src/lib/masterbrain/` (kopieres med `npm run sync:masterbrain`)
- Aldri rediger speilet. Endre kilden, synk samme kveld.

**Hvordan AI-en skal bruke den**

```
1. Data (TrackMan, runde, SG, kalender)  = hva som skjedde
2. Masterbrain knowledge/*.json          = hva som er lov å si
3. rag-corpus (fritekst)                 = utdyping, sitater, forklaring
4. Agenten skriver et forslag
5. Du godkjenner i Kø
6. Systemet skriver til planen
```

Fem jobber i koden i dag: `plan-generering` · `sg-diagnose` · `drill-forslag` · `periodisering` · `terminologi`.

Ved motstrid vinner JSON. Fritekst er støtte. Mangler kunnskapen: si det — finn aldri på.

**Hva som ligger der nå (lov)**

- P1.0–P10.0 (komplett)
- 10 svingfeil (komplett)
- 75 MORAD-begreper (7 % av kildematerialet)
- CANON / LTAD / SG-prinsipper / mikroperiodisering — **v1**, delvis utgått (L-faser, CS, skalaen snudd)

**Hva som er tomt med vilje**

- Drill-banken (`entities: {}`). 895 kandidater ligger i `ovelsesbank/kandidater/` — ingen er godkjent.
- Putting som eget hode. SG→putting er tom liste. Korrekt for MORAD-fullsving, feil for en coach.

**Hvordan mappa skal se ut (målbildet)**

```
masterbrain/
  MANIFEST.md                 ← kartet. Agenter leser denne først.
  knowledge/                  ← LOV. Bare det du har sagt ja til.
    entities/
      positions.json          ← P1–P10
      faults.json             ← fullsving-feil
      drills.json             ← kun godkjente (eller pek til ovelsesbank/godkjent/)
      ordbok.json             ← MORAD-termer du har rettet
    concepts/
      ak-formel-v2.json       ← 17 områder, putting i fot, ingen L/CS/M/PR
      putting-framework.json  ← søsken til fullsving, ikke P1–P10
      short-game.json         ← nærspill som eget hode
      canon-methodology.json  ← vokabular, ikke sperrer (18. aug.)
      ltad-framework.json
      sg-principles.json      ← hypotese, ikke diagnose
      wang-arsplan.json       ← program-ramme, ikke Drive-kopi
      team-norway-ramme.json  ← tester/uttak som underlag
  ovelsesbank/
    kandidater/               ← utkast, merket
    godkjent/                 ← det agenten får lov å navngi
  rag-corpus/                 ← lange tekster til søk (Mac-forelesninger, TrackMan-forklaring)
  sources/                    ← råstoff. Aldri lov.
  training-data/              ← eksempler + holdout (grønt = kunnskapen finnes)
```

**Hva som aldri skal inn**

- 780 GB video fra Toshiba (pek, ikke kopier)
- Cowork-søppel (~6 000 filer i `akgolf-hq/kunnskap/`)
- Personfiler, kontrakter, økonomi
- CIO-yaml og auto-navngitte drills
- L-faser, CS, M0–M5, PR1–PR5 som gjeldende

**Innhold — rekkefølge som gir mest**

1. Rett loven som lyver (A = elite, 17 områder, utgått L/CS).
2. Putting fra Mac (1–300 fot) som eget JSON — du retter først.
3. Én drill-kategori om gangen inn i `godkjent/`.
4. Short game (Seve/vått) som søsken.
5. WANG-årsplan og TN-testramme som program-JSON, ikke prosa.
6. RAG: 1 081 forelesningsbiter + Skype som støtte, allerede i second-brain.

Toshiba er originalen. ak-second-brain er lesestoff. Cowork er ferdige dokumenter. Masterbrain er det agenten **må** adlyde.

---

## Hva som mangler for en komplett plattform

Ikke 475 sider. Disse ti, i denne rekkefølgen:

1. **Booking ser ut som et produkt** (CSS).
2. **Ekte TrackMan-slag** i prod (ikke bare carry på demo).
3. **Ett ekte kjøp** (måned virker, år mangler pris-id).
4. **Masterbrain-loven rettet** (kategori A–K + AK-formel v2).
5. **Putting-hode + første godkjente drills.**
6. **Spiller 360** i AgencyOS (ett bilde av eleven).
7. **WANG-elever inn som PlayerHQ-brukere** (årsplanen alene er ikke produktet).
8. **TN-oversikt + testdag** (ikke bare tavle).
9. **Sign-off** av I dag, Plan, Stall, Kø i mørk og lys.
10. **Stopp:** ingen ny side uten at en gammel dør stenges.

Det som allerede bærer: nettstedet, innlogging, GolfBox-innhenting, DataGolf-attribusjon, PlayerHQ-skallet, AgencyOS-køen, WANG-årsplan som delbar lenke, TN-tavle som grunnmur.

---

## Hvor fasiten ligger

| Spørsmål | Fil |
|---|---|
| Hva skal produktet være | `docs/platform/NORDSTJERNE.md` |
| Hva gjenstår som oppgaver | `docs/MASTERPLAN-GJENSTAAENDE.md` |
| Snapshot «nå» | `docs/STATUS-NÅ.md` |
| Hvordan appen skal se ut | `designsystem/train-lock/` |
| Team Norway-utseende | `designsystem/team-norway/` |
| WANG-årsplan-utseende | `designsystem/wang/fasit/` |
| Fag AI-en adlyder | `~/Developer/masterbrain/MANIFEST.md` |
| Datakilder turnering | `docs/turnering-datakilder.md` |
| Låste beslutninger | `.claude/rules/beslutninger.md` |

---

*Skrevet 8. september 2026 etter gjennomgang av kode, live nettsted og Masterbrain. Booking-CSS og TrackMan-tomhet er målt, ikke antatt.*
