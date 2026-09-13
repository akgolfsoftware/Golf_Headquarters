# R-E — innlogget Caddie-tilgang og TrackMan CSV-import 13.09.2026

Gren: `codex/r-e-caddie-trackman-2026-09-13`, lokale commits `e1019244c` og `c0ad8d1e7`, oppå PR #886 (`a6f184695`). Ingen visuell portering, ingen produksjonsdata, ingen reell AI-modellrespons, ingen betaling.

## Hva som er prøvd

Samme isolerte HQ-Supabase-stack som P0-TEST og forrige R-E-leveranse (`127.0.0.1:54421`/`54422`). Seeden er utvidet med en femte syntetisk rolle: **ADMIN** (`p0-admin@akgolf.test`) — `canAccessMissionControl` krever nøyaktig denne rollen, COACH er bevisst ikke nok.

Ny spec: `tests/p0/caddie-trackman-innlogget.spec.ts`.

| Prøve | Resultat |
|---|---|
| ADMIN sender ekte innlogget POST til `/api/caddie/chat` → slipper forbi tilgangssjekken (status ≠ 401) | Bestått |
| COACH sender samme forespørsel → 401 «Ikke autorisert» | Bestått |
| Uinnlogget forespørsel → 401 | Bestått |
| FULL-spiller åpner `/portal/analysere/trackman`, laster opp CSV med eksplisitte enheter (mph/m) gjennom hele 4-stegs-modalen, bekrefter og ser slaget i listen | Bestått |

Kjørt tre ganger totalt (isolert alene, i full pakke med alle tre spec-filer × 2 — én kjøring avdekket et testhygienefunn, se under). Siste fulle kjøring: 8/9 bestått, 1 feil (kjent, pre-eksisterende — se nedenfor).

## Caddie har ingen ferdig side ennå — testet direkte mot API-et

`KonsollChat`-komponenten (Mission Control-chatten) er bygget, men **ingen side under `src/app/admin` monterer den** — verifisert med grep før testen ble skrevet. Dette matcher beslutningen «AI-laget samles på ÉN adresse» (`beslutninger.md`), som lister «konsollens AI-panel» som gjenstående arbeid. I stedet for å late som om en klikkbar reise finnes, sender testen en ekte innlogget `POST` til `/api/caddie/chat` med Playwrights `page.request` (samme session-cookies som en ekte nettleser ville hatt) og verifiserer tilgangsgaten direkte. Selve AI-svaret er ikke testet — `ANTHROPIC_API_KEY` finnes ikke i det isolerte miljøet, og testen bruker bevisst kun `expect(status).not.toBe(401)` for ADMIN, ikke et faktisk streamet svar.

## Testhygienefunn rettet i samme leveranse

Første fulle kjøring av alle tre spec-filene sammen feilet på TrackMan-testens «Ingen økter ennå»-sjekk — fordi en TIDLIGERE, isolert kjøring av samme spec hadde latt et importert TrackMan-slag ligge igjen i databasen (seeden ryddet WB/V2/plan-øktene, men ikke `TrackManSession`). Rettet ved å legge `prisma.trackManSession.deleteMany({ where: { userId: spiller.id } })` inn i seeden, sammen med den øvrige oppryddingen. Ny full kjøring: bestått.

## Pre-eksisterende funn (ikke forårsaket av denne endringen)

Samme flake som i forrige R-E-leveranse: `spillerreise-innlogget.spec.ts` sin siste test («tillatt coach ser økta; uvedkommende avvises uten innhold») feiler av og til på ett steg. Observert også i denne kjøringen. Ikke rettet — se [abonnement-leveransen](abonnement-tilgang-r-e-2026-09-13.md) for detaljer.

## Begrensninger

- `.env.local` leses ikke. Løst med samme midlertidige-worktree-mønster som forrige leveranse (kopiert `node_modules`/`src/generated/prisma`, aldri symlenket — Turbopack avviser symlinker som peker utenfor prosjektroten).
- Caddie: kun tilgangsgaten er bevist innlogget. Selve AI-samtalen (modellrespons, verktøykall, godkjenningsflyt) er ikke prøvd — krever `ANTHROPIC_API_KEY`, som aldri skal inn i et sky-testmiljø. Ingen side finnes ennå for å klikke seg dit som ekte bruker.
- TrackMan: kun CSV-kilden er prøvd innlogget. HTML-rapport og foto (AI-vision) er ikke dekket her — foto krever samme `ANTHROPIC_API_KEY`-begrensning som Caddie.
- Privat lokal lagring (R-C) er fortsatt ikke dekket av noen innlogget reise.
- Ingen visuell godkjenning. Ingen produksjonsreise. Ingen reell betaling.

## Ikke påstått

- At Caddie-samtalen (AI-svar, verktøykall, godkjenning) fungerer innlogget.
- At TrackMan HTML/foto-kildene er innlogget prøvd.
- At privat lokal lagring er innlogget prøvd.
- At dette er lansert eller produksjonsverifisert.
