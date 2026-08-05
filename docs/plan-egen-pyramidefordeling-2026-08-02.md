# Plan — spilleren setter sin egen pyramidefordeling

Bestilt av Anders 2026-08-02, som oppfølger til tiltak 4 i
`docs/kvalitetsaudit-2026-08-02.md`: «prosentfordelingen skal ikke være låst —
spilleren skal sette sine egne verdier».

Alt under nåtilstand er verifisert mot koden 2026-08-02, ikke antatt.

## Nåtilstand (verifisert)

Halve funksjonen finnes allerede — det er eierskapet og skjermen som mangler.

| Del | Status | Sted |
|---|---|---|
| Lagring av egen fordeling | **Finnes** — `TrainingPlan.targetAllocation` (`Json?`) | `prisma/schema.prisma:991` |
| Validering + standardfallback | **Finnes** — zod, `STANDARD_MAL` (FYS 15 / TEK 20 / SLAG 35 / SPILL 20 / TURN 10) | `src/lib/training/target-allocation.ts` |
| Måling mot fordelingen | **Finnes** — plan-watcher måler avvik mot planens mål | `src/lib/agents/plan-watcher.ts:38` |
| Visning av fordeling | **Finnes** som komponent, brukt ett sted (admin/team) | `src/components/athletic/golfdata/AkseFordelingsBar.tsx` |
| Spiller/coach setter den selv | **Mangler helt** — ingen skjerm, ingen server action | — |
| Hvem eier verdien | **Uavklart i koden** — ingen sporing av hvem som satte den | — |

### Den kritiske feilen

`src/lib/agents/plan-action-executor.ts:688` overskriver `targetAllocation` med
periodens standardtall ved hvert `PERIOD_SWITCH`:

```ts
update.targetAllocation = allocationForPeriod(periodNote);
```

Det betyr at en fordeling spilleren har satt selv blir slettet i stillhet neste
gang planen bytter periode (GRUNN → SPES → TURN). **Å bygge en skjerm uten å
fikse dette først gir en innstilling som forsvinner av seg selv** — verre enn
ingen innstilling.

I dag er eneste vei inn til feltet at en coach godkjenner et `PYRAMID_ADJUST`-
forslag fra en agent. Spilleren har ingen vei inn.

## Prinsipper for denne jobben

1. **Spillerens verdi vinner.** Setter spilleren fordelingen selv, skal ingen
   agent, periodebytte eller plangenerering overskrive den uten at spilleren
   sier ja.
2. **Anbefalinger sperrer aldri** (husets invariant 1). CANON-nivåene — TEK ≥ 15 %
   og resten — vises som varsel, aldri som sperre. Samme linje som
   `tekAnbefalingsVarsel()` i PR #247.
3. **Færrest mulig trykk.** Én skjerm, fem tall, sum vises live. Ikke en
   innstillingsmeny med undersider.

## Planen (10 steg)

| # | Steg | Verifiseres ved |
|---|---|---|
| 1 | **Eierskap i datamodellen:** legg til `targetAllocationSource` (`STANDARD` / `PERIODE` / `SPILLER` / `COACH`) og `targetAllocationSetAt` på `TrainingPlan`. Additiv endring, kjøres kirurgisk med `db execute` per gotchas — ikke `migrate dev`. | `npx prisma generate` grønn; feltene finnes i prod-tabellen |
| 2 | **Stopp overskrivingen:** `plan-action-executor.ts:688` skriver kun `targetAllocation` når kilden ikke er `SPILLER`/`COACH`. Er den satt av et menneske, foreslås periodens fordeling i stedet for å tvinges inn. | Enhetstest: PERIOD_SWITCH på en plan med spiller-satt fordeling lar verdien stå |
| 3 | **Domenelaget:** `settEgenFordeling()` i `src/lib/training/target-allocation.ts` — normaliserer til sum 100, validerer med zod, returnerer varsler (CANON-avvik) uten å endre tallene. Ingen I/O. | Enhetstester: sum-normalisering, avviksvarsler, ugyldig input |
| 4 | **Server action** for spilleren (`portal`) — henter og lagrer fordelingen på aktiv plan, setter kilde `SPILLER`. Auth-sjekket, består `check-action-auth`. | `node scripts/check-action-auth.mjs` grønn |
| 5 | **Spillerskjerm:** redigering i Workbench (`portal/planlegge`) — fem skyveknapper eller talefelt, `AkseFordelingsBar` som live forhåndsvisning, sum vist hele tiden, «Tilbakestill til periodens forslag» som utvei. | Klikk-test mobil + desktop |
| 6 | **Varsel, ikke sperre:** avvik fra CANON (TEK under 15 % m.m.) vises som setning under baren. Lagring blokkeres aldri. | Test: fordeling med TEK 5 % lagres, og varselet vises |
| 7 | **Coach-siden:** samme redigering i coachens spiller-Workbench (`admin`), setter kilde `COACH`. Coach ser hvem som satte gjeldende fordeling og når. | Klikk-test i AgencyOS |
| 8 | **Periodiseringen blir et forslag:** `allocationForPeriod()` leverer forslag til skjermen i stedet for å skrive rett til planen. Agentenes `PYRAMID_ADJUST` går via godkjenning som i dag. | Enhetstest + gjennomgang av kallstedene |
| 9 | **Ferdig-definisjon:** mål Workbench-skjermene (spiller + coach) mot `docs/port/plan-designport-alle-skjermer.md` §Ferdig-definisjon per skjerm. | Skjermbilder (mobil 390px + desktop, lys og mørk) godkjent av Anders |
| 10 | **Full gate + PR:** `npm run verify && npm test`, egen gren, PR, og Anders sier ja før hovedversjonen. | CI grønn på PR |

## Rekkefølge og risiko

Steg 1–2 må ligge først. De er hele forskjellen på en innstilling som holder og
en som forsvinner ved neste periodebytte. Steg 3–6 er selve funksjonen for
spilleren. Steg 7–8 utvider til coach og rydder i hvem som eier tallet. Steg
9–10 er husets vanlige avslutning.

Største risiko er steg 2: `PERIOD_SWITCH` er en sti agentene bruker aktivt, og
den er testet tynt i dag. Enhetstesten i steg 2 er derfor ikke valgfri.

Steg 1 rører `prisma/schema.prisma`, som krever Anders' ja (hook-håndhevet), og
DDL-en kjøres med skript — ikke `prisma migrate`. Se
`.claude/rules/gotchas.md` §Schema-endringer.

## Bevisst utenfor

- Egen fordeling per **periode** (én fordeling for GRUNN, en annen for TURN).
  Kan bygges senere oppå kilde-feltet fra steg 1 — start med én fordeling per plan.
- Gruppe- og lagfordeling (GFGK/WANG) — egen jobb med egne eierskapsregler.
- Historikk over endringer i fordelingen.
