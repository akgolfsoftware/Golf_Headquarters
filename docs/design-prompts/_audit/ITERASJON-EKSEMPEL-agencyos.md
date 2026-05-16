# Iterasjons-prompt: AgencyOS Hub

> Konkret eksempel på iterasjons-prompt basert på faktisk audit av eksisterende skjerm.
> Bruk denne som mal for andre skjermer.

## Eksisterende skjerm
URL: `/admin/agencyos`
Screenshot: `_audit/screenshots/admin-agencyos.png`

## Det vi ser i dag (godt)
- ✅ PageHeader med italic Instrument Serif ("Her er dagen.") — sterkt editorial moment
- ✅ Greeting med tidsbasert ("God morgen, Anders") — personlig
- ✅ KPI-strip med 4 kort: Aktive spillere, Timer denne uka, Innbetalt, Godkjenninger
- ✅ Strategisk seksjon med 3 actionable kort: Spillere uten plan, Tester forfaller, Utestående faktura
- ✅ Til godkjenning-seksjon med detaljerte agent-funn
- ✅ Caddie-input-banner nederst (sticky)
- ✅ Mørk sidebar med god gruppering

## Hva som skal forbedres (i prioritert rekkefølge)

### 1. Hierarki i KPI-strip — alle kort er flate og like
**Problem:** "Aktive spillere", "Timer", "Innbetalt", "Godkjenninger" har identisk visuell vekt. Anders trenger ikke å se alle fire likt — den ene som krever handling skal skille seg ut.

**Forbedring:**
- Featured-kort (det som krever oppmerksomhet) skal være 1.4× bredere
- Bruk mørk grønn gradient som bakgrunn (`from-primary to-primary/80`)
- Lime accent-tekst (`text-accent/70`) for label
- Stort tall i hvit (JetBrains Mono 42px)
- De andre 3: standard hvit kort, mindre tall (28px)

### 2. "Godkjenninger 0 venter — Alt klart"
**Problem:** Tørr, generic informasjon. Mister mulighet for editorial moment.

**Forbedring:**
- Tekst: "Innboks tom" → "*Innboksen er* tom — Caddie har håndtert alt natt over." (italic på "Innboksen er")
- Eller hvis det er > 0: "*3 venter* — eldste fra i går kl 19:42"

### 3. Strategiske kort (Spillere uten plan / Tester forfaller / Utestående)
**Problem:** Ser bra ut men kunne hatt sterkere visuell hierarki — de tre er ulike viktige.

**Forbedring:**
- "Spillere uten plan" — viktigst, har røde flagg → Pyramide-rød border-left (#A32D2D)
- "Tester forfaller" — varslende → gul border-left (#B8852A)
- "Utestående faktura" — pengeflyt → lyseblå border-left
- Beholde verdiene + chevron-pil til høyre

### 4. Til godkjenning-seksjon
**Problem:** Liste-formatet er ok, men kunne hatt mer luft + tydeligere severity-indikatorer.

**Forbedring:**
- Severity-prikk venstre må være 12px med tydelig glow-effekt (urgent = pulserende rød)
- Tag-pill høyre må være større med ikon ("Urgent / Warning / Info" + ikon)
- Body-tekst kunne hatt 2-line snippet i italic for kontekst
- "Åpne agent-inbox →" mer prominent (full bredde, lime border på hover)

### 5. Caddie-input-banner
**Problem:** "Kommer snart"-stub. Når Caddie er live, må den se sterkere ut.

**Forbedring:**
- Erstatt med ekte input som lar Anders klikke og åpne Caddie-chat
- "Spør Caddie — '...'" placeholder skal være mer editorial: "*Spør Caddie* om hva som helst."
- Lime accent + skygge når aktiv

### 6. Hero-tekst kontrast på Caddie-greeting
**Problem:** "God morgen, Anders." er italic på "*Her er dagen.*" — det er bra. Men det kan løftes:

**Forbedring:**
- Eyebrow: "AGENCYOS · LØRDAG 16. MAI · 19:51" — kunne hatt en pulserende grønn live-prikk for "live now"
- Hvis dagens første økt er om < 30 min: vis countdown chip

### 7. Layout: hovedkolonne vs sidekolonne
**Problem:** Tre-kolonne grid kan kjenne litt overfylt på 1440px.

**Forbedring:**
- Sidekolonnen (Stripe + Caddie-aktivitet) skal være sticky og scroll med hovedinnholdet (allerede gjort i kode)
- Caddie-aktivitet kan komprimeres til ekspanderbar accordion (5 siste = collapsed)

## Mål
Skjermen skal føles som det første Anders ser når han starter dagen, og han skal si:
*"Wow, dette er ferdig."*

Editorial, ikke generic dashboard.
Variert layout, ikke uniform grid.
Hierarki tydelig — Anders ser kritisk handling FØR rolige tall.

## Lever (i Claude Design)

Én HTML-fil med inline CSS, 1440px viewport. Behold alle eksisterende data og struktur — bare det visuelle hierarkiet skal endres.

Bruk samme designtokens som spec'en (00-shared-spec.md).

---

## Slik kjører du dette i Claude Design

```
1. Last ned screenshot fra _audit/screenshots/admin-agencyos.png
2. Åpne Claude Design (claude.ai)
3. Send screenshot + denne iterasjons-prompten + 00-shared-spec.md
4. Claude leverer HTML
5. Lagre som _outputs/coachhq/admin-agencyos-v2.html
6. Sammenlign med eksisterende — beslutt om vi implementerer
```
