# CLAUDE.md — AK Golf HQ

B2B SaaS (AgencyOS) + forbruker-app (PlayerHQ). Forretningslogikk og UI-tekst: **norsk bokmål**.

Ved konflikt: `docs/ak-master.md` > denne filen. Ved konflikt om *Player* I dag / økt / TrackMan / Workbench-uke: **`docs/natt/`** > eldre Paper-porttekst.

---

## Start her (les i denne rekkefølgen)

1. **`docs/natt/README.md`** — nattkjøring A1–A4 + bølge 2. **Gjeldende lanseringsspor.**
2. **`docs/natt/LOOP-1-PROMPT.md`** — lim inn i *ny* Claude-session for domain + actions.
3. **`docs/natt/workbench/`** — domain, operations, tester, ACCESS, Player HQ-integrasjon.
4. **`docs/STATUS-NÅ.md`** — levert / ikke levert.
5. **`docs/platform/AGENT-BRIEF.md`** — stack, versjoner, mappestruktur.
6. **`docs/platform/BUSINESS-RULES.md`** — abonnement, GDPR, booking (ikke utledbart fra kode).
7. **`.claude/rules/gotchas.md`** — les FØR koding.

Ikke les hele repoet. Åpne filer etter behov. Lange kommandoer → redirect til fil, tail/grep.

---

## Nåværende spor: A1–A4 (bølge 1)

**Mål-smoke (må være grønn før bølge 2):**

```
Coach: opprett økt → UTKAST → flytt → Publiser
Spiller: ser økten i «I dag», ser ikke DRAFT
Spiller: Start → IN_PROGRESS → Ferdig (warm hake)
TrackMan-detalj: 1σ-ellipse + én caddie-setning + prikk → slag-ark
```

| Loop | Jobb | Anti-scope |
|------|------|------------|
| 1 | Domain + server actions (ingen UI) | UI, drag-lib, kilder-innhold |
| 2 | Agency uke + create/move/publish | måned/år, stall, Google |
| 2S | Inspector + drill komplett/MANGLER | serie, Player-ark |
| 2T | Kilder, drag, serie | Google, Player live |
| 3 | I dag ← `loadPlayerDay` | composer/dock |
| 3S | Økt-ark + start/complete | live *runde* RU |
| 3T | Godta/Avvis + ikke delta | full GROUP-materialisering |
| 4 | DispersionMap | ingest, DataGolf, stall-preview |

**Én Claude-session per loop.** Ny chat. Commit + `docs/natt/LOOP-N-DONE.md`. Ikke start neste loop uten grønn forrige.

Gren for kode: `claude/natt-a1-a4-2026-08-24` (fra `main`). Plan-docs: `docs/natt-plan-2026-08-25` / PR #575.

Bølge 2 (måned/år, stall, kalender uten Google, tester-live, runde-live, Jarvis, AgenticOS, lys, Forelder, DataGolf/økonomi): `docs/natt/OVERNIGHT-CODING-LOOP-BOLGE2.md` — **kun etter** bølge 1-smoke.

---

## Harde invarianter

1. **Ingen treningsregler** (2026-08-18). Vokabular (pyramide, formel, perioder) er merkelapper. Gjeninnfør aldri metodikk-sperrer uten Anders' beslutning.
2. **Design**
   - **Player HQ:** Train-lock (scene `#000000`). Fasit: design-zip / WB-/PH-/TM-skjermer.
   - **Agency desktop:** Paper-tokens OK der allerede portet; *nye* Workbench-flater følger Train-lock/WB.
   - Ingen nye tokens / parallelle designsystemer uten Anders' ja.
   - Fullført = warm `#B85C3D` + hake. `#30D158` **kun** Godta / PUBLISERT-merke.
3. **DRAFT er usynlig for spiller.** `loadPlayerDay` returnerer kun PUBLISHED | IN_PROGRESS | COMPLETED.
4. **Norsk bokmål** i all UI-tekst. **Lucide** — aldri emoji i UI.
5. **Domenelogikk** i `src/domain/workbench/` (økt) og `src/lib/domain/` (øvrig) — ikke i komponenter.
6. **`as unknown as T` forbudt** for forretningsdata — bruk zod (`src/lib/validation/`).
7. **`main` er porten.** Branch + PR. **Aldri push til main uten eksplisitt «ja» fra Anders.** Unntak: dokument/regelendringer Anders ba om i samtalen.
8. **Enkelhet:** alle funksjoner, minst mulig trykk. Vanskelig å forstå = feil design.

---

## Workbench / økt (kontrakt)

Kilde: `docs/natt/workbench/`.

- Typer + pure ops: `types.ts`, `operations.ts`, `operations.test.ts`
- Labels: `ui/labels.ts` (hardkod aldri norske strenger i domain)
- Actions-kontrakt: `store/actions.ts`
- Tilgang: `ACCESS-AND-GROUPS.md` (gruppe-lisens **eller** kjøpt entitlement — ellers usynlig i Agency)
- Player: `integration/player-hq.md`

**Statusmaskin:** `DRAFT → PUBLISHED → IN_PROGRESS → COMPLETED` (unpublish/skip/cancel egne grener).

**Må implementeres i Loop 1:** create, move, publish/unpublish, add/reorder/remove drill, delete, start, complete, skip, loadWeek, loadSession, loadSources (tom OK), loadPlayerDay.

Serie, full GROUP-propagasjon til N medlemmer, Google-synk: **ikke** bølge 1.

---

## Feilhåndtering

**Prinsipper**

1. **Feil er tilstander, ikke alerts alene.** Hver flate har Suksess / Tom / Laster / Feil. Feil-state: kort norsk tekst + «Prøv igjen» (ikke stack trace, ikke engelsk).
2. **Domain kaster / returnerer — UI oversetter.** Pure ops (`src/domain/…`) kaster typed feil eller returnerer `Result`. Komponenter mapper til copy fra `labels.ts` / fast norsk streng.
3. **Server actions:** valider input med **zod** ved grensen. Catch ukjente feil; logg *ID + kode*, aldri personnavn/PII. Returner `{ ok: false, error: string }` (eller eksisterende action-result-type i repoet) — ikke la Next.js generiske error-page være eneste svar på forventede feil.
4. **Toast (sonner):** kort bekreftelse på write (publisert, lagret). Ved feil: én setning + evt. retry. Ikke toast-spam på hver keystroke.
5. **Auth / tilgang:** mangler entitlement → usynlig eller tom med nøktern copy («Ingen tilgang»), ikke 500. IDOR: sjekk eierskap i action før write.
6. **Offline / nett:** Player «I dag» og live-flater tåler feilet fetch med Feil-kort, ikke blank skjerm.
7. **Workbench-spesifikt:** publish med VEGG (f.eks. hard overlap hvis dere innfører det) → sperr + forklaring i inspector. VARSEL → tillat publish, vis advarsel. `loadPlayerDay`-feil → PH-01e feil-tilstand, ikke coach-DRAFT lekket som fallback.
8. **Aldri** `catch (e) {}` tom. Aldri vis rå `e.message` fra Prisma/Supabase til sluttbruker.

**Agent-økt:** feil som kostet ekstra tid → én linje i `docs/feillogg.md`. Stopp-regel i natt-loop: skriv `LOOP-N-DONE.md` med hva som feilet, ikke «fix» i det stille.

---

## Stack (kort)

Next.js 16.2 + React 19 + TS strict · Prisma 7 + Supabase · Tailwind v4 · Poppins / Lora / IBM Plex Mono · Lucide · zod 4 · node:test (`tsx --test`) · Playwright · Serwist PWA · Stripe / Resend / AI SDK.

**Ikke** vitest. **Ikke** Inter Tight. Region Vercel: `lhr1` (match Supabase eu-west-2).

Detaljer: `docs/platform/AGENT-BRIEF.md`.

---

## Arbeidsregler

1. Små fikser (typo, lint, åpenbar bug): bare gjør.
2. Spør Anders før: nye deps, DB-migrasjon, slettede URLer, ny feature, stor refaktor.
3. **`npm run verify` før commit** (hele pipeline — ikke improvisér stegene).
4. Git: `feature/…` eller natt-gren → commit → push → PR → spør om merge. Squash-merge: `git branch --merged` lyver; bruk `gh pr list`.
5. Følg `.claude/rules/gotchas.md` (Prisma 7 adapter, `proxy.ts`, Oslo-tid, secrets).
6. Lange kommandoer: redirect til fil. Grep store docs — ikke les hele.
7. Feil som kostet tid: én linje i `docs/feillogg.md` (ellers ikke rør).

---

## Verifikasjon

```bash
npm run verify && npm test
```

Domain (etter Loop 1):

```bash
npx tsx --test src/domain/workbench/operations.test.ts
npx tsc --noEmit
```

CI = verify + test. Deploy: Vercel git på `main` / PR-preview. **Aldri** `vercel deploy --prod` manuelt.

---

## Design / skjerm (kort)

- **A1–A4 / økt / I dag / TM:** Train-lock + `docs/natt/` + design-zip-skjermene listet i overnight-planen.
- **Øvrig Agency-port:** Paper-speil `designsystem/paper/` + `docs/port/PORTPLAN.md` når det sporet kjøres — ikke bland inn i natt-smoke.
- Skjerm-PR: Anders må ha *sett* skjermen (mobil først). Ikke merge på «ser bra ut i koden».
- Port HTML 1:1: **nei**. Port oppførsel, hierarki, copy. Gjenbruk Button / Modal / TimeGrid / SessionCard / artefakt-panel.

---

## Agenter og secrets

- Agenter foreslår; **menneske merger**. Ingen agent skriver rett til prod-data for ekte juniorer — fixture / egen testspiller.
- Secrets kun `.env.local` + Vercel. **Aldri** commit. Hook `beskytt.mjs` blokkerer `.env*`.

---

## Ikke i scope (før smoke er grønn)

Google two-way · måned/år/stall som *første* jobb · hele TN-batteriet · FY/GP/BO/S3/Club · GROUP-materialisering til alle medlemmer · nye design-tokens · greenfield «AKGolf2.0».

Rydd eksisterende Golf_Headquarters (v1) — ikke start nytt repo.
