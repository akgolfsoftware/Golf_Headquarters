# Datakontrakt — WANG Årsplan 2026/27

Alle strukturer under finnes i dag som konstanter i `design/WANG Arsplan 2026-27.dc.html`
(logikkdelen, nederst i filen). De er transkribert fra skolens PDF-er og repoets
dokumentasjon. I porteringen skal de bli **datakilder** (Supabase-tabeller, MDX/JSON i
repoet eller API), ikke hardkodede arrays i komponentene.

Rekkefølgen under er anbefalt innleggingsrekkefølge.

---

## 1. `UKER` — årshjulet, én rad per uke (44 uker)
```
[uke: number, mandag: 'YYYY-MM-DD', fase: 'TURN'|'GRUNN'|'SPES'|'TEST'|'FERIE',
 type: string /* 'Turneringsuke' | 'Utviklingsuke' | 'Testuke' | 'Samlingsuke' | 'Ferieuke' | 'Overgangsuke' | 'Pre-turnering' | 'Avslutningsuke' */,
 notat: string /* kan være tom */]
```
Driver: årshjulssøylene, månedstidslinjen, periodetidslinjen og **all automatisk
generering av kalenderhendelser** (økter, tester, ferier, samlinger).

## 2. `PERIODER` — periodene i årsplanen (6 stk.)
```
{ id: 'TURN'|'TEST'|'GRUNN'|'SPES'|'TURN2', navn, uker: 'Uke 34–42',
  datoer: '17. aug – 18. okt 2026', fokus: string, nokkel: string[] /* 2–4 punkter */ }
```

## 3. `AKSER` / pyramiden
Fem akser i fast rekkefølge: `TEK, SLAG, SPILL, TURN, FYS`, hver med navn og forklaring.
Prosentfordelingen **beregnes** (`beregnPyramide(periode, egentrening)`) fra planlagte
øvelser i `OKTER` + planlagt egentrening (minutter per periode: GRUNN 180, SPES 80,
TURN 40, turneringssnitt 120). Legges data inn skal beregningen beholdes — ikke erstatt
den med lagrede prosenter.

## 4. `OKTER` — øktplan per periode
```
{ periode: 'GRUNN'|..., tittel, ingress,
  ovelser: [{ kode: 'pyramide_område_motorikk_belastning_press', navn, reps, varighet, dimensjon }],
  maal: { VG1: string, VG2: string, VG3: string } }
```
Øktkoden er en merkelapp, aldri et krav (jf. `docs/treningsplanlegger/wang-toppidrett/oktmal.md`).

## 5. `TRINN` / `TRINN_KRO` / `KM` / `KM_KRO` — kompetansemål
```
TRINN[trinn]     = { farge, tint, fag: 'Toppidrett 1', kode: 'IDR05-02 · kv283', ingress }
TRINN_KRO[trinn] = { …, fag: 'Kroppsøving', kode: 'KRO01-05 · kv186', ingress }
KM[trinn]        = string[]   // Udir-mål, ordrett
KM_KRO[trinn]    = string[]
```
Nøkler: `'VG1' | 'VG2' | 'VG3'` — alltid store bokstaver.

## 6. `KLASSER` — timeplan per klasse (skolens PDF, gjeldende 11. august 2026)
```
{ id: 'VG1A', trinn: 'VG1', kontakt: 'Anna Popova',
  plan: [ /* 8 rader (blokker) × 5 dager */ [man, tir, ons, tor, fre] ],
  fag: [ [fag, laerer, rom, blokk] ] }
```
Klasser: VG1A, VG1B, VG2A, VG2B, VG3A, VG3B. Blokk 1 mandag/onsdag/fredag er alltid
trening 08:00–10:00. Skoledagen 08:00–15:45.

## 7. `SKOLERUTE` — 192 skoledager (84 høst / 107 vår + oppstartsdag VG1)
```
[maaned: string, tekst: string, uke: 'Uke 40' | 'Uke 33–34']
```

## 8. `PROVER` — prøver og eksamen per trinn
```
PROVER[trinn] = [ [uke: 'Uke 46–47', tittel, detalj] ]
```

## 9. `FORELDREMOTER` — møter per trinn
```
FORELDREMOTER['VG1'] = ['Onsdag 26. august kl. 17:00', …]
```
Alle møter starter **kl. 17:00** på WANG Toppidrett Fredrikstad. VG1 4 møter, VG2 2, VG3 1.
Antall vises med korrekt entall/flertall («1 møte» / «4 møter»).

## 10. Kalenderhendelser — `byggEvents()`
Nøkkel = ISO-dato (`'2026-08-17'`), verdi = liste av
```
{ type: 'okt'|'prove'|'skole'|'hendelse', label: string, time?: '08:00' }
```
Genereres fra:
- **Økter** fra `UKER`: mandag/onsdag/fredag, med pyramideakse i etiketten
  (`'TEK-økt · GFGK'`). Akse per ukedag: GRUNN `[TEK, FYS, TEK]`,
  SPES `[SLAG, SPILL, TEK]`, TURN `[SPILL, TURN, SLAG]`, TEST `[TEK, SLAG, SPILL]`.
  Sted: `GFGK` (uke 14–43) / `Treningslokalet` (uke 44–13).
  Unntak: uke 18 kun man/ons, uke 20 kun ons/fre (fridager).
- **Tester**: uke 35/36 NGF-tester, uke 43 testuke, uke 6 intern teknisk sjekk, uke 10 test + IUP.
- **Skolens datoer** (`SKOLE_EVENTS`): skolestart, ferier, planleggingsdager, foreldremøter, prøve-/eksamensperioder, siste skoledag.
- **Turneringer** (høsten 2026 lagt inn): Olyo Juniortour KP3 (Mjøsen, Skjeberg, Gamle Fredrikstad + finale) og Østlandstour 9–11 (Mørk Open, Asker Open, finale Kjekstad), med påmeldingsfrist i etiketten der den finnes.

**Mangler data (neste steg):** terminlisten for våren 2027 — Norgescup, Østlandstour vår,
Srixon Tour og NM. Kilde i repoet: `src/lib/gruppe-kalender/wang-turneringer.ts`.

Etikettregel: hold etiketter korte nok til å leses i en ~100 px kalendercelle
(«Østlandstour 9 · Mørk Open»), og legg detaljer (frist, bane) etter `·`.

## 11. `window.WANGRAPPORTER` — ukessammendrag (fredager)
Filen `design/ukesrapporter.js` er datakilden i prototypen; **nyeste rapport først**.
```js
{
  uke: 35,
  datoer: '24.–28. august 2026',
  periode: 'Turneringsperiode',
  maalsetning: 'Én setning om hva uken skulle gi.',
  fokus: ['Kort punkt', 'Kort punkt'],        // 2–4
  gjennomfort: ['Man: …', 'Ons: …', 'Fre: …'],
  hoydepunkt: 'Én setning foreldrene bør merke seg.',
  neste: 'Hva som skjer neste uke.',
  trener: 'Anders Kristiansen',
}
```
Tom liste = designets tomtilstand («Første sammendrag kommer fredag <dato>»), som beregnes
fra dagens dato. I produksjon bør dette bli en tabell med `publisert_at` og forfatter, og
publiseringen skje fredag senest kl. 16.

## 12. Gruppe- og kontaktdata
Ingen personopplysninger om elever på siden — kun aggregert: «14 elever · VG1–VG3 samlet ·
16–19 år». Trenerkontakt: Anders Kristiansen, sportssjef og trener golf.
Kilde: `src/app/team-wang/_data/hent-wang-gruppe.ts`.

---

## Rekkefølge for innlegging
1. `UKER` + `PERIODER` (alt annet henger av årshjulet)
2. `OKTER` + akseforklaringer (gir pyramiden reelle prosenter)
3. Kompetansemål per trinn
4. Skoledata: `KLASSER`, `SKOLERUTE`, `PROVER`, `FORELDREMOTER`
5. Turneringer vår 2027 → kalenderen komplett
6. Ukessammendrag fra og med inneværende uke
