# Kvalitetsplan — verdensklasse prosjektoppsett og struktur

> **Opprettet:** 2026-07-24 (Cloud Agent, evidensbasert audit av hele repoet).
> **Mål:** at en senior utvikler hos Anthropic eller Cursor skal vurdere oppsett, struktur og
> kvalitetsgater som verdensklasse — uten å bryte låste beslutninger (stack, design-kanon,
> norsk UI, main-porten).
> **Eier scope:** `plans/skjermplan-master.md` eier produkt-scope. Denne planen eier *teknisk
> kvalitet* — den endrer ingen funksjoner, kun hvordan koden er organisert, sikret og verifisert.
> **Regel:** hver arbeidsstrøm = egen gren + PR gjennom main-porten. `npm run verify` grønn før
> hver commit. Ingen kalendertid — rekkefølgen er avhengighetsstyrt.

---

## 0. Nå-bilde (målt 2026-07-24)

| Måling | Verdi | Vurdering |
|---|---|---|
| TS/TSX-filer i `src/` | 2 130 (≈344 000 linjer) | Stort, men ett produktrepo — OK |
| Enhetstest-filer | 106 (`node:test`) | God kjerne, ujevn dekning |
| E2E-specs (Playwright) | 31 | God kjerne, mangler ★-bredde |
| `src/lib/domain/` testet | 8/10 moduler + `rules/` uklart | Nesten — må bli 10/10 |
| TSX-filer > 600 linjer | **76** (verst: `WorkbenchV2.tsx` 2 088) | Bryter 1k-linje-prinsippet |
| Data-som-kode | `team-gfgk/data.ts` 4 755 linjer, `wang-plan.ts` 1 983, `veileder-artikler.ts` 1 048 | Innhold hører ikke hjemme i `.ts` |
| `as unknown as` | **61** | Bryter invariant 6 der data er forretningskritisk |
| `eslint-disable` | 52 | Mange bevisste (opprydding-TODO), må ned |
| Server-action-filer | 161, ~30 uten eksplisitt rolle-sjekk i fila | **Størst risiko — se KS-1** |
| Legacy-komponenter | `athletic/` 55 filer, `workbench-hybrid/` 5, 35 filer importerer golfdata | Planlagt sanering (Fase 5) ikke utført |
| Parallelle komponent-kanoner | `components/v2` + `portal/v2` (119) + `admin/v2` (104) + `ui/` + golfdata | Én kanon mangler |
| Prisma-skjema | 4 788 linjer, 158 modeller, én fil | Fungerer, men bør organiseres |
| Dokumenter | 159 md i `docs/` + 8 md i rot + 9 i `plans/` | Sprawl — overlappende kilder |
| tsconfig | `strict` ✓, men `target ES2017`, mangler `noUncheckedIndexedAccess` | Kan strammes |
| CI | tsc + eslint + hex-gate + tester + build + e2e ✓ | Mangler coverage, dead-code, dep-audit |
| Observability | error-tracking m/PII-sanering ✓, env-validering ✓, CSP ✓ | Sterkt — best-in-class-nivå alt |

**Det som allerede ER verdensklasse (ikke rør):** env-validering ved oppstart, CSP med nonce +
strict-dynamic, PII-sanert error-tracking, hex-gate + 8pt-lint, `verify`-kjeden, husky-gate,
domenelogikk isolert i `src/lib/domain/`, main-porten med auto-deploy.

---

## 1. Rubrikk — hva «verdensklasse» betyr her

En senior reviewer vurderer typisk på seks akser. Karakter nå → mål:

| Akse | Nå | Mål | Hovedgrep |
|---|---|---|---|
| Sikkerhet (authz-dybde) | B− | A | KS-1: rolle-sjekk i hver server action |
| Typesikkerhet | B | A | KS-2: null farlige casts + strammere tsconfig |
| Modularitet / lesbarhet | C+ | A− | KS-3: splitt giganter, innhold ut av kode |
| Én kanon (ingen legacy-drift) | C | A | KS-4: slett athletic, samle v2 |
| Test og verifikasjon | B | A | KS-5: dekningsgate + ★-e2e |
| Docs / onboarding | B− | A− | KS-7: 159 → ~40 levende dokumenter |

---

## 2. Arbeidsstrømmer (prioritert)

### KS-1 — Sikkerhet: autorisasjon i server actions (P0)

**Funn:** Proxyen (`src/proxy.ts`) beskytter `/portal` og `/admin` mot *uautentisert* tilgang,
men **rolle-sjekken for admin ligger i `src/app/admin/layout.tsx`** — og server actions kjører
IKKE layout. En innlogget spiller kan i verste fall kalle en admin-action direkte hvis actionen
selv ikke sjekker rolle. Heuristisk skann fant ~30 action-filer uten `getCurrentUser`/
`requireAdmin`/`requireCoach` i fila (mange under `admin/(legacy)/`), bl.a.
`admin/tournaments/actions.ts`, `admin/plans/[planId]/actions.ts`, `admin/(legacy)/bookinger/actions.ts`.

**Tiltak:**
1. **Audit alle 161 action-filer.** Klassifiser: (a) sjekker rolle selv, (b) arver sjekk via
   helper den kaller, (c) usikret. Skriv resultatet til `docs/sikkerhet/action-audit.md`.
2. **Innfør to wrappere** i `src/lib/auth/`: `coachAction(fn)` og `spillerAction(fn)` som
   auten- og autoriserer FØR handleren kjører, og returnerer typet feil. Alle actions går
   gjennom én av dem (eller en eksplisitt `publicAction` for f.eks. booking-bekreftelse og lead).
3. **Lint-håndheving:** ESLint-regel (no-restricted-syntax) som blokkerer `"use server"`-filer
   under `src/app/admin/**` og `src/app/portal/**` som ikke importerer en wrapper — samme
   mønster som hex-gaten: umulig å drifte tilbake.
4. Enhetstest per wrapper + én e2e som verifiserer at spiller-rolle får 403 på admin-action.

**Omfang:** rører mange filer, men mekanisk per fil; wrapperne er ~100 linjer. Ingen UI-endring.

### KS-2 — Typesikkerhet: fjern farlige casts + stram tsconfig (P0)

1. **Eliminér de 61 `as unknown as`.** For Prisma-JSON: zod-schema + `parse` (invariant 6).
   For resten: presise typer eller `satisfies`. De få legitime (test-mocks) merkes med
   begrunnet kommentar.
2. **tsconfig-innstramming** (egen commit, kan gi følgefeil som fikses samtidig):
   `target: ES2022` (Node 24/moderne nettlesere), `noUncheckedIndexedAccess: true`,
   `allowJs: false` hvis ingen js-filer gjenstår i `src/`. IKKE `exactOptionalPropertyTypes`
   nå (for invasivt mot Prisma-typer).
3. **Gate:** ESLint `no-restricted-syntax` mot nye `as unknown as` utenfor `*.test.ts`.
4. Reduser de 52 `eslint-disable` — hver som overlever får `-- begrunnelse`-suffiks.

**Omfang:** `noUncheckedIndexedAccess` er den invasive delen (indeks-tilganger over hele
`src/`); gjøres sist i strømmen med grønn `verify` som fasit.

### KS-3 — Modularitet: splitt giganter og få innhold ut av kode (P1)

1. **Toppliste (alle > 1 000 linjer skal under, mål < 600):**
   `WorkbenchV2.tsx` (2 088), `MalByggerV2.tsx` (1 425), `WorkbenchV2Sheets.tsx` (1 388),
   `AdminPlanMalRedigerV2.tsx` (1 245), `admin/plans/[planId]/actions.ts` (1 188),
   `datavis.tsx` (1 115), `oppgave-modal.tsx` (1 031). Splitt etter ansvar (visning /
   tilstand / undersheets), ikke etter linjetall — behold offentlig API så call-sites er urørt.
2. **Data-som-kode ut av `src/`:** `team-gfgk/data.ts` (4 755), `wang-plan.ts` (1 983),
   `veileder-artikler.ts` (1 048) flyttes til `content/` (JSON/MDX) med zod-validering ved
   innlasting — samme mønster som eksisterende `content/`-mappe.
3. **Vaktbikkje:** legg linjetall-sjekk i `scripts/` (à la check-no-hex) som feiler ved NYE
   filer > 800 linjer; eksisterende syndere står på en shrinking allowlist.

**Omfang:** WorkbenchV2-splitten er den mest krevende (mye delt tilstand) — gjøres med
Playwright-smoke på Workbench før/etter som sikkerhetsnett.

### KS-4 — Én komponent-kanon: legacy-sanering (P1)

1. **Slett `src/components/athletic/`** (55 filer) — Fase 5 i eksisterende oppryddingsplan.
   Forutsetter at de 35 filene som importerer `athletic/golfdata` migreres til v2/ui først.
2. **Slett `workbench-hybrid/`** (5 filer) — WorkbenchV2 er kanon.
3. **Samle v2:** `components/v2` (primitiver) beholdes som kanon; `portal/v2` og `admin/v2`
   er produktflater og beholdes, men alt som er *duplisert på tvers* (datavis, sheets, kort)
   flyttes ned til `components/v2` med én eksport. Dokumentér kanonen i
   `docs/design-system/FASIT.md` §komponenter.
4. **Rydd `(legacy)`-rutegrupper:** ruter som har V2-erstatning avvikles (redirect), resten
   merkes med eier + plan i MASTER-SKJERMPLAN.
5. Fjern `no-restricted-imports`-unntakene i `eslint.config.mjs` etter hvert som mappene dør
   — konfigen skal ende UTEN legacy-unntak.

**Omfang:** mekanisk men bredt; golfdata-migreringen (35 filer) er den reelle jobben. MASTER-
haker oppdateres per skjerm som berøres.

### KS-5 — Test: dekning som gate, ikke som håp (P1)

1. **Domene 10/10:** alle moduler i `src/lib/domain/` inkl. `rules/` har testfil med
   grensetilfeller (SG-kalibrering, HCP-avrunding, pyramide-vekter er forretningskritisk).
2. **Coverage i CI:** `c8` rundt `npm test`; start med rapportering (artifact + PR-kommentar),
   deretter ratchet-gate: dekning på `src/lib/domain/` + `src/lib/auth/` må være ≥ 90 %,
   global dekning kan aldri synke mer enn 1 pp fra main.
3. **★-e2e:** hver ★-skjerm i MASTER får minst én smoke-spec (finnes for kjernen etter
   PR #124 — utvid til full ★-liste). Playwright-sharding i CI hvis kjøretid > ~10 min.
4. **Kontrakt-tester for API:** de eksterne flatene (`api/stripe` webhook, `api/cron`,
   `api/mcp`, `api/push`) får request/response-tester med zod-skjemaene som fasit.

### KS-6 — CI/CD og verktøygate (P2)

1. **knip** i CI: død kode, ubrukte eksporter og ubrukte avhengigheter (49 deps + 22 devDeps
   har garantert svinn). Første kjøring genererer baseline; gate mot NYE funn.
2. **Dependabot/Renovate** (kun sikkerhetsoppdateringer auto-PR; versjonshopp er låst av
   beslutningsreglene og krever Anders).
3. **`npm audit --omit=dev`** som eget CI-steg (fail på high/critical).
4. **CI-hygiene:** `concurrency: cancel-in-progress` per PR, cache av Playwright-browsere,
   `--max-warnings=0` på eslint i CI (i dag slipper warnings gjennom med `--quiet` lokalt).
5. **Branch protection på main** i GitHub: krev grønn CI + 0 review-krav (Anders er porten,
   men CI skal være teknisk umulig å omgå).
6. **CODEOWNERS** (én linje: alt → Anders/agent-flyt) + PR-mal med verify-sjekkliste.

### KS-7 — Dokumentkonsolidering (P2)

1. **Mål: 159 → ~40 levende dokumenter.** Alt som er historikk flyttes til `docs/arkiv/` med
   én indeks. Levende kilder er allerede definert i STATUS-NÅ-tabellen — alt som ikke står
   der er kandidat for arkiv.
2. **Rot-md ned til 5:** `README`, `AGENTS`, `CLAUDE`, `SECURITY`, `START-HER`.
   `LAUNCH-CHECKLIST`, `SYNC`, `WORKLOG` arkiveres/flettes (LAUNCH-CHECKLIST overlapper
   `docs/LANSERING-P0-ANDERS.md` og `go-live-sjekkliste.md` — behold ÉN).
3. **`plans/` ryddes:** fullførte planer (feilfiks 07-11, redesign-plan m.fl.) arkiveres;
   `skjermplan-master.md` + denne + aktive bølgeplaner blir igjen.
4. **README skrives for en ny senior-utvikler:** arkitekturdiagram, produktkart, «kjør lokalt
   på 5 min», lenker til FASIT/BUSINESS-RULES/MASTER. Dette er det første en Anthropic/Cursor-
   reviewer åpner.

### KS-8 — Skjema og drift (P3)

1. **Prisma-skjema:** behold én fil (Prisma 7-standard), men organiser de 158 modellene i
   kommenterte seksjoner per domene med innholdsfortegnelse øverst; vurder `prismaSchemaFolder`
   når den er stabil i Prisma 7.
2. **Helsesjekk:** `api/health` finnes — utvid med DB-ping + siste cron-kjøring, og koble
   ekstern uptime-varsling (Vercel/BetterStack) til Slack-webhooken som error-tracking alt bruker.
3. **47 TODO/FIXME:** triage — hver får issue-referanse eller slettes.

---

## 3. Rekkefølge og gater

```
KS-1 sikkerhet ─┐
KS-2 typer ─────┼─► KS-3 splitt ─► KS-4 legacy ─► KS-5 test-bredde
KS-6 CI-gater ──┘                                 KS-7 docs (når som helst)
                                                  KS-8 drift (sist)
```

- **KS-1 og KS-2 først** — de reduserer risiko for alt etterfølgende arbeid, og KS-6-gatene
  (lint-regler) settes samtidig så nye brudd er umulige mens resten pågår.
- **KS-3 før KS-4:** splitting av WorkbenchV2 m.fl. gjør golfdata-migreringen mindre farlig.
- Hver strøm: egen gren `cursor/ks<N>-…`, PR mot main med klarspråk-beskrivelse, Vercel-preview,
  Anders' «ja» før merge. Ingen strøm blander seg med funksjonsarbeid i samme PR.
- **Definisjonen av ferdig per strøm:** `npm run verify` grønn + de nye gatene (lint/coverage/
  knip) grønne + nå-bilde-tabellen i §0 oppdatert med ny måling.

## 4. Ikke i scope (låst av beslutninger)

- Ingen versjonshopp på stacken (Next 16 / React 19 / Prisma 7 / Tailwind v4 er låst).
- Ingen monorepo-splitting eller mappe-omkalfatring av `src/app/` — produktinndelingen i
  `arkitektur.md` står.
- Ingen bytte av testrammeverk (node:test + Playwright er valgt; vitest/jest innføres ikke).
- Ingen design-endringer — FASIT + designtokens er urørt.

## 5. Suksesskriterier (målbart)

| Måling | Nå | Ferdig |
|---|---|---|
| Actions uten rolle-sjekk | ~30 | 0 (lint-håndhevet) |
| `as unknown as` utenfor tester | 61 | 0 (lint-håndhevet) |
| TSX-filer > 1 000 linjer | 10+ | 0 |
| Filer > 800 linjer (allowlist) | 76 > 600 | krympende, ingen nye |
| Legacy `athletic/` + `workbench-hybrid/` | 60 filer | slettet |
| Domene-moduler med tester | 8/10 | 10/10 + rules/ |
| Coverage-gate i CI | nei | ja (ratchet) |
| Død kode-gate (knip) | nei | ja |
| Levende docs | 159 | ~40 + arkivindeks |
