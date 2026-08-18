> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Preflight: konflikter før komplett Paper-implementering

**Dato:** 2026-08-09  
**Formål:** Fange alt som kan ødelegge eller motarbeide pixel/pattern-port *før* Wave A start.

## Verdict

| | |
|---|---|
| **Kan vi starte?** | **Ja**, med **blocker-håndtering i Wave 0** (under) |
| **Blokkerer noe 100%?** | Ingen hard «stopp alt» — men **flere strukturkonflikter** vil gi «ser ikke ut som zip» hvis de ignoreres |
| **Største risiko** | Token-semantikk (`T.lime` ≠ neon), **legacy shells**, **golfdata-scope**, **prod uten sandbox-push** |

---

## BLOKKER / HØY (må avklares eller fikses i Wave 0)

### B1. `T.lime` er ikke lenger «lime» — det er blekk-CTA

| Token | Verdi (lys) | Betydning i Paper |
|---|---|---|
| `--p-cta` / `--v2-lime` / `T.lime` | **#141413** (ink) | Primær **blekk**-fill i Anthropic/Paper |
| `--p-accent` / `--v2-handling` / `T.handling` | **#d97757** (clay) | «Én ting nå»-monopol |
| Hardkodet `T.farge.limeMerke` | **#D1F843** | Gammel neon-lime (AK merke) — **ikke** i `--v2-lime` |

**Konflikt:** Hundrevis av steder bruker `T.lime` som om det var **neon status/aksent**. Etter bridge er det **svart blekk**. Resultat: status-piller, charts, nav-active kan se ut som **ekstra CTA-er** eller «alt er svart».

**Lås før port:**
1. **Primær handling** = kun `T.handling` (clay) — allerede i Knapp/CTAPill  
2. **Ink primary** (Paper fasit «svart knapp») = `T.lime`/`--p-cta` *eller* eksplisitt token `T.cta` (rename senere)  
3. **Neon merke/status** = `T.farge.limeMerke` eller ny `T.brand` — **ikke** `T.lime`  
4. Dokumenter i `tokens.ts` kommentar + design rules: aldri anta lime = #D1F843

**Handling Wave 0:** Audit «StatusPill tone=lime» og charts — skill status-neon vs ink-cta.

### B2. Dobbel token-stakk + `.golfdata-scope`

- Live: `paper-tokens.css` (`--p-*`) **+** bridge til `--v2-*` i `globals.css` **+** fortsatt `golfdata-tokens.css`
- **Admin legacy layout** wrappere barn i `<div className="golfdata-scope">` → **lokal re-token** inni Agency-sider

**Risiko:** Innhold ser «gammelt DS» / feil flate mens chrome er Paper.

**Handling Wave 0:** Fjern eller nøytraliser `.golfdata-scope` på porterte V2-sider; planlegg sletting når siste konsument er migrert (allerede notert i paper-tokens header).

### B3. To chrome-verdener på portal

| Lag | Chrome |
|---|---|
| `/portal/*` (migrert) | Egen `V2Shell` per page |
| `/portal/(legacy)/*` | `PortalShell` (gammel sidebar/topbar) — **34 pages** |
| `/admin/(legacy)/*` | `V2Shell` + **golfdata-scope** — 42 pages |
| Noen admin-pages | **Egen V2Shell** *inni* legacy layout som allerede har V2Shell → **dobbel chrome-risiko** |

**Handling:** Aldri nest `V2Shell` inni legacy layout som allerede har shell. Inventar + fjern indre shell. Legacy portal: enten port til V2Shell eller aksepter midlertidig «gammel look» til Wave G.

### B4. Prod ≠ sandbox

Sandbox branch `handoff/iphone-5h-*` er **foran origin**. Live akgolf.no viser ikke siste handling-CTA / putting / P2 før **Mac APPLY**.

**Handling:** Push før pixel sign-off mot prod; ellers QA kun mot lokal/sandbox.

### B5. Navngivningsforvirring «V2»

V2 **er** Paper-retningen (tokens bridge til `--p-*`), **ikke** en separat gammel skin som må slettes.  
«Slett V2» = ødelegg appen.  
Korrekt: **port innhold til Paper-mønster inni V2Shell**, ikke bygg V3.

---

## MEDIUM (håndteres underveis, ikke start-blocker)

### M1. ~83 `background: T.lime` i komponenter

Mange er status-dots (OK hvis ink), noen er **submit-CTAs** (skal være handling eller ink etter fasit).  
Wave A–F: bytt CTA → handling; status → bevisst ink eller brand.

### M2. shadcn `Button` fortsatt i ~9 filer

Cockpit interactive, caddie actions, portal ProfileForm, grupper, osv.  
**Annet visuelt språk** enn Knapp/CTAPill.

**Handling:** Erstatt med `Knapp`/`CTAPill` når den flaten portes.

### M3. ~92 hardkodede `#hex` i components

Bryter token-single-source. Port til `T.*` ved berøring.

### M4. FilterChips / PillTabs valgt-state = «lime» (ink)

Fasit kan kreve soft surface + border, ikke fylt blekk. Verifiser mot zip per skjerm.

### M5. Font / layout.tsx

Root laster Inter + display/mono; Paper fasit kan forvente spesifikke stacks. Allerede delvis aligned — sjekk `fonts.css` i zip vs next/font.

### M6. Tema: `data-v2-tema` vs Paper `data-theme`

App bruker **kun** `data-v2-tema` (cookie `ak-v2-tema`). Paper HTML bruker ofte `data-theme`.  
**OK** så lenge app ikke setter `data-theme`. Dark Agency vs light Player — bevisst.

### M7. maxWidth 720 (Player) vs 74ch (Agency)

Shell-forskjell er bevisst. Ikke «fix» til én bredde uten fasit.

### M8. Marketing vs produkt

Marketing V2 delvis lime/ink CTA. Pattern-wave J. Ikke bland marketing full-bleed inverse med PlayerHQ cream uten fasit.

### M9. Sandbox 403 push

Ikke en designkonflikt, men **leveransekonflikt**.

---

## LAV / OK (ikke konflikt)

| Punkt | Status |
|---|---|
| `--v2-*` → `--p-*` bridge | **OK** — T.* peker på Paper-verdier |
| `T.handling` = clay #d97757 | **OK** — matcher «Én ting nå» |
| Knapp/CTAPill default → handling | **OK** (sandbox) |
| Paper zip speilet 702 filer | **OK** |
| LogoAK surface paper/ink API | **OK** der brukt; audit resterende sider |
| depthMode simple/deep | **OK** pattern for clutter |
| Ingen feature-flag som skjuler Paper | **OK** (ingen v2preview-flag funnet) |

---

## Wave 0 — preflight-oppgaver (før Wave A pixel)

| # | Oppgave | Ferdig når |
|---|---|---|
| 0.1 | Skriv token-semantikk i `tokens.ts` + AGENTS/design rule: lime=ink CTA, handling=clay, brand lime=limeMerke | Docs + kommentar |
| 0.2 | Grep-inventar: CTA som bruker T.lime vs status | Liste i `docs/port/PAPER-TOKEN-AUDIT.md` |
| 0.3 | Fjern/unngå **dobbel V2Shell** under admin legacy | Ingen nestet shell |
| 0.4 | Beslutning: `golfdata-scope` av på porterte flater | Scope kun der athletic/golfdata widgets krever det |
| 0.5 | Portal legacy: liste 34 ruter — port-queue Wave G | Checklist |
| 0.6 | Mac push sandbox → main **før** prod sign-off | akgolf.no = ny kode |
| 0.7 | Side-om-side test: Hjem/Plan med fasit HTML + live tokens | Cream bg, clay CTA, ink tekst |

**Først etter 0.1–0.4 (minimum):** start Wave A Login/Plan/Analyse.

---

## Anbefalt rekkefølge (oppdatert)

```
Wave 0  Preflight (tokens, shell, scope)     ← DENNE SJEKKEN
Wave A  PlayerHQ P0 fasit
Wave B  Agency P0 fasit
Wave C–F  rest zip fasit
Wave G–K  pattern uten fasit
(+ Claude W2 zip inn som utvidet del 1 når klar)
```

---

## Svar på «er det konflikter?»

**Ja — men håndterbare.** De tre som **faktisk** ødelegger look hvis ignorert:

1. **`T.lime` = blekk, ikke neon** (semantikk)  
2. **Legacy PortalShell + golfdata-scope** (gammel chrome/innhold)  
3. **Prod uten push** (du ser gammel UI uansett port)

Alt annet er migreringsarbeid inne i planen, ikke showstoppers.


---

## WAVE 0 FIXED (2026-08-09 kode)

| Punkt | Fix |
|---|---|
| B2 golfdata-scope | **Fjernet** fra `admin/(legacy)/layout.tsx` |
| B3 PortalShell | **Erstattet** med `V2Shell` i `portal/(legacy)/layout.tsx` |
| Dobbel V2Shell | Fjernet nestet shell i aarsplan periode ny/rediger |
| Dobbel GlobalSearchModal | Fjernet fra admin legacy layout (eies av V2Shell) |
| Shell bakgrunn | Flat `T.bg` (fjernet vignett-gradient som skiller fra Paper) |
| data-paper-shell | På V2Shell root + data-paper-column |
| PillTabs / FilterChips | Soft/selected Paper (ikke solid ink-fill) |
| StatusPill lime | Bruker `T.fg` soft (ink), ikke neon |
| Token aliases | `T.cta` / `T.onCta` / `T.brand` + `--v2-brand` |

**Gjenstår (ikke Wave 0):** Mac push, pixel Wave A–F, pattern G–K, shadcn Button-migrering per flate.
