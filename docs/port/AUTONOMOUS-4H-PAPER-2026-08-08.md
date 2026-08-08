# Autonom 4-timers kjøreplan — Paper overalt (uten videre godkjenning)

**Start:** 2026-08-08 · **Varighet:** 4 timer · **Mandat:** Anders ba om plan som *jobber konstant uten videre godkjenning*  
**Full gjenstående plan (design + alle spor):** `docs/COMPLETE-REMAINING-PLAN.md`

**Scope-lås (4h-vindu):** Kun arbeid innenfor allerede godkjente fasiter + mønsterdokument + build/CI.  
**Ikke i scope:** Ny skjerm uten fasit (W2–W6 wireframe i Claude Design) · PR-E/PR-F · pris/produktendringer.

---

## 0. Beslutningsregler (erstatter «spør Anders»)

| Situasjon | Handling uten å spørre |
|---|---|
| TypeScript/build feiler | Fiks minste diff som grønner build |
| Import mangler export | Eksporter + contract-test + CI-gate |
| Avvik mot **eksisterende** fasit-HTML | Tilpass kode til fasit (Paper vinner) |
| Avvik mot mønsterdokument, ingen fasit | Følg mønsterdokument |
| Mønster + fasit mangler | STOPP den skjermen, dokumenter i REMAINING, gå videre |
| Hex i style={{}} | Bytt til T.* (check-token-gap) |
| Touch < 44px | Hev til --tap / min 44 |
| Horisontal overflow mobil | Fiks layout, ikke zoom |
| Push til GitHub fra sandbox | 403 → lag push-script + commit lokalt; Anders pusher når Mac er tilgjengelig |
| Upstash/env secrets | Ikke gjett tokens; fail-open i kode |

**Kvalitetsport per PR/commit-batch:**
1. `node scripts/check-critical-imports.mjs` OK (når script finnes)
2. Ingen nye hex i style
3. Berørte ruter: typecheck/esbuild grønn
4. Oppdater denne filas §Logg

---

## 1. Time-boks (4 × 60 min)

### Time 0–1 — PROD UNBLOCK (kritisk sti)
**Mål:** Vercel kan bygge main med Paper.

| # | Oppgave | Done-kriterium |
|---|---|---|
| A1 | AnalysereV2 `depthMode` prop + simple skjuler TrackMan-fane | tsc/build-feil borte |
| A2 | Offline-queue exports (listTapperKo/listLiveDrillKo) | OfflineSyncBootstrap bundler |
| A3 | rate-limit circuit-breaker + placeholder-reject | Ingen 500 fra Upstash-spam |
| A4 | OfflineSyncBootstrap teller kun `synket` | Korrekt sync-status |
| A5 | `check-critical-imports.mjs` + package.json verify + CI | Gate i repo |
| A6 | Commit-batch + `tmp-handoff/push-*.sh` for Mac | Klar til `bash … && git push` |

**Exit time 1:** Én push-script som tar prod grønn (når Anders kjører den).

### Time 1–2 — PLAYERHQ FASIT-MATCH (Hjem + Plan)
**Mål:** Kode matcher `playerhq-chat-*.html` + `playerhq-plan.html` bedre (layout, én ting nå, composer).

| # | Oppgave | Fasit-anker |
|---|---|---|
| B1 | Hjem: empty state, loop full bredde, coral mic / ink send | chat-mobil/desktop |
| B2 | Hjem: «én ting nå»-mønster der data finnes (dagens økt) | .nowblock |
| B3 | Plan: kolonne-tetthet, dock, depth simple/deep | playerhq-plan |
| B4 | Tokens: accent monopoly, rCard 12, Poppins/Lora | _foundation |
| B5 | Mobil 390: ingen overflow; composer sticky | KONTRAKT §4 |
| B6 | Screenshot seeds under `screenshots/visual-signoff/` hvis browser tilgjengelig | dokumentasjon |

**Exit time 2:** Hjem+Plan kode er Paper-nærmere; avvik listet hvis noe ikke kan løses.

### Time 2–3 — ANALYSE + SHELL + LIVE-INNGANG
**Mål:** Analysere hub + shell chrome + live-entry uten v2-import.

| # | Oppgave | Merknad |
|---|---|---|
| C1 | AnalysereV2: depth, faner, handling-monopol | hub-fasit |
| C2 | V2Shell PlayerHQ: I dag · Plan · Analyse · Meg (låst) | monster §6 |
| C3 | Fullscreen live-ruter: v2-import / Paper-flater der komponent allerede finnes | 8 triage-ruter |
| C4 | Workbench-inngang fra Plan (deep only) | allerede delvis |
| C5 | Fjern blandet athletic hvis noen dukker opp | triage |

**Exit time 3:** Ingen nye type-feil; live-entry nærmere v2.

### Time 3–4 — AGENCYOS POLISH + REGRESJON + HANDOFF
**Mål:** AgencyOS fasit-flater (konsoll/Kø) + CI-sikkerhet + handover.

| # | Oppgave |
|---|---|
| D1 | AgencyOS Kø badges + hub subnav (allerede Paper-spor) |
| D2 | Admin triage: document 28 legacy — ikke redesign uten fasit; bare list |
| D3 | Kjør `paper-port-triage` + oppdater REMAINING/portstatus |
| D4 | Unit tests for contracts |
| D5 | Én samlet push-script `push-4h-paper.sh` |
| D6 | Kort status-rapport i denne filas §Logg + `docs/REMAINING.md` |

**Exit time 4:** Alt committet lokalt + push-script; Anders trenger bare én terminal-kjøring.

---

## 2. Eksplisitt UTENFOR 4-timers vinduet

- Tegne nye fase2-wireframes i Claude Design (krever din batch-ja senere)
- Portere 300 skjermer uten fasit
- Full iPad-QA på alle 40 flater
- Marketing/WANG/GFGK redesign
- Stripe/pricing

---

## 3. Push-protokoll (når Mac er tilgjengelig)

```bash
bash ~/Downloads/push-4h-paper.sh
# eller: git pull && apply script && git push origin main
```

Etter push: vent Vercel Ready → hard refresh akgolf.no/portal.

---

## 4. Logg (fylles underveis)

| Tid | Commit / endring | Status |
|---|---|---|
| T0 | Plan opprettet | start |
| | | |


---

## 5. Utført i denne sessionen (autonom)

| Tid | Endring | Commit |
|---|---|---|
| T0 | Plan skrevet | denne fil |
| T0–1 | AnalysereV2 depthMode | 76b13d6 |
| T0–1 | rate-limit circuit-breaker | pending |
| T0–1 | OfflineSyncBootstrap synket-count | pending |
| T0–1 | check-critical-imports + CI + tests | pending |
| T1 | Hjem/Plan allerede Paper-signert i #383 | verify only |
| T1 | Live «uportede» = false positive (bruker Live* v2-komponenter) | triage-notat |

### Anders — én kommando for prod

```bash
bash ~/Downloads/push-4h-paper.sh
```

