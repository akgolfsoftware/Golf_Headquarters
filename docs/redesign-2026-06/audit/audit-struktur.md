# Struktur- og død-kode-audit — AK Golf HQ

Dato: 2026-06-17. Formål: rydde foran komplett redesign. Alt verifisert mot kode med grep.
**Ingenting er slettet** — dette er en kartlegging.

> Viktig: Flere poster i den opprinnelige slette-bestillingen viste seg å være LEVENDE kode
> (se UNDERSØK/feilantakelser nederst). De er IKKE med på SLETT-lista.

---

## 1. Repo-kart (topp-struktur + rolle)

| Mappe/fil | Rolle |
|---|---|
| `src/app/` | Next.js App Router — alle ruter (fire produkter) |
| `src/app/(marketing)/` | Marketing-sider (akgolf.no) |
| `src/app/admin/` | AgencyOS (coach-admin, mørkt tema) |
| `src/app/portal/` | PlayerHQ (spillerportal, lyst tema) |
| `src/app/(internal)/` | **Demo/dev**: demos, design-system, design-system-v2 |
| `src/app/intern/` | **Demo/dev**: komponent-galleri |
| `src/app/forelder/`, `meg/`, `team-gfgk/`, `onboard/`, `inviter/`, `auth/`, `offline/` | Øvrige rolle-/flyt-ruter |
| `src/app/api/` | Route handlers |
| `src/components/athletic/` | Brandet komponentbibliotek (eneste AK-DNA-sannhet) |
| `src/components/ui/` | shadcn-primitiver |
| `src/components/admin*/`, `portal*/`, `shared/`, `booking/` | Produktspesifikke komponenter |
| `src/lib/` | Helpers, design-tokens.ts, prisma, supabase, domene |
| `prisma/` | Schema + migrasjoner |
| `public/` | Statiske filer (+ `design-handover/` lokal, gitignored) |
| `scripts/` | 71 dev/seed/screenshot-scripts |
| `docs/` | Dokumentasjon (kanon + redesign + skjermplan + arkiv) |
| `content/blog/` (md) + `content/blogg/` (mdx) | **To parallelle blogg-systemer** (se SLETT) |
| `e2e/`, `tests/` | Playwright + node:test |
| `test-results/`, `playwright-report/` | Test-output (gitignored) |
| `_archive/` | Dato-merkede arkiver — 412 MB (gitignored, men 71 filer fortsatt git-tracket) |
| `design-system/` (rot) | Løs `tokens.css` + components — **forbudt token-fil, 0 referanser** |
| `supabase-meg/` | Meg-assistentens egne Supabase-filer |
| Rot-`.md` (8 stk) | AGENTS, CLAUDE, README, SECURITY, START-HER, LAUNCH-CHECKLIST, SYNC, WORKLOG |

---

## 2. SLETT-liste (fil | grunn | verifisert)

Kun poster med bevist 0 levende bruk. Sortert etter trygghet/effekt.

| # | Fil/mappe | Grunn | Verifisert |
|---|---|---|---|
| 1 | `_archive/` (412 MB, 71 git-tracket filer) | Rene dato-arkiver fra mai/juni; allerede i `.gitignore` (linje 70) men historiske filer er fortsatt tracket | `git ls-files _archive` = 71; `du -sh` = 412M; mappen er gitignored |
| 2 | `design-system/` (rot — `tokens.css`, `components/`, `README.md`) | Løs token-fil utenfor godkjent kilde (`globals.css`); forbudt per designsystem-regel; **0 importer** | `grep "design-system/tokens\|design-system/components"` i src = 0 treff |
| 3 | `src/app/admin/locations/` (ekte side, DB-logikk) | **Uoppnåelig**: `next.config.ts` 301-redirecter `/admin/locations` → `/admin/anlegg`. Anlegg-siden dekker funksjonen | next.config linje 55; `admin/anlegg/page.tsx` er fasit-porten |
| 4 | `src/app/admin/facilities/` (ekte side, DB-logikk) | **Uoppnåelig**: next.config 301 `/admin/facilities` → `/admin/anlegg` (+ `/:id`) | next.config linje 56–57; anlegg dekker det |
| 5 | `content/blog/` (3 .md) + `src/lib/blog.ts` | Gammelt blogg-system (singular). `src/lib/blog.ts` har **0 importer**; det levende systemet er `content/blogg/` (.mdx) via `src/lib/blogg/posts.ts` | `grep "lib/blog\b"` = 0 treff utenom blogg |
| 6 | Stray DB-filer: `src/app/agentdb.rvf`, `src/app/agentdb.rvf.lock`, `src/app/ruvector.db`, `src/app/(marketing)/ruvector.db` (~3 MB) | Lokal cruft fra et verktøy; gitignored, ikke tracket | `git check-ignore` bekrefter alle 4 ignored; ikke i `git ls-files` |
| 7 | `src/components/` foreldreløse (≈135 stk, 0 importer) | Se egen seksjon 4 — subagent-verifisert | grep per basename i hele src/ = 0 |

### Redirect-stubber (UNDERSØK før sletting — ikke blind delete)
Disse er bittesmå `permanentRedirect`-filer (4–6 linjer) som dobbelt-beskytter gamle URL-er
(både next.config OG in-page redirect). De er bevisste, ikke død kode i vanlig forstand. Ved et
komplett redesign kan rute-treet uansett legges om — vurder samlet, ikke enkeltvis:
`admin/calendar`, `admin/messages`, `admin/approvals`, `portal/analyse`, `portal/stats`.

---

## 3. BEHOLD-liste (var på bestillingen, men er LEVENDE — IKKE slett)

| Post fra bestilling | Status | Bevis |
|---|---|---|
| `portal/mal/*` (26 page.tsx) | **LEVENDE kjerne** — PlayerHQ-dashboard | 82 eksterne refs; lenket fra sidebar, talent, trackman, runder, sg-hub osv. |
| `portal/analyse` | Redirect-stub (se UNDERSØK) | redirecter til /portal/analysere |
| `portal/stats` | Redirect-stub (se UNDERSØK) | redirecter til /portal/statistikk |
| `portal/tren/ovelser*` | **LEVENDE** — øvelsesbibliotek | brukt av exercise-card, add-exercise-sheet, coach/ovelser, search |
| `admin/calendar`, `admin/messages`, `admin/approvals` | Redirect-stubber (bevisste) | next.config + in-page redirect |
| `admin/board` | **LEVENDE** | lenket fra spillere-tabs |
| `admin/plans/templates*` | **LEVENDE** (43 eksterne refs) | redirect til templates fjernet bevisst (next.config kommentar) |
| `admin/anlegg*` | **LEVENDE fasit-side** | erstatter locations/facilities |
| `admin/availability`, `admin/queue` | **LEVENDE** | lenket fra anlegg, mer, admin-nav |
| `app/(internal)/*`, `app/intern/komponenter/*` | Demo/galleri, 0 prod-refs | KANDIDAT men beholdes til redesign (se UNDERSØK) |
| `(marketing)/suksess`, `(marketing)/stats/blogg*` | **LEVENDE** | lenket fra forside-footer |
| `wireframe/` | Finnes ikke (allerede slettet) | `ls` = ingen mappe |
| `docs/design-handoff-komplett/` | Finnes ikke (allerede slettet/flyttet) | `ls` = ingen mappe |

---

## 4. Foreldreløse filer (0 importreferanser)

Subagent-verifisert: **≈135 filer under `src/components/`** har null importer i hele `src/` og er
ikke Next.js-spesialfiler. Disse er hovedgevinsten i en redesign-opprydding. Topp 25 (resten kan
genereres på nytt med samme metode rett før sletting, da redesign vil flytte mye):

- `src/components/admin/aktivitets-feed.tsx`
- `src/components/admin/anlegg-mapbox.tsx`
- `src/components/admin/calendar-day-view.tsx`
- `src/components/admin/calendar-view-toggle.tsx`
- `src/components/admin/coach-filter.tsx`
- `src/components/admin/compliance/compliance-tracking.tsx`
- `src/components/admin/dagens-timer-card.tsx`
- `src/components/admin/edit-okt-modal.tsx`
- `src/components/admin/edit-periode-modal.tsx`
- `src/components/admin/gruppe-snarveier.tsx`
- `src/components/admin/hub-kpi-strip.tsx`
- `src/components/admin/innboks/innboks-liste.tsx`
- `src/components/admin/multi-compare/multi-compare.tsx`
- `src/components/admin/plan-templates/library-view.tsx`
- `src/components/admin/recording-trigger-button.tsx`
- `src/components/admin/services-liste.tsx`
- `src/components/admin/settings/drift-panel.tsx`
- `src/components/admin/spillere-tabs.tsx`
- `src/components/admin/spillere/stallen-table.tsx`
- `src/components/admin/spillerliste-card.tsx`
- `src/components/athletic/cards/coach-message.tsx`
- `src/components/athletic/cards/insight-card.tsx`
- `src/components/athletic/cards/partner-card.tsx`
- `src/components/athletic/cards/quick-action.tsx`
- `src/components/athletic/editorial/ghost-number.tsx`

Plus: `src/lib/blog.ts` (orphan, se SLETT #5).

> NB: Noen "orphans" kan være bevisst beholdt athletic-komponenter (designsystem-byggeklosser).
> Før batch-sletting: kryssjekk athletic/-treffene mot designsystem-regelen og redesign-behov.

---

## 5. UNDERSØK (avklar med Anders før handling)

1. **Redirect-stubber** (5 stk, seksjon 2) — slett samlet ved rute-omlegging, ikke enkeltvis.
2. **Demo-flater** `(internal)/` + `intern/komponenter/` — 0 prod-refs. Trolig trygge å fjerne,
   men kan være nyttige som komponent-galleri under redesign. Behold til retning er valgt.
3. **`docs/claude-design-handover/` (13 MB)** — gjeldende eller forrige handover? Avklar mot ny
   Claude Design-leveranse før evt. arkivering.
4. **`_archive/` git-historikk** — gitignored nå, men 71 filer er tracket. `git rm -r --cached _archive`
   fjerner dem fra fremtidige commits (sletter ikke disk). Bør gjøres for å slanke repoet.
5. **athletic/ orphans** — verifiser at de ikke er ment som gjenbrukbare byggeklosser før sletting.
