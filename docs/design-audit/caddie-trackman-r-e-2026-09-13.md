# R-E — innlogget Caddie-tilgang og TrackMan CSV/HTML-import 13.09–14.09.2026

Gren: `codex/etter-merge-2026-09-14`, oppå PR #886/#887 (main `e565264b`). Ingen visuell portering, ingen produksjonsdata, ingen reell AI-modellrespons, ingen betaling.

## Hva som er prøvd

Samme isolerte HQ-Supabase-stack som P0-TEST og forrige R-E-leveranser (`127.0.0.1:54421`/`54422`). Seeden er utvidet med en femte syntetisk rolle: **ADMIN** (`p0-admin@akgolf.test`) — `canAccessMissionControl` krever nøyaktig denne rollen, COACH er bevisst ikke nok.

Spec: `tests/p0/caddie-trackman-innlogget.spec.ts` (4 tester).

| Prøve | Resultat |
|---|---|
| ADMIN sender ekte innlogget POST til `/api/caddie/chat` → slipper forbi tilgangssjekken (status ≠ 401) | Bestått |
| COACH sender samme forespørsel → 401 «Ikke autorisert» | Bestått |
| Uinnlogget forespørsel → 401 | Bestått |
| FULL-spiller åpner `/portal/analysere/trackman`, laster opp CSV med eksplisitte enheter (mph/m) gjennom hele 4-stegs-modalen, bekrefter og ser slaget i listen | Bestått |
| Samme spiller laster opp en TrackMan Multi Group HTML-rapport med eksplisitte enheter, egen dato (unngår «ligner eksisterende»-kollisjonen), bekrefter og ser 2 økter i listen | Bestått |

Kjørt gjentatte ganger, både isolert og i full pakke med alle fire P0-spec-filer (10 tester): konsistent 9–10/10 bestått, alltid med samme ene kjente, pre-eksisterende flake (se nedenfor) som eneste avvik.

## Caddie har ingen ferdig side ennå — testet direkte mot API-et

`KonsollChat`-komponenten (Mission Control-chatten) er bygget, men **ingen side under `src/app/admin` monterer den** — verifisert med grep før testen ble skrevet. Dette matcher beslutningen «AI-laget samles på ÉN adresse» (`beslutninger.md`), som lister «konsollens AI-panel» som gjenstående arbeid. I stedet for å late som om en klikkbar reise finnes, sender testen en ekte innlogget `POST` til `/api/caddie/chat` med Playwrights `page.request` (samme session-cookies som en ekte nettleser ville hatt) og verifiserer tilgangsgaten direkte. Selve AI-svaret er ikke testet — `ANTHROPIC_API_KEY` finnes ikke i det isolerte miljøet, og testen bruker bevisst kun `expect(status).not.toBe(401)` for ADMIN, ikke et faktisk streamet svar.

## TrackMan: to av tre kilder dekket — foto krever en AI-nøkkel som ikke skal inn i testmiljøet

CSV og HTML Multi Group Report parses client-side (`parseTrackManCsv`/`parseTrackManHtmlReport`), uten AI. Begge er nå prøvd gjennom hele skjermflyten: kildevalg → filopplasting → forhåndsvisning → bekreft og importer → slaget synlig i listen. Foto-kilden (AI-vision-avlesning) krever `ANTHROPIC_API_KEY`, som aldri skal legges inn i et sky-testmiljø — den er derfor fortsatt udekket av en innlogget reise, samme begrensning som Caddie sitt AI-svar.

## Testhygiene- og isolasjonsfunn rettet underveis

- Første fulle kjøring feilet på TrackMan-testens «Ingen økter ennå»-sjekk — en tidligere, isolert kjøring hadde latt et importert TrackMan-slag ligge igjen (seeden ryddet WB/V2/plan, men ikke `TrackManSession`). Rettet med `prisma.trackManSession.deleteMany({ where: { userId: spiller.id } })` i seeden.
- HTML-testen bruker bevisst en ANNEN dato enn CSV-testen (12. vs. 13.) i samme fil, for å unngå at importen blir tolket som «ligner eksisterende økt» og krever en ekstra bekreft-klikk.

## Pre-eksisterende funn (ikke forårsaket av denne endringen)

Samme flake som i de to forrige R-E-leveransene: `spillerreise-innlogget.spec.ts` sin siste test («tillatt coach ser økta; uvedkommende avvises uten innhold») feiler av og til på ett steg, uavhengig av alt arbeidet i denne PR-en (reprodusert også uten disse endringene i tidligere leveranser). Ikke rettet.

## Begrensninger

- `.env.local` leses ikke. Løst med samme midlertidige-worktree-mønster som forrige leveranser (kopiert `node_modules`/`src/generated/prisma`, aldri symlenket — Turbopack avviser symlinker som peker utenfor prosjektroten).
- Caddie: kun tilgangsgaten er bevist innlogget. Selve AI-samtalen (modellrespons, verktøykall, godkjenningsflyt) er ikke prøvd — krever `ANTHROPIC_API_KEY`. Ingen side finnes ennå for å klikke seg dit som ekte bruker.
- TrackMan foto-kilde (AI-vision) er ikke dekket — samme `ANTHROPIC_API_KEY`-begrensning.
- Ingen visuell godkjenning. Ingen produksjonsreise. Ingen reell betaling.

## Ikke påstått

- At Caddie-samtalen (AI-svar, verktøykall, godkjenning) fungerer innlogget.
- At TrackMan foto-kilden er innlogget prøvd.
- At dette er lansert eller produksjonsverifisert.
