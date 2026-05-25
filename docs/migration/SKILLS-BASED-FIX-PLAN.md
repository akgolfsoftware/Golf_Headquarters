# Skills-basert fix-plan — for pixel-perfekt Claude Design implementering

**Versjon:** 1.0 (2026-05-25 kveld)
**Eier:** Anders Kristiansen
**Status:** Klar til execution

---

## Tilgjengelige skills (kartlagt)

### Kjerne-skills for fix-runden

| Skill | Brukes til |
|---|---|
| **`anthropic-skills:akgolf-design-system`** | AK Golf-spesifikk designsystem-kunnskap (autoritativ) |
| **`redesign-existing-projects`** | Audit + fix av eksisterende skjermer |
| **`frontend-design`** | Anthropic offisiell — anti-AI-slop, bold design |
| **`high-end-visual-design`** | Awwwards-tier visuell standard |
| **`webapp-testing`** | Playwright screenshot + visuell verifikasjon |

### Støtte-skills

| Skill | Brukes til |
|---|---|
| **`web-design-guidelines`** | Review mot UI/UX best practices |
| **`design-taste-frontend`** | Visuell smak-sjekk |
| **`accesslint`** | Tilgjengelighet (audit→edit→verify) |
| **`react-best-practices`** | Vercel React/Next.js performance |
| **`anthropic-skills:akgolf-feature-prompt`** | Produserer Claude Code-prompts |

### Workflow-skills (toolkit)

| Skill | Brukes til |
|---|---|
| **`superpowers-using-superpowers`** | Skill-orchestrering |
| **`superpowers-dispatching-parallel-agents`** | Parallell agent-håndtering |
| **`superpowers-systematic-debugging`** | Debug komplekse problemer |
| **`superpowers-brainstorming`** | Før kreativt arbeid |
| **`superpowers-verification-before-completion`** | Verifisering før commit |

---

## Den nye 6-stegs fix-prosessen (per skjerm)

### Steg 1 — `superpowers-brainstorming` (5 min per skjerm)
Før vi rører kode, utforsker vi:
- Hva er den eksakte fasit fra Claude Design?
- Hvor avviker dagens implementering?
- Hva er årsaken (shortcut, manglende detalj, feil komponent)?

### Steg 2 — `redesign-existing-projects` audit (10 min per skjerm)
Skill gjør formal audit mot:
- Typography (fonts, weights, tracking, hierarki)
- Color (saturation, accent-bruk, AI gradient-mønstre)
- Surfaces (shadows, textures, depth)
- Layout (asymmetri, whitespace, grid-breaking)
- Components (cards, buttons, states)
- Motion (entries, hover, scroll-triggered)

Output: konkret diff-liste av "fix these specific things".

### Steg 3 — `anthropic-skills:akgolf-design-system` setter rammene (5 min)
Skill leverer AK Golf-spesifikke verdier:
- Farger (forest green, lime accent, foreground)
- Tokens (`--pyr-fys/tek/slag/spill/turn`)
- Typografi (Inter Tight italic, JetBrains Mono)
- Komponenter (allerede i `src/components/v2/*`)
- Anti-mønstre ("Aldri 'AK GOLF'-tekst i sidebar", etc.)

### Steg 4 — `frontend-design` + `high-end-visual-design` implementerer (30-60 min per skjerm)
Skills jobber sammen:
- `frontend-design`: bold aesthetic direction (LIVING athletic editorial)
- `high-end-visual-design`: awwwards-tier utførelse, anti-pattern-håndhevelse
- BEVAR norske tegn (æ ø å)
- MATCH Claude Design source 1:1

### Steg 5 — `webapp-testing` verifiserer visuelt (10 min per skjerm)
Tar screenshot via Playwright:
```bash
python .claude/skills/webapp-testing/scripts/with_server.py \
  --server "npm run dev" --port 3000 \
  -- python tests/visual/capture.py [url] [out-path]
```

Sammenlign mot:
- Claude Design source (rendret prototype)
- V2-PATTERNS.md spec
- 20-punkts sjekkliste

### Steg 6 — `superpowers-verification-before-completion` lukker (5 min)
Skill tvinger:
- Konkrete bevis på at fix fungerer
- Ingen "claim completion uten verifisering"
- Screenshot + diff-bekreftelse

---

## Fix-runden execution-plan

### Fase A — Brainstorm + Audit (30 min)

Start med `superpowers-brainstorming` skill for å:
- Definere hva "fix-runden" må oppnå konkret
- Identifisere risiko-momenter

Kjør deretter `redesign-existing-projects` audit på hver av de 5 sample-skjermene:
- `/v2-preview/portal`
- `/v2-preview/portal/kalender`
- `/v2-preview/portal/mal`
- `/v2-preview/admin`
- `/v2-preview/admin/spillere`

Output: 5 audit-rapporter med spesifikke fix-tasks.

### Fase B — Norske tegn batch-fix (45 min, 1 agent)

Bruk `general-purpose` agent med oppdrag:
- Søk ALLE filer for ASCII-strippet norsk
- Restore æ ø å overalt
- Verifiser med `grep -E "[æøå]" file.tsx` etterpå

### Fase C — Komponent-fix parallelt (3 agenter × 2 timer)

**Agent 1 — `redesign-existing-projects` + `frontend-design`:**
- GhostNumber-bug
- SectionHeader spacing/positioning
- Kalender-restrukturering

**Agent 2 — `high-end-visual-design` + `frontend-design`:**
- Admin-side dybde (mer sektioner, foto, density)
- Stat-tile typografi-løft

**Agent 3 — `frontend-design`:**
- Spillere-side polish
- Filter-bar funksjonalitet

Hver agent kjører `webapp-testing` etter sin fix og rapporterer screenshot.

### Fase D — `superpowers-verification-before-completion` (30 min)

Alle 5 skjermer verifiseres:
- Screenshot taken: ✓
- Compared to source: ✓
- 20-punkts checkliste: alle ✓
- Norske tegn intakt: ✓
- ESLint 0 errors: ✓
- tsc 0 errors: ✓
- Build success: ✓

### Fase E — Deploy + Anders' review (15 min)

- Manual Vercel deploy
- Send screenshots til Anders
- "GO" → starter Bølge A (PlayerHQ hovedflyt 70 sider)

---

## Tidsplan

| Fase | Tid | Wall-time (parallelt) |
|---|---|---|
| A: Brainstorm + audit | 30 min | 30 min |
| B: Norske tegn fix | 45 min | 45 min |
| C: Parallell komponent-fix | 2t × 3 agenter | 2 timer |
| D: Verifisering | 30 min | 30 min |
| E: Deploy + review | 15 min | 15 min |
| **TOTAL** | **~4 timer wall-time** |

---

## Anti-shortcut-håndhevelse

Disse skills HÅNDHEVER kvalitet:
- `redesign-existing-projects` → fanger generiske AI-mønstre
- `high-end-visual-design` → ABSOLUTE ZERO directive (banned fonts/colors/layouts)
- `frontend-design` → eksplisitt anti-slop
- `superpowers-verification-before-completion` → blokker "claim completion uten bevis"

Hvis EN agent prøver å:
- Strippe norske tegn → fanges av `accesslint` + grep i Steg 5
- Bruke purple gradient → fanges av `high-end-visual-design` ABSOLUTE ZERO
- Improvis layout → fanges av `redesign-existing-projects` audit
- Skip screenshot → fanges av `superpowers-verification-before-completion`

---

## Hvordan jeg starter

Når Anders sier "kjør", gjør jeg:

1. **Skill: `superpowers-brainstorming`** — etablere fix-runden's eksakte scope
2. **Skill: `redesign-existing-projects`** — audit alle 5 samples i sekvens
3. **Spawn 3 parallelle agenter** med riktige skills aktivert per agent
4. **Skill: `webapp-testing`** for screenshots
5. **Skill: `superpowers-verification-before-completion`** for å lukke

---

## Hva som er bekreftet låst

- **Claude Design hand-off er ENESTE design-source-of-truth**
- **Skills HJELPER med implementering — de ENDRER IKKE designet**
- **Hvis skill foreslår "forbedring" som ikke er i Claude Design → avvises**
- **Norske tegn (æ ø å) bevares overalt — ESLint-regel + grep-sjekk**
- **AK Golf token-system (ikke purple gradients)**

---

Klar til execution.
