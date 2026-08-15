# Paper zip checklist — kryss når DONE (pixel m390 + d1280)

> Oppdatert: **2026-08-09** etter sync av **Claude Paper (2).zip** → `designsystem/paper/`  
> **Styrende plan:** `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md` (PP-0…PP-10 → 79/79 `[x]`)  
> Gap-rapport: `PAPER-ZIP2-SYNC-2026-08-09.md`  
> Skjermer **uten** fasit: `PAPER-PATTERN-CHECKLIST.md`

**Legend:** `[ ]` ikke portet · `[~]` struktur/PaperChrome (ikke pixel) · `[x]` pixel sign-off

---

## Fase 1 (33)

- [-] `agencyos-agenticos.html` — GJELDER IKKE: gammel rail (før 13.08-beslutningen), erstattet av `fase2/agencyos/agencyos-agenticos-hub.html` (allerede signert NT-433, /admin/agenticos)
- [x] `agencyos-ak-stigen.html` — B4b signert av Anders 14.08.2026 (bygget i #464: tre faner, Én ting nå, ekte Group-kobling. Nytt funn utover fasit: 4 grupper med 46 spillere ukoblet til stigen — vises ærlig, ikke gjettet)
- [x] `agencyos-innboks-mobil.html` — PP-2.2 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `agencyos-innboks.html` — PP-2.2 signert av Anders 13.08.2026 (galleri mot prod)
- [-] `agencyos-innstillinger.html` — GJELDER IKKE: gammel rail, erstattet av `fase2/agencyos/agencyos-oppsett.html` (allerede signert W4-441a/b/c, /admin/settings)
- [x] `agencyos-kalender-mobil.html` — PP-2.4 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `agencyos-kalender.html` — PP-2.4 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `agencyos-konsoll-desktop.html` — PP-2.1 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `agencyos-konsoll-mobil.html` — PP-2.1 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `agencyos-live-session.html` — B4b signert av Anders 14.08.2026 (NY rute /admin/agencyos/live/[sessionId] bygget i #464; /admin/agencyos/live er Mission Control, en annen flate). Inngang: kalenderens detaljpanel → «Åpne live-økt». Kjent grense: SessionRecording.sessionId settes aldri av /api/recording/start, så opptak viser tomt — samme som fasitens eget snapshot
- [x] `agencyos-okonomi.html` — B4b signert av Anders 14.08.2026 (bygget i #464: fasitens fire faner, Mot målet med merket antatt kurs, Hull i tallene som LIVE gap-sjekk — ikke fasitens statiske 02.08-snapshot)
- [x] `agencyos-spillere-mobil.html` — PP-2.3 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `agencyos-spillere.html` — PP-2.3 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `booking.html` — PP-1.7 signert av Anders 14.08.2026 (galleri mot lokalt miljø med BOOKING_PUBLIC=true; prod viser fortsatt Acuity med vilje inntil bryteren slås på i egen beslutning)
- [x] `fangstsheet.html` — B2-fangst signert av Anders 14.08.2026 (galleri mot prod, arket åpnet via klikk)
- [x] `foreldreportal.html` — B2-forelder signert av Anders 14.08.2026 (galleri mot prod, innlogget test-forelder)
- [x] `innlogging.html` — PP-1.6 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `playerhq-analyse.html` — PP-1.3 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `playerhq-booking.html` — PP-1.5 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `playerhq-chat-desktop.html` — PP-1.1 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `playerhq-chat-mobil.html` — PP-1.1 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `playerhq-live-brief.html` — B2-liveb signert av Anders 14.08.2026 (galleri mot prod)
- [x] `playerhq-live-okt.html` — B2-livea signert av Anders 14.08.2026 (galleri mot prod)
- [x] `playerhq-live-summary.html` — B2-lives signert av Anders 14.08.2026 (galleri mot prod)
- [x] `playerhq-meg.html` — PP-1.4 signert av Anders 13.08.2026 (galleri mot prod)
- [x] `playerhq-plan.html` — PP-1.2 signert av Anders 13.08.2026 (galleri mot prod)
- [~] `playerhq-runde-live.html`
- [x] `playerhq-runde-logg.html` — NT-417 signert av Anders 13.08.2026 (galleri mot prod)
- [~] `playerhq-test-gjennomfor.html`
- [~] `spillerprofil.html` — full ombygging merget i #414 (12.08)
- [x] `workbench-desktop.html` — B2-wb signert av Anders 14.08.2026 (galleri mot prod, spiller-workbench d1280)
- [x] `workbench-mobil.html` — B2-wb signert av Anders 14.08.2026 (galleri mot prod, spiller-workbench m390)
- [x] `workbench-turnering.html` — B3-turnering signert av Anders 14.08.2026 (bygget i #463, galleri mot preview). Kollisjonssjekk turnering×periodisering + sesongtidslinje + bekreft-handling. Mobil har bevisst ingen Turnering-fane (PP-3-beslutning, uendret)

## Fase 2 · PlayerHQ W1 (drill/plan/test/turnering)

- [~] `fase2/playerhq/playerhq-drill-detalj.html` — natt 11.08 (#394) READY_SIGN
- [~] `fase2/playerhq/playerhq-drills.html` — tilstands-pass 11.08 (#412)
- [~] `fase2/playerhq/playerhq-feiring.html` — natt 11.08 (#394) READY_SIGN
- [~] `fase2/playerhq/playerhq-fys-plan.html` — natt 11.08 (#394) READY_SIGN
- [~] `fase2/playerhq/playerhq-live-tapper.html` — bygget (#398), fiks merget i #413 (11.08)
- [~] `fase2/playerhq/playerhq-okt-detalj.html` — bygget (#399), fiks merget i #413 (11.08)
- [~] `fase2/playerhq/playerhq-teknisk-plan.html` — tilstands-pass 11.08 (#412)
- [~] `fase2/playerhq/playerhq-test-detalj.html` — tilstands-pass 11.08 (#412)
- [~] `fase2/playerhq/playerhq-tester-hub.html` — tilstands-pass 11.08 (#412)
- [~] `fase2/playerhq/playerhq-turnering-detalj.html` — bygget (#398), fiks merget i #413 (11.08)
- [~] `fase2/playerhq/playerhq-turneringer.html` — bygget (#398), fiks merget i #413 (11.08)

## Fase 2 · W2 Analysere-dybde (ny i zip 2)

- [~] `fase2/playerhq/playerhq-analyse-hull.html` → AnalysereHullV2
- [~] `fase2/playerhq/playerhq-runder-liste.html` → RunderV2
- [~] `fase2/playerhq/playerhq-runde-detalj.html` → RundeDetaljV2
- [~] `fase2/playerhq/playerhq-gameplan-liste.html` → GameplanV2
- [~] `fase2/playerhq/playerhq-gameplan-banekart.html` — bygget 11.08 (#408)
- [~] `fase2/playerhq/playerhq-datagolf.html` → DataGolfV2 — pixel-pass (#411)
- [~] `fase2/playerhq/playerhq-trackman-liste.html` — bygget 11.08 (#405)
- [~] `fase2/playerhq/playerhq-trackman-detalj.html` — bygget 11.08 (#405), fiks merget i #414 (12.08)
- [~] `fase2/playerhq/playerhq-putte-lab.html` → PutteLabV2 — pixel-pass (#409)
- [~] `fase2/playerhq/playerhq-historikk-filter-sheet.html` — bygget 11.08 (#407)
- [~] `fase2/playerhq/playerhq-hjem-rest.html` — bygget 11.08 (#407)
- [~] `fase2/playerhq/playerhq-hjem-varsler.html` — bygget 11.08 (#407)

## Fase 2 · W3 Meg/Booking/Talent/Coach (ny i zip 2)

- [~] `fase2/playerhq/playerhq-innstillinger.html`
- [~] `fase2/playerhq/playerhq-abonnement.html` → MegAbonnementV2
- [~] `fase2/playerhq/playerhq-helse.html` → MegHelseV2
- [~] `fase2/playerhq/playerhq-booking-ny.html` → BookingNyV2
- [~] `fase2/playerhq/playerhq-booking-mine.html`
- [x] `fase2/playerhq/playerhq-coach-hub.html` — NT-415 signert av Anders 13.08.2026 (galleri mot prod)
- [~] `fase2/playerhq/playerhq-talent.html` → TalentV2

## Fase 2 · W4 AgencyOS (ny i zip 2)

- [x] `fase2/agencyos/agencyos-godkjenninger.html` → AdminGodkjenningerV2 — W4-437a/b/c signert av Anders 14.08.2026 (galleri mot prod: godkjenninger, handlingssenter, oppfølgingskø)
- [x] `fase2/agencyos/agencyos-gruppe-detalj.html` → GruppeDetaljV2 — W4-440a signert av Anders 14.08.2026 (galleri mot prod)
- [x] `fase2/agencyos/agencyos-bookinger.html` → AdminBookingerV2 — W4-438a/b signert av Anders 14.08.2026 (galleri mot prod: bookinger, ny booking)
- [x] `fase2/agencyos/agencyos-planbibliotek.html` — NT-416a signert av Anders 13.08.2026; tilleggsruter W4-442a/b (økter, ny planmal) signert 14.08.2026
- [x] `fase2/agencyos/agencyos-turneringer.html` — NT-416b signert av Anders 13.08.2026; tilleggsruter W4-442c/d (ny turnering, dubletter) signert 14.08.2026
- [x] `fase2/agencyos/agencyos-oppsett.html` → AdminSettingsV2 — W4-441a/b/c signert av Anders 14.08.2026 (galleri mot prod: innstillinger, GDPR-kø, audit-logg)
- [x] `fase2/agencyos/agencyos-agenticos-hub.html` — bygget natt 13.08 (#433); NT-433 signert av Anders 14.08.2026 (galleri mot prod)
- [x] `fase2/agencyos/agencyos-agent-detalj.html` — bygget natt 13.08 (#435); NT-435 signert av Anders 14.08.2026 (galleri mot prod)

## Fase 2 · W5 Marketing/Auth/Forelder/System (ny i zip 2)

- [~] `fase2/marketing/marketing-side.html` (wave I clay)
- [x] `fase2/marketing/marketing-katalog.html` — NT-418a/b signert av Anders 13.08.2026 (galleri mot prod)
- [~] `fase2/auth/auth-flyt.html` → LoginV2 m.fl.
- [~] `fase2/auth/auth-samtykke.html` → GuardianConsentV2
- [~] `fase2/forelder/forelder-barn.html`
- [x] `fase2/system/system-tilstander.html` — NT-418c signert av Anders 13.08.2026 (galleri mot prod)

## Fase 2 · W6 WANG + GFGK (eget chrome — ikke Paper-shell)

- [~] `fase2/wang/wang-coach-arsplan.html` — pixel-pass natt 12.08, merget i #419 (layoutspørsmål til Anders står åpent)
- [ ] `fase2/wang/wang-logg-inn.html` — BLOKKERT: filene eies av åpen #406 + fasitens OTP-flyt er produktbeslutning
- [x] `fase2/gfgk/gfgk-kalender.html` — NT-419b signert av Anders 13.08.2026 (galleri mot prod)
- [~] `fase2/gfgk/gfgk-veileder-artikkel.html` — pixel-pass natt 12.08, merget i #419

## Templates (struktur) — GJELDER IKKE (Anders' beslutning 14.08.2026)

De åtte `.dc.html`-filene er Open Design-komponentkontrakter (maler for designverktøyets
egen plukker), ikke skjermfasiter, og skal IKKE portes til kode. Fasiten selv stempler
mappen som historikk (`designsystem/paper/templates/_UTGÅTT.md`, 01.08.2026): alt innholdet
er erstattet av `fase1/`-skjermene, som allerede er bygget. Filtypeforklaring:
`designsystem/paper/guidelines/kompilerte-filtyper.md`. Radene beholdes som historikk:

- [-] `templates/agencyos-alt/AgencyosAlt.dc.html` — gjelder ikke
- [-] `templates/agencyos-dashboard/AgencyosDashboard.dc.html` — gjelder ikke
- [-] `templates/agencyos-hjem/AgencyosHjem.dc.html` — gjelder ikke
- [-] `templates/agencyos-kalender/AgencyosKalender.dc.html` — gjelder ikke
- [-] `templates/agencyos-ko/AgencyosKo.dc.html` — gjelder ikke
- [-] `templates/agencyos-stall/AgencyosStall.dc.html` — gjelder ikke
- [-] `templates/agencyos-workbench/AgencyosWorkbench.dc.html` — gjelder ikke
- [-] `templates/playerhq-idag/PlayerhqIdag.dc.html` — gjelder ikke

---

## D1–D6 · Funksjonspotensial (ny i zip 4 — 14.08.2026)

Seks leveranser fra `Plan - skjermer for funksjonspotensialet.html`. Kvitteringer per leveranse
i `designsystem/paper/kart/`. Arbeidsordre: `kart/prompt-code-session-implementering.md`.
**Steg 0 er kjørt** — funn i `docs/taksonomi-verifikasjon.md` + `docs/fasit-avvik.md`.

- [ ] **D1 · Workbench F4** — `fase1/workbench-desktop.html` + `-mobil` + `workbench-stall(-mobil)`
      (composer→ghost, periodiseringsforslag, faktisk-mot-planlagt + etterlevelse).
      DELVIS BLOKKERT: `SessionStatusV2` mangler utkast-tilstand, økt mangler publiserings- og
      faktisk-tid-felter. `SKIPPED` finnes — hoppet-mot-ulogget kan bygges i dag.
- [ ] **D2 · Booking → faktura** — `fase2/agencyos/agencyos-okonomi.html` + `playerhq-betaling.html`.
      Kjeden finnes (`Booking.trainingSessionV2Id` → `Payment.bookingId`). ÅPENT: «forfalt» er
      ingen `PaymentStatus` og har ingen forfallsdato — hentes fra Stripe eller nytt felt.
- [~] **D3 · Ukesrapport + digest** — `agencyos-godkjenninger.html` + `playerhq-ukesdigest.html`
      + `forelder-barn.html`. BYGGET 15.08.2026: ukesrapport-kortet som leseelement i køen
      (info-kant, ingen Godkjenn-knapp), NY rute `/portal/ukesdigest`, og ukerapport-kortet i
      foreldreportalen. Etterlevelsen regnes ett sted (`src/lib/domain/etterlevelse.ts`) så
      alle tre flatene viser samme tall med samme nevner. Deling persisteres i ny tabell
      `ukesrapport_delinger` (Anders godkjente 15.08) — manuell coach-handling, aldri automatikk.
      **Venter på pixel-signering:** rapportkortet kunne ikke fotograferes med ekte data
      (testcoachens stall har 0 økter denne uka → kortet skjules med vilje).
      Avvik fra fasit, bevisst: testforfall viser forfallsdato uten «intervall N uker», fordi
      intervallet ikke finnes i basen (`TestAssignment` har kun `dueDate`).
- [ ] **D4 · Test → drill + forfall** — `playerhq-test-detalj.html` + `playerhq-hjem-varsler.html`
      + `workbench-desktop.html`. **BLOKKERT:** `TestDefinition` har kun `pyramidArea`, ingen
      områdekode — oppslag i delt taksonomi er umulig. Krever ett additivt felt + Anders'
      backfill av 36 testdefinisjoner.
- [~] **D5 · Gapping** — `fase2/playerhq/playerhq-gapping.html`. BYGGET 15.08.2026 (PR #474).
      Rute: `/portal/mal/trackman/gapping` — IKKE `/portal/trackman/*`, som redirecter
      permanent til Analyse (`next.config.ts`). Flaggregelen (gap > 22 m, begge køller
      ≥ 20 slag, driver unntatt) ligger i `src/lib/domain/gapping.ts` med 12 tester.
      Køllelista utledes fra TrackMan-dataene, ikke fra `EquipmentBag` (fritekst).
      Basen hadde 0 TrackManShot-rader — `scripts/seed-screentest-trackman.ts` seeder
      431 slag på 12 køller for screentest-spilleren (idempotent, `--slett` reverserer).
      **Venter på pixel-signering.**
- [~] **D6 · Skoletidsbekreftelse** — `fase2/forelder/forelder-barn.html`. BYGGET 15.08.2026.
      Skoletid-kort i barn-lista: timeplan (slått sammen til «Man–tor»/«Fredag»), status,
      Bekreft/Endre. Semesterlogikken i `src/lib/domain/skoletid.ts` med 8 tester —
      høst = juli–desember, vår = januar–juni, og en bekreftelse arves ALDRI til neste
      semester. Klokkeslettene leses fra `PlayerBusyBlock` (kind SKOLE, recurring WEEKLY);
      bekreftelsen lagres i ny tabell `skoletid_bekreftelser` (Anders godkjente 15.08).
      **Ikke fotografert:** Playwright-nettleseren manglet lokalt, og installasjonen ble
      avbrutt. Skjermbilde-gaten er derfor IKKE kjørt for denne.

---

## Sync-metadata

| | |
|---|---|
| Zip | Claude Paper (2) |
| Speil | `designsystem/paper/` |
| Tokens app | `src/styles/paper-tokens.css` ≡ v3.1 |
| Logo | `public/logos/paper/` |
| Gap | `docs/port/PAPER-ZIP2-SYNC-2026-08-09.md` |
