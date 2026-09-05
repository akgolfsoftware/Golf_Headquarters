# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg.

**Sist oppdatert:** 2026-09-05 (prosjektrevisjon — målt mot `origin/main` @ `a653a3afd`, PR #783, prod-DB lesende, Vercel env-navn, GitHub. Fullt grunnlag: `docs/beslutningsgrunnlag/prosjektrevisjon-2026-09-05.md`).
**Betaling:** koden er klar siden 30.08 (Stripe-cutover 1. september). Live-nøkler/DNS/DKIM er
Anders-oppgaver i Vercel/Stripe-panelet og kan ikke verifiseres fra kode/git — se
`docs/MASTERPLAN-GJENSTAAENDE.md` STEG 1 og 10.8.
**Samlet lanseringsplan: `docs/MASTERPLAN-GJENSTAAENDE.md`** — den ENE oversikten
over alt gjenstående (konsolidert 30.08 fra det tidligere LANSERINGSPLAN-KOMPLETT + LAUNCH-PLAN-FULL, begge slettet).
**Produktretning låst 30.08:** `.claude/rules/beslutninger.md` §«PRODUKTRETNING — åtte svar».
Den blokken er fasit for Innsikt og Analyse og vinner over eldre dokumenter.

## Hovedbildet 05.09 (prosjektrevisjon — målt mot origin/main @ a653a3afd, 57 PR-er merget siden 01.09)

- **Milepælen «FULL lanserbar» er flyttet fra tor 24.09 til tor 11.09** (24.09 = siste frist).
  13 av 16 økter i STEG 1B var levert 04.09. Gjenstår: Ø1-rest (årspris-id), 0.4 (TALENT-sonde),
  **Ø2 ekte kjøp — IKKE gjort** (0 abonnement med Stripe-id i prod 05.09), Ø13 (PR #771 draft,
  urørt siden 03.09) og Ø16 (røyk-test, Anders). Ny dato per økt i MASTERPLAN 1B.
- **`STRIPE_PRICE_ID_PRO_AAR` mangler fortsatt i Vercel production** (remålt 05.09) — årsplanen
  kan ikke kjøpes.
- **Prod-basen 05.09:** 41 brukere (39 test, 2 ekte: Anders + Markus), 0 ekte spillere,
  33 PLAYERHQ + 6 COACHING aktive abonnement (alle seedet), 0 kjøp, `daily_active_users` sist
  02.09, TrackMan 431 slag med 0 Ball Speed (0.14 uendret), `test_shots` finnes ikke (N4),
  `drift_rutiner` 6 rader, `tn_posts` 0, `clubName` fylt på 382 av 398 497 entries, 2 push-abonnement.
- **Kodehelse:** `tsc` grønn, `eslint` grønn, `npm test` 2030/2030, 475 ruter.
- **Design 05.09:** 146/210 fasiter sitert (ned fra 148), 5/12 rigg-rader kalibrert, 98/104
  familier uten rigg-rad, mekanisk audit uendret siden 04.09 (laveste `portal/planlegge` 3,2),
  markedssider **0 av 18 portert** etter fundamentet #775. Datert designplan i fire spor:
  MASTERPLAN **2.13**.
- **STRANDET ARBEID — STEG 19.6/19.7:** grenen `feat/steg-19-6-19-7-kontrast-tallhero` finnes
  kun lokalt i hovedmappa (`~/Developer/akgolf-hq`): én upushet commit (03.09) + **150
  ukommitterte filer**. Ingen PR. `useCountUp` står fortsatt i `core.tsx:284` i main — linjen
  under (03.09) om at TallHero «slutter å telle opp» var feil. Sweepen bytter signalfarge til
  `TL.text` i stedet for til et par som består — må gjennomgås før PR (beslutningskø 30).
- **Ingen retro i `docs/feillogg.md` etter 02.09** tross 15 PR-er 03.–05.09.

## Hovedbildet 03.09 (historikk — målt mot origin/main @ 8197eb3 — 14 PR-er merget siden 02.09 kveld, #754–#768)

- **D1–D4 (beslutningskø fra 02.09) alle svart og gjennomført samme dag:** D1 Plan-fasit
  (PH-07/08) → Ø4 sign-off gjort (#767, restavvik forklart: `getDashboardData()` bruker ikke
  `hentEffektivNaa()`, ikke en layout-feil). D2 Workbench-kanon (WB-serien) → Ø9–Ø10 gjort
  (#762, #764). D3 Spiller 360 = én adresse `/admin/spillere/[id]` → Ø11–Ø12 gjort (#766,
  bento-landing med identitet/nøkkeltall/ukeaktivitet/plan-fremdrift/«Nå»-kort — skjermbilde
  med ekte data mangler fortsatt, ingen spillere i stallen ved byggetidspunktet). D4 TM-03
  (behold 4-stegs-modalen) → tredje importkilde levert (#768): «Foto av skjerm» sender bildet
  til Claude vision (`parseTrackManPhoto`, TruthLayer-strengt — null ved usikkerhet), gjenbruker
  resten av import-flyten uendret.
- **STEG 19 (designkvalitet, Anders-beslutning 03.09) bygget samme økt (#763, #765):**
  `scripts/design-audit.mjs` (mekanisk poeng per skjermfamilie) + `check-tl-kontrast.mjs`
  (fant 12 kontrastbrudd i Train-lock lys modus — Vei A valgt: regel om hvor signalfarger kan
  stå, ingen `--tl-*`-verdi endret) + bro-dokument fra AK Golf-masteren. ~~`TallHero` slutter å telle opp (`useCountUp` fjernet der, urørt tre andre steder).~~ **RETTET 05.09: dette ble aldri merget** — arbeidet ligger upushet i hovedmappa (se 05.09 over); kun beslutningen (#765, docs) er i main.
  Beslutningskø punkt 25 og 26 lukket.
  **Design-skills skrudd på globalt (#757, #761):** impeccable, design-taste-frontend,
  high-end-visual-design + 25 motion/konsistens-skills — se CLAUDE.md §Skill-bruk.
- **14.5A (gruppe→spiller-utsending pålitelig) FERDIG (#764):** siste del A — løkken i
  `apply-template-actions.ts` kjører nå i én `prisma.$transaction`, med rollback-regresjonstest.
- **Ø14/Ø15 re-verifisert (#758):** stallen var tom fordi 37 demo-spillere manglet
  `PlayerEnrollment` — ikke fordi basen var nullstilt. Seed-scriptet utvidet, 37 aktive
  enrolleringer kjørt inn.
- **Ø17 (WB-06 årsplan) rettet (#756):** inneværende måned fremheves i coachens årsplan.
- **Retro ført (#760):** Ø14/Ø15-dobbeltarbeid, tom demo-stall, gh-merge-støy — se `docs/feillogg.md`.

## Hovedbildet 02.09 kveld (historikk — målt mot origin/main @ 0675752e3, PR #737–#753)

- **Veien til «FULL lanserbar» (STEG 1B, milepæl 24.09) ligger FORAN skjema:** Ø1 (delvis),
  Ø3, Ø4–Ø8 (PR #750), Ø9 (PR #751) og Ø10 (docs, PR #754) er levert 02.09 — datert til
  8.–16.09. Gjenstår i F0/F1/F2: Ø2 (ekte kjøp fre 04.09, Anders), Ø11–Ø13 (Spiller 360,
  venter på D3-canvas-ja 17.09), Ø14–Ø15 (Stall/Kommunikasjon sign-off), Ø16 (røyktest).
- **Betaling (Ø1, målt i prod 02.09):** Stripe står i LIVE. `STRIPE_PRICE_ID_PRO_AAR` mangler
  fortsatt i Vercel production → årsplanen gir 500. Innebygd Stripe Elements-kortskjema (PR #745)
  er verifisert isolert, ikke gjennom innlogget flyt (0 aktive abonnement etter nullstillingen).
- **PORTPLAN §A1 lukket (PR #738–#745):** A1.4 (5 bookingsteg beholdt), A1.5 (GruppeFaner
  beholdt), A1.7 (Stripe Elements), A1.9 (`/portal/meg/utstyr` kanonisk).
- **Levert samme kveld av parallelle økter:** dobbel V2-speil-økt ved samtidige kall fikset
  (14.5A, #747) · daglig aktiv-måling `daily_active_users` (16.3, #748) · nattlig refresh-cron
  for `mv_topar_grunnlag` (16.1, #749) · foreldre booker time for barnet (9.8, #752) ·
  Claude Code-plugins + skill-regler i CLAUDE.md (#753).
- **Beslutninger 02.09 (PR #739, #746):** D1 Plan = PH-07/08 · D2 Workbench = WB-serien ·
  D10 Ø2 = ekte kjøp · WANG får eget merkevaresystem (overstyrer paraply-klausulen) ·
  AK-formel v3 skrotet.
- **AK Golf-designsystemet (PR #742):** revidert 5,9/10 og løftet — `tokens.json` er eneste
  kilde, `ak-golf-tokens.mjs` + `check-ak-golf-kits.mjs` kjører i `npm run verify`.
- **Dokumentrevisjon (PR #737):** MASTERPLAN, STATUS-NÅ, CLAUDE.md, gotchas.md og alle
  `docs/platform/*.md` rettet mot kode/git (~25 avvik).
- **PR #716 (paraplymerke/MORAD ut av publikumsvendt tekst) er MERGET 02.09** — ingen åpne
  PR-er fra før 02.09 igjen. Grenen `feat/steg-15-11-stall` (PR #709, lukket uten merge —
  innholdet kom via #710) er slettet lokalt og på GitHub.
- **15.13 del 4 (PR #755):** talent-kjeden har faner, booking-detaljene har lenker inn.
  Gjenstår i 15.13: SG-hub coach-modus (krever Anders).

## Hovedbildet 02.09 morgen (historikk — målt mot origin/main @ c40d57b40)

- **STEG 15 FERDIG (12 av 13 rader, PR #689–#713):** AgencyOS konsolidert til «én inngang per
  funksjon» — Kø, Oppgaver, Oppsett, Kalender, Jarvis, Turnering, Kommunikasjon, Analyse, Plan,
  Hjem og Stall-lista er nå hver sin ene adresse med faner, gamle adresser er redirects.
  Talent-flatene er flyttet ut av AgencyOS-menyen til `/innsyn` (PR #713). Gjenstår: 15.13, de
  36 skjermene uten vei inn — tre deler levert, resten (talent-kjeden i PlayerHQ, SG-hub
  coach-modus, booking-detaljer, ~7 uverifiserte «redirect til seg selv»-endepunkter) står igjen.
- **Team Norway Workdesk-grunnmur levert (STEG 17, PR #726/#727, 01.09):** poster til gruppe og
  enkeltspiller (`TnPost`/`TnPostAttachment`/`TnPostLesekvittering`, `src/lib/domain/tn-post.ts`),
  dokumentdeling med lesekvittering, samtykke-brytere (tester/resultater vs. komplett profil) på
  `/portal/meg/innstillinger/personvern/deling` og `/forelder/samtykke/deling/[childId]`. TN-
  branding-mappa vokst til 152 filer etter Claw batch 3 (PR #725).
- **16.6/17.5b: klubb og klassekode sluttet å bli kastet i GolfBox-scraperen (PR #723).**
  `PublicPlayerEntry.clubName`/`klasseNavn` er additive kolonner, fylles fra neste synk.
- **Train-lock sign-off-riggen bygget (PR #731/#732, 01.09):** kvantitativ pixel-diff mot fasit
  (`scripts/train-lock-pixel-diff.mjs`, `tests/visual/`) — 5 av 9 rutekartlagte skjermer
  kalibrert med målt restavvik, 4 dokumentert ukalibrerbare (bl.a. AO-01 mot pensjonert
  AgenticOS-rail). Kjører ikke i CI. Erstatter ikke skjermbilde-galleriet, supplerer det.
- **Fasit-dekning (piksel-nærhet): 148/210 sitert** (opp fra 114/204 30.08 — kjør
  `node scripts/maal-fasit-dekning.mjs` for fersk status).
- **Diverse opprydding (PR #729/#730/#733/#734):** synk av Train-lock-zip og pensjonerte
  doc-referanser rettet, Club Speed-klassifisering presisert i v2-vokabularet, tre stale
  MASTERPLAN-rader rettet, feilmelding lagt til når bytt-tid på booking avvises (i stedet for
  stille redirect).
- **Én åpen PR:** #716 (paraplymerke/MORAD ut av publikumsvendt tekst), åpnet 31.08 — **merget 02.09 07:04**.

## Hovedbildet 30.08 natt (historikk — målt mot origin/main @ 5102448a9)

- **Betaling omlagt (#664, #667-kjeden).** Prøveuka bor nå i STRIPE og krever kort
  (`trial_period_days`, kun ved første PlayerHQ-abonnement). Den usynlige prøven
  (registreringsdato + 30 dager, uten kort) er FJERNET fra `resolveTilgang`. Nye spillere
  opprettes med `profilType: "TALENT"` og lander på gratisnivået — aldri INGEN.
  Alle 38 eksisterende spillere er backfillet til TALENT i prod; 15 som ble lovet én måned
  fikk eksplisitt `trialEndsAt`. Målt etterpå: **0 spillere blir stengt ute 1. sep.**
- **Feil funnet og rettet på veien:** `kind` ble satt av `plan === "pro"` alene, så
  årsabonnementet `pro_aar` (2 690 kr) havnet på COACHING-raden. Ville slått til første gang
  noen kjøpte årsplanen.
- **Turneringsstatus retter seg selv:** `lukkUtloepteTurneringer()` kalles fra live-jobben
  (hvert 10. min). Fem fastlåste «pågår»-rader ryddet i prod, én med «AVLYST» i navnet.
- **Innsikt steg 1 (#666):** «hvor taper spilleren slag, målt mot SEG SELV» på
  `/admin/spillere/[id]/analyse`. Ren domenefunksjon `sammenlignMedSegSelv` med støygrense
  (0,05 slag) så tilfeldighet ikke utropes til funn.
- **Spillerens turneringshistorikk (#666):** `/portal/analysere/turneringer`, delt komponent
  med coach-speilet. Dataene lå ubrukt: 9 koblede spillere har 24–59 turneringer hver.
- **Fasit-dekning: 114/204** (opp fra 105). PX-7 inne via #667.
- **Fire duplikat-adresser pensjonert** (#664): `(legacy)/foresporsler`,
  `(legacy)/spillere/[id]/tildel-test`, `mal/trackman/[id]` (309 linjers parallell
  implementasjon), `mal/bygger`. 348 → 344 ekte skjermer.

## Hovedbildet 28.08 (historikk — målt mot origin/main @ 8c00c322d)

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
  `SCREENTEST_PASSWORD`. **Betaling starter automatisk 1. september.** (Rotert av Anders
  17.08 — se MASTERPLAN STEG 0.2. Denne linjen sto som «åpent» lenge etter at det var gjort.)
- **Bølge N (TalentHQ inn i PlayerHQ):** N1–N3 og N5 inne. Plan gjenopprettet
  (`docs/MASTERPLAN-GJENSTAAENDE.md` STEG 11). Neste: N4 merge + N6-kvitter.

## Neste steg (05.09)

1. **Anders, man 08.09 (én økt, alt i betaling):** gi `price_`-id for årsplanen · si ja til
   TALENT-sonden · **ekte kjøp 299 kr** med eget kort (Ø2) → verifiser webhook → FULL → oppsigelse
   → TALENT → refusjon. Deretter: godkjenn ny milepæl 11.09 (beslutningskø 29) og hva som skjer
   med 19.6/19.7-arbeidet i hovedmappa (beslutningskø 30). Panel: DNS `akgolf.no`, Resend DKIM.
2. **Agent, tir 09.09:** PR #771 (Ø13) ferdig og merget · 19.6/19.7-redning fra hovedmappa.
3. **Agent, ons 10.09:** skjermbilde S3-03 med ekte data + etterkontroll-skjermbilder på
   15.4/15.5/15.6/15.8/15.9.
4. **Anders, tor 11.09:** Ø16 røyk-test → **FULL lanserbar**. Uka etter: WANG/GFGK-onboarding (7.2).
5. **Parallelt fra man 08.09:** markedssidene én per økt (spor B i 2.13). Fra man 14.09:
   produktskjermene Ø19–Ø26 (spor A). Fra 24.09: STEG 19-auditen (spor C).
6. **Uendret bakteppe:** STEG 16 (datagrunnlag/kjønn), STEG 17-resten (TN pilot), 15.13-resten,
   STEG 13 (SG-app) — ingen av dem på lanseringens kritiske vei.

## PR-status fra 30.08-pikselbølgen (avsluttet)

Alle PR-ene fra PX-3/PX-4/PX-6/PX-7-bølgen (30.08) er avsluttet: #656, #657, #668 merget;
#658–#661 lukket uten merge (innholdet dekket av #667/#668, som planlagt — se lærdommen
under). Ingen åpne PR-er gjenstår fra denne bølgen. Se `git log`/`gh pr list` for arbeidet
landet 31.08–02.09 (STEG 15-konsolideringen og TN-bølgen, PR #689–#734).

**Lærdom å ta med:** fire av PR-ene i 30.08-bølgen var to par der to økter kjørte samme bølge
parallelt. Ingen var en delmengde av den andre, så begge måtte slås sammen manuelt
(#667, #668). Start aldri to økter på samme PX-bølge.

## Åpne risikopunkter

1. **Betalingskjeden er aldri kjørt ekte (05.09).** Live-nøkler er inne (`cs_live_` målt 02.09),
   men 0 abonnement har Stripe-id i prod — webhook → FULL → oppsigelse er kun testet i testmodus.
   Ø2 (Anders' eget kort) er den ene handlingen som avgjør om 1. september-lanseringen virker.
   Årsplanen kan uansett ikke kjøpes før `STRIPE_PRICE_ID_PRO_AAR` er satt.
1b. **Strandet 19.6/19.7-arbeid i hovedmappa** (150 ukommitterte filer + én upushet commit)
   tapes ved neste `git checkout` der, eller merges ukritisk. Se beslutningskø 30.
1c. **Null ekte brukere fem dager etter lansering.** WANG/GFGK-onboarding (7.2) er ikke startet.
2. **Skjermbilde-gaten er delvis kjørt (PR #731/#732, 01.09.2026):** pixel-diff-riggen har
   kalibrert 5 av 9 rutekartlagte skjermer med målt restavvik; 4 er dokumentert
   ukalibrerbare (se `tests/visual/skjerm-mapping.ts`). Av 210 fasitfiler totalt er 148 sitert
   i kode (STEG 10.10) — resten er fortsatt design kodet, ikke pikselverifisert mot fasit.
3. **`SCREENTEST_PASSWORD`** — rotert av Anders 17.08.2026 (MASTERPLAN STEG 0.2), ikke lenger
   et åpent risikopunkt for signering generelt. Gjenstående nyanse: kjør
   `scripts/roter-screentest-passord.ts` én gang til for å inkludere
   `screentest-parent@akgolf.test` (foreldreportal-innlogging feiler til da).
4. **Datagrunnlaget er skjevt:** kun 1 av 38 spillere har runder med slagfordeling (målt
   30.08, ikke reverifisert mot databasen i denne runden). Bygg mot turneringsdata (rikt) før
   rundedata (nesten tomt).

## Levende kilder (én av hver rolle — start her)

| Rolle | Dokument |
|---|---|
| **Snapshot (denne)** | `docs/STATUS-NÅ.md` |
| **Samlet gjenstående-plan** | `docs/MASTERPLAN-GJENSTAAENDE.md` (konsolidert 30.08 — inkluderer tidligere LANSERINGSPLAN-KOMPLETT og LAUNCH-PLAN-FULL, T-/C-rad-detaljer og alt uavklart/parkert som lå i AAPNE-SPORSMAAL) |
| **TalentHQ inn i PlayerHQ** | `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 11 (10 steg; eget spor) |
| **Team Norway Workdesk** | `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 17 |
| **Designfasit (alle skjermer)** | `designsystem/train-lock/DESIGN-SYSTEM.md` + `SCREEN-INDEX.md` |
| **Låste forretningsregler** (fasit) | `docs/platform/BUSINESS-RULES.md` |
| **Full plattformkontekst** (5 min) | `docs/platform/AGENT-BRIEF.md` |
| **Stripe-cutover** | `docs/platform/stripe-cutover-sjekkliste.md` |
| **AgenticOS + Jarvis** | `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 12 |
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
  `TestSession`-scoring + Gate/Innspill-artefakt (C4), TrackMan DispersionMap (B7), TrackMan-import
  med tre kilder — CSV/HTML/foto med AI-vision (D4, PR #768).
- **AgencyOS — konsolidert til én inngang per funksjon (STEG 15, PR #689–#713):** Kø, Oppgaver,
  Oppsett, Kalender, Jarvis, Turnering, Kommunikasjon, Analyse, Plan, Hjem og Stall-lista er
  hver sin ene adresse med faner; gamle adresser er redirects. Talent-flatene flyttet til
  `/innsyn`. Alt Train-lock.
- **Team Norway Workdesk-grunnmur (STEG 17, PR #726/#727):** poster til gruppe/enkeltspiller,
  dokumentdeling med lesekvittering, samtykke-brytere (tester/resultater vs. komplett profil).
- **Domenemotorer m/ tester:** SG (Broadie + Team Norway IUP PUTT), fys-score v1 (stall-relativ,
  plassholder-merket i UI), ak-kategori, test-scoring (15 ScoringKind), talent-sync,
  plan-builder, uke-helpers (Oslo-korrekt), PEI/scorekort (N3), Tripletex-klient (read-only,
  to agenter for lønnssjekkliste/månedsavslutning).
- **Datapipelines:** GolfBox (timesvis, klubb+klassenavn fra 31.08) + GJGT (daglig) + DataGolf
  (schedule daglig, live hvert 10. min, skills ukentlig) + sync-vaktbikkje mandager. Se
  `docs/turnering-datakilder.md`.
- **Foreldreportal** 11/11 ruter ekte data (design-port gjenstår, F1) · **GDPR/moderering**
  bygget · **ekstern lesetilgang** (Team Norway/WANG, samtykke-håndhevet) bygget 16.08.

## Verifisert vs. antatt

- **Verifisert 05.09 (kode/git/prod):** STATUS-NÅ og MASTERPLAN 1B/1D/10.10/15.2/19.6/19.7/
  0.14/N4/18.33 krysset mot `src/`, `gh pr list`/`gh pr view`, lokale og eksterne grener, prod-DB
  (lesende tellinger via `DIRECT_URL`) og `vercel env ls production` (kun navn), målt mot
  `origin/main` @ `a653a3afd`. `tsc`/`eslint`/`npm test` kjørt i arbeidskopien.
- **Antatt / panel (kun Anders kan verifisere):** Stripe-checkout-branding, Resend DKIM,
  DNS `akgolf.no`, SCREENTEST-rotasjonens faktiske tilstand for `screentest-parent`, om
  hovedmappa-økten (19.6/19.7) fortsatt er aktiv.
