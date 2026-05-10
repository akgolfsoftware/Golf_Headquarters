# AK Golf Platform — CoachHQ — Plan-bygger

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/plans/builder` (også `/admin/plans/:id/edit` for redigering)
- **Arketype:** D — Wizard / Form (6-step plan-wizard)
- **Tier-gating:** Coach Pro+ for AI-generering. Manuell bygging i alle tiers.
- **HTML-referanse:** `wireframe/screen-deck/coachhq/plan-builder.html`
- **Audit:** `wireframe/audit/coachhq-plan-builder.md`
- **Tilhørende skjermer:** Plans-list (batch 2 pakke 1), Plan-detalj (batch 3)
- **Tilhørende modaler:** TemplateSelectorModal (pakke 15), AIPlanGeneratorModal (pakke 14)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. **Full CoachHQ-sidebar synlig** (ikke auth-modus). Wizard sentrert i hoved-content. **Steg-indikator (numbers) sticky øverst i content-area, ikke i sidebar.** Maks 3 lime per skjerm.

## Spec — hva skjermen er for

Plan-byggeren er Anders' kjerneverktøy — her bygger han 4–12-ukers periodiserte treningsplaner for hver spiller. Alternativt brukes mal eller AI-generering. Output: en plan med periode, pyramide-fokus, ukentlige økt-skjema og milestones — som så sendes til spiller for godkjenning før den blir aktiv.

## Layout — UNIKT for denne skjermen

CoachHQ-sidebar venstre (to-lags). Hoved-content:

### Steg-indikator (sticky 56px topp)

`(1) Spiller — (2) Periode — (3) Pyramide — (4) Mal — (5) Økter — (6) Bekreft`

Numre. Aktiv: accent-bg + white text. Fullført: primary-bg + ✓.

### Steg 1 — Velg spiller

- Søkefelt: "Søk spiller eller velg fra liste"
- Spillerliste (samme komponent som /admin/elever men kompakt): avatar + navn + HCP + sist-trent
- Filter-chips: Kategori (A–K) / Status (Aktiv / Inaktiv)
- Klikk-rad → velger spiller + viser preview-card til høyre med spiller-info, siste plan, mål

### Steg 2 — Periode

- **Dato-fra** + **Dato-til** dato-pickere (default: i dag → 8 uker frem)
- Forslags-chips: "4 uker" / "8 uker" / "12 uker" / "Hele sesongen (april–oktober)"
- **Treningsdager-velger:** 7 sjekkbokser (Man–Søn) med default basert på spillerens historikk
- **Antall økter per uke:** stepper (1–14)
- Sammendrag inline: "8 uker · 32 økter totalt · Mai–Juni 2026"

### Steg 3 — Pyramide-fokus

- **5 slidere** (FYS / TEK / SLAG / SPILL / TURN) som summeres til 100%
- Hver slider har:
  - Etikett + nåværende %
  - Slider 0–60%
  - Spiller-historikk-indikator under (subtil bar som viser hva spilleren har trent siste 4 uker)
- **Sum-validering:** "Sum: 100% ✓" eller "Sum: 95% — juster slidere" (warning)
- **Forslag-knapp:** `AI-forslag basert på spiller →` (henter fra spillerens historikk)

### Steg 4 — Mal eller blank

3 store kort:
- **Bruk mal** → åpner TemplateSelectorModal (pakke 15)
- **AI-generer** (lime accent stripe) → åpner AIPlanGeneratorModal (pakke 14)
- **Start blank** → går videre med tom plan-skall

Etter valg: ekspanderer til preview av valgt mal/AI-output (12 økter foreslått) eller tom liste.

### Steg 5 — Økter (drag-redigerbar)

- **Uke-fanene** (8 stk): "Uke 19" / "Uke 20" / … — klikk for å bytte
- Per uke: liste over økter (default 4–6) med:
  - Drag-handle (Lucide `GripVertical`)
  - Dag + tid
  - Tittel (klikkbar for redigering)
  - Pyramide-stripe (samme som batch 2 pakke 5)
  - Varighet
  - Antall øvelser
  - "..."-meny (Rediger / Dupliser / Slett)
- **+ Legg til økt** under listen (link)
- **Milestone-marker** mellom uker (f.eks. "Uke 22: Sørlandsåpent" — gull-pill, draggable)

### Steg 6 — Bekreft og send

Sammendrag-card:
- Spiller (avatar + navn)
- Periode (dato-fra → dato-til)
- 32 økter / 8 uker
- Pyramide-fordeling (donut + tall-tabell)
- 1 milestone

Sjekkbokser:
- "Send til Markus for godkjenning" (default ✓)
- "Notifiser foresatt" (default av — kun synlig hvis spiller <18)
- "Synkroniser med Google Kalender" (default ✓)

Footer: `Avbryt` + `← Tilbake` + `Send forslag →` (CTA endres fra "Neste →" til konkret handling)

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-nummer-indikator | static, klikkbar tilbake |
| Spiller-rad (steg 1) | default, hover, valgt (accent ring + ✓) |
| Dato-pickere | default, open kalender, valgt |
| Forslags-chip (4/8/12 uker) | default, hover, valgt |
| Treningsdag-checkbox | uvalgt, valgt, focus |
| Pyramide-slider | default, dragging, sum-warning, sum-OK |
| `AI-forslag →` (steg 3) | default, hover, loading, success-fill av slidere |
| Mal-kort (steg 4) | default, hover (lift), valgt — laster preview |
| Uke-fane (steg 5) | default, hover, aktiv (accent underline) |
| Økt-rad (steg 5) | default, hover (drag-handle synlig), drag-active (rotert 2°) |
| Milestone-pill (steg 5) | default, hover, klikk → mini-edit-popover |
| `+ Legg til økt`-link | default, hover, klikk → ny rad inline |
| Sjekkbokser (steg 6) | uvalgt, valgt, focus |
| `Send forslag →`-CTA | default, hover, disabled (validering feil), loading ("Sender til Markus …"), success (accent flash + redirect) |
| `Avbryt`-knapp | default, hover, klikk → confirm-popover (lagre som utkast?) |

## Empty / loading / error / success-states

- **Steg 1 ingen treff:** "Ingen spillere matcher. [Inviter ny →]"
- **Steg 3 validering:** Sum ≠ 100% → warning under slidere, "Neste →" disabled
- **Steg 4 AI-loading:** Modal-spinner ~15 sek "Genererer plan basert på Markus' historikk"
- **Steg 5 drag-error:** Toast "Kunne ikke flytte økt. Prøv igjen."
- **Submit loading:** Hele wizard låst, "Sender til Markus …"
- **Submit error:** Toast: "Kunne ikke sende. Prøv igjen."
- **Submit success:** Full-screen confirmation: "Planen er sendt til Markus" + "Han får varsel og kan godta/avvise i sin portal" + CTA `Tilbake til planer →`

## Mobile (≤640px)

Sidebar kollapser til hamburger. Wizard tar full bredde. Steg-indikator komprimerer til "Steg 3 av 6" + dots. Pyramide-slidere stables. Uke-fane (steg 5) blir scrollbar horisontalt. Drag-handle erstattes med opp/ned-piler.

## Ønsket output fra Claude Design

1. Steg 1 lyst tema (Markus valgt, preview-card synlig)
2. Steg 2 lyst tema (8 uker valgt, 32 økter)
3. Steg 3 lyst tema (slidere, 100% ✓)
4. Steg 3 lyst tema, AI-forslag-loading
5. Steg 4 lyst tema (3 store kort, AI-generer hover)
6. Steg 5 lyst tema (uke 19, 5 økter, en under drag)
7. Steg 6 lyst tema (sammendrag + sjekkbokser)
8. Submit success ("Planen er sendt til Markus")
9. Mørkt tema (steg 5)
10. Mobil ≤640px (steg 3)

## Ikke-mål

- Ikke designe TemplateSelectorModal (pakke 15)
- Ikke designe AIPlanGeneratorModal (pakke 14)
- Ikke designe enkelt-økt-redigering (egen mini-modal, batch 5)
- Ikke designe Plan-detalj-skjerm (batch 3)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
