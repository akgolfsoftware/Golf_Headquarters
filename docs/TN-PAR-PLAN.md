# Par-plan — resterende Team Norway, 100 % piksel mot Claw

To spor. Begge skal treffe **par**: samme artboard som i `Claw Design — Team Norway Golf (1).zip`, samme tokens, samme copy. Demospiller i alle rader: **Øyvind Royan**.

**Par A = spillerflaten (SP, 390 først).**  
**Par B = trenerflaten (SS/TR/HJ, 1440 først).**

Foresatt (FO) arver A der Claw viser foresatt (samtykke, post-mottaker). FO ≠ Live.

---

## Fasit og stoppregel

- Fasit-fil: `templates/tn-*/` i zip. SUCCESS-artboardet, ikke dokumentasjonsrammen rundt.
- Målt: navy `#012B5D`, rød `#D70232` kun merke/skinne, rail 252, topp 64, innhold 28×32, Schibsted + IBM Plex Mono.
- Språk: spiller · økt · nærspill · innspill · kildelinje `Målt dd.mm.åååå · protokoll vN · initialer`.
- **Stopp neste skjerm** til denne er verifisert: 1440 og 390 mot artboard + `tsc`.
- Ikke innerHTML-dump av hele canvas. Port **én ramme → React med samme inline-stiler**.

Nå: de fleste skjermer er 1440-SUCCESS klistret inn via `FasitCanvas`. Det er **ikke** par. Mangler spiller-390, tom/laster/feil, klikk, og Workdesk er tre rammer i ett batch-HTML.

---

## Par A — spiller (Øyvind Royan)

Landingsflate for SP er **ikke** trenerens dekningsgrad. Claw: IUP i dag (TN-23) på 390.

| # | Skjerm | Fasit | 390 / 1440 | Øyvind-innhold | Status |
|---|---|---|---|---|---|
| A1 | Skall SP + Mer | `tn-skall/TnMerMobil.dc.html` | 390 | Færre grupper: IUP, samling, poster, turnering, meg | Skall er SS-rail. **Mangler SP-meny** |
| A2 | IUP i dag | `tn-iup-idag` | 390 først | «Venter på meg», neste samtale Marte | HTML 390 inne, ikke SP-rute |
| A3 | Samtykke | `tn-samtykke` + `tn-samtykke-reise` | 1440 + reise | Kari Royan brytere, hva som deles | Dump, reise ikke koblet |
| A4 | Samling spillerblikk | `tn-samlingspunkt` 390-kolonnen | 390 | Uttatt / bekreft / program | Trener-1440 vises for SP |
| A5 | Poster (lese) | `tn-gruppeposter` 390 | 390 | Kvitter, ikke svar | Trener-komponist vises |
| A6 | Post til meg | `tn-post-enkeltspiller` | 1440/390 | Kari i mottakerlinjen | Dump |
| A7 | Turneringer | `tn-turneringer` | 1440/390 | Onsøy 73–71, «lagt inn selv» | Dump |
| A8 | Månedsplan | `tn-manedsplan` | 1440 | Uke 40–42 Øyvind | Dump |
| A9 | Måltavle | `tn-maltavle` | 1440 | SG/PEI-rader, Øyvind setter mål | Dump |
| A10 | Prosessmål | `tn-prosessmal` | 1440 | Innspill 100–150 m, putt 0–3 fot | Dump |
| A11 | Utviklingssjekk | `tn-utviklingssjekk` | 1194 | Junior –19, Øyvind eier svar | Dump |
| A12 | IUP-samtale | `tn-iup-samtale` | 1194 | Øyvind venstre, Marte høyre | Dump |
| A13 | Referanse | `tn-referansenivaer` | 1440 | Øyvind mot median | Dump |
| A14 | Apparatet | `tn-trenerkatalog` | 1440 | Ni roller, trykkbare nummer | Dump |
| A15 | Live | *ingen Claw-fil* | 390 | Øyvind økt, FO stengt | Stub |

Rekkefølge A: **A1 → A2 → A3 → A4 → A5**. Deretter A6–A14 én av gangen. A15 sist (tegn mot skall + IUP-kort, ikke finn på mørk/gull).

Tom/laster/feil på A2, A3, A4, A5 før neste par-bolk.

---

## Par B — trener (1440 SUCCESS)

| # | ID | Skjerm | Fasit | Par-krav utover dump |
|---|---|---|---|---|
| B1 | TN-01 | Skall | `TnSkall.dc.html` | 252 rail, rød skinne, avgrenset-pille. **Nå: delvis** |
| B2 | TN-02 | Oversikt | `TnOversikt` + Mobil | CoverageCard + krever + samling + poster. Fire tilstander. **Nå: SUCCESS dump** |
| B3 | TN-00 | Workdesk | `TnBatch1` | Tre rammer: hjem, liste, **spiller-ark Øyvind**. **Nå: én batch** |
| B4 | TN-18 | Tilgang | `TnTrenereTilgang` | Klikk person, rolle per gruppe |
| B5 | TN-09 | Gruppeposter | `TnGruppeposter` | Komponist + kvitteringsbrøk |
| B6 | TN-03 | Fellestesting | `TnFellestesting` | Fire protokolltyper, kø med Øyvind |
| B7 | TN-06 | Uttak | `TnUttak` | Matrise, ingen totalscore, Øyvind åpen rad |
| B8 | TN-07 | Rangliste | `TnRangliste` | Rød markør på Øyvind. Ikke synlig SP/FO |
| B9 | TN-08 | Skoler | `TnSkoler` | Aggregat, under 3 uten navn |
| B10 | TN-11 | Dokumenter | `TnDokumentdeling` | Brøk, mangelliste |
| B11 | TN-04/05 | Protokoll | bibliotek + detalj | Versjon, attest |
| B12 | TN-13/17 | Turnering | oversikt + manuell | «lagt inn selv»-merke |
| B13 | TN-14 | Samling trener | `TnSamlingspunkt` 1440 | Uttak + timeplan |
| B14 | TN-15 | College | `TnCollegegruppen` | Studieår, ikke alder |
| B15 | TN-16 | Månedsplan | `TnManedsplan` | Avvik mot publisert |
| B16 | TN-19 | Inviter | `TnInviterSpiller` | Sendt/åpnet/fullført |
| B17 | TN-20/21 | Katalog + referanse | | Se A14/A13, trener-tetthet |
| B18 | TN-22 | IUP-modulkart | | På / valgfri / av per nivå |
| B19 | Testreise | `tn-testreise` | Klikk TN-04→05→03 |

Rekkefølge B etter A1–A5: **B1 (ferdigstill) → B2 fire tilstander → B3 spiller-ark → B4 → B5**. Resten i tabellrekkefølge.

---

## Felles, begge par

1. **Øyvind Royan** i hver liste der en spiller vises. Kari Royan som foresatt. Marte Berg trener. Anders K. sportssjef.
2. Rolle-switch: SP laster Par A-ramme, SS laster Par B-ramme — **samme rute, ulik ramme**.
3. `?tilstand=tom|laster|feil` på hver skjerm som har artboard for det.
4. Logo `/tn/team-norway-golf.png`. Aldri invert.
5. Verifikasjon per skjerm: visuell diff mot zip-artboard (1440 og 390), ikke «ser likt ut».

---

## Ikke i denne planen

AgencyOS, PlayerHQ-skall, WANG-teal, GolfBox-live-API, FYS-programbygger, merkevare-brev. TNG-profilen er Claw, ikke AK.

---

## Ferdig når

- SP på 390 kan gå IUP i dag → samling → poster → samtykke og se **Øyvind**, piksel mot fasit.
- SS på 1440 kan gå oversikt → workdesk-ark Øyvind → tilgang → poster, piksel mot fasit.
- Live stengt for FO.
- Ingen `FasitCanvas`-dump igjen på sporene over.
