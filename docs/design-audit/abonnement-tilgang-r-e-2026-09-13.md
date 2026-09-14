# R-E — innlogget abonnement-/tilgangsnivåreise 13.09.2026

**Oppdatert:** flettet til `main` via PR #886, merge-commit `a6f184695`. Se [Caddie/TrackMan-oppfølgingen](caddie-trackman-r-e-2026-09-13.md) for resten av R-E. Teksten under er bevart som opprinnelig skrevet før fletting.

Gren (opprinnelig): `worktree-dapper-hatching-gem`, lokal commit `62803ae9d`. Ingen visuell portering, ingen produksjonsdata, ingen betaling.

## Hva som er prøvd

Samme isolerte HQ-Supabase-stack som P0-TEST (`127.0.0.1:54421`/`54422`, container `*-akgolf-hq-p0`), gjenbrukt uendret. Seeden (`scripts/p0-test-seed-hq.ts`) er utvidet med en fjerde syntetisk rolle: en **TALENT**-profil (`profilType: "TALENT"`, `tier: "GRATIS"`, ingen prøveperiode, ingen abonnement, ingen gruppe) ved siden av den eksisterende FULL-spilleren (trial → `tier: "PRO"`).

Fordi dagens dato (13.09.2026) er etter lanseringsvinduets slutt (1. september 2026), er `gratisForAlle()` i `src/lib/feature-flags.ts` nå falsk — tilgangsgaten i `requirePortalUser` er derfor faktisk aktiv, ikke sovende. Dette er første innloggede browserprøve av selve gaten siden vinduet stengte.

Ny spec: `tests/p0/abonnement-tilgang-innlogget.spec.ts`.

| Prøve | Resultat |
|---|---|
| FULL-spiller åpner `/portal/planlegge` direkte, ingen omvei | Bestått |
| TALENT-profil åpner `/portal/tren/tester` (talent-allowlist) og ser innholdet | Bestått |
| TALENT-profil forsøker `/portal/planlegge` (FULL-låst) → sendes til `/portal/meg/abonnement/oppgrader/flyt`, ingen Plan-innhold vises | Bestått |

Kjørt to ganger (isolert og i full pakke sammen med `spillerreise-innlogget.spec.ts`): begge ganger 2/2 bestått for denne spec-en.

## Miljøblokkering løst uten å røre `.env.local`

Denne arbeidskopien har `.env.local` symlenket inn (normalt dev-oppsett), og P0-skriptet krever eksplisitt en arbeidskopi UTEN noen `.env*`-fil (for å garantere at ingen live-nøkkel kan lekke inn). Løst ved å opprette en egen, midlertidig `git worktree` fra samme commit (som per definisjon ikke arver gitignorede filer som `.env.local`), kopiere `node_modules` og `src/generated/prisma` dit (symlink ble avvist av Turbopack: «Symlink … points out of the filesystem root»), kjøre reisen derfra, og fjerne den midlertidige worktreen og kopiene etterpå. `.env.local` i denne arbeidskopien er aldri lest, flyttet eller kopiert.

## Pre-eksisterende funn (ikke forårsaket av denne endringen)

`spillerreise-innlogget.spec.ts` sin siste test («tillatt coach ser økta; uvedkommende avvises uten innhold») feilet på ett steg (fremmed spiller ble ikke sendt videre fra `/portal/live/p0-wb-okt/summary` innen 20 s). Reprodusert ved å kjøre KUN denne spec-filen uten min nye fil — feilen finnes altså uavhengig av dagens endring, sannsynligvis en tidsbestemt flake i eksisterende kode. Ikke rettet i denne leveransen; loggført her så den ikke forveksles med en regresjon fra R-E-abonnement-arbeidet.

## Begrensninger

- `.env.local` leses ikke, som i P0-TEST. Nøkler i `/tmp/ak-hq-p0.status.env`, syntetiske passord i `/tmp/ak-hq-p0-creds.env` (ikke Git).
- Kun abonnement-/tilgangsnivådelen av R-E-oppgaven («Caddie-, TrackMan-, lokal lagrings- og abonnementsreise») er dekket her. Caddie-chat, TrackMan-import og privat lokal lagring har fortsatt ingen tilsvarende innlogget browserreise — se masterplanen.
- Ingen visuell godkjenning. Ingen produksjonsreise. Ingen reell betaling.
- Endringen er en lokal commit i denne arbeidskopien. Ikke pushet, ikke PR, ikke flettet til `main`, ikke synkronisert til Notion.

## Ikke påstått

- At Caddie/TrackMan/lokal lagring er innlogget prøvd.
- At dette er lansert eller produksjonsverifisert.
- At den pre-eksisterende flaken i `spillerreise-innlogget.spec.ts` er rettet.
