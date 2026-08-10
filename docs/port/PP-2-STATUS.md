# PP-2 AgencyOS kjerne — status

**Oppdatert:** 09.08.2026 overnight  

| ID | Fasit | Status |
|---|---|---|
| Konsoll | agencyos-konsoll | slug + prior wave chrome — READY_SIGN polish |
| Innboks | agencyos-innboks | slug |
| Spillere | agencyos-spillere | slug |
| Kalender | agencyos-kalender | slug + coach colors |
| Økonomi / settings / rest | fase1 | pattern; pixel i later pass |

**Batch B:** slugs + prior PORT — full pixel finpuss kan fortsette i C+.

## Sign-off-bevis 10.08.2026

Konsoll, Innboks, Spillere og Kalender er fotografert mot fasit i
[`SIGNOFF-GALLERI-2026-08-10.md`](SIGNOFF-GALLERI-2026-08-10.md).

**Hovedfunn: detaljkolonnen til høyre mangler eller har feil innhold.** Fasiten bruker den til å
forklare og avgjøre den valgte saken. Konsoll og Kalender har den ikke i det hele tatt; Innboks har
den, men med innsikts-boble og tilbakemeldinger i stedet for beslutningsgrunnlaget.

Andre funn som går igjen: clay brukes som bredt bånd med generisk knapp («Ny økt», «Behandle 46
godkjenninger») der fasiten bruker den på én konkret handling på én konkret sak.

| ID | Anbefaling | Størrelse |
|---|---|---|
| PP-2.1 Konsoll | **Egen jobb** (Anders 10.08) | **Stor** — fasiten er en samtale med artefaktkolonne, appen er en oppslagstavle. Brief: [`PP-2.1-KONSOLL-BRIEF.md`](PP-2.1-KONSOLL-BRIEF.md) |
| PP-2.2 Innboks | FIKS FØRST | Stor — layoutfeil (1681 px i 1280 px vindu) **rettet 10.08** |
| PP-2.3 Spillere | FIKS FØRST | Middels — mangler gruppering (Trenger deg / Følger planen / Hviler) og SG-kolonne |
| PP-2.4 Kalender | FIKS FØRST | Stor — mangler detaljkolonne, Agenda-visning og belegg-tallene |

## PP-2.3 — bygget 10.08.2026

Lista er delt i fasitens tre bolker, hver med sin forklaring i fasitens egen ordlyd.

**Funn underveis: «Hviler» fantes ikke som tilstand, og det var en ekte feil — ikke bare en
manglende overskrift.** `SKADET` og `PERMISJON` ble begge mappet til «Bak plan», så en spiller i
avtalt pause eller retur-til-spill lyste rødt som om coachen måtte gjøre noe. Fasiten sier
eksplisitt det motsatte: «Planlagt pause eller retur-til-spill. **Teller ikke som stille.**»
Ny `StatusKind: "hviler"` med etikettene «Planlagt pause» / «Retur til spill», og sjekken er
flyttet FØR stillhets-sjekken i `statusFrom()`.

| Avvik | Status |
|---|---|
| 1 Gruppering i tre | **Bygget** |
| 2 Filtre i tre rader → én rad med tall | Gjenstår |
| 3 «Radene mangler tall» | **Delvis feil i galleriet** — SG *er* på hver rad (`meta`-kolonnen i `SpillerRadEnkel`). Siste økt mangler reelt, og finnes ikke i `StallenRow` |
| 4 Detaljpanel: fire nøkkeltall + testtabell | Gjenstår — krever kategori + testdata i loaderen |
| 5 Workbench-knapp over overskriften | Gjenstår |

## PP-2.4 — egen jobb

Brief skrevet: [`PP-2.4-KALENDER-BRIEF.md`](./PP-2.4-KALENDER-BRIEF.md). Fire PR-er anbefalt
(tidsakse+agenda → nøkkeltall → detaljkolonne → clay-disiplin). Ikke påbegynt i kode — den er
på størrelse med Konsollen og bør ikke tas som en delvis justering.

Merk: coach-testbrukeren har 1 spiller og ingen bookinger, så flere skjermer viser tom tilstand.
Det er notert per skjerm i galleriet slik at ingenting vurderes på feil grunnlag.
