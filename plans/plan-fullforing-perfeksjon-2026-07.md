# Fullføringsplan til perfeksjon — baneguide + flytpakke 2 + totalgjennomgang

> **Eier:** Anders · **Utfører:** Claude Code (main, auto-deploy) · **Skrevet:** 10. juli 2026, kveld
> **Grunnlag:** godkjent plan `~/.claude/plans/gj-r-n-en-komplett-cuddly-blum.md` (A+B levert),
> `docs/redesign-v2/baneguide-designplan.md`, `docs/funksjoner-og-plan-2026-07-10.md` (§5–7).
> **Prinsipp:** hvert steg har en VERIFISERINGSPORT — ingenting hakes av uten bevis.

## Standard verifiseringsport (gjelder HVERT steg under)

```
npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build && npm test
```
+ innlogget klikkverifisering av akkurat den flyten (Playwright-oppsettet fra 10/7, demo-bruker,
rydder etter seg) + mobil 375 px + skjermbilde-bevis til Anders + commit/push (auto-deploy)
+ prod-sjekk på akgolf-hq.vercel.app. Skriveflater: zod på all klient-JSON, eierskapssjekk i
alle actions, norsk bokmål mot ordboken (ARG=Nærspill), aldri fabrikkerte tall.

---

## FASE 0 · Fundament-hygiene (før nybygg — ½ økt)

| # | Oppgave | Verifisering |
|---|---|---|
| 0.1 | Merge `feature/live-coach-session` til main (den siste levende branchen) | full port + klikktest av live-coach-flyten |
| 0.2 | [DU] Innboks-nøkler (INBOX_WEBHOOK_SECRET, RESEND_API_KEY) + webhook hos e-postleverandør | send test-e-post → utkast dukker opp i innboksen |
| 0.3 | Service worker-fiks (/sw.js 404 — chip ligger klar) | `curl /sw.js` = 200, null konsollfeil, offline-side virker |
| 0.4 | Mobil-UAT av Workbench-flytpakka + tapper på ekte telefon [DU 10 min m/ meg på skjermdeling eller Playwright-mobilprofil] | sjekkliste: helgeøkt, ett-klikks legg-til, start økt, tapper-gjenopptak |
| 0.5 | Èn-økt-disiplin: bekreft at v2natt-økten jobber på main via PR (skjedde 10/7 kveld — PR #1) | `git branch -r` viser ingen aktive avvikende brancher |

**PORT 0:** klikktest-sweep alle tre roller (skript klart) = 0 feil · 350+ tester grønne.

---

## FASE 1 · Baneguide C2–C7 til perfeksjon (den godkjente pakken)

> Design: mockupene med ekte Onsøy-satellitt + interaktivt sikte/soner/avstand er bygget.
> [DU] Formell godkjenning + navnevalg («Gameplan» anbefalt) før 1.2.

| # | Steg | Innhold | Verifiseringsport |
|---|---|---|---|
| 1.1 | **C2 Baner** | [DU] bekreft ~10-listen → bbox per bane i `import-bane-osm.ts` + `--dry-run`-flagg + per-bane-validering (WARN uten hull-geometri) | dry-run-rapport per bane → import → re-kjøring = no-op → visuell kontroll av hver bane mot satellitt i appen |
| 1.2 | **C3 v2-port** | Banekart + hull-detalj i v2 (fullskjerms kart, flytende chrome, hull-velger-pill, sheet/panel) — atomisk flytt + slett av (legacy)-treet; mobil-komposisjon egen (ikke krympet desktop) | URL-er uendret · klikkløype bibliotek→bane→hull→segmenter · matrise {token/uten}×{geometri/uten} · designdommer-pass ≥9/10 · 375 px |
| 1.3 | **C4 Ellipse** | `ellipse-geo.ts` (aim-frame→GPS-ring) + 80 %-ellipse-lag i CourseMap + legende + ≥5-slag-terskel | NYE unit-tester: dispersion.test + ellipse-geo.test (rundtur < 0,5 m) · visuell sjekk mot kjent punktsky |
| 1.4 | **C5 Plotting** | `saveShotPosition` (kun posisjon, <1000 m-validering) · `ShotPlotter` (trådkors, «Sett punkt», «Bruk min posisjon», dragbare markører) · kartsteg i SlagWizard · `/plott`-etterregistrering m/ auto-advance · valgfri siktelinje (targetX/Y) | plott en HEL ekte runde på Onsøy ende-til-ende · avstander autofylles og SG regnes (B4-motoren) · GPS-modus testes på telefon ute [DU 15 min] · kjede-konsistens ved redigering/sletting |
| 1.5 | **C6 Per kølle** | `?kolle=`-chips (kun køller m/ data) i hull-detalj | chips matcher faktiske data · ellipse/KPI-er regnes om |
| 1.6 | **C7 Gameplan** | Migrasjon `GameplanHull`+`GameplanSone` (additiv tsx-script) · hull-for-hull-flyt fra den interaktive prototypen: sikte-dra, soner (auto vann/bunker/OB fra geometri + malte bra/aldri), live-% (240-punkts sampling), levende avstand (haversine), notat, sammendrag · inngang fra banekart + rundens brief | migrasjon idempotent · Playwright: dra sikte→% endres, mal sone→lagres→overlever refresh · sammendraget viser alle hull · coach ser spillerens gameplan (lesing) |
| 1.7 | **Polish** | «Optimaliser sikte»-knappen (grid-søk langs korridor, lavest rød-andel) + tomtilstander + hjelpetekster («?») | forslaget er deterministisk og alltid ≤ manuell rød-andel · tekstpass mot ordboken |

**PORT 1:** full baneguide-matrise {token/uten}×{geometri/uten}×{0/<5/≥5 slag}×{desktop/375}
· kartlast < 2,5 s på 4G-profil · MASTER-SKJERMPLAN-hakene settes · skjermbilder til Anders.

---

## FASE 2 · Flytpakke 2 — friksjonseliminering (prioritert 10/7)

### Spiller-løkka
| # | Oppgave | Kjerne | Verifiseringsport |
|---|---|---|---|
| 2.1 | **«Neste beste handling» på Hjem** | Regelmotor (ren funksjon): kommende økt→Start · uført runde (GolfBox-synk uten føring)→Registrer · søndag/tom uke→Planlegg (m/ Gjenta) · plan PENDING→Godta. Én primær-CTA, resten sekundært | unit-tester per regel (8–10 caser) · klikktest av hver tilstand m/ seedet data |
| 2.2 | **GolfBox auto-import** | Cron (`/api/cron/golfbox-sync`, agent-mønsteret) per spiller m/ GolfBox-kobling · dedup mot eksisterende runder · varsel «Runden fra i går er klar — legg på slag?» | idempotens (kjør 2× = 0 duplikater) · testspiller får runde+varsel · feil-runder kan avvises |
| 2.3 | **Én rundeflyt** | Stepper: score (30 sek) → valgfritt hull-scores → valgfritt slag/plotting. Hurtigskjema+wizard blir ett; gamle innganger redirecter | e2e: tre nivåer av føring gir korrekt Round/HoleScore/Shot · SG-auto trigges kun ved komplett kjede |
| 2.4 | **⌘K-hurtighandlinger + global «+»** | Kommandoer: Ny økt · Registrer runde · Start dagens økt · Plott slag · Lag gameplan | hver kommando lander riktig m/ prefill · tastatur + mobil |
| 2.5 | **Prefill** | Ny økt foreslår forrige tilsvarende (samme akse/ukedag) · runde foreslår sist spilte bane | forslagene kommer fra ekte historikk (aldri fabrikkert) |
| 2.6 | **Tapper → oppsummering** | Ballantall per kølle inn i økt-summary (+ i Analysere/Trening) | tapp → avslutt → summary viser tallene |
| 2.7 | **Summary-kjeding** | «I morgen: [neste økt]» / «Ingen økt — planlegg?» nederst i summary | lenken peker alltid riktig (dagens/neste/ingen) |
| 2.8 | **Push-påminnelser** | Web-push: økt om 1 t · plan venter · runde uført. HARD regel: maks 1/dag, alltid avslåbar | opt-in-flyt · maks-1-regel unit-testet · avmelding virker |
| 2.9 | **Offline-kø (på banen)** | Etter 0.3: taps + plottepunkter i IndexedDB-kø, synk ved nett | flymodus-test: 10 taps + 3 plott → nett på → alt lagret én gang |

### Coach-løkka
| # | Oppgave | Verifiseringsport |
|---|---|---|
| 2.10 | Ett-klikks + batch plan-godkjenning i Cockpit | godkjenn 3 planer på ett klikk → spillere varsles |
| 2.11 | «Send melding» direkte fra stall-rad (prefylt kontekst) | melding lander i spillerens coach-dialog |
| 2.12 | Gruppe-utrulling: planmal → hel treningsgruppe | mal på gruppe m/ 5 spillere → 5 planer, riktig uke, varsler |
| 2.13 | Mandags-digest (agent-OS, cron man. 06:30): mangler plan · venter godkjenning · SG-avvik | digest med EKTE tall i innboks/varsel · tåler tomme uker |

### Gameplan-sirkelen
| # | Oppgave | Verifiseringsport |
|---|---|---|
| 2.14 | Gameplan møter runden: siktet per hull i live-visning · «plan vs. faktisk» per hull etter føring (plottede slag mot sonene/siktet) | spilt testrunde viser avvik per hull · uten gameplan → flaten finnes ikke (ærlig) |

**PORT 2:** hele spiller-løkka gjennomspilles ende-til-ende på demo-bruker (planlegg → tren →
tapper → runde m/ plotting → SG → plan-vs-faktisk) UTEN å taste én avstand og med ≤ 2 trykk
mellom hvert steg · coach-løkka tilsvarende · klikktest-sweep 0 feil.

---

## FASE 3 · Totalgjennomgang til perfeksjon (gjennomgangs- og verifiseringspasset)

| # | Pass | Innhold / verktøy | Bestått når |
|---|---|---|---|
| 3.1 | **Kodegjennomgang** | /code-review (high) på hele leveranse-diffen; funn fikses og re-verifiseres | 0 CONFIRMED korrekthets-funn åpne |
| 3.2 | **Designdommer** | ak-designekspert-kritikkpass (squint/5-sek/tilstander/tommel) på alle berørte skjermer, mobil + desktop | ≥ 9/10 per skjerm; gap meldes, aldri improviseres |
| 3.3 | **Tekst/ordbok** | Alle nye UI-tekster mot `docs/ordbok.json` (Nærspill, enheter «m V/H», sentence-case-akser) | grep-pass + manuell lesning = 0 avvik |
| 3.4 | **Sikkerhet/GDPR** | Eierskapssjekk i alle nye actions · consent-gates (mindreårige) · ingen DECADE-strenger · CSP fortsatt tett · ingen secrets i klient | sjekkliste signert i PR-beskrivelse + `security-review` på diffen |
| 3.5 | **Ytelse** | LCP på Hjem/Analysere/banekart (4G-profil) · bildevekter · unødig force-dynamic | LCP < 2,5 s · kart < 2,5 s |
| 3.6 | **Regresjon** | Full klikktest-sweep (marketing 60 + spiller 120 + coach 130 sider, utvidet med nye ruter) + `npm test` + build | 0 døde lenker/knapper · alle tester grønne |
| 3.7 | **Dokument-synk** | MASTER-SKJERMPLAN-haker · STATUS-NÅ · funksjoner-og-plan · gotchas.md (nye feller) · ak-brain | alle fire oppdatert i SAMME commit som siste leveranse |
| 3.8 | **Beta-prøve** | 2–3 beta-spillere kjører spiller-løkka én uke · feedback-skjema (NPS-komponenten finnes) · funn → hurtigfiks-liste | funn triagert: fiks nå / backlog / avvis med begrunnelse |

**SLUTTPORT:** Anders klikker gjennom begge løkkene selv og sier «perfekt» — eller leverer
avvikslisten som kjøres som hurtigfikser samme dag.

---

## Rekkefølge og [DU]-avhengigheter

```
FASE 0 (½ økt) → FASE 1 (2–3 økter; 1.1 kan starte straks banelisten kommer)
→ FASE 2 (3–4 økter; 2.1–2.3 er kjernen, resten kan paralleliseres)
→ FASE 3 (1 økt + beta-uka løpende)
```

**Venter på Anders (blokkerer merkede steg):**
1. Godkjenn baneguide-mockups + navnevalg (blokkerer 1.2–1.7)
2. Banelisten (blokkerer 1.1)
3. Innboks-nøkler (blokkerer 0.2, 2.13-varsling via e-post)
4. 10 min mobil-UAT (0.4) og 15 min GPS-test ute (1.4)
5. Beta-navn er alt seedet — gi klarsignal for beta-prøven (3.8)

**Ikke i denne planen (bevisst):** lys modus · voice-stats · øvelsesbank-generator ·
onboarding-video · coach-baneguide/bane-admin · betalings-golive (egen sjekkliste 1. august).
