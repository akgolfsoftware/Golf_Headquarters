# Steg 6 — Revisjon av steg 2–4 mot Familie 1 (fundament)

Skrevet 28.07.2026. Måler faktisk innhold i biblioteket mot de 23 radene i dekningsmatrisens Familie 1.
Utfall: **3 dekket, 8 delvis dekket / må konsolideres, 12 mangler helt.** Steg 7 blir ~20 komponenter, ikke 23.

Nevner for Port A i denne familien: 23.

## A. Dekket — ingen ny bygging

| Matriserad | Finnes som | Restarbeid |
|---|---|---|
| Toast (~20) | `overlays/Toast.jsx` + `.d.ts` + kort «Toast, modal og bunn-ark» | Tone-varianter (ok/warn/feil) og varighet/auto-dismiss mangler. Utvidelse, ikke nybygg. |
| ThemeToggle (~4) | Innebygd i `navigation/Topbar.jsx` (`.akhq-theme`, `aria-pressed`) | Matrisen ber om frittstående variant. Trekk ut av Topbar til egen komponent, Topbar konsumerer den. |
| Tabs (~10) | `forms/SegmentControl.jsx` — pill-gruppe, `aria-pressed`, disabled, coarse-pointer 40px | **Feil semantikk for Tabs.** SegmentControl er eksklusivt *valg* (Familie 2, ~18 skjermer). Tabs er in-page *navigasjon* og trenger `role="tablist"`/`aria-selected`/panel-kobling. Behold SegmentControl som den er; Tabs bygges separat. |

## B. Delvis dekket — konsolidering, ikke nybygg

| Matriserad | Finnes i dag | Hva som må skje |
|---|---|---|
| **Panel (~60)** | CSS-klassen `.akhq-card` i `data/viz.jsx`, brukt kun av KpiCard. Templatene bruker den **ikke** — de gjentar samme literal (`surface` + 1px border + `--r` + `--shadow` + `16px 18px 18px`) **6 ganger**, hver med egen tittelrad + «… →»-lenke. | Én `Panel` med `title`/`action`/`footnote`-slots. Høyest frekvens i hele matrisen = første komponent i steg 7. Begge templates refaktoreres til den. |
| **ListRow (~30)** | `data/StatusCircleRow.jsx` (rutenett 36/1fr/auto, tittel + meta + høyre-kolonne) **og** en håndrullet klon i AgencyOS-dashboardets stall-panel (initialer + sparkline + delta). | To implementasjoner av én rad. Bygg `ListRow` med `leading` (avatar/ikon/statussirkel) + tittel/undertekst + `value` + `trailing` (chevron/verdi/toggle/pill). `StatusCircleRow` blir en preset over den; stall-raden erstattes. |
| **ListGroup (~15)** | Skillelinjelogikken finnes inne i `StatusCircleRow` (`border-top` + `:first-child{border-top:0}`) | Flyttes ut av raden til beholderen når ListRow bygges — ellers arves gjelden. |
| **Avatar (~35)** | To uavhengige 36px-sirkler: `.akhq-scircle` (status) og initialsirkelen i stall-raden | Én `Avatar` med tre størrelser + initialer. Statussirkelen forblir egen sak (den er ikke en avatar). |
| **EmptyState (~25)** | `Region` i `data/viz.jsx` — fire tilstander, og ~20 datakomponenter tar `state`/`emptyText` med ekte norsk tekst | Region dekker *region*-nivå som én tekstlinje. Matrisen ber om tittel + forklaring + valgfri CTA på **panel- og sidenivå**. Bygg `EmptyState`; la Region kunne rendre den i stedet for `.akhq-empty`. |
| **SectionLabel (~15)** | `.akhq-lab` (mono, 10px, versal, `--muted`) — brukt av 12+ komponenter, men bare som klasse | Eksponer som komponent. Ingen visuell endring. |
| **ProgressBar (~8)** | `.akhq-goal-bar`/`-fill` inne i `progress/GoalProgress.jsx` | Trekk ut som `ProgressBar` (etikett + prosent); GoalProgress konsumerer den. |
| **ConfirmDialog (~3)** | `overlays/Modal.jsx` (scrim, `role=dialog`, `aria-modal`, actions-slot) | Preset over Modal med destruktiv primærhandling — ikke en ny komponent. Erstatter `window.confirm()` i playerhq-live. |

## C. Mangler helt — bygges i steg 7

PageHeader (~30) · StatusBadge (~30) · Callout (~35) · Banner (~10) · SectionHeader (~5) · KeyValueGrid (~10) · CardGrid (~10) · DropdownMenu (~15) · Accordion (~5) · SkipLink (~4) · QuickLinkBar (~6) · StickyActionBar (~10)

Merknader:
- **PageHeader** er håndrullet identisk i *begge* templates (mono-kicker med dato → h1/h3 → ingress → handlingsklynge). Mønsteret er allerede etablert; det mangler bare som komponent.
- **StatusBadge** må ikke løses med `Chip`. Chip er interaktivt filter med trykk-tilstand; badge er ikke-klikkbar og bærer datasemantikk (`--up`/`--dn`/`--muted`).
- **SkipLink** finnes ferdig i referanse-HTML under `uploads/` (`.skip`, «Hopp til innhold», `data-od-id="skip-link"`) — løftes derfra uten redesign.
- **Callout** er blokkert på én beslutning: hvilke toner brukes til nøytral / warn / tom / personvern når oransje er reservert OneThingNow?

## D. Åpne spørsmål før steg 7 starter

1. **Callout-toner.** Se over. Blokkerer 35 skjermer.
2. **Banner vs Callout.** Matrisen skiller på bredde og blokkerende validering. Er «validering (blokkerende)» samme komponent som Callout warn, eller egen? Jeg foreslår: Callout = inline i panel, Banner = full bredde over innhold, ingen delt kode.
3. **Tabs vs SegmentControl.** Bekreft at de skal være to komponenter (min anbefaling) og ikke én med `role`-prop.
4. **Refaktorering av templates.** Skal de to eksisterende templatene skrives om til Panel/PageHeader/ListRow i steg 7, eller står de urørt til Fase C? Hvis de står urørt, blir de umiddelbart avvikende fra biblioteket.

## E. Merknad om steg 3

Bekrefter matrisens funn 5: 14 golf-viz- og progress-komponenter har ingen forbruker i biblioteket i dag utover de to templatene. `Sparkline` er den eneste som faktisk er i bruk (stall-raden). De øvrige verifiseres først mot agencyos-spillerdetalj.
