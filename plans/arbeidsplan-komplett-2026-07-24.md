# Komplett arbeidsplan — AK Golf HQ (2026-07-24)

> **Hva dette er:** ÉN samlet arbeidsplan for alt som er gjennomgått og levert 24. juli:
> lansering (PR #124), teknisk kvalitetsplan (PR #126), design-audit (PR #126) og
> designsystem-passet (PR #127) — med rekkefølge, porter, ansvar og definisjon av ferdig.
> **Styring:** `plans/skjermplan-master.md` eier produkt-scope; denne planen eier
> *rekkefølgen på arbeidet* herfra. Ingen kalendertid — rekkefølgen er avhengighetsstyrt.
> **Anders styrer med tre ord:** «ja» (merge en PR), «GO V1» / «GO V6» (design-bølge),
> «GO KS-n» (kvalitetsstrøm).

---

## 0. Status akkurat nå (alt grønt, venter på port)

| PR | Innhold | CI | Venter på |
|---|---|---|---|
| [#124](https://github.com/akgolfsoftware/Golf_Headquarters/pull/124) | Lansering: aktivering, push-opt-in, smoke, live offline + write-back, nivå-quiz, treningsanalyse, kalender-drills | ✓ | Anders' «ja» |
| [#126](https://github.com/akgolfsoftware/Golf_Headquarters/pull/126) | Kvalitetsplan (KS-1–KS-9) + design-audit (D1–D10) + denne arbeidsplanen — kun dokumenter | ✓ | Anders' «ja» |
| [#127](https://github.com/akgolfsoftware/Golf_Headquarters/pull/127) | Designsystem-pass: motion-katalog, én token-kilde, BunnArk-kontrakt, AA-kontrast, ordbok, WCAG-zoom | ✓ | Anders' «ja» |

**Levert i kode i dag (i PR-ene over):** hele ferdigstillingsplanen Fase A+B, konfliktløsning
mot main (KalenderOS), designsystem-forbedringene D1/D2(kjerne)/D4(BunnArk)/D5/D6(dok)/D8(delvis).

**Merge-rekkefølge (anbefalt):** #124 → #127 → #126. (#126 er kun docs og kan gå når som
helst; #124 og #127 er uavhengige av hverandre i kode.)

---

## Fase 1 — LANSERING (ekte spillere inn)

> Mål: registrerte spillere logger inn og bruker appen. Betaling starter automatisk 1. august.

| # | Oppgave | Hvem | Avhenger av |
|---|---|---|---|
| 1.1 | «ja» til PR #124 (+ #127, #126) | **Anders** | — |
| 1.2 | DKIM for `send.akgolf.no` (CNAME → Verify → test-epost) | **Anders** (panel) | — |
| 1.3 | `akgolf.no` → Vercel + `NEXT_PUBLIC_APP_URL` sjekk | **Anders** (panel) | — |
| 1.4 | Live Stripe-nøkler + webhook verifisert i Vercel prod | **Anders** (panel) | — |
| 1.5 | Google Calendar re-koblet for begge coacher | **Anders** (panel) | — |
| 1.6 | **KS-1 Sikkerhet:** audit 161 action-filer, `coachAction`/`spillerAction`-vakter, lint-gate, 403-e2e | Agent («GO KS-1») | 1.1 (#124 i main) |
| 1.7 | Aktiverings-e-post: `--dry-run` → skarp kjøring | **Anders** (terminal/agent) | 1.2 + 1.6 |
| 1.8 | Verifiser `lastLoginAt` settes + push-abonnementer > 0 | Agent | 1.7 |
| 1.9 | 1. august: bekreft `gratisForAlle()` er av + røyk-test Checkout | Anders + agent | dato |

**Hard regel:** aktiverings-e-posten (1.7) sendes IKKE før KS-1 (1.6) er i main — det er
eneste reelle sikkerhetsrisiko med ekte innloggede spillere. Full panel-detalj:
`docs/LANSERING-P0-ANDERS.md`.

---

## Fase 2 — KVALITET (KS-strømmene, etter lansering)

> Kilde: `plans/kvalitetsplan-verdensklasse.md`. Én strøm = én gren + PR gjennom porten.
> KS-1 er flyttet til Fase 1 (lanseringskritisk). KS-9 design er delvis levert i PR #127.

| Rekkefølge | Strøm | Kjerne | Status |
|---|---|---|---|
| 1 | **KS-2 Typesikkerhet** | 61 `as unknown as` → zod/presise typer; tsconfig-innstramming; lint-forbud mot nye | Klar |
| 2 | **KS-6 CI-gater** | knip (død kode), `npm audit`, coverage-rapport, concurrency, branch protection | Klar (settes tidlig så gatene vokter resten) |
| 3 | **KS-3 Filsplitting** | Alle > 1 000 linjer under 600 (WorkbenchV2 2 088 først); data-som-kode → `content/`; linjetall-vaktbikkje | Klar |
| 4 | **KS-4 Legacy-sanering** | 35 golfdata-importer → v2; slett `athletic/` (55 filer) + `workbench-hybrid/`; rydd `(legacy)`-ruter; fjern ESLint-unntak | Etter KS-3 |
| 5 | **KS-5 Test-bredde** | Domene 10/10 + `rules/`; coverage-ratchet i CI; ★-e2e full liste; kontrakt-tester (stripe/cron/mcp/push) | Etter KS-2 |
| 6 | **KS-7 Docs-konsolidering** | 159 → ~40 levende docs; rot-md ned til 5; `plans/`-arkivering; README for ny utvikler | Når som helst |
| 7 | **KS-8 Drift** | Prisma-skjema seksjonert; helsesjekk + uptime-varsling; TODO-triage | Sist |

---

## Fase 3 — DESIGN-BØLGER (skjerm-arbeid, krever GO)

> Kilde: `docs/design-system/DESIGN-KVALITETSAUDIT-2026-07-24.md` (funn) +
> `docs/design-system/DESIGN-EVOLUSJON-2026-07-23.md` (bølge-definisjonene).
> Systemet under er levert (PR #127) — dette er anvendelsen skjerm for skjerm.

| GO | Innhold | Design-funn som lukkes |
|---|---|---|
| **«GO V1»** | Dommer-finpuss Hjem/Plan/Analyse: 5-sek-test, HjelpTips på alle tall/fagord (dekning 35 % → 100 % på ★), resterende ordbok-pass, tomme tilstander | D2 (rest) + D3 |
| **«GO V2»** | Live + runde: tommel-soner, hurtigmodus på bane, oppsummering med én neste handling | — |
| **«GO V3»** | Coach-dag: cockpit «NÅ», stall-sortering, batch-godkjenning, Workbench iPad-DnD | — |
| **«GO V4»** | Booking + betaling: Stripe-nivå tillit, tydelige tilstander | — |
| **«GO V5»** | Marketing + offentlig stats (egen merkevare-bølge, ~90 skjermer) | — |
| **«GO V6»** | Craft-system: SerieMeny → BunnArk-kontrakten, axe-smoke i CI, kontrast-vakt, evt. navigasjonsovergang (View Transitions) | D4 (rest) + D8 (rest) + D10 |
| Beslutning | Wireframe-synk: eksport av endrede Claude Design-kits per bølge (a) eller ekstern fasit vedtatt (b) | D7 |

**Verktøy per skjerm:** 9-punkts skjerm-test-protokollen i auditens §4 + MASTER-hakene
oppdateres i samme commit (låst regel).

---

## Fase 4 — SENERE / PARKERT (bevisste venter)

- **A4 Fase 2:** anbefalingsmotor for periode-fordeling — venter på gjennomføringsdata.
- **Bølge 7 AI Coach:** først når loopen produserer data (etter lansering + V1/V2).
- **Elite Fase 2 / talent-dispersion:** bevisst utsatt.
- **D8 banekart-geometri:** blokkert på datakilde.
- **B5 dypere 6-akse-analyse:** etter at treningsanalysen har ekte bruk.

---

## Styring og definisjon av ferdig

1. **Porten:** ALT går via PR mot main; merge kun på Anders' «ja». PR-lista er portoversikten.
2. **Ferdig per leveranse:** `npm run verify` grønn + CI grønn + relevante MASTER-haker
   oppdatert + status-dokument oppdatert (STATUS-NÅ ved milepæler).
3. **Suksessmålene** står i kvalitetsplanens §5 (teknisk) og auditens §5 (design) —
   nå-bilde-tabellene oppdateres med ny måling når en strøm avsluttes.
4. **Neste konkrete handling:** Anders sier «ja» til #124/#126/#127 og starter DKIM (1.2);
   agent starter KS-1 (1.6) umiddelbart etter #124-merge.
