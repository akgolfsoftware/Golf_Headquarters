# AK Golf HQ — komplett plan (kode + publisering)

**Dato:** 25.08.2026 05:10 CEST  
**Beslutning:** **Rydd og bygg videre i `Golf_Headquarters`. Start ikke nytt.**  
**Repo:** `akgolfsoftware/Golf_Headquarters`  
**Prod i dag:** [akgolf-hq.vercel.app](https://akgolf-hq.vercel.app) via Vercel git-integrasjon  
**DB:** samme Supabase-prosjekt (`.env.local` på Mac Mini)  
**Look:** Train-lock. Scene `#000000`. Paper er historikk, ikke ny fasit.

`AKGolf2.0` er et **dokumentskrivebord** (ingen app, auth/DB bevisst utenfor). `Golf_Headquarters-v1-archive` er fryst speil. Ingen av dem er stedet du koder.

---

## 1. Rydd eksisterende, eller start helt nytt?

### Svaret: rydd v1. Ikke greenfield.

Du har allerede det som tar måneder å bygge om:

| Allerede i v1 | Hva det koster å lage på nytt |
|---------------|-------------------------------|
| Next 16 + Prisma 7 + Supabase Auth | Uker |
| ~1 390 tester, grønn `main` | Uker |
| 38 spillere / 42 brukere i prod | Migrasjon + GDPR-risiko |
| Stripe v2, booking, GolfBox/GJGT/DataGolf-sync | Uker |
| `/portal` PlayerHQ + `/admin` AgencyOS | Hele skallet |
| Vercel-prosjekt + env + preview-PR | Ny tilkobling, DNS, webhook-rot |

Greenfield (`AKGolf2.0`) ble fryst 21.08 fordi v1 føltes rotete. Siden da har **design** blitt låst (Train-lock 24.08) og **Workbench-domain** blitt testet. Rotet er UI-lag + konkurrerende planer — ikke at motorene mangler.

**Hva «rydde» betyr (gjør dette, ikke rewrite):**

1. Én sannhet for look: Train-lock. Claude Paper-zip brukes ikke som bygg-fasit.
2. Én sannhet for plan: denne filen + `OVERNIGHT-CODING-LOOP.md`. Ikke bygg mot `docs/port/PORTPLAN.md` Paper-rader eller `AKGolf2.0/docs/06-komplett-produktplan.md` (Club OS i H1 er **utsatt**).
3. Behold Prisma-tabeller. Utvid minimalt (Workbench-status, drills, `hiddenByPlayer`). Ikke 158 nye tabeller.
4. Bytt UI på eksisterende ruter (`/portal` I dag, `/admin` uke) i stedet for nye apper.
5. Slett/arkiver ikke-kjørende designsystem-mapper etter at Train-lock er i `globals` — **etter** A1–A4, ikke før.
6. Merge eller lukk åpne draft-PR-er som kjemper med Train-lock (#514 SG-app, Paper-port-PRs). `#490` WANG PII er unntak — den haster uavhengig av look.

**Når greenfield likevel er riktig:** aldri for lansering. Evt. om 12–18 mnd når v1 er i daglig bruk og du selger white-label. Ikke nå.

---

## 2. Hva produktet er (låst)

Én Next-app, tre synlige produkter nå:

| Produkt | Rute | Jobb |
|---------|------|------|
| Player HQ | `/portal` | I dag → økt → analyse |
| Agency OS | `/admin` | Stall, workbench, innsikt |
| Marketing + booking | `/` og `/booking` | Allerede i prod — ikke redesign i denne planen |

**Utsatt:** Club OS, Stats-app, Foreldre-app utover FO-01 les, Google two-way, white-label.

**Todelt tilgang (hard):** gruppe-spiller = lisens. Self-serve uten kjøpt coach-produkt = usynlig for Agency. Se `workbench/ACCESS-AND-GROUPS.md`.

**Økt er atomet.** DRAFT usynlig for spiller.

---

## 3. Kodeplan — tre horisonter

Kjør i Claude Code på Mac Mini, **ny chat per loop**, gren fra `main`.

Gren-mønster: `claude/natt-a1-a4-2026-08-24` for bølge 1, deretter `claude/bolge2-…`.

### Horisont A — lanseringskjerne (må virke før du kaller det lansert)

Smoke som stenger A:

```
Coach: ny økt → UTKAST → flytt → Publiser
Spiller: ser den i «I dag», ser ikke annen DRAFT
Spiller: Start økt → IN_PROGRESS → Ferdig (warm hake)
TrackMan-detalj: 1σ-ellipse + én caddie-setning + prikk → slag-ark
```

| Loop | Jobb | Fasit |
|------|------|--------|
| 1 | Domain + actions (hele økt-kontrakten) | FERDIG — koden i `src/lib/domain/workbench/` + `src/lib/workbench/wb-actions.ts` er fasit (spec arkivert i `workbench/arkiv/`) |
| 2 | Agency uke + create/move/publish UI | WB-01/02/03, A-01d, A-18, A-03 |
| 2S | Inspector + drill komplett/MANGLER | A-02, A-03b/c, MAT-01 |
| 2T | Kilder, drag, serie | A-04, A-07, A-11, A-02c, WB-07 |
| 3 | Player I dag ← `loadPlayerDay` | PH-01e, PH-02, PH-03 |
| 3S | Økt-ark + live start/complete | PH-04/05/06, A-14 |
| 3T | Godta/Avvis + ikke delta | A-09, WB-04, WB-10 |
| 4 | DispersionMap | TM-07/08/08f/10/11 |

Detaljer og lim-inn-prompter: `OVERNIGHT-CODING-LOOP.md`.

**Ikke i A:** måned/år som redigerflate, stall-kolonner, Google, hele testbatteriet, Club OS, lys på alle 160.

### Horisont B — ferdig nok til daglig bruk (etter A-smoke)

| Loop | Flate |
|------|--------|
| 5 | Måned + år (read + klikk til uke) |
| 6 | Stall dag |
| 7 | Kalender uke/agenda **uten** Google-API |
| 8 | Tester live: Gate + Innspill |
| 9 | Runde live + recap |
| 10 | Jarvis-merge (Jarvis merger aldri) |
| 11 | AgenticOS godkjenning A3/B1/C3 |
| 12 | Lys-pass på nøkkel-skjermer (`data-v2-tema`) |
| 13 | Forelder les FO-01 |
| 14 | DataGolf-flate + økonomi-les |

### Horisont C — etter at A+B er i prod

Gameplan, booking-redesign, Spiller 360, gapping, fys-stall, Google-synk, fullt TN-batteri, GROUP-materialisering til N medlemmer, Club OS.

---

## 4. Ryddesprint i v1 (1 dag, før eller parallelt Loop 1)

Gjør dette i **egen** Claude-session, egen commit, ingen features.

1. Les `docs/platform/AGENT-BRIEF.md` + `CLAUDE.md` + denne filen.  
2. Gap-tabell: hvor ligger I dag, TimeGrid, Prisma Session/Plan, server actions, tema.  
3. Marker Paper-port-PRs: draft → close, eller rebase etter Train-lock. Ikke merge Paper-tokens på Player.  
4. `#490` WANG PII: merge hvis preview er OK — det er sikkerhet, ikke look.  
5. Ikke slett `designsystem/paper/` ennå (historikk). Ikke rør Stripe/Resend/DNS.  
6. Kopier workbench-spec under `docs/natt/workbench/` så Claude Code ser den.

Ferdig når: `npm test` og `tsc` grønne, ingen feature-endring.

---

## 5. Hvordan du publiserer

Du er allerede koblet. **Ikke lag nytt Vercel-prosjekt. Ikke ny Supabase. Ikke ny `.env`.**

### Miljøer

| Miljø | Git | URL | Data |
|-------|-----|-----|------|
| Lokal Mac Mini | working tree | `localhost:3000` | `.env.local` → **prod-Supabase i dag** (vær varsom) |
| Preview | hver PR / gren | `*-akgolfsoftware.vercel.app` | samme DB med mindre du har staging |
| Produksjon | `main` | `akgolf-hq.vercel.app` (+ `akgolf.no` når DNS peker) | prod-Supabase |

STATUS-regelen: **push til `main` deployer. Aldri `vercel deploy --prod` manuelt.**

### Flyt (hver loop)

```
1. git checkout main && git pull
2. git checkout -b claude/…
3. Kode + tester
4. git push -u origin HEAD
5. Åpne PR som draft
6. Vercel bygger preview automatisk
7. Du åpner preview på telefon + Mac (skjermbilde-gaten)
8. Ready for review → merge til main
9. Vercel deployer prod
```

Claude Code på Mini skal **ikke** merge. Du merger etter at du har sett skjermen.

### Env — hva som bor hvor

**Mac Mini `.env.local` (gitignored):**

- `DATABASE_URL` / `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL` + anon + service role
- Stripe test/live, Resend, Anthropic, cron, kryptering

**Vercel Project Settings → Environment Variables** (Production + Preview):

- Samme nøkler. Preview kan peke på samme Supabase inntil du lager staging.
- `BETALING_STARTER` / feature flags: verifiser før 1. september.

**Aldri:** commit `.env`, lim passord i Claude-chat, kjør muterende smoke mot ekte junior-rader.

### Migrasjoner

- Prisma-migrasjon i Loop 1 kun hvis Session/Drill mangler felt (`status`, `publishedAt`, `hiddenByPlayer`, drills).
- **ALDRI `prisma migrate deploy` / `migrate dev` / `db push` i dette repoet** — alle tre er
  blokkert/farlige (se `.claude/rules/gotchas.md` §Schema-endringer). Additive endringer gjøres
  med kirurgisk `db execute`-script mot `DIRECT_URL` (mønster: `scripts/add-workbench-sessions-2026-08-25.ts`),
  én gang mot prod **etter** backup (Supabase dashboard → backups).
- Ingen «reset» av prod-DB.

### DNS / e-post / betaling (Anders, ikke Claude)

Disse blokkerer ekte brukere, ikke koden:

- `akgolf.no` → Vercel
- Resend DKIM `send.akgolf.no`
- Stripe **live**-nøkler + webhook (13 event-typer) — sjekkliste ligger i repoet
- Rotér `SCREENTEST_PASSWORD`
- `#490` WANG PII

---

## 6. Hva Claude på Mini skal få (startprompt)

Lim dette i **ny** Claude Code-session i `Golf_Headquarters`:

```
Les docs/natt/KOMPLETT-PLAN.md
og docs/natt/OVERNIGHT-CODING-LOOP.md.

Vi bygger i DETTE repoet. Ikke AKGolf2.0. Ikke nytt Vercel/Supabase.

Loop 1 nå: port workbench domain + hele økt-action-kontrakten.
Train-lock. DRAFT usynlig for spiller.
Stopp når operations.test.ts og tsc er grønne. Commit. Ikke start Loop 2.
Ikke merge. Ikke prisma reset. Ikke rør Stripe/DNS.
```

---

## 7. Definisjon av ferdig

**Lansert nok (horisont A):** smoke i §3 virker på preview + deretter `main`. Train-lock på I dag + uke + TM-detalj. Ingen DRAFT-lekkasje.

**I daglig bruk (A+B):** stall, kalender uten Google, live test/runde, Jarvis-merge med menneske i loopen, forelder les.

**Ikke ferdig-kriterier:** alle 160 `.dc.html` portet, lys overalt, Club OS, Paper-paritet.

---

## 8. Risiko hvis du starter nytt likevel

- To sannheter for spillere (to databaser) → GDPR-brudd venter
- Stripe-webhooks mot feil app
- 6–12 uker før I dag virker igjen
- Mini har allerede Claude + env mot v1; 2.0 har bevisst ingen auth

Hvis du likevel vil 2.0: du må **si det eksplisitt**, flytte prod-data, og akseptere at lansering flyttes. Anbefalingen her er nei.
