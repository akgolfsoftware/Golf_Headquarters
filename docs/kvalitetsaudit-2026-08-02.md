# Kvalitetsaudit — veien til 10/10 — 2026-08-02 (kveld)

Revisjon utført av Claude (Fable 5) ca. kl. 22, som oppfølger til
`~/Documents/Claude/akgolf-hq/lanseringsaudit-2026-08-02.md` (kl. ~19).
Alt under er verifisert mot kode, prod eller GitHub i denne økta — ikke antatt.
10/10 er definert av husets egne målestokker: ferdig-definisjonen per skjerm,
`npm run verify` + `npm test`, CLAUDE.md-invariantene, gotchas-listen og STATUS-NÅ.

## Endret siden auditen kl. 19 (verifisert)

| Funn i auditen | Status nå |
|---|---|
| Modell-id `claude-sonnet-4-5-20250514` ugyldig | **Fikset** — #243 på main |
| Opptak blokkert i prod (headers) | **Fikset** — #242 |
| /team-wang åpen uten innlogging (elevdata) | **Fikset** — #241 |
| Stash med 1 072 linjer på slettet gren | **Reddet** — `redning/gdpr-sveip-28-juli` pushet |
| Løse worktrees / usynkede maskiner | **Ryddet** — kun main + øktens worktree igjen |
| CI på main | **Grønn** på alle dagens 5 pusher (tsc, lint, test, build) |

## Fortsatt åpent (verifisert i denne økta)

- `/turneringer` gir **HTTP 500 i prod akkurat nå** (curl 22:xx). Prod-røyktesten
  (playwright.yml) er rød på **hver** push — og ingen varsles.
- **Anonymisering finnes ikke i main**: verken `anonymiser.ts` (PR #223, DRAFT) eller
  `pseudonym.ts` (rednings-grenen) — 25 AI-kallsteder sender fortsatt klartekst.
- **TEK=10 er fortsatt live**: `src/lib/training/skills/periodization.ts:46–77` har
  `pyramidOverride: { TEK: 10 }` i fire perioder, i bruk fra `period-allocation.ts` og
  `turnering-agent.ts`. `src/lib/training/invariants.ts` har **ingen** TEK-minimumssjekk
  (0 treff på «TEK»). CANON inv_1 (TEK ≥ 15 %) kan altså fortsatt brytes maskinelt.
  (Merk: AI-skillsmappen `src/lib/ai/skills/` er koblet ut av live-agenter etter #225 —
  eneste gjenværende kaller er en testfil. Det er `training/skills` som er problemet nå.)
- **Sentry-påstanden lever**: `src/components/marketing/v2/MarkedPersonvernV2.tsx:276`
  lover «Sentry: feilrapportering» — Sentry er ikke installert
  (`docs/gdpr/rettigheter-status.md:104` flagger det selv).
- **26 åpne PR-er**, inkl. sikkerhetssveipen #223, Oslo-tid-fiksen #176 (lukker en
  dokumentert gotcha), cutover-testene #177 og 7 AI-PR-er fra 27. juli.
- **Dokument-desynk**: STATUS-NÅ sist oppdatert 24. juli (sier betaling 1. august —
  koden sier 1. september). (Skjermplanen med 6 haker er slettet 05.08.2026 — se git-historikken.)
- Død, konkurrerende Caddie (`src/lib/ai/agents/caddie.ts`) ligger fortsatt.

## Tiltaksliste (sortert etter effekt/innsats, maks 10)

| # | Tiltak | Bevis | Målbar effekt («ferdig når») | Innsats |
|---|---|---|---|---|
| 1 | Kjør `scripts/migrate-turnering-planlegger-2026-07-31.ts` mot prod | curl → 500 nå; skriptet urørt siden 31/7 | `/turneringer` svarer 200, playwright.yml grønn på neste push, turnering-cron feiler ikke | **S** |
| 2 | Varsling når prod-røyktesten er rød (Telegram, gjenbruk `varsle-telegram`-mønsteret) | Rød på hver push siden 31/7, null reaksjon | Neste røde kjøring gir melding til Anders samme time | **S** |
| 3 | AI-anonymisering live: merge #223 som base, plukk rest fra `redning/gdpr-sveip-28-juli`, slett taperen | Ingen av filene i main; 25 kallsteder | `grep` viser alle AI-kallsteder via anonymisering; testprompt uten ekte navn | **L** |
| 4 | TEK-invariant: rett `periodization.ts` TEK=10→15 + legg TEK-min-sjekk i `invariants.ts` | `periodization.ts:46–77`; 0 «TEK»-treff i invariants.ts | Enhetstest: PERIOD_SWITCH/plan-generering kan aldri gi TEK < 15 % | **S** |
| 5 | Personvernerklæring: Sentry ut (eller inn), lydopptak av mindreårige inn, fjern løftene koden ikke holder | `MarkedPersonvernV2.tsx:276`; `docs/gdpr/rettigheter-status.md:104` | Erklæringen påstår kun ting koden gjør; lest av juridisk blikk | **M** |
| 6 | Error tracking i prod (Sentry gratis-tier) | Ingen i dag; ErrorLog brukt 9 steder | Første ekte prod-feil synlig med stack trace uten å grave i Vercel-logger | **S** |
| 7 | Vercel-env: sett `NOTION_ENCRYPTION_KEY`, verifiser Upstash-nøkler (ellers fail-closed) | 691 advarsler/døgn i auditen; rate-limit er fail-open | Env-advarsel borte fra runtimeloggene; AI-endepunkter beviselig rate-limitet | **S** |
| 8 | PR-triage: merge/lukk/parker alle 26 eksplisitt — start med #176 (Oslo-gotcha) og #177 (cutover-tester) | 26 åpne, eldste fra 24. juli | ≤ 5 åpne PR-er, hver med bevisst status; gotcha-en om session-move-math strykes | **M** |
| 9 | Klikk-test ★-kjernen (aktivering → innlogging → plan → økt → analyse) mobil+desktop og oppdater hakene + synk STATUS-NÅ/MASTER i samme commit | 30/341 ferdig; begge dokumenter datert 24. juli og motsier koden | ★-kjernen har alle 6 haker; STATUS-NÅ har riktig betalingsdato | **M** |
| 10 | Stripe-herding før 1. september: event-dedup, sideeffekter betinget på `result.count`, WebhookFailure-konsument, verifiser event-abonnement i dashbordet | Auditen §3; #177 ligger umerget | Replayet webhook gir null dobbel-e-post; testbetaling ender som Payment-rad | **L** |

## Hvis du bare gjør ÉN ting

Tiltak 1 + 2 i samme kveldsøkt (under en time totalt): prod-500-en har stått i to dager
fordi ingen fikk beskjed om at røyktesten var rød. Fiksen stopper blødningen, og
varselet sørger for at neste prod-feil aldri får stå i to dager igjen. Alt annet på
listen er verdiløst hvis produksjonen kan være ødelagt uten at noen merker det.

## Bevisst utelatt (parkert, ikke glemt)

Design-gate for hex/tokens (følger Paper-porten, som kjører nå — «etter pilot» sto her
frem til 05.08 og er utgått), baneguide/GPS,
legacy-sidene og `useMobile`-konsolidering, pg_dump-baseline + RLS-gate (strukturelt
viktig — hører til Stripe/GDPR-runden etter pilot), fasade-agentene og død AI-kode.
