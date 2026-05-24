# UI-audit CoachHQ + PlayerHQ — 24. mai 2026

**Sammendrag i én setning:** PlayerHQ er nesten ferdig designet og bruker designsystemet vakkert, mens CoachHQ er ufullstendig — flere sider er stubs, har dobbel sidebar, eller bruker grå pills i stedet for fargede.

---

## Sammendraget i tall

| Område | Sider screenshotet | Status |
|---|---|---|
| CoachHQ | 19 av 127 | Blandet — 60% trenger fiks |
| PlayerHQ | 11 av 130 | God — 10–15% trenger fiks |
| Forbudt `CoachhqStubsShell` | 6 sider | Må erstattes umiddelbart |

---

## Tre kritiske grep (anbefalt prioritet)

### Grep 1: Erstatt forbudt CoachhqStubsShell (HØYESTE)

Memory-regelen er klar: "ALDRI 'AK GOLF'-tekst i sidebar". 6 admin-sider bruker fortsatt den gamle `CoachhqStubsShell` som har "AK GOLF"-tekst og lager dobbel sidebar:

- `/admin/settings`
- `/admin/workspace/tildelt-meg`
- `/admin/audit-log`
- `/admin/notion-prosjekter`
- `/admin/plan-templates`
- `/admin/talent/wagr-import`

Fiks: erstatt `<CoachhqStubsShell>` med `<SidebarBrand>` + vanlig admin-layout. Ca. 2 timer arbeid totalt.

### Grep 2: Fullfør overview-sidene i CoachHQ (HØY)

`/admin/planlegge`, `/admin/gjennomfore` og `/admin/analysere` viser KUN ett "Åpne →"-card hver. Tidligere oppgave (memory #32, #33) er markert "completed" — men det er ikke deployd, eller deploy ble overskrevet senere.

PlayerHQ har samme tre sider (`/portal/planlegge`, `/portal/gjennomfore`, `/portal/analysere`) som **alle viser 5–6 cards med ikoner, tomme tilstander og CTAs**. Disse må kopieres til CoachHQ-versjonen.

Fiks: bygg `CoachHqPlanleggeOverview` / `CoachHqGjennomforeOverview` / `CoachHqAnalysereOverview` etter PlayerHQ-modellen, men med coach-perspektiv (per-spiller-tall, total-tall, etc.). Ca. 4–6 timer.

### Grep 3: Konsistent bruk av AthleticBadge-variants (MEDIUM)

`AthleticBadge` har allerede `ok | warn | urgent | lime | primary | neutral`-variants. Men på tvers av admin-sider brukes `neutral` der det burde være `ok`/`warn`/`urgent`.

**Konkrete eksempler funnet:**

| Side | Issue | Fiks |
|---|---|---|
| `/admin/agencyos/spillere` | "DROP-IN"-pill er nøytral grå | `variant="warn"` (ikke kunde) |
| `/admin/spillere` | "INAKTIV"-tekst er GRØNN | Skal være `text-destructive` (rød) |
| `/admin/agencyos/okonomi` | "-26% MOT FORRIGE" svart tekst | `text-destructive` (negativ delta) |
| `/admin/agencyos/okonomi` | "1 FAKTURA UTE" svart tekst | `text-destructive` |
| `/admin/teknisk-plan` | "Ingen aktiv plan" svart tekst | `text-muted-foreground` |
| `/admin/agencyos/uka` | "Kapasitet 2%" svart tekst | Progress-ring + rød hvis lav |

Disse er hver for seg små, men summen lager visuelt rot. Ca. 3–4 timer for å gå gjennom alle.

---

## CoachHQ-sider — detaljliste

### Sider som ER gode (kopier mønsteret)
- `/admin/tester` — perfekt hero-KPI + warn/info/accent
- `/admin/bookinger` — bra status-pill-bruk (BEKREFTET grønn / VENTER amber / AVLYST rød)
- `/admin/innboks` — ULEST lime, røde unread-dots, alt på plass
- `/admin/integrasjoner` — cards med ikoner, status-pills
- `/admin/godkjenninger` — fin empty state med accent-grønn ikon-boks
- `/admin/team` — gold avatars, ADMIN-pills

### Sider som er BRUKBARE men trenger pynt
- `/admin/agencyos` (Hjem) — 1 hero + 3 hvite KPI-cards (mangler hierarki)
- `/admin/agencyos/uka` — 4 identiske hvite KPIs, ingen visuell forskjell booket/ledig
- `/admin/agencyos/okonomi` — bar-chart er god, men negative tall ikke fargekodet
- `/admin/spillere` — "INAKTIV grønn" feil, "FREE"-pill grå (bør være warn)
- `/admin/teknisk-plan` — funksjonell tabell, mangler progress-bars for økt-fullføring
- `/admin/lag-snitt` — har radar-chart + ∆-kolonne, men pyramide-fokus-seksjon lengre ned mangler progress-bars
- `/admin/foresporsler` — bra desktop, kunne ha hatt empty state med ikon-boks

### Sider som er STUBS / TRENGER FERDIGSTILLING
- `/admin/planlegge` — kun ett "Åpne →"-card
- `/admin/gjennomfore` — kun ett "Åpne →"-card
- `/admin/analysere` — kun ett "Åpne →"-card

### Sider som er 404 eller har feil
- `/admin/talent` — 404 selv om page.tsx finnes (auth/rolle-issue?)
- `/admin/settings` — dobbel sidebar (CoachhqStubsShell + vanlig)

---

## PlayerHQ-sider — detaljliste

### Sider som er UTROLIG GODE (ikke rør)
- `/portal` (Hjem) — hero med profilbilde + KPI + dagens fokus + drill-chart
- `/portal/planlegge` — 5 cards med ikoner + tomme tilstander
- `/portal/gjennomfore` — 4 cards konsistent stil
- `/portal/analysere` — 6 cards med Lucide-ikoner
- `/portal/tren/aarsplan` — **fargete periode-bånd** (Bompa-modell), aktiv periode-card, KPIs
- `/portal/mal` — hero med 55% progress-ring, milepæler, sannsynlighets-panel
- `/portal/tren/teknisk-plan` — progress-bar i KPI, AKTIV-pill grønn, amber coach-banner
- `/portal/meg` — profilbilde + PRO-pill, hurtigvalg-cards

### Mindre issues funnet
- `/portal/booking` — fungerer, men 0-tall i tabs kunne være dimmet
- `/portal/analysere` ↔ `/portal/innsikt` — alias-rute, ikke kritisk

---

## Anbefalt rekkefølge

1. **Grep 1 — Fjern CoachhqStubsShell (2 timer).** Kritisk: bryter eksplisitt regel. Fikser dobbel sidebar.
2. **Grep 2 — Bygg CoachHQ-overview-sider (4–6 timer).** Speil PlayerHQ-modellen. Største synlige forbedring.
3. **Grep 3 — Badge-variants på tvers (3–4 timer).** Polish-runde. Kan gjøres mens Grep 1 og 2 reviewes.
4. **Bonus: Fiks `/admin/talent` 404 (1 time).** Sannsynligvis auth/rolle-sjekk.

**Total: ca. 10–13 timer arbeid** for å bringe CoachHQ opp på PlayerHQ-nivå.

---

## Bevisgrunnlag

Designsystemet er IKKE problemet. `AthleticBadge`, `PyramidProgress`, `AthleticCard` etc. støtter alle variants vi trenger. Bevisene:
- `/admin/tester` viser at hero-KPI + warn/info/accent fungerer perfekt
- `/portal/tren/aarsplan` viser at fargete periode-bånd kan bygges
- `/portal/mal` viser at progress-ringer + milepæler + sannsynlighets-panel kan bygges

Problemet er at noen CoachHQ-sider ble bygget i en tidlig fase med Claude-design-stubs (CoachhqStubsShell, "Åpne →"-cards) som ikke ble fullført. De andre sidene som BLE fullført — eller er PlayerHQ-sider — viser hva som er mulig.
