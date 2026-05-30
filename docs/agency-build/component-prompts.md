# AgencyOS — byggeprompter for manglende komponenter

Generert 2026-05-30 fra gap-analyse mot design-preview (Pulje D + E).
Hver seksjon er en **selvstendig prompt** klar til å gi en Claude Code-agent.

**Design-referanse:** åpne `docs/agency-build/preview/<fil>.html` i en browser for pixel-fasit. (Disse er de faktiske Claude Design-prototypene; `_shared.css` følger med.)

---

## Felles kontrakt — gjelder ALLE prompter under

Lim inn denne blokken øverst i hver agent-prompt (eller pek agenten hit):

```
Stack: Next.js 16 (App Router, RSC), React 19, Tailwind v4 (tokens i src/app/globals.css via @theme), TypeScript strict. Pakkebehandler npm.

DESIGNSYSTEM — ufravikelig:
- Bruk KUN semantiske tokens som Tailwind-klasser. ALDRI hex eller arbitrary farge (eslint --max-warnings 0 blokkerer bg-[#...]).
  Tilgjengelige: bg-background, bg-card, bg-secondary, bg-primary, bg-accent, bg-muted,
  text-foreground, text-muted-foreground, text-primary, text-accent, text-{success,warning,info,destructive}-foreground,
  border-border, border-input, ring-ring,
  bg-pyr-{fys,tek,slag,spill,turn} og bg-pyr-{...}-track,
  font-sans, font-display, font-mono, rounded-{card,pill,btn,lg,md,sm}.
- Tall (KPI, score, %, distanse, klokke): font-mono + tabular-nums. Norsk: komma-desimal, mellomrom tusenskille, "48 %".
- 8pt-grid: kun p/m/gap-2/4/6/8/10/12/16. Aldri p-3/p-5/p-7.
- Ikoner: lucide-react, 1.5px stroke, currentColor. INGEN emoji, INGEN unicode-symboler (✓✗★).
- Tekst på norsk bokmål (æ ø å). Editorial italic = Inter Tight italic på <em>, text-primary. Aldri serif.
- Gjenbruk eksisterende: src/components/athletic/* og src/components/ui/* FØR du lager nytt.
- cn() fra @/lib/utils for klassesammenslåing. Komponent-API i TypeScript, ingen `any`.

VERIFISER FØR DU ER FERDIG: npx tsc --noEmit && npx eslint <dine-filer> --max-warnings 0
Lever komponenten + en kort demo-rute under src/app/<navn>-demo/page.tsx (toppnivå, RUTBAR — IKKE
src/app/_dev/, da _-prefiks er privat mappe i Next.js og gir 404) med mock-data som matcher preview,
så den kan screenshot-verifiseres mot docs/agency-build/preview/<fil>.html.
```

---

## Byggerekkefølge (avhengigheter)

```
BOLK 1 — infrastruktur (blokkerer resten)
  1. AgencySidebar      ← rammen alle agency-sider henger i
  2. DataTable          ← Stallen + Bookinger
  3. Indicator-utvidelser (badges/dots) ← brukes overalt

BOLK 2 — Pulje D-skjermkomponenter (kan parallelliseres etter bolk 1)
  4. TestMatrix
  5. Inbox-kit
  6. Bookinger-form-kit
  7. Team/Drift-kit
  8. Spiller-detalj-panel
  9. Multi-compare
 10. CommandPalette (global, blokkerer ingen enkeltside — kan tas sist)

BOLK 3 — Pulje E (Foreldre)
 11. ApprovalCard + MinorGate
 12. Foreldre-kommunikasjon
```

---

# BOLK 1 — Infrastruktur

## 1. AgencySidebar

**Fil:** `src/components/athletic/shell/agency-sidebar.tsx` (+ `org-switcher.tsx`)
**Brukes i:** alle `/admin`-ruter (AgencyOS).
**Design-ref:** `docs/agency-build/preview/components-agency-sidebar.html`

**Oppgave:** Bygg en coach-orientert sidebar. Dagens `athletic/shell/sidebar.tsx` er PlayerHQ (lys) — IKKE gjenbruk den; dette er en egen, mørk variant.

Krav fra preview:
- To moduser: utvidet 240px og icon-rail 56px, med toggle. Mørk forest bakgrunn (bruk `bg-coach-sidebar`-token / forest-900).
- Brand-header øverst, deretter en `<OrgSwitcher>` (pill som bytter klubb/organisasjon).
- Gruppert nav med seksjonslabels (mono caps), badge-overlay på ikon i rail-modus, og keyboard-shortcut-hint i utvidet modus.
- I rail-modus: hover gir tooltip til høyre (bruk `ui/tooltip` tilpasset, eller egen `NavTooltip`).
- Coach-footer nederst: avatar + presence-dot + status-linje.

**Props:** `items: NavGroup[]`, `mode: "expanded" | "rail"`, `onToggle`, `org: Org`, `orgs: Org[]`, `onSwitchOrg`, `user: { name, role, presence }`. Aktiv rute via `usePathname()`.

**Akseptanse:** rendrer i begge moduser; aktiv lenke uthevet; rail-tooltip vises på hover; matcher preview-en.

---

## 2. DataTable

**Fil:** `src/components/athletic/data-table.tsx` (+ `pagination.tsx`)
**Brukes i:** Stallen (`agency-player-table`), Bookinger (`agency-bookings`).
**Design-ref:** `docs/agency-build/preview/components-agency-player-table.html`

**Oppgave:** Generisk, sorterbar datatabell. Ingen tabell-komponent finnes i dag — denne må dekke BEGGE skjermene, så hold den generisk.

Krav fra preview:
- Kolonne-definisjon med fast bredde, venstre/høyre-justering, og klikkbar header med sort-indikator (lucide `ChevronUp/Down`, mono).
- Rad-states: hover, selected. Valgfri rad-checkbox (`ui/checkbox`) for multi-select.
- Valgfrie **gruppe-separator-rader** (Bookinger bruker dato-grupper: "I DAG", "MANDAG 26 MAI").
- Celle-render via `cell: (row) => ReactNode` så caller kan legge inn avatar, sparkline, status-pill osv.
- Footer med `<Pagination>` (sidetall + prev/next, mono).
- Tom-tilstand via `ui/empty-state`.

**Props (generisk `<DataTable<T>>`):** `columns: Column<T>[]` (`{ key, header, width?, align?, sortable?, render }`), `rows: T[]`, `groupBy?`, `selectable?`, `selected/onSelect`, `sort/onSort`, `page/pageSize/total/onPage`.

**Akseptanse:** sortering toggler asc/desc/av; gruppe-separatorer rendres; paginering virker; brukt med Stallen-mock matcher preview.

---

## 3. Indicator-utvidelser (badges + dots)

**Fil:** utvid `src/components/athletic/badge.tsx` + `pulse-dot.tsx`, ny `src/components/athletic/status-pill.tsx`
**Brukes i:** alle agency-skjermer.
**Design-ref:** se status-piller i `agency-player-table.html`, `agency-drift.html`, `agency-player-panel.html`

**Oppgave:** Små, gjenbrukbare indikatorer. Hold dem som varianter/props, ikke duplikater.

Lever:
- `<StatusPill>` — rund pill med LED-dot + valgfritt lucide-ikon + tekst. `tone: "active" | "behind" | "inactive" | "guide" | "alert" | "warn"`. (LED-dot = liten farget prikk med subtil glød på "active".)
- `<PresenceDot>` — `state: "online" | "away" | "busy" | "offline"`, ment å legges over en avatar (absolutt posisjonert ring). Utvid evt. `pulse-dot`.
- `badge.tsx` nye varianter: `role` (CBAC: EIER/HEAD COACH/COACH/FYS/ASSISTENT/BILLING — hver med ikon), `periode` (GRUNN/SPES/TURN/SKADE/TEST), `severity` (hi/md/lo/ok som ren farget dot).
- `<ScopeChip>` — liten pill med symbol (@ > ? /) + label + valgfri X (brukes i CommandPalette og filter).

**Akseptanse:** alle varianter rendrer med riktige pyramide-/semantiske farger; ingen hex; brukt i en demo-rute som viser hele settet.

---

# BOLK 2 — Pulje D-skjermkomponenter

## 4. TestMatrix

**Fil:** `src/components/athletic/data/test-matrix.tsx` (+ intern `MatrixCell`, `LegendStrip`)
**Brukes i:** Tester-matrise (`agency-tests`).
**Design-ref:** `docs/agency-build/preview/components-agency-tests.html`

**Oppgave:** Matrise med spillere som rader og tester som kolonner. `heatmap-calendar` dekker IKKE dette (det er dato-grid).

Krav fra preview:
- Kolonneheader: pyramide-farge-dot + testnavn + enhet + mål-pill.
- Rad-header (spiller): avatar + navn + gruppe-badge + tier-sub.
- Celle (`MatrixCell`): state `over | near | under | untested`, viser verdi + delta + dato; hover-scale; overdue-dot; `testing`-puls (reduced-motion-gated).
- `<LegendStrip>` over/under tabellen (fargede swatches + tekst).
- "Tildel test"-knapp per spiller med notification-badge.

**Props:** `players: Player[]`, `tests: TestDef[]`, `results: Map<[playerId,testId], Result>`, `onAssign`, `onCellClick`.

**Akseptanse:** alle fire celle-states fargekodet riktig; puls respekterer `prefers-reduced-motion`; matcher preview.

---

## 5. Inbox-kit

**Fil:** `src/components/admin/inbox/` (`inbox-row.tsx`, `batch-action-bar.tsx`, `inbox-expand.tsx`, `filter-pill-bar.tsx`)
**Brukes i:** Coach-innboks (`agency-inbox`).
**Design-ref:** `docs/agency-build/preview/components-agency-inbox.html`

**Oppgave:** Coach handlings-innboks. Disse fire er tett koblet — bygg i én økt.
- `<InboxRow>` — grid-rad: checkbox · type-ikon · avatar · emne+preview · klokke · attachment-pip · severity-dot. States: unread (lime venstre-border), selected, hover.
- `<BatchActionBar>` — lime-tint bar som vises BETINGET ved selektion, med bulk-handlinger.
- `<InboxExpand>` — inline-utfolding under raden (IKKE modal): dashet rail + quote-blokk + "VAR → FORESLÅTT"-strip + handlingsrad.
- `<FilterPillBar>` — horisontal pill-gruppe med count-badges og aktiv-state (gjenbrukes i multi-compare).

**Props:** `rows: InboxItem[]`, `selected/onSelect`, `expandedId/onExpand`, `filters/active/onFilter`.

**Akseptanse:** multi-select viser batch-bar; rad ekspanderer inline; unread-state synlig; matcher preview.

---

## 6. Bookinger-form-kit

**Fil:** `src/components/admin/bookings/` (`inline-booking-form.tsx`, `autocomplete-input.tsx`, `credit-bar.tsx`)
**Brukes i:** Bookinger (`agency-bookings`).
**Design-ref:** `docs/agency-build/preview/components-agency-bookings.html`

**Oppgave:**
- `<InlineBookingForm>` — lime-rammet form som ekspanderer over tabellen; grid med felter (spiller, coach, type, dato/tid, varighet) + credit-check-chip.
- `<AutocompleteInput>` — bygg på `ui/input` + `ui/popover`; dropdown viser avatar + navn + kredittsaldo.
- `<CreditBar>` — segmentert dot-bar (f.eks. 10 segmenter filled/empty) + fraksjon + status. IKKE `progress-bar` (annen visuell struktur).

**Props:** standard form-props + `players`, `coaches`, `serviceTypes`, `onSubmit`. CreditBar: `used`, `total`.

**Akseptanse:** autocomplete filtrerer + viser saldo; credit-bar viser forbruk; matcher preview. (Datalogikk er stub — visuell + interaksjon her.)

---

## 7. Team / Drift-kit

**Fil:** `src/components/admin/team/` (`team-roster-list.tsx`, `plan-mal-card.tsx`, `pyr-dist-bar.tsx`)
**Brukes i:** Drift-landing / Team CBAC / Plan-maler (`agency-drift`).
**Design-ref:** `docs/agency-build/preview/components-agency-drift.html`

**Oppgave:**
- `<TeamRosterList>` — grid-liste: avatar + presence-dot, navn+epost, `role`-badges (CBAC), scope-tekst med gruppe-pills, more-knapp.
- `<PlanMalCard>` — kort med `<PyrDistBar>` + periode-tag + footer-stats; egen `new`-variant (dashed lime border).
- `<PyrDistBar>` — enkel horisontal 5-segment farge-bar (% per pyramide-akse, CSS — IKKE Recharts `pyramid-distribution`).

Gjenbruk: `StatusPill`/`PresenceDot`/`role`-badge fra prompt 3; `patterns/audit-log` for audit-fanen; `ui/tabs` for fane-nav.

**Akseptanse:** roster viser roller + presence; plan-mal-kort + new-variant; pyr-dist-bar summerer til 100 %.

---

## 8. Spiller-detalj-panel

**Fil:** `src/components/admin/player/player-detail-panel.tsx` (+ `week-mini-grid.tsx`, `booking-row.tsx`)
**Brukes i:** klikk på spiller i Stallen/Brief → 400px slide-over.
**Design-ref:** `docs/agency-build/preview/components-agency-player-panel.html`

**Oppgave:** Bygg innholdet i et høyre slide-over. Bruk `ui/sheet side="right"` som skall (utvid med 400px size-variant + backdrop-tint om nødvendig).
Seksjoner: header (avatar + presence + status/alarm-pills) · KPI-rad (`athletic/kpi`) · mini-pyramide vs plan (`pyramid-progress`) · `<WeekMiniGrid>` (7 dag-tiles med pyramide-pips) · neste booking (`<BookingRow>`: dato-tile + sesjon + type-tag) · siste kommunikasjon (gjenbruk inbox-row-mønster) · coach-footer (primær/sekundær/ghost-knapper).

**Props:** `player: PlayerDetail`, `open/onClose`, action-callbacks.

**Akseptanse:** sklir inn fra høyre; alle seksjoner rendret; matcher preview.

---

## 9. Multi-compare

**Fil:** `src/components/admin/compare/` (`multi-player-compare-grid.tsx`, `cohort-ranking-list.tsx`)
**Brukes i:** Multi-spiller sammenligning (`multi-compare`).
**Design-ref:** `docs/agency-build/preview/components-multi-compare.html`

**Oppgave:** To kjernevisninger (region-kart utsettes — se note):
- `<MultiPlayerCompareGrid>` — N-kolonne grid: metric-akser i venstre kolonne, én kolonne per spiller + en PGA-referansekolonne, "BEST"-badge per metrikk-rad, bar-visualisering per celle.
- `<CohortRankingList>` — horisontal bar mot bidireksjonell center-line (zero-point) + PGA-referanselinje; fargestyrt (over/ok/warn/bad); tagged rad-highlight.

Gjenbruk: `sparkline`, `sg-bar`, `data/pyramid-comparison`, `FilterPillBar` (fra prompt 5).
**NOTE:** `RegionMapCanvas` (SVG-kart) er 8–12t og IKKE med her — eget kort senere ved behov.

**Akseptanse:** grid med ≥3 spillere + referanse; BEST-badge på riktig rad; cohort-bar med null-linje + PGA-linje.

---

## 10. CommandPalette (⌘K)

**Fil:** `src/components/cmdk/command-palette.tsx` (+ `command-preview-pane.tsx`, `empty-state-columns.tsx`)
**Brukes i:** global i AgencyOS (åpnes med ⌘K fra alle sider).
**Design-ref:** `docs/agency-build/preview/components-cmdk.html`

**Oppgave:** Eget delprosjekt — ingenting i biblioteket er i nærheten. Bygg utenfor `athletic/`.
- Overlay (`ui/dialog`-skall) + søkefelt med `<ScopeChip>` (fra prompt 3) + mic-knapp.
- Fire scope-modi: `@` spillere · `>` handlinger · `?` hjelp · `/` sider. Fuzzy-resultatliste med mark-highlight, gruppert etter type.
- Full keyboard-nav: ↑↓ velg, ↵ aktiver, ⇥ scope, ESC lukk.
- `<CommandPreviewPane>` (høyre kolonne) — live mini-KPI + mini-pyramide for fokusert spiller.
- `<EmptyStateColumns>` — to-kolonne tom-tilstand ("nylig" + "co-agent forslag").
- Keyboard-hint-footer.

**Props:** `open/onClose`, `sources: CommandSource[]` (hver med scope + søkefn), `onSelect`.

**Akseptanse:** ⌘K åpner; scope-bytte virker; piltaster navigerer; preview-pane oppdateres; matcher preview.

---

# BOLK 3 — Pulje E (Foreldre)

## 11. ApprovalCard + MinorGate

**Fil:** `src/components/forelder/approval-card.tsx`, `src/app/auth/onboarding/minor-gate.tsx` (eller komponent i `src/components/auth/`)
**Brukes i:** Foreldreportal + mindreårig-onboarding.
**Design-ref:** `docs/agency-build/preview/components-foreldre.html`

**Oppgave:**
- `<ApprovalCard>` — godkjenningskort: tag-linje (ikon + kategori) + forespørselsboks (hvem + hva + meta) + 2–3 handlingsknapper. Brukes for betaling, booking >24t, video-deling (`kind`-prop bytter ikon/copy).
- `<MinorGate>` — tre-stegs GDPR-flow (mobil 430px): alder-check → inviter foreldre → vent-state (spinning dashed ring). GDPR-kritisk — koble til eksisterende onboarding-gate (se `src/app/auth/onboarding/`). Bruk `<StepOnboardingIndicator>` (1/2/3, lime square-number).

**Akseptanse:** ApprovalCard i alle tre `kind`; MinorGate tre steg med korrekt copy; mobil-bredde.

---

## 12. Foreldre-kommunikasjon

**Fil:** `src/components/forelder/` (`parent-sidebar.tsx`, `message-composer.tsx`, `read-receipt-list.tsx`)
**Brukes i:** Foreldreportal + coach→foreldre gruppemelding.
**Design-ref:** `docs/agency-build/preview/components-foreldre.html`

**Oppgave:**
- `<ParentSidebar>` — lysere sidebar enn AgencySidebar, med "Mine barn"-switcher.
- `<MessageComposer>` — To-chips + Emne + Body + multi-kanal-toggle (e-post/SMS/push) + send-rad.
- `<ReadReceiptList>` — kvitteringsliste per mottaker (read/ulest/bounce/klikk-states).

Gjenbruk: `athletic/action-list` for aktivitets-rail; `ui/switch` for kanal-toggle.

**Akseptanse:** composer med kanal-toggle; receipt-liste med alle states; matcher preview.

---

## Estimat-sammendrag

| Bolk | Komponenter | Est |
|---|---|---|
| 1 — infrastruktur | AgencySidebar, DataTable, indicators | ~13–17 t |
| 2 — Pulje D | TestMatrix, Inbox-kit, Bookinger, Team/Drift, panel, Multi-compare, CommandPalette | ~45–55 t |
| 3 — Pulje E | ApprovalCard+MinorGate, Foreldre-komm | ~14–18 t |
| **Totalt** | | **~72–90 t** |

Etter bolk 1+2 er hele AgencyOS (Pulje D) byggbar direkte i kode fra preview — uten flere Claude Design-runder.
