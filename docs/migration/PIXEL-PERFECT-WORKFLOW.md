# Pixel-Perfekt Workflow — for Claude Design Hand-off

**Versjon:** 1.0 (2026-05-25)
**Eier:** Anders Kristiansen
**Status:** AKTIV — bruk ved hver migrert skjerm

---

## Hva vi lærte fra første sample-runde

Agentene tok shortcuts:
- Strippet norske tegn (æ ø å → a o a) for å "unngå encoding-issues"
- Forenklet layouts uten å sjekke mot Claude Design original
- Posisjonerte ghost-tall i flyten i stedet for absolutt bak innhold
- "Improviserte" struktur i stedet for å matche source 1:1

**Diagnose:** Tekst-spesifikasjoner var ikke nok. Agentene trenger faktisk **Claude Design source-kode + visuell verifikasjon**.

---

## Installerte skills (fra Anthropic)

### `frontend-design` skill
**Sti:** `.claude/skills/frontend-design/SKILL.md`

Anthropic's offisielle skill som **eksplisitt unngår "AI slop" / generiske aesthetics**.
- Tvinger bold design decisions
- Spør om aesthetic direction (athletic editorial = vår)
- Krever production-grade utførelse

**Aktivert per komponent-fix.**

### `webapp-testing` skill
**Sti:** `.claude/skills/webapp-testing/SKILL.md`

Playwright-basert testing:
- Tar screenshots av rendret state
- Sammenligner UI mot baseline
- Debugger UI-feil

**Aktivert for visuell verifikasjon.**

### Toolkit-skills (fra applied-artificial-intelligence/claude-code-toolkit)
**Sti:** `/tmp/claude-skills/toolkit/` (kan kopieres til prosjektet om ønsket)

Relevante:
- `architect` agent — system design med struktur
- `code-reviewer` agent — kvalitetssikring
- `explore` → `plan` → `next` → `ship` workflow
- `analyze` / `review` / `fix` commands

---

## Den nye pixel-perfekt-workflow-en (per komponent/skjerm)

### Steg 1 — Last Claude Design-source
Agent ÅPNER og LESER selve Claude Design source-koden:
- `/tmp/v2-new/ak-golf-v2/project/*.jsx` for PlayerHQ-prototypen
- `/tmp/v1-all/ak-golf-hq/project/*.html` for V1-skjermer som mappes

**Hvis source ikke åpnes / leses fullstendig → SKAL IKKE fortsette.**

### Steg 2 — frontend-design skill aktiveres
Agenten påkaller `frontend-design`-skill med konkret aesthetic:

```
Aesthetic direction: "LIVING athletic editorial"
- Linear (typography) + Whoop (athletic data) + Notion (clean cards)
- Pyramide-akser via funksjonsbaserte tokens (primary/warning/info/accent/destructive)
- Color-mix oklab tinted backgrounds
- Photo-led hero, dark moments, MASSIVE display-tall, lime accent-strek
- AK Golf Academy real photography (41 WebP-foto)
- NEVER strip norske tegn (æ ø å)
- NEVER simplify layouts — match source 1:1
```

### Steg 3 — Implementer mot source
Agent porter komponent/skjerm fra .jsx → .tsx:
- TypeScript strict
- Tailwind v4 utilities + V2 tokens
- Bevarer ALT av norske tekst eksakt
- Matcher hver className/style 1:1 mot source

### Steg 4 — webapp-testing screenshot
```bash
# I prosjekt-rot:
python .claude/skills/webapp-testing/scripts/with_server.py \
  --server "npm run dev" --port 3000 \
  -- python tests/visual/capture-screen.py --url http://localhost:3000/[path] \
    --out tests/visual/screenshots/[name]-current.png
```

### Steg 5 — Sammenlign med Claude Design source
Åpne side-by-side:
- `tests/visual/screenshots/[name]-current.png` (vår implementering)
- Rendret Claude Design (kjør deres prototype og screenshot)

Diff via:
- Visuell sammenligning av agenten
- Eller Playwright `pixelDiff` (om vi har det satt opp)

### Steg 6 — code-reviewer agent verifiserer
Sjekker:
- Norske tegn intakt (`grep -E "[æøå]" file.tsx`)
- Ingen hardkodede hex (`grep -E '#[0-9a-fA-F]{3,6}'`)
- Ingen off-grid spacing (`grep -E '\b[pm]-[3579]\b'`)
- Komponent struktur matcher source

### Steg 7 — Commit kun hvis 100% match

**Hvis IKKE 100% match etter 3 iterasjoner:**
- Stop
- Flag for menneskelig review
- Beskriv hva som ikke matcher
- Vent på Anders' avgjørelse

---

## Anti-shortcut-regler (FORBUDT)

```
ALDRI:
1. Strip norske tegn (æ ø å) "for å unngå encoding-issues"
2. Forenkle layouts uten eksplisitt godkjenning
3. Improvis komponent-struktur — match source eksakt
4. Bruke generiske AI-aesthetics (purple gradient på hvit, etc.)
5. Bruke generiske fonts (Inter sans seriffe ALENE — vi bruker Inter
   Tight med italic + JetBrains Mono som signaturer)
6. Commit uten å ha tatt screenshot + sammenlignet
7. "Tilpasse" til "lignende" mønster — finn det eksakte mønstret
8. Anta — STOPP og spør hvis i tvil

ALLTID:
1. Les Claude Design source-fil først
2. Aktiver frontend-design skill
3. Implementer 1:1 mot source
4. Screenshot + verifiser
5. Bevarer alle norske tegn EKSAKT
```

---

## Fix-runden plan (med nye skills)

### Steg 1 (15 min) — Plan-agent med frontend-design skill
Designer detaljert fix-strategi for de 5 problemene fra screenshots.

### Steg 2 (45 min) — Norske tegn fix (1 agent, sed-basert)
- Søk i ALLE filer for ASCII-strippet norsk
- Restaurer æ ø å overalt
- Re-test

### Steg 3 (30 min) — GhostNumber-fix (ui-designer agent)
- Les Claude Design source for hvordan ghost-tall brukes
- Posisjoner absolutt, opacity 0.05, z-index bak innhold
- Re-test

### Steg 4 (2 timer) — Kalender (frontend-developer + webapp-testing)
- Les Claude Design `pages.jsx` KalenderPage 1:1
- Re-implementer hvert element
- Screenshot via webapp-testing
- Sammenlign mot Claude Design rendring

### Steg 5 (2 timer) — Admin (frontend-developer + ui-designer)
- Det finnes IKKE admin-side i Claude Design v2-bundle
- Egen design-pass kreves
- Bruk frontend-design skill med "match PlayerHQ-rytme til coach-perspektiv"

### Steg 6 (1 time) — Spillere-side (frontend-developer)
- Pixel-polish kort + filter + paginering
- Match Claude Design's stall-oversikt om finnes, ellers bygg mot PlayerHQ-mønster

### Steg 7 (30 min) — Final screenshot-runde
- Take screenshots av alle 5 samples
- Anders får dem som review-pakke
- "GO" eller "FIKS" per skjerm

---

## Hvorfor dette fungerer denne gangen

| Forrige runde | Denne runden |
|---|---|
| Tekst-spec fra meg | Agent leser source-kode direkte |
| Generic implementeringer | `frontend-design` skill tvinger bold design |
| Ingen visuell verifikasjon | webapp-testing tar screenshots |
| Stripped norske tegn | Eksplisitt forbud + grep-sjekk |
| Ghost-tall feil | code-reviewer fanger struktur-feil |

---

## Acceptance-kriterium per skjerm

For at en skjerm regnes som "godkjent":

- ✓ Screenshot tatt via webapp-testing
- ✓ Side-by-side sammenligning med Claude Design source
- ✓ frontend-design skill bekrefter aesthetic match
- ✓ code-reviewer sjekkliste OK
- ✓ Norske tegn intakt
- ✓ Ingen hardkodede hex / off-grid spacing
- ✓ Anders' visuell godkjenning
