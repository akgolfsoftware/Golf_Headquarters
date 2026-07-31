# Nattplan — 15 code-review-punkter (autonom)

**Opprettet:** 2026-07-31 23:43 CEST  
**Kilde:** code review av pilot FØR/UNDER/ETTER (main `93cc6aad`+)  
**Mål:** Alle 15 funn implementert eller bevisst lukket med PR på main-klar gren.  
**Kjøring:** Autonom over natten — **én gren, atomiske commits per bølge**, PR til slutt.  
**Merge til main:** KUN med eksplisitt «ja» fra Anders (hook).  
**Ikke i scope:** Resend/DKIM/DNS, Paper-port, Stripe, Google Calendar.

---

## Regler for nattagenten (hard)

1. Branch: `fix/pilot-review-15` fra oppdatert `main`.
2. Aldri push til `main`. Aldri force-push. Aldri secrets i kode.
3. Schema: kun additiv SQL via kirurgisk `db execute` + `prisma generate` — **ikke** `migrate dev` / `db push`.
4. Etter hver bølge: `npx tsc --noEmit` på berørte filer + relevante enhetstester. Før PR: `npm test` (recording + auth + offline-queue) og `npm run pilot:flyt-smoke` hvis E2E-creds finnes.
5. Ved rødt: fiks i samme bølge. Kan ikke fiks → skriv `BLOKKERT` i natt-logg, hopp til neste uavhengige punkt.
6. Hold endringer kirurgiske — ikke redesign UI, ikke Paper.
7. Skriv natt-logg fortløpende i denne filen under «Natt-logg».
8. Ferdig = PR åpnet med sjekkliste 1–15 + verify-status.

---

## Bølger (rekkefølge)

| Bølge | Tid (ca.) | Punkter | Kan parallelliseres? |
|-------|-----------|---------|----------------------|
| **A** | 0–45 min | #1, #2 | Nei (sikkerhet først) |
| **B** | 45–90 min | #6, #5, #7, #8 | Delvis (6+5 UI, 7+8 server) |
| **C** | 90–150 min | #3, #12 | Nei (rate-limit + config) |
| **D** | 150–210 min | #4, #11 | Ja (token-hash + gyldighet) |
| **E** | 210–270 min | #9, #10 | Ja |
| **F** | 270–320 min | #13, #15 | Ja (docs/UI-tekst) |
| **G** | 320–360 min | #14 | Nei (docs only — lukk bevisst) |
| **H** | 360–420 min | Verify + PR | Nei |

Avhengigheter:
- **#4** (token-hash) må komme **før** eller **i samme commit-sett** som endring av send/bekreft — ikke delvis merge.
- **#1** må lande før smoke forventer enrollment (seed E2E-spiller må ha enrollment — sjekk/opprett).
- **#2** kan knuse `pilot-flyt-smoke` som bruker dummy-transcript → oppdater smoke til env-flagg eller lokal-only.

---

## Punkt for punkt

### #1 — Enrollment-sjekk (HØY)

**Problem:** Coach kan starte opptak / registrere samtykke for hvilken som helst PLAYER.

**Løsning:**
- **Gjenbruk eksisterende** `harCoachTilgangTilSpiller` / `assertCoachTilgangTilSpiller` i `src/lib/auth/coached.ts` (ikke bygg ny helper).
- ADMIN: allerede OK i den funksjonen; COACH: enrollment + gruppe-eierskap.
- Kall i:
  - `src/app/api/recording/start/route.ts` (playerId-gren; booking-gren har allerede coach-på-booking)
  - `src/lib/recording/lyd-samtykke-actions.ts` (`registrer`, `send`, `trekk`)
- Utvid `src/lib/auth/coach-scope-idor.test.ts` eller egen test: nekt uten tilgang, tillat med, tillat ADMIN.

**Ferdig når:** test grønn + start uten tilgang → 403.

---

### #2 — Lås dummy-transcript i prod (HØY)

**Problem:** `/api/recording/dummy-transcript` er åpen for coach i prod.

**Løsning:**
- Tillat bare hvis `process.env.ALLOW_DUMMY_TRANSCRIPT === "1"` **eller** `NODE_ENV !== "production"`.
- Ellers 404/403 med nøktern melding.
- Oppdater `scripts/pilot-flyt-smoke.mjs`: sett env i dokumentasjon; i smoke bruk flagg eller hopp over dummy og kreve ekte transcribe (fallback: smoke documenterer at den trenger flagget).
- For natt: preferer smoke med `ALLOW_DUMMY_TRANSCRIPT=1` kun i `.env.local` / Vercel **preview**, **ikke** prod — smoke mot prod må da bruke analyse-path uten dummy eller hoppe over hvis 403.

**Anbefalt smoke-tilpasning:**
1. Prøv dummy; ved 403 → logg «dummy av i miljø» og forsøk `transcribe` hvis nøkkel finnes; ellers marker steg `dummy-transcript` som `skipped` og fortsett bare hvis analyse kan kjøre.

**Ferdig når:** prod default avvist; dev/test OK; smoke exit 0 eller ærlig skip.

---

### #3 — Rate-limit: dokumenter + harden (MIDDELS)

**Problem:** Fail-open uten Upstash.

**Løsning (kode, uten at Anders logger inn i Upstash):**
- Logg metrikknavn / én `console.error` rate-limitert (unngå spam) når fail-open treffer.
- Valgfri soft-limit i-minne (per instance) som backup når Redis mangler: f.eks. Map med sliding window for `recording-start` / `recording-analyze` **kun** når `!redis` — best-effort, ikke multi-instance.
- Docs: `docs/runbook.md` eller pilot-fase0: «Upstash permanent + `RATE_LIMIT_FAIL_CLOSED=1` etter stabilitet».
- **Ikke** sett `RATE_LIMIT_FAIL_CLOSED=1` i kode som default (kan ta ned prod hvis Redis borte).

**Ferdig når:** in-memory fallback + docs. Anders-panel (Upstash Claim) noteres som «venter på deg» i PR.

---

### #4 — Token-hash for magisk lenke (MIDDELS)

**Problem:** Token i klartekst i DB.

**Løsning:**
- `tokenHash` (sha256 hex) i schema + SQL additivt; behold midlertidig `token` for migrering **eller** bytt direkte hvis ingen aktive VENTER i prod (sjekk count).
- Anbefalt ren modell:
  - Kolonne `tokenHash String? @unique`
  - Fjern lagring av rå `token` (søk via hash)
  - `findUnique({ where: { tokenHash: hash(input) } })`
- Oppdater: send, bekreft, page lookup, trekk (null hash).
- SQL: `prisma/sql/2026-08-01-lyd-samtykke-token-hash.sql` + kjør mot DIRECT_URL.
- Tester: hash-hjelper ren + gyldighet.

**Ferdig når:** rå token finnes ikke i DB etter send; bekreft fungerer med e-post-lenke.

---

### #5 — Kopier samtykkelenke i UI (MIDDELS)

**Problem:** Ved e-post-feil / uten Resend kan ikke coach dele lenke.

**Løsning:**
- Når status VENTER og token/hash finnes: coach-action `hentLydSamtykkeLenke(playerId)` som regenererer **ny** token ved behov og returnerer full URL (kun coach+enrollment).
- UI i `lyd-samtykke-pilot-panel.tsx`: «Kopier lenke» (clipboard) + kort toast/tekst.
- Ikke vis lenke i klartekst permanent i DOM hvis unødvendig (clipboard er nok).

**Ferdig når:** coach kan kopiere URL uten Resend.

---

### #6 — Recovery vs samtykke-UI (MIDDELS)

**Problem:** Recovery-modus skjuler samtykke/Start.

**Løsning:**
- I `recording-controls.tsx`: vis `LydSamtykkePilotPanel` også når `showRecovery && valgtSpiller && !valgtHarSamtykke`.
- Eller: tydelig banner «Forkast avbrutt opptak for å starte nytt» over recovery (minimum).
- Prefer: begge — panel synlig + beholde Forkast.

**Ferdig når:** velg spiller uten GITT under recovery → manuell samtykke synlig.

---

### #7 — Ikke lek interne 500-meldinger (MIDDELS)

**Problem:** `recording/start` returnerer `err.message` til klient.

**Løsning:**
- Klient: `{ error: "server-error", message: "Noe gikk galt. Prøv igjen." }`
- Server: `console.error` / `logError` med full feil.
- Samme mønster på andre recording-routes som lekker `uploadErr.message` hvis enkelt (upload-chunk 500).

**Ferdig når:** grep viser ingen rå `err.message` i JSON til klient på start.

---

### #8 — Same-origin på coach-samtykke-actions (MIDDELS)

**Problem:** Offentlig bekreft har CSRF-vern; coach-actions mangler det.

**Løsning:**
- `isSameOriginAction()` i starten av `registrerLydSamtykkeGitt`, `sendLydSamtykkeForesattEpost`, `trekkLydSamtykke`, og ny `hentLydSamtykkeLenke`.
- Returner `{ ok: false, error: "..." }` ved avvisning.

**Ferdig når:** mønster likt guardian/lyd-token.

---

### #9 — Zod på fangst-suggestion (LAV)

**Problem:** `as Record` / cast på suggestion.

**Løsning:**
- Zod-schema i `src/lib/recording/fangst-suggestion.ts` (sjekkpunkt, fangstId, forklaring, …).
- `safeParse` i `accept-plan-action.ts` og `opprettFangstSjekkpunktPlanAction` / executor-gren.
- Ingen `as unknown as` for dette feltet.

**Ferdig når:** parse-fail → trygg fallback / ikke krasj.

---

### #10 — Unngå `as unknown as` for chunks (LAV)

**Problem:** upload-chunk Prisma JSON cast.

**Løsning:**
- Valider med zod/type guard (finnes delvis `isChunkArray`) og lagre via `Prisma.InputJsonValue` på en måte som matcher repo-mønster uten dobbel cast — f.eks. `JSON.parse(JSON.stringify(next)) as Prisma.InputJsonValue` bare hvis nødvendig, eller Prisma.JsonArray.
- Mål: fjern `as unknown as` i denne filen.

**Ferdig når:** ingen `as unknown as` i upload-chunk.

---

### #11 — Token-gyldighet avviser TRUKKET eksplisitt (LAV)

**Problem:** Kun GITT blokkeres.

**Løsning:**
- I `erLydSamtykkeTokenGyldig`: `if (status === "TRUKKET" || status === "GITT") return false`.
- Oppdater enhetstest.

**Ferdig når:** test dekker TRUKKET.

---

### #12 — Rate-limit 5/time for demo (LAV)

**Problem:** For stramt under øving.

**Løsning:**
- Hev `recording-start` til f.eks. **20 / time** (eller 15).
- Analyze: behold 10 eller hev til 15.
- Dokumenter i kommentar + testing.md.

**Ferdig når:** tall oppdatert i start/analyze routes.

---

### #13 — Manuell GITT tydeligere (LAV)

**Problem:** Nødvei kan misforstås som ekte foresatt-samtykke.

**Løsning:**
- UI-tekst: «Kun for myndig spiller eller nød. Logger at coach registrerte manuelt.»
- Audit allerede `via: coach-manuell` — behold.
- Eventuelt krev bekreftelses-checkbox før manuell FORESATT (ikke SELV) — valgfritt i natt.

**Ferdig når:** copy oppdatert i pilot-panel.

---

### #14 — TradApning / Group.kind (LAV — lukk som backlog)

**Problem:** Schema uten UI.

**Løsning natt (ikke bygg full flate):**
- Oppdater `docs/pilot-fase0-sjekkliste.md` + `docs/pilot-status-…`: eksplisitt **BACKLOG post-demo**, ikke bug.
- Ingen featur-implementasjon i natt med mindre tid blir til overs etter H.

**Ferdig når:** dokumentert som bevisst utsatt, ikke «mangler ved uhell».

---

### #15 — Smoke: complete 400 + dummy (LAV)

**Problem:** Smoke forventer complete uten chunks → 400; dummy for analyse.

**Løsning:**
- I `pilot-flyt-smoke.mjs`: marker `complete` som `ok: true` når status 400 med forventet tom-body (ærlig `expected: true`).
- Dokumenter i `docs/pilot-demo-sjekkliste.md` at smoke ikke er ekte mikrofon-complete.
- Tilpass til #2 (dummy flagg).

**Ferdig når:** smoke-output er ærlig; exit 0 under tillatt miljø.

---

## PR-mal (sluttprodukt)

**Tittel:** `fix(pilot): lukk 15 code-review-punkter`

**Body må inneholde:**

```markdown
## Sjekkliste
- [x] #1 Enrollment
- [x] #2 Dummy-transcript gated
- [x] #3 Rate-limit harden/docs
- [x] #4 Token-hash
- [x] #5 Kopier lenke
- [x] #6 Recovery + samtykke UI
- [x] #7 500 uten lekkasje
- [x] #8 Same-origin coach-actions
- [x] #9 Zod suggestion
- [x] #10 Chunks uten as unknown as
- [x] #11 TRUKKET i token-sjekk
- [x] #12 Høyere rate-limit
- [x] #13 Manuell GITT-copy
- [x] #14 Backlog-docs TradApning/Group.kind
- [x] #15 Smoke ærlig

## Verify
- tsc / eslint / npm test (subset)
- pilot:flyt-smoke: …

## Krever Anders
- Merge ja
- Upstash permanent (hvis ikke gjort)
- ALLOW_DUMMY_TRANSCRIPT ikke i prod
```

---

## Natt-logg (fylles av agent)

| UTC/CEST | Bølge | Punkt | Status | Commit |
|----------|-------|-------|--------|--------|
| | A | #1 | pending | |
| | A | #2 | pending | |
| | B | #6 #5 #7 #8 | pending | |
| | C | #3 #12 | pending | |
| | D | #4 #11 | pending | |
| | E | #9 #10 | pending | |
| | F | #13 #15 | pending | |
| | G | #14 | pending | |
| | H | PR | pending | |

---

## Suksesskriterier for natten

1. Gren `fix/pilot-review-15` pushet.
2. PR åpen, CI verify grønn (eller kjent rødt med forklaring).
3. Alle 15 punkter avhuket eller merket BLOKKERT med grunn.
4. Ingen merge til main uten Anders.
5. Demo-flyt (manuell GITT → start → analyse → Før-kort) fortsatt mulig.

---

## Prompt til nattagent (lim inn)

```
Du er autonom agent i akgolf-hq. Les og utfør docs/nattplan-code-review-15-2026-07-31.md
fra bølge A til H. Jobb på fix/pilot-review-15 fra main. Følg harde regler i filen.
Oppdater natt-loggen. Åpne PR når ferdig. Merge ikke til main.
Svar kort på norsk i PR-body. Ved usikkerhet: velg minst risikable fiks, dokumenter.
```
