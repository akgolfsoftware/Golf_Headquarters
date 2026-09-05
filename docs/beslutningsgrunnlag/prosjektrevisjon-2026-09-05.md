# Prosjektrevisjon AK Golf HQ — 05.09.2026

**Målt mot:** `origin/main` @ `a653a3afd` (PR #783) · prod-databasen (kun lesende tellinger,
ingen PII) · Vercel production (kun variabelnavn) · GitHub (`gh pr list`, grener) ·
`scripts/maal-fasit-dekning.mjs`, `scripts/design-audit.mjs`, `scripts/check-tl-kontrast.mjs`
kjørt 05.09 · `tsc --noEmit`, `eslint`, `npm test` kjørt i arbeidskopien 05.09.

**Web-versjon (mobilvennlig):** https://claude.ai/code/artifact/9cfd52e5-7c66-4a27-bb67-6dded30d2a7d

**Hva dette er:** én samlet gjennomgang av hele prosjektet — lansering, design, kode og data —
med oppdatert plan. Planen selv bor i `docs/MASTERPLAN-GJENSTAAENDE.md` (STEG 1B revidert +
ny 2.13); snapshotet i `docs/STATUS-NÅ.md`. Dette dokumentet er grunnlaget bak begge.

---

## 1. Konklusjon

1. **Plattformen ligger foran skjema.** STEG 1B («FULL lanserbar», milepæl 24.09) hadde 16
   økter; 13 er levert per 04.09. Det som gjenstår er ikke kode — det er tre Anders-handlinger
   (årspris-id, ekte kjøp, røyk-test) og én PR som venter (#771). **Milepælen kan flyttes fra
   tor 24.09 til tor 11.09.** 24.09 beholdes som siste frist.
2. **Ingen har kjøpt.** Målt i prod 05.09: 0 abonnement med Stripe-id, 0 ekte spillere (41
   brukere, 39 av dem testbrukere; de to ekte er Anders og Markus). Ø2 (ekte kjøp fre 04.09) er
   **ikke** gjort. Årsplanen kan fortsatt ikke kjøpes — `STRIPE_PRICE_ID_PRO_AAR` mangler i
   Vercel production (verifisert 05.09; de tre andre pris-id-ene finnes).
3. **Design: produktet er portert, ikke signert.** 146 av 210 Train-lock-fasiter er sitert i kode
   (ned fra 148 målt 02.09), 5 av 12 rader i sign-off-riggen er kalibrert, og 98 av 104
   skjermfamilier har ingen rad i riggen i det hele tatt. Mekanisk design-audit er identisk
   04.09 → 05.09 — ingen bevegelse. Laveste familie er `portal/planlegge` med 3,2 av 10.
4. **Markedssidene: 0 av 18 portert.** Fundamentet (#775, 04.09) står, alle 22 sider er i
   verkstedpaletten med gammelt innhold, men ingen side-PR er startet.
5. **Strandet arbeid i hovedmappa:** STEG 19.6/19.7 (kontrastregel + TallHero) ligger som én
   lokal commit (03.09 02:24) pluss **150 ukommitterte filer** på grenen
   `feat/steg-19-6-19-7-kontrast-tallhero` i `~/Developer/akgolf-hq`. Ikke pushet, ingen PR.
   STATUS-NÅ fra 03.09 påstår at TallHero er levert — det stemmer ikke (`useCountUp` står
   fortsatt i `core.tsx:284`).
6. **Kodehelse er grønn.** `tsc` uten feil, `eslint` grønn, tester grønne (tall i §5). 475 ruter.

---

## 2. Levert siste uke (01.–05.09)

57 PR-er merget siden 01.09 (#716, #725–#783). De som flytter lanseringen:

| Dato | Hva | PR |
|---|---|---|
| 01.09 | Team Norway Workdesk-grunnmur: poster, dokumentdeling, samtykke-brytere | #726, #727 |
| 01.09 | Sign-off-rigg (pixel-diff mot fasit) | #731, #732 |
| 02.09 | PORTPLAN §A1 lukket (Stripe Elements-kortskjema, utstyr kanonisk, 5 bookingsteg beholdt) | #738–#745 |
| 02.09 | Ø3–Ø10 (PlayerHQ Plan/Workbench/Økt-ark/Live/Coach-hub, coachens Workbench + publiser) | #744, #750, #751, #762 |
| 02.09 | Daglig aktiv-måling (16.3), nattlig refresh av `mv_topar_grunnlag` (16.1) | #748, #749 |
| 02.09 | Foreldre booker for barnet (9.8) | #752 |
| 02.09 | STEG 19-rigg: design-audit per familie + kontrastmåling | #763 |
| 03.09 | Spiller 360 bento-landing (Ø12), gruppe→spiller-utsending i transaksjon (14.5A) | #766, #764 |
| 03.09 | TrackMan foto-avlesning med AI-vision (D4) | #768 |
| 04.09 | Markedssidene → Master AK Golf, fundament (18.33) | #775 |
| 04.09 | WB-06 årsplan for coach (Ø17) | #776 |
| 04.09 | Systemgrep 19.2a/c/d: fokusring, `alert()` ut, `tierEtikett`, «Fase»-hjelpetekst | #778, #780, #782 |
| 04.09 | Forelder «betalt i år» summeres i basen (19.3) | #773 |

Tempoet er 10–15 PR-er per døgn. Det er også grunnen til at dokumentene sklir: tre av avvikene
i §6 er STATUS-NÅ/MASTERPLAN-linjer som ble skrevet fra PR-beskrivelser, ikke fra kode.

---

## 3. Lansering — hvor står FULL

**Levert av STEG 1B (13 av 16):** Ø1 delvis · Ø3 · Ø4 · Ø5 · Ø6 · Ø7 · Ø8 · Ø9 delvis · Ø10 ·
Ø11 · Ø12 · Ø14 · Ø15 · Ø17 (F3, levert tidlig).

**Gjenstår på den kritiske veien:**

| # | Hva | Hvem | Status 05.09 |
|---|---|---|---|
| Ø1-rest | `STRIPE_PRICE_ID_PRO_AAR` inn i Vercel prod + redeploy | Anders gir id, agent setter | **Mangler fortsatt** (verifisert 05.09). Årsplanen svarer 500 |
| Ø1-rest | Stripe-checkout-branding Paper → Train-lock i dashbordet | Anders | Ikke sjekkbar fra kode |
| 0.4 | Innlogget TALENT-sonde (screentest midlertidig `tier=GRATIS`) | Anders' ja + agent | Venter på ja |
| Ø2 | Ekte kjøp 299 kr → webhook → FULL → oppsigelse → TALENT → refusjon | Anders + agent | **Ikke gjort.** 0 abonnement med `stripeSubscriptionId` i prod |
| Ø13 | Spiller 360 arbeidsvisning (S3-01/S3-02/AG-08) | Agent | PR #771 draft, CI grønn, urørt siden 03.09 10:28 |
| Ø12-rest | Skjermbilde av bento-landingen med ekte data | Agent | Stallen har nå 37 enrolleringer — kan tas |
| Ø16 | Menneskelig røyk-test hele kjeden, iPhone + Mac, push-opt-in | Anders | Ikke startet |

**Ikke på den kritiske veien, men åpent i 1D:** Resend DKIM (1.1), DNS `akgolf.no` (1.2) — begge
Anders i panel. Ingen av dem stopper FULL på `akgolf-hq.vercel.app`, men begge stopper
markedsføring på eget domene.

**Ny dato:** Ø2 + 0.4 man 08.09 · Ø13 merge tir 09.09 · Ø12-rest ons 10.09 · **Ø16 tor 11.09 =
FULL lanserbar.** Siste frist står på 24.09. Hver dag Ø1-rest/Ø2 venter, flytter Ø16 én dag.

---

## 4. Design — status

### 4.1 Produktskjermer (Train-lock, invariant 2)

| Måling | 05.09 | Forrige | Kilde |
|---|---|---|---|
| Fasitfiler sitert i kode | **146 / 210** (64 mangler) | 148 / 210 (02.09) | `maal-fasit-dekning.mjs` |
| Sign-off-rigg, kalibrert | **5 / 12** rader | 5 / 9 (01.09) | `tests/visual/skjerm-mapping.ts` |
| Skjermfamilier uten rigg-rad | **98 / 104** | — | `design-audit.mjs` |
| Mekanisk audit, laveste familie | `portal/planlegge` **3,2** | 3,2 (04.09) | `docs/design-audit/2026-09-05/` |
| Kontrast lys modus | 40 par, **12 brudd** (regel valgt, ingen token endres) | 12 (03.09) | `check-tl-kontrast.mjs` |
| Signalfarge som tekstfarge i tsx | **300 forekomster** `color: TL.danger/ok/warn/vizTarget` | — | grep 05.09 |
| Uporterte skjermer (2.12) | 29 → **26** (S3-03, WB-06 levert; TM-03 delvis) | 29 (01.09) | MASTERPLAN 2.12 |

Nedgangen 148 → 146: `P-01 Mac Uke.dc.html` er ikke lenger sitert (Ø5-raden oppgir den som
fasit for `/portal/planlegge/workbench`), og den utgåtte `P-05` siteres fortsatt i
`WorkbenchV2.tsx`/`WorkbenchV2Mobil.tsx`. Det er en dokumentasjonsfeil i koden, ikke en
layoutfeil.

**Det som faktisk holder produktet sammen:** den semantiske TL-broen `[data-paper-shell]` i
`train-lock-tokens.css` (#645, 28.08). 221 filer refererer `data-paper`; ~77 filer med gammel
Tailwind-semantikk rendrer Train-lock kun fordi broen står. Design-auditens «paper»-kolonne
teller nettopp denne. Broen er ikke feil, men den er teknisk gjeld: fjernes den, må de 77
filene portes på ekte.

### 4.2 Sign-off og skjermbilde-gaten

Skjermbilde-gaten (04.08) og «tegn før du bygger» (30.08) gjelder begge. Målt: de fleste
STEG 15-radene (15.4–15.6, 15.8, 15.9) har «skjermbilde-gate ikke dokumentert kjørt — ta som
etterkontroll» stående. Ø11/Ø12 mangler skjermbilde med ekte data. Riggen kjører ikke i CI.

### 4.3 Designkvalitet (STEG 19)

19.1 rigg · 19.2a · 19.2c · 19.2d (navngitt del) · 19.3 er levert. **19.6/19.7 er strandet** (se
§6). 19.2b (904 halve tekststørrelser), 19.2e (172 `<div onClick>`), 19.4 (manuell audit) og
19.5 (skjermløkke per familie) er ikke startet. Fem laveste familier per 05.09:
`portal/planlegge` 3,2 · `admin/marketing` 5,4 · `admin/gjennomfore` 6,4 ·
`forelder/innstillinger` 6,4 · `admin/kommunikasjon` 6,7.

### 4.4 Markedssidene (STEG 18.33)

Fundament levert 04.09. **0 av 18 sider portert** — ingen commit under `src/app/(marketing)`
eller `src/components/marketing` etter #775. Broen (`--mk-*` → `--ak-*`: 45 linjer i
`globals.css`, `--mkit-*`: 310 linjer i `marked-kit.css`) står som planlagt til oppryddingen.
Seks masterkomponenter finnes (`src/components/marketing/ak/`). Åpent: e-post i bunnen
(`post@akgolf.no` vs `akgolfgroup@gmail.com`), forsiden («Reisen» vs kit), `/cases` (sitater).

### 4.5 Merkelaget

AK Golf-masteren: tokens som data, vakter i verify, 5,9/10-revisjonen løftet (18.28–18.31).
Team Norway: 152 filer, TN-09–TN-12 bygget. WANG: eget merkevaresystem avgjort 02.09,
**ikke startet** — venter på at Anders oppretter Claude Design-prosjektet (18.32).

---

## 5. Kode- og datahelse

**Kode (arbeidskopi 05.09, `npm ci` + `prisma generate` kjørt):** `tsc --noEmit` grønn ·
`eslint --quiet src` grønn · `npm test` **2030 / 2030** grønn · 475 `page.tsx`
· 284 enhetstestfiler · 146 e2e-spec-filer (427 spillertester hoppes fortsatt over i CI, 9.5).

**Prod-databasen (lesende tellinger 05.09):**

| Måling | Verdi | Betydning |
|---|---|---|
| Brukere (ikke slettet) | 41: 2 ADMIN · 1 COACH · 38 PLAYER | 39 testbrukere, 2 ekte (Anders, Markus). Null ekte spillere |
| Abonnement | 33 PLAYERHQ ACTIVE · 6 COACHING ACTIVE | Alle på seedet demo-stall. **0 med Stripe-id** → 0 kjøp |
| Betalinger siden 01.09 | 3 rader, 950 kr, alle booking-type | Ingen abonnementskjøp |
| Daglig aktiv (`daily_active_users`) | 3 rader, 1 bruker, sist 02.09 | Målingen virker; ingen har åpnet `/portal` siden |
| TrackMan | 431 slag, **0 med Ball Speed / Club Speed** | 0.14 står uendret — merkets kjernepåstand kan ikke vises |
| `test_shots` (N4) | Finnes ikke | DDL ikke kjørt mot prod, som planen sier |
| `drift_rutiner` (15.2) | **6 rader** | Planen sier «0 rutiner» — utdatert |
| `tn_posts` (17.1) | 0 | Bygget, ubrukt til piloten |
| `PublicPlayerEntry.clubName` (16.6) | 382 av 398 497 | GolfBox-synken har begynt å fylle |
| Push-abonnement (1.6) | 2 | Planen sier 0 — utdatert |
| Innlogget siste 7 dager | 23 | Alle testbrukere (seed/skjermbilder) |

**Vercel production (navn):** `STRIPE_PRICE_ID_PRO`, `_PERFORMANCE`, `_PERFORMANCE_PRO` finnes.
`STRIPE_PRICE_ID_PRO_AAR` mangler.

**GitHub:** 1 åpen PR (#771, draft). 21 eksterne grener: 1 merget og slettbar
(`claude/claw-batch3-prompt-204861`), 19 gamle ikke-mergede fra august (`px/*`, `claude/*`,
`wip/*`, `feat/steg-15-*`, `docs/steg-15-2-levert`) hvis innhold er dekket av senere PR-er.

---

## 6. Avvik funnet — dokument mot kode

| # | Påstand | Virkelighet 05.09 | Rettet i |
|---|---|---|---|
| 1 | STATUS-NÅ 03.09: «`TallHero` slutter å telle opp (`useCountUp` fjernet der)» | `useCountUp` står i `core.tsx:284` og `:332` i main. Arbeidet ligger ukommittert/upushet i hovedmappa | STATUS-NÅ, MASTERPLAN 19.6/19.7 |
| 2 | MASTERPLAN 19.6/19.7: «I ARBEID 03.09 (parallell økt, gren …)» | Grenen finnes kun lokalt i `~/Developer/akgolf-hq`: 1 commit (03.09 02:24, 3 filer) + **150 filer ukommittert** (+264/−264). Ingen PR | MASTERPLAN 19.6/19.7 |
| 3 | MASTERPLAN Ø2: «fre 04.09 — ekte kjøp» | Ikke gjort. 0 abonnement med Stripe-id | MASTERPLAN Ø2 |
| 4 | MASTERPLAN 1.3: «Gjenstår: live-price-id for årsplanen» | Fortsatt sant 05.09 — datert på nytt | MASTERPLAN 1.3 |
| 5 | MASTERPLAN 15.2: «tabellen er tom (0 rutiner)» | 6 rader i `drift_rutiner` | MASTERPLAN 15.2 |
| 6 | MASTERPLAN 1.6: «0 abonnementer» (push) | 2 | MASTERPLAN 1.6 |
| 7 | MASTERPLAN 10.10: «148/210 sitert» | 146/210 | MASTERPLAN 10.10 |
| 8 | Feillogg: retro per økt (CLAUDE.md §Øktslutt) | Ingen retro etter 02.09 tross 15 PR-er 03.–05.09 | feillogg 05.09 |
| 9 | Ø5-fasit `P-01 Mac Uke` og utgått `P-05` | P-01 ikke sitert, P-05 siteres i to filer | MASTERPLAN Ø5 (notat) |

**Om den ukommitterte 150-filers-endringen (avvik 2):** stikkprøve i `admin/queue/_board.tsx`
viser at sweepen bytter `TL.danger`/`TL.ok` som tekstfarge til `TL.text`. Det fjerner
informasjonen (opp/ned) i stedet for å flytte den til et par som består (fylt flate + hvit
tekst, ikon + bakgrunn). Vei A-beslutningen sier «rett til riktig par», ikke «fjern fargen».
**Må gjennomgås fil for fil før PR.**

---

## 7. Risiko (rangert)

1. **Betalingskjeden er aldri kjørt ekte.** Live-nøkler er inne, men webhook → FULL →
   oppsigelse → TALENT er kun testet i testmodus. Ø2 er den ene handlingen som avgjør om
   1. september-lanseringen faktisk virker. Kan ikke delegeres — krever Anders' kort.
2. **Strandet 19.6/19.7-arbeid** (150 filer) tapes ved neste `git checkout` i hovedmappa, eller
   merges ukritisk. Begge deler er dårlig.
3. **Null ekte brukere fem dager etter «lansering».** WANG/GFGK-onboarding (beslutning 7.2)
   er ikke startet; foreldresamtykke-flyten er bygget men ubrukt. Uten ekte brukere måler
   `daily_active_users` ingenting.
4. **TrackMan-data er tom** (0.14). Alle TrackMan-skjermer, foto-avlesningen (D4) inkludert,
   er sett kun med `carryDistance`. Avklaringen «fyller importen feltene?» er ikke tatt.
5. **Dokumentene sklir fra koden** ved dagens tempo. Tre av avvikene i §6 er linjer skrevet fra
   PR-tekst. Regelen «les koden, ikke PR-beskrivelsen» står allerede i gotchas; den ble ikke
   fulgt 03.09.
6. **PR #771 (Ø13)** er den eneste S3-raden på kritisk vei og har stått urørt i to døgn som
   draft.

---

## 8. Oppdatert lanseringsplan (erstatter datoene i STEG 1B)

| Dag | Økt | Hva | Hvem |
|---|---|---|---|
| man 08.09 | Ø1-rest + 0.4 + Ø2 | Anders gir `price_`-id for årsplanen → agent setter + redeploy · Anders sier ja til TALENT-sonde → agent kjører · **ekte kjøp 299 kr** → webhook → FULL → oppsigelse → TALENT → refusjon. Én økt, alt i betaling | Anders + agent |
| tir 09.09 | Ø13 | Gjør PR #771 ferdig (skjermbilder 390/1280 × lys/mørk mot seedet stall) → merge | Agent |
| tir 09.09 | 19.6/19.7-redning | Fra hovedmappa: gjennomgå de 150 filene mot Vei A («riktig par», ikke «fjern farge»), commit, push, PR, merge | Agent (hovedmappa) |
| ons 10.09 | Ø12-rest + etterkontroll | Skjermbilde S3-03 med ekte data · skjermbilde-gate på 15.4/15.5/15.6/15.8/15.9 (fem faner-sider som mangler dokumentert gate) | Agent |
| **tor 11.09** | **Ø16** | **Røyk-test: kjøp → plan → publiser → spiller ser → live → ferdig → melding, iPhone + Mac. Push-opt-in. Grønn = FULL LANSERBAR** | Anders |
| fre 11.–fre 18.09 | Onboarding | WANG/GFGK: foreldresamtykke → invitasjon til TALENT (7.2). Første ekte brukere | Anders + agent |
| tor 24.09 | Siste frist | Ø16 senest her hvis 08.09 sklir | — |

**Etter FULL (F3, produktskjermer) — flyttet fram fra 25.09:** Ø19 PH-21 man 14.09 · Ø20 A-19a
tir 15.09 · Ø21 TE-08 ons 16.09 · Ø22 TE-07 tor 17.09 · Ø23 TE-10 fre 18.09 · Ø24 TE-12
man 21.09 · Ø25 TE-09 tir 22.09 · Ø26 TE-03 ons 23.09 · Ø18 A-15 når beslutningskø 27 er svart.

---

## 9. Oppdatert designplan (ny MASTERPLAN 2.13)

Fire spor. Maks to kjører samtidig (produkt + marked rører ulike filer); STEG 19-sporet starter
når F3 er ferdig, som planen allerede sier.

| Spor | Innhold | Start | Ferdig når |
|---|---|---|---|
| **A · Produktskjermer** | F3-øktene Ø18–Ø26 over, én skjerm per økt: canvas der fasit mangler → bygg → `/impeccable audit` → skjermbilde-gate → rigg-rad | man 14.09 | Alle 2.12-rader «krever bygging» (11) er levert eller har rigg-rad. Måltall: 160+/210 sitert, 20+ rigg-rader |
| **B · Markedssider (18.33)** | Én side per økt i planens rekkefølge: `/` → `/junior` → `/coaching` → `/priser` → `/om-oss` → `/kontakt` → `/coacher` → `/anlegg` → `/turneringer` → `/blogg` → `/playerhq` → `/mulligan` → `/treningsfilosofi` → `/cases` → `/faq` → `/jobb` → `/suksess` → dokumentsidene → opprydding | man 08.09 (uavhengig av FULL) | fre 02.10 ved én side per virkedag. Ferdig når `--mk-*`, `marked-kit.css` og broen er slettet og `check-ingen-paper.mjs` vokter dem |
| **C · Designkvalitet (STEG 19)** | 19.6/19.7-redning (tir 09.09) → 19.2b (halve tekststørrelser, vakt) → 19.2e (172 div-klikk) → 19.4 manuell audit, fem laveste familier først (`portal/planlegge`, `admin/marketing`, `admin/gjennomfore`, `forelder/innstillinger`, `admin/kommunikasjon`) → 19.5 skjermløkke | 19.6/19.7 nå; resten fra tor 24.09 | Hver familie ≥ 18/20 manuelt og ≥ 8,0 mekanisk (19.8) |
| **D · Canvas for skjermer uten fasit** | Øvelser/drills · Fysisk + fys-plan · Teknisk plan · Mål + mål-bygger (STEG 5 «trenger canvas») + W5-auth (15 ruter, 10.7) | Etter FULL, én canvas per økt, Anders godkjenner | Hver har godkjent canvas-URL i `designsystem/canvas/` |

**Venter på Anders (ingen kode før svar):** 18.32 WANG-merke (opprett Claude Design-prosjekt) ·
18.18 instrument-retning inn i produktet? · beslutningskø 27 (Ø18/A-15) · D5 DataGolf-plassering ·
D7 Jarvis-merge · 18.33 forsiden Reisen vs kit, `/cases`, bunn-e-post.

---

## 10. Beslutninger Anders må ta nå (rangert)

1. **Gi `price_`-id-en for årsplanen** (2 690 kr) — én linje. Uten den selges kun månedsplanen.
2. **Sett av 30 minutter man 08.09 til Ø2** (ekte kjøp med eget kort) og si ja til
   TALENT-sonden. Dette er den eneste verifiseringen av at betaling virker.
3. **Godta ny milepæl tor 11.09** for FULL lanserbar (24.09 som siste frist).
4. **Godkjenn at 19.6/19.7-arbeidet i hovedmappa gjennomgås og pushes** før det tapes.
5. **Beslutningskø 27** (spillerens årsplan: dagens canvas eller fasitens seks spor) — låser Ø18.
