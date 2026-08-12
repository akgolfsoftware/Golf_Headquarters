> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# Nattrapport 10.08.2026

**Kjørt:** `OVERNIGHT-AUTONOMOUS-PLAN.md` v2.0, pakke 1–5. Auto-godkjent per planen.
**Leveransen din:** [SIGNOFF-GALLERI-2026-08-10.md](SIGNOFF-GALLERI-2026-08-10.md) — 11 skjermer,
33 bilder, app mot fasit side om side. Åpne den fra telefonen.

---

## Det korte svaret

Natten gikk ikke som planlagt, og det var riktig at den ikke gjorde det.

`main` bygde ikke da jeg startet. 114 feil. Ingen av skjermene kunne fotograferes — appen viste
blanke sider. Så pakke 1 ble utsatt til det var ryddet, og pakke 3 og 4 rakk jeg ikke.

Til gjengjeld har du nå en grønn hovedversjon og et galleri du kan lese gjennom på et kvarter.

---

## Hva som ble gjort

### 1. Grønn `main` igjen ([#385](https://github.com/akgolfsoftware/Golf_Headquarters/pull/385), lagt inn)

Fire filer hadde ren syntaksfeil fra nattens automatiske slug-tagging: en uavsluttet `<div>` i
Konsoll og i PlayerHQ-hjem, en kommentar som avsluttet seg selv midt i setningen, og en
opprydningsfunksjon som var overskrevet av en halvferdig kommentar.

Syntaksfeil får TypeScript til å hoppe over resten av sjekken. Da de var borte lå det 79 feil til
under: 27 duplikate nøkler i stil-objekter, 13 marketing-filer som manglet en prop kallstedet
allerede sendte, og et helt sett coach- og fasilitetsfelter som kalenderen brukte men som aldri
ble lagt inn i datalaget. Under der igjen: 17 lint-feil og 14 fargefeil fra to kvalitetsgater som
ble innført uten å rydde eksisterende brudd.

Alt er rettet uten å endre hvordan noe ser ut. `npm run verify` er grønt og alle 943 tester går.

### 2. Sign-off-galleriet (pakke 1) — ferdig

11 skjermer: de sju i PP-1 og de fire i PP-2-kjernen. Hver skjerm fotografert i 390 px og 1280 px,
pluss mørk modus på mobil, med Paper-fasiten montert ved siden av. Ekte innlogging, ekte data,
ingen montasje.

Verktøyet ligger i `scripts/signoff-gallery.mjs` og kan kjøres på nytt når som helst.

### 3. To reelle feil rettet (pakke 2)

- **Innboksen var ødelagt på desktop.** Listen var 1681 px bred i et 1280 px vindu, så tekst,
  knapper og hele høyrekolonnen falt utenfor skjermen. Årsak: rutenett-kolonnen manglet
  `min-width: 0`. Sju andre admin-skjermer har samme mønster og samme latente feil — notert i
  gotchas.
- **Booking markerte feil fane** i bunnmenyen («I dag» i stedet for «Plan»). Rettet på alle fire
  booking-sidene.

Resten av avvikene galleriet fant er ombygginger, ikke justeringer. De skal du se på først.

---

## Hva som IKKE ble gjort

| Pakke | Status | Hvorfor |
|---|---|---|
| Pakke 3 (PP-3, live/runde/workbench/forelder) | **Ikke startet** | Tiden gikk til å gjøre main grønn |
| Pakke 4 (de 36 `[ ]`) | **Ikke startet** | Samme |
| PP-1.7 offentlig booking | **Blokkert** | Acuity-videresendingen er din beslutning (#384) |

Ingen skjerm er merket `[x]`. Ingen røde merges. Ingen forbudte handlinger.

---

## Tellere

| | Før | Etter |
|---|---|---|
| `npm run verify` | rød (114 feil) | grønn |
| `npm test` | kunne ikke kjøres | 943 / 943 |
| Skjermer med bevis i galleri | 0 | 11 |
| Skjermer merket `[x]` av agent | 0 | 0 |
| Røde merges til main | — | 0 |

Målet i planen var minst 11 skjermer i galleriet. Det er nådd. Målet om 10 nye `[~]` er ikke nådd
— galleriet viser at ingen av de elleve er nær nok fasiten til å fortjene det.

---

## De tre beslutningene jeg trenger fra deg

**1. Skal innloggingsknappen være oransje?**
Fasiten sier ja. Regelen om at oransje er reservert til «Én ting nå» sier nei. På innloggingssiden
finnes det bare én handling, så begge kan forsvares — men bare én kan gjelde. Dette blokkerer
PP-1.6.

**2. Hva skal skje med de åtte ekstra seksjonene på Analyse?**
Appen har elleve seksjoner der fasiten har tre. Skal de bort, eller flyttes bak fanene? Dette er
det største enkeltvalget i PlayerHQ.

**3. Blir Acuity-omveien stående?**
Så lenge `akgolf.no` går til Acuity kan ikke den offentlige bookingsiden bygges mot fasiten — det
er ingenting å sammenligne. PP-1.7 står blokkert til du sier fra.

---

## Én ting til, som jeg mener er viktigere enn skjermene

Grunnen til at `main` sto rød er verdt å merke seg: en automatisk kodemod skrev ugyldig kode over
mange filer, og den ble lagt inn uten at `npm run verify` var kjørt. Diffen så riktig ut — det er
nettopp derfor den slapp gjennom.

Og de tre kvalitetsgatene stopper på første røde steg. Én grønn kjøring beviser bare det øverste
laget. Det gjorde at feilen kunne ligge i main uten at noen så den.

Regelen er lagt i `docs/feillogg.md` og `.claude/rules/gotchas.md`: kjør alltid full verify etter
en kodemod, og rydd eksisterende brudd i samme PR som du innfører en ny gate.
