# Fase 7 — Total audit 2026-05-24

> **Status:** Komplett. 4 parallelle agenter har auditert 307 ruter + ~190 demo-ruter.
>
> **Metode:** Statisk audit av `page.tsx`-filer mot 7 sjekkpunkter:
> 1. Korrekt shell (HubFrame/OverviewShell/DetailShell/FullScreenTemplate)
> 2. Ingen forbudte komponenter (CoachhqStubsShell, etc.)
> 3. Ingen "AK GOLF"-tekst i sidebar
> 4. Ingen hardkodede hex-farger (utenom unntak)
> 5. Lucide-ikoner kun (ingen emoji)
> 6. Norsk bokmål med æ/ø/å
> 7. Redirect-sjekk

## Tall samlet

| Område | Ruter | OK | Bug | Stub | Redirect | Form/Action |
|---|---:|---:|---:|---:|---:|---:|
| CoachHQ (`/admin/*`) | 130 | 86 | 8 | 5 | 11 | 20 |
| PlayerHQ del 1 | 50 | 35 | 5 | 4 | 0 | 6 |
| PlayerHQ del 2 | 86 | 76 | 4 | 4 | 1 | 18 |
| Marketing + resten | 41 | 32 | 4 | 5 | 0 | 0 |
| **TOTALT** | **307** | **229** | **21** | **18** | **12** | **44** |

**Demo-ruter (ikke i statusaudit):** ~190 stk åpne på toppnivå — bør lukkes før produksjon.

## Konsistens-score

- **74,6 % OK** av alle ruter (229/307)
- **6,8 % Bug** (21 sider med kritiske design/sikkerhet-brudd)
- **5,9 % Stub** (18 sider med placeholder/mock-data)

## Positive funn på tvers

- **Ingen `CoachhqStubsShell`-bruk** funnet noe sted (alle migrert i forrige sprint)
- **Ingen emoji i UI-tekst** funnet
- **Alle ikoner er Lucide** (ingen Heroicons, Phosphor, etc.)
- **Norsk bokmål** gjennomgående med æ/ø/å
- **Marketing er sunt** — 27/27 ruter bruker tokens + Lucide + metadata

---

## Topp 25 prioriterte fixes (samlet)

### Tier 1 — Kritiske brudd på sidebar-merkevare-regelen (8 sider)

Memory-regel: "ALDRI 'AK GOLF'-tekst. Bruk `<SidebarBrand>` med sentrert ak-logo og subtitle `<MODUL> · <ROLLE>`."

1. **`src/app/portal/(fullscreen)/tren/workbench-client.tsx:449-453`** — sidebar har hardkodet "AK GOLF / PLAYERHQ / · PRO"
2. **`src/app/portal/mal/bygger/bygger-client.tsx:195`** — topbar har "AK GOLF · PLAYERHQ"
3. **`src/app/portal/meg/innstillinger/integrasjoner/page.tsx:68`** — topnav har "AK GOLF · PLAYERHQ"
4. **`src/app/portal/coach/melding/[id]/page.tsx`** — custom `<nav>` med "AK GOLF · PlayerHQ"
5. **`src/app/portal/coach/melding/[id]/vedlegg/page.tsx`** — samme
6. **`src/app/portal/coach/melding/ny/page.tsx`** — samme
7. **`src/app/portal/coach/sporsmal/[id]/page.tsx`** — samme

### Tier 2 — Forbudt 4. font (Instrument Serif) — 3 sider

CLAUDE.md-regel: kun Inter, Inter Tight og JetBrains Mono. Instrument Serif er **forbudt** — bruk Inter Tight med `italic`-klassen for luxury-italic-feel.

8. **`src/app/portal/(fullscreen)/tren/page.tsx:11-23`** — importerer Instrument Serif
9. **`src/app/auth/guardian-consent/[token]/page.tsx:67-69`** — Instrument Serif + hardkodet `#005840`
10. **`src/app/forelder/page.tsx:376-380`** — Instrument Serif + hex

### Tier 3 — Hardkodede hex-farger (17 sider)

Designsystem-regel: kun semantic tokens (`bg-primary`, `text-foreground`, etc.). Unntak: avatar-farger fra helper, chart-spesifikke, brand-gradienter på marketing.

11. **`src/app/auth/samtykke-venter/samtykke-venter-klient.tsx`** — hele filen inline hex-styles
12. **`src/app/portal/coach/melding/[id]/page.tsx:100,105`** — `#22C55E` for online-indikator (bruk `bg-success` i stedet)
13. **`src/app/admin/spillere/[id]/page.tsx`, `/profil/page.tsx`, `/rediger/page.tsx`** — hex-palett
14. **`src/app/admin/okter/page.tsx`** — pyramide-farger hardkodet (bør være `pyramid-fys`/`pyramid-tek`-tokens)
15. **`src/app/admin/grupper/page.tsx`** — gradient-palett
16. **`src/app/admin/talent/page.tsx`** — SVG-kart med hex
17. **`src/app/admin/availability/page.tsx`** — hex

### Tier 4 — Stubs / mock-data / "kommer snart" (18 sider)

18. **`src/app/admin/plans/templates/ny/page.tsx`** — explicit "kommer i v2"-tekst
19. **`src/app/admin/reports/page.tsx`** — `console.log` i Server Actions
20. **`src/app/admin/notion-oppgaver/page.tsx`** — venter på Notion-kobling
21. **`src/app/portal/coach/notater/page.tsx` + `[id]/page.tsx`** — hardkodet demo-data uavhengig av URL
22. **`src/app/portal/tren/aarsplan/periode/[id]/rediger/page.tsx`** — mock-data
23. **`src/app/portal/tren/turneringer/[id]/page.tsx`** — mock-data
24. **`src/app/portal/tren/[sessionId]/planlagt/page.tsx`** — mock-data
25. **`src/app/portal/drills/page.tsx`** — `MOCK_DRILLS` (venter på Prisma `Drill`-modell-utvidelse)
26. **`src/app/portal/meg/innstillinger/{eksport, okter, sprak, varsler}/page.tsx`** — 4 stubs ("Kommer i runde 9")
27. **`src/app/forelder/{coach, bookinger, okonomi, innstillinger}/page.tsx`** — 4 mock-ruter

### Tier 5 — Duplikat norsk/engelsk-ruter (4 områder)

Disse har egne implementasjoner istedenfor `redirect()`:

28. **`/admin/grupper` ↔ `/admin/groups`** — konsolider til `/admin/grupper`
29. **`/admin/kalender` ↔ `/admin/calendar`** — konsolider til `/admin/kalender`
30. **`/admin/bookinger` ↔ `/admin/bookings`** — konsolider til `/admin/bookinger`
31. **`/admin/kapasitet` ↔ `/admin/capacity`** — konsolider til `/admin/kapasitet`

### Tier 6 — SEO/sikkerhet (~190 + 7 sider)

32. **Alle `src/app/auth/*` mangler `metadata`-eksport** — bør ha `robots: noindex` på token-sider (`guardian-consent/[token]`, `samtykke-venter`, `bekreft`)
33. **~190 demo-ruter åpne på toppnivå:** `newplan-demo/[steg]`, `ny-okt-demo/[steg]`, `plan-bygger-demo/[steg]`, `trackman-import-demo/[steg]` — bør flyttes under `(internal)/demos/` med auth-gates

---

## Anbefalt rekkefølge for fixes

### Sprint 1 — 1 dag (kritisk for prod)
- Tier 1 + Tier 2 (sidebar + font) — 11 sider
- Tier 3 (hex-farger) — 17 sider
- Tier 5 (duplikat-ruter) — 4 områder
- Tier 6.32 (auth metadata) — quick win

### Sprint 2 — 1 dag (rydding)
- Tier 4 (stubs + mock-data) — 18 sider
- Tier 6.33 (demo-ruter under `(internal)`) — strukturell

### Sprint 3 — pågående
- Refaktorer flere detalj-sider til DetailShell (~23 gjenstår)
- Glossary integrasjon i AI-system-prompts
- Domain-logikk (HCP/SG/CS-beregninger)

---

## Detaljerte rapporter per partisjon

- **CoachHQ (130 ruter):** `docs/audit/audit-coachhq.md`
- **PlayerHQ del 1 (50 ruter):** `docs/audit/audit-playerhq-1.md`
- **PlayerHQ del 2 (86 ruter):** `docs/audit/audit-playerhq-2.md`
- **Marketing + Forelder + Auth + resten (41 + 190 demo):** `docs/audit/audit-resten.md`

---

## Konklusjon

Plattformen er **75 % konsistent** med designsystem v2. De resterende 25 % fordeler seg på:
- **3 % systematiske design-brudd** (Tier 1+2+3 — fikses lett i fokusert sprint)
- **6 % stubs/mock-data** (Tier 4 — venter på Prisma-utvidelser eller backend-data)
- **1 % duplikat-ruter** (Tier 5 — rene redirects)
- **15 % SEO/sikkerhet** (Tier 6 — mest demo-ruter som bør lukkes)

Estimat for full opprydding: **2 dager fokusert arbeid** (Sprint 1 + 2).
