# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg.

**Sist oppdatert:** 2026-08-27 kveld (alt av T9/C2/C3/C4/C5 + T6 #620 + T13-detaljer #619
merget — 0 åpne PR-er; samlet plan skrevet).
**Samlet lanseringsplan: `docs/LANSERINGSPLAN-KOMPLETT-2026-08-27.md`** — den ENE oversikten
over alt gjenstående (sesjoner, web-QA, P0, beslutninger). LAUNCH-PLAN-FULL er detaljgrunnlag
for T-/C-radene.

## Hovedbildet 27.08 kveld (målt mot origin/main @ 4a7e7987)

- **Bølge 1 er FERDIG og i main:** Loop 1/2/2S/3S, B2–B8. RLS kjørt og verifisert aktiv i
  prod (#593). Bølge N (data-bro, PEI-motor, Team Norway) inne (#605).
- **T-bølgen nesten i mål:** T1–T6, T9–T11, T13 (+detaljer #619) og T4-rest alle merget.
  T5 krevde ingen kode (allerede portet via D3/B5/B6). Gjenstår: **T7, T8, T12** (T12 venter
  på C6+C7).
- **Bølge 2 i gang:** C2 (#624), C3 (#623), C4 (#627), C5 (#625) merget 27.08. Gjenstår:
  C1, C6, C7, C8 (sist), C9, C10.
- **Målt skjermdekning (27.08 kveld):** 327 ruter → 45 PORTET / 7 BLANDET / **77 PAPER** /
  95 chrome-only / 102 redirect. Største udekkede gap: **/portal har 53 Paper-ruter**
  (Meg-familien, live-løypa, mal/analyse, tren-resten) — P-bølgen i den samlede planen
  dekker dem. NB: `scripts/maal-trainlock-status.mjs` har hardkodet ROOT til hovedmappen —
  sjekk hvilken gren hovedmappen står på før du stoler på tallene.
- **Ingen åpne PR-er.** Alle §5T-beslutninger lukket 27.08 (`docs/natt/D-LYS-OG-5T-BESLUTNING.md` §0).
- **Web-QA målt (20-punktsliste, se samlet plan §3):** to røde — sonner-toasts rendres aldri
  (ingen `<Toaster/>` montert; admin-writes gir ingen bekreftelse) og kontaktsidens
  telefonnummer er ikke klikkbart. Fikses i QA-1-sesjonen.
- **P0-status:** Google Calendar re-kobling UTFØRT. Åpent: DKIM, DNS (`akgolf.no` +
  vedlikeholdsmodus av), Stripe live-cutover, aktiverings-e-post (ekte adresser mangler),
  `SCREENTEST_PASSWORD` (kildekonflikt — MASTERPLAN sier rotert 17.08, LAUNCH-PLAN sier åpen;
  Anders avklarer). **Betaling starter automatisk 1. september** (`BETALING_STARTER`).

## Neste steg

T7 (kalender) · T8 (grupper) · QA-1 (web-hygiene) i parallelle worktrees → C6 + C7 → T12.
Full rekkefølge og alle gjenstående sesjoner: `docs/LANSERINGSPLAN-KOMPLETT-2026-08-27.md` §2.

## ⚠ Åpne risikopunkter

1. **`SCREENTEST_PASSWORD`-kildekonflikt** (se P0 over) — blokkerer e2e-secrets i CI
   (427 spillertester hoppes over).
2. **Admin-writes uten synlig bekreftelse** (sonner aldri montert) — brukeropplevd
   «skjedde det noe?» på godkjenninger/Workbench-lagring. QA-1 fikser.
3. **Betalings-cutover 1. september er 5 dager unna** med 5 av 6 P0-punkter åpne —
   V1-verifiseringen (test-clock, talent-gate i prod, push-opt-in) er ikke kjørt.

## Levende kilder (én av hver rolle — start her)

| Rolle | Dokument |
|---|---|
| **Snapshot (denne)** | `docs/STATUS-NÅ.md` |
| **Samlet gjenstående-plan** | `docs/LANSERINGSPLAN-KOMPLETT-2026-08-27.md` |
| **T-/C-rad-detaljer** | `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` |
| **Designfasit (alle skjermer)** | `designsystem/train-lock/DESIGN-SYSTEM.md` + `SCREEN-INDEX.md` |
| **Uavklart / parkert / løst** | `docs/AAPNE-SPORSMAAL.md` |
| **Låste forretningsregler** (fasit) | `docs/platform/BUSINESS-RULES.md` |
| **Full plattformkontekst** (5 min) | `docs/platform/AGENT-BRIEF.md` |
| **Stripe-cutover** | `docs/platform/stripe-cutover-sjekkliste.md` |
| **AgenticOS + Jarvis** | `docs/plan-agenticos-jarvis-2026-08-17.md` |
| **Arkiv: den avsluttede Paper-porten** | `docs/arkiv/paper-port/` (rutekartlegging med referanseverdi) |

Historiske bygg-spor, nattrapporter, gallerier og erstattede planer er slettet 05.08, 17.08
og 27.08.2026 (opprydding) — de lever i git-historikken, ikke bygg mot dem.
`docs/MASTERPLAN-GJENSTAAENDE.md` (17.08) er supersedert som samlet oversikt av den nye
planen; PR-tabellen og steg 0-listen der er utdatert (alle PR-ene merget 17.08).

## Ferdig / solid (verifisert, komprimert)

- **Prod kjører** på `akgolf-hq.vercel.app`; push til `main` deployer via Vercel git-integrasjon
  (aldri `vercel deploy --prod` manuelt). `akgolf.no` står i vedlikeholdsmodus (#574) til DNS-cutover.
- **PlayerHQ-kjernen:** Hjem/chat, Plan, Analyse (m/ DataGolf-fane + SG-bro), Meg (+ profil,
  utstyr), Workbench V2 (uke + kilder/drag/serie + godta/avvis), live-økt, runde-føring
  (live-artefakt fra C5, hull/slag, SG server-side m/ EST-merking), testbatteri med live
  `TestSession`-scoring + Gate/Innspill-artefakt (C4), TrackMan DispersionMap (B7).
- **AgencyOS:** TL-skall (AX-01, 5 destinasjoner), cockpit, innboks + godkjenninger, stall
  (+ dag-visning C2), Spiller 360, kalender-lag (C3), live-tavle + TrackMan (T9), turneringer
  (T10), Innsikt-hub (T11), plan-hub (T6), oppsett + Meg (T13) — alt Train-lock.
- **Domenemotorer m/ tester:** SG (Broadie + Team Norway IUP PUTT), fys-score v1 (stall-relativ,
  plassholder-merket i UI), ak-kategori, test-scoring (15 ScoringKind), talent-sync,
  plan-builder, uke-helpers (Oslo-korrekt), PEI/scorekort (N3), Tripletex-klient (read-only).
- **Datapipelines:** GolfBox (timesvis) + GJGT (daglig) + DataGolf (schedule daglig, live hvert
  10. min, skills ukentlig) + sync-vaktbikkje mandager. Se `docs/turnering-datakilder.md`.
- **Foreldreportal** 11/11 ruter ekte data (design-port gjenstår, F1) · **GDPR/moderering**
  bygget · **ekstern lesetilgang** (Team Norway/WANG, samtykke-håndhevet) bygget 16.08.

## Verifisert vs. antatt

- **Verifisert 27.08 (kode/git):** merge-status, skjermdekning, QA-punktene og PR-tilstand er
  målt mot `origin/main` @ `4a7e7987` + `gh pr list`.
- **DB-tall** er fra målingen 13.08 (mot `DIRECT_URL`, prod) — remåles ved neste aktiveringspush.
- **Antatt / panel (kun Anders kan verifisere):** Stripe live-nøkler, Resend DKIM,
  DNS `akgolf.no`, SCREENTEST-rotasjonens faktiske tilstand.
