# WANG Toppidrett — øktmal (felles struktur for alle økter)

Kilde: `wang-treningsokt`-skillen (autoritativ) + AK-formel-feltene i AK Golf HQ.
Formål: én felles øktstruktur som alle M/O/F-økter (08:00–10:00) følger, differensiert per VG-trinn
og lenket til kompetansemål. Feltene finnes allerede i databasen — denne malen mapper dem.

## Rammer
- Faste økter: mandag, onsdag, fredag 08:00–10:00 på GFGK (inne i «Treningslokalet» nov–mars, ute apr–okt).
- Målgruppe: VG1/VG2/VG3 samlet. **Samme drill for alle — ulikt kompetansemål per trinn** (ikke ulik vanskelighetsgrad).
- Økt henter periode (GRUNN/SPES/TURN) og uketype fra [årshjulet](arshjul-2026-2027.md).

## Øktens 7 seksjoner
| # | Seksjon | Innhold |
|---|---------|---------|
| 01 | **Målsetning** | Primært + sekundært mål (sterke verb: Etablere/Forbedre/Konsolidere/Måle/Aktivere/Overføre) |
| 02 | **Kompetansemål** | 3–6 TI-koder (Toppidrett VG1/2/3) — se `kompetansemaal-toppidrett-vg.md` |
| 03 | **Huskeliste** | Utstyr, forberedelser, dokumenter |
| 04 | **Oppvarming** | Aktivering/ballfølelse — bygget som øvelse(r) med samme 8 felter |
| 05 | **Hoveddel** | Nummererte øvelser (1, 2, 3 …), hver med 8 felter + differensieringstabell |
| 06 | **KPI + dagbok-prompt** | Én målbar verdi + ett refleksjonsspørsmål |
| 07 | **Notater fra trener** | Tom seksjon Anders fyller inn |

## De 8 obligatoriske øvelsesfeltene → mapping til AK-formel i AK Golf HQ
Hver øvelse (oppvarming og hoveddel) har alle 8. Kolonnen til høyre viser at feltet **allerede finnes**
i databasen (`SessionDrill`/`TrainingDrillV2` + AK-formel-enums) — vi gjenbruker, bygger ikke nytt.

| # | Øktmal-felt (wang-treningsokt) | Verdier | Finnes i AK Golf HQ som |
|---|-------------------------------|---------|--------------------------|
| 1 | Navn | fritekst | drill-navn |
| 2 | Beskrivelse | fritekst | drill-beskrivelse |
| 3 | Treningsområde | 16 soner (Tee · Innspill 200+/150–200/100–150/50–100 · Chip · Pitch · Lob · Bunker · Putt 0–3/3–5/5–10/10–15/15–25/25–40/40+) | `skillArea` (grov: TEE_TOTAL/TILNAERMING/AROUND_GREEN/PUTTING/SPILL) — **mapping trengs: 16 → 5** |
| 4 | Læringsfase | Kropp · Arm · Kølle · Ball · Auto | `lFase` = L_KROPP/L_ARM/L_KOLLE/L_BALL/L_AUTO ✓ |
| 5 | Intensitet (CS) | 50–100 % | `csNivaa` = CS50–CS100 ✓ |
| 6 | Miljø | Off-course · Innendørs · Range · Øvingsfelt · Bane trening · Bane turnering | `miljo` = M0–M5 — **mapping trengs: navngitt ↔ M0–M5** |
| 7 | Belastning (PR) | Ingen · Selvmonitorering · Sosial · Konkurranse · Turnering | `prPress` = PR1–PR5 ✓ |
| 8 | Antall reps/mål | fritekst/tall | `repType` (SVINGER/BALLER/TID/SETT_REPS) + verdi ✓ |
| + | Pyramide (settes på øvelsen) | FYS · TEK · SLAG · SPILL · TURN | `pyramidArea` ✓ |

**To mapping-oppgaver identifisert** (håndteres i systemsteget):
- Treningsområde: øktmalen har 16 fine soner, AK Golf HQ har 5 grove. Enten utvide `skillArea`, eller
  legge de 16 som en underinndeling. Avklares når vi bygger øktredigeringen.
- Miljø: øktmalens navngitte miljøer må mappes til M0–M5 (eller motsatt) så tallene stemmer.

## Differensiering per trinn (via kompetansemål)
Samme øvelse, ulikt læringsutbytte. Eksempel (wedge-drill):
| Trinn | Kompetansemål | Læringsutbytte |
|-------|---------------|----------------|
| VG1 | TI1.A | Bli kjent med format og målsetning |
| VG2 | TI2.A | Anvende drillen for å forbedre wedge-spread |
| VG3 | TI3.A + TI3.E | Analysere TrackMan-data og justere CS-fordeling |

TI-kodene fylles inn fra Udir-læreplanen når den er lastet ([kompetansemaal-toppidrett-vg.md](kompetansemaal-toppidrett-vg.md)).

## Blokkfordeling (08:00–10:00)
| Tid | Blokk |
|-----|-------|
| 08:00–08:15 | Oppvarming |
| 08:15–09:00 | Hoveddel — Øvelse 1 (teknisk drill/test) |
| 09:00–09:30 | Hoveddel — Øvelse 2 (anvendelse) |
| 09:30–09:50 | Hoveddel — Øvelse 3 (konkurranse/scoring under press) |
| 09:50–10:00 | Evaluering — KPI + dagbok |

## Periodespesifikk vri
- **GRUNN:** Øvelse 1 = teknikk uten ball (Kropp/Arm/Kølle) · Øvelse 2 = Ball CS50–60 · Øvelse 3 = anvendelse range CS70.
- **SPES:** Øvelse 1 = teknisk vedlikehold CS70 · Øvelse 2 = SLAG kjente avstander/lies · Øvelse 3 = SPILL korthull/9 hull.
- **TURN (pre-turnering):** Øvelse 1 = aktivering · Øvelse 2 = scoring under press · Øvelse 3 = mental rutine. Ingen tung teknikk siste 48t.
- **Testuke (uke 43 + aug/sep):** øktmal brukes ikke — `wang-tester` overtar.

## Regler (fra skillen)
- KPI + dagbok-prompt obligatorisk i hver økt. Notat-seksjon legges tom.
- Ny teknikk starter i Kropp/Arm — aldri direkte Ball/Auto. Minimum CS50 for balltrening.
- Differensier alltid via kompetansemål, ikke vanskelighetsgrad.
- WANG-design (blå #17446f, grønn #2e857d, Montserrat/Quattrocento), aldri emoji, logo som PNG.
