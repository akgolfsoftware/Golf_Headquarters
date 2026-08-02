# Plan: Navigasjons- og fullstendighets-verifisering (PlayerHQ + AgencyOS)

**Dato:** 2026-07-30 · **Status:** Utkast — venter godkjenning · **Estimert omfang:** 1 økt (2–4 timer)
**Kontekst for eksekverende sesjon:** Denne planen er skrevet for å kjøres av en AI-sesjon UTEN forkunnskap. Les først `docs/platform/AGENT-BRIEF.md` og `AGENTS.md` i roten (OBLIGATORISK iht. prosjektreglene). Bakgrunnsmateriale denne planen bygger på: `docs/platform/user-flows.md`, `docs/platform/rute-graf-data.json`, `docs/platform/funksjoner-og-agenter-oversikt.md` og `docs/MASTER-SKJERMPLAN.md`.

---

## 0. Prinsipper (gjelder hele planen)

- **Minimale endringer.** Denne planen fikser navigasjon, synlighet og hygiene — ingen refaktorering, ingen nye features.
- **Ingen git-mutasjoner** (commit/push/reset) uten eksplisitt godkjenning per gang.
- **Ingen endring av eksisterende logikk** i server actions, agenter eller executor — kun additive lenker, cron-oppføringer og logging.
- **Beslutningspunkter er markert med 🔶.** Stans og spør brukeren før du går videre ved hvert punkt. Ikke ta beslutningen selv.
- **Verifiser alt du endrer:** `npm run build` (eller i det minste `npx tsc --noEmit` + berørte tester) før planen markeres ferdig. Kjør `npm test` i rent shell-miljø — IKKE source `.env.local` (kjent felle, se AGENTS.md).
- **Oppdater `docs/MASTER-SKJERMPLAN.md`-hakene i samme endring** når en skjerm endres (prosjektregel).
- Rapporter i det formatet som er spesifisert i §6 — brukeren skal kontrollsjekke mot den.

---

## 1. Bakgrunn (hva som er funnet)

En auto-generert navigasjonsgraf (`scripts/rute-graf.mjs`, 330 ruter, 763 kanter) avdekket:

1. **23 blindgate-kandidater** — ruter uten innkommende lenker i statisk analyse. Noen er bevisste (nås via varsel/e-post/programmatisk), noen kan være reelle blindgater.
2. **21 kryss-lenker fra `/portal/*` til `/admin/*`** — sannsynligvis bevisste coach-rolle-lenker, men uverifisert. Potensiell rolle-lekkasje hvis spiller (PLAYER-rolle) kan se lenker til admin-flater.
3. **3 ruter i limbo** — `docs/MASTER-SKJERMPLAN.md` sier selv «fjern eller bygg bevisst»: `/portal/statistikk/sammenlign`, `/portal/mal/baner`, `/portal/reach`.
4. **8 agenter usynlige i agent-UI** — bruker ikke `runAgent()` og logges derfor ikke til `AgentRun` (usynlige på `/admin/agents` ved feilsøking): `betalings-purring`, `booking-reminders`, `caddie-proactive`, `churn-radar`, `lead-oppfolging`, `maanedsrapport`, `weekly-plan-proposals`, `ukesoppsummering`.
5. **2 agenter uten cron** — `booking-optimizer` og `availability-24-7-monitor` finnes i cron-routen men mangler oppføring i `vercel.json`. Kjører aldri automatisk.

---

## 2. Del A — Verifiser de 23 blindgate-kandidatene

**Metode per rute** (gjenta for hver):
1. Les rutens `page.tsx` og forstå hvordan den er ment nådd.
2. Søk etter *dynamiske* innganger statisk analyse ikke fanger: `Grep` etter rute-stammen uten ledende `/` (f.eks. `putte-laboratoriet`) i hele `src/` — inkl. konstant-filer, søkeindekser (`global-search`, `cmdk`), varsel-tekster (`Notification`, e-postmaler i `prisma/seed*` og `docs/epost-maler/`), og `router.push`/`redirect` med variabler.
3. Sjekk om ruten er feature-gated eller rolle-gated (da kan manglende lenke være bevisst).
4. Klassifiser: **(OK)** bevisst inngang funnet — dokumentér hvor. **(LINK)** reell blindgate — legg til naturlig lenke fra nærmeste logiske forelder (se forslag under). **(KILL)** død/foreldet rute — foreslå sletting (🔶).

| # | Rute | Forventet inngang / forslag ved LINK |
|---|---|---|
| 1 | `/portal/ai/foresla-turnering` | Lenke fra `/portal/tren/turneringer` eller `/portal/ai`-hub |
| 2 | `/portal/ai/mal-bygger` | Lenke fra `/portal/mal` (finnes `/portal/mal/bygger` — sjekk om de er duplikater; da 🔶 KILL den ene) |
| 3 | `/portal/trening/putte-laboratoriet` | Lenke fra `/portal/drills` (putte-kategori) eller `/portal/trening` |
| 4 | `/portal/trening/break-tabell` | Samme som over |
| 5 | `/portal/trening/logg` | Sannsynlig OK — nås fra «logg etterpå»-handling i Gjør-flaten; verifiser i `lib/portal-gjennomfore` |
| 6 | `/portal/tren/[sessionId]/planlagt` | Sannsynlig OK — nås fra kalender/Gjør med dynamisk id; verifiser |
| 7 | `/portal/tren/aarsplan/periode/ny` + `[id]/rediger` | Verifiser inngang fra Workbench års-zoom; hvis ingen — 🔶 (dette er de to siste ekte legacy-sidene) |
| 8 | `/portal/tren/tester/ny/egen` | Verifiser lenke fra `/portal/tren/tester` |
| 9 | `/portal/statistikk/[metric]` | Sannsynlig OK — bygges dynamisk per metrikk fra analyse-huben; verifiser i `lib/portal-analyse` |
| 10 | `/portal/meg/innstillinger/ai-coach` | Lenke fra `/portal/meg/innstillinger`-hubben (merk: siden er «kommer snart»-flate — da er OK svar også gyldig) |
| 11 | `/portal/meg/innstillinger/okter` | Samme |
| 12 | `/portal/booking/anlegg/[anleggId]` | Verifiser inngang fra `/portal/booking` (anleggsvalg) |
| 13 | `/portal/booking/coach/[coachId]` | Verifiser inngang fra `/portal/booking` (coach-valg) |
| 14 | `/portal/booking/ny/bekreft` | Sannsynlig OK — wizard-steg, programmatisk |
| 15 | `/portal/onskeligokt/bekreftet` | Sannsynlig OK — bekreftelse etter innsending |
| 16 | `/portal/mal/sg-hub/coach/[spillerId]/equipment` | Kjent gjenværende legacy-side — verifiser coach-inngang fra `/portal/mal/sg-hub/coach/[spillerId]` |
| 17 | `/admin/drills/forslag` | Verifiser lenke fra `/admin/agents` + varsel fra ukesrapport-agent (forventes OK) |
| 18 | `/admin/grupper/[id]/arsplan/skoledata` | Verifiser inngang fra `/admin/grupper/[id]/arsplan` |
| 19 | `/admin/settings/api` | Verifiser lenke fra `/admin/settings` (ADMIN-fane) |
| 20 | `/admin/settings/security` | Verifiser lenke fra `/admin/settings` eller `/admin/profile` |
| 21 | `/admin/stats/overview` | Legacy — sjekk om redirect finnes; hvis død: 🔶 KILL |
| 22 | `/admin/talent/wagr-import` | Legacy — sjekk mot `/admin/talent/*`; hvis død: 🔶 KILL |
| 23 | `/forelder/barn/[childId]` | Verifiser inngang fra `/forelder`-oversikten (dynamisk id) |

**Regel for LINK-fikser:** Én beskrivende lenke fra nærmeste logiske forelder-side, i eksisterende design-system (se `docs/design-system/FASIT.md` §3 — «minst mulig trykk»). Ikke opprett nye navigasjonselementer i hovednav-en for disse.

## 3. Del B — Verifiser de 21 portal→admin-kryss-lenkene

1. Hent listen: `node -e 'const d=require("./docs/platform/rute-graf-data.json"); d.edges.filter(e=>e.from.startsWith("/portal")&&e.to.startsWith("/admin")).forEach(e=>console.log(e.from,"->",e.to))'`
2. For hver kant: finn den konkrete lenken i kildefilen (Grep på målstien i filer under kilderuten + delte komponenter), og les konteksten.
3. Klassifiser:
   - **(OK-ROLE)** Lenken rendres kun for COACH/ADMIN (rolle-sjekk i komponent eller server-side gate). Dokumentér hvor sjekken sitter.
   - **(LEAK)** Lenken er synlig for PLAYER. 🔶 **Stans** — dette er en potensiell UX-/sikkerhetsfeil; rapporter fil + linje og foreslå rolle-gate, men ikke endre uten godkjenning.
4. Spesielt fokus: `/portal/meg → /admin/kalender` (8 treff — finn den delte komponenten dette kommer fra), `/portal/coach → /admin/kalender` (4), `/portal/mal → /admin/spillere` (3).

## 4. Del C — Limbo-ruter (beslutning kreves) 🔶

`MASTER-SKJERMPLAN.md` sier selv «fjern eller bygg bevisst». Still brukeren dette spørsmålet per rute, med anbefaling:

| Rute | Tilstand i dag | Anbefaling |
|---|---|---|
| `/portal/statistikk/sammenlign` | Finnes ikke | **Fjern fra planen** — sammenligning er dekket av `/portal/talent/sammenligning` |
| `/portal/mal/baner` | Finnes ikke | **Fjern fra planen** — bane-bibliotek finnes som `/portal/gameplan` |
| `/portal/reach` | Kun redirect til `/portal` | **Fjern ruten + plan-raden** — funksjonen er aldri bygget, ingen datamodell |

Ved «fjern»: slett ev. redirect-fil + marker raden som fjernet i `MASTER-SKJERMPLAN.md`. Ved «bygg»: **ikke i denne planen** — da skrives egen plan.

## 5. Del D — Agent-synlighet og cron-hygiene

### 5.1 AgentRun-logging for de 8 usynlige agentene
For hver av `betalings-purring`, `booking-reminders`, `caddie-proactive`, `churn-radar`, `lead-oppfolging`, `maanedsrapport`, `weekly-plan-proposals`, `ukesoppsummering`:

1. Les agenten og forstå hvorfor den ikke bruker `runAgent` (flere returnerer egne resultatobjekter).
2. **Ikke skriv om agentens logikk.** Legg kun til minimal `AgentRun`-logging: enten pakk inn i `runAgent()` hvis signaturen tillater det uten endret retur, eller skriv én `prisma.agentRun.create({...})` i en try/catch ved slutten (status OK/ERROR, duration, output-tellinger). Følg mønsteret i `src/lib/agents/agent-runner.ts`.
3. Kjør agentens enhetstester der de finnes (`betalings-purring` har tripletex-tester i nærheten; `gfgk-ballplukking-agent.test.ts` viser mønsteret).

### 5.2 De 2 cron-løse agentene 🔶
Still brukeren spørsmålet per agent — **legg til i `vercel.json` eller slett?**
- `booking-optimizer` (foreslått schedule hvis beholdes: ukentlig, f.eks. `"0 7 * * 1"` — unngå :00-kollisjon med eksisterende, velg f.eks. `"17 7 * * 1"`)
- `availability-24-7-monitor` (foreslått: daglig, f.eks. `"23 6 * * *"`)

Merk: vercel.json-crons kjører kun i produksjon — verifiser syntaks (`npx vercel validate` om tilgjengelig, ellers JSON-lint), ikke kjøring.

### 5.3 Regenerer navigasjonsgrafen
Etter alle endringer: `node scripts/rute-graf.mjs` — verifiser at blindgate-lista krymper som forventet, og oppdater «Nøkkeltall» og «Blindgate-kandidater» i `docs/platform/user-flows.md`.

## 6. Rapport-format (obligatorisk ved ferdigstillelse)

```markdown
## Gjennomføringsrapport — [dato]
### Del A: Blindgater
| Rute | Klassifisering (OK/LINK/KILL) | Tiltak | Bevis (fil:linje) |
### Del B: Kryss-lenker
| Kant | OK-ROLE / LEAK | Rolle-sjekk (fil:linje) |
### Del C: Limbo-beslutninger
### Del D: Agent-fikser (per agent: hva ble lagt til, testresultat)
### Verifikasjon: tsc/build/test-output (sammendrag)
### Avvik fra planen (hva og hvorfor)
```

## 7. Akseptkriterier

- [ ] Alle 23 blindgate-kandidater klassifisert med bevis (fil:linje)
- [ ] Alle LINK-fikser har nøyaktig én ny lenke fra logisk forelder, i eksisterende design
- [ ] Alle 21 kryss-lenker klassifisert; eventuelle LEAK rapportert (ikke fikset uten godkjenning)
- [ ] Limbo-beslutninger utført etter brukerens svar; `MASTER-SKJERMPLAN.md` oppdatert
- [ ] 8 agenter logger til `AgentRun`; verifisert synlig på `/admin/agents` (kode-nivå)
- [ ] `vercel.json` gyldig JSON; nye crons unngår minutt-kollisjon med eksisterende
- [ ] `npx tsc --noEmit` grønn; berørte tester grønne; rute-graf regenerert
- [ ] Rapport levert i formatet i §6

## 8. Eksplisitt UTENFOR denne planen (egen plan kreves)

Disse er kjente, men skal IKKE berøres — de er større arbeid som fortjener egne planer:
- Halvbygde funksjoner: `logSymptom`-stub, klubb-onboarding-persistering, push-påminnelse-triggere, offline-synk for drill-reps, Tripletex-klient-verifisering
- Aldri-byggede funksjoner: Test-uken (`TestWeek`), GolfBox per-spiller rundeimport, mandags-digest, «Gameplan møter runden»
- `/kommando` → `/admin/workspace`-portering
- Elite dispersion-pakken (parkert til Elite Fase 2)

## 9. Risiko

| Risiko | Tiltak |
|---|---|
| Lenke-fiks bryter «minst mulig trykk»-prinsippet | Kun én lenke per blindgate, fra eksisterende forelder-side |
| AgentRun-logging endrer agent-oppførsel | Kun additive skrivinger i try/catch; aldri la logging feile agenten |
| Kryss-lenke er LEAK på sensitive admin-data | LEAK fikses ikke i denne planen — kun rapportert, 🔶 egen beslutning |
| Legacy-ruter i bruk via gamle bokmerker | KILL kun etter 🔶; redirects beholdes heller enn slettes ved tvil |
