# WANG Toppidrett — øktmal (felles struktur for alle økter)

> **Vokabular:** feltene under leses mot `docs/ordbok.md` (15.09.2026). Radene
> 4–7 er skrevet om til de fem AK-aksene; L-fase, CS, M0–M5 og PR1–PR5 er utgått.

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
| 3 | Treningsområde | 19 områder (master kap. 2): Utslag · Innspill ~200/150/100/50 m · Chip · Pitch · Lob · Bunker · Putt 0–3/3–5/5–10/10–25/25–40/40+ fot · Styrke · Kondisjon · Bevegelighet · Banespill | `omraadeKode` ✓ |
| 4 | Motorikk (kun fullsving) | Uten ball · Lav hastighet · Automatikk | `motorikk` ✓ |
| 5 | Belastning (miljø) | Innendørs · Treningsområde · Bane · Konkurranse | `belastning` ✓ |
| 6 | Press (hvem ser på) | Alene · Observert · Konkurranse · Turnering | `press` ✓ |
| 7 | Dimensjon | Sikte, startretning, kurve, høyde … (master kap. 3.4) | `dimensjon` ✓ |
| 8 | Dose | tid + reps totalt + reps per motorikk-steg | `repType`, `repAntall`, `planRepsUtenBall/LavFart/Auto` ✓ |
| + | Pyramide (settes på øvelsen) | FYS · TEK · SLAG · SPILL · TURN | `pyramidArea` ✓ |

Ingen mapping gjenstår: alle åtte felt finnes i AK-formel v2 (`src/lib/domain/ak-formel-v2.ts`).

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

> **UTGÅTT (beslutninger.md 2026-08-18):** CS-tall (CS50–60, CS70) under er pensjonerte
> UI-begreper — se varselet øverst i fila.
- **GRUNN:** Øvelse 1 = teknikk uten ball (Kropp/Arm/Kølle) · Øvelse 2 = Ball CS50–60 · Øvelse 3 = anvendelse range CS70.
- **SPES:** Øvelse 1 = teknisk vedlikehold CS70 · Øvelse 2 = SLAG kjente avstander/lies · Øvelse 3 = SPILL korthull/9 hull.
- **TURN (pre-turnering):** Øvelse 1 = aktivering · Øvelse 2 = scoring under press · Øvelse 3 = mental rutine. Ingen tung teknikk siste 48t.
- **Testuke (uke 43 + aug/sep):** øktmal brukes ikke — `wang-tester` overtar.

## Regler (fra skillen)

> **UTGÅTT (beslutninger.md 2026-08-18):** «Minimum CS50 for balltrening» er IKKE en gjeldende
> hard regel — all regel-håndheving i planlegging er slettet fra koden. Se varselet øverst i fila.

- KPI + dagbok-prompt obligatorisk i hver økt. Notat-seksjon legges tom.
- Ny teknikk starter i Kropp/Arm — aldri direkte Ball/Auto. Minimum CS50 for balltrening.
- Differensier alltid via kompetansemål, ikke vanskelighetsgrad.
- WANG-design (blå #17446f, grønn #2e857d, Montserrat/Quattrocento), aldri emoji, logo som PNG.
