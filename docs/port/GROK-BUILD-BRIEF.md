# Brief til Grok Build — fortsett skjermporten trygt fra MacBook Air

**Skrevet:** 06.08.2026 av Claude (på oppdrag fra Anders) · **Status:** til gjennomlesing FØR noe bygges.
**Mål med dette dokumentet:** at Grok Build kan fortsette design-porten til Claude Paper
(`docs/port/plan-designport-alle-skjermer.md`) fra en frisk `git pull` på en annen maskin, uten
MCP-tilgang til Claude Design-prosjektet, uten å ødelegge arbeid som allerede er gjort, og uten å
bryte reglene i `CLAUDE.md`.

**Til Grok:** les hele dette dokumentet FØR du rører en fil. Deretter les kildene i §2 i den
rekkefølgen som er oppgitt. Bygg IKKE noe før du har lest alle tre.

---

## 0. Én ting Anders må avgjøre først (ikke Grok sin sak å løse)

Siste commit på denne grenen (`c3acf1f`, i dag 06.08.2026) låser: **«Modellen for dette arbeidet
er Sonnet 5 … gjennomgående for resten av porteringen»** (`plan-designport-alle-skjermer.md`
§«Løpende skjermdesign fra 2026-08-06»). Ønsket om å bruke Grok Build i stedet er en reell endring
av den beslutningen fra samme dag den ble tatt. Det er ikke i seg selv farlig — men det bør stå
eksplisitt et sted (f.eks. som en oppdatering i samme paragraf) at Grok kjører deler av porten,
ellers sprer beslutningen seg i to versjoner. Ikke noe Grok skal avgjøre — bare noe som bør rettes
i dokumentet når Anders har bestemt seg.

---

## 1. Harde regler — brytes ALDRI, uansett hvilken AI som bygger

Disse gjelder uavhengig av verktøy og står fullt ut i `CLAUDE.md` og `.claude/rules/`. Kortversjon:

1. **Anbefalinger sperrer aldri** — ingenting i appen blokkerer trening.
2. **Claude Paper vinner alltid.** Design-prosjektet `605a48cc` (skjermer i `fase1/`/`fase2/`) er
   eneste designfasit. Sier noe annet noe annet — rett dokumentet, ikke følg det.
3. **Norsk bokmål** i all UI-tekst. Ikke oversett, ikke dikt — hent fra `docs/skjermtekst/`.
4. **Lucide-ikoner** — aldri emoji i UI.
5. **Domenelogikk kun i `src/lib/domain/`** — aldri i komponenter.
6. **`as unknown as T` er forbudt** for forretningskritiske data — zod-schemas
   (`src/lib/validation/schemas.ts`).
7. **`main` er porten.** Arbeid skjer i branch + PR. **Aldri push til main uten Anders' eksplisitte
   «ja» i samtalen** — ingen unntak for skjermarbeid.
8. **Enkelhet:** minst mulig trykk, super enkelt UI. Vanskelig å forstå = feil design.

Fullstendig regelverk: `CLAUDE.md` (rot) + `.claude/rules/gotchas.md` (kjente feller — les FØR
koding, spesielt tema-mekanisme og Prisma-seksjonene) + `.claude/rules/beslutninger.md`.

---

## 2. Designfasiten — hva Grok skal lese, i denne rekkefølgen

Grok har ikke `claude-design`-MCP-tilgang slik Claude Code-økter i dette repoet har. Derfor er
**zip-filen din erstatningen** for den levende kilden. Zippen skal inneholde samme struktur som
`designsystem/paper/` i repoet (36 filer i `fase1/`, `fase2/playerhq/`, `guidelines/`,
`components/`, `tokens/`, `styles.css`) — dette er kun et **lokalt speil** og kan henge etter den
egentlige kilden, men uten MCP-tilgang er zippen alt Grok har, så den ER kilden for denne økten.

**Legg zip-innholdet inn i `designsystem/paper/` i din lokale kopi av repoet — overskriv, ikke
slett noe utenfor den mappa.** Sjekk `designsystem/paper/readme.md` for filantall/dato og
sammenlign med det zippen inneholder; hvis zippen er nyere (flere filer i `fase1/`/`fase2/`), er
det et signal om at speilet i repoet er utdatert og bør committes oppdatert som egen liten PR
FØR skjermarbeidet starter (se §5, «Steg 0»).

Les disse tre dokumentene i denne rekkefølgen — de er skrevet nettopp for å gi en AI uten
levende MCP-tilgang alt den trenger:

1. **`docs/port/fasit-liste-paper.md`** — hvilke ekte ruter i appen som HAR en tegnet Paper-skjerm
   (44 filer akkurat nå), og hvilke som ikke har. Bygg ALDRI en skjerm uten å sjekke denne
   tabellen først — har ruten fasit, bygg 1:1 mot den HTML-filen, ikke mot mønsterdokumentet.
2. **`docs/port/monsterdokument-paper.md`** — **eneste designkilde for de ~300 skjermene som ikke
   har egen fasit.** Destillert fra fasit-filene + `guidelines/`: grunnlayout, «Én ting
   nå»-mønsteret, typografi, farger/tokens, komponentmønstre (kort, badges, tomtilstand, tabeller),
   interaksjon, forbud, og §8–12 (skjema/tabell/filter/dashbord/detaljside-mønstre med eksakte
   komponentnavn: `Stepper`, `DataTable`, `FilterPills`, `Pagination`, `CardGrid`, `KpiStripe`,
   `PageHeader`, `Panel`, `KeyValueGrid`). Dekker dokumentet IKKE mønsteret en ny skjerm trenger →
   **stopp og spør Anders**, ikke gjett.
3. **`docs/port/plan-designport-alle-skjermer.md`** — prosessen: hvilken rekkefølge skjermene
   bygges i, hva som er «ferdig», og hva som allerede er gjort (så Grok ikke bygger noe på nytt
   eller i feil rekkefølge). Nøkkelseksjoner:
   - **§Ferdig-definisjon per skjerm** — den bindende kvalitetsporten (8 punkter, se §6 under).
   - **§Status per steg** og **§Steg 7 delstatus** — hva som er merget, hva som gjenstår, og
     **§Avviksliste** som lister konkrete mangler på de 4 allerede merget PlayerHQ-skjermene
     (Hjem, Planlegge, Analysere, Meg) — disse skal OMBYGGES, ikke regnes som ferdige.
   - **§Revidert steg 7-plan** og **§Løpende skjermdesign fra 2026-08-06** — hva som er neste
     skjerm i køen. **Sjekk denne tabellen live før hver skjerm** — den endrer seg oftere enn
     dette brief-dokumentet blir oppdatert.

Ved konflikt mellom disse tre og en faktisk `fase1/`/`fase2/`-HTML-fil: **HTML-filen vinner.**
Ved konflikt mellom et hvilket som helst dokument og `docs/platform/BUSINESS-RULES.md`:
**BUSINESS-RULES.md vinner** for forretningsregler (abonnement, booking, GDPR osv.).

---

## 3. Hvordan komponentene skal brukes på nye skjermer

Kort fasit — full versjon i `monsterdokument-paper.md` og `.claude/rules/arkitektur.md`:

- **Primitiver:** `src/components/ui/` (21 shadcn-baserte: Button, Dialog, Sheet, Popover,
  DropdownMenu, Tabs, Input, KpiCard, ProgressRing …) + `src/components/v2/` (delte v2-mønstre:
  shell, kalender, datavis, hjelp) + `src/components/athletic/golfdata/` (v13 golfdata-komponenter).
- **Panel eier flaten, kortene er rammeløse (LÅST 05.08.2026):** aldri legg egen ramme på et
  golfdata-kort som ligger inni et `Panel` — det gir dobbel kant.
- **Layout:** desktop-skall `64px rail + hovedkolonne + 380px (AgencyOS) / 360px (PlayerHQ)
  artefaktpanel`. Hovedkolonne `max-width:74ch` (AgencyOS) eller `720px` (PlayerHQ). Mobil:
  bunnfaner, composer bunnfestet med `env(safe-area-inset-bottom)`.
- **«Én ting nå»:** maks ÉN oransje handling (`--accent`/`#D97757`) synlig per skjermtilstand.
  Aksentfarge ellers KUN fokusring/logoprikk/`--accent-soft`-flate — aldri på badges/tall/status.
- **Tokens, aldri hex:** farger/avstand/radius fra `src/app/globals.css` (`--bg`, `--surface`,
  `--border`, `--fg`, `--muted`, `--accent`, `--up`/`--dn`/`--info`, `--r`, `--s1..--s8`).
  `scripts/check-token-gap.mjs` (kobles inn i CI) stopper nye hardkodede farger.
- **Tema:** `data-v2-tema` på `<html>` er ENESTE mekanisme (ryddet 03.08.2026) — sett aldri
  `className="dark"`, introduser ingen ny tema-mekanisme. **Kjent felle:** i mørkt tema er
  `primary` og `accent` samme lime-farge — bruk alltid `-foreground`-paret
  (`bg-primary text-primary-foreground`), aldri `accent` som tekstfarge på `primary`
  (`.claude/rules/gotchas.md`).
- **Fonter:** Paper-fasiten er Poppins (UI/titler) + Lora (prosa/AI-svar) + IBM Plex Mono (tall),
  koblet til `--font-sans/-display/-mono` (PR #298, merget). Ikke gjeninnfør Inter Tight.
- **Skjemaer:** `Stepper` for flerstegsflyt (viser posisjon, navigerer IKKE). Feltvalidering/
  lagre-rad er fortsatt uavklart i mønsterdokumentet §8 — spør Anders før en skjerm med reell
  feltvalidering bygges.
- **Tabeller:** `DataTable` — scroller alltid horisontalt i egen container på smal skjerm. Det
  finnes IKKE noe «tabell blir til kort på mobil»-mønster — ikke oppfinn ett.

---

## 4. Verifisering — hvordan Grok BEVISER at en skjerm er identisk

Skjermbilde-gaten i §7 er den bindende, MENNESKELIGE sjekken — Anders ser og godkjenner. Men
Grok trenger noe å teste MOT før den ber om den godkjenningen, ellers er «identisk» bare en
påstand. Dette repoet har tre uavhengige, maskinelle sjekker — bruk alle tre, i denne
rekkefølgen, FØR skjermbildene sendes til Anders:

### 4.1 Token-compliance (finnes allerede, null nye avhengigheter)
```bash
node scripts/check-token-gap.mjs
```
Fanger hardkodet hex/px utenfor `--`-tokens — samme skript som kjører i `npm run verify` og CI.
Feiler denne, er skjermen garantert IKKE identisk med Paper-fasiten uansett hvordan den ser ut
visuelt, fordi fasiten aldri bruker rå hex/px (§3 over, §7 i `monsterdokument-paper.md`).

### 4.2 Pixel-for-pixel visuell diff (nytt, Playwright-native, null nye avhengigheter)
`tests/e2e/_paper-fasit-helpers.ts` + `tests/e2e/paper-visual/portal-analysere.visual.spec.ts`
(eksempel-mønster, kopier for hver ny skjerm) sammenligner et faktisk skjermbilde av den BYGDE
ruta mot et skjermbilde av FASIT-HTML-filen — pixel for pixel, med Playwright sin innebygde
`toHaveScreenshot()` (bruker `pixelmatch` internt, allerede en del av `@playwright/test`, ingen
ny `npm install`). Helper-filen forklarer hvorfor: fasit-filene er demo-stillas
(`data-theme`-attributt for tema, `[data-tilstand]`-knapper for Suksess/Tom/Laster/Feil,
`[data-demo-only]`/`.state-switch` som ALDRI skal porteres) — helperen setter riktig tilstand og
skjuler demo-kromet før skjermbildet tas, slik at det kun er ekte innhold som sammenlignes.

**Bruk (per skjerm):**
1. **Seed** baseline fra fasit-filen ÉN gang (og på nytt hvis fasiten endres):
   ```bash
   PAPER_SEED=1 npx playwright test tests/e2e/paper-visual/<skjerm>.visual.spec.ts --update-snapshots
   ```
   Commit de resulterende PNG-ene i `<fil>-snapshots/` — det er nå den faste referansen.
2. **Sjekk** den bygde ruta mot den referansen, hver gang koden endres:
   ```bash
   npx playwright test tests/e2e/paper-visual/<skjerm>.visual.spec.ts
   ```
   Rødt → åpne `test-results/…/*-diff.png` (Playwright genererer den automatisk) og se nøyaktig
   hvor det avviker, før noe sendes til Anders.
3. Kopier eksempel-spec-en for hver nye skjerm: bytt `FASIT_ABS_PATH`, `BUILT_ROUTE` og
   `BUILT_CONTENT_SELECTOR` (må pekes til den bygde sidens faktiske innholds-wrapper, ikke
   rail/nav-chrome rundt den). `maxDiffPixelRatio: 0.04` er en romslig terskel (font-rendering/
   anti-aliasing varierer selv ved identisk layout) — IKKE sett til 0, men stram inn om ønskelig.

Dette fanger layout-, spacing- og fargedrift maskinelt. Det fanger IKKE feil interaksjon
(sjekkes ved klikk-verifisering, §7 punkt 7) eller diktet copy (sjekkes manuelt mot
`docs/skjermtekst/`).

### 4.3 Fasit-samsvar som tekst (rask sunn fornuft-sjekk)
Før du åpner PR: les gjennom fasit-HTML-filen (eller mønsterdokument-seksjonen) én gang til og
kryss av punktene i §6 «Ferdig-definisjon» manuelt — antall oransje handlinger, alle fire
tilstander bygget, artefaktpanel-bredde (380/360px), trådbredde (74ch/720px). De tre sjekkene
over er maskinelle støtter, ikke en fullstendig erstatning for å faktisk lese fasiten.

**Rekkefølge:** 4.1 → 4.2 → 4.3 → skjermbilder til Anders (§7 steg 5). Ingen av de tre erstatter
skjermbilde-gaten — de reduserer sjansen for at Anders oppdager noe en maskin kunne fanget først.

---

## 5. Ikke ødelegg noe — sikkerhetsregler for Grok spesifikt

Disse er ufravikelige fordi Grok jobber uten hookene (`beskytt.mjs`, `kvalitetsjekk.mjs`) som
håndhever dem automatisk i Claude Code-økter i dette repoet:

1. **Aldri rør:** `.env*` (unntatt `.env.example`), `prisma/schema.prisma`, `src/lib/env.ts`,
   `vercel.json`, CI-workflows (`.github/workflows/*`), `package.json`-dependencies. Trenger en
   skjerm noe av dette → stopp og spør Anders, ikke gjør det selv.
2. **Aldri kjør** `prisma migrate dev`, `prisma db push`, `prisma migrate deploy`, `vercel deploy
   --prod`, `git push --force`, `git reset --hard`, `git clean -f`, sletting av branches på
   remote. Se `.claude/rules/gotchas.md` §Schema-endringer for hvorfor de tre Prisma-kommandoene
   er ødelagt i dette repoet spesifikt.
3. **Én skjerm = én branch = én PR.** Aldri flere skjermer i samme PR, aldri endre filer utenfor
   skjermen du bygger (ingen «mens jeg var der»-opprydding).
4. **Aldri push til `main`.** Selv om Grok tror endringen er triviell. `main` krever Anders'
   eksplisitte «ja» i samtalen — ingen automatisk push dit under noen omstendighet.
5. **Aldri merge din egen PR.** Grok åpner PR-en (draft er fint), Anders godkjenner etter
   skjermbilde-gaten (§6).
6. **Kjør `npm run verify && npm test` grønt før hver commit.** Rødt bygg committes aldri.
7. **Ikke installer nye npm-pakker** uten å spørre Anders — dependencies er alltid
   «be Anders før»-kategorien i `CLAUDE.md` §Arbeidsregler.

---

## 6. Steg-for-steg-arbeidsflyt (per skjerm, følges nøyaktig)

**Steg 0 — engangs, kun første gang på denne maskinen:**
```bash
git clone <repo-url> ~/Developer/akgolf-hq   # eller: cd ~/Developer/akgolf-hq && git pull origin main
cd ~/Developer/akgolf-hq
npm ci
```
Pakk ut zip-innholdet i `designsystem/paper/` (se §2). Hvis zippen er nyere enn det som ligger i
repoet: commit oppdateringen som egen liten PR ALENE (ingen skjermkode i samme PR), med tittel
i stil `docs(paper): oppdater lokalt speil fra Claude Design`.

**Steg 1 — finn neste skjerm i køen:**
Les `plan-designport-alle-skjermer.md` §Status per steg / §Løpende skjermdesign — IKKE gjett,
IKKE start på en skjerm fordi den virker enkel. Rekkefølgen er bevisst (PlayerHQ-bølgen først,
deretter AgencyOS, deretter resten) og flere «merget» skjermer i tabellen har faktisk et åpent
avvik som skal rettes FØR nye skjermer startes (§Avviksliste).

**Steg 2 — branch:**
```bash
git checkout main && git pull origin main
git checkout -b feature/paper-<rute-kortnavn>   # f.eks. feature/paper-portal-analysere
```

**Steg 3 — bygg mot fasit:**
- Har ruten en fasit-fil (§2 punkt 1) → bygg 1:1 mot den HTML-filen (layout, IA, interaksjon —
  ikke bare farger).
- Har den ikke → bygg mot `monsterdokument-paper.md`. Treffer du et mønster dokumentet ikke
  dekker → stopp, ikke improviser en ny komponent.
- Copy fra `docs/skjermtekst/skjerm-tekst-hovedskjermer.md` — aldri diktet norsk tekst.

**Steg 4 — verifiser lokalt:**
```bash
npm run verify && npm test
```
Begge grønt, uten warnings, før noe committes.

**Steg 4b — maskinell fasit-sjekk (§4 — token-gap + pixel-diff + tekst-sjekk).** Kjør dette FØR
skjermbilder tas i steg 5, ikke etterpå — en rød pixel-diff her sparer en runde med Anders.

**Steg 5 — skjermbilde-gate (bindende, ikke valgfri):**
Ta skjermbilde av den KJØRENDE appen (lokal dev-server eller Vercel-preview), innlogget
testbruker med ekte data:
- Mobil **390px** ALLTID først, deretter desktop 1280px.
- **Lys OG mørk modus** — begge (kjent felle: primary=accent-kollisjon gir usynlig tekst).
- Fasitens tilsvarende utsnitt ved siden av (fra `designsystem/paper/fase1/` eller `fase2/`).
- Alle fire tilstander som fasiten viser: Suksess / Tom / Laster / Feil.
- Tell de oransje handlingene på bildet — maks én.
- Send bildene til Anders i samtalen (ikke bare en GitHub-lenke) — dette er hans eneste
  mulighet til å se skjermen før den kan merges.

**Steg 6 — commit, push, PR:**
```bash
git add <kun filene for denne skjermen>
git commit -m "feat(portal): port <rute> til Paper-fasit"
git push -u origin feature/paper-<rute-kortnavn>
```
Åpne PR som **draft**. Beskrivelse skal inneholde: hvilken fasit-fil/mønster som ble fulgt,
skjermbildene fra steg 5, og en bekreftelse på at `npm run verify && npm test` er grønt.

**Steg 7 — vent på Anders' «ja».**
Ikke merge. Ikke push flere endringer til `main`. PR-en ligger åpen til Anders har sett bildene
og eksplisitt godkjent i samtalen — først da merger (Anders, eller på hans eksplisitte instruks).

---

## 7. Ferdig-definisjon (kopiert fra plan-dokumentet — dette ER kvalitetsporten)

En skjerm er ferdig når ALLE 8 punktene er oppfylt — CI grønt alene er IKKE nok:

1. Skjermbilde sendt Anders i samtalen (mobil 390px først, deretter desktop 1280px).
2. Lys OG mørk modus, begge fotografert.
3. Fasit ved siden av, samme utsnitt.
4. Alle fire tilstander finnes: Suksess / Tom / Laster / Feil.
5. Maks ÉN oransje handling synlig («Én ting nå»-monopolet).
6. Copy fra `docs/skjermtekst/` — ikke diktet tekst, norsk bokmål.
7. Klikk-verifisert: ark/sheets åpner, primærhandlingen gjør noe, ingen konsollfeil.
8. Anders har sagt ja på punktene over FØR PR-en merges — aldri før.

---

## 8. Kort oppsummering å lime inn til Grok

> Les `docs/port/GROK-BUILD-BRIEF.md` i sin helhet først. Deretter, i rekkefølge:
> `docs/port/fasit-liste-paper.md` → `docs/port/monsterdokument-paper.md` →
> `docs/port/plan-designport-alle-skjermer.md`. Pakk zip-innholdet fra Claude Design inn i
> `designsystem/paper/` (ikke rør noe utenfor den mappa). Bygg ÉN skjerm om gangen, alltid egen
> branch + draft-PR, aldri push til `main`, alltid `npm run verify && npm test` grønt før commit.
> Før skjermbilder tas: kjør de tre maskinelle fasit-sjekkene i §4 (token-gap, pixel-diff mot
> fasit-HTML via `tests/e2e/paper-visual/`, tekst-sjekk) — en rød sjekk der betyr skjermen IKKE
> er identisk, ikke send den til Anders ennå. Deretter alltid skjermbilde-gaten (§6 steg 5 / §7)
> før du ber om godkjenning. Er du usikker på et designmønster: stopp og spør — ikke gjett og
> ikke bygg en ny komponent på egen hånd.
