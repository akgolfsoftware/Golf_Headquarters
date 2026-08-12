> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# Fase 2 — mørketema-avklaring

**Dato:** 2026-08-02 · **Branch:** `claude/morketema-avklaring-x30oyt` · **Status:** beslutningsunderlag, venter på Anders

Dette dokumentet endrer ingen kode. Det svarer på ett spørsmål: **hvordan skal mørkt tema fungere
etter porten?** Alle tall er målt i denne sesjonen mot arbeidstreet på branchen. Ingen tall er anslag
med mindre de er merket `[anslag]` — og det er ingen slike i dette dokumentet.

> ⚠️ **To premisser fra fase 1 er FEIL.** Se §3. De er korrigert her, og korreksjonen endrer
> anbefalingen. Les §3 før du leser §5.

---

## 1. Metode

- Dev-server startet lokalt (`next dev`, Next 16.2.6, Turbopack) med dummy-env for Prisma/Supabase.
  `npm ci` sitt postinstall-`prisma generate` feilet på manglende `DIRECT_URL`; klienten ble
  generert manuelt med dummy-URL. Ingen DB-kontakt, ingen migrasjoner kjørt.
- Kaskaden er målt med Playwright (`chromium`, `/opt/pw-browsers/chromium`) mot `http://localhost:3000/`.
  `/portal` svarer `307` uten innlogging, så portal-nestingen er reprodusert ved å bygge nøyaktig
  samme DOM-kjede (`html[data-v2-tema] > … > div.golfdata-scope > div`) inne i en side som laster
  **samme kompilerte `globals.css`**, og lese ut `getComputedStyle().getPropertyValue()`. Det måler
  den ekte stilarket-kaskaden; det som ikke er dekket er portal-spesifikk inline-`style`.
- Selektorblokker og variabelnavn er talt med et script som teller `--navn:` per krøllparentes-blokk.
- Supabase MCP er fortsatt utilgjengelig (krever OAuth). Ingen DB-tall i dette dokumentet.

---

## 2. Hvilke flater er mørke i dag — per rutegruppe

Rutetall (`find … -name page.tsx | wc -l`), totalt 454 ruter:

| Rutegruppe | Ruter | Styrende mekanisme | Faktisk tilstand i dag |
|---|---|---|---|
| `(marketing)` | 72 | `html[data-v2-tema]` (default **dark**) **+** hardkodet `className="dark"` på wrapper | **Låst mørk.** Lys-cookie slår ikke gjennom — komponenten setter `.dark` uansett |
| `auth` | 15 | samme som marketing; hver `*V2`-side setter selv `className="dark"` | **Låst mørk** |
| `portal` | 167 | chrome: `html[data-v2-tema]` (cookie-styrt). Innhold: `.golfdata-scope` | **Chrome bytter, innhold er ALLTID lyst** — se §3.1 |
| `admin` | 153 (herav `(legacy)` 42) | V2Shell/`data-v2-tema`. Legacy-innhold i `.golfdata-scope` | Samme delte tilstand som portal |
| `forelder` | 11 | V2Shell per side, ingen `.dark`, ingen `golfdata-scope` i layout | Følger `data-v2-tema` |
| `team-wang` | 3 | `.wang-tp` | **Alltid samme palett** — fila har ingen mørk-gren |
| `gfgk-junior` | 6 | `.gfgk-jr` | **Alltid samme palett** — ingen mørk-gren |
| `team-gfgk` | 1 | egne klasser (`on-dark`) | Fast |
| `onboard` | 2 | `wizard-chrome.tsx` **fjerner** `data-v2-tema` aktivt | Låst lys |

### Mekanismene, presist

Det er **fire**, ikke tre:

1. **`html[data-v2-tema="dark"]`** — `globals.css:793`, 29 deklarasjoner, alle `--v2-*`-navn.
   Settes av inline-scriptet i `src/app/layout.tsx:144` (path + cookie `ak-v2-tema`), og synkes
   ved SPA-navigasjon fra `src/components/v2/shell.tsx:203` og `design-lab-v2.tsx:91`.
   Regelen i scriptet: `/portal|/admin|/forelder` → lys default, mørk kun med `dark`-cookie;
   alt annet → mørk default, lys kun med `light`-cookie.
2. **`.dark`** — to blokker: `globals.css:65` (58 deklarasjoner, hsl-triplettene `--background`,
   `--foreground`, `--card` …) og `globals.css:260` (44 deklarasjoner, DS-navnene `--bg`, `--text`,
   `--surface` …). Settes som literal klasse på wrapper-element i **26 målte forekomster** fordelt på
   25 filer (marketing/v2: 13 filer / 14 forekomster — `marked-ramme.tsx` har to; portal/v2
   auth-sider: 9; pluss `marketing-footer.tsx`, `feil-laste.tsx`, `meg/layout.tsx`).
3. **`[data-theme="dark"]`** — **attributtet settes aldri av noen kode.** Null treff på `data-theme`
   i `*.tsx`/`*.ts` i hele `src/`. De eneste to forekomstene i repoet er selve CSS-selektorene
   (`globals.css:261`, `golfdata-tokens.css:165`). Men se §3.2 — det betyr *ikke* det fase 1 trodde.
4. **`.dark`-toggle via Cmd+K** — `src/components/portal/global-search-modal.tsx:549–571`.
   Kommandoen `toggle-theme` legger/fjerner `.dark` på `<html>` og persisterer i
   `localStorage["akgolf-theme"]`. **Ingenting leser den nøkkelen tilbake** (målt: 2 treff totalt,
   begge er skrivinger i samme fil). Modalen er montert i `portal-shell.tsx:110`,
   `v2/shell.tsx:751` (kun AgencyOS), `admin/(legacy)/layout.tsx:21` og `admin/recording/page.tsx:177`.
   → En bruker kan i dag slå på et mørkt tema som **ikke overlever sidelasting** og som ikke er
   koblet til `ak-v2-tema`-cookien de to andre mekanismene bruker.

---

## 3. Visuell verifisering — to fase 1-påstander er feil

Målt med Playwright på ekte kompilert CSS. Verdier er `getComputedStyle` på det innerste elementet:

| # | DOM-kjede | `--bg` | `--text` | `--background` |
|---|---|---|---|---|
| A | `html[data-v2-tema=dark]` › `.golfdata-scope` › div | `#f7f7f4` **lys** | `#101613` **mørk tekst** | `60 15.8% 96.3%` lys |
| B | `html` (lys) › `.golfdata-scope` › div | `#f7f7f4` | `#101613` | `60 15.8% 96.3%` |
| C | `.dark` › `.golfdata-scope` › div | `#141513` **mørk** | `#f0f0f0` | `90 5% 7.8%` mørk |
| D | `.golfdata-scope` › `.dark` › div | `#141513` | `#f0f0f0` | `90 5% 7.8%` |
| E | `.golfdata-scope` › `[data-theme=dark]` › div | `#141513` | `#f0f0f0` | `60 15.8% 96.3%` lys |
| F | `.dark` › div (uten scope) | `#141513` | `#f0f0f0` | `90 5% 7.8%` |
| G | `html[data-v2-tema=dark]` › body | `#f7f7f4` | `#101613` | `60 15.8% 96.3%` |

### 3.1 Bekreftet, men med annen årsak enn fase 1 anga

**A er identisk med B.** `data-v2-tema="dark"` har **null effekt** på tokens inne i `.golfdata-scope`.
Årsak (målt): `html[data-v2-tema="dark"]` deklarerer 29 navn, alle i `--v2-*`-familien, og
snittet mot `.golfdata-scope` sine 111 navn er **0**. De to mekanismene rører helt disjunkte
variabelfamilier. `.golfdata-scope` setter `--bg`/`--text` ubetinget lyst på en `<div>` nærmere
elementet enn `:root`, og v2-mekanismen har ingenting som overstyrer det.

**Konsekvens:** i `/portal` og `/admin/(legacy)` med mørk modus på blir chromet (rail, bunnnav,
paneler — `--v2-*`) mørkt, mens **innholdsflaten forblir lys**. Det gjelder de 167 portal-rutene og
de 42 legacy-admin-rutene. Dette er den ekte, målte feilen.

### 3.2 FEIL i fase 1 §2.2 — «golfdatas lyse verdier overstyrer .dark sine mørke»

**Avkreftet.** Rad C viser mørke verdier. Årsaken er at fase 1 leste selektoren feil.
`golfdata-tokens.css:162–165` er ikke én selektor, men en **gruppe på fire**:

```css
.dark .golfdata-scope,        /* .dark som ANCESTOR — dekker akkurat tilfellet fase 1 kalte brutt */
.golfdata-scope.dark,
.golfdata-scope .dark,
.golfdata-scope [data-theme="dark"] { … }
```

Kommentaren rett over (linje 157–161) sier eksplisitt at den er skrevet for dette. Rad C og D viser
at både ancestor- og descendant-varianten virker. Mørkt tema er altså **ikke** brutt av
arveavstand inne i scopet — det er brutt fordi ingen setter `.dark` i portal-shellen i det hele tatt.

### 3.3 FEIL i fase 1 — «94 uaktiverbare deklarasjoner»

**Avkreftet. Det riktige tallet er 0.** Begge `data-theme`-blokkene er selektorgrupper der
`.dark` er første alternativ:

- `globals.css:260-261` er `.dark, [data-theme="dark"] { … }` — de 44 deklarasjonene nås av `.dark`
  (bekreftet av rad F: `--bg` blir `#141513` under en ren `.dark` uten scope).
- `golfdata-tokens.css:162-165` — de 50 deklarasjonene nås av de tre `.dark`-alternativene
  (rad C og D).

`data-theme` er død **som attributt**, men ikke én deklarasjon er utilgjengelig. Å fjerne
`[data-theme="dark"]`-selektorene ville endre null piksler. Rad E viser den eneste observerbare
forskjellen: attributtet flipper DS-navnelaget (`--bg`) men ikke hsl-triplettlaget (`--background`),
fordi `globals.css:65`-blokken kun har `.dark` som selektor.

---

## 4. Hvor `data-theme` kommer fra — svar: designbiblioteket, ikke en glemt plan

Sporet i git:

- `44813f2` er **initial-commit** (`git rev-list --count 44813f2` = 1; 2908 filer, 539 357 linjer).
  Begge CSS-selektorene kom inn der. Historikken før repoet finnes ikke, så opphavet kan ikke
  spores i commits.
- Men kontrakten er dokumentert. `docs/opprydding/02-claude-design-prompt.md:127` (fila finnes
  fortsatt) står under «AK-kanon som må bestå overalt»:

  > **ThemeToggle** skriver `.light`/`.dark` + `data-theme` + `color-scheme` på nærmeste scope.

  Dette er bestillingsteksten til v13/v14-designbiblioteket. `data-theme` var altså **designbibliotekets
  kontrakt**, ikke appteamets plan.
- **ThemeToggle-komponenten ble aldri portert til `src/`.** Målt: eneste treff på «ThemeToggle» i
  `src/` er ikon-glyfene i `athletic/golfdata/Icon.tsx:117` og en kommentar i
  `global-search-modal.tsx:552` som viser til «samme mekanisme som ThemeToggle-komponenten bruker»
  — en komponent som ikke finnes i repoet.

**Konklusjon:** ikke en glemt plan og ikke etterlatenskap fra et *fjernet* system. Det er
etterlatenskap fra et system som **aldri ankom** — CSS-halvdelen av designbiblioteket ble portert,
JS-halvdelen ble det ikke. `.dark` ble beholdt som selektor-alternativ, og det er derfor ingenting
er ødelagt av det.

---

## 5. Anbefaling — én mekanisme: `html[data-v2-tema]`

Behold **`data-v2-tema` på `<html>`** som eneste sannhet. Den er allerede den som virker, den har
allerede cookie-persistens og SSR-flash-beskyttelse (inline-script før paint), og den har allerede
en path-regel som skiller app fra marketing. De tre andre avvikles.

Ikke `.dark`: den finnes i 26 hardkodede forekomster som *låser* flater til mørk uavhengig av
brukervalg — det er ikke et tema, det er en fast palett forkledd som ett.

### Hva som må endres

| # | Fil(er) | Endring | Risiko |
|---|---|---|---|
| 1 | `src/styles/golfdata-tokens.css:162-165` | Legg `html[data-v2-tema="dark"] .golfdata-scope` inn i selektorgruppa | **Lav.** Rent additivt — de 50 deklarasjonene er allerede skrevet og verifisert riktige (rad C). Dette alene fikser §3.1 for alle 209 ruter |
| 2 | `src/app/globals.css:260` | Legg `html[data-v2-tema="dark"]` inn i gruppa `.dark, [data-theme="dark"]` | **Middels.** Slår DS-navnelaget mørkt globalt i mørk modus. Marketing er allerede mørk, så endringen treffer i praksis portal/admin |
| 3 | `src/app/globals.css:65` | Samme for hsl-triplettblokken | **Høyest.** 58 navn styrer alle Tailwind-`bg-*`/`text-*`/`border-*`-utilities. Her dukker kontrastfeil opp på flater som aldri har vært mørke |
| 4 | `global-search-modal.tsx:549-571` | Bytt `toggle-theme` til å sette `data-v2-tema` + `ak-v2-tema`-cookie (samme kode som `shell.tsx:203`). Fjern `localStorage["akgolf-theme"]` | **Lav.** Ingen leser nøkkelen |
| 5 | 25 filer med `className="dark"` | Fjern klassen; la `data-v2-tema` styre. Krever at marketing/auth beholder mørk default — det gjør de allerede via scriptet i `layout.tsx:144` | **Middels.** 26 forekomster, men mekanisk. Gjør etter 1–3 |
| 6 | `[data-theme="dark"]` ×2 | Kan fjernes, men **haster ikke** — endrer null piksler (§3.3). Lavest prioritet |

**Rekkefølge:** 1 → 4 → 2 → 3 → 5. Steg 1 er den store gevinsten til nesten ingen risiko og bør
gjøres først uansett hva Anders bestemmer om resten.

### Hva som brekker underveis

- **Steg 3 er der smerten er.** `.golfdata-scope` overlapper `globals.css:65` med kun 4 navn
  (`--border`, `--destructive`, `--success`, `--warning`), så de to lagene har levd side om side
  uten å møtes. Slår du triplettlaget mørkt i portal, får du første ekte møte mellom
  Tailwind-utilities og golfdata-tokens på samme skjerm. Regn med kontrastavvik på legacy-flater.
- **Microsites er utenfor.** `.wang-tp` og `.gfgk-jr` har **ingen mørk-gren i det hele tatt**
  (målt: ingen `.dark`/`data-theme`-selektor i noen av filene). De 9 rutene forblir enpalett med
  mindre Anders vil ha mørk der — det er en egen beslutning, ikke en del av denne.
- **`wizard-chrome.tsx:31-32`** fjerner `data-v2-tema` aktivt for onboarding. Bevisst valg — la den
  stå, men den må dokumenteres som unntak, ellers ser det ut som en bug etter steg 5.
- **Flash-risiko:** ikke rør inline-scriptet i `layout.tsx:144` uten å teste hard reload på
  marketing. Det er den eneste beskyttelsen mot lys-blink før paint.

### Åpent spørsmål til Anders

Skal `/portal` og `/admin` fortsatt ha **lys default** (dagens regel i `layout.tsx:144`)?
Anbefalingen over bevarer den. Sier du mørk default for app, endres én linje i scriptet — men da
er steg 3 ikke lenger valgfritt, og hele legacy-flaten må kontrastsjekkes før pilot.

---

## 6. Foreslått gotcha-tekst

Til `.claude/rules/gotchas.md`. **Ikke lagt inn** — kun forslag.

```markdown
### Tokenfiler må være ULAGET og RENE variabeldeklarasjoner (@layer-fella)

- `globals.css` bruker `@layer` bare to steder, begge `@layer base` (linje 516 og 529).
  Kommentaren på 514 forklarer hvorfor: ulaget CSS ville slått ut ALLE border-fargeklasser
  (`border-primary`, `border-accent`, …), fordi ulaget CSS vinner over `@layer utilities` i
  Tailwind v4 — uansett spesifisitet.
- **Regelen:** en tokenfil skal inneholde KUN variabeldeklarasjoner, ulaget, uten en eneste
  selektorregel som setter `color`, `background`, `border-*` e.l. Blander du tokens og
  komponentregler i samme ulagete fil, er border-regresjonen garantert.
- Skal en tokenfil likevel bære komponentregler, må de reglene inn i `@layer components`
  (eller `@layer base`) — aldri stå ulaget.
- Eksisterende brudd å ikke kopiere: `src/styles/wang-tokens.css` (linje 122–179) og
  `src/styles/gfgk-junior-tokens.css` (linje 104–169) blander tokens med ulagete
  komponentregler. De slipper unna i dag fordi de er klasse-scopet til 3 + 6 ruter — men
  mønsteret skalerer ikke til et globalt tokensett.
- Ved innføring av nytt tokensett: én fil, kun `--navn: verdi`, ingen `@layer`, ingen selektorer
  utover tema-scopene.
```

---

## 7. Hva som IKKE er verifisert

- **Ingen visuell/piksel-inspeksjon av en innlogget `/portal`-rute.** `/portal` svarer `307` uten
  sesjon, og Supabase MCP er utilgjengelig (OAuth). Kaskaden er målt på ekte CSS med reprodusert
  DOM-kjede (§1), ikke på en ferdig rendret portal-skjerm. Inline-`style` i portal-komponenter kan
  maskere eller forverre effekten i §3.1 — det gjenstår å sjekke.
- **Ingen DB-tall.** Supabase ikke tilgjengelig.
- **Ingenting er sjekket mot designfasiten.** Designbiblioteket (78 komponenter + 19 HTML-flater)
  er ikke på disk, og `chore/paper-speil-lokal` finnes ikke på origin.
- **De 61 navnene uten målt konsument er ikke rørt.** Heuristikken misser dynamisk konstruerte
  klassenavn. Ingenting er slettet.
