# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg.

**Sist oppdatert:** 2026-08-28 kveld (PR #645: TM-04 Analyse-hub + TrackMan-liste reddet,
siste Paper-rester ut, semantisk TL-bro — måling: 214 PORTET · 0 BLANDET · 0 PAPER).
**Samlet lanseringsplan: `docs/LANSERINGSPLAN-KOMPLETT-2026-08-27.md`** — den ENE oversikten
over alt gjenstående. LAUNCH-PLAN-FULL er detaljgrunnlag for T-/C-radene.

## Hovedbildet 28.08 (målt mot origin/main @ 8c00c322d)

- **Bølge 1 FERDIG i main.** RLS aktiv i prod (#593).
- **T-bølgen kodet:** T1–T13 inne (#629 T7/T8, #630 T12-IA). T12 *visuell* AgenticOS-port
  (AO-00/01 piksel) er ikke gjort — bare IA, kø-adresse og redirects.
- **Bølge 2:** C1–C7 + C9 inne. Gjenstår: **C8 (lys-pass, sist)** og **C10 (DataGolf + økonomi)**.
- **Train-lock på produktflatene:** #631 byttet Paper-farger til Train-lock på PlayerHQ,
  AgencyOS, Meg og Forelder (380 filer). Marketing og innlogging urørt. Dette er **ikke**
  piksel-1:1 mot 196 HTML-fasiter. Skjermbilde-gaten (du må SE mobil + Mac, lys + mørk)
  er ikke kjørt.
- **Token-porten FULLFØRT 28.08 kveld (#645):** siste Paper-rester ut av produktflatene
  (AkseKey/fmtSg til nøytral `src/lib/v2/format.ts`, map-colors/agent-strip/PolicyBanner/
  p-stability til TL) + **semantisk TL-bro** i `train-lock-tokens.css` — de ~77 filene med
  gammel Tailwind-semantikk (bg-card/text-primary/…) rendrer nå Train-lock i begge moduser
  via `[data-paper-shell]`-scope. Måling (`scripts/maal-trainlock-status.mjs`, NB: sett ROOT
  til riktig utsjekk): **214 PORTET · 0 BLANDET · 0 PAPER · 4 CHROME-ONLY** (de fire er
  skall-arvede og dermed TL). Piksel-1:1 per fasitfil + skjermbilde-gate gjenstår fortsatt.
- **Analyse-hub TM-04 + TrackMan-liste (#645):** `/portal/analysere` er nå TM-04-fasiten
  (AnalyseHubTrainLock), `/portal/analysere/trackman` ny liste; `/portal/mal/trackman`
  redirect (FULL-guard). Reddet fra glemt commit på `claude/lansering-rest-2026-08-28`.
- **C1 Workbench måned/år** merget #632. Gammel `/admin/spillere/[id]/workbench` redirecter.
- **F1 mandags-bug** fikset i #631 (økter telles ikke lenger to ganger).
- **QA-1** merget #629 (admin-toast, tel-lenke m.m.).
- **P0:** Google Calendar UTFØRT. Åpent: DKIM, DNS, Stripe live, aktiverings-e-post,
  `SCREENTEST_PASSWORD`. **Betaling starter automatisk 1. september.**
- **Bølge N (TalentHQ inn i PlayerHQ):** N1–N3 og N5 inne. Plan gjenopprettet
  (`docs/natt/BOLGE-N-TALENTHQ-INN-2026-08-26.md`). Neste: N4 merge + N6-kvitter.

## Neste steg (lansering)

1. **Anders (kan bare du):** Stripe live · DNS `akgolf.no` · e-post-signatur (DKIM) ·
   aktiverings-e-post · se skjermene · si om TALENT-listen skal strammes.
2. **Kode:** C10 (DataGolf-kort + økonomiside) · C8 lys-pass · T12 visuell AgenticOS ·
   V1 betalings-sjekk · V2 menneskelig røyk-test.

## ⚠ Åpne risikopunkter

1. **Betaling 1. september** uten Stripe live og uten V1-sjekk.
2. **Skjermbilde-gaten** er ikke kjørt — design er kodet, ikke sett av deg.
3. **`SCREENTEST_PASSWORD`** — e2e-spillertester hoppes over i CI til det er avklart.

## Levende kilder (én av hver rolle — start her)

| Rolle | Dokument |
|---|---|
| **Snapshot (denne)** | `docs/STATUS-NÅ.md` |
| **Samlet gjenstående-plan** | `docs/LANSERINGSPLAN-KOMPLETT-2026-08-27.md` |
| **TalentHQ inn i PlayerHQ** | `docs/natt/BOLGE-N-TALENTHQ-INN-2026-08-26.md` (10 steg; eget spor) |
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
