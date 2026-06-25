# Claude Code — Komplett kjøreplan (handoff fra Grok 25. juni 2026)

> **Formål:** Én selvstendig plan Claude Code kan kjøre i nye økter uten Grok-kontekst.
> **Mål:** Ferdigstille *kode* (ikke Claude Design) — fra lansert Workbench → betalingsklar 1. juli.
> **Repo:** `/Users/anderskristiansen/Developer/akgolf-hq` · **Branch:** `main`

---

## 0 · START HER (lim inn som første melding i Claude Code)

```
Du kjører docs/CLAUDE-CODE-PLAN-FERDIGSTILLE-PLATTFORM.md.

LES FØRST (5 min):
1. docs/platform/AGENT-BRIEF.md
2. docs/STATUS-NÅ.md
3. docs/MASTER-SKJERMPLAN.md (finn raden før du rører en skjerm)
4. .claude/rules/gotchas.md

REGLER:
- Én bølge om gangen. Commit + push etter hver bølge som passerer verifikasjon.
- Oppdater MASTER-SKJERMPLAN hakene i SAMME commit som skjermarbeid.
- Ikke rør ulagret lokalt arbeid (marketing/admin-shell) med mindre Bølge 0 sier det.
- Verifiser ALLTID før commit:
  npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build
- Test: npm test (forvent ~230+ grønne)
- Workbench-gate (hvis du rører workbench): SCRATCH=/tmp/wb-gate BASE_URL=http://localhost:3000 bash scripts/launch-verify-bundle.sh

Start med Bølge 0. Rapporter status etter hver bølge på norsk til Anders.
```

---

## 1 · Nåstatus (fasit 25. juni 2026)

### ✅ Ferdig (ikke re-arbeid uten grunn)

| Område | Bevis |
|---|---|
| Workbench hub (7 faner) | Commit `3007265d` på `main`, design-gate PASS |
| PlayerHQ 5 hovedskjermer | MASTER-SKJERMPLAN Design=✓ |
| AgencyOS ~26 kjerneskjermer desktop | Fase 3 porting |
| SG-motor + testbatteri | 168+ tester |
| Deploy | `akgolf-hq.vercel.app` (manuell `vercel deploy --prod`) |

### ⚠️ Ulagret lokalt (IKKE pushet — vurder før du starter)

```
M  marketing/, admin-shell, globals.css, agencyos-sidebar, ai-plan, ...
D  workbench-mobile.tsx (slettet lokalt)
?? .design-review/, admin-brand-switcher, sg-console, ...
```

**Handling:** Kjør `git status`. Enten commit som egen bølge (Bølge 0) eller `git stash` før planen.

### ❌ Ikke ferdig

- **~60 skjermer** med Design=– eller delvis (~)
- **17 STUB** + **3 SHELL** sider
- **Evaluering** i Workbench-sløyfe (stub)
- **AgencyOS mock:** økonomi, innboks-dyp, analytics
- **Hele `/portal/coach/*`** — kode uten design-gate
- **P0 panel-oppgaver** (Stripe live, Resend DNS, APP_URL) — Anders, ikke kode

---

## 2 · Definisjon av «ferdig» (per skjerm)

En skjerm er **ikke ferdig** før alle 6 hakene i MASTER-SKJERMPLAN er ✓:

1. Design · 2. Mob/Desk/iPad · 3. Adresse-ok · 4. Flyt · 5. Data · 6. Funker

For skjermer uten fasit-design: bygg fra `public/design-handover/` eller `.design-review/claude-code-handoff/SKJERMER.md`, kjør design-porting-gate (`.claude/rules/design-porting-gate.md`).

---

## 3 · Verifikasjon (kjør før hver commit)

```bash
cd /Users/anderskristiansen/Developer/akgolf-hq
npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build
npm test
```

**Workbench-endringer:**
```bash
# Terminal 1
npm run dev
# Terminal 2
SCRATCH=/tmp/wb-gate BASE_URL=http://localhost:3000 bash scripts/launch-verify-bundle.sh
```

**Etter push:**
```bash
npx vercel deploy --prod --archive=tgz
```

---

## 4 · Kjøreplan — 8 bølger

Kjør i rekkefølge. Hopp over bølge kun hvis Anders sier det.

---

### Bølge 0 · Rydding og P0-kode (½ dag)

**Prompt til Claude Code:**
```
Bølge 0 fra docs/CLAUDE-CODE-PLAN-FERDIGSTILLE-PLATTFORM.md

1. git status — kartlegg ulagret arbeid. Ikke force/reset.
2. Fiks P0-kode: redirect /portal/meg/innstillinger/eksport → personvern (GDPR-eksport virker der).
3. Verifiser feature-flags: gratisForAlle() til 1. juli — ingen regressjon.
4. Kjør full verifikasjon. Commit: fix(portal): redirect data export stub to privacy page
5. Push main. Oppsummer på norsk.
```

**Filer å sjekke:**
- `src/app/portal/meg/innstillinger/eksport/`
- `src/lib/feature-flags.ts`

**Anders-panel (dokumenter, ikke kode):**
- Stripe live keys i Vercel
- Resend SPF/DKIM
- `NEXT_PUBLIC_APP_URL=https://akgolf.no`

---

### Bølge 1 · Workbench post-lansering (1–2 dager)

Workbench er *lansert* — denne bølgen fyller hull i sløyfen, ikke redesign.

**Prompt:**
```
Bølge 1 — Workbench post-lansering.

Les: docs/MASTER-SKJERMPLAN Workbench-rader, .design-review/handover-pakke/WORKBENCH-SLOYFE-SPEC.md,
src/components/workbench-hybrid/

Implementer i prioritert rekkefølge (ett PR-steg per punkt, commit mellom):

1. FORRIGE/NESTE uke — koble week-offset API (i dag klikk uten datoflyt)
2. Evaluerings-tab eller /admin/evaluering kobling — minste ring: økt-review 1–5 → Evaluering(økt)
3. Uke time-grid: week navigation + persist drag-drop (allerede delvis — verifiser edge cases)
4. Okt coach-panel: SG-kobling + coach-notat når data seedet
5. Maler: match-% fra PlanEffectiveness når modell finnes (ellers behold fase+bruk)

Etter hvert punkt: oppdater MASTER-SKJERMPLAN. Kjør workbench-gate ved endring i workbench-hybrid/.
Ikke bryt design-porting-gate unntak (hub 7 faner, time-grid, v10 chrome).
```

**Nøkkelfiler:**
- `src/components/workbench-hybrid/WorkbenchHybrid.tsx`
- `src/components/workbench-hybrid/UkeView.tsx`
- `src/components/workbench-hybrid/OktDetailTab.tsx`
- `scripts/load-workbench.ts` (eller tilsvarende data-loader)

---

### Bølge 2 · PlayerHQ undersider P1 (3–5 dager)

Fra MASTER-SKJERMPLAN «Prioritet 1». Tackle i denne rekkefølgen:

| # | Skjerm | Rute | Design-kilde |
|---|---|---|---|
| 1 | Mål-hub | `/portal/mal` | `ph-16-mal-hub.png` / Mål-hub hybrid |
| 2 | Mål-bygger | `/portal/mal/bygger` | Mål-bygger hybrid |
| 3 | Teknisk plan spiller | `/portal/tren/teknisk-plan/*` | ph-06 + workbench tek-tab mønster |
| 4 | SG-Hub sub-sider | `/portal/mal/sg-hub/*` | terminal-lys analyse |
| 5 | Gjennomføre undersider | `/portal/gjennomfore/[id]`, `/portal/ny-okt` | ph-12, ph-20 |
| 6 | Live-økt Funker-hake | brief/active/summary | playerhq-live-session SKILL |

**Prompt (per skjerm eller batch 2–3):**
```
Bølge 2 — PlayerHQ [SKJERMNAVN].

1. Finn rad i docs/MASTER-SKJERMPLAN.md
2. Les design-kilde fra .design-review/claude-code-handoff/SKJERMER.md
3. Bygg FRA design (design-porting-gate 5 steg) — ikke fra minne
4. Koble ekte Prisma-data (se rad «Data tilgjengelig»)
5. Alle tilstander: tom/laster/feil
6. Oppdater 6 hakene i MASTER-SKJERMPLAN
7. verifikasjon + commit: feat(playerhq): [skjerm] design port and data wiring
```

**Skill:** Les `/Users/anderskristiansen/.claude/skills/playerhq-live-session/SKILL.md` for live-økt.

---

### Bølge 3 · PlayerHQ Coach-seksjon (2–3 dager)

Hele `/portal/coach/*` har Design=–.

**Prompt:**
```
Bølge 3 — PlayerHQ Coach-dialog.

Skjermer: /portal/coach, melding, melding/[id], plans/[planId], ovelser, videoer, sporsmal/[id]

Kilde: ph-18-coach-dialog.png, PlayerHQ Coach-dialog-undersider (terminal-lys).dc.html

Én skjerm om gangen. Mobil 430px først. Koble CaddieMessage, SessionRequest, Document fra Prisma.
Oppdater MASTER-SKJERMPLAN for hver skjerm.
```

---

### Bølge 4 · AgencyOS sekundær + data-kobling (3–5 dager)

**Prompt:**
```
Bølge 4 — AgencyOS mock → ekte data.

Prioritet fra MASTER-SKJERMPLAN Prioritet 3:
1. /admin/analysere (hub + undersider)
2. /admin/okonomi — koble Stripe/faktura der mulig, ellers ærlig empty state
3. /admin/workspace/* — Notion-sync status ærlig
4. /admin/gjennomfore hub
5. Plan-detalj /admin/plans/[planId], plan-templates detalj

Les coachhq-arkitektur SKILL. Ikke dupliser Workbench — lenk til /admin/spillere/[id]/workbench.

Skill: /Users/anderskristiansen/.claude/skills/coachhq-arkitektur/SKILL.md
```

---

### Bølge 5 · Booking + Marketing (2–3 dager)

**Prompt:**
```
Bølge 5 — Booking og Marketing.

Booking: /portal/booking/*, /booking/[slug] — mobil wizard, ekte Booking/CoachingSession.
Marketing: /om-oss, /coaching, /priser, /playerhq — fra mk-*.png og Marketing STUB-sider.

BOOKING_ACTIVE=false i prod — Acuity er fallback. Bygg HQ-booking ferdig men feature-flag.

Design: lyst editorial, 1280+430. Commit per side.
```

---

### Bølge 6 · Teknisk gjeld og redirects (1 dag)

Fra MASTER-SKJERMPLAN «Bolk 4 — Rydd dobbeltadresser».

**Prompt:**
```
Bølge 6 — URL-opprydding.

Duplikater → én kanonisk rute + redirect i next.config eller page.tsx:
- finance/okonomi, calendar/kalender, messages/innboks, plans-templates/plan-templates,
  approvals/godkjenninger, stats/statistikk, analyse/analysere, drills/ovelser

Ingen breaking changes for bokmerker uten redirect. Test med npm run build.
Commit: chore(routes): consolidate duplicate admin and portal paths
```

---

### Bølge 7 · STUB/SHELL → FULL eller fjern (løpende)

**Prompt:**
```
Bølge 7 — STUB/SHELL audit.

1. Grep etter STUB/SHELL i MASTER-SKJERMPLAN
2. Per side: enten fullfør (minste viable) ELLER redirect til riktig hub ELLER 404 med mening
3. Ikke la SHELL stå åpne i prod-navigasjon

17 STUB + 3 SHELL — lag liste i commit-melding.
```

---

## 5 · Parallellisering (valgfritt — kun med worktrees)

Hvis Anders bruker `akgolf-branch-workflow` skill:

| Worktree | Bølge | Branch-forslag |
|---|---|---|
| wt-1 | Bølge 2 PlayerHQ | `feat/playerhq-p1-skjermer` |
| wt-2 | Bølge 4 AgencyOS | `feat/agencyos-data-wire` |
| wt-3 | Bølge 1 Workbench | `feat/workbench-post-launch` |

Merge til `main` etter verifikasjon per worktree. **Ikke** parallelle endringer i `workbench-hybrid/` og `globals.css` uten merge-plan.

---

## 6 · Claude Design (separat spor — ikke Claude Code)

Design-prompt lagret på Google Disk:
`~/My Drive/AK Golf Group/prompt/CLAUDE-DESIGN-PROMPT-WORKBENCH-OG-ALLE-SKJERMER-2026-06-25.md`

**Claude Code skal IKKE vente på design** for skjermer som allerede har PNG+dc.html i `.design-review/`. For skjermer uten design: bygg ærlig empty state + data-kobling, merk Design=~ i planen.

---

## 7 · Data-blokkert (ikke start kode før schema)

Fra MASTER-SKJERMPLAN — **hopp over** inntil Anders godkjenner schema:

- Shot-map (`/portal/statistikk/shot-map`) — mangler punkt-koordinater i prod-modell
- Scorecard hull-for-hull per turnering
- Live turnerings-tracking
- FYS-referanseverdier (formel ikke låst) — bruk plassholdere

Schema-endring: **kun** kirurgisk `db execute` via gotchas.md — aldri `migrate dev` eller `db push`.

---

## 8 · Test-credentials (e2e / gate)

```
Spiller: screentest@akgolf.test / Screentest123!
Coach:   coachtest@akgolf.test / Screentest123!
```

Seed: `scripts/seed-screentest.ts` (hvis finnes)

---

## 9 · Suksesskriterier (hele planen)

| Milepæl | Kriterium |
|---|---|
| **M1 — Teknisk stabil** | Bølge 0–1 grønn, 0 P0-kodefeil |
| **M2 — PlayerHQ komplett** | Alle ★-rader + P1 undersider 6/6 ✓ |
| **M3 — AgencyOS drift** | Ingen mock-tall på cockpit/spillere/workbench/bookinger |
| **M4 — Betalingsklar 1. juli** | Stripe live + tier-gating testet + e-post DNS |
| **M5 — 100% skjermplan** | MASTER-SKJERMPLAN dashboard: 0 rader med Funker=– på ★-skjermer |

---

## 10 · Vanlige feil (unngå)

1. **Bygge fra gammel kode** i stedet for design-handover → gate-feil
2. **`prisma migrate dev`** → shadow DB ødelagt
3. **Hardkode hex** → bruk `globals.css` tokens
4. **Glemme MASTER-SKJERMPLAN** → alltid oppdater i samme commit
5. **ELITE tier i UI** → aldri vis
6. **CoachHQ i tekst** → bruk AgencyOS
7. **Push uten verifikasjon** → CI-brudd

---

## 11 · Økt-avslutning (lagre fremdrift)

Etter hver Claude Code-økt:
```
/lagre-sesjon
```

Oppdater `docs/STATUS-NÅ.md` dato + 2–3 linjer hvis en bølge fullføres.

---

## 12 · Quick reference — viktige filer

| Formål | Sti |
|---|---|
| Skjermliste | `docs/MASTER-SKJERMPLAN.md` |
| Nåstatus | `docs/STATUS-NÅ.md` |
| Agent-regler | `docs/platform/AGENT-BRIEF.md` |
| Business rules | `docs/platform/BUSINESS-RULES.md` |
| Workbench kode | `src/components/workbench-hybrid/` |
| Design screenshots | `.design-review/claude-code-handoff/screens/` |
| Workbench wireframe | `.design-review/Workbench Komplett Hub.dc.html` |
| Design gate regler | `.claude/rules/design-porting-gate.md` |
| Gotchas | `.claude/rules/gotchas.md` |

---

*Generert 25. juni 2026 som handoff fra Grok → Claude Code*
*Relatert design-dokument: Google Drive `prompt/CLAUDE-DESIGN-PROMPT-WORKBENCH-OG-ALLE-SKJERMER-2026-06-25.md`*