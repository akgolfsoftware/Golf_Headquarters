# LOOP 2 — DONE (25.08.2026)

Agency Workbench uke-UI på Loop 1-domenet: **se · opprett · flytt · publiser.**
Bølge 1, loop 2 av 14. Gren `claude/agency-workbench-uke-ui-c4d2a4`. Ikke merget.

## Verifikasjon

| Gate | Resultat |
|---|---|
| `npm run verify` (prisma validate/generate · tsc · eslint · action-auth · token-gap · critical-imports · build) | grønn |
| `npm test` | 1595/1595 |
| Ny rute i byggutdraget | `ƒ /admin/workbench/[playerId]` |

`npm ci` måtte kjøres i arbeidstreet først — uten ekte `node_modules` faller
Turbopack tilbake på å lete etter `next/package.json` fra `src/app` og bygget
dør, og `check-critical-imports` rapporterer fem falske «BUNDLE FAIL».
Begge var grønne etter installasjonen.

**Manuell klikk-test er IKKE utført.** Den krever innlogging som coach i en
kjørende app, og Claude skriver aldri Anders' passord (skjermbilde-gaten).
Flyten uke → opprett → UTKAST → flytt → publiser står derfor uverifisert i
nettleser; koden er typesjekket og bygget, ikke klikket.

## Filer

| Fil | Hva |
|---|---|
| `src/app/admin/workbench/[playerId]/page.tsx` | **Ny rute** — auth (ADMIN/COACH + `coachScopedPlayerWhere`), første uke-last, `V2Shell` |
| `src/components/workbench/WorkbenchUke.tsx` | Orkestrering: tilstand, `WbResultat` → norsk copy + sonner, ukenavigasjon |
| `src/components/workbench/WeekGrid.tsx` | Sju dagkolonner på delt `TimeGrid` (05:00–23:00, 30 min), økt-kort, tom uke |
| `src/components/workbench/SessionInspector.tsx` | Inspektør — **flytting skjer her** (dato/start/varighet), publiser / trekk tilbake / slett |
| `src/components/workbench/CreateSessionModal.tsx` | «Ny økt» på `ui/Dialog` — tittel, dato, start, varighet, område |
| `src/components/workbench/PublishConfirmDialog.tsx` | Bekreftelse med full liste + «I dag»-advarsel |
| `src/components/workbench/SourcesPanel.tsx` | Skall — «Ingen kilder lastet» |
| `src/components/workbench/WorkbenchFeil.tsx` | Feil-tilstand for uke-lasting |
| `src/components/workbench/wb-visuelt.ts` | Delte visuelle konstanter (`WARM`, statusversaler) |
| `src/lib/workbench/wb-actions.ts` | **Endret** — `revalidatePath` på alle writes |

Egen rute ved siden av den eksisterende `/admin/spillere/[id]/workbench`, som
kjører videre på den gamle plan-modellen. De deler ingen tabeller, så ingenting
i drift ble rørt.

## Copy og farge

- Utkast: versal `UTKAST` i kortet, og «Utkast — kun synlig for deg» i
  inspektøren (`UI.draftBadge`).
- Publiser-knappen: «Publiser uke · N», deaktivert når N = 0.
- Bekreftelsen advarer eksplisitt når en av øktene er **i dag**.
- Tom uke: «Ingen økter denne uken» + «Klikk i uka for å legge inn en økt.»
- Alle feil er tilstander: rødt kort med én norsk setning + «Prøv igjen», aldri
  rå `e.message`.

Ingen nye tokens. Den varme haken bruker `var(--p-accent-fg)` — #B85C3D i lys,
lysere variant i mørk.

## Gap-tabell

| Punkt | Hva som ble gjort | Hvorfor |
|---|---|---|
| «PUBLISHED warm-hake #B85C3D» | Warm hake på **PUBLISHED, IN_PROGRESS og COMPLETED** — alt spilleren faktisk ser | CLAUDE.md invariant 2 knytter warm+hake til *fullført*. Å gi bare PUBLISHED haken ville latt en fullført økt se mindre ferdig ut enn en publisert. Statusen skrives i tillegg som versal (`PUBLISERT` / `FULLFØRT`), så de er ikke like. Ingen `#30D158` i bruk. |
| Drag-to-move i uka | Flytting via inspektørfelter | Prompten: «tid/dato = move i v1». Ingen ny dnd-lib (anti-scope). |
| `SourcesPanel` | Skall med tom tilstand | `loadSources` returnerer tom liste til Loop 2T. |
| Låste blokker (skole/booking) | Tegnes dempet **hvis** de finnes, men `loadWeek` returnerer fortsatt tom liste | Koblingen til skoletid/booking er ikke gjort. |
| Drill-redigering | Kun lesing i inspektøren | Loop 2S eier drill-editoren. |
| Mobil | Kilder og inspektør er skjult under `lg` | Fasiten for mobil-Workbench er egen skjerm; uke-grid på 390px hører til en egen jobb, ikke denne. Dokumentert, ikke løst. |
| Ukebudsjett-mål | `targetMinutes` er 0 (ingen kilde) | Volummålet per spiller er ikke koblet på ennå — linjen viser «mål 0 t». |

## Sikkerhetsfunn — RLS er AV på de nye tabellene

`workbench_sessions` og `workbench_drills` ble opprettet uten Row Level
Security. Appen selv går via Prisma med tjenestetilkobling og er upåvirket, men
en klient med anon-nøkkelen kan i prinsippet lese og skrive alle rader — det
gjelder også spillerens utkast-økter.

Ikke rettet her: å slå på RLS uten policyer stenger alt, og valget av policyer
er Anders'. Forslag til beslutning i neste økt:

```sql
ALTER TABLE public.workbench_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workbench_drills ENABLE ROW LEVEL SECURITY;
```

(Samme funn gjelder `position_task_maal` og `kondisjon_segmenter` — eldre
tabeller, utenfor denne loopen.)

## Neste

Loop 2S (inspektør + drill komplett/MANGLER). Ikke startet.
