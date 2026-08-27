# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg.

**Sist oppdatert:** 2026-08-27 (B8 + T13 merget — bølge 1 komplett).
Samlet lanseringsplan: **`docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md`** (vinner over MASTERPLAN der de overlapper).

## Hovedbildet 26.08 (målt mot git/kode/prod)

- **Bølge 1 er FERDIG og i main:** Loop 1/2/2S/3S, B2–B7, **B6 (#604)**, **B8 (#612)**.
  RLS kjørt og verifisert aktiv i prod (#593). Alle B-radene i LAUNCH-PLAN §0.2 er nå levert.
  Bølge N (data-bro, PEI-motor, Team Norway) også inne (#605).
- **Train-lock-porten i gang:** T1-skallet (#596), T2-cockpit (#602), T3 Innboks +
  godkjenninger (#609), T4 Stall + Spiller 360 (#608), **T13 Oppsett + Meg (#613,
  inkl. «Spillere ser sin plan»-bryter lagt til etter skjermbilde-gjennomgang 27.08 —
  UI-only placeholder, ikke koblet til ekte data ennå)** alle merget. **T5** vurdert
  27.08: coach-Workbench var allerede fullt Train-lock-portet via D3/B5/B6 (se
  `docs/natt/T5-DONE.md`) — ingen kodeendring nødvendig. Fasit synket fra zip (6) —
  196 filer i `designsystem/train-lock/` (#603). Tokens i kode (#586 + font #597).
- **Faktisk skjermstatus (målt 26.08, `docs/natt/SKJERM-STATUS-2026-08-26.md`):** av 240
  skjerm-ruter er **2 reelt Train-lock** (Cockpit, TrackMan-detalj), **4 blandet** (bl.a.
  coach-Workbench-uka fra D3), **234 fortsatt Paper-innhold** i det nye TL-skallet. Det er
  forventet — T3–T13 og B8 er ikke kjørt — men tallet er nå målt, ikke antatt.
  Remåling: `node scripts/maal-trainlock-status.mjs`.
- **Åpent nå: ingen åpne PR-er.** Etappe 2 i LAUNCH-PLAN §0.2 er komplett (B6, B8, T2,
  T3, T4, T13 alle merget). Neste per planen: etappe 3 — **T10** (Turneringer) og
  **T11** (Innsikt-hub), begge fri avhengighet mot main. **T6** (Plan-hub) kan starte
  siden T5 er avklart. §5T-beslutningskøen (pensjoneringskandidater/klasse B-hull)
  står fortsatt ubesvart og blokkerer deler av T6/T9-scope.

## Hovedbildet 25.08 (historikk)

- Train-lock besluttet som fasit for alle skjermer; Paper supersedert-merket; natt-spec
  arkivert; bølge 1 lå da umerget på grener — alt dette er nå levert, se 26.08-avsnittet.

## Hovedbildet 17.08 (målt, ikke antatt — historikk)

- **Bygg:** `main` er grønn. ~1 390 enhetstester grønne (målt i port-sesjonene 17.08; 977 var tallet 13.08 — testdekningsløftet #488/#489 la til ~400).
- **120 commits / 76 PR-er merget 13.–17.08.** De store sporene:
  - **Integrasjonsbølgen 16.08:** A1–A5 (abonnement v2 med FULL/TALENT/INGEN, Stripe v2 med årspris 2 690, `resolveTilgang` v2, vinn-tilbake, ELITE-lekkasje tettet) · T1–T10 (test-deling, talent-gate, TalentHQ-registrering, TestResult→talentprofil-sync, CANON-avklaring 21 rader, DataGolf inn i Analyse, sync-vaktbikkje, ekstern lesetilgang WANG/Team Norway, terminologi) · G1–G6 (gruppetaksonomi, valgt coach, dedup-utrulling, plan-varsling, trener-i-gruppe, per-trener caps).
  - **Talent-gaten var inert til 17.08:** rot- og mellomlayouter låste `/portal` til FULL (#537, #541 fikset; kontrakttester #539 avdekket det).
  - **Jarvis:** `Sak`-modell + Gmail/iMessage-innsamlere + triage-agent + Telegram-godkjenning + `/meg` (3 av 12 skjermer, #532) + iOS Shortcuts-rute + Perplexity-verktøy. Se `docs/plan-agenticos-jarvis-2026-08-17.md`.
  - **Port-systemfikser:** fase2-rail 1:1 (#500), clay-sweep (#502), delt Composer (#523), inspektørpanel (#524), portrett-lås + «Vri telefonen» (#498), bredde-gate 390px (#497), Paper-fonter/Presis-farger ut (#465/#499).
  - **D-sporet:** ukesrapport i kø (D3), gapping-kart (D5), skoletidsbekreftelse (D6), AK-formel v3-taksonomi med 17 treningsområder + `TestDefinition.omraade` backfill 16/36 (D4).
  - **WANG:** årsplan-flatene redesignet etter Claude Design `6061a53c` (#479) + tre prod-fikser (#486).
- **DB (prod, målt 13.08):** 42 brukere · 38 spillere · 16 med innlogging · 0 push-abonnement · 22 bookinger. Aktiveringsgapet er 13 spillere (verken auth eller invitasjon).

## ⚠ Åpne risikopunkter

1. **PII: `/team-wang` er åpen uten innlogging** (Anders 15.08, «pr nå») — inkl. `/coach` og
   IUP-vurderinger av mindreårige. **PR #490 ligger klar** og lukker eksponeringen (fellessiden
   forblir åpen men navnefri, coach sperres igjen). Trenger Anders' ja. #406 lukkes som overflødig.
2. **`SCREENTEST_PASSWORD` fortsatt kompromittert/uroteret** (hendelsen 03.08). Blokkerer
   sign-off-galleriene — rotasjonsscript ligger i repoet (`scripts/roter-screentest-passord.ts`).
3. **Checklisten og planene spriker:** PAPER-ZIP-CHECKLIST førte 3 skjermer som ubygget som ER
   bygget (rettet 17.08), PIXEL-PERFECT sa PP-A-gaten var åpen mens beslutninger.md sier besvart
   (rettet 17.08). `rutefasit.md` W4 «Utgår»-linje er IKKE en slettliste — PORTPLAN §A0.

## Paper-porten (styrende: PORTPLAN.md + PAPER-ZIP-CHECKLIST.md)

- **40 av 88 aktive fasit-rader signert (45 %)** · 41 `[~]` bygget-men-usignert · 4 reelt ubygget
  (2 blokkert: `wang-logg-inn` på #406/OTP-beslutning, D1 Workbench F4 på DB-ja; D2 er ublokkert
  siden 15.08, D4 mangler ~12 testers backfill).
- **0 av 72 variantruter kvittert** (W3: 9 · W4: 38 · W5: 25). W4s 38 kan kvitteres NÅ — alle
  8 maler er signert.
- **PP-B systemfikser ~80 % ferdig:** B1 rail ✅ · B2 clay delvis (44 filer bruker `enTing`) ·
  **B3 halvveis — `Composer` er ekstrahert men IKKE montert i `V2Shell`** (0 kallsteder på
  `composer=`-propen) · B4 uverifisert · B5 ✅.
- **PORTPLAN (17.08):** 24 mal-fasiter dekker 164 ruter i 54 rader. 25 rader stryker
  én-linje-testen (venter design/beslutning). **Fem sesjoner kan startes uten nye svar:**
  S3 (systemtilstander — PR #549 åpen), S9 (booking-ny), S17 (turneringer), S22 (AgenticOS-hub),
  S23 (agent-detalj). 10 A1-beslutninger venter på Anders (PORTPLAN §A1).
- **Jarvis-fasitene (12 skjermer i `designsystem/paper/jarvis/`) er utenfor checklist-regnskapet**
  — eget spor i PORTPLAN §B6; 3 av 12 portet (+1 i draft #547).
- **Kritisk sti:** rotér screentest-passordet → kjør galleribølgene C1–C7 → kvitter W4-variantene.

## Åpne PR-er (17.08)

| PR | Hva | Venter på |
|---|---|---|
| #549 | Port S3 systemtilstander (felles 404) + login-fiks | Skjermbilde-gate på preview |
| #547 | Jarvis Maskinrommet (skjerm 9/12), draft | Skjermbilde-gate + Anders |
| #542 | Innganger for 13 skjulte PlayerHQ-flater | Skjermbilde-gate (9 skjermer) |
| #534 | AP0 SG-grunnmur (én SG-sannhet, ellipse-bug fikset), draft | Anders (hører til #514-planen) |
| #514 | Plan: egen SG-app + baneguide (AP0–AP6), docs, draft | Anders' ja til planen |
| #490 | WANG PII-fiks (lukker åpen eksponering), draft | **Anders — haster** |
| #406 | Gammel WANG-PR | Lukkes som overflødig når #490 merges |

## Blokkert — P0 før ekte/betalende brukere (uendret spor)

**Hos Anders (panel/DNS):** Resend DKIM for `send.akgolf.no` · `akgolf.no` → Vercel ·
live Stripe-nøkler + webhook-verifisering (13 event-typer, sjekkliste:
`docs/platform/stripe-cutover-sjekkliste.md`, testmodus komplett 16.08 #538) ·
Google Calendar re-kobling · aktiverings-e-post (ekte spiller-adresser må inn — dry-run 13.08
viste 14 «ok» mot syntetiske adresser) · rotér `SCREENTEST_PASSWORD`.

**Kode/data:** aktiveringsflyt for de 13 spillerne uten auth/invitasjon · push-opt-in har motor
og banner, men 0 abonnementer · betaling starter **1. september 2026** (`BETALING_STARTER` i
`src/lib/feature-flags.ts` — `gratisForAlle()` slår av automatisk; verifiser cutover).

**Kjent, bevisst åpent:** CSP-blokkert Turbopack-chunk i prod (konsollstøy, rendrer riktig —
ikke fikset uten bevist effekt, jf. 03.08-målingen).

## Levende kilder (én av hver rolle — start her)

| Rolle | Dokument |
|---|---|
| **Snapshot (denne)** | `docs/STATUS-NÅ.md` |
| **Samlet gjenstående-plan** | `docs/MASTERPLAN-GJENSTAAENDE.md` |
| **Porteringsplan (rekkefølge/blokkeringer)** | `docs/port/PORTPLAN.md` |
| **Status per fasit-fil** | `docs/port/PAPER-ZIP-CHECKLIST.md` |
| **Designdekning** | `docs/port/fasit-liste-paper.md` |
| **Uavklart / parkert / løst** | `docs/AAPNE-SPORSMAAL.md` + PORTPLAN §A1 |
| **Låste forretningsregler** (fasit) | `docs/platform/BUSINESS-RULES.md` |
| **Full plattformkontekst** (5 min) | `docs/platform/AGENT-BRIEF.md` |
| **Lansering** | `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` + `docs/platform/stripe-cutover-sjekkliste.md` (gammel plan arkivert: `docs/port/arkiv/masterplan-lansering-2026-08-12.md`) |
| **AgenticOS + Jarvis** | `docs/plan-agenticos-jarvis-2026-08-17.md` |

Historiske bygg-spor, nattrapporter, gallerier og erstattede planer er slettet 05.08 og
17.08.2026 — de lever i git-historikken, ikke bygg mot dem.

## Ferdig / solid (verifisert, komprimert)

- **Prod kjører** på `akgolf-hq.vercel.app`; push til `main` deployer via Vercel git-integrasjon
  (aldri `vercel deploy --prod` manuelt).
- **PlayerHQ-kjernen:** Hjem/chat, Plan, Analyse (m/ DataGolf-fane + SG-bro), Meg (+ profil,
  utstyr), Workbench V2, live-økt, runde-føring (live + etterregistrering, hull/slag, SG
  server-side), testbatteri med live `TestSession`-scoring (21 CANON-protokoller for spiller).
- **AgencyOS:** cockpit/konsoll (tråd + åtte-punkts rail → nå fase2-rail 7 punkter), innboks
  (m/ Jarvis-sakskø), stall, kalender, godkjenninger, økonomi, AgenticOS-hub — ekte Prisma-data.
- **Domenemotorer m/ tester:** SG (Broadie + Team Norway IUP PUTT), fys-score v1 (stall-relativ,
  plassholder-merket i UI), ak-kategori, test-scoring (15 ScoringKind), talent-sync,
  plan-builder, uke-helpers (Oslo-korrekt).
- **Datapipelines:** GolfBox (timesvis) + GJGT (daglig) + DataGolf (schedule daglig, live hvert
  10. min, skills ukentlig) + sync-vaktbikkje mandager. Se `docs/turnering-datakilder.md` for
  dekningskartet.
- **Foreldreportal** 11/11 ruter ekte data · **GDPR/moderering** bygget · **ekstern lesetilgang**
  (Team Norway/WANG, samtykke-håndhevet) bygget 16.08.

## Verifisert vs. antatt

- **Verifisert 17.08 (kode/git):** alle tall i dette dokumentet om port, PR-er, faner, rail,
  talent-gate og Jarvis er målt mot `main` @ `1f3e127`.
- **DB-tall** er fra målingen 13.08 (mot `DIRECT_URL`, prod) — remåles ved neste aktiveringspush.
- **Antatt / panel (kun Anders kan verifisere):** Stripe live-nøkler, Resend DKIM,
  Google Calendar-tokens, DNS `akgolf.no`.
