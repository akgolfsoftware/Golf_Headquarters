# AK Golf Platform — PlayerHQ — Coach-notater

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach/notes`
- **Arketype:** B — List + filter (feed-variant)
- **Tier-gating:** **Pro/Elite.** Free ser hele siden med lock-overlay + CTA til `UpgradeToProModal`.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coach-notes.html`
- **Audit:** `wireframe/audit/playerhq-coach-notes.md`
- **Tilhørende modaler:** `ShareWithParentModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren, Anders K. er coach.

## Spec — hva skjermen er for

Coach-notater er Markus' kronologiske strøm av tilbakemeldinger fra Anders K. — etter live-økter, etter analyse av runder, eller spørsmål Anders har tatt opp. Feed-stilen (ikke tabell) understreker at hver note er rik tekst, ikke en datarad. Brukes daglig av Markus for å holde seg oppdatert.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md`, men erstatt tabell med **feed**. I tillegg:

- **Hero italic Instrument Serif 36px:** *«12 notater fra Anders, Markus.»* Sub: «Sist: i dag 14:32 · 3 nye denne uka»
- **Ingen KPI-strip** — direkte til søk + filter
- **Sticky filter-bar** øverst (forblir synlig ved scroll, 56px høy):
  - Søk-felt: «Søk i notater …»
  - Chip-rad: type-filter
  - Date-range-picker: «Siste 30 dager»
- **Feed-layout:** 12 notat-cards, kronologisk nyeste øverst, full-bredde 720px max
- **Notat-card-spec (variabel høyde, padding 24px):**
  - Header-rad: coach-avatar 32px (Anders K.) + navn (Inter Tight 14px) + dato (JetBrains Mono 12px muted, f.eks. «8. mai 2026 · 14:32»)
  - Type-pill øverst-høyre i header: «Tilbakemelding» (primary) / «Plan» (accent) / «Spørsmål» (warning) / «Video-review» (purple-token)
  - Body: utdrag av notat (Inter 15px, max 3 linjer med fade-out hvis lengre)
  - Footer-rad: lucide-ikon + meta («knyttet til Live-økt 7. mai» eller «runde Borre 5. mai») + «Les mer →»-link
  - Hover: subtil bg-shift + lift 2px

## Filter-bar — UNIKT

- Søk: «Søk i notater …» (med forslag fra `SearchNotesPopover`)
- Chip: **Type** — Tilbakemelding · Plan · Spørsmål · Video-review
- Chip: **Knyttet til** — Live-økt · Runde · Generelt
- Date-range: «Siste 30 dager» (default) — popover med presets
- Sort: Nyeste (default) · Eldste · Type
- Ingen primary CTA (notater opprettes av coach, ikke spiller)

## Klikkbare elementer

Se `wireframe/audit/playerhq-coach-notes.md`. UNIKT:

| Element | States |
|---|---|
| Notat-card | default, hover (lift + bg-shift), klikk → utvid inline / `MessageDetailModal` |
| «Les mer →»-link | default, hover, focus |
| Type-pill | farger per type (Tilbakemelding=primary, Plan=accent, Spørsmål=warning, Video-review=destructive subtil) |
| Coach-avatar | default, hover (popover med Anders' kort-info) |
| Søk-felt | default, focus, with-text, clear-button, no-results, suggest-popover |
| Date-range-picker | default, open, preset-selected, custom-range |
| Lock-overlay (Free) | full skjerm-overlay + lucide `Lock` + CTA «Oppgrader til Pro for coach-notater →» |
| Sticky filter-bar | default, scrolled (subtil shadow under) |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **Empty (Pro, ingen notater):** «Anders K. har ikke skrevet notater ennå. Be om tilbakemelding →»
- **Empty filter:** «Ingen notater matcher filteret. Tilbakestill →»
- **Søk no-results:** «Ingen treff for «{søk}». Prøv et annet ord.»
- **Tier-låst (Free):** Hele siden bak full lock-overlay-card:
  - Lucide `Lock` 48px
  - «Coach-notater er en Pro-feature»
  - 3 fordeler (skriftlig tilbakemelding, video-review-notater, søkbart arkiv)
  - CTA «Oppgrader til Pro →»
- **Loading:** 4 grå skeleton-cards i feed
- **Error:** Per-feed retry

## Ønsket output fra Claude Design

1. Hovedskjerm lyst tema (Pro — full feed, 4 typer pills synlige)
2. Hovedskjerm lyst tema (Free — full lock-overlay)
3. Mørkt tema (Pro)
4. Sticky filter-bar med scroll-state (shadow under)
5. Empty (Pro, ingen notater)
6. Søk aktivt med no-results
7. Mobil ≤640px — feed full bredde, sticky filter konvolverer til «Filter (2) ↓»-knapp

## Ikke-mål

- Ikke designe `ShareWithParentModal` eller `MessageDetailModal` (egne pakker)
- Ikke designe enkelt-notat-skjerm (`/portal/coach/notes/:id` — egen batch)
- Ikke implementere ekte søk-popover — peker til `SearchNotesPopover`-spec
