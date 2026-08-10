# PP-2.1 Konsoll — brief for ombygging

**Skrevet 10.08.2026** som overlevering til en frisk økt. Anders har bestemt at konsollen tas som
egen jobb. Alt du trenger for å starte står her — du skal ikke måtte lete gjennom gårsdagens
samtale.

**Fasit:** `designsystem/paper/fase1/agencyos-konsoll-desktop.html` (1540 linjer) og
`agencyos-konsoll-mobil.html`. Kilden er Claude Design-prosjektet `605a48cc` — speilet i repoet kan
henge etter, så sjekk mot `claude-design`-MCP hvis noe ser rart ut.

**Bevis på dagens tilstand:** `screenshots/paper/signoff/PP-2.1-d1280.png` (app mot fasit side om
side) og `docs/port/SIGNOFF-GALLERI-2026-08-10.md` §PP-2.1.

---

## Problemet i én setning

Fasiten er en **samtale med et artefaktpanel**. Appen er en **oppslagstavle med ti kort**.
Fargene og skriftene stemmer allerede — det er formen som er feil.

---

## Slik er fasiten bygget

Tre kolonner:

**Venstre — smal ikon-rail.** Åtte punkter: Konsoll · Innboks *(med tallet 7)* · Spillere ·
Kalender · Workbench · AgenticOS · Økonomi · Innstillinger. Nederst en tema-bryter.
Appen har seks: Konsoll · Innboks · Spillere · Kalender · Innsikt · Mer — og ingen badge-tall.

**Midten — tråden.** Dette er hovedflaten.
- Topplinje: «Konsoll» + dato/uke/klokke, «Kommandoer ⌘K», mikrofon-knapp, og en knapp
  «Ukeplan · Utkast» som åpner artefaktpanelet.
- Selve tråden er vekslende innlegg: `you` (coachen) og `ai` (systemet). Hvert AI-svar kan ha:
  - et sammendrag i prosa,
  - en sammenleggbar «Hvorfor»-boks (`<details class="why">`),
  - en artefakt-referanse med knapper «Åpne i panel» · «Se grunnlag» · «Endre»,
  - en tabell (f.eks. stille spillere med kategori og antall dager),
  - handlingsknapper som lenker videre til PlayerHQ eller kalenderen.
- Det siste innlegget er **«Én ting nå»**: en clay-tonet boks med forklaring og to knapper —
  clay «Godkjenn ukeplan · Øyvind» og nøytral «Se planen først».
- Nederst: **composer** med tekstfelt («Skriv hva du vil ha gjort. / for kommandoer, @ for
  spiller.»), mikrofon, `/`- og `@`-knapper, mørk «Send», og en kontekstlinje
  «Ser: stallen · uke 31 · CANON v3.5» som åpner en boks med kildene modellen faktisk leser.

**Høyre — artefaktpanelet** (`<aside class="artifact">`), åpnes fra toppknappen:
- metadata-piller: uke, periode, kategori, timebudsjett
- én dagkort per ukedag med timer, motorikk-nivå og AK-formel-kode
  (`TEK_TEE_TOTAL_UTEN_BALL_INNENDORS_ALENE`)
- **invariant-sjekk** med hake per linje (TEK-andel, ukebudsjett, aldersregel)
- **sløyfen**: tre lenker — FØR · fangst / UNDER · kalender / ETTER · PlayerHQ
- bunn: mørk «Publiser» + «Se diff mot uke 31»

Fasiten har også fire demo-tilstander (Suksess / Tom / Laster / Feil). **Det er fasitens eget
verktøy for å vise tilstandene — ikke noe som skal bygges.** Men de fire tilstandene skal finnes
i koden, jf. ferdig-definisjonen per skjerm.

---

## Slik er appen i dag

`src/components/admin/v2/CockpitV2.tsx` (425 linjer). Én kolonne, ti blokker i rekkefølge:
`hode` · `hurtig` (knapperad) · AI-dispatch-panel · `live` · `koen` · `kpi` · fokus-spillere ·
`innboksModul` · `timer` + `stalluka` · stall-økter · `innsikt`.

Ingen tråd. Ingen composer. Ingen artefaktkolonne.

---

## Det du kan gjenbruke (ikke bygg fra bunnen)

| Trenger | Finnes allerede |
|---|---|
| Chat-tråd med AI/bruker-innlegg og composer | `src/components/portal/v2/chat/PortalChatHjem.tsx` |
| Artefaktpanel som glir inn fra høyre | `src/components/portal/v2/chat/ArtefaktPanel.tsx` |
| Fangst-modal med diktat | `src/components/portal/v2/chat/FangstModal.tsx` |
| Agent-kø og oppgaver bak konsollen | `src/lib/kommando/` + `/kommando`-ruten |
| AI-dispatch-data («Én ting nå» for coach) | `AiDispatchPanelV2` + `loadAiDispatch`, se `agenticos-cockpit`-skillen |

PlayerHQ-hjem er altså allerede den samme formen som fasiten vil ha på konsollen. Den store jobben
er å gjenbruke det mønsteret med coach-data, ikke å oppfinne det.

---

## Rekkefølge jeg ville tatt det i

1. **Rail først** — åtte punkter og badge-tall på Innboks. Liten, isolert, treffer alle
   AgencyOS-skjermer samtidig.
2. **Artefaktpanelet** — gjenbruk `ArtefaktPanel`, fyll det med ukeplan-data. Kan testes for seg.
3. **Tråden** — erstatt kort-stabelen med samtaleflaten. Behold dataene som allerede lastes
   (`koen`, `innboksModul`, `stalluka` osv.) som *innlegg i tråden*, ikke som kort. Ingenting av
   informasjonen skal forsvinne.
4. **Composeren** — sist, fordi den henger sammen med `/`- og `@`-menyene.

Hvert steg er sin egen PR med skjermbilde til Anders før merge (skjermbilde-gaten, se
`.claude/rules/beslutninger.md`).

---

## Faste rammer

- **Fasit vinner.** Sier et dokument eller en kodekommentar noe annet, er dokumentet som skal
  rettes.
- **Clay er én konkret handling på én konkret sak.** Aldri et bredt bånd med generisk knapp — det
  er nettopp feilen konsollen har i dag.
- **Ingenting slettes.** All informasjon som ligger i kortene i dag skal finnes igjen, i tråden
  eller i panelet.
- **Skjermbilde-gaten:** mobil 390 px først, så desktop 1280 px, lys og mørk, fasiten ved siden av,
  sendt direkte i samtalen så Anders kan se det fra telefonen.
- Verktøyet til det: `node scripts/signoff-gallery.mjs "PP-2.1" http://localhost:3000`

## Testdata — vær klar over dette

Coach-brukeren `coachtest@akgolf.test` har **1 spiller og ingen bookinger**. Konsollen blir derfor
nesten tom i skjermbildene. Det skjuler ikke formfeilene, men det gjør at «Én ting nå» og
artefaktpanelet ikke har noe ekte innhold å vise. Vurder å seede litt coach-data først —
`scripts/seed-screentest-coach.ts` finnes.
