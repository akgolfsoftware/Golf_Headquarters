# Design-implementering — neste steg (detaljplan under skjermplan-master.md)

**Dato:** 2026-07-06 · **Status:** utkast, venter på godkjenning før noe bygges.
Dette dokumentet er detaljplanen `plans/skjermplan-master.md` selv sier skal lages «i plan-mode
mot faktisk repo-tilstand» før hver bølge. Alt under er verifisert mot koden akkurat nå, ikke antatt.

## Viktigste funn: Bølge 1 er delt i to — én halvdel ferdig, én halvdel ikke startet

Masterplanen (skrevet 2026-07-04) beskriver Bølge 1 som «klar, ingen blokkere, ~1 økt» og
behandler den som ett stykke arbeid. Repoet viser noe annet:

| Del av Bølge 1 | Status | Bevis |
|---|---|---|
| **PlayerHQ «Min golf»** (`/portal/analysere`) | ✅ **FERDIG** | `MinGolfPage.tsx` har alle 6 faner (SG/Fokus/Runder/Baggen/Putting/Nivå) koblet til ekte data (`loadMinGolf`). Komponert fra `src/components/athletic/golfdata/` — en komplett, verbatim-portet komponentfamilie (14 komponenter: SgTotalKort, SgKategoriBar, SgTrend, NesteFokusKort, SlagLekkasjeKart, DiagnoseKort, Scorekort, TigerFiveKort, GappingChart, LaunchWindowKort, StrikeSmashKort, PuttModellKort, KategoriKravKort, SpillerTilstandKort) som matcher design-handover 1:1. Tokens er portet inn under et scopet lag (`src/styles/golfdata-tokens.css`, `.golfdata-scope`) for å ikke kollidere med appens eksisterende shadcn-tokens — en pragmatisk, god løsning på PORTING.md §1 som ikke ligger i selve globals.css. |
| **AgencyOS cockpit** (SpillerTilstandKort-grid, «5 sekunder til tilstand») | ⬜ **IKKE BYGGET** | `SpillerTilstandKort` finnes kun brukt inni `admin/spillere/spillere-tabell.tsx` (en tabellrad, ikke et grid-cockpit). `admin/stall` — den konsoliderte spiller-hub-en som burde vise dette — bruker ikke golfdata-familien i det hele tatt. Ingen skjerm gir coach «5 sekunder til tilstand»-visningen masterplanen beskriver. |

**Konklusjon:** Bølge 1 er ikke «1 økt igjen» — PlayerHQ-halvdelen er allerede levert (trolig i en tidligere økt du ikke husket, eller en parallell økt). Det eneste som gjenstår for å lukke Bølge 1 er AgencyOS-cockpiten.

## Steg 1 — Lukk Bølge 1: AgencyOS cockpit-grid (~2–4 timer)

**Mål:** Coach åpner én skjerm, ser hele stallen som `SpillerTilstandKort`-grid, klikker en spiller → full analyse i coach-dybde (samme golfdata-komponenter som Min golf, men med coach-nivå detalj).

Konkrete steg:
1. Avklar med deg: skal dette bli en NY rute (f.eks. `/admin/cockpit`), eller skal `/admin/stall` sin roster-visning re-komponeres til å bruke `SpillerTilstandKort`-grid som standardvisning? (Stall er allerede «det samlede spiller-navet» — mest sannsynlig riktig sted, men det er din kanon-beslutning, ikke min.)
2. Bygg grid-visningen med `SpillerTilstandKort` fra `athletic/golfdata/`, drevet av samme type data som `loadMinGolf` bruker (SG-status, siste aktivitet) men for HELE stallen, ikke én spiller.
3. Klikk-igjennom til full analyse: gjenbruk `MinGolfPage`-komponentene i coach-dybde-modus (samme komponenter, mer data synlig — ikke en duplisert visning, jf. låst arkitekturprinsipp 2 i masterplanen).
4. Fem-punktsloopen (masterplanens prinsipp 9): type-check/tester · begge moduser mot tilstandsgalleriet · desktop-first (AgencyOS) · tastatur · domenesjekk (SG-tall stemmer mot sg-hub for kjent spiller).
5. Oppdater `docs/MASTER-SKJERMPLAN.md`-raden for denne skjermen i samme commit (låst regel i CLAUDE.md).

**Ferdig når:** coach leser tilstand på 5 sek med ekte data for hele stallen — masterplanens eget kriterium.

## Steg 2 — Start Bølge 2: drill-nivå datamodell (~1 økt)

Dette er den STØRSTE gjenstående blokkeren for hele resten av loopen (Workbench v2, Live-økt v2,
kalender+treningsanalyse i bølge 3–5 avhenger alle av denne). Input ble besvart 2026-07-04, men
**ingenting er bygget ennå** — verifisert: `prisma/schema.prisma` har ingen `OktDrill`, `FysProgram`,
`ProgramSplitt` eller `ProgramOvelse`-modeller.

Konkrete steg (per låst fasit i skjermplan-master.md):
1. `Okt` blir container: `Okt` → `OktDrill[]`, hver drill med alle seks AK-formel-akser
   (Pyramide/Område/CS/Læringstrinn/Situasjon/Press) + én av fire repstyper (svinger uten ball /
   baller slått / tid / sett×reps) + volum.
2. `FysProgram`/`ProgramSplitt`/`ProgramOvelse` (sett/reps/kg/tid/sone) for FYS-koblingen.
3. **Additiv migrering** — følg `.claude/rules/gotchas.md` sin oppskrift eksakt: `CREATE TABLE IF
   NOT EXISTS` via tsx + `PrismaPg`-adapter mot `DIRECT_URL`, ALDRI `migrate dev`/`db push` (begge
   er bekreftet blokkert i dette repoet). Plain `userId String`, ingen `@relation`, for å holde
   endringen isolert fra `User`-modellen.
4. Gamle økter migreres IKKE — fryses som lesbar historikk (låst beslutning).
5. Modellen må tåle klient-generert id + synk-status i feltene (selv om selve offline-logikken
   kommer i Bølge 4) — bygg feltene inn nå så du slipper migrering nummer to.

**Ferdig når:** schema validert + generert, additiv migrering kjørt mot dev-DB uten datatap,
`tsc`/tester/build grønt.

## Etter dette: uendret fra masterplanen

Bølge 3 (Workbench v2) og Bølge 4 (Live-økt v2) kan startes parallelt i hver sin worktree straks
Bølge 2 er grønn. Bølge 5 (kalender + treningsanalyse) avhenger av 2–4. Bølge 6 (komplettering)
og Bølge 7 (AI Coach) står som beskrevet i `plans/skjermplan-master.md` — ingen endringer der.

## Hva jeg IKKE har gjort i denne planleggingsrunden

Ingen kode er endret. Ingen commits. Dette er research + plan, klar for godkjenning.

## Åpne spørsmål til deg

1. Cockpit-skjermen i steg 1: ny rute eller re-komponere `/admin/stall`? (Se punkt 1 over.)
2. Skal jeg kjøre steg 1 og steg 2 i samme økt, eller vil du godkjenne dem hver for seg (steg 1 er
   liten og trygg; steg 2 er en skjemaendring — større, men additiv og reversibel)?
