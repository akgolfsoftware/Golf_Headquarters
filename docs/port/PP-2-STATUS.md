> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

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
| PP-2.1 Konsoll | **Bygget 10.08** (#388) — venter skjermbilde-gate | **Stor** — fasiten er en samtale med artefaktkolonne, appen var en oppslagstavle. Brief: [`PP-2.1-KONSOLL-BRIEF.md`](PP-2.1-KONSOLL-BRIEF.md) |
| PP-2.2 Innboks | **Bygget 10.08** — venter skjermbilde-gate | Stor — layoutfeil (1681 px i 1280 px vindu) rettet, deretter ombygget til fasitens ene liste + detaljpanel (se under) |
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

## PP-2.2 Innboks — hva som ble bygget 10.08.2026

Alle fire avvikene fra galleriet er lukket:

1. **Detaljpanelet forklarer og avgjør saken.** Gjelder · anbefalingskontrakten
   (Hvorfor · Hva · Forventet effekt · Hvorfor nå) · grunnlag · Avvis / Godkjenn og send.
   Kontrakten bæres kun av `forslag`, som i fasiten. Felter agenten ikke har skrevet står som
   «Ikke oppgitt av agenten» — de fabrikeres ikke.
2. **Én liste med filterpiller** (Alle · Trenger godkjenning · Fra spiller · Drift · Løst) i
   stedet for fem faner. Rutene bak pillene er IKKE fjernet — de nås fra ⌘K og fra «Åpne i …»
   på hver sak. Bare fanene er borte fra denne skjermen.
3. **Clay er én handling på én sak:** godkjenn-knappen på øverste åpne sak. Det brede
   «Behandle 46 godkjenninger»-båndet er borte.
4. **Radene har etiketter** (type + hvem) og fristkolonne til høyre, med rød frist når saken
   haster eller har ligget i tre dager.

Datalag: `src/lib/admin/innboks-saker.ts` samler PlanAction · CaddieDraft · SessionRequest ·
Notification · AppFeedback til én sakliste. Ingenting fra den gamle TriageV2 er slettet —
KPI-tallene bor i pillene, tilbakemeldingene er saker av typen «Fra spiller», innsikts-boblen er
erstattet av grunnlaget per sak.

**Bevisst avvik fra fasiten:** fasitens ti-sekunders «Angre» er ikke bygget. En godkjent
PlanAction kjører den faktiske planendringen, og systemet har ingen omvendt operasjon — en
angre-knapp som ikke angrer er verre enn ingen. Løste saker havner i «Løst» med tidsstempel, og
panelet peker videre på neste sak (fasitens egen løst-tilstand).

**Ikke verifisert med skjermbilde ennå:** øktens container har ingen database-tilgang, så
galleriet må kjøres mot Vercel-previewen før skjermen kan krysses av:
`node scripts/signoff-gallery.mjs "PP-2.2" <preview-url>`.
