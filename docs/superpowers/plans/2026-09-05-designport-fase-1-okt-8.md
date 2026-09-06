# Fase 1 · Økt 8 — Dokumenter og siteringer

**Mål:** Dokumentene og filhodene slutter å lyve om det som er vedtatt eller allerede bygget: D3 (Spiller 360 på én adresse) blir registrert etter `/beslutning`-mønsteret, HANDOFF får proto-batchene og «Meny per enhet» merkes overstyrt av AX-01, SCREEN-INDEX teller lys-filene riktig (28), og seks kode-filer får riktig `Fasit:`/`Avvik:`-tekst. Ingen funksjonsendring, ingen tokens, ingen nye avhengigheter.

**Forutsetninger:**

- Kontrollert 06.09.2026 (skeptiker-gjennomgang) mot origin/main `c1c3396eb` pluss grenen med PR #790 (`ae73b1658`). PR #787, #788 og #789 er MERGET (verifisert 06.09). **PR #790 må også være MERGET før start** — den bringer §KOMPLETT DESIGNPORT i `beslutninger.md` (ankeret 8.3 bruker), STEG 20 + beslutningskø 31–32 i MASTERPLAN og referansefilene i `designsystem/train-lock/referanse/` (8.1 leser dem). Sjekk:
  ```bash
  for n in 787 788 789 790; do gh pr view $n --json number,state --jq '"\(.number) \(.state)"'; done
  ```
  Forventet: fire linjer med `MERGED`. Er #790 fortsatt `OPEN`: stopp — ikke start økten. Alle linjenumre under er kontrollert mot dette HEAD-et; bruk likevel `grep -n`-ankrene ved hvert steg, aldri linjenummeret alene — avviker de, vinner ankeret.
- Denne økten overlapper IKKE med #787/#788/#789: P-05-siteringene (#788), PH-21 (#789), S3-03-riggradene og etterkontroll-skjermbildene 15.4–15.9 (#787, `docs/design-audit/2026-09-05/skjermbilde-gate-a0/`) røres ikke og bestilles ikke på nytt — kun omtalt.
- `scripts/check-doc-lenker.mjs` skal være grønn på `origin/main` når du starter. `docs/superpowers/plans/2026-09-05-designport-fase-1.md` (referert fra `beslutninger.md:36` og MASTERPLAN 20.1) fantes 06.09 kun som UNTRACKED fil i arbeidstreet — den er ikke med i #790. Sjekk på den ferske grenen: `ls docs/superpowers/plans/2026-09-05-designport-fase-1.md`. Mangler den, feiler `check-doc-lenker` på origin/main og hver docs-commit i denne økten blir rød — stopp og si fra; økten som samler fase 1-planen må committe den (sammen med økt-filene) først. Ikke lag filen selv.
- Referansefilene for proto-batchene FINNES i repoet (PR #790) — økten leser aldri fra zip-en på Drive:
  `designsystem/train-lock/referanse/proto-handoff-batch-1-4-2026-09-02.md` (40 linjer; de fire 02.09-seksjonene står på linje 5–40, verifisert 06.09 identisk med zip-ens `HANDOFF.md` linje 443–478) og `designsystem/train-lock/referanse/PROTOTYPE-PLAN-2026-09-02.md` (138 linjer). Repoets `HANDOFF.md` (449 linjer) har 03.09-rettelsen på linje 28 og mangler de fire seksjonene — derfor flettes de inn, aldri kopieres over.
- Gren:
  ```bash
  cd /Users/anderskristiansen/Developer/akgolf-hq
  git fetch origin
  git checkout -b claude/fase1-okt8-dokumenter-siteringer origin/main
  git branch --show-current     # forventet: claude/fase1-okt8-dokumenter-siteringer
  export S=/private/tmp/claude-501/okt8-scratch && mkdir -p "$S"
  ```
- Regler: aldri `git add -A` (kun navngitte filer) · docs-commits porter med `node scripts/check-doc-lenker.mjs` · kode-commit (oppgave 8.5) porter med `npm run verify` · aldri kopier `.env*` · aldri emoji · norsk bokmål.

---

### Oppgave 8.1: Proto-batchene inn i HANDOFF, «Meny per enhet» overstyrt, README-linje

**Filer:**
- Les (finnes fra PR #790, endres ikke): `designsystem/train-lock/referanse/proto-handoff-batch-1-4-2026-09-02.md` (linje 5–40 = de fire seksjonene), `designsystem/train-lock/referanse/PROTOTYPE-PLAN-2026-09-02.md`
- Modify: `designsystem/train-lock/HANDOFF.md` (linje 28 beholdes; de fire seksjonene inn mellom linje 442 og 443 — rett før `## 30.08.2026`; linje 263–266)
- Modify: `designsystem/train-lock/README.md:49` (ny linje etter siste kulepunkt under `## Regler`)

**Grensesnitt:** ingen kode. Senere faser leser HANDOFF-seksjonene «02.09.2026 — Klikkbar prototype, batch 1–4» og README-linjen om `proto/` når beslutning 7 (coach-menyen) stilles.

- [ ] **Steg 1: Verifiser referansefilen (fra PR #790)**
  ```bash
  ls designsystem/train-lock/referanse/
  R=designsystem/train-lock/referanse/proto-handoff-batch-1-4-2026-09-02.md
  wc -l "$R"                 # forventet: 40
  grep -n "^## " "$R"
  sed -n 40p "$R" | wc -c    # forventet: 1 (tom sistelinje)
  ```
  Forventet fire filer (`CLAUDE-CODE-IMPORT-PROMPT.md`, `PROSJEKT-CLAUDE.md`, `PROTOTYPE-PLAN-2026-09-02.md`, `proto-handoff-batch-1-4-2026-09-02.md`) og:
  ```
  5:## 02.09.2026 — Klikkbar prototype, batch 4 (`proto/`)
  14:## 02.09.2026 — Klikkbar prototype, batch 3 (`proto/`)
  23:## 02.09.2026 — Klikkbar prototype, batch 2 (`proto/`)
  32:## 02.09.2026 — Klikkbar prototype, batch 1 (`proto/`)
  ```
  Mangler de to referansefilene: #790 er ikke merget — stopp (forutsetning). Stemmer ikke tallene: stopp, filen er endret av en annen økt; flett da for hånd (de fire seksjonene inn rett før `## 30.08.2026` i HANDOFF).

- [ ] **Steg 2: Flett de fire seksjonene inn i repoets HANDOFF.md uten å miste linje 28**
  ```bash
  wc -l designsystem/train-lock/HANDOFF.md                        # forventet: 449
  grep -n "^## 30.08.2026" designsystem/train-lock/HANDOFF.md     # forventet: 443
  sed -n 442p designsystem/train-lock/HANDOFF.md | wc -c          # forventet: 1 (tom linje)
  grep -c "RETTET 03.09.2026" designsystem/train-lock/HANDOFF.md  # forventet: 1 (linje 28)
  ```
  Får du andre tall: stopp — da er repoets HANDOFF endret av en annen økt, og du må flette for hånd.
  ```bash
  { sed -n 1,442p designsystem/train-lock/HANDOFF.md
    sed -n 5,40p "$R"
    sed -n 443,449p designsystem/train-lock/HANDOFF.md
  } > "$S/HANDOFF-ny.md"
  wc -l "$S/HANDOFF-ny.md"                                                          # forventet: 485
  diff <(sed -n 443,478p "$S/HANDOFF-ny.md") <(sed -n 5,40p "$R") && echo FLETTET   # forventet: FLETTET (tom diff)
  cp "$S/HANDOFF-ny.md" designsystem/train-lock/HANDOFF.md
  grep -c "RETTET 03.09.2026" designsystem/train-lock/HANDOFF.md    # forventet: 1
  grep -n "^## 02.09.2026\|^## 30.08.2026" designsystem/train-lock/HANDOFF.md
  ```
  Forventet siste kommando: 443 batch 4 · 452 batch 3 · 461 batch 2 · 470 batch 1 · 479 30.08. (Referansefilens linje 5–40 er verifisert 06.09 identisk med zip-ens HANDOFF linje 443–478, så resultatet er det samme som en fletting fra zip — uten at Drive røres.)

- [ ] **Steg 3: Merk «Meny per enhet» som overstyrt av AX-01**
  Verifiser først:
  ```bash
  sed -n 263,266p designsystem/train-lock/HANDOFF.md
  ```
  Forventet linje 263 `## Meny per enhet`, 264 `- iPhone 390: dock 5 — Cockpit · Innboks · Stall · Kalender · Workbench. …`, 265 `- Mac ≥1101: rail 64 — Cockpit · Innboks · Kalender · Stall · Plan · Innsikt · Oppsett. …`, 266 `- iPad 1180×820: samme sju som skinne, …`.
  Bruk Edit-verktøyet (eksakt tekst, ikke linjenummer). Sett inn én ny linje rett etter overskriften, og prefiks hver av de tre kulepunktene:

  Erstatt
  ```
  ## Meny per enhet
  - iPhone 390: dock 5 — Cockpit · Innboks · Stall · Kalender · Workbench.
  ```
  med
  ```
  ## Meny per enhet
  > [SUPERSEDERT 25.08.2026 — se AX-01] De tre punktene under er tegnet før `AX-01 Skall rail og tabbar.dc.html` (kanon fra 25.08.2026, Anders): fem destinasjoner Stall · Workbench · Kø · Jarvis · Meg, identiske på mobil og Mac, Mac-rail 232 px med tekst, ingen 64 px-rail med sju ikoner. Beholdt som historikk — aldri byggeordre.
  - [SUPERSEDERT 25.08.2026 — se AX-01] iPhone 390: dock 5 — Cockpit · Innboks · Stall · Kalender · Workbench.
  ```
  Erstatt `- Mac ≥1101: rail 64 — Cockpit` med `- [SUPERSEDERT 25.08.2026 — se AX-01] Mac ≥1101: rail 64 — Cockpit`.
  Erstatt `- iPad 1180×820: samme sju som skinne` med `- [SUPERSEDERT 25.08.2026 — se AX-01] iPad 1180×820: samme sju som skinne`.
  ```bash
  grep -c "SUPERSEDERT 25.08.2026 — se AX-01" designsystem/train-lock/HANDOFF.md   # forventet: 4
  wc -l designsystem/train-lock/HANDOFF.md                                          # forventet: 486
  ```

- [ ] **Steg 4: Én nøytral linje i README.md**
  Siste linje i fila (49) er `- \`uploads/\`-kildematerialet fra zipen er BEVISST holdt utenfor repoet (offentlig repo; NGF/Team Norway-materiale) — se SYNC-STATUS.md.` Legg til rett etter den:
  ```
  - `proto/` (klikkbar prototype 02.09, i zip 05.09) avviker fra AX-01 i coach-menyen — avgjøres i designport-beslutning 7 (= MASTERPLAN beslutningskø 32). Prototypen er derfor ikke synket inn; batch-notatene står i `HANDOFF.md` (02.09-seksjonene) og i `referanse/proto-handoff-batch-1-4-2026-09-02.md` + `referanse/PROTOTYPE-PLAN-2026-09-02.md`.
  ```
  ```bash
  tail -1 designsystem/train-lock/README.md | cut -c1-40    # forventet: - `proto/` (klikkbar prototype 02.09
  ```

- [ ] **Steg 5: Commit**
  ```bash
  node scripts/check-doc-lenker.mjs     # forventet: exit 0 (HANDOFF/README er ikke levende kilder, men porten kjøres uansett)
  git status --short                    # forventet: kun HANDOFF.md og README.md — referansefilene er urørt
  git add designsystem/train-lock/HANDOFF.md designsystem/train-lock/README.md
  git commit -m "docs(train-lock): flett proto-batch 1-4 inn i HANDOFF, merk Meny per enhet overstyrt av AX-01

Fire 02.09-seksjoner fra referanse/proto-handoff-batch-1-4-2026-09-02.md
(PR #790, identisk med zip 05.09) lagt inn foran 30.08-seksjonen; linje 28
(03.09-rettelsen, D1) beholdt. HANDOFF:263-266 (7-punkts rail 64) merket
SUPERSEDERT 25.08.2026 — se AX-01. README sier at proto/ ikke synkes foer
designport-beslutning 7 (koe 32).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 8.2: SCREEN-INDEX «Kjente hull» — lys-linjen teller 28 filer

**Filer:**
- Modify: `designsystem/train-lock/SCREEN-INDEX.md:282`

**Grensesnitt:** ingen. Fase 5–7 bruker linjen til å vite hvor tegnet lys finnes og hvor mekanisk avledet lys (beslutning 26.08) gjelder.

- [ ] **Steg 1: Verifiser tallet selv**
  ```bash
  ls designsystem/train-lock | grep -E ' lys\.dc\.html$|^B[345] Lys' | wc -l    # forventet: 28
  ls designsystem/train-lock | grep -E ' lys\.dc\.html$|^B[345] Lys'
  ```
  Forventet liste (28): A-16 Mac Uke lys · A-17 Mac Okt lys · A-19L Innsikt lys · AG-01 Cockpit lys · B3 Lys nøkkelskjermer · B3 Lys resterende skjermer · B4 Lys iPad Mac · B5 Lys Agency · DG-01L · FO-01L–FO-10L (10) · KA-01L · LO-01L · P-09 Mac Uke lys · PH-21L · RU-01L · S3-01L · TE-00L · TE-04L · TE-01L.
  Merk: `grep -i lys` uten anker gir 36 fordi «Ana**lys**e» matcher — bruk mønsteret over.
  Lys-rammer inne i mørke filer (verifisert med `data-screen-label` 05.09): `EC-02 AS Compliance.dc.html` (EC-02d tom lys, EC-02e Mac lys), `AG-19 Notifikasjonssenter.dc.html` (AG-19g), `AO-13 Routing-hub.dc.html` (AO-13e), `GAP-2 Tilstander drift.dc.html` (GAP-2f).
  ```bash
  sed -n 282p designsystem/train-lock/SCREEN-INDEX.md
  ```
  Forventet: `- Lys modus finnes for: FO-01L–FO-10L, KA-01L, RU-01L, S3-01L, LO-01L, A-16, B3. Alt annet er kun mørkt.`

- [ ] **Steg 2: Bytt linjen** (Edit, eksakt tekst)
  Ny linje:
  ```
  - Lys modus finnes som egne filer for 28 skjermer (talt 05.09.2026 med `ls designsystem/train-lock | grep -E ' lys\.dc\.html$|^B[345] Lys'`): A-16, A-17, A-19L, AG-01 lys, B3 (to filer), B4, B5, DG-01L, FO-01L–FO-10L, KA-01L, LO-01L, P-09 lys, PH-21L, RU-01L, S3-01L, TE-00L, TE-01L, TE-04L. I tillegg finnes lys-rammer inne i mørke filer: EC-02d/EC-02e, AG-19g, AO-13e, GAP-2f. Alt annet er kun mørkt — der gjelder mekanisk avledet lys fra `--tl-*` (beslutning 26.08.2026).
  ```
  ```bash
  grep -c "28 skjermer" designsystem/train-lock/SCREEN-INDEX.md   # forventet: 1
  ```

- [ ] **Steg 3: Commit**
  ```bash
  git add designsystem/train-lock/SCREEN-INDEX.md
  git commit -m "docs(train-lock): SCREEN-INDEX lys-linjen teller 28 filer + lys-rammer i moerke filer

Var 8 oppfoerte (FO-L, KA-01L, RU-01L, S3-01L, LO-01L, A-16, B3); talt 05.09:
28 egne lys-filer pluss EC-02d/e, AG-19g, AO-13e, GAP-2f som rammer.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 8.3: D3 registreres med `/beslutning`-mønsteret

**Filer:**
- Modify: `.claude/rules/beslutninger.md` (ny blokk som nr. 2 under `## Beslutningene (september 2026)` (linje 29): rett ETTER §KOMPLETT DESIGNPORT-blokken (linje 31–44, PR #790) og foran §FORSIDETEKSTEN LÅST (linje 46). KOMPLETT DESIGNPORT (05.09 kveld) er nyere enn D3 (03.09) og beholder toppen)
- Modify: `docs/MASTERPLAN-GJENSTAAENDE.md` — 1C-raden `| D3 |` (linje 131), «etter beslutning»-raden (linje 122), 2.12-radene `| S3-01 |`, `| S3-02 |`, `| S3-03 |`, `| WB-04 (coach) |` (linje 186, 187, 188, 190). STEG 20.3 (linje 744) nevner allerede «S3-01/AG-08 (PR #771)» og «WB-04 coach» — radene her PEKER dit, gjentar ikke teksten
- Modify: `docs/STATUS-NÅ.md:44–45`, `:68–69` og `:178–179`

**Grensesnitt:** §-tittelen `SPILLER 360 PÅ ÉN ADRESSE — D3` brukes som anker fra MASTERPLAN og fase 3 (WB-04 coach).

Fakta blokken bygger på (alle verifisert 05.09): `src/app/admin/spillere/[id]/page.tsx:1–30` (filhodet «D3 (03.09.2026)»: `SpillerOversiktV2` lagt øverst som landing, tre eldre komponenter uendret, `/analyse` ikke flettet inn) · PR #766 `MERGED 2026-09-03` «D3: Spiller 360 Oversikt-bento (S3-03)» · PR #771 `OPEN, draft` — «Arbeidsvisning»-fane `?vis=360` (S3-01/S3-02-mønster, mobil forenklet AG-08) · PR #787: rigg S3-03a Mac 14,34 % / S3-03b iPhone 15,15 %, skjermbilder 390/1280 × lys/mørk mot prod · MASTERPLAN Ø11/Ø12 «gjort 03.09» · 1C D3 fortsatt «tor 17.09» uten SVART-merke · STEG 15 = regel 6.9 (én inngang per funksjon).

- [ ] **Steg 1: Ny blokk i beslutninger.md**
  ```bash
  grep -n "^## Beslutningene (september 2026)\|^- \*\*KOMPLETT DESIGNPORT\|^- \*\*FORSIDETEKSTEN LÅST" .claude/rules/beslutninger.md
  sed -n 44,46p .claude/rules/beslutninger.md | cut -c1-70
  ```
  Forventet: 29 / 31 / 46, og linjene `  beslutningskø 31–32. **Arbeidet:** \`docs/MASTERPLAN-GJENSTAAENDE.md\` STEG 20.` · tom linje · `- **FORSIDETEKSTEN LÅST — SVARTIDSLØFTET VENTER PÅ JARVIS (Anders 05.09.2026, i økt):** sju`. Sett inn blokken under mellom den tomme linjen (45) og FORSIDETEKSTEN-blokken — altså som blokk nr. 2, rett under §KOMPLETT DESIGNPORT (Edit: `old_string` = `- **FORSIDETEKSTEN LÅST — SVARTIDSLØFTET VENTER PÅ JARVIS (Anders 05.09.2026, i økt):** sju`, `new_string` = blokken under + tom linje + samme setning):
  ```
  - **SPILLER 360 PÅ ÉN ADRESSE — D3 (Anders 03.09.2026, i økt; registrert i ettertid, fase 1 økt 8):** svar på
    beslutningskø 1C D3. `/admin/spillere/[id]` er den ene adressen for spillerprofilen (regel 6.9
    «én inngang per funksjon»): `S3-03 Spiller profil bento` er landingen (Oversikt), `S3-01`/`S3-02`
    er arbeidsvisningen på samme rute (`?vis=360`, Mac/iPad), `AG-08 Spiller-ark` er mobilvarianten
    av arbeidsvisningen. Ingen egen canvas-runde — fasit fantes fra 28.08 (HANDOFF §S3-03).
    **Bygget:** Ø11–Ø12 samme dag, PR #766 (`SpillerOversiktV2` + `spiller-oversikt-data.ts`, ekte
    spørringer); riggrader S3-03a Mac 14,34 % / S3-03b iPhone 15,15 % kalibrert og skjermbilder
    390/1280 × lys/mørk mot prod 05.09 (PR #787). Ø13 arbeidsvisning + mobil-ark: PR #771 (draft).
    **Bevisst forenklet i #766:** minikalender utelatt, ukeaktivitet som prosentbue (ikke 24-tikks
    klokke), teknisk plan med ekte P-posisjoner i stedet for «blokk N av M». `/admin/spillere/[id]/
    analyse` forblir egen rute (A-19). **Kjent avvik:** to hvite primær-CTA-er på samme skjerm
    (bentoens «Åpne uke i Workbench» + den gamle profilheaderens) — løses i Ø13, ikke som egen rad.
    **Registrert i ettertid:** beslutningen ble tatt muntlig og bygget 03.09, men sto kun i Ø11-raden
    — samme feilklasse som TM-03 (03.09). **Arbeidet:** `docs/MASTERPLAN-GJENSTAAENDE.md` 1B Ø11–Ø13,
    1C D3 (svart), 2.12 S3-01/S3-02/S3-03 og WB-04 (coach). Krever ingen kodeendring utover Ø13.

  ```
  ```bash
  grep -c "SPILLER 360 PÅ ÉN ADRESSE — D3" .claude/rules/beslutninger.md   # forventet: 1
  ```

- [ ] **Steg 2: MASTERPLAN 1C D3-raden**
  ```bash
  grep -n "^| D3 |" docs/MASTERPLAN-GJENSTAAENDE.md
  ```
  Raden slutter i dag med `| Ø11–Ø13 | tor 17.09 |`. Bytt siste celle (Edit på `| Ø11–Ø13 | tor 17.09 |`) til:
  ```
  | Ø11–Ø13 | **SVART 03.09: én adresse** (registrert fase 1 økt 8 i `.claude/rules/beslutninger.md` §SPILLER 360 PÅ ÉN ADRESSE — D3; Ø11–Ø12 gjort #766, rigg #787, Ø13 = PR #771) |
  ```

- [ ] **Steg 3: «etter beslutning»-raden i 1B**
  ```bash
  grep -n "WB-04 coach-side (avgjøres i D3-canvasen)" docs/MASTERPLAN-GJENSTAAENDE.md   # forventet: 1 treff
  ```
  Erstatt `WB-04 coach-side (avgjøres i D3-canvasen)` med `WB-04 coach-side (D3 svart 03.09 — bygges i STEG 20.3, fase 3)`.

- [ ] **Steg 4: 2.12-radene S3-01, S3-02, S3-03, WB-04 (coach)**
  ```bash
  grep -n "^| S3-01 |\|^| S3-02 |\|^| S3-03 |\|^| WB-04 (coach) |" docs/MASTERPLAN-GJENSTAAENDE.md   # forventet: 4 linjer
  ```
  Edit hver rad (eksakt gammel tekst → ny):
  - S3-01: `| krever bygging | Visningslaget (\`SpillerProfilPanel.tsx\`) følger Paper-fasitens struktur — TL-tokens, men ikke S3-IA-en. D3 avgjør adressestruktur | Ø11, Ø13 |` → `| krever bygging | D3 svart 03.09: arbeidsvisning \`?vis=360\` på samme rute — PR #771 (draft, urørt siden 03.09). Visningslaget (\`SpillerProfilPanel.tsx\`) er TL-tokens, ikke S3-IA-en | Ø13 |`
  - S3-02: `| krever bygging | Som S3-01 | Ø13 |` → `| krever bygging | Som S3-01 (iPad-rammen i PR #771) | Ø13 |`
  - S3-03: `| krever bygging | HANDOFF 28.08: landingssiden ved trykk på navn i stall/gruppe. D3 | Ø11, Ø12 |` → `| lanserbart nå | **LEVERT 03.09 (PR #766)**, rigg S3-03a 14,34 % / S3-03b 15,15 % kalibrert + skjermbilder mot prod (PR #787). Kun sign-off i Ø16 | Ø11, Ø12 |`
  - WB-04 (coach): `| krever Anders-beslutning | Coach-siden (forslag-status i uke + inspektør) er ikke bygget; avgjøres som del av D2/D3 (én inngang) | etter D3 |` → `| krever bygging | Coach-siden (forslag-status i uke + inspektør) er ikke bygget. D2 (02.09) og D3 (03.09) er svart — bygges i STEG 20.3 (fase 3) | fase 3 |`

- [ ] **Steg 5: STATUS-NÅ**
  ```bash
  grep -n "skjermbilde$\|venter på D3-canvas-ja 17.09\|etterkontroll-skjermbilder på$" docs/STATUS-NÅ.md
  ```
  Forventet: linje 44 (`bento-landing … — skjermbilde`), 69 (`venter på D3-canvas-ja 17.09)`) og 178 (`3. **Agent, ons 10.09:** … etterkontroll-skjermbilder på`). Seksjonene på linje 38 og 64 er merket «historikk» — rett kun faktafeilene, ikke skriv dem om. Edit:
  - `bento-landing med identitet/nøkkeltall/ukeaktivitet/plan-fremdrift/«Nå»-kort — skjermbilde` + neste linje `med ekte data mangler fortsatt, ingen spillere i stallen ved byggetidspunktet). D4 TM-03` → `bento-landing med identitet/nøkkeltall/ukeaktivitet/plan-fremdrift/«Nå»-kort — skjermbilde` + `med ekte data tatt 05.09, PR #787, rigg S3-03a/b kalibrert; registrert i beslutninger.md, fase 1 økt 8). D4 TM-03`
  - `Ø11–Ø13 (Spiller 360,` + `venter på D3-canvas-ja 17.09)` → `Ø13 (Spiller 360` + `arbeidsvisning, PR #771 draft; Ø11–Ø12 gjort #766)`
  - «Neste steg (05.09)» punkt 3 bestiller skjermbilder som #787 allerede leverte. Bytt de to linjene `3. **Agent, ons 10.09:** skjermbilde S3-03 med ekte data + etterkontroll-skjermbilder på` + `   15.4/15.5/15.6/15.8/15.9.` med én linje: `3. ~~**Agent, ons 10.09:** skjermbilde S3-03 med ekte data + etterkontroll-skjermbilder på 15.4/15.5/15.6/15.8/15.9.~~ **LEVERT 05.09 (PR #787, A0 — \`docs/design-audit/2026-09-05/skjermbilde-gate-a0/\`).**`
  Les linjene 44–45, 68–69 og 178–179 først med `sed -n` og behold linjebryting/innrykk som i fila.
  ```bash
  grep -c "etterkontroll-skjermbilder på 15.4/15.5/15.6/15.8/15.9.~~" docs/STATUS-NÅ.md   # forventet: 1
  ```

- [ ] **Steg 6: Commit**
  ```bash
  node scripts/check-doc-lenker.mjs    # forventet: exit 0, ingen FEIL-linjer
  git add .claude/rules/beslutninger.md docs/MASTERPLAN-GJENSTAAENDE.md docs/STATUS-NÅ.md
  git commit -m "docs(beslutning): registrer D3 Spiller 360 paa en adresse (03.09), lukk 1C-raden

Blokken i beslutninger.md (§SPILLER 360 PÅ ÉN ADRESSE — D3, rett under
§KOMPLETT DESIGNPORT) peker paa #766, #787 (rigg S3-03a/b) og #771 (Ø13).
1C D3 = SVART, 2.12: S3-03 lanserbart naa, S3-01/S3-02 peker paa PR #771,
WB-04 coach = krever bygging (fase 3). STATUS-NAA oppdatert, inkl. at
etterkontroll-skjermbildene (Neste steg 3) er levert i #787.
Registrert i ettertid — samme feilklasse som TM-03.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 8.4: MASTERPLAN 2.12-rest, kategorisum, TE-12/Ø24, 10.3, 2.1

**Filer:**
- Modify: `docs/MASTERPLAN-GJENSTAAENDE.md` — rader `| TM-03 |` (linje 202), `| TE-12 |` (215), `| Ø24 |` (118), «Kategorisum»-avsnittet (220–223), `| 10.3 |` (393), `| 2.1 |` (164)

**Grensesnitt:** kategoritallene i 2.12 er det STEG 20.4 (fase 4) og spor A i 2.13 teller mot.

- [ ] **Steg 1: TM-03-raden (D4 svart, levert #768, sign-off gjenstår)**
  Verifisert: PR #768 `MERGED 2026-09-03` «foto-avlesning av TrackMan-skjerm med AI-vision (D4)»; Ø27-raden sier «delvis gjort 03.09»; beslutninger.md §TM-03: MODALEN BESTÅR — OG FÅR AI-VISION.
  ```bash
  grep -n "^| TM-03 |" docs/MASTERPLAN-GJENSTAAENDE.md
  ```
  Erstatt `| krever Anders-beslutning | 774 linjer fungerende 4-stegs modal; fasiten tegner helskjerm C1–C4. D4 | Ø27 |` med
  `| lanserbart nå | **D4 svart 03.09 (behold modalen), levert PR #768:** «Foto av skjerm»-kilde med AI-vision (\`parse-photo.ts\`), C1 busy + C2/C3 feiltekst ordrett i modalen; C4-suksesskjerm bevisst ikke bygget. Sign-off/riggrad gjenstår (Ø27) | Ø27 |`

- [ ] **Steg 2: TE-12-raden og Ø24 — `/ny/egen` ligger IKKE i legacy**
  ```bash
  ls src/app/portal/tren/tester/ny/egen/page.tsx          # finnes
  find src/app -path "*legacy*" -path "*egen*"             # forventet: tom
  git log --oneline -1 -- src/app/portal/tren/tester/ny/egen/page.tsx   # 49068e969 … (#631)
  grep -n "^| TE-12 |\|^| Ø24 |" docs/MASTERPLAN-GJENSTAAENDE.md
  ```
  Erstatt TE-12-raden `| TE-12 | \`/portal/tren/tester/ny\` (+ \`/ny/egen\` i legacy) | \`TE-12 Egen test.dc.html\` | krever bygging | \`/ny/egen\` ligger fortsatt i \`(legacy)\` | Ø24 |` med
  `| TE-12 | \`/portal/tren/tester/ny\` + \`/ny/egen\` | \`TE-12 Egen test.dc.html\` | krever bygging | **RETTET 05.09:** \`/ny/egen\` ligger IKKE i \`(legacy)\` — \`src/app/portal/tren/tester/ny/egen/page.tsx\` (flyttet i #631). Gjenstår: selve porten mot TE-12 | Ø24 |`
  I Ø24-raden: erstatt `TE-12 Egen test (flytt \`/ny/egen\` ut av legacy)` med `TE-12 Egen test (\`/ny/egen\` er allerede utenfor legacy, #631 — kun port)`.

- [ ] **Steg 3: Kategorisummen — tell selv**
  ```bash
  sed -n '/^### 2.12/,/^### 2.13/p' docs/MASTERPLAN-GJENSTAAENDE.md | grep -c '^| [A-Z]'   # forventet: 31 (30 rader + tabellhodet «| Skjerm |»)
  sed -n '/^### 2.12/,/^### 2.13/p' docs/MASTERPLAN-GJENSTAAENDE.md | grep '^| [A-Z]' | awk -F'|' '{print $5}' | sed 's/^ *//; s/ *$//' | sed 's/\*\*.*//' | sort | uniq -c
  ```
  Målt 06.09 FØR økten: `1` (tom — det er PH-21, hvis celle `**levert 05.09 (Ø19, PR #789)**` strippes av `sed`) · `1 Kategori` (tabellhodet) · `4 lanserbart nå` · `9 krever bygging` · `9 krever Anders-beslutning` · `7 krever datamodell`. Forventet ETTER steg 1 i denne oppgaven og oppgave 8.3: `1` (tom, PH-21) · `1 Kategori` · `6 lanserbart nå` · `9 krever bygging` · `7 krever Anders-beslutning` · `7 krever datamodell` — dvs.:
  - lanserbart nå / levert: **7** — WB-04 (spiller), WB-06 (#776), A-15, TE-03, S3-03 (#766), PH-21 (#789), TM-03 (#768)
  - krever bygging: **9** — S3-01, S3-02, WB-04 (coach), A-19a, TE-07, TE-08, TE-09, TE-10, TE-12
  - krever Anders-beslutning: **7** — AG-19, AO-13, JV-01, JV-02, JV-03, DG-01, DG-02
  - krever datamodell: **7** — WB-08, A-19b/c, TM-08, TM-09, TM-12, TM-13, TM-14
  (Dagens avsnitt sier 3/11/9/7 — det var feil allerede før økten: WB-06 ble levert 04.09 uten at summen ble oppdatert.) Avviker opptellingen din: skriv DINE tall, og noter hvilken rad som skiller.
  Erstatt avsnittet som begynner `**Kategorisum (30 rader):** lanserbart nå 3 (WB-04 spiller, A-15, TE-03 — kun sign-off) · krever bygging 11 ·` og slutter `pluss S3 (Ø11–Ø13) som er den eneste av de 29 på den kritiske veien.` med:
  ```
  **Kategorisum (30 rader, talt på nytt 05.09 — økt 8):** lanserbart nå / levert 7 (WB-04 spiller, A-15, TE-03 — kun sign-off; S3-03 #766, WB-06 #776, PH-21 #789, TM-03 #768 — levert, sign-off/riggrad gjenstår) · krever bygging 9 (S3-01, S3-02, WB-04 coach, A-19a, TE-07, TE-08, TE-09, TE-10, TE-12) · krever Anders-beslutning 7 (AG-19, AO-13, JV-01–03, DG-01, DG-02) · krever datamodell 7. Summen 3/11/9/7 fra 02.09 var utdatert etter WB-06 (04.09) og telte WB-04 coach som beslutning etter at D2/D3 var svart. Ingen av de 29 er FULL-blokkerende alene — det som blokkerer FULL er betalingskjeden (Ø1–Ø2) og sign-off på de allerede porterte FULL-skjermene (Ø3–Ø15), pluss Ø13 (PR #771) som er den eneste av de 29 på den kritiske veien.
  ```

- [ ] **Steg 4: 10.3 — forelder-porten**
  Verifisert: PR #648 `MERGED 2026-08-29` «Forelder pikselnær Train-lock-fasiten (lys+mørk)» — alle 20 FO-filer sitert, lys/mørk kun via `--tl-*`, `fo-kit.tsx`; det som gjenstår står i STEG 20.7.
  ```bash
  grep -n "fasit-1:1-porten gjenstår" docs/MASTERPLAN-GJENSTAAENDE.md   # forventet: 1 treff (10.3)
  ```
  Erstatt hele raden med:
  ```
  | 10.3 | **F1 Forelder-helporten:** alle 9 seksjoner + `barn/[childId]` til Train-lock med lys+mørk (T4-beslutning 26.08). Mandagstelling-bugen (`hentForelderUkerapport`) er fikset. **RETTET 05.09 (økt 8):** komponentporten er LEVERT 29.08 (PR #648 — alle 20 FO-filer sitert, lys+mørk kun via `--tl-*`, `src/components/forelder/fo-kit.tsx`). Det som gjenstår er riggrader FO-01–FO-10 i lys+mørk, `barn/[childId]`-canvas og lys-verifisering → STEG 20.7 (fase 7) |
  ```

- [ ] **Steg 5: 2.1 — verktøykjeden (etter økt 7)**
  ```bash
  ls scripts/signoff-gallery.mjs scripts/signoff-side.mjs 2>&1 | head -2
  grep -c "Verktøykjeden er nå \`signoff-gallery.mjs\`" docs/MASTERPLAN-GJENSTAAENDE.md
  ```
  Er grep-tallet 0, har økt 7 allerede rettet 2.1 — hopp til steg 6. Ellers: erstatt i 2.1-raden setningen
  `Verktøykjeden er nå \`signoff-gallery.mjs\` (bilder) → \`signoff-side.mjs\` (side) — kjør begge per bølge.`
  med
  `**Verktøykjeden (rettet 05.09, fase 1):** \`scripts/signoff-trainlock.mjs\` (app- og fasit-bilder mot \`designsystem/train-lock/\`) → \`scripts/train-lock-pixel-diff.mjs\` + \`tests/visual/skjerm-mapping.ts\` (målt restavvik per riggrad). \`signoff-gallery.mjs\`/\`signoff-side.mjs\` målte mot Paper (\`designsystem/paper/fase1/\`, slettet 30.08) og fjernes i fase 1 økt 7 — omtalen av dem lenger ned i denne raden er historikk.`
  (Finnes `scripts/signoff-gallery.mjs` fortsatt, står «fjernes i fase 1 økt 7» riktig; er den borte, bytt til «er fjernet i fase 1 økt 7».)

- [ ] **Steg 6: Commit**
  ```bash
  node scripts/check-doc-lenker.mjs    # forventet: exit 0
  git add docs/MASTERPLAN-GJENSTAAENDE.md
  git commit -m "docs(masterplan): 2.12 TM-03 levert (#768), TE-12-sti rettet, kategorisum 7/9/7/7, 10.3 og 2.1 rettet

TM-03: D4 svart 03.09 + PR #768 -> lanserbart naa, sign-off gjenstaar.
TE-12/Ø24: /ny/egen ligger i src/app/portal/tren/tester/ny/egen, ikke legacy.
Kategorisum talt paa nytt (30 rader). 10.3: forelder-komponentporten levert
29.08 (#648), rigg/lys-verifisering -> STEG 20.7. 2.1: verktoeykjeden er
signoff-trainlock + train-lock-pixel-diff, ikke Paper-galleriet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 8.5: Filhoder i kode — riktig fasit, riktig avvik

**Filer (kodefilene får kun kommentarendringer):**
- Modify: `src/lib/trackman/dispersion-map.ts:21–28`
- Modify: `src/components/admin/v2/oppsett/AdminProfilTrainLock.tsx:4–14`
- Modify: `src/app/admin/profile/page.tsx:5–6`
- Modify: `src/components/admin/v2/AdminComplianceV2.tsx:4–10`
- Modify: `src/components/portal/v2/idag/GodkjenningKort.tsx:1` (nytt filhode etter `"use client";`)
- Modify: `src/lib/v2/tema-default.ts:22–24`
- Modify: `tests/visual/fasitdekning-baseline.json` (fra oppgave 1.3, økt 1 — senkes til det nye tallet, med ny `grunn`)

**Grensesnitt:** filhode-konvensjonen fra fase 1 økt 5 (` * Fasit: <fil>` + ` * Rigg: <label>` eller ` * Avvik: …`). Per HEAD 06.09 finnes verken `scripts/check-fasit-sitering.mjs` eller konvensjonen i `PORTING.md` — begge kommer i økt 5; formatet under er hentet fra økt 5-planen. Ligger skriptet i `npm run verify` når du kjører, må hver `Fasit:` under ha en `Avvik:`-linje — det har de. Sier PORTING.md da et annet format enn under: følg PORTING.md.

- [ ] **Steg 1: Mål fasitdekningen FØR endring**
  ```bash
  node scripts/maal-fasit-dekning.mjs | head -4
  ```
  Noter `sitert`-tallet (**150** på origin/main `c1c3396eb` 06.09 — samme tall økt 1-planen bruker). Skriptet teller en fil som sitert når kortnavnet (f.eks. `AG-05 Mer-ark`) forekommer i en `src/**/*.ts(x)`. Forventet etter denne oppgaven: **−2 → 148** (`AG-05 Mer-ark` og `EC-02 AS Compliance` siteres ingen andre steder — verifisert 06.09 med `grep -rl`, kun de tre filene som rettes her; `AG-18 Oppsett-hub`, `WB-04 Player godkjenning` og `TM-05 Tom og faa slag` er allerede sitert fra andre filer). Nedgangen er ekte og ønsket: to skjermer sto som «sitert» mot feil tegning. Skriv «Fasitdekning −2 (AG-05, EC-02 var feilsiteringer)» i commit-meldingen og PR-teksten.
  **Vakten fra økt 1 (oppgave 1.3, `scripts/check-fasitdekning-baseline.mjs`) sammenligner HEAD mot en committet baseline-fil, `tests/visual/fasitdekning-baseline.json` — ikke mot `origin/main`.** Å senke dekningen bevisst (som her: to feilaktige siteringer fjernes) er derfor en vanlig endring: baseline-fila endres i SAMME PR som filhodene, med ny `grunn` — synlig i diffen, ingen unntaksflagg. Sjekk at fila finnes før du fortsetter (den hører til oppgave 1.3 i økt 1, ikke til denne oppgaven):
  ```bash
  git cat-file -e HEAD:tests/visual/fasitdekning-baseline.json 2>/dev/null && cat tests/visual/fasitdekning-baseline.json || echo "FINNES IKKE"
  ```
  Forventet: JSON med `"sitert": 150` (eller et høyere tall, hvis main har fått nye siteringer siden økt 1). `FINNES IKKE`: stopp — oppgave 1.3 (økt 1) må være merget først; ikke opprett fila selv her. Baseline-fila senkes til det nye tallet i steg 8, sammen med resten av oppgaven.

- [ ] **Steg 2: `dispersion-map.ts` — foto-avlesning finnes (TM-03/D4, #768)**
  Verifisert: `src/lib/trackman/parse-photo.ts` finnes (AI-vision, fasit TM-03 C1–C4); `trackman-import-modal.tsx:96` har kilden «Foto av skjerm»; ingen PDF-parsing (`grep -in pdf` gir 0 treff i modalen).
  ```bash
  sed -n 21,28p src/lib/trackman/dispersion-map.ts
  ```
  Erstatt de åtte linjene (fra ` * Fasit: designsystem/train-lock/TM-05 Tom og faa slag.dc.html —` til ` * visningsjobb (anti-scope PX-3: bygges ikke på sparket).`) med:
  ```
   * Fasit: designsystem/train-lock/TM-05 Tom og faa slag.dc.html —
   * `generateCaddieSentence` fikk en forsiktigere lavt-n-variant («To slag
   * høyre. Median står — vent med å flytte siktet.», TM-05a viser den
   * eksakt ved n=2) i stedet for bare `null` under 8 slag. TM-05b (tom
   * TrackMan-tilstand med «CSV, PDF eller foto»): CSV/HTML (parse-csv.ts,
   * parse-html-report.ts) og foto (parse-photo.ts, AI-vision — TM-03/D4,
   * PR #768, 03.09.2026) er bygget; PDF-import finnes fortsatt ikke. Selve
   * tom-tilstanden tegnes av importmodalen, ikke av dette laget.
   * Avvik: ingen riggrad for TM-05 — dette er domenelogikk uten egen rute;
   * skjermen måles via TM-11/økt-detalj (TrackManSessionDetail.tsx).
  ```
  ```bash
  grep -c "foto-OCR" src/lib/trackman/dispersion-map.ts    # forventet: 0
  ```

- [ ] **Steg 3: `AdminProfilTrainLock.tsx` — AG-18, ikke AG-05**
  Verifisert 06.09 (`data-screen-label`): `AG-18 Oppsett-hub.dc.html` har rammene AG-18a Oppsett-hub iPhone / AG-18b iPad / AG-18c Mac med en «Konto»-rad i hver (tre treff; navnet «Anders Kristiansen» står i én av dem). `AG-05 Mer-ark.dc.html` har én ramme, «AG-05 Mer-ark» — Mer-arket (Plan/Innsikt/Oppsett/Klubb), ikke et konto-skjema.
  ```bash
  sed -n 4,14p src/components/admin/v2/oppsett/AdminProfilTrainLock.tsx
  ```
  Erstatt blokken fra ` * AgencyOS Konto (Min coach-profil) — Train-lock (T13, 26.08.2026).` til og med ` * Tokens: KUN TL — CLAUDE.md invariant 2.` med:
  ```
   * AgencyOS Konto (Min coach-profil) — Train-lock (T13, 26.08.2026).
   *
   * Fasit: designsystem/train-lock/AG-18 Oppsett-hub.dc.html — «Konto»-raden
   * (AG-18a iPhone / AG-18b iPad / AG-18c Mac: avatar + navn + chevron er
   * inngangen til denne siden) + DESIGN-SYSTEM.md §5 Liste-rad/
   * Kort. Rettet 05.09.2026: siterte tidligere AG-05 Mer-ark, som er Mer-
   * arket (Plan/Innsikt/Oppsett/Klubb) — ikke konto-skjemaet.
   * Avvik: ingen Train-lock-fil tegner selve coach-profil-skjemaet. Felt-
   * layouten er en mønster-port av den gamle AdminProfilV2 (Paper, slettet
   * 30.08), ikke pixel; ingen riggrad. Samme datakontrakt (AdminProfilV2Data)
   * og SAMME server actions (oppdaterCoachProfil, uploadAvatar, skalerAvatar)
   * — designport, ikke funksjonsendring.
   *
   * Tokens: KUN TL — CLAUDE.md invariant 2.
  ```

- [ ] **Steg 4: `src/app/admin/profile/page.tsx`**
  ```bash
  sed -n 4,6p src/app/admin/profile/page.tsx
  ```
  Erstatt ` * fasit: designsystem/train-lock/AG-05 Mer-ark.dc.html («Konto»-mønsteret),` + ` * se AdminProfilTrainLock for begrunnelse.` med
  ```
   * Fasit: designsystem/train-lock/AG-18 Oppsett-hub.dc.html («Konto»-raden),
   * se AdminProfilTrainLock for avviksliste (ingen riggrad, skjema uten fasit).
  ```
  Behold linjeslutten ` Samme requirePortalUser-guard,` slik den står (den er del av samme setning — les linje 6 før du redigerer).

- [ ] **Steg 5: `AdminComplianceV2.tsx` — ingen fasit, etterlevelse er ikke tegnet**
  Verifisert 06.09: EC-02-rammene (EC-02a Compliance iPhone … EC-02e Compliance Mac lys) viser «Økonomi · AK Golf AS · org. 927 481 553 · Frister · MVA · 3. termin · Årsregnskap 2025 · Skattemelding 2025» — selskapets AS-etterlevelse (25 treff på MVA/Årsregnskap/Skattemelding). Koden (`src/lib/admin-compliance/compliance-data.ts`) regner plan-fullføring per spiller fra `trainingPlanSession`. Økonomi-flaten (`AdminOkonomiV2.tsx`) siterer EC-01, ikke EC-02 — om EC-02 skal bygges der er en fase 6-sak, ikke noe som siteres nå.
  ```bash
  sed -n 4,10p src/components/admin/v2/AdminComplianceV2.tsx
  ```
  Erstatt fra ` * AgencyOS Compliance — Train-lock EC-02 (PX-6, 29.08.2026).` til og med ` * (train-lock.ts) — ingen ad-hoc UI, ingen rå hex.` med:
  ```
   * AgencyOS Compliance — treningsetterlevelse i stallen (PX-6, 29.08.2026).
   *
   * Ingen Train-lock-fasit — etterlevelse er ikke tegnet. Filhodet siterte
   * tidligere EC-02 (rettet 05.09.2026, fase 1 økt 8): den tegningen er
   * selskapets MVA-terminer, årsregnskap og skattemelding (AS-etterlevelse i
   * Økonomi), ikke plan-mot-virkelighet for spillere. Skjermen er bygget av
   * `TL.*` (train-lock.ts) + DESIGN-SYSTEM.md-komponentene — ingen ad-hoc UI,
   * ingen rå hex — og tegnes som canvas før neste omtegning (beslutning
   * 30.08 «tegn skjermen før du bygger den»). Plan møter virkelighet på
   * tvers av stallen, drevet av EKTE ComplianceData fra loadComplianceData
   * (Prisma).
  ```
  ```bash
  grep -c "EC-02 AS Compliance" src/components/admin/v2/AdminComplianceV2.tsx   # forventet: 0
  ```

- [ ] **Steg 6: `GodkjenningKort.tsx` — Fasit WB-04 spiller-rammer + Avvik**
  Verifisert mot fasitrammen «WB-04 iPhone forslag» (tekst lest ut av fila 05.09): «Anders la inn en ny økt · i går 20.14», tittel, «Ons 26.08 · 16.00–18.00 · 2 t», chips SLAG · INNSPILL_50 · M3, «Drills · 4» med full liste og reps («Stige 50–70–90 3 × 9» …), sitat, forklaring «Godtar du, havner økten i planen din …», tre handlinger Godta / Foreslå ny tid / Avvis, og egne etter-tilstander «Godtatt» / «Avvist» med «Din melding». Komponenten viser caps-kilde, tittel, `tid · varighet · pyramide`, kun antall drills, sitat, hint, Godta (TL.ok) + Avvis (ghost), toast etterpå.
  Sett inn etter linje 1 (`"use client";`) og den tomme linjen:
  ```
  /**
   * PlayerHQ I dag — godkjenningskort for forslag fra coach eller gruppe.
   *
   * Fasit: designsystem/train-lock/WB-04 Player godkjenning 3 skall.dc.html —
   * spiller-rammene «WB-04 iPhone forslag» / «WB-04 iPhone godtatt» /
   * «WB-04 iPhone avvist». Mac/iPad-rammene («WB-04 Mac player godkjenn»,
   * «WB-04 iPad godkjenn») er coach-siden (MASTERPLAN STEG 20.3), ikke dette kortet.
   * Avvik (05.09.2026, ingen riggrad ennå — fase 2):
   *   - fasitens drill-liste med reps («Stige 50–70–90 3 × 9» …) vises som
   *     antall (approvalDrillsCount), ikke som liste;
   *   - fasitens tredje handling «Foreslå ny tid» finnes ikke — kun Godta/Avvis;
   *   - fasitens etter-tilstander (egne kort «Godtatt»/«Avvist» med melding
   *     til coach) er toast + kortet forsvinner; Avvis skjuler økten
   *     (hiddenByPlayer) og sender ingen melding;
   *   - fasitens caps-chips (SLAG · INNSPILL_50 · M3) er én metalinje
   *     «tid · varighet · pyramide» — M-nivåer er utgått vokabular (18.08.2026).
   * «Godta» er eneste sted TL.ok (#30D158) brukes i flyten (CLAUDE.md
   * invariant 2); «Avvis» er nøytral ghost, aldri rød.
   */
  ```
  ```bash
  grep -c "WB-04 Player godkjenning" src/components/portal/v2/idag/GodkjenningKort.tsx   # forventet: 1
  ```

- [ ] **Steg 7: `tema-default.ts` — forelder-porten er levert (#648), rigg gjenstår**
  ```bash
  sed -n 22,24p src/lib/v2/tema-default.ts
  ```
  Erstatt de tre linjene ` *   kun at bryteren (mørk-valget) faktisk må fungere visuelt der også, ikke bare` / ` *   på /portal og /admin. Skjermporten er ikke gjort ennå.` / ` * - Landingssidene er alltid lyse (egen fasit, ak-golf-website).` med:
  ```
   *   kun at bryteren (mørk-valget) faktisk må fungere visuelt der også, ikke bare
   *   på /portal og /admin. Komponentporten er levert 29.08.2026 (PR #648, alle
   *   20 FO-filer sitert, lys+mørk kun via `--tl-*`); riggrader og lys-
   *   verifisering gjenstår (MASTERPLAN STEG 20.7, fase 7).
   * - Landingssidene er alltid lyse (fasit: AK Golf-masteren `designsystem/ak-golf/`,
   *   Anders 04.09.2026 — `ak-golf-website` er utgått som fasit).
  ```
  (Siste punkt er verifisert mot `.claude/rules/beslutninger.md` §MARKEDSSIDENE PORTERES TIL MASTER AK GOLF og CLAUDE.md invariant 2 — begge sier at `ak-golf-website` er utgått.)
  ```bash
  grep -c "Skjermporten er ikke gjort ennå" src/lib/v2/tema-default.ts   # forventet: 0
  ```

- [ ] **Steg 8: Senk baseline-fila, mål dekning ETTER, kjør verify**
  ```bash
  node scripts/maal-fasit-dekning.mjs | head -4          # forventet: sitert = tallet fra steg 1 minus 2 (148 mot 150)
  grep -rl "AG-05 Mer-ark\|EC-02 AS Compliance" src       # forventet: tom
  ```
  Oppdater `tests/visual/fasitdekning-baseline.json` (oppgave 1.3, økt 1) til det nye tallet, med ny `grunn` (behold `av` uendret — kun `sitert`, `sistEndret` og `grunn` endres her; er `av` et annet tall enn 210 i den committede fila fordi main har fått flere Train-lock-tegninger siden økt 1, la det stå urørt):
  ```json
  {
    "sitert": 148,
    "av": 210,
    "sistEndret": "2026-09-06",
    "grunn": "fase 1 økt 8: fjernet feilaktige siteringer AG-05 (AdminProfilTrainLock) og EC-02 (AdminComplianceV2)"
  }
  ```
  ```bash
  npm run verify > "$S/verify.log" 2>&1; echo "exit=$?"; tail -20 "$S/verify.log"
  ```
  Forventet `exit=0` — `check-fasitdekning-baseline.mjs` (oppgave 1.3, økt 1) sammenligner nå HEAD (148) mot den nettopp senkede baselinen (148), ikke mot en gren. Rødt: `grep -n "error\|Error\|FEIL" "$S/verify.log"` — kommentarendringer skal ikke kunne gi tsc/eslint-feil; feiler `check-fasit-sitering.mjs` (økt 5), les dens melding og rett filhodet den peker på (den vil kreve `Avvik:`/`Rigg:` etter `Fasit:` — alle fem `Fasit:`-linjene over har det); feiler `check-fasitdekning-baseline.mjs` fortsatt, sjekk at `sitert` i baseline-fila faktisk ble satt til 148 (eller ditt målte tall).

- [ ] **Steg 9: Commit**
  ```bash
  git add src/lib/trackman/dispersion-map.ts src/components/admin/v2/oppsett/AdminProfilTrainLock.tsx src/app/admin/profile/page.tsx src/components/admin/v2/AdminComplianceV2.tsx src/components/portal/v2/idag/GodkjenningKort.tsx src/lib/v2/tema-default.ts tests/visual/fasitdekning-baseline.json
  git commit -m "docs(filhoder): riktig fasit og avvik i seks filer — AG-18 ikke AG-05, EC-02 ut, WB-04 inn, foto-avlesning finnes

Kun kommentarer i kodefilene. AdminProfilTrainLock/profile-side siterer AG-18
Oppsett-hub (Konto-raden) med avviksliste; AdminComplianceV2 erklaerer ingen
fasit (EC-02 er MVA-frister, ikke treningsetterlevelse); GodkjenningKort faar
Fasit WB-04 spiller-rammer + fire avvik; dispersion-map sier at foto-avlesning
finnes (TM-03/D4, #768) og PDF ikke; tema-default sier forelder-porten er
levert (#648) og at rigg/lys-verifisering gjenstaar (STEG 20.7). Fasitdekning
-2 (AG-05, EC-02 var feilsiteringer) — tests/visual/fasitdekning-baseline.json
(oppgave 1.3, økt 1) senket til 148 med ny \"grunn\", i samme PR.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 8.6: PR og merge

- [ ] **Steg 1: Siste sjekk og push**
  ```bash
  git status --short                     # forventet: tom
  git log --oneline origin/main..HEAD    # forventet: 5 commits (8.1–8.5)
  git push -u origin claude/fase1-okt8-dokumenter-siteringer
  ```
- [ ] **Steg 2: PR**
  ```bash
  gh pr create --base main --title "docs(fase 1, økt 8): dokumenter og siteringer — D3 registrert, HANDOFF proto-batch + AX-01, 2.12 rettet, filhoder" --body "$(cat <<'EOF'
## Sammendrag
Fase 1 økt 8 i `docs/superpowers/plans/2026-09-05-komplett-designport.md` (§4 Fase 1, punkt 8). Kun dokumenter og kommentarer — ingen funksjonsendring, ingen tokens.

- D3 (Spiller 360 på én adresse, 03.09) registrert i `beslutninger.md` og lukket i MASTERPLAN 1C; 2.12 S3-rader og WB-04 coach rettet; STATUS-NÅ oppdatert.
- HANDOFF.md: proto-batch 1–4 flettet inn fra `referanse/proto-handoff-batch-1-4-2026-09-02.md` (PR #790, identisk med zip 05.09), 03.09-rettelsen på linje 28 beholdt; «Meny per enhet» merket SUPERSEDERT 25.08.2026 — se AX-01. README: proto/ synkes ikke før beslutning 7 (kø 32).
- SCREEN-INDEX: lys-linjen teller 28 filer + lys-rammer i mørke filer.
- MASTERPLAN 2.12: TM-03 levert (#768), TE-12-sti rettet (`/ny/egen` er ikke i legacy), kategorisum 7/9/7/7; 10.3 og 2.1 rettet.
- Filhoder: AG-18 ikke AG-05 (profil), EC-02-sitatet ut (compliance), WB-04 inn med avvik (GodkjenningKort), foto-avlesning finnes (dispersion-map), forelder-porten levert (tema-default). Fasitdekning −2 (150 → 148), bevisst: AG-05 og EC-02 var feilsiteringer — `tests/visual/fasitdekning-baseline.json` (oppgave 1.3, økt 1) senket i samme PR med ny `grunn`.

## Verifisering
- `node scripts/check-doc-lenker.mjs` grønn på hver docs-commit
- `npm run verify` grønn før kode-commit (kun kommentarer)
- HANDOFF.md 443–478 identisk med `referanse/proto-handoff-batch-1-4-2026-09-02.md` linje 5–40; linje 28 (03.09-rettelsen) beholdt

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
  ```
- [ ] **Steg 3: Vent på grønn CI, merge, slett gren**
  ```bash
  gh pr checks --watch
  gh pr merge --squash --delete-branch
  git checkout main && git pull --ff-only origin main
  ```

---

### Ferdig når (målbart, med kommando)

Alle kjøres fra `main` etter merge:

```bash
grep -c "SPILLER 360 PÅ ÉN ADRESSE — D3" .claude/rules/beslutninger.md                       # 1
grep -c "SVART 03.09: én adresse" docs/MASTERPLAN-GJENSTAAENDE.md                             # 1
grep -c "SUPERSEDERT 25.08.2026 — se AX-01" designsystem/train-lock/HANDOFF.md                 # 4
grep -c "^## 02.09.2026 — Klikkbar prototype, batch" designsystem/train-lock/HANDOFF.md        # 4
grep -c "RETTET 03.09.2026" designsystem/train-lock/HANDOFF.md                                 # 1
grep -c "designport-beslutning 7" designsystem/train-lock/README.md                            # 1
grep -c "28 skjermer" designsystem/train-lock/SCREEN-INDEX.md                                  # 1
grep -c "ligger fortsatt i \`(legacy)\`\|fasit-1:1-porten gjenstår\|avgjøres i D3-canvasen" docs/MASTERPLAN-GJENSTAAENDE.md   # 0
grep -c "etterkontroll-skjermbilder på 15.4/15.5/15.6/15.8/15.9.~~" docs/STATUS-NÅ.md          # 1
grep -rl "AG-05 Mer-ark\|EC-02 AS Compliance" src | wc -l                                      # 0
grep -c "foto-OCR" src/lib/trackman/dispersion-map.ts                                          # 0
grep -c "Skjermporten er ikke gjort ennå" src/lib/v2/tema-default.ts                           # 0
grep -c "WB-04 Player godkjenning" src/components/portal/v2/idag/GodkjenningKort.tsx           # 1
node -e "console.log(require('./tests/visual/fasitdekning-baseline.json').sitert)"             # 148 (eller lavere enn 150 fra økt 1, hvis main endret det i mellomtiden)
node scripts/check-fasitdekning-baseline.mjs; echo $?                                          # 0
node scripts/check-doc-lenker.mjs; echo $?                                                     # 0
```
Pluss: `npm run verify` grønn i CI på PR-en, og PR-en er merget til main.

### Åpne funn (ikke løst her)

1. **HANDOFF «7 komponenter» punkt 1 og 5** (linje 269 og 273 i dag; 270 og 274 etter oppgave 8.1, som setter inn én linje ved 264: «Agency-dock: 5 like kolonner …» og «Rail Mac 64: 7 ikon 44 …») er også pre-AX-01, men utenfor planens 263–266. Bør merkes i samme stil når AX-01-hullene tas i fase 3.
2. **WB-04-fasiten bruker «M3»** (M-nivå, utgått vokabular 18.08) i chips-raden. Riggraden for WB-04 (spiller) i fase 2 vil måle mot en tegning med utgått tekst — noter det som `aarsak` i raden, ikke tegn om.
3. **SYNC-STATUS.md** sier «sist synket 01.09». Zip-en 05.09 er bevisst ikke synket (beslutning §KOMPLETT DESIGNPORT punkt 2–3), men fila sier ikke det. Én linje hører hjemme der når beslutning 7 stilles.
4. **`docs/superpowers/plans/2026-09-05-designport-fase-1.md`** refereres fra `beslutninger.md:36` og MASTERPLAN 20.1, men lå 06.09 kun som untracked fil i arbeidstreet (ikke i PR #790, som bare har komplett-designport + vedlegg + `ae73b1658`-innholdet). `check-doc-lenker.mjs` er grønn lokalt fordi fila finnes der, men feiler på origin/main til den er committet — og #790 selv blir rød i CI av samme grunn. Økten som samler fase 1-planen må lande den (med økt-filene) før noen økt kan committe docs.
5. **PR #771 (Ø13)** har stått urørt siden 03.09 10:28 og siterer S3-01/S3-02/AG-08 med «bevisste forenklinger» i filhodene — når den merges, skal filhodene få `Avvik:`-linjer i økt 5-formatet, ellers slår `check-fasit-sitering.mjs` ut.
6. **`shell.tsx:1315`** låner AG-05-geometri (Mer-arket) med omtale «AG-05» uten fullt filnavn — korrekt bruk, urørt; men det betyr at `maal-fasit-dekning.mjs` ikke lenger regner AG-05 som sitert etter denne økten. Ønskes AG-05 tellet, må Mer-ark-komponenten selv få en `Fasit:`-linje (fase 3/6), ikke profil-siden.
7. **STATUS-NÅ linje 40–47** nevner D4 og resten av 02.09-køen som «alle svart og gjennomført samme dag» — D3-delen rettes i 8.3, men avsnittet ligger i «Hovedbildet 03.09 (historikk)»; det levende bildet er «Hovedbildet 05.09» (linje 14–37), som allerede sier Ø13 = PR #771. Ikke skriv historikk-seksjonene om utover faktafeilene i 8.3.
8. **EC-02 er usitert etter 8.5** og hører tematisk til Økonomi-flaten (`src/components/admin/v2/AdminOkonomiV2.tsx` siterer EC-01). Om AS-etterlevelsen (MVA-terminer, årsregnskap) skal bygges der, er en fase 6-sak — ikke siter EC-02 derfra for å holde dekningstallet.
