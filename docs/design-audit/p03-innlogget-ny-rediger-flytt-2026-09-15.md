# P03 innlogget — ny, rediger og flytt fra Plan, 15.09.2026

Gren: `claude/kode-a-kode-b-masterplan-rvq63p`. Ingen visuell portering, ingen migrasjon
mot delt base, ingen produksjonsdata, ingen betaling, ingen utrulling.

Lukker A2 fra KODE-A — det eneste punktet som sto igjen i [KODE-A-kontrollen](kode-a-flake-og-o02-2026-09-14.md).
Serverreglene var prøvd fra før i PR #871; det som manglet var beviset på at en innlogget
spiller faktisk NÅR de tre handlingene gjennom skjermen.

## Hva som er prøvd

Ny fil `tests/p0/plan-ny-rediger-flytt-innlogget.spec.ts`, fire prøver mot isolert
HQ-Supabase med ekte innlogging.

1. **Flytt økt, med persistering.** Spiller velger sin Workbench-økt i Plan, trykker
   «Flytt økt», endrer både dato (to dager fram) og klokkeslett (14.00 → 16.30), lagrer.
   Appen melder «Økten er flyttet.» Deretter gjør prøven en **helt ny sidelasting** og
   finner økta igjen på den nye dagen og tiden. Kalenderknappens `aria-label` bygges av
   de lagrede verdiene, så navnet før og etter er selve beviset — uten persistering ville
   den falt tilbake til seedens 14.00.
2. **«Ny økt» lenker riktig.** Lenken i Plan-hodet fører til
   `/portal/planlegge/workbench` med `start=<ISO-dato>T09:00` — et reelt format, ikke tomt.
3. **«Rediger økt» lenker riktig.** Lenken i detaljpanelet fører til samme rute med
   `okt=<øktas id>`.
4. **Planleggeren viser eierens økter, aldri en fremmed sine.** Positiv kontroll først:
   spilleren ser sin egen økt i uka. Deretter logges spilleren ut, en fremmed logger inn
   på samme rute — og økta er borte.

## To funn underveis, begge verdt å vite

**`?okt=` og `?start=` leses ikke av planleggeren.** `src/app/portal/planlegge/workbench/page.tsx`
tar imot `searchParams` av typen `{ uke?: string }` og bruker kun `uke`. Lenkene fra Plan
er altså korrekt bygget, men planleggeren åpner bare uka — den hopper ikke til den valgte
økta og forhåndsfyller ikke starttidspunktet. Prøve 2 og 3 sier derfor «lenker til», ikke
«åpner» — de beviser at parameterne er riktige, ikke at de virker.

Dette er ikke rettet her. Det er en produktavgjørelse: enten skal planleggeren bruke
parameterne, eller så bør lenkene slutte å love noe de ikke innfrir.

**Planleggeren viser V2-øktene, ikke Workbench-øktene.** Spillerens planlegger laster
`trainingPlanSession` via `loadWorkbenchData`, og det som faktisk rendres i uka er
V2-øktene. En seedet `workbenchSession` dukker aldri opp der. Plan-skjermen slår sammen
begge modellene; planleggeren gjør det ikke. Dette ble målt fordi den positive kontrollen
i prøve 4 feilet to ganger før den pekte på riktig modell — uten den kontrollen ville
avvisningsprøven bestått tomt og bevist ingenting.

## Riggendringer

Seeden fikk to nye, dedikerte økter, etter samme mønster som `LOKAL_WB_ID` og `FREMMED_WB_ID`:

- `FLYTT_WB_ID` (`p0-wb-okt-flytt`, kl. 14.00) — flytte-prøven endrer dato og tid på den,
  og må derfor aldri dele id med `WB_ID`, som `spillerreise-innlogget.spec.ts` forventer
  på dagens dato kl. 09.00.
- `REDIGER_PLAN_ID` (`p0-plan-okt-rediger`) — «Rediger økt» vises bare når økta har en
  `planSessionId`, og den settes kun på plan-modellen. Egen økt i stedet for å låne
  `PLAN_ID`, som `spillerreise-innlogget.spec.ts` gjennomfører og dermed avslutter.

Begge er lagt inn i oppryddingen i seeden og eksporteres gjennom runneren.

## Bevis

| Kjøring | Omfang | Resultat |
|---|---|---|
| Bare den nye spec-en | 4 prøver | **4 passed (58,9 s)** |
| Full P0-pakke | 15 prøver, fem spec-filer | **15 passed (7,0 min)** |

Den fulle pakken er den som betyr noe: den viser at de to nye seedede øktene ikke forstyrrer
de elleve eksisterende prøvene. `spillerreise-innlogget.spec.ts` er fortsatt grønn.

## Ikke påstått

- At planleggeren åpner den valgte økta. Den gjør den ikke — se funnet over.
- At Workbench-økter kan redigeres fra Plan. Bare plan-økter har «Rediger økt».
- At coach-varianten av ny/rediger/flytt er prøvd innlogget. Kun spillerens egen reise.
- Visuell godkjenning, D0 eller lanseringsklar app.
