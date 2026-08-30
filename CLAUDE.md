# CLAUDE.md — AK Golf HQ

B2B SaaS (AgencyOS) + forbruker-app (PlayerHQ). Forretningslogikk og UI-tekst: **norsk bokmål**.

Ved konflikt: `docs/ak-master.md` > denne filen — **unntatt design**: for alt design/look vinner Train-lock-beslutningen (25.08.2026, se invariant 2) + `docs/natt/` over ALLE eldre dokumenter, inkludert ak-master og all Paper-porttekst.

---

## Start her (les i denne rekkefølgen)

1. **`docs/MASTERPLAN-GJENSTAAENDE.md`** — DEN gjeldende, eneste plandokumentet: alt gjenstående arbeid, session-tabeller, status, beslutningskø.
2. **`docs/STATUS-NÅ.md`** — levert / ikke levert (løpende snapshot).
3. **`src/lib/domain/workbench/` + `src/lib/workbench/wb-actions.ts`** — koden er fasit for domain/actions. `docs/natt/workbench/` er kontrakt/arkiv (ACCESS-AND-GROUPS.md gjelder fortsatt for tilgang).
4. **`docs/platform/AGENT-BRIEF.md`** — stack, versjoner, mappestruktur.
5. **`docs/platform/BUSINESS-RULES.md`** — abonnement, GDPR, booking (ikke utledbart fra kode).
6. **`.claude/rules/gotchas.md`** — les FØR koding.

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

**Én Claude-session per loop.** Ny chat. Commit + leveranserapport for loopen. Ikke start neste loop uten grønn forrige.

Gren for kode: `claude/agency-workbench-uke-ui-c4d2a4`-linjen (Loop 1+2+3S); Loop 2S ligger på PR #577, RLS på `claude/workbench-rls-policies-8b054b` — samles i release-gren per session-tabellen i `docs/MASTERPLAN-GJENSTAAENDE.md` (session B2, tidligere `natt/LAUNCH-PLAN-FULL-2026-08-25.md`, slettet 30.08 i doc-konsolideringen). PR #575 er superseded.

Bølge 2 (måned/år, stall, kalender uten Google, tester-live, runde-live, Jarvis, AgenticOS, lys, Forelder, DataGolf/økonomi): se `docs/MASTERPLAN-GJENSTAAENDE.md` — **kun etter** bølge 1-smoke.

---

## Harde invarianter

1. **Ingen treningsregler** (2026-08-18). Vokabular (pyramide, formel, perioder) er merkelapper. Gjeninnfør aldri metodikk-sperrer uten Anders' beslutning.
2. **Design — Train-lock er fasit for ALLE skjermer i PlayerHQ OG AgencyOS (Anders 25.08.2026).**
   - **Fasiten ligger i repoet: `designsystem/train-lock/`** (196 skjermfiler, sist synket
     26.08 fra zip (6) — les `DESIGN-SYSTEM.md` der først (look-fasit), finn skjermen i
     `SCREEN-INDEX.md`, og bruk `HANDOFF.md` som IA-/beslutningshistorikk. Ved konflikt:
     HANDOFF vinner på struktur, DESIGN-SYSTEM på visuelle verdier. Porting til kode styres
     av `PORTING.md` samme sted). Scene `#000000` (lys-varianter `#FFFFFF`).
   - **AgencyOS:** Train-lock — alle skjermer. Eksisterende Paper-porterte admin-flater er
     dermed *avvik som skal portes*, ikke fasit. Paper (`designsystem/paper/`) er
     historikk/arkiv, aldri bygg-fasit.
   - **Tokens finnes i kode (D2 løst 25.08, PR #586):** `src/styles/train-lock-tokens.css`
     (`--tl-*`) med TS-speil `src/lib/v2/train-lock.ts` (`TL`, `TL_BREKK`). Bruk dem —
     bland aldri `T.*` (Paper, utgående) og `TL.*` i samme skjerm. Tokenene ligger lys på
     `:root` og mørk på `html[data-v2-tema="dark"]` (samme mekanisme som Paper, ingen ny).
     **Mørk er default på `/portal` og `/admin`** (Anders 25.08.2026) — regelen bor i
     `src/lib/v2/tema-default.ts`, kalt av både rot-layout og `V2Shell`; bryteren
     (`ak-v2-tema`) vinner over defaulten. `/auth` er fortsatt lys (låst PP-A/A4).
     **`/forelder` skal ha BÅDE lys og mørk modus, som resten av produktet (Anders
     26.08.2026)** — forelder-omfangsspørsmålet (T4) er dermed løst: hele forelder-appen
     porter til Train-lock med toggle, ikke bare ett kort. Default (lys/mørk uten cookie)
     er ikke endret av denne beslutningen — kun at begge moduser MÅ virke. Selve
     skjermporten gjenstår (B8 = Player, bølge T = AgencyOS, forelder-porten ubestemt
     session ennå). Marketing/landingssider har egen fasit (ak-golf-website) og omfattes ikke —
     **UNNTAK (Anders 28.08.2026): hele booking-flyten, også `/booking` på marketing, er
     Train-lock (lys variant).** PR #650 porter den; ny booking-kode leser aldri `T`/`--p-*`-verdier
     direkte (broen i `booking-paper.css` peker dem til `--tl-*`).
   - Ingen nye tokens / parallelle designsystemer uten Anders' ja.
   - Fullført = warm `#B85C3D` + hake. `#30D158` **kun** Godta / PUBLISERT-merke.
   - **DO NOT USE — Paper og Presis.** Ny skjermkode = `--tl-*` / `TL`. Ikke `T.*`, ikke `--p-*`, ikke cream `#FAF9F5`/`#F0EEE6`, ikke clay som generell CTA, ikke Inter/Familjen/JetBrains, ikke Presis-skog/lime. Ikke few-shot fra `designsystem/paper/` (arkiv, se `DEPRECATED.md` der). Marketing eier sin egen Paper-katalog; den kopieres ikke inn i PlayerHQ/AgencyOS. Skills `akgolf-claude-paper` og Paper-kroppen i `ak-designekspert` er historikk.
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

- **Alle skjermer:** Train-lock (`designsystem/train-lock/`) — se invariant 2. `designsystem/paper/`
  er arkiv, aldri bygg-fasit og aldri few-shot for nye porter. Token-port (#631) er ikke
  piksel-1:1; visuell fasit er `.dc.html` i Train-lock, ikke Paper-HTML.
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

---

## Train-lock designfasit

Fasiten bor i **`designsystem/train-lock/`** (196 skjermfiler, sist synket 26.08.2026 fra
«Player HQ Train lock (6).zip» — sync-detaljer i `SYNC-STATUS.md` der).

**Leserekkefølge for enhver design-/port-økt:**
1. `designsystem/train-lock/DESIGN-SYSTEM.md` — look-fasiten: tokens (mørk/lys), geometri,
   type, motion, komponent- og knappe-matrise, forbud, copy- og personvernregler.
2. `designsystem/train-lock/SCREEN-INDEX.md` — alle filene med rammeantall, breakpoints og
   `data-screen-label`. Finn skjermen her, åpne nærmeste eksisterende fil som mal.
3. `designsystem/train-lock/HANDOFF.md` — IA- og beslutningshistorikk. Ved konflikt:
   HANDOFF vinner på struktur, DESIGN-SYSTEM på visuelle verdier.
4. Skal skjermer porteres til kode: `designsystem/train-lock/PORTING.md` (tokenlag først,
   primitives før skjermer, visuell diff-rigg, stopp-regler).

**Faste regler arvet fra fasit-prosjektet:** norsk bokmål («økt», ikke «session») · alle
stiler inline i fasit-filene · ASCII i nye fasit-filnavn (`Okt`, ikke `Økt`) · én hvit
primær CTA per ramme · `tabular-nums` på alle tall · endres en fasit-fil skal raden i
`SCREEN-INDEX.md` og en linje i `HANDOFF.md` oppdateres · store revisjoner får ny fil med
suffiks (`… v2.dc.html`), aldri overskriving av originalen.
